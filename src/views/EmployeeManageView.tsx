import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  User as UserIcon, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  Users, 
  Phone, 
  Mail, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  ChevronRight,
  Filter
} from 'lucide-react';

export type RoleType = 'PARTNER_WORKER' | 'PARTNER_MANAGER' | 'DS_PM';

export interface EmployeeItem {
  id: string;
  name: string;
  employeeId: string;
  company: string; // 회사 정보 (신한DS, 유브갓, (주)협력아이티에스, 현대IT솔루션, 오토시스, 파이낸스ITS 등)
  team: string;    // 소속 팀 (카드개발팀, 상담운영팀, 금융개발팀, 재무회계팀 등)
  part: string;    // 소속 파트 (상담, 카드IS, 오토, 재무, 결제망, 데이터 등)
  role: RoleType;  // 3대 역할 구분
  position: string;
  phone: string;
  email: string;
  status: '정상투입' | 'ACTIVE' | '휴가/외근' | '미배정';
  joinedDate: string;
}

// 3가지 역할별 초기 직원 데이터베이스
export const initialEmployeeDataset: EmployeeItem[] = [
  // 1. 협력사 (작업자)
  {
    id: 'emp-w-01',
    name: '송무준',
    employeeId: 'PT2001',
    company: '유브갓',
    team: '상담운영팀',
    part: '상담',
    role: 'PARTNER_WORKER',
    position: '선임',
    phone: '010-4732-8880',
    email: 'moojun.song@ubgot.co.kr',
    status: '정상투입',
    joinedDate: '2026-01-02'
  },
  {
    id: 'emp-w-02',
    name: '김성훈',
    employeeId: 'PT2002',
    company: '유브갓',
    team: '상담운영팀',
    part: '상담',
    role: 'PARTNER_WORKER',
    position: '주임',
    phone: '010-4732-8881',
    email: 'sh.kim@ubgot.co.kr',
    status: '정상투입',
    joinedDate: '2026-01-15'
  },
  {
    id: 'emp-w-03',
    name: '이제성',
    employeeId: 'PT2003',
    company: '(주)협력아이티에스',
    team: '상담운영팀',
    part: '상담',
    role: 'PARTNER_WORKER',
    position: '선임',
    phone: '010-4732-8882',
    email: 'js.lee@partnerits.co.kr',
    status: '정상투입',
    joinedDate: '2026-02-01'
  },
  {
    id: 'emp-w-04',
    name: '김흥섭',
    employeeId: 'PT2004',
    company: '유브갓',
    team: '상담운영팀',
    part: '상담',
    role: 'PARTNER_WORKER',
    position: '책임',
    phone: '010-4732-8883',
    email: 'hs.kim@ubgot.co.kr',
    status: '정상투입',
    joinedDate: '2026-01-10'
  },
  {
    id: 'emp-w-05',
    name: '박민우',
    employeeId: 'PT2005',
    company: '현대IT솔루션',
    team: '상담운영팀',
    part: '상담',
    role: 'PARTNER_WORKER',
    position: '선임',
    phone: '010-4732-8884',
    email: 'mw.park@hdits.co.kr',
    status: '정상투입',
    joinedDate: '2026-02-10'
  },
  {
    id: 'emp-w-06',
    name: '박창훈',
    employeeId: 'PT2021',
    company: '오토시스',
    team: '금융개발팀',
    part: '오토',
    role: 'PARTNER_WORKER',
    position: '선임',
    phone: '010-4732-8885',
    email: 'ch.park@autosys.co.kr',
    status: '정상투입',
    joinedDate: '2026-01-05'
  },
  {
    id: 'emp-w-07',
    name: '김진수',
    employeeId: 'PT2022',
    company: '오토시스',
    team: '금융개발팀',
    part: '오토',
    role: 'PARTNER_WORKER',
    position: '주임',
    phone: '010-4732-8886',
    email: 'js.kim@autosys.co.kr',
    status: '정상투입',
    joinedDate: '2026-01-20'
  },
  {
    id: 'emp-w-08',
    name: '이민호',
    employeeId: 'PT2031',
    company: '파이낸스ITS',
    team: '재무회계팀',
    part: '재무',
    role: 'PARTNER_WORKER',
    position: '책임',
    phone: '010-4732-8887',
    email: 'mh.lee@financeits.co.kr',
    status: '정상투입',
    joinedDate: '2026-01-08'
  },
  {
    id: 'emp-w-09',
    name: '한동훈',
    employeeId: 'PT2041',
    company: '현대IT솔루션',
    team: '카드개발팀',
    part: '카드IS',
    role: 'PARTNER_WORKER',
    position: '선임',
    phone: '010-4732-8888',
    email: 'dh.han@hdits.co.kr',
    status: '정상투입',
    joinedDate: '2026-01-12'
  },
  {
    id: 'emp-w-10',
    name: '김연섭',
    employeeId: 'PT2042',
    company: '현대IT솔루션',
    team: '카드개발팀',
    part: '카드IS',
    role: 'PARTNER_WORKER',
    position: '수석',
    phone: '010-4732-8889',
    email: 'ys.kim@hdits.co.kr',
    status: '정상투입',
    joinedDate: '2026-01-03'
  },
  {
    id: 'emp-w-11',
    name: '서성훈',
    employeeId: 'PT2043',
    company: '데이터인사이트',
    team: '카드개발팀',
    part: '데이터',
    role: 'PARTNER_WORKER',
    position: '선임',
    phone: '010-4732-8890',
    email: 'sh.seo@datainsight.co.kr',
    status: '정상투입',
    joinedDate: '2026-02-15'
  },

  // 2. 협력사 관리인 (영업대표 / 총괄관리인)
  {
    id: 'emp-m-01',
    name: '최영호 대표',
    employeeId: 'MGRUB1',
    company: '유브갓',
    team: '영업총괄팀',
    part: '전사총괄',
    role: 'PARTNER_MANAGER',
    position: '영업대표/총괄관리자',
    phone: '010-3344-5566',
    email: 'yh.choi@ubgot.co.kr',
    status: 'ACTIVE',
    joinedDate: '2025-11-01'
  },
  {
    id: 'emp-m-02',
    name: '정진우 부사장',
    employeeId: 'MGRIT1',
    company: '(주)협력아이티에스',
    team: '영업총괄팀',
    part: '전사총괄',
    role: 'PARTNER_MANAGER',
    position: '현장총괄관리인',
    phone: '010-4455-6677',
    email: 'jw.jung@partnerits.co.kr',
    status: 'ACTIVE',
    joinedDate: '2025-12-01'
  },
  {
    id: 'emp-m-03',
    name: '김태현 전무',
    employeeId: 'MGRHD1',
    company: '현대IT솔루션',
    team: 'SI사업본부',
    part: '전사총괄',
    role: 'PARTNER_MANAGER',
    position: '총괄영업대표',
    phone: '010-5566-7788',
    email: 'th.kim@hdits.co.kr',
    status: 'ACTIVE',
    joinedDate: '2025-10-15'
  },
  {
    id: 'emp-m-04',
    name: '이강현 상무',
    employeeId: 'MGRAU1',
    company: '오토시스',
    team: '오토사업본부',
    part: '전사총괄',
    role: 'PARTNER_MANAGER',
    position: '수급사총괄PM',
    phone: '010-6677-8899',
    email: 'kh.lee@autosys.co.kr',
    status: 'ACTIVE',
    joinedDate: '2025-11-20'
  },
  {
    id: 'emp-m-05',
    name: '문상철 대표',
    employeeId: 'MGRFI1',
    company: '파이낸스ITS',
    team: '금융사업본부',
    part: '전사총괄',
    role: 'PARTNER_MANAGER',
    position: '현장관리인',
    phone: '010-7788-9900',
    email: 'sc.moon@financeits.co.kr',
    status: 'ACTIVE',
    joinedDate: '2025-12-10'
  },

  // 3. DS 현장관리인 (신한DS PM)
  {
    id: 'emp-ds-01',
    name: '조경훈',
    employeeId: 'S01832',
    company: '신한DS',
    team: '카드개발팀',
    part: '카드IS (Part 1)',
    role: 'DS_PM',
    position: '부장 (전담 PM)',
    phone: '010-4421-8890',
    email: 'khcho0421@gmail.com',
    status: 'ACTIVE',
    joinedDate: '2024-03-01'
  },
  {
    id: 'emp-ds-02',
    name: '강민우',
    employeeId: 'S18121',
    company: '신한DS',
    team: '금융개발팀',
    part: '오토',
    role: 'DS_PM',
    position: '수석 (전담 PM)',
    phone: '010-4421-8891',
    email: 'mw.kang@shinhands.co.kr',
    status: 'ACTIVE',
    joinedDate: '2024-05-15'
  },
  {
    id: 'emp-ds-03',
    name: '송진호',
    employeeId: 'S18122',
    company: '신한DS',
    team: '재무회계팀',
    part: '재무',
    role: 'DS_PM',
    position: '부장 (전담 PM)',
    phone: '010-4421-8892',
    email: 'jh.song@shinhands.co.kr',
    status: 'ACTIVE',
    joinedDate: '2024-02-10'
  },
  {
    id: 'emp-ds-04',
    name: '박성진',
    employeeId: 'S18123',
    company: '신한DS',
    team: '카드개발팀',
    part: '카드IS',
    role: 'DS_PM',
    position: '수석 (전담 PM)',
    phone: '010-4421-8893',
    email: 'sj.park@shinhands.co.kr',
    status: 'ACTIVE',
    joinedDate: '2024-04-01'
  },
  {
    id: 'emp-ds-05',
    name: '최동욱',
    employeeId: 'S18124',
    company: '신한DS',
    team: '결제인프라팀',
    part: '결제망',
    role: 'DS_PM',
    position: '차장 (전담 PM)',
    phone: '010-4421-8894',
    email: 'dw.choi@shinhands.co.kr',
    status: 'ACTIVE',
    joinedDate: '2024-06-20'
  }
];

const STORAGE_KEY = 'SGUARD_EMPLOYEES_DATA';

interface EmployeeManageViewProps {
  onBack: () => void;
  onSelectEmployee?: (emp: EmployeeItem) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const EmployeeManageView: React.FC<EmployeeManageViewProps> = ({
  onBack,
  themeMode
}) => {
  const [employees, setEmployees] = useState<EmployeeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialEmployeeDataset;
  });

  // 3가지 역할 탭: PARTNER_WORKER | PARTNER_MANAGER | DS_PM
  const [activeRoleTab, setActiveRoleTab] = useState<RoleType>('PARTNER_WORKER');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartFilter, setSelectedPartFilter] = useState('ALL');

  // 직원 편집/추가 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<EmployeeItem | null>(null);

  // 저장 함수
  const saveEmployeesToStorage = (list: EmployeeItem[]) => {
    setEmployees(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  };

  // 필터링된 직원 목록
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // 1. 역할 탭 필터
      if (emp.role !== activeRoleTab) return false;

      // 2. 파트 필터
      if (selectedPartFilter !== 'ALL' && emp.part !== selectedPartFilter) return false;

      // 3. 검색어 필터 (이름, 사번, 회사명, 팀, 파트)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match = 
          emp.name.toLowerCase().includes(q) ||
          emp.employeeId.toLowerCase().includes(q) ||
          emp.company.toLowerCase().includes(q) ||
          emp.team.toLowerCase().includes(q) ||
          emp.part.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [employees, activeRoleTab, selectedPartFilter, searchQuery]);

  // 카운트 집계
  const counts = useMemo(() => {
    return {
      PARTNER_WORKER: employees.filter(e => e.role === 'PARTNER_WORKER').length,
      PARTNER_MANAGER: employees.filter(e => e.role === 'PARTNER_MANAGER').length,
      DS_PM: employees.filter(e => e.role === 'DS_PM').length
    };
  }, [employees]);

  // 신규 등록 열기
  const handleOpenAddModal = () => {
    const newEmp: EmployeeItem = {
      id: `emp-${Date.now()}`,
      name: '',
      employeeId: '',
      company: activeRoleTab === 'DS_PM' ? '신한DS' : '유브갓',
      team: activeRoleTab === 'PARTNER_MANAGER' ? '영업총괄팀' : '상담운영팀',
      part: activeRoleTab === 'PARTNER_MANAGER' ? '전사총괄' : '상담',
      role: activeRoleTab,
      position: activeRoleTab === 'DS_PM' ? '수석 (전담 PM)' : activeRoleTab === 'PARTNER_MANAGER' ? '현장관리인(영업대표)' : '선임',
      phone: '010-',
      email: '',
      status: '정상투입',
      joinedDate: new Date().toISOString().substring(0, 10)
    };
    setEditingEmp(newEmp);
    setIsEditModalOpen(true);
  };

  // 기존 직원 수정 열기
  const handleOpenEditModal = (emp: EmployeeItem) => {
    setEditingEmp({ ...emp });
    setIsEditModalOpen(true);
  };

  // 모달 저장 처리
  const handleSaveModal = (updated: EmployeeItem) => {
    if (!updated.name.trim()) {
      alert('성명을 입력해 주세요.');
      return;
    }
    const maxLen = updated.role === 'PARTNER_MANAGER' ? 10 : 6;
    const cleanEmp = updated.employeeId.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, maxLen);
    const hasLetter = /[a-zA-Z]/.test(cleanEmp);
    const hasNumber = /[0-9]/.test(cleanEmp);

    if (updated.role === 'PARTNER_MANAGER') {
      if (cleanEmp.length < 3 || cleanEmp.length > 10) {
        alert('협력사 현장관리인 아이디는 영문·숫자 3~10자리여야 합니다. (예: MGRUB1, partner01)');
        return;
      }
    } else {
      if (cleanEmp.length !== 6 || !hasLetter || !hasNumber) {
        alert('사번은 영문과 숫자를 모두 포함한 정확히 6자리여야 합니다. (예: S01832, PT2001)');
        return;
      }
    }
    updated.employeeId = cleanEmp;

    if (!updated.company.trim()) {
      alert('회사명을 입력해 주세요.');
      return;
    }

    const existingIndex = employees.findIndex(e => e.id === updated.id);
    let newList: EmployeeItem[];
    if (existingIndex >= 0) {
      newList = [...employees];
      newList[existingIndex] = updated;
    } else {
      newList = [updated, ...employees];
    }

    saveEmployeesToStorage(newList);
    setIsEditModalOpen(false);
    setEditingEmp(null);
    alert(`✅ ${updated.name} (${updated.company}) 정보가 성공적으로 저장되었습니다.`);
  };

  // 직원 삭제 처리
  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`정말 [${name}] 직원을 삭제하시겠습니까?`)) {
      const newList = employees.filter(e => e.id !== id);
      saveEmployeesToStorage(newList);
      setIsEditModalOpen(false);
      setEditingEmp(null);
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#1E293B' }}>
      {/* 1. 상단 네비게이션 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid #E2E8F0',
        background: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onBack} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#0F172A', 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>직원 관리</span>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
              협력사 / 협력사 관리인 / DS 현장관리인 3대 체계
            </div>
          </div>
        </div>

        <button 
          onClick={handleOpenAddModal}
          style={{ 
            background: '#0052FF', 
            color: '#FFFFFF', 
            border: 'none',
            borderRadius: '8px',
            padding: '7px 12px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 82, 255, 0.25)'
          }}
        >
          <Plus size={16} />
          <span>직원 등록</span>
        </button>
      </div>

      {/* 2. 3대 역할 탭 바 (협력사 / 협력사 관리인 / DS 현장관리인) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        borderBottom: '1px solid #E2E8F0', 
        background: '#FFFFFF' 
      }}>
        {/* 탭 1: 협력사 (작업자) */}
        <button
          onClick={() => { setActiveRoleTab('PARTNER_WORKER'); setSelectedPartFilter('ALL'); }}
          style={{
            padding: '13px 4px',
            fontSize: '13px',
            fontWeight: activeRoleTab === 'PARTNER_WORKER' ? 800 : 600,
            color: activeRoleTab === 'PARTNER_WORKER' ? '#0052FF' : '#64748B',
            background: 'none',
            border: 'none',
            borderBottom: activeRoleTab === 'PARTNER_WORKER' ? '3px solid #0052FF' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Briefcase size={14} />
            <span>협력사 (작업자)</span>
          </div>
          <span style={{ 
            fontSize: '11px', 
            background: activeRoleTab === 'PARTNER_WORKER' ? 'rgba(0, 82, 255, 0.1)' : '#F1F5F9',
            color: activeRoleTab === 'PARTNER_WORKER' ? '#0052FF' : '#64748B',
            padding: '1px 7px',
            borderRadius: '10px',
            fontWeight: 700
          }}>
            {counts.PARTNER_WORKER}명
          </span>
        </button>

        {/* 탭 2: 협력사 관리인 */}
        <button
          onClick={() => { setActiveRoleTab('PARTNER_MANAGER'); setSelectedPartFilter('ALL'); }}
          style={{
            padding: '13px 4px',
            fontSize: '13px',
            fontWeight: activeRoleTab === 'PARTNER_MANAGER' ? 800 : 600,
            color: activeRoleTab === 'PARTNER_MANAGER' ? '#0284C7' : '#64748B',
            background: 'none',
            border: 'none',
            borderBottom: activeRoleTab === 'PARTNER_MANAGER' ? '3px solid #0284C7' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Building2 size={14} />
            <span>협력사 관리인</span>
          </div>
          <span style={{ 
            fontSize: '11px', 
            background: activeRoleTab === 'PARTNER_MANAGER' ? 'rgba(2, 132, 199, 0.1)' : '#F1F5F9',
            color: activeRoleTab === 'PARTNER_MANAGER' ? '#0284C7' : '#64748B',
            padding: '1px 7px',
            borderRadius: '10px',
            fontWeight: 700
          }}>
            {counts.PARTNER_MANAGER}명
          </span>
        </button>

        {/* 탭 3: DS 현장관리인 */}
        <button
          onClick={() => { setActiveRoleTab('DS_PM'); setSelectedPartFilter('ALL'); }}
          style={{
            padding: '13px 4px',
            fontSize: '13px',
            fontWeight: activeRoleTab === 'DS_PM' ? 800 : 600,
            color: activeRoleTab === 'DS_PM' ? '#4F46E5' : '#64748B',
            background: 'none',
            border: 'none',
            borderBottom: activeRoleTab === 'DS_PM' ? '3px solid #4F46E5' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} />
            <span>DS 현장관리인</span>
          </div>
          <span style={{ 
            fontSize: '11px', 
            background: activeRoleTab === 'DS_PM' ? 'rgba(79, 70, 229, 0.1)' : '#F1F5F9',
            color: activeRoleTab === 'DS_PM' ? '#4F46E5' : '#64748B',
            padding: '1px 7px',
            borderRadius: '10px',
            fontWeight: 700
          }}>
            {counts.DS_PM}명
          </span>
        </button>
      </div>

      {/* 3. 검색 및 소속 파트 필터 바 */}
      <div style={{ padding: '12px 16px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* 검색 입력창 */}
        <div style={{
          background: '#F1F5F9',
          borderRadius: '10px',
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          height: '40px'
        }}>
          <Search size={16} color="#64748B" style={{ marginRight: '8px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="이름, 사번, 회사명, 팀, 파트 검색..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '13px',
              color: '#0F172A',
              fontWeight: 500
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* 파트별 칩 필터 (협력사 작업자/DS PM 탭일 때) */}
        {activeRoleTab !== 'PARTNER_MANAGER' && (
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {['ALL', '상담', '카드IS', '오토', '재무', '데이터', '결제망'].map(partName => (
              <button
                key={partName}
                onClick={() => setSelectedPartFilter(partName)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '14px',
                  fontSize: '12px',
                  fontWeight: selectedPartFilter === partName ? 700 : 500,
                  border: selectedPartFilter === partName ? '1px solid #0052FF' : '1px solid #E2E8F0',
                  background: selectedPartFilter === partName ? '#0052FF' : '#F8FAFC',
                  color: selectedPartFilter === partName ? '#FFFFFF' : '#64748B',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {partName === 'ALL' ? '전체 파트' : `${partName} 파트`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. 직원 목록 카드 뷰 */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '80px' }}>
        {filteredEmployees.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '13.5px' }}>
            검색 및 필터 조건에 해당하는 직원이 없습니다.
          </div>
        ) : (
          filteredEmployees.map(emp => (
            <div
              key={emp.id}
              onClick={() => handleOpenEditModal(emp)}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* 아바타 */}
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: emp.role === 'DS_PM' 
                    ? 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' 
                    : emp.role === 'PARTNER_MANAGER'
                      ? 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)'
                      : 'linear-gradient(135deg, #0052FF 0%, #00D4FF 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {emp.name[0] || '직'}
                </div>

                {/* 이름 및 소속/회사 정보 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                      {emp.name}
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '1px 6px', 
                      borderRadius: '4px',
                      background: emp.role === 'DS_PM' ? 'rgba(79, 70, 229, 0.1)' : emp.role === 'PARTNER_MANAGER' ? 'rgba(2, 132, 199, 0.1)' : '#F1F5F9',
                      color: emp.role === 'DS_PM' ? '#4F46E5' : emp.role === 'PARTNER_MANAGER' ? '#0284C7' : '#475569',
                      fontWeight: 700 
                    }}>
                      {emp.position}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                      ({emp.employeeId})
                    </span>
                  </div>

                  {/* 회사명 및 팀/파트 소속 정보 배지 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ 
                      fontSize: '11.5px', 
                      color: emp.company === '신한DS' ? '#4F46E5' : '#0284C7', 
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <Building2 size={12} />
                      {emp.company}
                    </span>
                    <span style={{ color: '#CBD5E1' }}>•</span>
                    <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: 600 }}>
                      {emp.team}
                    </span>
                    <span style={{ color: '#CBD5E1' }}>•</span>
                    <span style={{ 
                      fontSize: '11px', 
                      color: '#0052FF', 
                      background: 'rgba(0, 82, 255, 0.08)',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}>
                      {emp.part}
                    </span>
                  </div>
                </div>
              </div>

              {/* 우측 화살표 및 상태 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '11px',
                  padding: '3px 7px',
                  borderRadius: '6px',
                  background: emp.status === 'ACTIVE' || emp.status === '정상투입' ? 'rgba(16, 185, 129, 0.1)' : '#F1F5F9',
                  color: emp.status === 'ACTIVE' || emp.status === '정상투입' ? '#059669' : '#64748B',
                  fontWeight: 700
                }}>
                  {emp.status}
                </span>
                <ChevronRight size={18} color="#94A3B8" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. 직원 상세 정보 및 소속/회사 편집/등록 모달 */}
      {isEditModalOpen && editingEmp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 1000
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '430px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
          }}>
            {/* 모달 헤더 */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserIcon size={18} color="#0052FF" />
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                  {editingEmp.name ? `${editingEmp.name} 직원 정보 수정` : '새 직원 등록'}
                </span>
              </div>
              <button
                onClick={() => { setIsEditModalOpen(false); setEditingEmp(null); }}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* 모달 본문 폼 */}
            <div style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 1. 역할 선택 (협력사 작업자 / 협력사 관리인 / DS 현장관리인) */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  직원 역할 구분 *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingEmp({ ...editingEmp, role: 'PARTNER_WORKER' })}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: editingEmp.role === 'PARTNER_WORKER' ? 800 : 600,
                      background: editingEmp.role === 'PARTNER_WORKER' ? '#0052FF' : '#F1F5F9',
                      color: editingEmp.role === 'PARTNER_WORKER' ? '#FFFFFF' : '#475569',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    협력사 작업자
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingEmp({ ...editingEmp, role: 'PARTNER_MANAGER' })}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: editingEmp.role === 'PARTNER_MANAGER' ? 800 : 600,
                      background: editingEmp.role === 'PARTNER_MANAGER' ? '#0284C7' : '#F1F5F9',
                      color: editingEmp.role === 'PARTNER_MANAGER' ? '#FFFFFF' : '#475569',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    협력사 관리인
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingEmp({ ...editingEmp, role: 'DS_PM', company: '신한DS' })}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: editingEmp.role === 'DS_PM' ? 800 : 600,
                      background: editingEmp.role === 'DS_PM' ? '#4F46E5' : '#F1F5F9',
                      color: editingEmp.role === 'DS_PM' ? '#FFFFFF' : '#475569',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    DS 현장관리인
                  </button>
                </div>
              </div>

              {/* 2. 성명 & 사번 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    성명 *
                  </label>
                  <input
                    type="text"
                    value={editingEmp.name}
                    onChange={e => setEditingEmp({ ...editingEmp, name: e.target.value })}
                    placeholder="예: 홍길동"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: editingEmp.role === 'PARTNER_MANAGER' ? '#0284C7' : '#475569', display: 'block', marginBottom: '4px' }}>
                    {editingEmp.role === 'PARTNER_MANAGER' ? '사원번호 / 아이디 (현장관리인: 최대 10자리) *' : '사원번호 (영문·숫자 6자리) *'}
                  </label>
                  <input
                    type="text"
                    maxLength={editingEmp.role === 'PARTNER_MANAGER' ? 10 : 6}
                    value={editingEmp.employeeId}
                    onChange={e => {
                      const maxLen = editingEmp.role === 'PARTNER_MANAGER' ? 10 : 6;
                      setEditingEmp({ ...editingEmp, employeeId: e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, maxLen) });
                    }}
                    placeholder={editingEmp.role === 'PARTNER_MANAGER' ? "예: MGRUB1, partner01 (최대 10자)" : "예: S01832, PT2001 (6자)"}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* 3. 소속 회사 정보 (협력사명 또는 신한DS) */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  소속 회사 정보 (수급사/소속사) *
                </label>
                {editingEmp.role === 'DS_PM' ? (
                  <input
                    type="text"
                    value="신한DS"
                    disabled
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      background: '#F1F5F9',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#4F46E5',
                      boxSizing: 'border-box'
                    }}
                  />
                ) : (
                  <select
                    value={editingEmp.company}
                    onChange={e => setEditingEmp({ ...editingEmp, company: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="유브갓">유브갓</option>
                    <option value="(주)협력아이티에스">(주)협력아이티에스</option>
                    <option value="현대IT솔루션">현대IT솔루션</option>
                    <option value="오토시스">오토시스</option>
                    <option value="파이낸스ITS">파이낸스ITS</option>
                    <option value="데이터인사이트">데이터인사이트</option>
                    <option value="페이먼트시스템즈">페이먼트시스템즈</option>
                    <option value="보안인텔리전스">보안인텔리전스</option>
                    <option value="고객경험ITS">고객경험ITS</option>
                    <option value="스마트소프트">스마트소프트</option>
                    <option value="클라우드네트웍스">클라우드네트웍스</option>
                    <option value="신한DS">신한DS</option>
                  </select>
                )}
              </div>

              {/* 4. 소속 정보 (팀 & 파트) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    소속 팀 *
                  </label>
                  <select
                    value={editingEmp.team}
                    onChange={e => setEditingEmp({ ...editingEmp, team: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="카드개발팀">카드개발팀</option>
                    <option value="상담운영팀">상담운영팀</option>
                    <option value="금융개발팀">금융개발팀</option>
                    <option value="재무회계팀">재무회계팀</option>
                    <option value="결제인프라팀">결제인프라팀</option>
                    <option value="영업총괄팀">영업총괄팀</option>
                    <option value="SI사업본부">SI사업본부</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    관제 파트 *
                  </label>
                  <select
                    value={editingEmp.part}
                    onChange={e => setEditingEmp({ ...editingEmp, part: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="상담">상담 파트</option>
                    <option value="카드IS">카드IS 파트</option>
                    <option value="오토">오토 파트</option>
                    <option value="재무">재무 파트</option>
                    <option value="결제망">결제망 파트</option>
                    <option value="데이터">데이터 파트</option>
                    <option value="FDS">FDS 파트</option>
                    <option value="CRM">CRM 파트</option>
                    <option value="모바일">모바일 파트</option>
                    <option value="인프라">인프라 파트</option>
                    <option value="전사총괄">전사총괄 (관리인)</option>
                  </select>
                </div>
              </div>

              {/* 5. 직책 & 연락처 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    직책
                  </label>
                  <input
                    type="text"
                    value={editingEmp.position}
                    onChange={e => setEditingEmp({ ...editingEmp, position: e.target.value })}
                    placeholder="예: 사원 / 대리 / 과장 / 수석"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    핸드폰 번호
                  </label>
                  <input
                    type="text"
                    value={editingEmp.phone}
                    onChange={e => setEditingEmp({ ...editingEmp, phone: e.target.value })}
                    placeholder="010-0000-0000"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* 6. 외부 이메일 */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  이메일 주소 (외부 메일: 구글/네이버 등)
                </label>
                <input
                  type="email"
                  value={editingEmp.email}
                  onChange={e => setEditingEmp({ ...editingEmp, email: e.target.value })}
                  placeholder="예: user@gmail.com"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* 모달 푸터 버튼 */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              gap: '10px'
            }}>
              {employees.some(e => e.id === editingEmp.id) && (
                <button
                  type="button"
                  onClick={() => handleDeleteEmployee(editingEmp.id, editingEmp.name)}
                  style={{
                    flex: 0.8,
                    padding: '10px 0',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  삭제
                </button>
              )}

              <button
                type="button"
                onClick={() => { setIsEditModalOpen(false); setEditingEmp(null); }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '8px',
                  background: '#E2E8F0',
                  border: 'none',
                  color: '#475569',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>

              <button
                type="button"
                onClick={() => handleSaveModal(editingEmp)}
                style={{
                  flex: 1.5,
                  padding: '10px 0',
                  borderRadius: '8px',
                  background: '#0052FF',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 82, 255, 0.25)'
                }}
              >
                저장 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
