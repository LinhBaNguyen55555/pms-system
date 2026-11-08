import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import type { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const departmentId = searchParams.get('departmentId');
    const positionId = searchParams.get('positionId');
    const managerId = searchParams.get('managerId');

    const where: Prisma.EmployeeWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (departmentId && departmentId !== 'all') {
      where.departmentId = parseInt(departmentId, 10);
    }

    if (positionId && positionId !== 'all') {
      where.positionId = parseInt(positionId, 10);
    }

    if (managerId && managerId !== 'all') {
      where.managerId = parseInt(managerId, 10);
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        department: true,
        position: true,
        manager: {
          select: {
            id: true,
            fullName: true,
            code: true,
            email: true,
          },
        },
        user: {
          include: {
            role: true,
          },
        },
        _count: {
          select: {
            subordinates: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    const formatted = employees.map((emp) => ({
      id: emp.id,
      code: emp.code,
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone,
      departmentId: emp.departmentId,
      department: emp.department,
      positionId: emp.positionId,
      position: emp.position,
      managerId: emp.managerId,
      manager: emp.manager,
      subordinateCount: emp._count.subordinates,
      userId: emp.userId,
      username: emp.user?.username,
      role: emp.user?.role?.name || 'EMPLOYEE',
      roleDescription: emp.user?.role?.description,
      createdAt: emp.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Lỗi tải danh sách nhân sự' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      code,
      fullName,
      email,
      phone,
      departmentId,
      positionId,
      managerId,
      role = 'EMPLOYEE',
      password = 'password123',
    } = data;

    if (!code || !fullName || !email || !departmentId || !positionId) {
      return NextResponse.json(
        { error: 'Vui lòng điền đủ các trường bắt buộc (Mã NV, Họ tên, Email, Phòng ban, Chức danh)!' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate code / email
    const [existingCode, existingEmail] = await Promise.all([
      prisma.employee.findUnique({ where: { code: cleanCode } }),
      prisma.employee.findUnique({ where: { email: cleanEmail } }),
    ]);

    if (existingCode) {
      return NextResponse.json({ error: `Mã nhân viên "${cleanCode}" đã tồn tại!` }, { status: 400 });
    }
    if (existingEmail) {
      return NextResponse.json({ error: `Email "${cleanEmail}" đã được sử dụng!` }, { status: 400 });
    }

    // Role lookup
    const targetRole = await prisma.role.findUnique({
      where: { name: role },
    });

    if (!targetRole) {
      return NextResponse.json({ error: `Vai trò "${role}" không hợp lệ!` }, { status: 400 });
    }

    // Hash default password
    const hashedPassword = await hashPassword(password);
    const username = `emp_${cleanCode.toLowerCase()}`;

    // Create User & Employee in a transaction
    const newEmployee = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          roleId: targetRole.id,
        },
      });

      return tx.employee.create({
        data: {
          code: cleanCode,
          fullName: fullName.trim(),
          email: cleanEmail,
          phone: phone?.trim() || null,
          departmentId: Number(departmentId),
          positionId: Number(positionId),
          managerId: managerId ? Number(managerId) : null,
          userId: user.id,
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

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Lỗi thêm mới nhân viên' }, { status: 500 });
  }
}
