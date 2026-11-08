import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Danh sách thang điểm & quy tắc xếp loại
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const gradingScales = await prisma.gradingScale.findMany({
      orderBy: { minScore: 'desc' },
    });

    return NextResponse.json({ gradingScales });
  } catch (error) {
    console.error('Error fetching grading scales:', error);
    return NextResponse.json({ error: 'Lỗi tải danh sách thang điểm xếp loại' }, { status: 500 });
  }
}

// PUT: Cập nhật hàng loạt quy tắc thang điểm (Chỉ dành cho HR)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'HR') {
      return NextResponse.json({ error: 'Chỉ Hội đồng Nhân sự (HR) mới có quyền chỉnh sửa thang điểm' }, { status: 403 });
    }

    const body = await request.json();
    const { scales } = body;

    if (!Array.isArray(scales) || scales.length === 0) {
      return NextResponse.json({ error: 'Dữ liệu thang điểm không hợp lệ' }, { status: 400 });
    }

    // Cập nhật từng thang điểm trong transaction
    await prisma.$transaction(
      scales.map((s: { id: number; minScore: number; maxScore: number; description?: string }) =>
        prisma.gradingScale.update({
          where: { id: Number(s.id) },
          data: {
            minScore: parseFloat(String(s.minScore)),
            maxScore: parseFloat(String(s.maxScore)),
            description: s.description || null,
          },
        })
      )
    );

    const updated = await prisma.gradingScale.findMany({
      orderBy: { minScore: 'desc' },
    });

    return NextResponse.json({
      message: 'Cập nhật thang điểm xếp loại thành công!',
      gradingScales: updated,
    });
  } catch (error) {
    console.error('Error updating grading scales:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật thang điểm xếp loại' }, { status: 500 });
  }
}
