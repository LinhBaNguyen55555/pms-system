import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const empId = parseInt(id, 10);
    const data = await req.json();
    const {
      code,
      fullName,
      email,
      phone,
      departmentId,
      positionId,
      managerId,
      role,
      password,
    } = data;

    if (!code || !fullName || !email || !departmentId || !positionId) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc!' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate code / email with other records
    const [existingCode, existingEmail] = await Promise.all([
      prisma.employee.findFirst({
        where: { code: cleanCode, NOT: { id: empId } },
      }),
      prisma.employee.findFirst({
        where: { email: cleanEmail, NOT: { id: empId } },
      }),
    ]);

    if (existingCode) {
      return NextResponse.json({ error: `Mã nhân viên "${cleanCode}" đã tồn tại!` }, { status: 400 });
    }
    if (existingEmail) {
      return NextResponse.json({ error: `Email "${cleanEmail}" đã được sử dụng!` }, { status: 400 });
    }

    // Prevent employee from being their own manager
    if (managerId && Number(managerId) === empId) {
      return NextResponse.json({ error: 'Nhân viên không thể tự làm Quản lý trực tiếp của chính mình!' }, { status: 400 });
    }

    const currentEmp = await prisma.employee.findUnique({
      where: { id: empId },
      include: { user: true },
    });

    if (!currentEmp) {
      return NextResponse.json({ error: 'Không tìm thấy nhân viên!' }, { status: 404 });
    }

    const updatedEmployee = await prisma.$transaction(async (tx) => {
      // Update User if needed
      if (currentEmp.userId) {
        const updateUserData: { roleId?: number; password?: string } = {};
        if (role) {
          const roleRecord = await tx.role.findUnique({ where: { name: role } });
          if (roleRecord) {
            updateUserData.roleId = roleRecord.id;
          }
        }
        if (password) {
          updateUserData.password = await hashPassword(password);
        }
        if (Object.keys(updateUserData).length > 0) {
          await tx.user.update({
            where: { id: currentEmp.userId },
            data: updateUserData,
          });
        }
      }

      return tx.employee.update({
        where: { id: empId },
        data: {
          code: cleanCode,
          fullName: fullName.trim(),
          email: cleanEmail,
          phone: phone?.trim() || null,
          departmentId: Number(departmentId),
          positionId: Number(positionId),
          managerId: managerId ? Number(managerId) : null,
        },
        include: {
          department: true,
          position: true,
          manager: true,
          user: {
            include: {
              role: true,
            },
          },
        },
      });
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật nhân viên' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const empId = parseInt(id, 10);

    // Check if employee is manager of others
    const subordinateCount = await prisma.employee.count({
      where: { managerId: empId },
    });

    if (subordinateCount > 0) {
      return NextResponse.json(
        { error: `Không thể xóa nhân viên này vì đang quản lý ${subordinateCount} nhân sự cấp dưới! Vui lòng thay đổi người quản lý trước.` },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { id: empId },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Không tìm thấy nhân viên!' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.employee.delete({
        where: { id: empId },
      });
      if (employee.userId) {
        await tx.user.delete({
          where: { id: employee.userId },
        });
      }
    });

    return NextResponse.json({ message: 'Xóa nhân sự thành công!' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Lỗi xóa nhân sự' }, { status: 500 });
  }
}
