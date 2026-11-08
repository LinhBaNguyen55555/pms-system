import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Chi tiết tiêu chí theo ID
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
    const criterionId = parseInt(id, 10);
    if (isNaN(criterionId)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const criterion = await prisma.criterion.findUnique({
      where: { id: criterionId },
      include: {
        _count: {
          select: { templateItems: true, evaluationDetails: true },
        },
      },
    });

    if (!criterion) {
      return NextResponse.json({ error: 'Không tìm thấy tiêu chí' }, { status: 404 });
    }

    return NextResponse.json({ criterion });
  } catch (error) {
    console.error('Error fetching criterion detail:', error);
    return NextResponse.json({ error: 'Lỗi tải chi tiết tiêu chí' }, { status: 500 });
  }
}

// PUT: Cập nhật tiêu chí đánh giá (Chỉ dành cho HR)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'HR') {
      return NextResponse.json({ error: 'Chỉ Hội đồng Nhân sự (HR) mới có quyền chỉnh sửa tiêu chí' }, { status: 403 });
    }

    const { id } = await params;
    const criterionId = parseInt(id, 10);
    if (isNaN(criterionId)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const body = await request.json();
    const { name, category, description, behaviorGuide } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Tên tiêu chí không được để trống' }, { status: 400 });
    }

    if (category && !['KPI', 'NĂNG LỰC', 'THÁI ĐỘ'].includes(category)) {
      return NextResponse.json({ error: 'Nhóm tiêu chí phải là KPI, NĂNG LỰC hoặc THÁI ĐỘ' }, { status: 400 });
    }

    let behaviorGuideStr = undefined;
    if (behaviorGuide !== undefined) {
      behaviorGuideStr = typeof behaviorGuide === 'string' ? behaviorGuide : JSON.stringify(behaviorGuide);
    }

    const updated = await prisma.criterion.update({
      where: { id: criterionId },
      data: {
        name: name.trim(),
        category,
        description: description?.trim() || null,
        behaviorGuide: behaviorGuideStr,
      },
    });

    return NextResponse.json({
      message: 'Cập nhật tiêu chí thành công!',
      criterion: updated,
    });
  } catch (error) {
    console.error('Error updating criterion:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật tiêu chí' }, { status: 500 });
  }
}

// DELETE: Xóa tiêu chí (Chỉ dành cho HR, chặn nếu đã sử dụng)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'HR') {
      return NextResponse.json({ error: 'Chỉ Hội đồng Nhân sự (HR) mới có quyền xóa tiêu chí' }, { status: 403 });
    }

    const { id } = await params;
    const criterionId = parseInt(id, 10);
    if (isNaN(criterionId)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    // Kiểm tra ràng buộc
    const usage = await prisma.criterion.findUnique({
      where: { id: criterionId },
      include: {
        _count: {
          select: { templateItems: true, evaluationDetails: true },
        },
      },
    });

    if (!usage) {
      return NextResponse.json({ error: 'Tiêu chí không tồn tại' }, { status: 404 });
    }

    if (usage._count.templateItems > 0 || usage._count.evaluationDetails > 0) {
      return NextResponse.json(
        {
          error: `Không thể xóa tiêu chí này vì đang được áp dụng trong ${usage._count.templateItems} mẫu phiếu và ${usage._count.evaluationDetails} bản đánh giá thực tế!`,
        },
        { status: 400 }
      );
    }

    await prisma.criterion.delete({
      where: { id: criterionId },
    });

    return NextResponse.json({
      message: 'Đã xóa tiêu chí thành công!',
    });
  } catch (error) {
    console.error('Error deleting criterion:', error);
    return NextResponse.json({ error: 'Lỗi xóa tiêu chí' }, { status: 500 });
  }
}
