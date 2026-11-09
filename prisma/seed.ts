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

  // 1. Phân quyền hệ thống (RBAC)
  const rHr = await prisma.role.upsert({ where: { name: 'HR' }, update: {}, create: { name: 'HR', description: 'Hội đồng Nhân sự & Đánh giá' } });
  const rMgr = await prisma.role.upsert({ where: { name: 'MANAGER' }, update: {}, create: { name: 'MANAGER', description: 'Trưởng bộ phận' } });
  const rEmp = await prisma.role.upsert({ where: { name: 'EMPLOYEE' }, update: {}, create: { name: 'EMPLOYEE', description: 'Nhân viên' } });

  // 2. Thang xếp loại quy chuẩn (US-02.3)
  const gradingScales = [
    { grade: 'A', minScore: 90.0, maxScore: 100.0, description: 'Xuất sắc - Hoàn thành vượt mức kế hoạch KPI, năng lực xuất sắc và tác phong gương mẫu.' },
    { grade: 'B', minScore: 75.0, maxScore: 89.99, description: 'Tốt - Hoàn thành tốt các mục tiêu KPI đề ra, có tinh thần trách nhiệm và chủ động.' },
    { grade: 'C', minScore: 50.0, maxScore: 74.99, description: 'Hoàn thành - Hoàn thành nhiệm vụ đạt chuẩn yêu cầu, cần cải thiện một số kỹ năng.' },
    { grade: 'D', minScore: 0.0, maxScore: 49.99, description: 'Chưa đạt - Chưa đạt chỉ tiêu cơ bản, cần đưa vào kế hoạch cải thiện hiệu suất (PIP).' },
  ];
  for (const scale of gradingScales) {
    await prisma.gradingScale.upsert({
      where: { grade: scale.grade },
      update: { minScore: scale.minScore, maxScore: scale.maxScore, description: scale.description },
      create: scale,
    });
  }

  // 3. Cơ cấu 14 Phòng ban quy mô tổng công ty (US-01)
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
    depts[d.code] = await prisma.department.upsert({ where: { code: d.code }, update: { name: d.name }, create: d });
  }

  // 4. Danh mục Chức danh công việc chuẩn (US-01)
  const positionsData = [
    { name: 'Giám đốc Khối / Trưởng Bộ phận', code: 'HEAD' },
    { name: 'Phó Trưởng phòng', code: 'DEPUTY' },
    { name: 'Chuyên viên Cao cấp (Senior)', code: 'SENIOR' },
    { name: 'Chuyên viên Chính (Mid-level)', code: 'SPECIALIST' },
    { name: 'Nhân viên Nghiệp vụ (Junior)', code: 'ASSOCIATE' },
  ];

  const positions: Record<string, { id: number; name: string; code: string }> = {};
  for (const p of positionsData) {
    positions[p.code] = await prisma.position.upsert({ where: { code: p.code }, update: { name: p.name }, create: p });
  }

  // 5. Kho tiêu chí Rubric đánh giá chuẩn (US-02.1 - 3 nhóm cốt lõi)
  const criteriaData = [
    {
      name: 'Tiến độ & Mức độ hoàn thành chỉ tiêu KPI cá nhân',
      category: 'KPI',
      description: 'Đạt hoặc vượt tỷ lệ chỉ tiêu lượng hóa đầu kỳ được Trưởng bộ phận phê duyệt',
      behaviorGuide: JSON.stringify({
        level1: 'Dưới 60% chỉ tiêu KPI, thường xuyên trễ hạn không lý do chính đáng',
        level2: 'Đạt 60% - 79% chỉ tiêu KPI, cần quản lý nhắc nhở và đôn đốc liên tục',
        level3: 'Đạt 80% - 99% chỉ tiêu KPI, hoàn thành đúng hạn các mốc công việc chính',
        level4: 'Đạt 100% - 110% chỉ tiêu KPI, chủ động hoàn thành trước hạn cam kết',
        level5: 'Vượt trên 110% chỉ tiêu KPI, tạo ra giá trị đột phá cho phòng ban',
      }),
    },
    {
      name: 'Chất lượng bàn giao & Tỷ lệ sai sót trong công việc',
      category: 'KPI',
      description: 'Đảm bảo độ chính xác, tiêu chuẩn kỹ thuật nghiệp vụ và ít phải sửa đổi',
      behaviorGuide: JSON.stringify({
        level1: 'Tỷ lệ lỗi cao (>15%), thường xuyên bị trả về làm lại, gây ảnh hưởng tiến độ',
        level2: 'Còn nhiều sai sót nghiệp vụ (10% - 15%), phải kiểm tra và nhắc nhở nhiều lần',
        level3: 'Tỷ lệ sai sót ở mức cho phép (<5%), xử lý khắc phục kịp thời khi có phản hồi',
        level4: 'Sản phẩm bàn giao chỉn chu, chính xác, tỷ lệ sai sót gần như bằng 0 (<2%)',
        level5: 'Chất lượng xuất sắc vượt chuẩn, tối ưu hóa quy trình giúp giảm lỗi cho cả đội ngũ',
      }),
    },
    {
      name: 'Năng suất làm việc & Tối ưu hóa nguồn lực',
      category: 'KPI',
      description: 'Khả năng quản lý thời gian, tận dụng tài nguyên và hoàn thành khối lượng việc cao',
      behaviorGuide: JSON.stringify({
        level1: 'Năng suất thấp, lãng phí thời gian và ngân sách được cấp phát',
        level2: 'Năng suất trung bình, thỉnh thoảng quá tải khi có phát sinh công việc',
        level3: 'Hoàn thành đủ khối lượng công việc được giao đúng trong định mức nguồn lực',
        level4: 'Năng suất cao, biết sắp xếp thứ tự ưu tiên và tiết kiệm thời gian thực hiện',
        level5: 'Năng suất vượt trội, tối ưu hóa công cụ làm việc giúp tiết kiệm chi phí cho đơn vị',
      }),
    },
    {
      name: 'Năng lực chuyên môn & Xử lý tình huống phát sinh',
      category: 'NĂNG LỰC',
      description: 'Nắm vững kiến thức chuyên sâu và giải quyết triệt để các bài toán khó',
      behaviorGuide: JSON.stringify({
        level1: 'Kiến thức chuyên môn hạn chế, lúng túng khi gặp vấn đề ngoài bài bản',
        level2: 'Chỉ xử lý được công việc quen thuộc, cần trợ giúp khi có tình huống mới',
        level3: 'Nắm vững nghiệp vụ, tự chủ giải quyết tốt các tình huống công việc thông thường',
        level4: 'Chuyên môn sâu, giải quyết nhanh các tình huống phức tạp và sự cố phát sinh',
        level5: 'Chuyên gia hàng đầu trong lĩnh vực, là điểm tựa tư vấn chuyên môn cho toàn bộ phận',
      }),
    },
    {
      name: 'Kỹ năng làm việc nhóm & Tinh thần hỗ trợ đồng đội',
      category: 'NĂNG LỰC',
      description: 'Phối hợp nhịp nhàng giữa các cá nhân và phòng ban liên quan',
      behaviorGuide: JSON.stringify({
        level1: 'Làm việc cục bộ, thiếu hợp tác, gây cản trở tiến độ chung của nhóm',
        level2: 'Hợp tác thụ động, chỉ làm đúng phần việc của mình, ít chia sẻ thông tin',
        level3: 'Lắng nghe, tôn trọng ý kiến đồng nghiệp, phối hợp tốt trong các dự án chung',
        level4: 'Tích cực chia sẻ kiến thức, chủ động hỗ trợ đồng nghiệp khi họ gặp khó khăn',
        level5: 'Gắn kết các thành viên, thúc đẩy tinh thần làm việc nhóm và truyền cảm hứng tích cực',
      }),
    },
    {
      name: 'Tư duy đổi mới, sáng tạo & Cải tiến quy trình',
      category: 'NĂNG LỰC',
      description: 'Chủ động đề xuất các sáng kiến, giải pháp công nghệ hoặc quy trình làm việc mới',
      behaviorGuide: JSON.stringify({
        level1: 'Bảo thủ, rập khuôn, ngại thay đổi và phản kháng các cải tiến mới',
        level2: 'Chấp nhận thay đổi nhưng không chủ động đóng góp ý kiến cải tiến',
        level3: 'Sẵn sàng tiếp thu các phương pháp mới và đóng góp ý kiến xây dựng',
        level4: 'Thường xuyên có đề xuất cải tiến hợp lý, áp dụng hiệu quả vào thực tế công việc',
        level5: 'Tác giả của các sáng kiến đột phá, giúp nâng cao đáng kể năng suất phòng ban',
      }),
    },
    {
      name: 'Ý thức kỷ luật, giờ giấc & Tuân thủ nội quy doanh nghiệp',
      category: 'THÁI ĐỘ',
      description: 'Chấp hành đầy đủ quy định về bảo mật, an toàn và thời gian làm việc',
      behaviorGuide: JSON.stringify({
        level1: 'Thường xuyên đi muộn về sớm, vi phạm nội quy, thái độ thiếu hợp tác',
        level2: 'Thỉnh thoảng vi phạm giờ giấc hoặc quy định văn phòng, thái độ tiếp thu chưa tốt',
        level3: 'Tuân thủ đầy đủ nội quy lao động, quy trình bảo mật và giờ giấc làm việc',
        level4: 'Nghiêm túc gương mẫu, luôn đúng giờ trong mọi cuộc họp và cam kết công việc',
        level5: 'Hình mẫu điển hình về văn hóa kỷ luật và tính chuyên nghiệp trong toàn tổ chức',
      }),
    },
    {
      name: 'Tinh thần trách nhiệm & Tính chủ động trong công việc',
      category: 'THÁI ĐỘ',
      description: 'Dám chịu trách nhiệm về kết quả công việc, chủ động tìm giải pháp',
      behaviorGuide: JSON.stringify({
        level1: 'Né tránh trách nhiệm, đùn đẩy lỗi cho người khác khi xảy ra sự cố',
        level2: 'Thụ động, chỉ làm khi có chỉ đạo trực tiếp, thiếu tinh thần theo đuổi mục tiêu',
        level3: 'Có trách nhiệm với công việc được giao, thẳng thắn nhận lỗi và sửa đổi',
        level4: 'Rất chủ động, luôn có phương án dự phòng và theo dõi công việc đến cùng',
        level5: 'Tinh thần dấn thân cao, sẵn sàng nhận nhiệm vụ khó và chịu trách nhiệm cao nhất',
      }),
    },
    {
      name: 'Bảo mật thông tin & Đạo đức nghề nghiệp',
      category: 'THÁI ĐỘ',
      description: 'Bảo vệ tài sản và dữ liệu mật của khách hàng và doanh nghiệp',
      behaviorGuide: JSON.stringify({
        level1: 'Vi phạm quy định bảo mật, để lộ thông tin nội bộ gây rủi ro cho công ty',
        level2: 'Còn lơ là trong quản lý tài khoản và tài liệu mật, cần cảnh báo',
        level3: 'Tuyệt đối bảo mật thông tin, trung thực trong báo cáo số liệu và chi phí',
        level4: 'Chủ động phát hiện và cảnh báo các nguy cơ mất an toàn thông tin trong phòng',
        level5: 'Là tấm gương sáng về liêm chính, trung thực và đạo đức nghề nghiệp mẫu mực',
      }),
    },
  ];

  const criteriaMap: Record<string, number> = {};
  for (const c of criteriaData) {
    const existing = await prisma.criterion.findFirst({ where: { name: c.name } });
    if (existing) {
      const updated = await prisma.criterion.update({
        where: { id: existing.id },
        data: { category: c.category, description: c.description, behaviorGuide: c.behaviorGuide },
      });
      criteriaMap[c.name] = updated.id;
    } else {
      const created = await prisma.criterion.create({ data: c });
      criteriaMap[c.name] = created.id;
    }
  }

  // 6. Mẫu phiếu Đánh giá chuẩn theo vị trí (US-02.2 - Tổng trọng số = 100%)
  const templatesData = [
    {
      name: 'Mẫu đánh giá Trưởng Bộ phận & Quản lý cấp cao',
      positionId: positions['HEAD'].id,
      description: 'Áp dụng cho cấp Trưởng phòng, Giám đốc bộ phận - Chú trọng chỉ tiêu KPI và năng lực giải quyết sự cố.',
      items: [
        { cName: 'Tiến độ & Mức độ hoàn thành chỉ tiêu KPI cá nhân', weight: 40 },
        { cName: 'Chất lượng bàn giao & Tỷ lệ sai sót trong công việc', weight: 20 },
        { cName: 'Năng lực chuyên môn & Xử lý tình huống phát sinh', weight: 15 },
        { cName: 'Kỹ năng làm việc nhóm & Tinh thần hỗ trợ đồng đội', weight: 15 },
        { cName: 'Tinh thần trách nhiệm & Tính chủ động trong công việc', weight: 10 },
      ],
    },
    {
      name: 'Mẫu đánh giá Chuyên viên Cao cấp (Senior)',
      positionId: positions['SENIOR'].id,
      description: 'Áp dụng cho Senior - Cân bằng giữa chất lượng chuyên môn sâu, KPI và tính kỷ luật.',
      items: [
        { cName: 'Tiến độ & Mức độ hoàn thành chỉ tiêu KPI cá nhân', weight: 35 },
        { cName: 'Chất lượng bàn giao & Tỷ lệ sai sót trong công việc', weight: 25 },
        { cName: 'Năng lực chuyên môn & Xử lý tình huống phát sinh', weight: 20 },
        { cName: 'Kỹ năng làm việc nhóm & Tinh thần hỗ trợ đồng đội', weight: 10 },
        { cName: 'Ý thức kỷ luật, giờ giấc & Tuân thủ nội quy doanh nghiệp', weight: 10 },
      ],
    },
    {
      name: 'Mẫu đánh giá Chuyên viên Nghiệp vụ (Mid-level)',
      positionId: positions['SPECIALIST'].id,
      description: 'Áp dụng cho Chuyên viên chính - Tập trung mạnh vào tiến độ và độ chuẩn xác của sản phẩm.',
      items: [
        { cName: 'Tiến độ & Mức độ hoàn thành chỉ tiêu KPI cá nhân', weight: 45 },
        { cName: 'Chất lượng bàn giao & Tỷ lệ sai sót trong công việc', weight: 25 },
        { cName: 'Kỹ năng làm việc nhóm & Tinh thần hỗ trợ đồng đội', weight: 15 },
        { cName: 'Ý thức kỷ luật, giờ giấc & Tuân thủ nội quy doanh nghiệp', weight: 15 },
      ],
    },
    {
      name: 'Mẫu đánh giá Nhân viên Khởi nghiệp (Junior)',
      positionId: positions['ASSOCIATE'].id,
      description: 'Áp dụng cho Nhân viên mới - Đánh giá tinh thần học hỏi, cải tiến, ý thức kỷ luật và KPI.',
      items: [
        { cName: 'Tiến độ & Mức độ hoàn thành chỉ tiêu KPI cá nhân', weight: 40 },
        { cName: 'Chất lượng bàn giao & Tỷ lệ sai sót trong công việc', weight: 20 },
        { cName: 'Tư duy đổi mới, sáng tạo & Cải tiến quy trình', weight: 15 },
        { cName: 'Ý thức kỷ luật, giờ giấc & Tuân thủ nội quy doanh nghiệp', weight: 15 },
        { cName: 'Tinh thần trách nhiệm & Tính chủ động trong công việc', weight: 10 },
      ],
    },
  ];

  for (const t of templatesData) {
    const existing = await prisma.appraisalTemplate.findFirst({
      where: { positionId: t.positionId },
    });

    if (existing) {
      await prisma.templateItem.deleteMany({ where: { templateId: existing.id } });
      await prisma.appraisalTemplate.update({
        where: { id: existing.id },
        data: {
          name: t.name,
          description: t.description,
          totalWeight: 100.0,
          items: {
            create: t.items.map((it) => ({
              criterionId: criteriaMap[it.cName],
              weight: it.weight,
            })),
          },
        },
      });
    } else {
      await prisma.appraisalTemplate.create({
        data: {
          name: t.name,
          positionId: t.positionId,
          description: t.description,
          totalWeight: 100.0,
          items: {
            create: t.items.map((it) => ({
              criterionId: criteriaMap[it.cName],
              weight: it.weight,
            })),
          },
        },
      });
    }
  }

  // 7. Tạo Tài khoản Hội đồng Nhân sự tối cao (HR Council)
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

  // 8. Tạo danh sách 13 Trưởng bộ phận thực tế (Manager) quản lý trực tiếp từng phòng ban
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

  // 9. Tạo 120 Nhân viên phân bổ đều qua 14 phòng ban, gán đúng managerId của từng phòng
  console.log('-> Đang kiểm tra và khởi tạo 120 nhân sự cơ cấu quản lý trực tiếp theo phòng...');
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
      update: {
        departmentId: depts[deptCode].id,
        positionId: positions[posKey].id,
        managerId: directManagerId,
      },
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

  // 10. Khởi tạo Kỳ đánh giá mẫu Quý 1/2026 (US-03)
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

  console.log('--- Nạp dữ liệu hoàn tất: 14 Phòng ban, 13 Trưởng bộ phận, 120 Nhân viên, 9 Tiêu chí Rubric, 4 Mẫu phiếu 100%! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
