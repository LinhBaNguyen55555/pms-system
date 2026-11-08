import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Bộ từ điển họ tên tiếng Việt thực tế
const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh'];
const MIDDLE_MALE = ['Văn', 'Đức', 'Hữu', 'Minh', 'Tuấn', 'Quốc', 'Thanh', 'Hải', 'Quang', 'Đình'];
const MIDDLE_FEMALE = ['Thị', 'Thu', 'Ngọc', 'Phương', 'Thanh', 'Mai', 'Thùy', 'Như', 'Kim', 'Khánh'];
const FIRST_MALE = ['Nam', 'Dũng', 'Tùng', 'Khoa', 'Huy', 'Việt', 'Đạt', 'Hiếu', 'Sơn', 'Quân', 'Thành', 'Bách', 'Cường', 'Long', 'Phong', 'Thắng'];
const FIRST_FEMALE = ['Trang', 'Linh', 'Thảo', 'Hương', 'Hà', 'Yến', 'Lan', 'Giang', 'Huyền', 'Tâm', 'Vy', 'Nhung', 'My', 'Oanh', 'Mai', 'Ngân'];

function generateFullName(gender: 'male' | 'female'): string {
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  if (gender === 'male') {
    const mid = MIDDLE_MALE[Math.floor(Math.random() * MIDDLE_MALE.length)];
    const first = FIRST_MALE[Math.floor(Math.random() * FIRST_MALE.length)];
    return `${last} ${mid} ${first}`;
  } else {
    const mid = MIDDLE_FEMALE[Math.floor(Math.random() * MIDDLE_FEMALE.length)];
    const first = FIRST_FEMALE[Math.floor(Math.random() * FIRST_FEMALE.length)];
    return `${last} ${mid} ${first}`;
  }
}

function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, '');
}

async function main() {
  console.log('--- Bắt đầu khởi tạo dữ liệu mô hình tổng công ty (Enterprise Corp) ---');

  // 1. Phân quyền hệ thống
  const rHr = await prisma.role.upsert({ where: { name: 'HR' }, update: {}, create: { name: 'HR', description: 'Hội đồng Nhân sự & Đánh giá' } });
  const rMgr = await prisma.role.upsert({ where: { name: 'MANAGER' }, update: {}, create: { name: 'MANAGER', description: 'Trưởng bộ phận' } });
  const rEmp = await prisma.role.upsert({ where: { name: 'EMPLOYEE' }, update: {}, create: { name: 'EMPLOYEE', description: 'Nhân viên' } });

  // 2. Thang xếp loại quy chuẩn (US-02)
  const gradingScales = [
    { grade: 'A', minScore: 90.0, maxScore: 100.0, description: 'Xuất sắc - Vượt kỳ vọng' },
    { grade: 'B', minScore: 75.0, maxScore: 89.99, description: 'Tốt - Đạt toàn bộ mục tiêu' },
    { grade: 'C', minScore: 50.0, maxScore: 74.99, description: 'Hoàn thành - Cần cải thiện' },
    { grade: 'D', minScore: 0.0, maxScore: 49.99, description: 'Chưa đạt - Hiệu suất yếu' },
  ];
  for (const scale of gradingScales) {
    await prisma.gradingScale.upsert({ where: { grade: scale.grade }, update: {}, create: scale });
  }

  // 3. Cơ cấu 14 Phòng ban quy mô tổng công ty
  const departmentsData = [
    { name: 'Ban Giám Đốc & Quản Lý Chiến Lược', code: 'BOD' },
    { name: 'Phòng Quản Trị & Phát Triển Nhân Lực', code: 'HR' },
    { name: 'Phòng Tài Chính - Kế Toán', code: 'FIN' },
    { name: 'Phòng Công Nghệ & Kỹ Thuật Phần Mềm', code: 'IT' },
    { name: 'Phòng Nghiên Cứu & Phát Triển Sản Phẩm (R&D)', code: 'RND' },
    { name: 'Phòng Vận Hành Hệ Thống & Bảo Mật (DevOps & Sec)', code: 'OPS' },
    { name: 'Phòng Quản Lý Chất Lượng & Kiểm Toán Nội Bộ (QA)', code: 'QA' },
    { name: 'Phòng Marketing & Truyền Thông Thương Hiệu', code: 'MKT' },
    { name: 'Phòng Phát Triển Kinh Doanh Doanh Nghiệp (B2B)', code: 'SALES_B2B' },
    { name: 'Phòng Kinh Doanh Bán Lẻ & Đối Tác (B2C)', code: 'SALES_B2C' },
    { name: 'Phòng Chăm Sóc Khách Hàng & Trải Nghiệm (CX)', code: 'CS' },
    { name: 'Phòng Chuỗi Cung Ứng & Mua Hàng', code: 'SCM' },
    { name: 'Phòng Pháp Chế & Tuân Thủ Quy Chuẩn', code: 'LEGAL' },
    { name: 'Phòng Hành Chính & Quản Trị Cơ Sở Vật Chất', code: 'ADMIN' },
  ];

  const depts: Record<string, { id: number; name: string; code: string }> = {};
  for (const d of departmentsData) {
    depts[d.code] = await prisma.department.upsert({ where: { code: d.code }, update: {}, create: d });
  }

  // 4. Danh mục Chức danh công việc
  const positionsData = [
    { name: 'Giám đốc Khối / Trưởng Bộ phận', code: 'HEAD' },
    { name: 'Phó Trưởng phòng', code: 'DEPUTY' },
    { name: 'Chuyên viên Cao cấp (Senior)', code: 'SENIOR' },
    { name: 'Chuyên viên Chính (Mid-level)', code: 'SPECIALIST' },
    { name: 'Nhân viên Nghiệp vụ (Junior)', code: 'ASSOCIATE' },
  ];

  const positions: Record<string, { id: number; name: string; code: string }> = {};
  for (const p of positionsData) {
    positions[p.code] = await prisma.position.upsert({ where: { code: p.code }, update: {}, create: p });
  }

  // 5. Kho tiêu chí Rubric đánh giá (US-02)
  const criteriaData = [
    { name: 'Tiến độ & Mức độ hoàn thành chỉ tiêu KPI cá nhân', category: 'KPI', description: 'Đạt hoặc vượt tỷ lệ chỉ tiêu lượng hóa đầu kỳ' },
    { name: 'Chất lượng bàn giao & Tỷ lệ sai sót trong công việc', category: 'KPI', description: 'Đảm bảo độ chính xác, tiêu chuẩn kỹ thuật nghiệp vụ' },
    { name: 'Năng lực chuyên môn & Xử lý tình huống phức tạp', category: 'NĂNG LỰC', description: 'Giải quyết triệt để các phát sinh ngoài quy trình' },
    { name: 'Kỹ năng làm việc nhóm & Tinh thần hỗ trợ đồng đội', category: 'NĂNG LỰC', description: 'Phối hợp nhịp nhàng giữa các phòng ban liên quan' },
    { name: 'Ý thức kỷ luật, giờ giấc & Tuân thủ văn hóa nội bộ', category: 'THÁI ĐỘ', description: 'Chấp hành đầy đủ nội quy, bảo mật dữ liệu doanh nghiệp' },
  ];

  for (const c of criteriaData) {
    await prisma.criterion.create({ data: c });
  }

  // 6. Tạo Tài khoản Hội đồng Nhân sự tối cao (HR Council)
  const hrLeaderUser = await prisma.user.upsert({
    where: { username: 'hr_council' },
    update: {},
    create: { username: 'hr_council', password: 'password123', roleId: rHr.id },
  });
  await prisma.employee.upsert({
    where: { email: 'phuong.le@pms.corp' },
    update: {},
    create: {
      code: 'HR0001',
      fullName: 'Lê Thanh Phương',
      email: 'phuong.le@pms.corp',
      phone: '0912345678',
      departmentId: depts['HR'].id,
      positionId: positions['HEAD'].id,
      userId: hrLeaderUser.id,
    },
  });

  // 7. Tạo danh sách 13 Trưởng bộ phận thực tế (Manager) quản lý trực tiếp từng phòng ban
  const managerConfigs = [
    { dept: 'BOD', name: 'Nguyễn Quang Dũng', code: 'MGR001' },
    { dept: 'FIN', name: 'Đặng Thùy Dương', code: 'MGR002' },
    { dept: 'IT', name: 'Trần Minh Tuấn', code: 'MGR003' },
    { dept: 'RND', name: 'Phan Quốc Huy', code: 'MGR004' },
    { dept: 'OPS', name: 'Vũ Đức Nam', code: 'MGR005' },
    { dept: 'QA', name: 'Bùi Thị Khánh Linh', code: 'MGR006' },
    { dept: 'MKT', name: 'Phạm Quốc Hùng', code: 'MGR007' },
    { dept: 'SALES_B2B', name: 'Ngô Thanh Sơn', code: 'MGR008' },
    { dept: 'SALES_B2C', name: 'Hồ Hoàng Bách', code: 'MGR009' },
    { dept: 'CS', name: 'Hoàng Mai Hương', code: 'MGR010' },
    { dept: 'SCM', name: 'Đỗ Văn Thành', code: 'MGR011' },
    { dept: 'LEGAL', name: 'Lý Ngọc Mai', code: 'MGR012' },
    { dept: 'ADMIN', name: 'Dương Văn Khoa', code: 'MGR013' },
  ];

  const managerRecords: Record<string, number> = {};

  for (const m of managerConfigs) {
    const username = `mgr_${m.dept.toLowerCase()}`;
    const cleanName = removeAccents(m.name);
    const email = `${cleanName}.${m.code.toLowerCase()}@pms.corp`;

    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username, password: 'password123', roleId: rMgr.id },
    });

    const emp = await prisma.employee.upsert({
      where: { email },
      update: {},
      create: {
        code: m.code,
        fullName: m.name,
        email,
        phone: '098' + Math.floor(1000000 + Math.random() * 9000000),
        departmentId: depts[m.dept].id,
        positionId: positions['HEAD'].id,
        userId: user.id,
      },
    });
    managerRecords[m.dept] = emp.id;
  }

  // 8. Tạo 120 Nhân viên phân bổ đều qua 14 phòng ban, gán đúng managerId của từng phòng
  console.log('-> Đang khởi tạo 120 nhân sự với cơ cấu quản lý trực tiếp theo phòng...');
  const deptList = Object.keys(depts);

  for (let i = 1; i <= 120; i++) {
    const deptCode = deptList[i % deptList.length];
    const gender = i % 2 === 0 ? 'female' : 'male';
    const fullName = generateFullName(gender);
    const code = `NV${String(i).padStart(4, '0')}`;
    const cleanName = removeAccents(fullName);
    const email = `${cleanName}.${code.toLowerCase()}@pms.corp`;
    const username = `emp_${code.toLowerCase()}`;

    // Phân bổ tỷ lệ chức danh
    let posKey = 'ASSOCIATE';
    if (i % 5 === 0) posKey = 'DEPUTY';
    else if (i % 3 === 0) posKey = 'SENIOR';
    else if (i % 2 === 0) posKey = 'SPECIALIST';

    // Xác định Trưởng bộ phận phụ trách
    const directManagerId = deptCode === 'HR' ? undefined : managerRecords[deptCode];

    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username, password: 'password123', roleId: rEmp.id },
    });

    await prisma.employee.upsert({
      where: { code },
      update: {},
      create: {
        code,
        fullName,
        email,
        phone: '097' + Math.floor(1000000 + Math.random() * 9000000),
        departmentId: depts[deptCode].id,
        positionId: positions[posKey].id,
        managerId: directManagerId,
        userId: user.id,
      },
    });
  }

  // 9. Khởi tạo Kỳ đánh giá mẫu Quý 1/2026 (US-03)
  await prisma.appraisalPeriod.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Đánh giá Hiệu suất Toàn diện Doanh nghiệp - Quý 1/2026',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-31'),
      selfReviewDeadline: new Date('2026-03-20T23:59:59'),
      managerReviewDeadline: new Date('2026-03-28T23:59:59'),
      status: 'OPEN',
    },
  });

  console.log('--- Nạp dữ liệu hoàn tất: 14 Phòng ban, 13 Trưởng bộ phận, 120 Nhân viên! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });