import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [departments, positions] = await Promise.all([
      prisma.department.findMany({ orderBy: { id: 'asc' } }),
      prisma.position.findMany({ orderBy: { id: 'asc' } }),
    ]);

    // Sheet 1: Mẫu nhập liệu
    const sampleData = [
      {
        'Mã NV (*)': 'NV9001',
        'Họ và Tên (*)': 'Trần Văn A',
        'Email (*)': 'vana.tran@pms.corp',
        'Số điện thoại': '0912345678',
        'Mã phòng ban (*)': departments[0]?.code || 'IT',
        'Mã chức vụ (*)': positions[0]?.code || 'ASSOCIATE',
        'Mã quản lý trực tiếp': 'MGR003',
      },
      {
        'Mã NV (*)': 'NV9002',
        'Họ và Tên (*)': 'Lê Thị B',
        'Email (*)': 'thib.le@pms.corp',
        'Số điện thoại': '0987654321',
        'Mã phòng ban (*)': departments[1]?.code || 'HR',
        'Mã chức vụ (*)': positions[1]?.code || 'SPECIALIST',
        'Mã quản lý trực tiếp': 'HR0001',
      },
    ];

    const wsData = XLSX.utils.json_to_sheet(sampleData);

    // Sheet 2: Danh mục mã hợp lệ
    const refDepartments = departments.map((d) => ({
      'Mã Phòng Ban': d.code,
      'Tên Phòng Ban': d.name,
    }));

    const refPositions = positions.map((p) => ({
      'Mã Chức Vụ': p.code,
      'Tên Chức Danh': p.name,
    }));

    const wsRefDept = XLSX.utils.json_to_sheet(refDepartments);
    const wsRefPos = XLSX.utils.json_to_sheet(refPositions);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsData, 'NhapNhanSu');
    XLSX.utils.book_append_sheet(wb, wsRefDept, 'DS_PhongBan');
    XLSX.utils.book_append_sheet(wb, wsRefPos, 'DS_ChucVu');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Mau_Nhap_Nhan_Su_PMS.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating Excel template:', error);
    return NextResponse.json({ error: 'Lỗi tạo file mẫu Excel' }, { status: 500 });
  }
}
