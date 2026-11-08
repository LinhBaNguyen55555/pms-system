import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// PUT: Cập nhật một thang điểm cụ thể
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'HR') {
      return NextResponse.json({ error: 'Chỉ Hội đồng Nhân sự (HR) mới có quyền chỉnh sửa thang điểm' }, { status: 403 });
    }

    const { id } = await params;
    const scaleId = parseInt(id, 10);
    if (isNaN(scaleId)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const body = await request.json();
    const { minScore, maxScore, description } = body;

    const min = parseFloat(String(minScore));
    const max = parseFloat(String(maxScore));

    if (isNaN(min) || isNaN(max) || min < 0 || max > 100 || min > max) {
      return NextResponse.json({ error: 'Khoảng điểm không hợp lệ (phải từ 0 đến 100 và Min <= Max)' }, { status: 400 });
    }

    const updated = await prisma.gradingScale.update({
      where: { id: scaleId },
      data: {
        minScore: min,
        maxScore: max,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({
      message: `Cập nhật thang điểm Hạng ${updated.grade} thành công!`,
      gradingScale: updated,
    });
  } catch (error) {
    console.error('Error updating single grading scale:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật thang điểm' }, { status: 500 });
  }
}
