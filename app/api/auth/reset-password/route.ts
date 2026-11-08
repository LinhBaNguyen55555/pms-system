import { NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'HR') {
      return NextResponse.json({ error: 'Chỉ Hội đồng Nhân sự mới có quyền cấp lại mật khẩu!' }, { status: 403 });
    }

    const { employeeId } = await req.json();

    if (!employeeId) {
      return NextResponse.json({ error: 'Thiếu mã định danh nhân viên!' }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: Number(employeeId) },
      include: { user: true },
    });

    if (!employee || !employee.userId) {
      return NextResponse.json({ error: 'Nhân viên này chưa có tài khoản hệ thống!' }, { status: 404 });
    }

    const defaultPassword = 'password123';
    const hashedPassword = await hashPassword(defaultPassword);

    await prisma.user.update({
      where: { id: employee.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: `Đã cấp lại mật khẩu mặc định (${defaultPassword}) cho nhân viên ${employee.fullName} (${employee.code})!`,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra khi cấp lại mật khẩu!' }, { status: 500 });
  }
}
