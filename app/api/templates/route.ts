import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Danh sách mẫu phiếu đánh giá
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('positionId');

    const where: Record<string, unknown> = {};
    if (positionId && positionId !== 'all') {
      where.positionId = parseInt(positionId, 10);
    }

    const templates = await prisma.appraisalTemplate.findMany({
      where,
      include: {
        position: true,
        items: {
          include: {
            criterion: true,
          },
          orderBy: {
            criterion: {
              category: 'asc',
            },
          },
        },
        _count: {
          select: { evaluationForms: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching appraisal templates:', error);
    return NextResponse.json({ error: 'Lỗi tải danh sách mẫu phiếu' }, { status: 500 });
  }
}

// POST: Tạo mới mẫu phiếu đánh giá (Chỉ dành cho HR)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'HR') {
      return NextResponse.json({ error: 'Chỉ Hội đồng Nhân sự (HR) mới có quyền tạo mẫu phiếu' }, { status: 403 });
    }

    const body = await request.json();
    const { name, positionId, description, items } = body;

    // Validate tên và chức danh
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Tên mẫu phiếu không được để trống' }, { status: 400 });
    }

    const posId = parseInt(positionId, 10);
    if (!posId || isNaN(posId)) {
      return NextResponse.json({ error: 'Vui lòng chọn vị trí chức vụ áp dụng mẫu phiếu' }, { status: 400 });
    }

    // Kiểm tra danh sách tiêu chí
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Mẫu phiếu phải có ít nhất một tiêu chí đánh giá' }, { status: 400 });
    }

    // Kiểm tra trùng lặp tiêu chí
    const criterionIds = items.map((it: { criterionId: number }) => Number(it.criterionId));
    const uniqueIds = new Set(criterionIds);
    if (uniqueIds.size !== criterionIds.length) {
      return NextResponse.json({ error: 'Không được chọn trùng lặp tiêu chí trong cùng một mẫu phiếu' }, { status: 400 });
    }

    // RÀNG BUỘC NGHIỆP VỤ BẮT BUỘC: Tổng tỷ lệ trọng số = 100%
    let totalWeight = 0;
    for (const item of items) {
      const w = parseFloat(item.weight);
      if (isNaN(w) || w <= 0) {
        return NextResponse.json({ error: 'Trọng số của mỗi tiêu chí phải lớn hơn 0%' }, { status: 400 });
      }
      totalWeight += w;
    }

    // Cho phép dung sai làm tròn 0.01
    if (Math.abs(totalWeight - 100) > 0.01) {
      return NextResponse.json(
        {
          error: `Ràng buộc nghiệp vụ: Tổng tỷ lệ trọng số của tất cả tiêu chí phải bằng đúng 100%! Hiện tại đang là ${totalWeight.toFixed(1)}% (chênh lệch ${(100 - totalWeight).toFixed(1)}%). Vui lòng cân đối lại trước khi lưu!`,
        },
        { status: 400 }
      );
    }

    // Thực hiện lưu trong Transaction
    const template = await prisma.$transaction(async (tx) => {
      const created = await tx.appraisalTemplate.create({
        data: {
          name: name.trim(),
          positionId: posId,
          description: description?.trim() || null,
          totalWeight: 100.0,
          items: {
            create: items.map((it: { criterionId: number; weight: number }) => ({
              criterionId: Number(it.criterionId),
              weight: parseFloat(String(it.weight)),
            })),
          },
        },
        include: {
          position: true,
          items: {
            include: { criterion: true },
          },
        },
      });

      return created;
    });

    return NextResponse.json({
      message: 'Tạo mẫu phiếu đánh giá thành công!',
      template,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Lỗi tạo mẫu phiếu đánh giá' }, { status: 500 });
  }
}
