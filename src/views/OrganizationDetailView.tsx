import React from 'react';
import { ArrowLeft, ChevronRight, MapPin } from 'lucide-react';
import { OrgUnit } from './OrganizationManageView';
import { WorkLocation } from './WorkLocationSelectView';

export interface OrgWorkLocationItem {
  id: string;
  name: string;
  address: string;
}

// 스크린샷과 정확히 일치하는 해당 조직의 출퇴근 장소 목록
export const orgAssignedLocations: OrgWorkLocationItem[] = [
  {
    id: 'org-loc-01',
    name: '[좌표] 패스트파이브_시청1호점',
    address: '서울 중구 남대문로9길 24 패스트파이브 시청1호점'
  },
  {
    id: 'org-loc-02',
    name: '[좌표] 크레디트센터',
    address: '대한민국 서울특별시 마포구 아현동 크레디트센터'
  },
  {
    id: 'org-loc-03',
    name: '[좌표] 원센티널',
    address: '대한민국 서울 영등포구 여의대로 70'
  },
  {
    id: 'org-loc-04',
    name: '[좌표] 하나투어빌딩',
    address: '서울 종로구 인사동5길 41 하나투어빌딩'
  },
  {
    id: 'org-loc-05',
    name: '[좌표] 삼풍넥서스빌딩',
    address: '서울 중구 을지로 158 삼풍넥서스빌딩'
  },
  {
    id: 'org-loc-06',
    name: '[좌표] 현대카드(국회의사당)',
    address: '서울 영등포구 의사당대로 3 현대카드 본사'
  },
  {
    id: 'org-loc-07',
    name: '[좌표] KT IDC',
    address: '서울 영등포구 여의대로 14 KT여의도타워'
  },
  {
    id: 'org-loc-08',
    name: '[좌표] 대법원전산정보센터',
    address: '대한민국 서울 서초구 대법원로 전산정보센터'
  }
];

interface OrganizationDetailViewProps {
  orgUnit: OrgUnit | null;
  onBack: () => void;
  onSelectWorkLocation: (location: WorkLocation) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const OrganizationDetailView: React.FC<OrganizationDetailViewProps> = ({
  orgUnit,
  onBack,
  onSelectWorkLocation,
  themeMode
}) => {
  const orgCode = orgUnit ? orgUnit.teamName : '카드개발팀';
  const orgName = orgUnit ? orgUnit.teamName : '카드개발팀';
  const parentOrg = '카드IS파트';

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 (← 조직) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF',
        gap: '14px'
      }}>
        <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>조직</span>
      </div>

      {/* 2. 상단 조직 메타 정보 (스크린샷 일치) */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={infoRowStyle}>
          <span style={labelStyle}>조직코드</span>
          <span style={valueStyle}>{orgCode}</span>
        </div>

        <div style={infoRowStyle}>
          <span style={labelStyle}>조직명</span>
          <span style={valueStyle}>{orgName}</span>
        </div>

        <div style={infoRowStyle}>
          <span style={labelStyle}>상위 조직</span>
          <span style={valueStyle}>{parentOrg}</span>
        </div>
      </div>

      {/* 3. 출퇴근 장소 섹션 헤더 (스크린샷 일치) */}
      <div style={{
        background: '#F8F9FA',
        padding: '16px 18px 10px 18px',
        fontSize: '14px',
        fontWeight: 800,
        color: '#191F28',
        borderTop: '1px solid #ECEFF2',
        borderBottom: '1px solid #ECEFF2'
      }}>
        출퇴근 장소
      </div>

      {/* 4. 등록된 출퇴근 장소 목록 (스크린샷 100% 일치) */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '70px' }}>
        {orgAssignedLocations.map(loc => (
          <div
            key={loc.id}
            onClick={() => {
              onSelectWorkLocation({
                id: loc.id,
                name: loc.name,
                address: loc.address,
                lat: 37.5665,
                lng: 126.9780
              });
            }}
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #ECEFF2',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              background: '#FFFFFF',
              transition: 'background 0.15s ease'
            }}
          >
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', marginBottom: '4px' }}>
                {loc.name}
              </div>
              <div style={{ fontSize: '13px', color: '#6B7684' }}>
                {loc.address}
              </div>
            </div>

            <ChevronRight size={18} color="#8B95A1" />
          </div>
        ))}
      </div>
    </div>
  );
};

const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 18px',
  borderBottom: '1px solid #ECEFF2',
  background: '#FFFFFF'
};

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#191F28'
};

const valueStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#191F28',
  textAlign: 'right'
};
