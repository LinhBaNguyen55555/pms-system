import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu!' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        role: true,
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Tài khoản không tồn tại!' }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Mật khẩu không chính xác!' }, { status: 401 });
    }

    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role.name,
      employeeId: user.employee?.id,
      fullName: user.employee?.fullName || user.username,
      departmentId: user.employee?.departmentId,
      departmentName: user.employee?.department?.name,
    };

    const token = await signToken(payload);

    const response = NextResponse.json({
      message: 'Đăng nhập thành công!',
      user: payload,
      token,
    });

    response.cookies.set('pms_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra khi đăng nhập!' }, { status: 500 });
  }
}
