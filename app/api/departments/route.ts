import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
        employees: {
          where: {
            position: {
              code: 'HEAD',
            },
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            code: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    const formatted = departments.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      employeeCount: d._count.employees,
      head: d.employees[0] || null,
      createdAt: d.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Lỗi tải danh sách phòng ban' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, code } = await req.json();

    if (!name || !code) {
      return NextResponse.json({ error: 'Vui lòng cung cấp đầy đủ Tên và Mã phòng ban!' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    const existing = await prisma.department.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ error: `Mã phòng ban "${cleanCode}" đã tồn tại!` }, { status: 400 });
    }

    const newDept = await prisma.department.create({
      data: {
        name: cleanName,
        code: cleanCode,
      },
    });

    return NextResponse.json(newDept, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Lỗi tạo phòng ban' }, { status: 500 });
  }
}
