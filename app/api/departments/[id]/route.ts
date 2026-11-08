import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deptId = parseInt(id, 10);
    const { name, code } = await req.json();

    if (!name || !code) {
      return NextResponse.json({ error: 'Vui lòng cung cấp đầy đủ Tên và Mã phòng ban!' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    const existing = await prisma.department.findFirst({
      where: {
        code: cleanCode,
        NOT: { id: deptId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: `Mã phòng ban "${cleanCode}" đã được sử dụng!` }, { status: 400 });
    }

    const updated = await prisma.department.update({
      where: { id: deptId },
      data: {
        name: cleanName,
        code: cleanCode,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật phòng ban' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deptId = parseInt(id, 10);

    const empCount = await prisma.employee.count({
      where: { departmentId: deptId },
    });

    if (empCount > 0) {
      return NextResponse.json(
        { error: `Không thể xóa phòng ban đang có ${empCount} nhân sự! Vui lòng điều chuyển nhân sự trước.` },
        { status: 400 }
      );
    }

    await prisma.department.delete({
      where: { id: deptId },
    });

    return NextResponse.json({ message: 'Xóa phòng ban thành công!' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: 'Lỗi xóa phòng ban' }, { status: 500 });
  }
}
