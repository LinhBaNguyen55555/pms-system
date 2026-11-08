import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Danh sách kho tiêu chí đánh giá
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập hoặc phiên làm việc hết hạn' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const criteria = await prisma.criterion.findMany({
      where,
      include: {
        _count: {
          select: { templateItems: true, evaluationDetails: true },
        },
      },
      orderBy: [{ category: 'asc' }, { id: 'asc' }],
    });

    return NextResponse.json({ criteria });
  } catch (error) {
    console.error('Error fetching criteria:', error);
    return NextResponse.json({ error: 'Lỗi tải danh sách tiêu chí' }, { status: 500 });
  }
}

// POST: Tạo mới tiêu chí đánh giá (Chỉ dành cho HR)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'HR') {
      return NextResponse.json({ error: 'Chỉ Hội đồng Nhân sự (HR) mới có quyền tạo tiêu chí' }, { status: 403 });
    }

    const body = await request.json();
    const { name, category, description, behaviorGuide } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Tên tiêu chí không được để trống' }, { status: 400 });
    }

    if (!category || !['KPI', 'NĂNG LỰC', 'THÁI ĐỘ'].includes(category)) {
      return NextResponse.json({ error: 'Nhóm tiêu chí phải là KPI, NĂNG LỰC hoặc THÁI ĐỘ' }, { status: 400 });
    }

    let behaviorGuideStr = null;
    if (behaviorGuide) {
      behaviorGuideStr = typeof behaviorGuide === 'string' ? behaviorGuide : JSON.stringify(behaviorGuide);
    }

    const criterion = await prisma.criterion.create({
      data: {
        name: name.trim(),
        category,
        description: description?.trim() || null,
        behaviorGuide: behaviorGuideStr,
      },
    });

    return NextResponse.json({
      message: 'Tạo tiêu chí thành công!',
      criterion,
    });
  } catch (error) {
    console.error('Error creating criterion:', error);
    return NextResponse.json({ error: 'Lỗi tạo tiêu chí mới' }, { status: 500 });
  }
}
