import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const posId = parseInt(id, 10);
    const { name, code } = await req.json();

    if (!name || !code) {
      return NextResponse.json({ error: 'Vui lòng cung cấp đầy đủ Tên và Mã chức danh!' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    const existing = await prisma.position.findFirst({
      where: {
        code: cleanCode,
        NOT: { id: posId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: `Mã chức danh "${cleanCode}" đã được sử dụng!` }, { status: 400 });
    }

    const updated = await prisma.position.update({
      where: { id: posId },
      data: {
        name: cleanName,
        code: cleanCode,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật chức danh' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const posId = parseInt(id, 10);

    const empCount = await prisma.employee.count({
      where: { positionId: posId },
    });

    if (empCount > 0) {
      return NextResponse.json(
        { error: `Không thể xóa chức danh đang được áp dụng cho ${empCount} nhân sự!` },
        { status: 400 }
      );
    }

    await prisma.position.delete({
      where: { id: posId },
    });

    return NextResponse.json({ message: 'Xóa chức danh thành công!' });
  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json({ error: 'Lỗi xóa chức danh' }, { status: 500 });
  }
}
