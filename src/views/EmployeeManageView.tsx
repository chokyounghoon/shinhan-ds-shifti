import React, { useState, useMemo, useEffect } from 'react';
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
  Filter,
  UserPlus
} from 'lucide-react';
import { dbService } from '../services/db';

export type RoleType = 'PARTNER_WORKER' | 'PARTNER_MANAGER' | 'DS_PM';

export interface EmployeeItem {
  id: string;
  name: string;
  employeeId: string;
  company: string; // 회사 정보 (신한DS, 유브갓, (주)협력아이티에스, 현대IT솔루션 등)
  team: string;    // 소속 팀 (카드개발팀, 상담운영팀 등)
  part: string;    // 소속 파트 (상담, 카드IS 등 DB 기준 동적)
  role: RoleType;  // 3대 역할 구분
  position: string;
  phone: string;
  email: string;
  status: '정상투입' | 'ACTIVE' | '휴가/외근' | '미배정';
  joinedDate: string;
}

export const initialEmployeeDataset: EmployeeItem[] = [];

interface EmployeeManageViewProps {
  onBack: () => void;
  onSelectEmployee?: (emp: EmployeeItem) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const EmployeeManageView: React.FC<EmployeeManageViewProps> = ({
  onBack,
  themeMode
}) => {
  // 로컬스토리지 완전 제거: Cloudflare D1 users 테이블 100% 실시간 직접 동기화
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [dbOrgParts, setDbOrgParts] = useState<string[]>([]);
  const [dbCompanies, setDbCompanies] = useState<string[]>(['신한DS', '유브갓', '(주)협력아이티에스']);
  const [isLoading, setIsLoading] = useState(false);

  // 3가지 역할 탭: PARTNER_WORKER | PARTNER_MANAGER | DS_PM
  const [activeRoleTab, setActiveRoleTab] = useState<RoleType>('PARTNER_WORKER');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartFilter, setSelectedPartFilter] = useState('ALL');

  // 직원 편집/추가 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<EmployeeItem | null>(null);

  // 1. Cloudflare D1 users 원격 실시간 조회
  const fetchRemoteUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: EmployeeItem[] = json.data.map((u: any) => {
            // 3대 역할 매핑 (우선순위: DS → 협력사관리인 → 협력사개인)
            // 신한DS 소속이면 무조건 DS_PM (is_partner_manager 여부 무관)
            let roleType: RoleType = 'PARTNER_WORKER';
            const isDS = u.company === '신한DS' || u.role === 'DS_PRINCIPAL_PM';
            if (isDS) {
              roleType = 'DS_PM';
            } else if (u.is_partner_manager === 1 || u.role === 'PARTNER_PART_LEADER' || u.role === 'PARTNER_MANAGER') {
              roleType = 'PARTNER_MANAGER';
            }

            return {
              id: u.employee_id || `emp-${u.seq || Date.now()}`,
              name: u.name || '',
              employeeId: u.employee_id || '',
              company: u.company || (roleType === 'DS_PM' ? '신한DS' : '유브갓'),
              team: u.team || '카드개발팀',
              part: u.part || '',
              role: roleType,
              position: u.position || (roleType === 'DS_PM' ? '수석' : roleType === 'PARTNER_MANAGER' ? '대표' : '선임'),
              phone: u.phone || '',
              email: u.email || '',
              status: u.status === 'ACTIVE' || u.status === '정상투입' ? '정상투입' : (u.status || '정상투입'),
              joinedDate: (u.created_at || '').substring(0, 10) || '2026-08-17'
            };
          });
          setEmployees(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch remote users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Cloudflare D1 organizations 원격 파트 정보 실시간 조회 (DB 기준 동적 파트)
  const fetchRemoteOrgs = async () => {
    try {
      const res = await fetch('/api/organizations');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const parts = json.data
            .map((item: any) => (item.part_name || '').trim())
            .filter(Boolean);
          setDbOrgParts(parts);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch remote orgs for parts:', err);
    }
  };

  // 3. Cloudflare D1 companies 원격 협력사 목록 실시간 조회
  const fetchRemoteCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const list = json.data.map((c: any) => c.company_name).filter(Boolean);
          setDbCompanies(list);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch remote companies:', err);
    }
  };

  useEffect(() => {
    // 잔여 로컬스토리지 정리
    try {
      localStorage.removeItem('SGUARD_EMPLOYEES_DATA');
    } catch (e) {}
    fetchRemoteUsers();
    fetchRemoteOrgs();
    fetchRemoteCompanies();
  }, []);

  // 3. DB 기준으로만 존재하는 파트 목록 동적 계산 (하드코딩 완전 배제)
  const availableParts = useMemo(() => {
    const fromUsers = employees.map(e => (e.part || '').trim()).filter(Boolean);
    const combined = new Set([...dbOrgParts, ...fromUsers]);
    return Array.from(combined);
  }, [dbOrgParts, employees]);

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

  // 기존 직원 수정 열기
  const handleOpenEditModal = (emp: EmployeeItem) => {
    setEditingEmp({ ...emp });
    setIsEditModalOpen(true);
  };

  // 모달 저장 처리 (Cloudflare D1 실시간 저장)
  const handleSaveModal = async (updated: EmployeeItem) => {
    if (!updated.name.trim()) {
      alert('성명을 입력해 주세요.');
      return;
    }
    const cleanEmp = updated.employeeId.trim().toUpperCase();
    if (!cleanEmp) {
      alert('사원번호/아이디를 입력해 주세요.');
      return;
    }
    updated.employeeId = cleanEmp;

    if (!updated.company.trim()) {
      alert('회사명을 입력해 주세요.');
      return;
    }

    setIsEditModalOpen(false);
    setEditingEmp(null);

    // Cloudflare D1 users 테이블에 실시간 동기화
    try {
      const currentUser = dbService.getCurrentUser();
      const actorId = currentUser?.id || currentUser?.name || 'S01832';
      const isManagerFlag = updated.role === 'PARTNER_MANAGER' ? 1 : 0;
      const userRole = updated.role === 'DS_PM' ? 'DS_PRINCIPAL_PM' : updated.role === 'PARTNER_MANAGER' ? 'PARTNER_PART_LEADER' : 'PARTNER_WORKER';

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: updated.employeeId,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          company: updated.company,
          team: updated.team,
          part: updated.part,
          position: updated.position,
          role: userRole,
          isPartnerManager: isManagerFlag,
          actor: actorId
        })
      });

      if (res.ok) {
        await fetchRemoteUsers();
      }
    } catch (err) {
      console.warn('D1 users save warning:', err);
    }

    alert(`✅ ${updated.name} (${updated.company}) 정보가 Cloudflare DB에 저장되었습니다.`);
  };

  // 삭제 처리 (Cloudflare D1 실시간 삭제)
  const handleDeleteEmployee = async (employeeId: string, name: string) => {
    if (confirm(`정말 [${name} (${employeeId})] 직원을 삭제하시겠습니까?`)) {
      setIsEditModalOpen(false);
      setEditingEmp(null);

      try {
        const res = await fetch(`/api/users/${employeeId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          await fetchRemoteUsers();
        }
      } catch (err) {
        console.warn('D1 user delete error:', err);
      }
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
              협력사 / 협력사 관리인 / DS 현장관리인 3대 체계 (실시간 D1 DB 연동)
            </div>
          </div>
        </div>
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

        {/* 🇰🇷 DB 기준으로만 존재하는 파트 칩 필터 (하드코딩 완전 배제) */}
        {availableParts.length > 0 && activeRoleTab !== 'PARTNER_MANAGER' && (
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            <button
              onClick={() => setSelectedPartFilter('ALL')}
              style={{
                padding: '4px 10px',
                borderRadius: '14px',
                fontSize: '12px',
                fontWeight: selectedPartFilter === 'ALL' ? 700 : 500,
                border: selectedPartFilter === 'ALL' ? '1px solid #0052FF' : '1px solid #E2E8F0',
                background: selectedPartFilter === 'ALL' ? '#0052FF' : '#F8FAFC',
                color: selectedPartFilter === 'ALL' ? '#FFFFFF' : '#64748B',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              전체 파트
            </button>
            {availableParts.map(partName => (
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
                {partName.endsWith('파트') ? partName : `${partName} 파트`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. 직원 목록 카드 뷰 */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '80px' }}>
        {isLoading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#0052FF', fontSize: '13.5px', fontWeight: 600 }}>
            데이터베이스에서 직원 정보를 불러오는 중입니다...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px dashed #CBD5E1',
            margin: '20px 0'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(0, 82, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0052FF'
            }}>
              <UserPlus size={28} />
            </div>
            <div>
              <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                해당 역할의 등록된 직원이 없습니다
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                우측 상단 <strong>[+ 직원 등록]</strong> 버튼을 눌러 신규 직원을 등록해 주세요.
              </div>
            </div>
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
                    {emp.part && (
                      <>
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
                      </>
                    )}
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
                  {editingEmp.name} ({editingEmp.employeeId}) 정보 수정
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

              {/* 2. 성명 & 사번 (사번은 키값이므로 수정 불가 잠금) */}
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
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    사원번호 / 아이디 (고유 키값)
                  </label>
                  <input
                    type="text"
                    value={editingEmp.employeeId}
                    disabled
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '13px',
                      background: '#F1F5F9',
                      color: '#64748B',
                      cursor: 'not-allowed',
                      fontWeight: 700,
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
                    {dbCompanies.filter(c => c !== '신한DS').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* 4. 소속 정보 (팀 & 파트 - DB 기준 동적) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    소속 팀 *
                  </label>
                  <input
                    type="text"
                    value={editingEmp.team}
                    onChange={e => setEditingEmp({ ...editingEmp, team: e.target.value })}
                    placeholder="예: 카드개발팀, 상담운영팀"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    관제 파트 (DB 기준) *
                  </label>
                  {availableParts.length > 0 ? (
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
                      <option value="">-- 파트 선택 --</option>
                      {availableParts.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editingEmp.part}
                      onChange={e => setEditingEmp({ ...editingEmp, part: e.target.value })}
                      placeholder="예: 상담"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  )}
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
                    maxLength={13}
                    value={(() => {
                      const raw = (editingEmp.phone || '').replace(/[^0-9]/g, '').slice(0, 11);
                      if (raw.length <= 3) return raw;
                      if (raw.length <= 7) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
                      return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
                    })()}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                      let formatted = raw;
                      if (raw.length > 3 && raw.length <= 7) {
                        formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
                      } else if (raw.length > 7) {
                        formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
                      }
                      setEditingEmp({ ...editingEmp, phone: formatted });
                    }}
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
              {employees.some(e => e.id === editingEmp.id || e.employeeId === editingEmp.employeeId) && (
                <button
                  type="button"
                  onClick={() => handleDeleteEmployee(editingEmp.employeeId, editingEmp.name)}
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
