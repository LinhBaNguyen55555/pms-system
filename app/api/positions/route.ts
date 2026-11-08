import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const positions = await prisma.position.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    const formatted = positions.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      employeeCount: p._count.employees,
      createdAt: p.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json({ error: 'Lỗi tải danh sách chức danh' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, code } = await req.json();

    if (!name || !code) {
      return NextResponse.json({ error: 'Vui lòng cung cấp đầy đủ Tên và Mã chức danh!' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    const existing = await prisma.position.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ error: `Mã chức vụ "${cleanCode}" đã tồn tại!` }, { status: 400 });
    }

    const newPos = await prisma.position.create({
      data: {
        name: cleanName,
        code: cleanCode,
      },
    });

    return NextResponse.json(newPos, { status: 201 });
  } catch (error) {
    console.error('Error creating position:', error);
    return NextResponse.json({ error: 'Lỗi tạo chức danh' }, { status: 500 });
  }
}
