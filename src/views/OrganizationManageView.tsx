import React, { useState } from 'react';
import { ArrowLeft, Filter, Search, MapPin } from 'lucide-react';

export interface OrgUnit {
  id: string;
  hierarchyPath: string; // e.g. 신한DS > 카드개발팀 > 카드IS파트
  teamName: string; // e.g. 카드개발팀
  locationName: string; // e.g. 파인에비뉴(카드)
  memberCount: number;
}

export const defaultOrgUnits: OrgUnit[] = [
  {
    id: 'org-01',
    hierarchyPath: '신한DS > 카드개발팀 > 카드IS파트',
    teamName: '카드개발팀',
    locationName: '파인에비뉴(카드)',
    memberCount: 8
  },
  {
    id: 'org-02',
    hierarchyPath: '신한DS > 플랫폼개발팀 > 땡겨요파트',
    teamName: '플랫폼개발팀',
    locationName: 'AIA타워',
    memberCount: 12
  },
  {
    id: 'org-03',
    hierarchyPath: '신한DS > 데이터센터운영팀 > 클라우드인프라파트',
    teamName: '데이터센터운영팀',
    locationName: 'KT IDC',
    memberCount: 6
  },
  {
    id: 'org-04',
    hierarchyPath: '(주)협력아이티에스 > 코어개발팀 > 코어파트',
    teamName: '코어개발 1팀',
    locationName: '파인에비뉴(카드)',
    memberCount: 8
  }
];

interface OrganizationManageViewProps {
  onBack: () => void;
  onOpenOrgDetail: (org: OrgUnit) => void;
  onNavigateToLocationDetail?: (locationName: string) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const OrganizationManageView: React.FC<OrganizationManageViewProps> = ({
  onBack,
  onOpenOrgDetail,
  onNavigateToLocationDetail,
  themeMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrgs = defaultOrgUnits.filter(org =>
    org.hierarchyPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.locationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 (← 조직 관리 | 필터) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>조직 관리</span>
        </div>

        <button 
          onClick={() => alert('조직 필터: 본부별, 협력사별, 지정 근무지별 필터링')}
          style={{ color: '#4E5968', display: 'flex', alignItems: 'center', padding: '4px' }}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* 2. 검색창 (스크린샷 일치) */}
      <div style={{ padding: '12px 16px 8px 16px' }}>
        <div style={{
          height: '42px',
          background: '#F1F3F5',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '8px'
        }}>
          <Search size={18} color="#8B95A1" />
          <input
            type="text"
            placeholder="검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '15px',
              color: '#191F28',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* 3. 조직 목록 (스크린샷 100% 일치) */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '70px' }}>
        {filteredOrgs.map(org => (
          <div
            key={org.id}
            onClick={() => onOpenOrgDetail(org)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 18px',
              borderBottom: '1px solid #ECEFF2',
              background: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <div style={{
                fontSize: '14.5px',
                fontWeight: 700,
                color: '#191F28',
                lineHeight: 1.4,
                marginBottom: '4px'
              }}>
                {org.hierarchyPath} &nbsp; <span style={{ fontWeight: 800 }}>{org.teamName}</span>
              </div>
            </div>

            {/* 우측 핀 아이콘 (근무지 위치 확인) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onNavigateToLocationDetail) {
                  onNavigateToLocationDetail(org.locationName);
                } else {
                  alert(`📍 [${org.teamName}] 소속 지정 근무지: ${org.locationName}`);
                }
              }}
              style={{
                color: '#191F28',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px'
              }}
              title="지정 근무지 좌표 보기"
            >
              <MapPin size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
