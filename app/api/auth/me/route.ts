import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        role: true,
        employee: {
          include: {
            department: true,
            position: true,
            manager: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        userId: user.id,
        username: user.username,
        role: user.role.name,
        roleDescription: user.role.description,
        employeeId: user.employee?.id,
        code: user.employee?.code,
        fullName: user.employee?.fullName || user.username,
        email: user.employee?.email,
        phone: user.employee?.phone,
        department: user.employee?.department,
        position: user.employee?.position,
        manager: user.employee?.manager,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ user: null });
  }
}
