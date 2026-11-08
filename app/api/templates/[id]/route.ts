import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Chi tiết mẫu phiếu đánh giá
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { id } = await params;
    const templateId = parseInt(id, 10);
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const template = await prisma.appraisalTemplate.findUnique({
      where: { id: templateId },
      include: {
        position: true,
        items: {
          include: { criterion: true },
          orderBy: { criterion: { category: 'asc' } },
        },
        _count: {
          select: { evaluationForms: true },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Không tìm thấy mẫu phiếu' }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error fetching template detail:', error);
    return NextResponse.json({ error: 'Lỗi tải chi tiết mẫu phiếu' }, { status: 500 });
  }
}

// PUT: Cập nhật mẫu phiếu đánh giá (Chỉ dành cho HR)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'HR') {
      return NextResponse.json({ error: 'Chỉ Hội đồng Nhân sự (HR) mới có quyền sửa mẫu phiếu' }, { status: 403 });
    }

    const { id } = await params;
    const templateId = parseInt(id, 10);
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const body = await request.json();
    const { name, positionId, description, items } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Tên mẫu phiếu không được để trống' }, { status: 400 });
    }

    const posId = parseInt(positionId, 10);
    if (!posId || isNaN(posId)) {
      return NextResponse.json({ error: 'Vui lòng chọn chức vụ áp dụng' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Mẫu phiếu phải có ít nhất một tiêu chí đánh giá' }, { status: 400 });
    }

    // Kiểm tra trùng lặp
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

    if (Math.abs(totalWeight - 100) > 0.01) {
      return NextResponse.json(
        {
          error: `Ràng buộc nghiệp vụ: Tổng tỷ lệ trọng số của tất cả tiêu chí phải bằng đúng 100%! Hiện tại đang là ${totalWeight.toFixed(1)}% (chênh lệch ${(100 - totalWeight).toFixed(1)}%). Vui lòng cân đối lại trước khi lưu!`,
        },
        { status: 400 }
      );
    }

    // Thực hiện cập nhật trong Transaction (xóa items cũ và thêm items mới)
    const updated = await prisma.$transaction(async (tx) => {
      // Xóa items cũ
      await tx.templateItem.deleteMany({
        where: { templateId },
      });

      // Cập nhật thông tin và tạo items mới
      const res = await tx.appraisalTemplate.update({
        where: { id: templateId },
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

      return res;
    });

    return NextResponse.json({
      message: 'Cập nhật mẫu phiếu đánh giá thành công!',
      template: updated,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật mẫu phiếu' }, { status: 500 });
  }
}

// DELETE: Xóa mẫu phiếu đánh giá (Chỉ dành cho HR)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'HR') {
      return NextResponse.json({ error: 'Chỉ Hội đồng Nhân sự (HR) mới có quyền xóa mẫu phiếu' }, { status: 403 });
    }

    const { id } = await params;
    const templateId = parseInt(id, 10);
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const usage = await prisma.appraisalTemplate.findUnique({
      where: { id: templateId },
      include: {
        _count: {
          select: { evaluationForms: true },
        },
      },
    });

    if (!usage) {
      return NextResponse.json({ error: 'Mẫu phiếu không tồn tại' }, { status: 404 });
    }

    if (usage._count.evaluationForms > 0) {
      return NextResponse.json(
        {
          error: `Không thể xóa mẫu phiếu này vì đã được phát hành và áp dụng cho ${usage._count.evaluationForms} phiếu đánh giá thực tế!`,
        },
        { status: 400 }
      );
    }

    await prisma.appraisalTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({
      message: 'Đã xóa mẫu phiếu thành công!',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Lỗi xóa mẫu phiếu' }, { status: 500 });
  }
}
