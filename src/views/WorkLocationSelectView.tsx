import React, { useState } from 'react';
import { ArrowLeft, Search, Check, ChevronRight } from 'lucide-react';

export interface WorkLocation {
  id: string;
  name: string; // e.g. [좌표] KT IDC
  address: string; // e.g. 서울 영등포구 여의대로 14 KT여의도타워
  lat: number;
  lng: number;
}

// 스크린샷과 정확히 일치하는 출퇴근 장소 목록
export const defaultWorkLocations: WorkLocation[] = [
  {
    id: 'loc-00',
    name: '[좌표] 파인에비뉴(카드)',
    address: '서울 중구 을지로 100 파인에비뉴',
    lat: 37.5663,
    lng: 126.9890
  },
  {
    id: 'loc-01',
    name: '[좌표] KT IDC',
    address: '서울 영등포구 여의대로 14 KT여의도타워',
    lat: 37.5255,
    lng: 126.9242
  },
  {
    id: 'loc-02',
    name: '[좌표] AIA타워',
    address: '서울 중구 통일로2길 16 AIA타워',
    lat: 37.5612,
    lng: 126.9689
  },
  {
    id: 'loc-03',
    name: '[좌표] DB다동빌딩(EZ손보)',
    address: '서울 중구 남대문로 113 DB다동빌딩',
    lat: 37.5678,
    lng: 126.9821
  },
  {
    id: 'loc-04',
    name: '[좌표] HSBC빌딩',
    address: '서울 중구 칠패로 37 HSBC빌딩',
    lat: 37.5587,
    lng: 126.9734
  },
  {
    id: 'loc-05',
    name: '[좌표] KT&G타워(신한자산신탁)',
    address: '서울 강남구 영동대로 416 정관장 KT&G타워본점',
    lat: 37.5074,
    lng: 127.0623
  },
  {
    id: 'loc-06',
    name: '[좌표] K파이낸스타워',
    address: '서울 중구 남대문로 55 K파이낸스타워',
    lat: 37.5635,
    lng: 126.9792
  },
  {
    id: 'loc-07',
    name: '[좌표] LG유플러스 KIDC논현센터',
    address: '서울 강남구 언주로 616 LG유플러스 KIDC논현센터',
    lat: 37.5142,
    lng: 127.0354
  },
  {
    id: 'loc-08',
    name: '[좌표] LG유플러스마곡사옥',
    address: '서울 강서구 마곡중앙8로 71 LG유플러스 마곡사옥',
    lat: 37.5621,
    lng: 126.8329
  },
  {
    id: 'loc-09',
    name: '[좌표] LG헬로비전',
    address: '경기 고양시 덕양구 동송로 30 LG헬로비전 본사',
    lat: 37.6492,
    lng: 126.8974
  },
  {
    id: 'loc-10',
    name: '[좌표] L타워(라이프)',
    address: '서울 중구 삼일대로 358 신한L타워',
    lat: 37.5654,
    lng: 126.9886
  }
];

interface WorkLocationSelectViewProps {
  onBack: () => void;
  selectedLocationId?: string;
  onSelectLocation: (location: WorkLocation) => void;
  onOpenDetail: (location: WorkLocation) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const WorkLocationSelectView: React.FC<WorkLocationSelectViewProps> = ({
  onBack,
  selectedLocationId = 'loc-00',
  onSelectLocation,
  onOpenDetail,
  themeMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSelectedId, setCurrentSelectedId] = useState(selectedLocationId);

  const filteredLocations = defaultWorkLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (loc: WorkLocation) => {
    setCurrentSelectedId(loc.id);
    onSelectLocation(loc);
    onOpenDetail(loc);
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 (← 출퇴근 장소 관리) */}
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
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>출퇴근 장소 관리</span>
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

      {/* 3. 출퇴근 장소 목록 (스크린샷 100% 일치) */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '70px' }}>
        {filteredLocations.map(loc => {
          const isSelected = loc.id === currentSelectedId;
          return (
            <div
              key={loc.id}
              onClick={() => handleRowClick(loc)}
              style={{
                padding: '16px 18px',
                borderBottom: '1px solid #ECEFF2',
                cursor: 'pointer',
                background: isSelected ? (themeMode === 'ddangyo' ? '#FFF5F2' : '#F0F5FF') : '#FFFFFF',
                transition: 'background 0.15s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: isSelected ? (themeMode === 'ddangyo' ? '#FF462D' : '#0046FF') : '#191F28',
                  marginBottom: '4px'
                }}>
                  {loc.name}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7684' }}>
                  {loc.address}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isSelected && (
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: themeMode === 'ddangyo' ? '#FF462D' : '#0046FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}>
                    <Check size={13} strokeWidth={3} />
                  </div>
                )}
                <ChevronRight size={18} color="#B0B8C1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
