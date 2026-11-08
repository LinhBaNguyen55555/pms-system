'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  message,
  Upload,
  Popconfirm,
  Badge,
  Avatar,
  Tooltip,
  Drawer,
  Descriptions,
  Progress,
  InputNumber,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import {
  Users,
  Building2,
  Briefcase,
  GitFork,
  Crown,
  ShieldCheck,
  FileSpreadsheet,
  UploadCloud,
  UserPlus,
  Search,
  KeyRound,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  RotateCcw,
  Lock,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Building,
  Fingerprint,
  Award,
  Check,
  Calendar,
  FileText,
  Target,
  Star,
  Plus,
  Sliders,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface Department {
  id: number;
  name: string;
  code: string;
  employeeCount: number;
  head?: {
    id: number;
    fullName: string;
    email: string;
    code: string;
  } | null;
}

interface Position {
  id: number;
  name: string;
  code: string;
  employeeCount: number;
}

interface Employee {
  id: number;
  code: string;
  fullName: string;
  email: string;
  phone?: string | null;
  departmentId: number;
  department: {
    id: number;
    name: string;
    code: string;
  };
  positionId: number;
  position: {
    id: number;
    name: string;
    code: string;
  };
  managerId?: number | null;
  manager?: {
    id: number;
    fullName: string;
    code: string;
    email: string;
  } | null;
  subordinateCount?: number;
  role: string;
  roleDescription?: string;
  username?: string;
}

interface UserSession {
  userId: number;
  username: string;
  role: string;
  roleDescription?: string;
  employeeId?: number;
  code?: string;
  fullName: string;
  email?: string;
  phone?: string | null;
  department?: {
    id: number;
    name: string;
    code: string;
  };
  position?: {
    id: number;
    name: string;
    code: string;
  };
  manager?: {
    id: number;
    fullName: string;
    code: string;
    email: string;
  } | null;
}

interface OrgChartNode {
  id: number;
  code: string;
  name: string;
  totalEmployees: number;
  heads: Array<{
    id: number;
    code: string;
    fullName: string;
    email: string;
    phone?: string;
    position: string;
    role: string;
    subordinates: Array<{
      id: number;
      code: string;
      fullName: string;
      email: string;
      position: string;
    }>;
  }>;
  staffWithoutHead: Array<{
    id: number;
    code: string;
    fullName: string;
    email: string;
    position: string;
  }>;
}

interface BehaviorGuide {
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
  level5?: string;
}

interface Criterion {
  id: number;
  name: string;
  category: 'KPI' | 'NĂNG LỰC' | 'THÁI ĐỘ' | string;
  description?: string | null;
  behaviorGuide?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    templateItems: number;
    evaluationDetails: number;
  };
}

interface AppraisalTemplate {
  id: number;
  name: string;
  positionId: number;
  description?: string | null;
  totalWeight: number;
  createdAt?: string;
  updatedAt?: string;
  position: {
    id: number;
    name: string;
    code: string;
  };
  items: Array<{
    id: number;
    templateId: number;
    criterionId: number;
    weight: number;
    criterion: Criterion;
  }>;
  _count?: {
    evaluationForms: number;
  };
}

interface GradingScale {
  id: number;
  grade: 'A' | 'B' | 'C' | 'D' | string;
  minScore: number;
  maxScore: number;
  description?: string | null;
}

// ==========================================
// GSAP CANVAS CONSTELLATION COMPONENT
// ==========================================
function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const numNodes = 48;
    const colors = [
      'rgba(37, 99, 235, ',
      'rgba(79, 70, 229, ',
      'rgba(147, 51, 234, ',
      'rgba(14, 165, 233, ',
    ];

    const nodes = Array.from({ length: numNodes }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2.5 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        const mdx = mouse.x - node.x;
        const mdy = mouse.y - node.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 130) {
          node.x -= (mdx / mDist) * 0.6;
          node.y -= (mdy / mDist) * 0.6;

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.35 * (1 - mDist / 130)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        const grad = ctx.createRadialGradient(
          node.x - node.radius * 0.35,
          node.y - node.radius * 0.35,
          node.radius * 0.1,
          node.x,
          node.y,
          node.radius * 1.5
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, node.color + '0.9)');
        grad.addColorStop(1, node.color + '0.3)');

        ctx.save();
        ctx.shadowColor = node.color + '0.35)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.28 * (1 - dist / 120)})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export default function PMSDashboard() {
  // Session & View State
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<
    'employees' | 'departments' | 'positions' | 'criteria' | 'templates' | 'grading_scales' | 'org_chart'
  >('employees');
  const [loading, setLoading] = useState(false);

  // Core Data State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orgChart, setOrgChart] = useState<OrgChartNode[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [templates, setTemplates] = useState<AppraisalTemplate[]>([]);
  const [gradingScales, setGradingScales] = useState<GradingScale[]>([]);

  // Filter State - US-01
  const [searchText, setSearchText] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedPos, setSelectedPos] = useState<string>('all');

  // Filter State - US-02
  const [selectedCriterionCategory, setSelectedCriterionCategory] = useState<string>('ALL');
  const [criterionSearchText, setCriterionSearchText] = useState<string>('');
  const [selectedTemplatePosition, setSelectedTemplatePosition] = useState<string>('all');

  // Modals & Drawers - US-01
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeForm] = Form.useForm();
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm] = Form.useForm();
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [posForm] = Form.useForm();
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [changePasswordForm] = Form.useForm();
  const [changingPassword, setChangingPassword] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    successCount: number;
    errors: string[];
  } | null>(null);

  // Modals & Drawers - US-02: Criteria
  const [criterionModalOpen, setCriterionModalOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
  const [criterionForm] = Form.useForm();
  const [savingCriterion, setSavingCriterion] = useState(false);
  const [behaviorDrawerOpen, setBehaviorDrawerOpen] = useState(false);
  const [viewingCriterion, setViewingCriterion] = useState<Criterion | null>(null);

  // Modals & Drawers - US-02: Templates
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AppraisalTemplate | null>(null);
  const [templateForm] = Form.useForm();
  const [templateItemsDraft, setTemplateItemsDraft] = useState<Array<{ criterionId: number; weight: number }>>([]);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Template Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<AppraisalTemplate | null>(null);

  // Modals & Drawers - US-02: Grading Scales
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [editingScale, setEditingScale] = useState<GradingScale | null>(null);
  const [scaleForm] = Form.useForm();
  const [savingScale, setSavingScale] = useState(false);

  // Universal Rubric Lookup for Employee and Manager roles
  const [rubricLookupOpen, setRubricLookupOpen] = useState(false);

  // Login Form State
  const [loginForm] = Form.useForm();
  const [loggingIn, setLoggingIn] = useState(false);

  const heroShowcaseRef = useRef<HTMLDivElement | null>(null);

  // ==========================================
  // FETCH DATA
  // ==========================================
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, posRes, orgRes, critRes, tmplRes, gradeRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/departments'),
        fetch('/api/positions'),
        fetch('/api/org-chart'),
        fetch('/api/criteria'),
        fetch('/api/templates'),
        fetch('/api/grading-scales'),
      ]);

      const [empData, deptData, posData, orgData, critData, tmplData, gradeData] = await Promise.all([
        empRes.json(),
        deptRes.json(),
        posRes.json(),
        orgRes.json(),
        critRes.json(),
        tmplRes.json(),
        gradeRes.json(),
      ]);

      if (Array.isArray(empData)) setEmployees(empData);
      if (Array.isArray(deptData)) setDepartments(deptData);
      if (Array.isArray(posData)) setPositions(posData);
      if (Array.isArray(orgData)) setOrgChart(orgData);
      if (critData?.criteria && Array.isArray(critData.criteria)) setCriteria(critData.criteria);
      if (tmplData?.templates && Array.isArray(tmplData.templates)) setTemplates(tmplData.templates);
      if (gradeData?.gradingScales && Array.isArray(gradeData.gradingScales)) setGradingScales(gradeData.gradingScales);
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi tải dữ liệu hệ thống!');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login Handler
  const handleLogin = async (values: { username: string; password: string }) => {
    setLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        message.success(data.message || 'Đăng nhập thành công!');
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        setSession(meData.user || data.user);
        fetchData();
      } else {
        message.error(data.error || 'Đăng nhập thất bại');
      }
    } catch {
      message.error('Lỗi kết nối máy chủ');
    } finally {
      setLoggingIn(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
      setEmployees([]);
      setDepartments([]);
      setPositions([]);
      setOrgChart([]);
      setCriteria([]);
      setTemplates([]);
      setGradingScales([]);
      message.info('Đã đăng xuất khỏi hệ thống');
    } catch {
      message.error('Lỗi đăng xuất');
    }
  };

  // Change Password Handler
  const handleChangePassword = async () => {
    try {
      const values = await changePasswordForm.validateFields();
      setChangingPassword(true);
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok) {
        message.success(data.message || 'Đổi mật khẩu thành công!');
        setChangePasswordModalOpen(false);
        changePasswordForm.resetFields();
      } else {
        message.error(data.error || 'Đổi mật khẩu thất bại');
      }
    } catch {
      // Form validation error
    } finally {
      setChangingPassword(false);
    }
  };

  // Reset Password for Employee (HR Only)
  const handleResetPassword = async (empId: number) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId }),
      });
      const data = await res.json();
      if (res.ok) {
        message.success(data.message || 'Đã cấp lại mật khẩu mặc định: password123');
      } else {
        message.error(data.error || 'Lỗi cấp lại mật khẩu');
      }
    } catch {
      message.error('Lỗi kết nối');
    }
  };

  // GSAP Entrance & Floating Animation for Login Hero Showcase
  useEffect(() => {
    if (session) return;
    const ctx = gsap.context(() => {
      gsap.from('.gsap-hero-title', {
        opacity: 0,
        y: 25,
        duration: 0.9,
        ease: 'power3.out',
      });
      gsap.from('.gsap-hero-sub', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
      });
      gsap.from('.gsap-badge-group', {
        opacity: 0,
        y: 15,
        duration: 0.7,
        delay: 0.35,
        ease: 'power3.out',
      });
      gsap.from('.gsap-float-card-1', {
        opacity: 0,
        scale: 0.85,
        y: 30,
        duration: 0.9,
        delay: 0.5,
        ease: 'back.out(1.5)',
      });
      gsap.from('.gsap-float-card-2', {
        opacity: 0,
        scale: 0.85,
        y: 30,
        duration: 0.9,
        delay: 0.65,
        ease: 'back.out(1.5)',
      });

      // Smooth Infinite Floating
      gsap.to('.gsap-float-card-1', {
        y: -12,
        repeat: -1,
        yoyo: true,
        duration: 3.8,
        ease: 'sine.inOut',
      });
      gsap.to('.gsap-float-card-2', {
        y: 12,
        repeat: -1,
        yoyo: true,
        duration: 4.4,
        ease: 'sine.inOut',
        delay: 0.5,
      });
    }, heroShowcaseRef);

    return () => ctx.revert();
  }, [session]);

  // Initial Authentication Check
  useEffect(() => {
    let ignore = false;

    async function checkAuthSession() {
      setLoading(true);
      try {
        const sessionRes = await fetch('/api/auth/me');
        const sessionData = await sessionRes.json();

        if (ignore) return;

        if (sessionData?.user) {
          setSession(sessionData.user);
          fetchData();
        } else {
          setSession(null);
        }
      } catch (e) {
        if (!ignore) {
          console.error('Session check error:', e);
          setSession(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    checkAuthSession();

    return () => {
      ignore = true;
    };
  }, [fetchData]);

  // ==========================================
  // EMPLOYEE CRUD HANDLERS
  // ==========================================
  const handleOpenEmployeeModal = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      employeeForm.setFieldsValue({
        code: emp.code,
        fullName: emp.fullName,
        email: emp.email,
        phone: emp.phone,
        departmentId: emp.departmentId,
        positionId: emp.positionId,
        managerId: emp.managerId || undefined,
        role: emp.role,
      });
    } else {
      setEditingEmployee(null);
      employeeForm.resetFields();
      employeeForm.setFieldsValue({
        role: 'EMPLOYEE',
      });
    }
    setEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async () => {
    try {
      const values = await employeeForm.validateFields();
      const isEdit = !!editingEmployee;
      const url = isEdit ? `/api/employees/${editingEmployee.id}` : '/api/employees';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (res.ok) {
        message.success(isEdit ? 'Cập nhật nhân viên thành công!' : 'Thêm mới nhân viên thành công!');
        setEmployeeModalOpen(false);
        fetchData();
      } else {
        message.error(data.error || 'Thao tác không thành công');
      }
    } catch {
      // Form validation error
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        message.success('Đã xóa nhân sự!');
        fetchData();
      } else {
        message.error(data.error || 'Lỗi khi xóa nhân sự');
      }
    } catch {
      message.error('Lỗi kết nối');
    }
  };

  // ==========================================
  // DEPARTMENT CRUD HANDLERS
  // ==========================================
  const handleOpenDeptModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      deptForm.setFieldsValue({ name: dept.name, code: dept.code });
    } else {
      setEditingDept(null);
      deptForm.resetFields();
    }
    setDeptModalOpen(true);
  };

  const handleSaveDept = async () => {
    try {
      const values = await deptForm.validateFields();
      const isEdit = !!editingDept;
      const url = isEdit ? `/api/departments/${editingDept.id}` : '/api/departments';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (res.ok) {
        message.success(isEdit ? 'Cập nhật phòng ban thành công!' : 'Thêm mới phòng ban thành công!');
        setDeptModalOpen(false);
        fetchData();
      } else {
        message.error(data.error || 'Lỗi lưu phòng ban');
      }
    } catch {
      // Validation error
    }
  };

  const handleDeleteDept = async (id: number) => {
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        message.success('Đã xóa phòng ban!');
        fetchData();
      } else {
        message.error(data.error || 'Lỗi xóa phòng ban');
      }
    } catch {
      message.error('Lỗi kết nối');
    }
  };

  // ==========================================
  // POSITION CRUD HANDLERS
  // ==========================================
  const handleOpenPosModal = (pos?: Position) => {
    if (pos) {
      setEditingPos(pos);
      posForm.setFieldsValue({ name: pos.name, code: pos.code });
    } else {
      setEditingPos(null);
      posForm.resetFields();
    }
    setPosModalOpen(true);
  };

  const handleSavePos = async () => {
    try {
      const values = await posForm.validateFields();
      const isEdit = !!editingPos;
      const url = isEdit ? `/api/positions/${editingPos.id}` : '/api/positions';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (res.ok) {
        message.success(isEdit ? 'Cập nhật chức vụ thành công!' : 'Thêm mới chức vụ thành công!');
        setPosModalOpen(false);
        fetchData();
      } else {
        message.error(data.error || 'Lỗi lưu chức vụ');
      }
    } catch {
      // Validation error
    }
  };

  const handleDeletePos = async (id: number) => {
    try {
      const res = await fetch(`/api/positions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        message.success('Đã xóa chức vụ!');
        fetchData();
      } else {
        message.error(data.error || 'Lỗi xóa chức vụ');
      }
    } catch {
      message.error('Lỗi kết nối');
    }
  };

  // ==========================================
  // EXCEL IMPORT & EXPORT
  // ==========================================
  const handleDownloadTemplate = () => {
    window.open('/api/employees/template', '_blank');
  };

  const handleImportExcel = async () => {
    if (fileList.length === 0) {
      message.warning('Vui lòng chọn file Excel để import!');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0] as unknown as Blob);

    setImporting(true);
    try {
      const res = await fetch('/api/employees/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult(data);
        message.success(`Đã import thành công ${data.successCount} nhân viên!`);
        fetchData();
      } else {
        message.error(data.error || 'Import thất bại');
      }
    } catch {
      message.error('Lỗi kết nối máy chủ khi import');
    } finally {
      setImporting(false);
    }
  };

  // ==========================================
  // US-02: CRITERIA CRUD HANDLERS
  // ==========================================
  const parseBehaviorGuide = (guideStr?: string | null): BehaviorGuide => {
    if (!guideStr) return {};
    try {
      return JSON.parse(guideStr);
    } catch {
      return {};
    }
  };

  const handleOpenCriterionModal = (crit?: Criterion) => {
    if (crit) {
      setEditingCriterion(crit);
      const bg = parseBehaviorGuide(crit.behaviorGuide);
      criterionForm.setFieldsValue({
        name: crit.name,
        category: crit.category,
        description: crit.description,
        level1: bg.level1 || '',
        level2: bg.level2 || '',
        level3: bg.level3 || '',
        level4: bg.level4 || '',
        level5: bg.level5 || '',
      });
    } else {
      setEditingCriterion(null);
      criterionForm.resetFields();
      criterionForm.setFieldsValue({
        category: 'KPI',
      });
    }
    setCriterionModalOpen(true);
  };

  const handleSaveCriterion = async () => {
    try {
      const values = await criterionForm.validateFields();
      setSavingCriterion(true);

      const behaviorGuide = {
        level1: values.level1?.trim() || 'Chưa hoàn thành chỉ tiêu, vi phạm quy trình hoặc cần giám sát liên tục.',
        level2: values.level2?.trim() || 'Đạt một phần chỉ tiêu, cần hỗ trợ thường xuyên từ quản lý.',
        level3: values.level3?.trim() || 'Hoàn thành đầy đủ chỉ tiêu công việc theo chuẩn quy định.',
        level4: values.level4?.trim() || 'Hoàn thành vượt chỉ tiêu, chủ động đề xuất sáng kiến tối ưu.',
        level5: values.level5?.trim() || 'Xuất sắc vượt bậc, dẫn dắt đội ngũ và là hình mẫu tiêu biểu.',
      };

      const payload = {
        name: values.name.trim(),
        category: values.category,
        description: values.description?.trim() || null,
        behaviorGuide: JSON.stringify(behaviorGuide),
      };

      const isEdit = !!editingCriterion;
      const url = isEdit ? `/api/criteria/${editingCriterion.id}` : '/api/criteria';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        message.success(isEdit ? 'Cập nhật tiêu chí thành công!' : 'Tạo mới tiêu chí thành công!');
        setCriterionModalOpen(false);
        fetchData();
      } else {
        message.error(data.error || 'Lỗi khi lưu tiêu chí');
      }
    } catch {
      // Form validation error
    } finally {
      setSavingCriterion(false);
    }
  };

  const handleDeleteCriterion = async (id: number) => {
    try {
      const res = await fetch(`/api/criteria/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        message.success('Đã xóa tiêu chí khỏi kho chuẩn!');
        fetchData();
      } else {
        message.error(data.error || 'Lỗi xóa tiêu chí');
      }
    } catch {
      message.error('Lỗi kết nối máy chủ');
    }
  };

  const handleOpenBehaviorDrawer = (crit: Criterion) => {
    setViewingCriterion(crit);
    setBehaviorDrawerOpen(true);
  };

  // ==========================================
  // US-02: TEMPLATES CRUD & BUILDER HANDLERS
  // ==========================================
  const handleOpenTemplateModal = (tmpl?: AppraisalTemplate) => {
    if (tmpl) {
      setEditingTemplate(tmpl);
      templateForm.setFieldsValue({
        name: tmpl.name,
        positionId: tmpl.positionId,
        description: tmpl.description,
      });
      setTemplateItemsDraft(
        tmpl.items.map((it) => ({
          criterionId: it.criterionId,
          weight: it.weight,
        }))
      );
    } else {
      setEditingTemplate(null);
      templateForm.resetFields();
      if (criteria.length > 0) {
        // Pre-select first 4 criteria with equal weight
        const initial = criteria.slice(0, 4).map((c, _, arr) => ({
          criterionId: c.id,
          weight: Math.round(100 / arr.length),
        }));
        setTemplateItemsDraft(initial);
      } else {
        setTemplateItemsDraft([]);
      }
    }
    setTemplateModalOpen(true);
  };

  // Real-time Total Weight calculation
  const currentTotalWeight = useMemo(() => {
    return templateItemsDraft.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
  }, [templateItemsDraft]);

  const isTotalWeightValid = useMemo(() => {
    return Math.abs(currentTotalWeight - 100) <= 0.01;
  }, [currentTotalWeight]);

  // Auto-balance weights equally among selected items
  const handleAutoBalanceWeights = () => {
    const len = templateItemsDraft.length;
    if (len === 0) return;
    const baseWeight = Math.floor(100 / len);
    const remainder = 100 - baseWeight * len;

    const updated = templateItemsDraft.map((item, idx) => ({
      ...item,
      weight: idx === 0 ? baseWeight + remainder : baseWeight,
    }));
    setTemplateItemsDraft(updated);
    message.success(`Đã tự động cân đối đều trọng số cho ${len} tiêu chí = 100%!`);
  };

  const handleAddCriterionToDraft = (criterionId: number) => {
    if (templateItemsDraft.some((item) => item.criterionId === criterionId)) {
      message.warning('Tiêu chí này đã có trong mẫu phiếu!');
      return;
    }
    setTemplateItemsDraft([...templateItemsDraft, { criterionId, weight: 10 }]);
  };

  const handleRemoveCriterionFromDraft = (criterionId: number) => {
    setTemplateItemsDraft(templateItemsDraft.filter((item) => item.criterionId !== criterionId));
  };

  const handleUpdateWeightInDraft = (criterionId: number, weight: number) => {
    setTemplateItemsDraft(
      templateItemsDraft.map((item) =>
        item.criterionId === criterionId ? { ...item, weight: Number(weight) || 0 } : item
      )
    );
  };

  const handleSaveTemplate = async () => {
    try {
      const values = await templateForm.validateFields();

      if (templateItemsDraft.length === 0) {
        message.error('Mẫu phiếu phải có ít nhất một tiêu chí đánh giá!');
        return;
      }

      if (!isTotalWeightValid) {
        message.error(
          `Ràng buộc nghiệp vụ: Tổng tỷ lệ trọng số phải bằng đúng 100%! Hiện tại là ${currentTotalWeight.toFixed(
            1
          )}%. Vui lòng điều chỉnh hoặc dùng nút "Cân đối đều trọng số"!`
        );
        return;
      }

      setSavingTemplate(true);
      const payload = {
        name: values.name.trim(),
        positionId: values.positionId,
        description: values.description?.trim() || null,
        items: templateItemsDraft,
      };

      const isEdit = !!editingTemplate;
      const url = isEdit ? `/api/templates/${editingTemplate.id}` : '/api/templates';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        message.success(isEdit ? 'Cập nhật mẫu phiếu đánh giá thành công!' : 'Tạo mới mẫu phiếu đánh giá thành công!');
        setTemplateModalOpen(false);
        fetchData();
      } else {
        message.error(data.error || 'Lỗi khi lưu mẫu phiếu');
      }
    } catch {
      // Form validation error
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        message.success('Đã xóa mẫu phiếu đánh giá!');
        fetchData();
      } else {
        message.error(data.error || 'Lỗi xóa mẫu phiếu');
      }
    } catch {
      message.error('Lỗi kết nối máy chủ');
    }
  };

  const handlePreviewTemplate = (tmpl: AppraisalTemplate) => {
    setPreviewTemplate(tmpl);
    setPreviewModalOpen(true);
  };

  // ==========================================
  // US-02: GRADING SCALES HANDLERS
  // ==========================================
  const handleOpenScaleModal = (scale: GradingScale) => {
    setEditingScale(scale);
    scaleForm.setFieldsValue({
      grade: scale.grade,
      minScore: scale.minScore,
      maxScore: scale.maxScore,
      description: scale.description,
    });
    setGradingModalOpen(true);
  };

  const handleSaveScale = async () => {
    if (!editingScale) return;
    try {
      const values = await scaleForm.validateFields();
      setSavingScale(true);

      const res = await fetch(`/api/grading-scales/${editingScale.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minScore: values.minScore,
          maxScore: values.maxScore,
          description: values.description,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        message.success(data.message || 'Cập nhật thang điểm xếp loại thành công!');
        setGradingModalOpen(false);
        fetchData();
      } else {
        message.error(data.error || 'Lỗi cập nhật thang điểm');
      }
    } catch {
      // Form validation error
    } finally {
      setSavingScale(false);
    }
  };

  // ==========================================
  // FILTERED DATA SETS
  // ==========================================
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        searchText === '' ||
        emp.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.code.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (emp.phone && emp.phone.includes(searchText));

      const matchDept = selectedDept === 'all' || String(emp.departmentId) === selectedDept;
      const matchPos = selectedPos === 'all' || String(emp.positionId) === selectedPos;

      return matchSearch && matchDept && matchPos;
    });
  }, [employees, searchText, selectedDept, selectedPos]);

  const filteredCriteria = useMemo(() => {
    return criteria.filter((c) => {
      const matchCategory = selectedCriterionCategory === 'ALL' || c.category === selectedCriterionCategory;
      const matchSearch =
        criterionSearchText === '' ||
        c.name.toLowerCase().includes(criterionSearchText.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(criterionSearchText.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [criteria, selectedCriterionCategory, criterionSearchText]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (selectedTemplatePosition === 'all') return true;
      return String(t.positionId) === selectedTemplatePosition;
    });
  }, [templates, selectedTemplatePosition]);

  const managerSubordinates = useMemo(() => {
    if (!session?.employeeId) return [];
    return employees.filter((e) => e.managerId === session.employeeId);
  }, [employees, session]);

  const stats = useMemo(() => {
    const total = employees.length;
    const withManager = employees.filter((e) => e.managerId !== null).length;
    const managers = employees.filter(
      (e) => e.role === 'MANAGER' || (e.subordinateCount && e.subordinateCount > 0)
    ).length;
    const routingRate = total > 0 ? Math.round((withManager / total) * 100) : 0;
    return { total, withManager, managers, routingRate };
  }, [employees]);

  // Criteria Category Counts
  const criteriaStats = useMemo(() => {
    const kpiCount = criteria.filter((c) => c.category === 'KPI').length;
    const compCount = criteria.filter((c) => c.category === 'NĂNG LỰC').length;
    const attCount = criteria.filter((c) => c.category === 'THÁI ĐỘ').length;
    return { total: criteria.length, kpiCount, compCount, attCount };
  }, [criteria]);

  // ==========================================
  // TABLE COLUMNS - EMPLOYEES
  // ==========================================
  const employeeColumns: ColumnsType<Employee> = [
    {
      title: 'Mã NV',
      dataIndex: 'code',
      key: 'code',
      width: 110,
      render: (code: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs">
          {code}
        </span>
      ),
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string, record: Employee) => (
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => {
            setViewEmployee(record);
            setDetailDrawerOpen(true);
          }}
        >
          <div className="relative">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform duration-200 group-hover:scale-105 ${
                record.role === 'HR'
                  ? 'bg-gradient-to-tr from-rose-500 to-red-400'
                  : record.role === 'MANAGER'
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-500'
                  : 'bg-gradient-to-tr from-emerald-500 to-teal-400'
              }`}
            >
              {name.charAt(0)}
            </div>
            {record.role === 'MANAGER' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs">
                <Crown className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              {name}
            </div>
            <div className="text-xs text-slate-400 font-normal">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Phòng ban',
      dataIndex: ['department', 'name'],
      key: 'department',
      render: (deptName: string, record: Employee) => (
        <div className="flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-700 text-xs">{deptName}</span>
          <span className="text-[10px] font-mono text-slate-400">({record.department.code})</span>
        </div>
      ),
    },
    {
      title: 'Chức danh',
      dataIndex: ['position', 'name'],
      key: 'position',
      render: (posName: string) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {posName}
        </span>
      ),
    },
    {
      title: 'Quản lý trực tiếp (managerId)',
      dataIndex: 'manager',
      key: 'manager',
      render: (manager: Employee['manager'], record: Employee) => {
        if (!manager) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              Chưa gán cấp trên
            </span>
          );
        }
        return (
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <div>
              <span className="font-medium text-slate-700 text-xs">{manager.fullName}</span>
              <span className="text-[10px] font-mono text-slate-400 ml-1">({manager.code})</span>
            </div>
            {record.subordinateCount && record.subordinateCount > 0 ? (
              <Badge count={`+${record.subordinateCount}`} style={{ backgroundColor: '#4f46e5' }} />
            ) : null}
          </div>
        );
      },
    },
    {
      title: 'Vai trò (RBAC)',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: string) => {
        const isHr = role === 'HR';
        const isMgr = role === 'MANAGER';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isHr
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : isMgr
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isHr ? 'bg-rose-500' : isMgr ? 'bg-blue-500' : 'bg-emerald-500'
              }`}
            />
            {isHr ? 'Hội đồng HR' : isMgr ? 'Trưởng phòng' : 'Nhân viên'}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_: unknown, record: Employee) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết hồ sơ">
            <Button
              type="text"
              size="small"
              icon={<Eye className="w-4 h-4 text-slate-600 hover:text-blue-600" />}
              onClick={() => {
                setViewEmployee(record);
                setDetailDrawerOpen(true);
              }}
            />
          </Tooltip>
          {session?.role === 'HR' && (
            <>
              <Tooltip title="Chỉnh sửa thông tin">
                <Button
                  type="text"
                  size="small"
                  icon={<Edit3 className="w-4 h-4 text-blue-600" />}
                  onClick={() => handleOpenEmployeeModal(record)}
                />
              </Tooltip>
              <Tooltip title="Cấp lại mật khẩu (password123)">
                <Popconfirm
                  title="Cấp lại mật khẩu?"
                  description={`Đặt lại mật khẩu mặc định (password123) cho "${record.fullName}"?`}
                  onConfirm={() => handleResetPassword(record.id)}
                  okText="Cấp lại"
                  cancelText="Hủy"
                >
                  <Button type="text" size="small" icon={<KeyRound className="w-4 h-4 text-amber-500" />} />
                </Popconfirm>
              </Tooltip>
              <Tooltip title="Xóa nhân sự">
                <Popconfirm
                  title="Xóa nhân viên này?"
                  description={`Bạn có chắc muốn xóa "${record.fullName}" (${record.code})?`}
                  onConfirm={() => handleDeleteEmployee(record.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button type="text" size="small" icon={<Trash2 className="w-4 h-4 text-rose-500" />} />
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  // ==========================================
  // TABLE COLUMNS - CRITERIA (US-02)
  // ==========================================
  const criteriaColumns: ColumnsType<Criterion> = [
    {
      title: 'Nhóm cốt lõi',
      dataIndex: 'category',
      key: 'category',
      width: 160,
      render: (cat: string) => {
        if (cat === 'KPI') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              Kết quả (KPI)
            </span>
          );
        }
        if (cat === 'NĂNG LỰC') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              Năng lực chuyên môn
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Thái độ kỷ luật
          </span>
        );
      },
    },
    {
      title: 'Tên tiêu chí đánh giá',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Criterion) => (
        <div>
          <div className="font-bold text-slate-800 text-sm hover:text-blue-600 cursor-pointer" onClick={() => handleOpenBehaviorDrawer(record)}>
            {name}
          </div>
          {record.description && (
            <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Thư viện thang đo Rubric',
      key: 'rubric',
      width: 170,
      align: 'center',
      render: (_: unknown, record: Criterion) => (
        <Button
          size="small"
          icon={<Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
          className="rounded-lg text-xs font-medium border-amber-200 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-100/50 text-amber-900"
          onClick={() => handleOpenBehaviorDrawer(record)}
        >
          Thang 5 mức độ
        </Button>
      ),
    },
    {
      title: 'Áp dụng',
      key: 'usage',
      width: 120,
      align: 'center',
      render: (_: unknown, record: Criterion) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {record._count?.templateItems || 0} mẫu phiếu
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_: unknown, record: Criterion) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa tiêu chí">
            <Button
              type="text"
              size="small"
              icon={<Edit3 className="w-4 h-4 text-blue-600" />}
              onClick={() => handleOpenCriterionModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa tiêu chí">
            <Popconfirm
              title="Xóa tiêu chí này?"
              description="Không thể xóa tiêu chí đang được sử dụng trong các Mẫu phiếu đánh giá."
              onConfirm={() => handleDeleteCriterion(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" size="small" icon={<Trash2 className="w-4 h-4 text-rose-500" />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ==========================================
  // RENDER: CINEMATIC SPLIT LOGIN SCREEN
  // ==========================================
  if (!session) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50/60 flex flex-col lg:flex-row relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
        <ConstellationBackground />

        <div className="absolute -top-36 -left-36 w-[650px] h-[650px] bg-gradient-to-br from-blue-400/20 via-indigo-300/15 to-transparent rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 -right-36 w-[600px] h-[600px] bg-gradient-to-tl from-purple-300/20 via-pink-200/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-36 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-300/15 via-blue-200/15 to-transparent rounded-full blur-[130px] pointer-events-none" />

        {/* Left Hero Showcase */}
        <div
          ref={heroShowcaseRef}
          className="flex-1 relative z-10 p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-2 ring-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base tracking-tight">PMS ENTERPRISE</div>
              <div className="text-xs text-slate-500 font-medium">Hệ thống đánh giá & xếp loại hiệu suất nhân sự</div>
            </div>
          </div>

          <div className="my-12 lg:my-0 max-w-xl">
            <div className="gsap-badge-group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-xs backdrop-blur-md">
              <Award className="w-3.5 h-3.5 text-blue-600" /> Nền tảng đánh giá doanh nghiệp chuẩn 2026
            </div>

            <h1 className="gsap-hero-title text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Định chuẩn hiệu suất, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                nâng tầm đội ngũ nhân sự
              </span>
            </h1>

            <p className="gsap-hero-sub text-slate-600 text-sm sm:text-base mt-4 leading-relaxed font-normal">
              Quy chuẩn hóa toàn diện 14 phòng ban, định tuyến phê duyệt KPI trực tiếp qua{' '}
              <code className="text-blue-700 font-mono text-xs px-2 py-0.5 rounded-md bg-blue-100/70 border border-blue-200 font-semibold">
                managerId
              </code>
              , chấm điểm đối chiếu 3 cột song song và bảo mật xác thực chuẩn RBAC JWT.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="gsap-float-card-1 p-5 rounded-3xl bg-white/85 border border-white/90 backdrop-blur-xl shadow-xl shadow-blue-500/8 hover:shadow-blue-500/15 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Users className="w-4 h-4 text-blue-600" /> Cơ cấu nhân sự
                  </div>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                </div>
                <div className="text-2xl font-black text-slate-900">120+ nhân viên</div>
                <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1.5">
                  <Check className="w-3.5 h-3.5" /> Đã đồng bộ 14 phòng ban
                </div>
              </div>

              <div className="gsap-float-card-2 p-5 rounded-3xl bg-white/85 border border-white/90 backdrop-blur-xl shadow-xl shadow-indigo-500/8 hover:shadow-indigo-500/15 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" /> Xác thực & phân quyền
                  </div>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                </div>
                <div className="text-2xl font-black text-slate-900">3 nhóm vai trò</div>
                <div className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 mt-1.5">
                  <Fingerprint className="w-3.5 h-3.5" /> Mã định danh JWT HS256
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center justify-between pt-6 border-t border-slate-200/60">
            <span>© 2026 Enterprise Corp. PMS System</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Sẵn sàng vận hành
            </span>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="w-full lg:w-[480px] xl:w-[520px] relative z-10 flex items-center justify-center p-6 lg:p-12 bg-white/40 lg:bg-white/30 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 p-7 sm:p-9 border border-slate-200/90 relative overflow-hidden backdrop-blur-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 text-blue-600 mx-auto flex items-center justify-center font-bold text-xl mb-3 border border-blue-100 shadow-xs">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Đăng nhập hệ thống</h2>
              <p className="text-xs text-slate-500 mt-1">
                Nhập thông tin tài khoản công ty để truy cập bảng điều khiển
              </p>
            </div>

            <Form form={loginForm} layout="vertical" onFinish={handleLogin}>
              <Form.Item
                name="username"
                label={<span className="text-xs font-bold text-slate-700">Tên đăng nhập / Mã nhân viên</span>}
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
              >
                <Input
                  prefix={<Users className="w-4 h-4 text-slate-400 mr-1.5" />}
                  placeholder="VD: hr_council, mgr_it, emp_nv0001..."
                  className="h-11 rounded-xl text-sm"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="text-xs font-bold text-slate-700">Mật khẩu</span>}
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password
                  prefix={<Lock className="w-4 h-4 text-slate-400 mr-1.5" />}
                  placeholder="Nhập mật khẩu..."
                  className="h-11 rounded-xl text-sm"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loggingIn}
                className="h-11 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none shadow-lg shadow-blue-500/25 mt-2 transition-transform active:scale-[0.99]"
              >
                Đăng nhập <ArrowRight className="w-4 h-4 inline-block ml-1" />
              </Button>
            </Form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Hệ thống xác thực JWT bảo mật
              </span>
              <span>Phiên bản Enterprise</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN APPLICATION (ENTERPRISE UI)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 relative selection:bg-blue-500 selection:text-white">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent blur-2xl pointer-events-none" />

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 px-6 h-[68px] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/25 ring-1 ring-white/40">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                  PMS ENTERPRISE
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                  PRO EDITION
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Hệ thống đánh giá & quản trị hiệu suất toàn diện
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center">
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Kỳ đánh giá:</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
                  Quý 1 / 2026
                </span>
              </div>
              <div className="w-px h-3.5 bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  Đang diễn ra (Active)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
            <Avatar
              size={36}
              className={`font-bold text-xs shadow-xs ring-2 ${
                session.role === 'HR'
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white ring-indigo-200'
                  : session.role === 'MANAGER'
                  ? 'bg-gradient-to-tr from-blue-600 to-cyan-600 text-white ring-blue-200'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white ring-emerald-200'
              }`}
            >
              {session.fullName.charAt(0)}
            </Avatar>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                {session.fullName}
                {session.code && (
                  <span className="text-[10px] font-medium text-slate-400 font-mono">
                    ({session.code})
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                {session.role === 'HR' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    Hội đồng nhân sự & đánh giá
                  </span>
                )}
                {session.role === 'MANAGER' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
                    <Crown className="w-3 h-3 text-blue-600" />
                    Trưởng bộ phận {session.department?.name ? `• ${session.department.name}` : ''}
                  </span>
                )}
                {session.role === 'EMPLOYEE' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                    Nhân viên {session.department?.name ? `• ${session.department.name}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
            <Tooltip title="Xem & tải tài liệu kỹ thuật hệ thống">
              <Button
                type="text"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/80 transition-colors"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => window.open('/api/docs/download?format=html', '_blank')}
              />
            </Tooltip>

            <Tooltip title="Đổi mật khẩu tài khoản">
              <Button
                type="text"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50/80 transition-colors"
                icon={<KeyRound className="w-4 h-4" />}
                onClick={() => setChangePasswordModalOpen(true)}
              />
            </Tooltip>

            <Popconfirm
              title="Xác nhận đăng xuất"
              description="Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc hiện tại?"
              okText="Đăng xuất"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={handleLogout}
            >
              <Tooltip title="Đăng xuất">
                <Button
                  type="text"
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 transition-colors"
                  icon={<LogOut className="w-4 h-4" />}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* ========================================================
            VIEW FOR EMPLOYEE ROLE (NHÂN VIÊN)
            ======================================================== */}
        {session.role === 'EMPLOYEE' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xl border border-emerald-500/20">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">
                      Hồ sơ cá nhân & định tuyến phê duyệt của tôi
                    </h2>
                    <p className="text-xs text-slate-500">
                      Căn cứ phân cấp để hệ thống tự động chuyển phiếu đăng ký KPI và chấm điểm cuối kỳ.
                    </p>
                  </div>
                </div>
                <Tag color="green" className="text-xs font-semibold px-3 py-1 rounded-full">
                  Vai trò: Nhân viên
                </Tag>
              </div>

              <Descriptions bordered column={2} size="small" className="bg-white/60 rounded-xl overflow-hidden">
                <Descriptions.Item label="Mã nhân viên">
                  <span className="font-mono font-bold text-blue-600">{session.code || 'NV0001'}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Họ và tên">
                  <span className="font-semibold text-slate-800">{session.fullName}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Email doanh nghiệp">
                  {session.email || 'emp@pms.corp'}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {session.phone || 'Chưa cập nhật'}
                </Descriptions.Item>
                <Descriptions.Item label="Phòng ban">
                  <span className="font-medium text-slate-700">{session.department?.name || 'Phòng ban trực thuộc'}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Chức danh">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    {session.position?.name || 'Chuyên viên'}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div whileHover={{ y: -2 }} className="glass-card p-6 rounded-2xl border-amber-200/80 bg-gradient-to-br from-white to-amber-50/40">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-3">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Người quản lý trực tiếp (managerId)
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Trưởng bộ phận dưới đây là người có thẩm quyền phê duyệt bảng đăng ký mục tiêu KPI đầu kỳ và chấm điểm đối chiếu cuối kỳ cho bạn:
                </p>
                <div className="p-4 bg-white/80 rounded-xl border border-amber-200 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="font-bold text-slate-800 text-base">
                      {session.manager?.fullName || 'Trưởng phòng Bộ phận IT'}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Mã: {session.manager?.code || 'MGR003'} • {session.manager?.email || 'mgr_it@pms.corp'}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    Cấp duyệt trực tiếp
                  </span>
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="glass-card p-6 rounded-2xl border-indigo-200/80 bg-gradient-to-br from-white to-indigo-50/40">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-3">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Kho tiêu chí Rubric & thang điểm (US-02)
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Tìm hiểu thang đo hành vi 5 mức độ và mẫu phiếu đánh giá áp dụng cho chức danh của bạn để chủ động nâng cao hiệu suất:
                </p>
                <Button
                  icon={<Search className="w-4 h-4" />}
                  type="primary"
                  className="rounded-xl bg-indigo-600 font-semibold"
                  onClick={() => setRubricLookupOpen(true)}
                >
                  Tra cứu tiêu chí Rubric chuẩn
                </Button>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-3">
                  <Lock className="w-4 h-4 text-blue-500" />
                  Bảo mật & mật khẩu cá nhân
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Tài khoản đăng nhập được bảo mật bằng mã định danh JWT. Bạn có thể tự đổi mật khẩu mới để đảm bảo an toàn cho hồ sơ đánh giá.
                </p>
                <Button
                  icon={<KeyRound className="w-4 h-4" />}
                  type="default"
                  className="rounded-xl border-slate-300"
                  onClick={() => setChangePasswordModalOpen(true)}
                >
                  Đổi mật khẩu tài khoản
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ========================================================
            VIEW FOR MANAGER ROLE (TRƯỞNG BỘ PHẬN)
            ======================================================== */}
        {session.role === 'MANAGER' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-1">Phòng ban phụ trách</div>
                  <div className="text-base font-bold text-slate-800">
                    {session.department?.name || 'Phòng Công nghệ & Kỹ thuật (IT)'}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-1">Cấp dưới trực tiếp (managerId)</div>
                  <div className="text-2xl font-black text-slate-800 flex items-baseline gap-1">
                    {managerSubordinates.length}
                    <span className="text-xs font-normal text-slate-400">nhân sự</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-1">Kho tiêu chí chuẩn</div>
                  <div className="text-2xl font-black text-purple-600 flex items-baseline gap-1">
                    {criteria.length}
                    <span className="text-xs font-normal text-slate-400">tiêu chí</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-1">Tra cứu Rubric & thang điểm</div>
                  <Button
                    size="small"
                    type="primary"
                    icon={<Search className="w-3.5 h-3.5" />}
                    onClick={() => setRubricLookupOpen(true)}
                    className="rounded-lg bg-indigo-600 mt-1 text-xs"
                  >
                    Xem thư viện
                  </Button>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Danh sách nhân viên thuộc thẩm quyền phê duyệt ({managerSubordinates.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Những nhân sự này được liên kết qua khóa managerId tới tài khoản của bạn.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  managerId = {session.employeeId || 'MGR'}
                </span>
              </div>

              <Table
                dataSource={managerSubordinates.map((sub) => ({ ...sub, key: sub.id }))}
                columns={[
                  {
                    title: 'Mã NV',
                    dataIndex: 'code',
                    key: 'code',
                    render: (code: string) => (
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {code}
                      </span>
                    ),
                  },
                  {
                    title: 'Họ và tên',
                    dataIndex: 'fullName',
                    key: 'fullName',
                    render: (name: string, record: Employee) => (
                      <div>
                        <div className="font-semibold text-slate-800">{name}</div>
                        <div className="text-xs text-slate-400">{record.email}</div>
                      </div>
                    ),
                  },
                  {
                    title: 'Chức danh',
                    dataIndex: ['position', 'name'],
                    key: 'position',
                    render: (pos: string) => <Tag color="cyan">{pos}</Tag>,
                  },
                  {
                    title: 'Số điện thoại',
                    dataIndex: 'phone',
                    key: 'phone',
                    render: (phone: string) => phone || '—',
                  },
                  {
                    title: 'Thao tác',
                    key: 'action',
                    render: (_: unknown, record: Employee) => (
                      <Button
                        size="small"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        className="rounded-lg"
                        onClick={() => {
                          setViewEmployee(record);
                          setDetailDrawerOpen(true);
                        }}
                      >
                        Hồ sơ
                      </Button>
                    ),
                  },
                ]}
                pagination={{ pageSize: 8 }}
              />
            </div>
          </motion.div>
        )}

        {/* ========================================================
            VIEW FOR HR COUNCIL (HỘI ĐỒNG NHÂN SỰ TOÀN QUYỀN)
            ======================================================== */}
        {session.role === 'HR' && (
          <div className="space-y-6">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-5 rounded-2xl relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Tổng nhân sự
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                      {stats.total}
                    </div>
                    <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" /> 100% tài khoản hoạt động
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-5 rounded-2xl relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Kho tiêu chí Rubric
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                      {criteriaStats.total}
                    </div>
                    <div className="text-xs text-indigo-600 font-medium mt-1">
                      3 nhóm cốt lõi chuẩn
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-5 rounded-2xl relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Mẫu phiếu đánh giá
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                      {templates.length}
                    </div>
                    <div className="text-xs text-amber-600 font-medium mt-1">
                      100% trọng số chuẩn hóa
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-5 rounded-2xl relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Tỷ lệ gán managerId
                    </div>
                    <div className="text-3xl font-black text-emerald-600 mt-1">
                      {stats.routingRate}%
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-1">
                      Định tuyến duyệt KPI
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <GitFork className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Modern Animated Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl w-fit">
              {[
                { key: 'employees', label: 'Quản lý nhân sự', icon: Users, count: employees.length },
                { key: 'departments', label: 'Cơ cấu phòng ban', icon: Building2, count: departments.length },
                { key: 'positions', label: 'Chức danh công việc', icon: Briefcase, count: positions.length },
                { key: 'criteria', label: 'Kho tiêu chí Rubric', icon: Target, count: criteria.length },
                { key: 'templates', label: 'Mẫu phiếu đánh giá', icon: FileSpreadsheet, count: templates.length },
                { key: 'grading_scales', label: 'Thang điểm xếp loại', icon: Award, count: gradingScales.length },
                { key: 'org_chart', label: 'Sơ đồ phân cấp managerId', icon: GitFork, count: null },
              ].map((tab) => {
                const active = activeTab === tab.key;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`relative px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 ${
                      active ? 'text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeSubTabIndicator"
                        className="absolute inset-0 bg-white rounded-xl"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <IconComponent className="w-4 h-4" />
                      {tab.label}
                      {tab.count !== null && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            active ? 'bg-blue-100 text-blue-700' : 'bg-slate-300 text-slate-600'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS */}
            <AnimatePresence mode="wait">
              {/* TAB 1: EMPLOYEES */}
              {activeTab === 'employees' && (
                <motion.div
                  key="employees"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card p-6 rounded-2xl space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                      <div className="relative">
                        <Input
                          placeholder="Tìm theo mã NV, họ tên, email, SĐT..."
                          prefix={<Search className="w-4 h-4 text-slate-400 mr-1" />}
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          allowClear
                          className="w-72 h-10 rounded-xl"
                        />
                      </div>

                      <Select
                        value={selectedDept}
                        onChange={setSelectedDept}
                        className="w-56 h-10"
                        options={[
                          { value: 'all', label: 'Tất cả phòng ban' },
                          ...departments.map((d) => ({
                            value: String(d.id),
                            label: `${d.name} (${d.code})`,
                          })),
                        ]}
                      />

                      <Select
                        value={selectedPos}
                        onChange={setSelectedPos}
                        className="w-48 h-10"
                        options={[
                          { value: 'all', label: 'Tất cả chức danh' },
                          ...positions.map((p) => ({
                            value: String(p.id),
                            label: p.name,
                          })),
                        ]}
                      />

                      <Button
                        icon={<RotateCcw className="w-4 h-4" />}
                        onClick={fetchData}
                        loading={loading}
                        className="h-10 rounded-xl"
                      >
                        Làm mới
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                        onClick={handleDownloadTemplate}
                        className="h-10 rounded-xl font-medium"
                      >
                        Tải file mẫu Excel
                      </Button>
                      <Button
                        icon={<UploadCloud className="w-4 h-4 text-indigo-600" />}
                        onClick={() => {
                          setImportResult(null);
                          setFileList([]);
                          setImportModalOpen(true);
                        }}
                        className="h-10 rounded-xl font-medium"
                      >
                        Import từ Excel
                      </Button>
                      <Button
                        type="primary"
                        icon={<UserPlus className="w-4 h-4" />}
                        onClick={() => handleOpenEmployeeModal()}
                        className="h-10 rounded-xl font-semibold bg-blue-600 shadow-md shadow-blue-500/20"
                      >
                        Thêm nhân viên
                      </Button>
                    </div>
                  </div>

                  <Table
                    columns={employeeColumns}
                    dataSource={filteredEmployees.map((emp) => ({ ...emp, key: emp.id }))}
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showTotal: (total) => `Tổng số ${total} nhân sự`,
                      showSizeChanger: true,
                    }}
                    scroll={{ x: 1000 }}
                    size="middle"
                  />
                </motion.div>
              )}

              {/* TAB 2: DEPARTMENTS */}
              {activeTab === 'departments' && (
                <motion.div
                  key="departments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card p-6 rounded-2xl space-y-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Danh mục 14 phòng ban doanh nghiệp</h3>
                      <p className="text-xs text-slate-500">
                        Cơ cấu tổ chức định nghĩa các đơn vị và Trưởng đơn vị phụ trách trực tiếp.
                      </p>
                    </div>
                    <Button
                      type="primary"
                      icon={<Building2 className="w-4 h-4" />}
                      onClick={() => handleOpenDeptModal()}
                      className="rounded-xl bg-blue-600 h-10 font-semibold"
                    >
                      Thêm phòng ban mới
                    </Button>
                  </div>

                  <Table
                    dataSource={departments.map((d) => ({ ...d, key: d.id }))}
                    columns={[
                      {
                        title: 'Mã PB',
                        dataIndex: 'code',
                        key: 'code',
                        width: 120,
                        render: (code: string) => (
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            {code}
                          </span>
                        ),
                      },
                      {
                        title: 'Tên phòng ban',
                        dataIndex: 'name',
                        key: 'name',
                        render: (name: string) => <span className="font-semibold text-slate-800">{name}</span>,
                      },
                      {
                        title: 'Trưởng bộ phận phụ trách',
                        dataIndex: 'head',
                        key: 'head',
                        render: (head: Department['head']) => {
                          if (!head) {
                            return <Tag color="default">Chưa bổ nhiệm</Tag>;
                          }
                          return (
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-amber-500" />
                              <span className="font-medium text-slate-800">{head.fullName}</span>
                              <span className="text-xs text-slate-400 font-mono">({head.code})</span>
                            </div>
                          );
                        },
                      },
                      {
                        title: 'Nhân sự trực thuộc',
                        dataIndex: 'employeeCount',
                        key: 'employeeCount',
                        align: 'center',
                        render: (count: number) => (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {count} nhân sự
                          </span>
                        ),
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        width: 120,
                        align: 'center',
                        render: (_: unknown, record: Department) => (
                          <Space>
                            <Button
                              type="text"
                              size="small"
                              icon={<Edit3 className="w-4 h-4 text-blue-600" />}
                              onClick={() => handleOpenDeptModal(record)}
                            />
                            <Popconfirm
                              title="Xóa phòng ban này?"
                              description="Chỉ được xóa phòng ban khi không còn nhân sự trực thuộc."
                              onConfirm={() => handleDeleteDept(record.id)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <Button
                                type="text"
                                size="small"
                                icon={<Trash2 className="w-4 h-4 text-rose-500" />}
                              />
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                    pagination={{ pageSize: 8 }}
                  />
                </motion.div>
              )}

              {/* TAB 3: POSITIONS */}
              {activeTab === 'positions' && (
                <motion.div
                  key="positions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card p-6 rounded-2xl space-y-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Danh mục chức danh / vị trí công việc</h3>
                      <p className="text-xs text-slate-500">
                        Hệ thống chức danh chuẩn làm cơ sở phân loại và xây dựng mẫu phiếu đánh giá tương ứng.
                      </p>
                    </div>
                    <Button
                      type="primary"
                      icon={<Briefcase className="w-4 h-4" />}
                      onClick={() => handleOpenPosModal()}
                      className="rounded-xl bg-blue-600 h-10 font-semibold"
                    >
                      Thêm chức danh mới
                    </Button>
                  </div>

                  <Table
                    dataSource={positions.map((p) => ({ ...p, key: p.id }))}
                    columns={[
                      {
                        title: 'Mã chức danh',
                        dataIndex: 'code',
                        key: 'code',
                        width: 150,
                        render: (code: string) => (
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            {code}
                          </span>
                        ),
                      },
                      {
                        title: 'Tên chức danh / vị trí',
                        dataIndex: 'name',
                        key: 'name',
                        render: (name: string) => <span className="font-semibold text-slate-800">{name}</span>,
                      },
                      {
                        title: 'Số nhân sự đảm nhiệm',
                        dataIndex: 'employeeCount',
                        key: 'employeeCount',
                        align: 'center',
                        render: (count: number) => (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {count} nhân sự
                          </span>
                        ),
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        width: 120,
                        align: 'center',
                        render: (_: unknown, record: Position) => (
                          <Space>
                            <Button
                              type="text"
                              size="small"
                              icon={<Edit3 className="w-4 h-4 text-blue-600" />}
                              onClick={() => handleOpenPosModal(record)}
                            />
                            <Popconfirm
                              title="Xóa chức danh này?"
                              description="Không thể xóa chức danh đang được áp dụng cho nhân sự."
                              onConfirm={() => handleDeletePos(record.id)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <Button
                                type="text"
                                size="small"
                                icon={<Trash2 className="w-4 h-4 text-rose-500" />}
                              />
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                    pagination={{ pageSize: 8 }}
                  />
                </motion.div>
              )}

              {/* TAB 4: CRITERIA RUBRIC (US-02.1) */}
              {activeTab === 'criteria' && (
                <motion.div
                  key="criteria"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Category Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div
                      onClick={() => setSelectedCriterionCategory('KPI')}
                      className={`glass-card p-4 rounded-2xl cursor-pointer border transition-all ${
                        selectedCriterionCategory === 'KPI'
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                          : 'hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                            Kết quả công việc (KPI)
                          </span>
                          <div className="text-2xl font-black text-slate-900 mt-1">
                            {criteriaStats.kpiCount} tiêu chí
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Đo lường sản lượng, chất lượng, tiến độ
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                          <Target className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedCriterionCategory('NĂNG LỰC')}
                      className={`glass-card p-4 rounded-2xl cursor-pointer border transition-all ${
                        selectedCriterionCategory === 'NĂNG LỰC'
                          ? 'border-purple-500 bg-purple-50/50 shadow-sm'
                          : 'hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                            Năng lực chuyên môn
                          </span>
                          <div className="text-2xl font-black text-slate-900 mt-1">
                            {criteriaStats.compCount} tiêu chí
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Kiến thức nghiệp vụ, giải quyết vấn đề
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                          <Award className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedCriterionCategory('THÁI ĐỘ')}
                      className={`glass-card p-4 rounded-2xl cursor-pointer border transition-all ${
                        selectedCriterionCategory === 'THÁI ĐỘ'
                          ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                          : 'hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                            Thái độ kỷ luật
                          </span>
                          <div className="text-2xl font-black text-slate-900 mt-1">
                            {criteriaStats.attCount} tiêu chí
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Văn hóa doanh nghiệp, tuân thủ kỷ cương
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                          <Sparkles className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filter & Action Toolbar */}
                  <div className="glass-card p-4 rounded-2xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 p-3 rounded-xl border border-slate-200/80 shadow-xs">
                      <div className="flex flex-wrap items-center gap-3 flex-1">
                        <Input
                          placeholder="Tìm theo tên tiêu chí hoặc mô tả..."
                          prefix={<Search className="w-4 h-4 text-slate-400 mr-1" />}
                          value={criterionSearchText}
                          onChange={(e) => setCriterionSearchText(e.target.value)}
                          allowClear
                          className="w-72 h-10 rounded-xl"
                        />

                        <Select
                          value={selectedCriterionCategory}
                          onChange={setSelectedCriterionCategory}
                          className="w-56 h-10"
                          options={[
                            { value: 'ALL', label: 'Tất cả 3 nhóm tiêu chí' },
                            { value: 'KPI', label: 'Kết quả công việc (KPI)' },
                            { value: 'NĂNG LỰC', label: 'Năng lực chuyên môn' },
                            { value: 'THÁI ĐỘ', label: 'Thái độ kỷ luật' },
                          ]}
                        />

                        <Button
                          icon={<RotateCcw className="w-4 h-4" />}
                          onClick={fetchData}
                          loading={loading}
                          className="h-10 rounded-xl"
                        >
                          Làm mới
                        </Button>
                      </div>

                      <Button
                        type="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => handleOpenCriterionModal()}
                        className="h-10 rounded-xl font-semibold bg-blue-600 shadow-md shadow-blue-500/20"
                      >
                        Tạo tiêu chí mới
                      </Button>
                    </div>

                    <Table
                      columns={criteriaColumns}
                      dataSource={filteredCriteria.map((c) => ({ ...c, key: c.id }))}
                      loading={loading}
                      pagination={{
                        pageSize: 8,
                        showTotal: (total) => `Tổng số ${total} tiêu chí chuẩn`,
                      }}
                      size="middle"
                    />
                  </div>
                </motion.div>
              )}

              {/* TAB 5: APPRAISAL TEMPLATES (US-02.2) */}
              {activeTab === 'templates' && (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                        Danh sách mẫu phiếu đánh giá theo vị trí chức danh
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ràng buộc bắt buộc: Tổng tỷ lệ trọng số của các tiêu chí trong mỗi mẫu phiếu phải bằng đúng 100%.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select
                        value={selectedTemplatePosition}
                        onChange={setSelectedTemplatePosition}
                        className="w-56 h-10"
                        options={[
                          { value: 'all', label: 'Tất cả vị trí chức danh' },
                          ...positions.map((p) => ({
                            value: String(p.id),
                            label: `${p.name} (${p.code})`,
                          })),
                        ]}
                      />

                      <Button
                        type="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => handleOpenTemplateModal()}
                        className="h-10 rounded-xl font-semibold bg-indigo-600 shadow-md shadow-indigo-500/20"
                      >
                        Thiết lập mẫu phiếu mới
                      </Button>
                    </div>
                  </div>

                  {/* Templates Grid Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((tmpl) => (
                      <motion.div
                        key={tmpl.id}
                        whileHover={{ y: -2 }}
                        className="glass-card p-5 rounded-2xl border border-slate-200/90 relative overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {tmpl.position.name} ({tmpl.position.code})
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Tổng trọng số: {tmpl.totalWeight}%
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-800 leading-snug">{tmpl.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {tmpl.description || 'Mẫu phiếu chuẩn phân bổ trọng số đồng bộ cho vị trí.'}
                          </p>

                          {/* Items Breakdown */}
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center justify-between">
                              <span>Danh mục tiêu chí ({tmpl.items.length}):</span>
                              <span className="text-[11px] text-slate-400">Trọng số</span>
                            </div>
                            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                              {tmpl.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors"
                                >
                                  <div className="flex items-center gap-2 flex-1 mr-2">
                                    <span
                                      className={`w-2 h-2 rounded-full shrink-0 ${
                                        item.criterion.category === 'KPI'
                                          ? 'bg-blue-500'
                                          : item.criterion.category === 'NĂNG LỰC'
                                          ? 'bg-purple-500'
                                          : 'bg-amber-500'
                                      }`}
                                    />
                                    <span className="font-medium text-slate-700 truncate">
                                      {item.criterion.name}
                                    </span>
                                  </div>
                                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                                    {item.weight}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <Button
                            icon={<Eye className="w-4 h-4 text-indigo-600" />}
                            className="rounded-xl font-medium text-xs border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/50"
                            onClick={() => handlePreviewTemplate(tmpl)}
                          >
                            Xem trước mẫu phiếu (Preview)
                          </Button>

                          <Space size="small">
                            <Button
                              icon={<Edit3 className="w-3.5 h-3.5 text-blue-600" />}
                              size="small"
                              className="rounded-lg"
                              onClick={() => handleOpenTemplateModal(tmpl)}
                            >
                              Sửa
                            </Button>
                            <Popconfirm
                              title="Xóa mẫu phiếu đánh giá này?"
                              description="Bạn có chắc chắn muốn xóa mẫu phiếu này?"
                              onConfirm={() => handleDeleteTemplate(tmpl.id)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <Button
                                icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                                size="small"
                                className="rounded-lg"
                              />
                            </Popconfirm>
                          </Space>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 6: GRADING SCALES (US-02.3) */}
              {activeTab === 'grading_scales' && (
                <motion.div
                  key="grading_scales"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center bg-white/70 p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        Bảng quy đổi điểm số tổng kết ra thứ hạng xếp loại (GradingScales)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Quy chuẩn 4 bậc xếp loại: Hạng A (90-100), Hạng B (75-89), Hạng C (50-74), Hạng D (&lt;50).
                      </p>
                    </div>
                  </div>

                  {/* Visual 4 Rank Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {gradingScales.map((scale) => {
                      const isA = scale.grade === 'A';
                      const isB = scale.grade === 'B';
                      const isC = scale.grade === 'C';

                      return (
                        <motion.div
                          key={scale.id}
                          whileHover={{ y: -3 }}
                          className={`glass-card p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-between ${
                            isA
                              ? 'border-emerald-300 bg-gradient-to-br from-white to-emerald-50/50'
                              : isB
                              ? 'border-blue-300 bg-gradient-to-br from-white to-blue-50/50'
                              : isC
                              ? 'border-amber-300 bg-gradient-to-br from-white to-amber-50/50'
                              : 'border-rose-300 bg-gradient-to-br from-white to-rose-50/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-sm ${
                                  isA
                                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                                    : isB
                                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-500'
                                    : isC
                                    ? 'bg-gradient-to-tr from-amber-500 to-orange-400'
                                    : 'bg-gradient-to-tr from-rose-500 to-red-400'
                                }`}
                              >
                                {scale.grade}
                              </span>

                              <span
                                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                  isA
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isB
                                    ? 'bg-blue-100 text-blue-800'
                                    : isC
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {isA ? 'Xuất sắc' : isB ? 'Tốt' : isC ? 'Hoàn thành' : 'Chưa hoàn thành'}
                              </span>
                            </div>

                            <div className="text-2xl font-black text-slate-900 tracking-tight">
                              {scale.minScore} → {scale.maxScore} <span className="text-xs font-normal text-slate-500">điểm</span>
                            </div>

                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                              {scale.description || 'Tiêu chuẩn xếp loại đánh giá theo quy chế nội bộ.'}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100/80 flex justify-end">
                            <Button
                              size="small"
                              icon={<Edit3 className="w-3.5 h-3.5" />}
                              className="rounded-lg text-xs"
                              onClick={() => handleOpenScaleModal(scale)}
                            >
                              Chỉnh sửa thang điểm
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Summary Table */}
                  <div className="glass-card p-6 rounded-2xl">
                    <Table
                      dataSource={gradingScales.map((s) => ({ ...s, key: s.id }))}
                      pagination={false}
                      columns={[
                        {
                          title: 'Thứ hạng',
                          dataIndex: 'grade',
                          key: 'grade',
                          width: 100,
                          render: (grade: string) => (
                            <span className="font-black text-base font-mono text-slate-900">
                              Hạng {grade}
                            </span>
                          ),
                        },
                        {
                          title: 'Danh hiệu xếp loại',
                          key: 'title',
                          render: (_: unknown, record: GradingScale) => {
                            if (record.grade === 'A') return <Tag color="green">Xuất sắc</Tag>;
                            if (record.grade === 'B') return <Tag color="blue">Tốt</Tag>;
                            if (record.grade === 'C') return <Tag color="orange">Hoàn thành</Tag>;
                            return <Tag color="red">Chưa hoàn thành</Tag>;
                          },
                        },
                        {
                          title: 'Khoảng điểm tối thiểu (Min)',
                          dataIndex: 'minScore',
                          key: 'minScore',
                          render: (min: number) => <span className="font-bold text-slate-800">{min} điểm</span>,
                        },
                        {
                          title: 'Khoảng điểm tối đa (Max)',
                          dataIndex: 'maxScore',
                          key: 'maxScore',
                          render: (max: number) => <span className="font-bold text-slate-800">{max} điểm</span>,
                        },
                        {
                          title: 'Mô tả tiêu chuẩn xếp loại',
                          dataIndex: 'description',
                          key: 'description',
                          render: (desc: string) => <span className="text-xs text-slate-600">{desc}</span>,
                        },
                        {
                          title: 'Thao tác',
                          key: 'action',
                          width: 100,
                          align: 'center',
                          render: (_: unknown, record: GradingScale) => (
                            <Button
                              type="text"
                              size="small"
                              icon={<Edit3 className="w-4 h-4 text-blue-600" />}
                              onClick={() => handleOpenScaleModal(record)}
                            />
                          ),
                        },
                      ]}
                    />
                  </div>
                </motion.div>
              )}

              {/* TAB 7: ORG CHART */}
              {activeTab === 'org_chart' && (
                <motion.div
                  key="org_chart"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="glass-card p-4 rounded-2xl flex items-center gap-3 border-emerald-200/80 bg-emerald-50/40">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                      <GitFork className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">
                        Cơ cấu định tuyến cấp duyệt đánh giá (US-01 & US-05)
                      </div>
                      <div className="text-xs text-slate-600">
                        Khóa managerId xác định chính xác Trưởng phòng duyệt bảng đăng ký KPI đầu kỳ và chấm điểm đối chiếu cuối kỳ cho từng nhân sự.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orgChart.map((dept) => (
                      <motion.div
                        key={dept.id}
                        whileHover={{ y: -2 }}
                        className="glass-card p-5 rounded-2xl transition-all"
                      >
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                          <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                            {dept.name}
                            <span className="text-xs font-mono font-normal text-slate-400">({dept.code})</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {dept.totalEmployees} nhân sự
                          </span>
                        </div>

                        {dept.heads.length > 0 ? (
                          dept.heads.map((head) => (
                            <div key={head.id} className="mb-4">
                              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <Crown className="w-5 h-5 text-amber-600" />
                                  <div>
                                    <div className="font-bold text-amber-950 text-sm">
                                      {head.fullName} ({head.code})
                                    </div>
                                    <div className="text-xs text-amber-700 font-normal">
                                      {head.position} • {head.email}
                                    </div>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                                  Trưởng bộ phận
                                </span>
                              </div>

                              <div className="pl-6 border-l-2 border-dashed border-amber-300 ml-4 space-y-1.5">
                                {head.subordinates.length > 0 ? (
                                  head.subordinates.map((sub) => (
                                    <div
                                      key={sub.id}
                                      className="text-xs bg-white border border-slate-200 p-2 rounded-lg flex justify-between items-center shadow-xs"
                                    >
                                      <div className="font-medium text-slate-700">
                                        <span className="font-mono font-bold mr-1.5 text-blue-600">
                                          {sub.code}
                                        </span>
                                        {sub.fullName}
                                      </div>
                                      <Tag className="text-[10px] m-0">{sub.position}</Tag>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-xs text-slate-400 italic py-1">
                                    Chưa có nhân sự cấp dưới trực tiếp.
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-400 text-sm py-4 text-center italic">
                            Chưa có Trưởng bộ phận trong phòng ban này.
                          </div>
                        )}

                        {dept.staffWithoutHead.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <div className="text-xs font-semibold text-rose-500 mb-2 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Nhân sự chưa gán Trưởng phòng duyệt ({dept.staffWithoutHead.length}):
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {dept.staffWithoutHead.map((s) => (
                                <span
                                  key={s.id}
                                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-50 text-rose-600 border border-rose-200"
                                >
                                  {s.code} - {s.fullName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* ================= DRAWER CHI TIẾT NHÂN VIÊN (US-01) ================= */}
      <Drawer
        title="Hồ sơ chi tiết nhân viên (US-01)"
        placement="right"
        width={480}
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
      >
        {viewEmployee && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <Avatar
                size={54}
                className={`font-bold text-lg text-white shadow-md ${
                  viewEmployee.role === 'HR'
                    ? 'bg-gradient-to-tr from-rose-500 to-red-400'
                    : viewEmployee.role === 'MANAGER'
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-500'
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-400'
                }`}
              >
                {viewEmployee.fullName.charAt(0)}
              </Avatar>
              <div>
                <div className="font-bold text-lg text-slate-800">{viewEmployee.fullName}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {viewEmployee.code}
                  </span>
                  <Tag color={viewEmployee.role === 'HR' ? 'red' : viewEmployee.role === 'MANAGER' ? 'blue' : 'green'}>
                    {viewEmployee.role}
                  </Tag>
                </div>
              </div>
            </div>

            <Descriptions bordered column={1} size="small" className="rounded-xl overflow-hidden">
              <Descriptions.Item label="Email">{viewEmployee.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{viewEmployee.phone || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Phòng ban">
                {viewEmployee.department?.name} ({viewEmployee.department?.code})
              </Descriptions.Item>
              <Descriptions.Item label="Chức danh công việc">
                {viewEmployee.position?.name} ({viewEmployee.position?.code})
              </Descriptions.Item>
              <Descriptions.Item label="Tài khoản hệ thống (User)">
                <span className="font-mono">{viewEmployee.username || `emp_${viewEmployee.code.toLowerCase()}`}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Người quản lý trực tiếp (managerId)">
                {viewEmployee.manager ? (
                  <span className="font-medium text-slate-800">
                    {viewEmployee.manager.fullName} ({viewEmployee.manager.code})
                  </span>
                ) : (
                  <Tag color="warning">Chưa gán cấp trên</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Số nhân sự dưới quyền">
                {viewEmployee.subordinateCount ? `${viewEmployee.subordinateCount} nhân viên` : '0 nhân viên'}
              </Descriptions.Item>
            </Descriptions>

            {session.role === 'HR' && (
              <div className="pt-4 border-t border-slate-200 flex gap-2">
                <Button
                  block
                  icon={<Edit3 className="w-4 h-4" />}
                  className="rounded-xl h-10 font-semibold"
                  onClick={() => {
                    setDetailDrawerOpen(false);
                    handleOpenEmployeeModal(viewEmployee);
                  }}
                >
                  Sửa thông tin
                </Button>
                <Popconfirm
                  title="Cấp lại mật khẩu?"
                  description="Mật khẩu mới sẽ là password123"
                  onConfirm={() => handleResetPassword(viewEmployee.id)}
                >
                  <Button block icon={<KeyRound className="w-4 h-4" />} className="rounded-xl h-10">
                    Cấp lại mật khẩu
                  </Button>
                </Popconfirm>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* ================= MODAL ĐỔI MẬT KHẨU CÁ NHÂN ================= */}
      <Modal
        title="Đổi mật khẩu tài khoản"
        open={changePasswordModalOpen}
        onOk={handleChangePassword}
        onCancel={() => setChangePasswordModalOpen(false)}
        confirmLoading={changingPassword}
        okText="Lưu mật khẩu mới"
        cancelText="Hủy"
      >
        <Form form={changePasswordForm} layout="vertical" className="mt-4">
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại (*)"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu cũ (VD: password123)" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới (*)"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ================= MODAL THÊM / SỬA NHÂN VIÊN ================= */}
      <Modal
        title={editingEmployee ? 'Chỉnh sửa hồ sơ nhân viên' : 'Thêm mới nhân viên'}
        open={employeeModalOpen}
        onOk={handleSaveEmployee}
        onCancel={() => setEmployeeModalOpen(false)}
        okText={editingEmployee ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy bỏ"
        width={650}
      >
        <Form form={employeeForm} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Mã nhân viên (*)"
              rules={[{ required: true, message: 'Vui lòng nhập mã nhân viên!' }]}
            >
              <Input placeholder="VD: NV0099, HR0002..." />
            </Form.Item>
            <Form.Item
              name="fullName"
              label="Họ và tên (*)"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input placeholder="VD: Nguyễn Văn A..." />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="email"
              label="Email doanh nghiệp (*)"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không đúng định dạng!' },
              ]}
            >
              <Input placeholder="vana.nguyen@pms.corp" />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại">
              <Input placeholder="0912345678" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="departmentId"
              label="Phòng ban (*)"
              rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}
            >
              <Select
                placeholder="Chọn phòng ban trực thuộc"
                options={departments.map((d) => ({
                  value: d.id,
                  label: `${d.name} (${d.code})`,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="positionId"
              label="Chức danh / vị trí (*)"
              rules={[{ required: true, message: 'Vui lòng chọn chức danh!' }]}
            >
              <Select
                placeholder="Chọn chức danh công việc"
                options={positions.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="managerId"
              label="Người quản lý trực tiếp (managerId)"
              tooltip="Trưởng phòng sẽ rà soát duyệt KPI và chấm điểm cho nhân viên này"
            >
              <Select
                allowClear
                placeholder="Chọn Trưởng bộ phận phụ trách"
                options={employees
                  .filter((e) => !editingEmployee || e.id !== editingEmployee.id)
                  .map((e) => ({
                    value: e.id,
                    label: `${e.fullName} (${e.code} - ${e.position?.name})`,
                  }))}
              />
            </Form.Item>
            <Form.Item
              name="role"
              label="Vai trò hệ thống (RBAC)"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
              <Select
                options={[
                  { value: 'EMPLOYEE', label: 'Nhân viên (EMPLOYEE)' },
                  { value: 'MANAGER', label: 'Trưởng bộ phận (MANAGER)' },
                  { value: 'HR', label: 'Hội đồng nhân sự & đánh giá (HR)' },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* ================= MODAL PHÒNG BAN ================= */}
      <Modal
        title={editingDept ? 'Chỉnh sửa phòng ban' : 'Thêm mới phòng ban'}
        open={deptModalOpen}
        onOk={handleSaveDept}
        onCancel={() => setDeptModalOpen(false)}
        okText={editingDept ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
      >
        <Form form={deptForm} layout="vertical" className="mt-4">
          <Form.Item
            name="code"
            label="Mã phòng ban (*)"
            rules={[{ required: true, message: 'Vui lòng nhập mã phòng ban!' }]}
          >
            <Input placeholder="VD: IT, HR, FIN, MKT..." />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên phòng ban (*)"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban!' }]}
          >
            <Input placeholder="VD: Phòng Công nghệ & Kỹ thuật Phần mềm..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* ================= MODAL CHỨC DANH ================= */}
      <Modal
        title={editingPos ? 'Chỉnh sửa chức danh' : 'Thêm mới chức danh'}
        open={posModalOpen}
        onOk={handleSavePos}
        onCancel={() => setPosModalOpen(false)}
        okText={editingPos ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
      >
        <Form form={posForm} layout="vertical" className="mt-4">
          <Form.Item
            name="code"
            label="Mã chức danh (*)"
            rules={[{ required: true, message: 'Vui lòng nhập mã chức danh!' }]}
          >
            <Input placeholder="VD: HEAD, SENIOR, SPECIALIST..." />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên chức danh / vị trí (*)"
            rules={[{ required: true, message: 'Vui lòng nhập tên chức danh!' }]}
          >
            <Input placeholder="VD: Chuyên viên Cao cấp (Senior)..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* ================= MODAL IMPORT EXCEL ================= */}
      <Modal
        title="Nhập dữ liệu hàng loạt từ file Excel (US-01)"
        open={importModalOpen}
        onOk={handleImportExcel}
        onCancel={() => setImportModalOpen(false)}
        confirmLoading={importing}
        okText="Bắt đầu Import"
        cancelText="Đóng"
        width={600}
      >
        <div className="space-y-4 my-2">
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-blue-900 flex items-center gap-1.5 text-sm">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" /> Quy chuẩn file Excel hợp lệ
            </div>
            <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-600">
              <li>Các cột bắt buộc: Mã NV (*), Họ và tên (*), Email (*), Mã phòng ban (*), Mã chức vụ (*).</li>
              <li>Cột tùy chọn: Số điện thoại, Mã quản lý trực tiếp.</li>
              <li>Hệ thống tự động tạo tài khoản đăng nhập (mật khẩu mặc định: password123).</li>
            </ul>
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-600 font-medium">Chưa có file mẫu chuẩn?</span>
            <Button size="small" icon={<FileSpreadsheet className="w-3.5 h-3.5" />} onClick={handleDownloadTemplate} className="rounded-lg">
              Tải file mẫu Excel (.xlsx)
            </Button>
          </div>

          <Upload
            maxCount={1}
            beforeUpload={(file) => {
              setFileList([file]);
              return false;
            }}
            fileList={fileList}
            onRemove={() => setFileList([])}
            accept=".xlsx, .xls"
          >
            <Button icon={<UploadCloud className="w-4 h-4 mr-1" />} className="rounded-xl h-10 font-medium">
              Chọn file Excel từ máy tính
            </Button>
          </Upload>

          {importResult && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-emerald-600 flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4" /> Đã nạp thành công {importResult.successCount} nhân sự!
              </div>
              {importResult.errors.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-rose-500 mb-1">
                    Các dòng có cảnh báo/lỗi ({importResult.errors.length}):
                  </div>
                  <div className="max-h-36 overflow-y-auto text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg space-y-1 font-mono">
                    {importResult.errors.map((err, i) => (
                      <div key={i}>{err}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* ========================================================
          MODAL: THÊM / CHỈNH SỬA TIÊU CHÍ RUBRIC (US-02.1)
          ======================================================== */}
      <Modal
        title={editingCriterion ? 'Chỉnh sửa tiêu chí đánh giá chuẩn' : 'Tạo mới tiêu chí đánh giá chuẩn'}
        open={criterionModalOpen}
        onOk={handleSaveCriterion}
        onCancel={() => setCriterionModalOpen(false)}
        confirmLoading={savingCriterion}
        okText={editingCriterion ? 'Cập nhật tiêu chí' : 'Tạo tiêu chí'}
        cancelText="Hủy bỏ"
        width={720}
      >
        <Form form={criterionForm} layout="vertical" className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Form.Item
                name="name"
                label="Tên tiêu chí đánh giá (*)"
                rules={[{ required: true, message: 'Vui lòng nhập tên tiêu chí!' }]}
              >
                <Input placeholder="VD: Tỷ lệ hoàn thành công việc theo kế hoạch (KPI)..." />
              </Form.Item>
            </div>
            <div>
              <Form.Item
                name="category"
                label="Nhóm cốt lõi (*)"
                rules={[{ required: true, message: 'Vui lòng chọn nhóm!' }]}
              >
                <Select
                  options={[
                    { value: 'KPI', label: 'Kết quả công việc (KPI)' },
                    { value: 'NĂNG LỰC', label: 'Năng lực chuyên môn' },
                    { value: 'THÁI ĐỘ', label: 'Thái độ kỷ luật' },
                  ]}
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="description" label="Mô tả định hướng tiêu chí">
            <Input.TextArea
              rows={2}
              placeholder="Mô tả mục đích, ý nghĩa và phạm vi đánh giá của tiêu chí này..."
            />
          </Form.Item>

          <Divider className="my-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Thư viện mô tả mức độ hành vi (5 mức độ Rubric chuẩn)
            </span>
          </Divider>

          <p className="text-xs text-slate-500 -mt-2 mb-3">
            Mô tả hành vi quan sát cụ thể cho từng cấp điểm (1 đến 5 sao) để người chấm cho điểm chính xác, tránh cảm tính cá nhân:
          </p>

          <div className="space-y-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
            <Form.Item
              name="level1"
              label={<span className="text-xs font-semibold text-rose-600">⭐ Mức 1 (1 điểm) - Chưa đạt / Kém</span>}
              className="mb-2"
            >
              <Input placeholder="Mô tả hành vi khi chưa đạt yêu cầu..." />
            </Form.Item>

            <Form.Item
              name="level2"
              label={<span className="text-xs font-semibold text-amber-600">⭐⭐ Mức 2 (2 điểm) - Cần cải thiện</span>}
              className="mb-2"
            >
              <Input placeholder="Mô tả hành vi khi cần cải thiện..." />
            </Form.Item>

            <Form.Item
              name="level3"
              label={<span className="text-xs font-semibold text-blue-600">⭐⭐⭐ Mức 3 (3 điểm) - Đạt chuẩn / Đạt yêu cầu</span>}
              className="mb-2"
            >
              <Input placeholder="Mô tả hành vi khi hoàn thành chuẩn yêu cầu..." />
            </Form.Item>

            <Form.Item
              name="level4"
              label={<span className="text-xs font-semibold text-indigo-600">⭐⭐⭐⭐ Mức 4 (4 điểm) - Tốt / Vượt mong đợi</span>}
              className="mb-2"
            >
              <Input placeholder="Mô tả hành vi khi hoàn thành tốt vượt mong đợi..." />
            </Form.Item>

            <Form.Item
              name="level5"
              label={<span className="text-xs font-semibold text-emerald-600">⭐⭐⭐⭐⭐ Mức 5 (5 điểm) - Xuất sắc / Hình mẫu</span>}
              className="mb-0"
            >
              <Input placeholder="Mô tả hành vi khi xuất sắc, dẫn dắt đội ngũ..." />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* ========================================================
          DRAWER: THƯ VIỆN MÔ TẢ HÀNH VI TIÊU CHÍ (RUBRIC GUIDE)
          ======================================================== */}
      <Drawer
        title="Thư viện mô tả mức độ hành vi Rubric (5 thang điểm)"
        placement="right"
        width={560}
        onClose={() => setBehaviorDrawerOpen(false)}
        open={behaviorDrawerOpen}
      >
        {viewingCriterion && (
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    viewingCriterion.category === 'KPI'
                      ? 'bg-blue-100 text-blue-800'
                      : viewingCriterion.category === 'NĂNG LỰC'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {viewingCriterion.category === 'KPI'
                    ? 'Kết quả (KPI)'
                    : viewingCriterion.category === 'NĂNG LỰC'
                    ? 'Năng lực chuyên môn'
                    : 'Thái độ kỷ luật'}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID #{viewingCriterion.id}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{viewingCriterion.name}</h3>
              <p className="text-xs text-slate-600 mt-1">
                {viewingCriterion.description || 'Tiêu chuẩn đánh giá chuẩn hóa trong hệ thống PMS.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Thang đo hành vi 5 mức độ quan sát:
              </div>

              {(() => {
                const bg = parseBehaviorGuide(viewingCriterion.behaviorGuide);
                const levels = [
                  {
                    lvl: 5,
                    stars: '⭐⭐⭐⭐⭐',
                    title: 'Mức 5 - Xuất sắc / Hình mẫu',
                    color: 'emerald',
                    desc: bg.level5 || 'Xuất sắc vượt bậc, dẫn dắt đội ngũ và là hình mẫu tiêu biểu.',
                  },
                  {
                    lvl: 4,
                    stars: '⭐⭐⭐⭐',
                    title: 'Mức 4 - Tốt / Vượt mong đợi',
                    color: 'indigo',
                    desc: bg.level4 || 'Hoàn thành vượt chỉ tiêu, chủ động đề xuất sáng kiến tối ưu.',
                  },
                  {
                    lvl: 3,
                    stars: '⭐⭐⭐',
                    title: 'Mức 3 - Đạt chuẩn / Đạt yêu cầu',
                    color: 'blue',
                    desc: bg.level3 || 'Hoàn thành đầy đủ chỉ tiêu công việc theo chuẩn quy định.',
                  },
                  {
                    lvl: 2,
                    stars: '⭐⭐',
                    title: 'Mức 2 - Cần cải thiện',
                    color: 'amber',
                    desc: bg.level2 || 'Đạt một phần chỉ tiêu, cần hỗ trợ thường xuyên từ quản lý.',
                  },
                  {
                    lvl: 1,
                    stars: '⭐',
                    title: 'Mức 1 - Chưa đạt / Kém',
                    color: 'rose',
                    desc: bg.level1 || 'Chưa hoàn thành chỉ tiêu, vi phạm quy trình hoặc cần giám sát liên tục.',
                  },
                ];

                return levels.map((l) => (
                  <div
                    key={l.lvl}
                    className={`p-3.5 rounded-xl border transition-all ${
                      l.color === 'emerald'
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : l.color === 'indigo'
                        ? 'border-indigo-200 bg-indigo-50/50'
                        : l.color === 'blue'
                        ? 'border-blue-200 bg-blue-50/50'
                        : l.color === 'amber'
                        ? 'border-amber-200 bg-amber-50/50'
                        : 'border-rose-200 bg-rose-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{l.title}</span>
                        <span className="text-xs">{l.stars}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {l.lvl} điểm
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed">{l.desc}</div>
                  </div>
                ));
              })()}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <Button onClick={() => setBehaviorDrawerOpen(false)} className="rounded-xl">
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ========================================================
          MODAL: THIẾT LẬP MẪU PHIẾU ĐÁNH GIÁ (US-02.2)
          ======================================================== */}
      <Modal
        title={editingTemplate ? 'Chỉnh sửa mẫu phiếu đánh giá' : 'Thiết lập mẫu phiếu đánh giá mới'}
        open={templateModalOpen}
        onOk={handleSaveTemplate}
        onCancel={() => setTemplateModalOpen(false)}
        confirmLoading={savingTemplate}
        okText="Lưu mẫu phiếu"
        cancelText="Hủy bỏ"
        width={800}
        okButtonProps={{
          disabled: !isTotalWeightValid,
        }}
      >
        <Form form={templateForm} layout="vertical" className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Tên mẫu phiếu đánh giá (*)"
              rules={[{ required: true, message: 'Vui lòng nhập tên mẫu phiếu!' }]}
            >
              <Input placeholder="VD: Mẫu đánh giá hiệu suất - Chuyên viên cao cấp (Senior)..." />
            </Form.Item>

            <Form.Item
              name="positionId"
              label="Vị trí chức danh áp dụng (*)"
              rules={[{ required: true, message: 'Vui lòng chọn chức vụ áp dụng!' }]}
            >
              <Select
                placeholder="Chọn chức danh công việc"
                options={positions.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.code})`,
                }))}
              />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả phạm vi áp dụng">
            <Input placeholder="Mô tả chu kỳ áp dụng hoặc ghi chú hướng dẫn..." />
          </Form.Item>

          {/* REALTIME WEIGHT PROGRESS BAR & AUTO BALANCE */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tổng tỷ lệ trọng số hiện tại:
                </span>
                <span
                  className={`font-mono text-base font-black px-2.5 py-0.5 rounded-lg border ${
                    isTotalWeightValid
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : currentTotalWeight < 100
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  {currentTotalWeight.toFixed(1)}% / 100%
                </span>
              </div>

              <Button
                size="small"
                icon={<Sliders className="w-3.5 h-3.5" />}
                onClick={handleAutoBalanceWeights}
                className="rounded-lg text-xs font-semibold bg-white shadow-2xs border-slate-300 text-slate-700 hover:text-indigo-600"
              >
                Cân đối đều trọng số
              </Button>
            </div>

            <Progress
              percent={Math.min(currentTotalWeight, 100)}
              status={
                isTotalWeightValid ? 'success' : currentTotalWeight > 100 ? 'exception' : 'active'
              }
              strokeColor={
                isTotalWeightValid
                  ? '#10b981'
                  : currentTotalWeight > 100
                  ? '#ef4444'
                  : '#f59e0b'
              }
              showInfo={false}
            />

            {/* Validation Alert message */}
            {isTotalWeightValid ? (
              <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Hợp lệ: Tổng tỷ lệ trọng số bằng đúng 100%. Sẵn sàng lưu mẫu phiếu!
              </div>
            ) : currentTotalWeight < 100 ? (
              <div className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Chưa đủ 100%: Còn thiếu {(100 - currentTotalWeight).toFixed(1)}% trọng số. Nút lưu tạm thời bị khóa!
              </div>
            ) : (
              <div className="text-xs text-rose-700 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                Vượt quá 100%: Dư thừa {(currentTotalWeight - 100).toFixed(1)}% trọng số. Vui lòng hạ bớt tỷ lệ để mở khóa nút lưu!
              </div>
            )}
          </div>

          {/* DYNAMIC ITEMS ALLOCATION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                Danh sách tiêu chí đã chọn ({templateItemsDraft.length}):
              </span>

              <Select
                placeholder="+ Thêm tiêu chí vào mẫu phiếu"
                className="w-72"
                value={null}
                onChange={(critId) => handleAddCriterionToDraft(Number(critId))}
                options={criteria
                  .filter((c) => !templateItemsDraft.some((it) => it.criterionId === c.id))
                  .map((c) => ({
                    value: c.id,
                    label: `[${c.category}] ${c.name}`,
                  }))}
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {templateItemsDraft.map((item) => {
                const crit = criteria.find((c) => c.id === item.criterionId);
                return (
                  <div
                    key={item.criterionId}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs gap-3"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          crit?.category === 'KPI'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : crit?.category === 'NĂNG LỰC'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {crit?.category || 'TIÊU CHÍ'}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {crit?.name || `Tiêu chí #${item.criterionId}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-500 font-medium">Trọng số:</span>
                      <InputNumber
                        min={1}
                        max={100}
                        value={item.weight}
                        onChange={(val) => handleUpdateWeightInDraft(item.criterionId, Number(val))}
                        formatter={(val) => `${val}%`}
                        parser={(val) => Number(val?.replace('%', '') || 0)}
                        className="w-24"
                      />

                      <Button
                        type="text"
                        size="small"
                        icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                        onClick={() => handleRemoveCriterionFromDraft(item.criterionId)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Form>
      </Modal>

      {/* ========================================================
          MODAL: XEM TRƯỚC (PREVIEW) MẪU PHIẾU ĐÁNH GIÁ (US-02.2)
          ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-indigo-900">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Xem trước (Preview) giao diện mẫu phiếu đánh giá
          </div>
        }
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalOpen(false)} className="rounded-xl">
            Đóng xem trước
          </Button>,
        ]}
        width={880}
      >
        {previewTemplate && (
          <div className="space-y-6 my-2 print:p-0">
            {/* Header Mẫu phiếu Chuẩn */}
            <div className="p-5 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-200 text-center relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 border-b border-slate-200/80 pb-2">
                <span className="font-bold text-slate-800">CÔNG TY CỔ PHẦN CÔNG NGHỆ DOANH NGHIỆP</span>
                <span>BIỂU MẪU ĐÁNH GIÁ HIỆU SUẤT NHÂN SỰ (PMS)</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1">{previewTemplate.name}</h2>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white font-semibold text-slate-700 border border-slate-200">
                  Vị trí áp dụng: {previewTemplate.position.name} ({previewTemplate.position.code})
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white font-semibold text-indigo-700 border border-slate-200">
                  Kỳ đánh giá: Quý 1 / 2026
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  Tổng tỷ lệ trọng số: 100%
                </span>
              </div>
            </div>

            {/* Criteria Table Preview */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5 w-12 text-center">STT</th>
                    <th className="p-2.5">Tiêu chí đánh giá chuẩn (Rubric)</th>
                    <th className="p-2.5 w-24 text-center">Trọng số</th>
                    <th className="p-2.5 w-32 text-center">Thang điểm (1 - 5)</th>
                    <th className="p-2.5 w-32 text-center">Tự đánh giá</th>
                    <th className="p-2.5 w-32 text-center">Quản lý chấm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewTemplate.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="p-2.5 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              item.criterion.category === 'KPI'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : item.criterion.category === 'NĂNG LỰC'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.criterion.category}
                          </span>
                          <span className="font-bold text-slate-800">{item.criterion.name}</span>
                        </div>
                        {item.criterion.description && (
                          <div className="text-[11px] text-slate-500">{item.criterion.description}</div>
                        )}
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-indigo-700 bg-indigo-50/30">
                        {item.weight}%
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="inline-flex gap-0.5 text-amber-400">
                          {'★'.repeat(5)}
                        </div>
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="h-7 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-[11px]">
                          [Điểm NV]
                        </div>
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="h-7 rounded border border-dashed border-blue-300 bg-blue-50/40 flex items-center justify-center text-blue-500 text-[11px]">
                          [Điểm MGR]
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <td colSpan={2} className="p-2.5 text-right uppercase">
                      Tổng tỷ lệ trọng số:
                    </td>
                    <td className="p-2.5 text-center font-mono text-emerald-700 text-sm bg-emerald-50">
                      100.0%
                    </td>
                    <td colSpan={3} className="p-2.5 text-xs text-slate-500">
                      Quy đổi điểm tổng kết theo Thang điểm A / B / C / D
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signature Block Preview */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-center text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-8">NHÂN VIÊN ĐƯỢC ĐÁNH GIÁ</div>
                <div className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-8">TRƯỞNG BỘ PHẬN DUYỆT</div>
                <div className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-8">HỘI ĐỒNG NHÂN SỰ (HR)</div>
                <div className="text-[11px] text-slate-400 italic">(Ký duyệt phát hành)</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================
          MODAL: CHỈNH SỬA THANG ĐIỂM XẾP LOẠI (US-02.3)
          ======================================================== */}
      <Modal
        title={`Chỉnh sửa thang điểm xếp loại - Hạng ${editingScale?.grade}`}
        open={gradingModalOpen}
        onOk={handleSaveScale}
        onCancel={() => setGradingModalOpen(false)}
        confirmLoading={savingScale}
        okText="Lưu thang điểm"
        cancelText="Hủy"
      >
        <Form form={scaleForm} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="minScore"
              label="Điểm tối thiểu (Min Score)"
              rules={[{ required: true, message: 'Nhập điểm tối thiểu!' }]}
            >
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>

            <Form.Item
              name="maxScore"
              label="Điểm tối đa (Max Score)"
              rules={[{ required: true, message: 'Nhập điểm tối đa!' }]}
            >
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả tiêu chuẩn xếp loại">
            <Input.TextArea rows={3} placeholder="VD: Cá nhân xuất sắc hoàn thành vượt bậc mục tiêu đề ra..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* ========================================================
          MODAL: TRA CỨU TIÊU CHÍ RUBRIC (DÀNH CHO EMPLOYEE & MANAGER)
          ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-indigo-900">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Tra cứu kho tiêu chí Rubric & quy tắc xếp loại chuẩn
          </div>
        }
        open={rubricLookupOpen}
        onCancel={() => setRubricLookupOpen(false)}
        footer={[
          <Button key="close" onClick={() => setRubricLookupOpen(false)} className="rounded-xl">
            Đóng
          </Button>,
        ]}
        width={850}
      >
        <div className="space-y-4 my-2">
          <p className="text-xs text-slate-500">
            Xem danh mục các tiêu chí chuẩn theo 3 nhóm cốt lõi và bảng thang điểm xếp loại của công ty:
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {criteria.map((c) => {
              const bg = parseBehaviorGuide(c.behaviorGuide);
              return (
                <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          c.category === 'KPI'
                            ? 'bg-blue-100 text-blue-800'
                            : c.category === 'NĂNG LỰC'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.category}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                    </div>
                  </div>
                  {c.description && <div className="text-xs text-slate-500">{c.description}</div>}

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
                    <div className="p-2 rounded bg-rose-50 border border-rose-100">
                      <span className="font-bold text-rose-700 block">⭐ Mức 1</span>
                      <span className="text-slate-600 line-clamp-3">{bg.level1 || 'Chưa đạt'}</span>
                    </div>
                    <div className="p-2 rounded bg-amber-50 border border-amber-100">
                      <span className="font-bold text-amber-700 block">⭐⭐ Mức 2</span>
                      <span className="text-slate-600 line-clamp-3">{bg.level2 || 'Cần cải thiện'}</span>
                    </div>
                    <div className="p-2 rounded bg-blue-50 border border-blue-100">
                      <span className="font-bold text-blue-700 block">⭐⭐⭐ Mức 3</span>
                      <span className="text-slate-600 line-clamp-3">{bg.level3 || 'Đạt yêu cầu'}</span>
                    </div>
                    <div className="p-2 rounded bg-indigo-50 border border-indigo-100">
                      <span className="font-bold text-indigo-700 block">⭐⭐⭐⭐ Mức 4</span>
                      <span className="text-slate-600 line-clamp-3">{bg.level4 || 'Tốt'}</span>
                    </div>
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-100">
                      <span className="font-bold text-emerald-700 block">⭐⭐⭐⭐⭐ Mức 5</span>
                      <span className="text-slate-600 line-clamp-3">{bg.level5 || 'Xuất sắc'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* ================= FOOTER ================= */}
      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200/80 bg-white/40">
        Hệ thống quản lý hiệu suất & đánh giá xếp loại nhân sự (PMS Enterprise) • Bản quyền © 2026
      </footer>
    </div>
  );
}
