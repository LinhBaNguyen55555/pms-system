import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

interface ExcelEmployeeRow {
  'Mã NV (*)'?: string | number;
  'Mã NV'?: string | number;
  code?: string | number;

  'Họ và Tên (*)'?: string;
  'Họ và Tên'?: string;
  fullName?: string;

  'Email (*)'?: string;
  'Email'?: string;
  email?: string;

  'Số điện thoại'?: string | number;
  phone?: string | number;

  'Mã phòng ban (*)'?: string;
  'Mã phòng ban'?: string;
  deptCode?: string;

  'Mã chức vụ (*)'?: string;
  'Mã chức vụ'?: string;
  posCode?: string;

  'Mã quản lý trực tiếp'?: string;
  'Mã quản lý'?: string;
  managerCode?: string;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Vui lòng chọn file Excel để tải lên!' }, { status: 400 });
    }

    // 1. Đọc nội dung file Excel từ Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<ExcelEmployeeRow>(worksheet);

    if (!rawRows || rawRows.length === 0) {
      return NextResponse.json({ error: 'File Excel không có dữ liệu để xử lý!' }, { status: 400 });
    }

    // 2. Tải sẵn danh mục Phòng ban, Chức vụ và Role Employee
    const [departments, positions, employeeRole] = await Promise.all([
      prisma.department.findMany(),
      prisma.position.findMany(),
      prisma.role.findUnique({ where: { name: 'EMPLOYEE' } }),
    ]);

    const deptMap = new Map(departments.map((d) => [d.code.trim().toUpperCase(), d.id]));
    const posMap = new Map(positions.map((p) => [p.code.trim().toUpperCase(), p.id]));

    let successCount = 0;
    const errors: string[] = [];
    const defaultHashedPassword = await hashPassword('password123');

    // 3. Xử lý từng dòng nhân sự trong file
    for (let index = 0; index < rawRows.length; index++) {
      const row = rawRows[index];
      const rowNum = index + 2; // Dòng 1 là header trong Excel

      const code = String(row['Mã NV (*)'] || row['Mã NV'] || row.code || '').trim();
      const fullName = String(row['Họ và Tên (*)'] || row['Họ và Tên'] || row.fullName || '').trim();
      const email = String(row['Email (*)'] || row['Email'] || row.email || '').trim().toLowerCase();
      const phone = String(row['Số điện thoại'] || row.phone || '').trim();
      const deptCode = String(row['Mã phòng ban (*)'] || row['Mã phòng ban'] || row.deptCode || '').trim().toUpperCase();
      const posCode = String(row['Mã chức vụ (*)'] || row['Mã chức vụ'] || row.posCode || '').trim().toUpperCase();
      const managerCode = String(row['Mã quản lý trực tiếp'] || row['Mã quản lý'] || row.managerCode || '').trim().toUpperCase();

      if (!code || !fullName || !email || !deptCode || !posCode) {
        errors.push(`Dòng ${rowNum}: Thiếu thông tin bắt buộc (Mã NV, Họ tên, Email, Mã PB, Mã CV).`);
        continue;
      }

      const departmentId = deptMap.get(deptCode);
      if (!departmentId) {
        errors.push(`Dòng ${rowNum}: Mã phòng ban "${deptCode}" không tồn tại trong hệ thống.`);
        continue;
      }

      const positionId = posMap.get(posCode);
      if (!positionId) {
        errors.push(`Dòng ${rowNum}: Mã chức vụ "${posCode}" không tồn tại trong hệ thống.`);
        continue;
      }

      // Tìm Quản lý trực tiếp nếu có khai báo mã
      let managerId: number | undefined = undefined;
      if (managerCode && managerCode !== code) {
        const mgr = await prisma.employee.findUnique({ where: { code: managerCode } });
        if (mgr) {
          managerId = mgr.id;
        } else {
          // Bỏ qua hoặc log cảnh báo
          errors.push(`Dòng ${rowNum}: Quản lý "${managerCode}" chưa có trong hệ thống, hệ thống sẽ bỏ qua trường này.`);
        }
      }

      // Tạo hoặc lấy tài khoản User mặc định
      const username = `emp_${code.toLowerCase()}`;
      let userId: number | undefined = undefined;

      if (employeeRole) {
        const user = await prisma.user.upsert({
          where: { username },
          update: {},
          create: {
            username,
            password: defaultHashedPassword,
            roleId: employeeRole.id,
          },
        });
        userId = user.id;
      }

      // Cập nhật hoặc thêm mới nhân sự (Upsert)
      await prisma.employee.upsert({
        where: { code },
        update: {
          fullName,
          email,
          phone: phone || null,
          departmentId,
          positionId,
          managerId: managerId || null,
        },
        create: {
          code,
          fullName,
          email,
          phone: phone || null,
          departmentId,
          positionId,
          managerId: managerId || null,
          userId,
        },
      });

      successCount++;
    }

    return NextResponse.json({
      message: `Đã nạp thành công ${successCount} nhân sự!`,
      successCount,
      errors,
    });
  } catch (error) {
    console.error('Lỗi import excel:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra khi xử lý file Excel.' }, { status: 500 });
  }
}
