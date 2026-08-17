import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Building2, 
  Plus, 
  ChevronRight, 
  X,
  Users,
  FolderPlus
} from 'lucide-react';
import { dbService } from '../services/db';

export interface OrgUnit {
  id: string;
  hierarchyPath: string; // e.g. 신한DS > 카드개발 > 상담
  companyName: string;
  teamName: string;
  partName: string;
  leaderName: string; // 성명만 저장 (예: 박성진, 조경훈)
  locationName: string;
  memberCount: number;
  description?: string;
}

export interface CompanyItem {
  id: string;
  company_code: string;
  company_name: string;
  biz_number: string;
  company_type: 'SHINHAN_DS' | 'PARTNER' | 'SUB_CONTRACTOR';
  contact_person: string;
  contact_phone: string;
  description?: string;
  created_at?: string;
}

// 이름 정제 헬퍼 함수 (PM, 신한DS, 괄호 제거)
const cleanLeaderName = (name: string): string => {
  return (name || '')
    .replace(/PM/gi, '')
    .replace(/신한DS/gi, '')
    .replace(/[\(\)\[\]]/g, '')
    .trim();
};

// 사업자등록번호 자동 포맷팅 (000-00-00000, 10자리 제한)
const formatBizNumber = (value: string): string => {
  const digits = (value || '').replace(/[^0-9]/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 10)}`;
};

// 전화번호/연락처 자동 포맷팅 (010-0000-0000 / 02-0000-0000, 최대 11자리 제한)
const formatPhoneNumber = (value: string): string => {
  const digits = (value || '').replace(/[^0-9]/g, '').slice(0, 11);
  if (!digits) return '';

  // 서울 지역번호 (02)
  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  // 휴대폰 및 기타 지역번호 (010, 031, 070 등)
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

export const initialOrgUnits: OrgUnit[] = [];
export const defaultOrgUnits = initialOrgUnits;

interface OrganizationManageViewProps {
  onBack: () => void;
  onSelectOrg: (org: OrgUnit) => void;
  onNavigateToLocationDetail?: (locationName: string) => void;
  themeMode?: 'ddangyo' | 'shinhan';
}

export const OrganizationManageView: React.FC<OrganizationManageViewProps> = ({
  onBack,
  onSelectOrg,
  onNavigateToLocationDetail
}) => {
  // 상단 탭: 'ORG' (도급 조직/팀/파트) | 'COMPANY' (협력사/소속사 관리)
  const [activeTab, setActiveTab] = useState<'ORG' | 'COMPANY'>('ORG');

  // 로컬스토리지 전면 제거: 순수 Cloudflare D1 DB 실시간 상태
  const [orgList, setOrgList] = useState<OrgUnit[]>([]);
  const [companyList, setCompanyList] = useState<CompanyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 신규 조직 추가/수정 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrgUnit | null>(null);

  // 협력사 추가/수정 모달 상태
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);

  // Cloudflare D1 shifti-db 원격 실시간 조회 (조직 목록)
  const fetchRemoteOrgs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://sguardai.khcho0421.workers.dev/organizations');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: OrgUnit[] = json.data.map((item: any) => ({
            id: item.id || `org-${Date.now()}`,
            hierarchyPath: item.hierarchy_path || `신한DS > ${item.team_name || '카드개발'} > ${item.part_name}`,
            companyName: item.company_name || '신한DS',
            teamName: item.team_name || '카드개발',
            partName: item.part_name || '',
            leaderName: cleanLeaderName(item.leader_name),
            locationName: item.location_name || '파인에비뉴(카드)',
            memberCount: item.member_count !== undefined ? Number(item.member_count) : 0,
            description: item.description || ''
          }));
          setOrgList(mapped);
        }
      }
    } catch (err) {
      console.warn('Organizations fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cloudflare D1 shifti-db 원격 실시간 조회 (협력사 목록)
  const fetchRemoteCompanies = async () => {
    try {
      const res = await fetch('https://sguardai.khcho0421.workers.dev/companies');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCompanyList(json.data);
        }
      }
    } catch (err) {
      console.warn('Companies fetch error:', err);
    }
  };

  useEffect(() => {
    try {
      localStorage.removeItem('SGUARD_ORG_UNITS_USER_DATA');
      localStorage.removeItem('SGUARD_ORG_UNITS_DATA_V3');
      localStorage.removeItem('SGUARD_ORG_UNITS_DATA_V2');
      localStorage.removeItem('SGUARD_ORG_UNITS_DATA');
    } catch (e) {}
    fetchRemoteOrgs();
    fetchRemoteCompanies();
  }, []);

  // 필터링된 조직 목록
  const filteredOrgs = useMemo(() => {
    return orgList.filter(org => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match = 
          org.hierarchyPath.toLowerCase().includes(q) ||
          org.companyName.toLowerCase().includes(q) ||
          org.teamName.toLowerCase().includes(q) ||
          org.partName.toLowerCase().includes(q) ||
          org.leaderName.toLowerCase().includes(q) ||
          org.locationName.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [orgList, searchQuery]);

  // 필터링된 협력사 목록
  const filteredCompanies = useMemo(() => {
    return companyList.filter(comp => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match = 
          comp.company_name.toLowerCase().includes(q) ||
          (comp.company_code || '').toLowerCase().includes(q) ||
          (comp.biz_number || '').toLowerCase().includes(q) ||
          (comp.contact_person || '').toLowerCase().includes(q) ||
          (comp.contact_phone || '').toLowerCase().includes(q) ||
          (comp.description || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [companyList, searchQuery]);

  // 총 인원수 합산
  const totalMembers = useMemo(() => {
    return orgList.reduce((acc, curr) => acc + (curr.memberCount || 0), 0);
  }, [orgList]);

  // 협력사 신규 추가 열기
  const handleOpenAddCompany = () => {
    const newComp: CompanyItem = {
      id: `comp-${Date.now()}`,
      company_code: '',
      company_name: '',
      biz_number: '',
      company_type: 'PARTNER',
      contact_person: '',
      contact_phone: '',
      description: ''
    };
    setEditingCompany(newComp);
    setIsCompanyModalOpen(true);
  };

  // 협력사 저장 처리
  const handleSaveCompany = async () => {
    if (!editingCompany) return;
    if (!editingCompany.company_name.trim()) {
      alert('협력사(회사)명을 입력해 주세요.');
      return;
    }

    const payload = {
      ...editingCompany,
      company_name: editingCompany.company_name.trim(),
      company_code: editingCompany.company_code.trim() || `COMP_${Date.now().toString(36).toUpperCase()}`,
      biz_number: formatBizNumber(editingCompany.biz_number || ''),
      contact_person: editingCompany.contact_person.trim(),
      contact_phone: formatPhoneNumber(editingCompany.contact_phone || ''),
      description: (editingCompany.description || '').trim()
    };

    setIsCompanyModalOpen(false);
    setEditingCompany(null);

    try {
      const currentUser = dbService.getCurrentUser();
      const actorId = currentUser?.id || currentUser?.name || 'S01832';
      const res = await fetch('https://sguardai.khcho0421.workers.dev/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          actor: actorId
        })
      });
      if (res.ok) {
        await fetchRemoteCompanies();
        alert(`✅ [${payload.company_name}] 협력사 정보가 DB에 안전하게 저장되었습니다.`);
      } else {
        const data = await res.json();
        alert(`오류: ${data.error || '협력사 저장에 실패했습니다.'}`);
      }
    } catch (err) {
      console.warn('Company save warning:', err);
      alert('협력사 저장 중 오류가 발생했습니다.');
    }
  };

  // 협력사 삭제 처리
  const handleDeleteCompany = async (id: string, name: string) => {
    if (name === '신한DS') {
      alert('신한DS 기본 원청사는 삭제할 수 없습니다.');
      return;
    }

    if (confirm(`정말 [${name}] 협력사를 삭제하시겠습니까?\n삭제 시 회원가입 소속 선택 등에서 제외됩니다.`)) {
      setIsCompanyModalOpen(false);
      setEditingCompany(null);

      try {
        const res = await fetch(`https://sguardai.khcho0421.workers.dev/companies/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          await fetchRemoteCompanies();
          alert(`🗑️ [${name}] 협력사가 성공적으로 삭제되었습니다.`);
        } else {
          const data = await res.json();
          alert(`오류: ${data.error || '협력사 삭제에 실패했습니다.'}`);
        }
      } catch (err) {
        console.warn('Company delete warning:', err);
        alert('협력사 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 신규 추가 열기
  const handleOpenAdd = () => {
    const newOrg: OrgUnit = {
      id: `org-${Date.now()}`,
      companyName: '신한DS',
      teamName: '카드개발',
      partName: '',
      hierarchyPath: '',
      leaderName: '',
      locationName: '파인에비뉴(카드)',
      memberCount: 0,
      description: ''
    };
    setEditingOrg(newOrg);
    setIsAddModalOpen(true);
  };

  // 모달 저장 (Cloudflare D1 직접 실시간 저장)
  const handleSaveModal = async () => {
    if (!editingOrg) return;

    if (!editingOrg.partName.trim()) {
      alert('소속 파트명을 입력해 주세요. (예: 상담, 오토금융, 카드IS 등)');
      return;
    }

    const team = '카드개발';
    const part = editingOrg.partName.trim();
    const cleanLeader = cleanLeaderName(editingOrg.leaderName);
    const computedPath = `신한DS > ${team} > ${part}`;

    const finalItem: OrgUnit = {
      ...editingOrg,
      companyName: '신한DS',
      teamName: team,
      partName: part,
      leaderName: cleanLeader,
      hierarchyPath: computedPath,
      memberCount: Number(editingOrg.memberCount) || 0
    };

    setIsAddModalOpen(false);
    setEditingOrg(null);

    // Cloudflare D1 shifti-db organizations 테이블에 실시간 동기화
    try {
      const currentUser = dbService.getCurrentUser();
      const actorId = currentUser?.id || currentUser?.name || 'S01832';
      const res = await fetch('https://sguardai.khcho0421.workers.dev/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...finalItem,
          actor: actorId
        })
      });
      if (res.ok) {
        await fetchRemoteOrgs();
      }
    } catch (err) {
      console.warn('D1 organizations save warning:', err);
    }

    alert(`✅ [${finalItem.hierarchyPath}] 조직 정보가 DB에 안전하게 저장되었습니다.\n• 협력사 투입 인원: ${finalItem.memberCount}명`);
  };

  // 삭제 처리 (Cloudflare D1 직접 삭제)
  const handleDeleteOrg = async (id: string, name: string) => {
    if (confirm(`정말 [${name}] 조직을 삭제하시겠습니까?`)) {
      setIsAddModalOpen(false);
      setEditingOrg(null);

      // Cloudflare D1 shifti-db organizations 테이블 삭제 동기화
      try {
        const res = await fetch(`https://sguardai.khcho0421.workers.dev/organizations/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          await fetchRemoteOrgs();
        }
      } catch (err) {
        console.warn('D1 organizations delete warning:', err);
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
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
              {activeTab === 'ORG' ? '조직 관리' : '협력사 관리'}
            </span>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
              {activeTab === 'ORG' ? '도급 공정 수행 조직도 (신한DS ➔ 팀 ➔ 파트 체계)' : '신한DS 및 도급 협력사·소속사 마스터 관리'}
            </div>
          </div>
        </div>

        {activeTab === 'ORG' ? (
          <button 
            onClick={handleOpenAdd}
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
            <span>조직 추가</span>
          </button>
        ) : (
          <button 
            onClick={handleOpenAddCompany}
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
            <span>협력사 추가</span>
          </button>
        )}
      </div>

      {/* 2. 상단 2대 마스터 전환 탭 바 (도급 조직 vs 협력사 관리) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 16px'
      }}>
        <button
          onClick={() => { setActiveTab('ORG'); setSearchQuery(''); }}
          style={{
            padding: '12px 8px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'ORG' ? '2.5px solid #0052FF' : '2.5px solid transparent',
            color: activeTab === 'ORG' ? '#0052FF' : '#64748B',
            fontSize: '13.5px',
            fontWeight: activeTab === 'ORG' ? 800 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Building2 size={16} />
          <span>도급 조직 ({orgList.length}개 파트)</span>
        </button>

        <button
          onClick={() => { setActiveTab('COMPANY'); setSearchQuery(''); }}
          style={{
            padding: '12px 8px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'COMPANY' ? '2.5px solid #0052FF' : '2.5px solid transparent',
            color: activeTab === 'COMPANY' ? '#0052FF' : '#64748B',
            fontSize: '13.5px',
            fontWeight: activeTab === 'COMPANY' ? 800 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Users size={16} />
          <span>협력사 관리 ({companyList.length}개 사)</span>
        </button>
      </div>

      {/* 3. 요약 배너 */}
      {activeTab === 'ORG' ? (
        <div style={{
          padding: '12px 18px',
          background: 'linear-gradient(135deg, rgba(0,82,255,0.06) 0%, rgba(0,229,255,0.03) 100%)',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} color="#0052FF" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
              신한DS 도급 공정 수행 조직
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              background: '#0052FF',
              color: '#FFFFFF',
              padding: '1px 7px',
              borderRadius: '10px'
            }}>
              총 {orgList.length}개 파트
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
            <Users size={14} color="#0052FF" />
            <span>협력사 총 투입 인원: <strong style={{ color: '#0052FF' }}>{totalMembers.toLocaleString()}명</strong></span>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '12px 18px',
          background: 'linear-gradient(135deg, rgba(0,82,255,0.06) 0%, rgba(0,229,255,0.03) 100%)',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} color="#0052FF" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
              원청 및 도급 참여 협력사
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              background: '#0052FF',
              color: '#FFFFFF',
              padding: '1px 7px',
              borderRadius: '10px'
            }}>
              총 {companyList.length}개 사
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
            <span>원청사: <strong>1</strong></span>
            <span>•</span>
            <span>협력사: <strong style={{ color: '#0052FF' }}>{companyList.filter(c => c.company_type !== 'SHINHAN_DS').length}</strong></span>
          </div>
        </div>
      )}

      {/* 4. 검색창 */}
      <div style={{ padding: '12px 16px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
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
            placeholder={activeTab === 'ORG' ? '조직명, 팀, 파트, 담당자 성명, 근무지 검색...' : '회사명, 회사코드, 사업자번호, 담당자, 연락처 검색...'}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '13.5px',
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
      </div>

      {/* 5. 카드 리스트 영역 (조직 vs 협력사) */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '80px' }}>
        {activeTab === 'ORG' ? (
          /* ================= [조직 리스트] ================= */
          isLoading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#0052FF', fontSize: '13.5px', fontWeight: 600 }}>
              데이터베이스에서 조직 정보를 불러오는 중입니다...
            </div>
          ) : orgList.length === 0 ? (
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
                <FolderPlus size={28} />
              </div>
              <div>
                <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  등록된 도급 공정 조직이 없습니다
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                  우측 상단 <strong>[+ 조직 추가]</strong> 버튼을 눌러 신규 팀 및 파트 조직을 등록해 주세요.
                </div>
              </div>
              <button
                onClick={handleOpenAdd}
                style={{
                  marginTop: '6px',
                  background: '#0052FF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(0, 82, 255, 0.25)'
                }}
              >
                <Plus size={16} />
                <span>첫 조직 등록하기</span>
              </button>
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '13.5px' }}>
              검색 조건에 해당하는 조직이 없습니다.
            </div>
          ) : (
            filteredOrgs.map(org => (
              <div
                key={org.id}
                onClick={() => {
                  setEditingOrg({ 
                    ...org,
                    leaderName: cleanLeaderName(org.leaderName)
                  });
                  setIsAddModalOpen(true);
                }}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, paddingRight: '10px' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap'
                  }}>
                    <span>{org.hierarchyPath}</span>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: 'rgba(0, 82, 255, 0.08)',
                      color: '#0052FF',
                      fontWeight: 700
                    }}>
                      {org.teamName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: '#64748B', flexWrap: 'wrap' }}>
                    {org.leaderName && (
                      <span style={{ fontWeight: 700, color: '#1E293B' }}>
                        👤 {cleanLeaderName(org.leaderName)}
                      </span>
                    )}
                    {org.leaderName && <span>•</span>}
                    <span>
                      👥 협력사 투입 인원: <strong>{org.memberCount}명</strong>
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#0052FF', fontWeight: 600 }}>
                      <MapPin size={12} />
                      {org.locationName}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigateToLocationDetail) {
                        onNavigateToLocationDetail(org.locationName);
                      } else {
                        onSelectOrg(org);
                      }
                    }}
                    style={{
                      background: 'rgba(0, 82, 255, 0.08)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#0052FF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="지정 근무지 보기"
                  >
                    <MapPin size={16} />
                  </button>
                  <ChevronRight size={18} color="#94A3B8" />
                </div>
              </div>
            ))
          )
        ) : (
          /* ================= [협력사 리스트] ================= */
          filteredCompanies.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '13.5px' }}>
              검색 조건에 해당하는 협력사가 없습니다.
            </div>
          ) : (
            filteredCompanies.map(comp => {
              const isDS = comp.company_type === 'SHINHAN_DS' || comp.company_name === '신한DS';
              return (
                <div
                  key={comp.id}
                  onClick={() => {
                    setEditingCompany({ ...comp });
                    setIsCompanyModalOpen(true);
                  }}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: isDS ? '1.5px solid #0052FF' : '1px solid #E2E8F0',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: isDS ? '0 2px 8px rgba(0, 82, 255, 0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, paddingRight: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                        {comp.company_name}
                      </span>
                      {isDS ? (
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#0052FF',
                          color: '#FFFFFF',
                          fontWeight: 800
                        }}>
                          원청사 (신한DS)
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(0, 229, 255, 0.12)',
                          color: '#0072FF',
                          fontWeight: 700,
                          border: '1px solid rgba(0, 114, 255, 0.2)'
                        }}>
                          {comp.company_type === 'SUB_CONTRACTOR' ? '2차 수급사' : '도급 협력사'}
                        </span>
                      )}
                      {comp.biz_number && (
                        <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>
                          ({comp.biz_number})
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#64748B', flexWrap: 'wrap' }}>
                      {comp.contact_person && (
                        <span>
                          👤 담당자: <strong style={{ color: '#1E293B' }}>{comp.contact_person}</strong>
                        </span>
                      )}
                      {comp.contact_person && comp.contact_phone && <span>•</span>}
                      {comp.contact_phone && (
                        <span>
                          📞 {comp.contact_phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={18} color="#94A3B8" />
                </div>
              );
            })
          )
        )}
      </div>

      {/* 6. 조직 상세 정보 및 편집/추가 모달 */}
      {isAddModalOpen && editingOrg && (
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
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#0052FF" />
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                  {editingOrg.partName ? `${editingOrg.teamName} > ${editingOrg.partName}` : '새 조직 등록'}
                </span>
              </div>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditingOrg(null); }}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  최상위 원청 조직
                </label>
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
                    color: '#0052FF',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    소속 팀명 (기본 고정)
                  </label>
                  <input
                    type="text"
                    value="카드개발"
                    disabled
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    소속 파트명 *
                  </label>
                  <input
                    type="text"
                    value={editingOrg.partName}
                    onChange={e => setEditingOrg({ ...editingOrg, partName: e.target.value })}
                    placeholder="예: 상담"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  신한DS 담당 PM (성명)
                </label>
                <input
                  type="text"
                  value={editingOrg.leaderName}
                  onChange={e => setEditingOrg({ ...editingOrg, leaderName: cleanLeaderName(e.target.value) })}
                  placeholder="예: 조경훈"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    지정 근무지 위치
                  </label>
                  <input
                    type="text"
                    value={editingOrg.locationName}
                    onChange={e => setEditingOrg({ ...editingOrg, locationName: e.target.value })}
                    placeholder="예: 파인에비뉴(카드)"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    협력사 투입 인원 (명)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingOrg.memberCount}
                    onChange={e => setEditingOrg({ ...editingOrg, memberCount: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0052FF',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  도급 과업 개요 및 비고
                </label>
                <textarea
                  value={editingOrg.description || ''}
                  onChange={e => setEditingOrg({ ...editingOrg, description: e.target.value })}
                  placeholder="도급 과업 및 인력 투입 관련 참고사항을 입력하세요."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    resize: 'none',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* 모달 하단 액션 버튼 */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              gap: '10px'
            }}>
              {orgList.some(o => o.id === editingOrg.id) && (
                <button
                  type="button"
                  onClick={() => handleDeleteOrg(editingOrg.id, editingOrg.hierarchyPath)}
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
                onClick={() => { setIsAddModalOpen(false); setEditingOrg(null); }}
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
                onClick={handleSaveModal}
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

      {/* 7. 협력사 상세 정보 및 편집/추가 모달 */}
      {isCompanyModalOpen && editingCompany && (
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
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#0052FF" />
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                  {editingCompany.company_name ? `${editingCompany.company_name} 정보 수정` : '새 협력사 등록'}
                </span>
              </div>
              <button
                onClick={() => { setIsCompanyModalOpen(false); setEditingCompany(null); }}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  회사명 (소속명) *
                </label>
                <input
                  type="text"
                  value={editingCompany.company_name}
                  disabled={editingCompany.company_name === '신한DS'}
                  onChange={e => setEditingCompany({ ...editingCompany, company_name: e.target.value })}
                  placeholder="예: 유브갓, (주)협력아이티에스"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: editingCompany.company_name === '신한DS' ? '#0052FF' : '#0F172A',
                    background: editingCompany.company_name === '신한DS' ? '#F1F5F9' : '#FFFFFF',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    회사 구분 *
                  </label>
                  <select
                    value={editingCompany.company_type}
                    disabled={editingCompany.company_name === '신한DS'}
                    onChange={e => setEditingCompany({ ...editingCompany, company_type: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      background: editingCompany.company_name === '신한DS' ? '#F1F5F9' : '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  >
                    <option value="PARTNER">도급 협력사 (1차)</option>
                    <option value="SUB_CONTRACTOR">재도급사 (2차)</option>
                    <option value="SHINHAN_DS">신한DS (원청)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    사업자등록번호 (10자리)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={editingCompany.biz_number || ''}
                    onChange={e => setEditingCompany({ ...editingCompany, biz_number: formatBizNumber(e.target.value) })}
                    placeholder="예: 220-88-67890"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    담당자 성명/직책
                  </label>
                  <input
                    type="text"
                    value={editingCompany.contact_person || ''}
                    onChange={e => setEditingCompany({ ...editingCompany, contact_person: e.target.value })}
                    placeholder="예: 최영호 대표"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    담당자 연락처
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={13}
                    value={editingCompany.contact_phone || ''}
                    onChange={e => setEditingCompany({ ...editingCompany, contact_phone: formatPhoneNumber(e.target.value) })}
                    placeholder="예: 010-8888-9999"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  회사 비고 및 도급 계약 정보
                </label>
                <textarea
                  value={editingCompany.description || ''}
                  onChange={e => setEditingCompany({ ...editingCompany, description: e.target.value })}
                  placeholder="협력사 주요 담당 업무, 계약 기간 등 비고를 입력하세요."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              {editingCompany.company_name && editingCompany.company_name !== '신한DS' && (
                <button
                  type="button"
                  onClick={() => handleDeleteCompany(editingCompany.id, editingCompany.company_name)}
                  style={{
                    background: '#FEE2E2',
                    color: '#EF4444',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  협력사 삭제
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                <button
                  type="button"
                  onClick={() => { setIsCompanyModalOpen(false); setEditingCompany(null); }}
                  style={{
                    background: '#E2E8F0',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveCompany}
                  style={{
                    background: '#0052FF',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 82, 255, 0.25)'
                  }}
                >
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
