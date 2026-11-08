import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        employees: {
          include: {
            position: true,
            user: {
              include: {
                role: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    const orgTree = departments.map((dept) => {
      // Find managers/heads of this department
      const heads = dept.employees.filter(
        (e) => e.position.code === 'HEAD' || e.user?.role?.name === 'MANAGER'
      );

      // Find staff whose managerId is one of these heads or in this department
      const headIds = new Set(heads.map((h) => h.id));
      const staff = dept.employees.filter((e) => !headIds.has(e.id));

      return {
        id: dept.id,
        code: dept.code,
        name: dept.name,
        totalEmployees: dept.employees.length,
        heads: heads.map((h) => ({
          id: h.id,
          code: h.code,
          fullName: h.fullName,
          email: h.email,
          phone: h.phone,
          position: h.position.name,
          role: h.user?.role?.name || 'MANAGER',
          subordinates: dept.employees.filter((sub) => sub.managerId === h.id).map((sub) => ({
            id: sub.id,
            code: sub.code,
            fullName: sub.fullName,
            email: sub.email,
            position: sub.position.name,
          })),
        })),
        staffWithoutHead: staff.filter((s) => !s.managerId || !headIds.has(s.managerId)).map((s) => ({
          id: s.id,
          code: s.code,
          fullName: s.fullName,
          email: s.email,
          position: s.position.name,
          managerId: s.managerId,
        })),
      };
    });

    return NextResponse.json(orgTree);
  } catch (error) {
    console.error('Error fetching org chart:', error);
    return NextResponse.json({ error: 'Lỗi tải sơ đồ tổ chức' }, { status: 500 });
  }
}
