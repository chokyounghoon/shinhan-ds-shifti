import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Building2, 
  Plus, 
  ChevronRight, 
  X, 
  Users
} from 'lucide-react';

export interface OrgUnit {
  id: string;
  hierarchyPath: string; // e.g. 신한DS > 카드개발팀 > 카드IS파트
  companyName: string;
  teamName: string;
  partName: string;
  leaderName: string;
  locationName: string;
  memberCount: number;
  description?: string;
}

// 신한DS ➔ 팀 ➔ 파트 도급 공정 수행 단일 표준 조직 데이터
export const initialOrgUnits: OrgUnit[] = [
  {
    id: 'org-01',
    hierarchyPath: '신한DS > 카드개발팀 > 카드IS파트',
    companyName: '신한DS',
    teamName: '카드개발팀',
    partName: '카드IS파트',
    leaderName: '박성진 PM (신한DS)',
    locationName: '파인에비뉴(카드)',
    memberCount: 120,
    description: '신한카드 기간계 계정계 및 승인 코어 시스템 도급 인력 투입 조직'
  },
  {
    id: 'org-02',
    hierarchyPath: '신한DS > 상담운영팀 > 상담파트',
    companyName: '신한DS',
    teamName: '상담운영팀',
    partName: '상담파트',
    leaderName: '조경훈 PM (신한DS)',
    locationName: '파인에비뉴(상담센터)',
    memberCount: 120,
    description: '신한카드 고객 인바운드/VIP 전문 상담 도급 투입 조직'
  },
  {
    id: 'org-03',
    hierarchyPath: '신한DS > 금융개발팀 > 오토파트',
    companyName: '신한DS',
    teamName: '금융개발팀',
    partName: '오토파트',
    leaderName: '강민우 PM (신한DS)',
    locationName: '여의도 금융센터',
    memberCount: 120,
    description: '오토금융 다이렉트 할부 및 리스/렌터카 대금 정산 도급 투입'
  },
  {
    id: 'org-04',
    hierarchyPath: '신한DS > 재무회계팀 > 재무파트',
    companyName: '신한DS',
    teamName: '재무회계팀',
    partName: '재무파트',
    leaderName: '송진호 PM (신한DS)',
    locationName: '신한백암빌딩',
    memberCount: 120,
    description: '일일 결제대금 대사 및 회계 전표 인터페이스 도급 투입'
  },
  {
    id: 'org-05',
    hierarchyPath: '신한DS > 결제인프라팀 > 결제망파트',
    companyName: '신한DS',
    teamName: '결제인프라팀',
    partName: '결제망파트',
    leaderName: '최동욱 PM (신한DS)',
    locationName: '상암 IT센터',
    memberCount: 120,
    description: '가맹점 VAN/PG 결제망 인터페이스 무중단 운영 도급 투입'
  },
  {
    id: 'org-06',
    hierarchyPath: '신한DS > 플랫폼개발팀 > 땡겨요파트',
    companyName: '신한DS',
    teamName: '플랫폼개발팀',
    partName: '땡겨요파트',
    leaderName: '임도현 PM (신한DS)',
    locationName: 'AIA타워',
    memberCount: 120,
    description: '상생 배달앱 땡겨요 가맹점/라이더 실시간 주문 정산 도급 투입'
  },
  {
    id: 'org-07',
    hierarchyPath: '신한DS > 데이터센터운영팀 > 클라우드인프라파트',
    companyName: '신한DS',
    teamName: '데이터센터운영팀',
    partName: '클라우드인프라파트',
    leaderName: '고영진 PM (신한DS)',
    locationName: 'KT IDC',
    memberCount: 120,
    description: '프라이빗/하이브리드 금융 클라우드 인프라 관제 도급 투입'
  }
];

export const defaultOrgUnits = initialOrgUnits;

const STORAGE_KEY_ORGS = 'SGUARD_ORG_UNITS_DATA_V2';

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
  const [orgList, setOrgList] = useState<OrgUnit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialOrgUnits;
  });

  const [searchQuery, setSearchQuery] = useState('');

  // 신규 조직 추가/수정 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrgUnit | null>(null);

  // 로컬스토리지 저장
  const saveOrgs = (list: OrgUnit[]) => {
    setOrgList(list);
    try {
      localStorage.setItem(STORAGE_KEY_ORGS, JSON.stringify(list));
    } catch (e) {}
  };

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

  // 총 인원수 합산
  const totalMembers = useMemo(() => {
    return orgList.reduce((acc, curr) => acc + (curr.memberCount || 0), 0);
  }, [orgList]);

  // 신규 추가 열기
  const handleOpenAdd = () => {
    const newOrg: OrgUnit = {
      id: `org-${Date.now()}`,
      companyName: '신한DS',
      teamName: '카드개발팀',
      partName: '신규파트',
      hierarchyPath: '신한DS > 카드개발팀 > 신규파트',
      leaderName: '조경훈 PM (신한DS)',
      locationName: '파인에비뉴(카드)',
      memberCount: 120,
      description: '도급 과업 수행 및 인력 투입 관제 조직'
    };
    setEditingOrg(newOrg);
    setIsAddModalOpen(true);
  };

  // 모달 저장
  const handleSaveModal = (updated: OrgUnit) => {
    if (!updated.teamName.trim() || !updated.partName.trim()) {
      alert('팀명과 파트명을 모두 입력해 주세요.');
      return;
    }

    const computedPath = `신한DS > ${updated.teamName} > ${updated.partName}`;

    const finalItem: OrgUnit = {
      ...updated,
      companyName: '신한DS',
      hierarchyPath: computedPath
    };

    const existsIdx = orgList.findIndex(o => o.id === finalItem.id);
    let newList: OrgUnit[];
    if (existsIdx >= 0) {
      newList = [...orgList];
      newList[existsIdx] = finalItem;
    } else {
      newList = [finalItem, ...orgList];
    }

    saveOrgs(newList);
    setIsAddModalOpen(false);
    setEditingOrg(null);
    alert(`✅ [${finalItem.hierarchyPath}] 조직이 성공적으로 저장되었습니다.`);
  };

  // 삭제 처리
  const handleDeleteOrg = (id: string, name: string) => {
    if (confirm(`정말 [${name}] 조직을 삭제하시겠습니까?`)) {
      const newList = orgList.filter(o => o.id !== id);
      saveOrgs(newList);
      setIsAddModalOpen(false);
      setEditingOrg(null);
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
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>조직 관리</span>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
              도급 공정 수행 조직도 (신한DS ➔ 팀 ➔ 파트 체계)
            </div>
          </div>
        </div>

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
      </div>

      {/* 2. 상단 조직 요약 배너 */}
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
          <span>총 투입 인원: <strong style={{ color: '#0052FF' }}>{totalMembers.toLocaleString()}명</strong></span>
        </div>
      </div>

      {/* 3. 검색창 */}
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
            placeholder="조직명, 팀, 파트, 담당자, 근무지 검색..."
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

      {/* 4. 조직 목록 카드 리스트 */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '80px' }}>
        {filteredOrgs.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '13.5px' }}>
            검색 조건에 해당하는 조직이 없습니다.
          </div>
        ) : (
          filteredOrgs.map(org => (
            <div
              key={org.id}
              onClick={() => {
                setEditingOrg({ ...org });
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
                {/* 상단 계층 경로 (신한DS > 팀 > 파트) */}
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

                {/* 하단 메타 정보 (담당자, 인원 수, 근무지) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: '#64748B', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>
                    👤 {org.leaderName}
                  </span>
                  <span>•</span>
                  <span>
                    👥 인원: <strong>{org.memberCount}명</strong>
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#0052FF', fontWeight: 600 }}>
                    <MapPin size={12} />
                    {org.locationName}
                  </span>
                </div>
              </div>

              {/* 우측 핀 버튼 (근무지 위치 확인) & 화살표 */}
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
        )}
      </div>

      {/* 5. 조직 상세 정보 및 편집/추가 모달 */}
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

            {/* 모달 폼 본문 */}
            <div style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 1. 최상위 원청 조직 */}
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

              {/* 2. 소속 팀 & 파트 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    소속 팀명 *
                  </label>
                  <input
                    type="text"
                    value={editingOrg.teamName}
                    onChange={e => setEditingOrg({ ...editingOrg, teamName: e.target.value })}
                    placeholder="예: 카드개발팀"
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
                    소속 파트명 *
                  </label>
                  <input
                    type="text"
                    value={editingOrg.partName}
                    onChange={e => setEditingOrg({ ...editingOrg, partName: e.target.value })}
                    placeholder="예: 카드IS파트"
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

              {/* 3. 조직 책임자/PM 및 인원 수 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    담당 PM / 현장대리인
                  </label>
                  <input
                    type="text"
                    value={editingOrg.leaderName}
                    onChange={e => setEditingOrg({ ...editingOrg, leaderName: e.target.value })}
                    placeholder="예: 박성진 PM (신한DS)"
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
                    투입 인원 (명)
                  </label>
                  <input
                    type="number"
                    value={editingOrg.memberCount}
                    onChange={e => setEditingOrg({ ...editingOrg, memberCount: Number(e.target.value) })}
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

              {/* 4. 지정 근무지 */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  지정 근무지 위치 *
                </label>
                <select
                  value={editingOrg.locationName}
                  onChange={e => setEditingOrg({ ...editingOrg, locationName: e.target.value })}
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
                  <option value="파인에비뉴(카드)">파인에비뉴(카드)</option>
                  <option value="파인에비뉴(상담센터)">파인에비뉴(상담센터)</option>
                  <option value="여의도 금융센터">여의도 금융센터</option>
                  <option value="신한백암빌딩">신한백암빌딩</option>
                  <option value="상암 IT센터">상암 IT센터</option>
                  <option value="AIA타워">AIA타워</option>
                  <option value="KT IDC">KT IDC</option>
                </select>
              </div>

              {/* 5. 과업 설명 */}
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
                    resize: 'none'
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
                onClick={() => handleSaveModal(editingOrg)}
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
