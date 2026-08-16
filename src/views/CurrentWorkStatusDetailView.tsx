import React, { useState } from 'react';
import { ArrowLeft, Info, RotateCw } from 'lucide-react';

interface CurrentWorkStatusDetailViewProps {
  onBack: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const CurrentWorkStatusDetailView: React.FC<CurrentWorkStatusDetailViewProps> = ({
  onBack,
  themeMode
}) => {
  const [lastUpdateTime, setLastUpdateTime] = useState('10:34');
  const [isRotating, setIsRotating] = useState(false);

  const handleRefresh = () => {
    setIsRotating(true);
    setTimeout(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setLastUpdateTime(`${hh}:${mm}`);
      setIsRotating(false);
    }, 400);
  };

  const statusItems = [
    { label: '근무중', count: '-', color: '#2AC769' },
    { label: '무일정', count: '-', color: '#70B6F6' },
    { label: '간주근로', count: '-', color: '#0F9F90' },
    { label: '휴게', count: '-', color: '#FAB005' },
    { label: '조퇴', count: '-', color: '#9AA5B1' },
    { label: '지각', count: '-', color: '#E8590C' },
    { label: '휴가', count: '-', color: '#A855F7' },
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 (← 현재 근무 상황 | ⓘ) */}
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
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>현재 근무 상황</span>
        </div>

        <button 
          onClick={() => alert('근무 상황 기준: 실시간 GPS 태깅 및 출퇴근 기록을 기반으로 자동 집계됩니다.')}
          style={{ color: '#4E5968', display: 'flex', alignItems: 'center', padding: '4px' }}
        >
          <Info size={22} />
        </button>
      </div>

      {/* 2. 마지막 업데이트 시간 및 새로고침 버튼 (스크린샷 일치) */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '14px 18px 8px 18px',
        gap: '6px'
      }}>
        <span style={{ fontSize: '13px', color: '#6B7684', fontWeight: 500 }}>
          마지막 업데이트 {lastUpdateTime}
        </span>
        <button 
          onClick={handleRefresh}
          style={{
            color: '#4E5968',
            display: 'flex',
            alignItems: 'center',
            transform: isRotating ? 'rotate(360deg)' : 'none',
            transition: 'transform 0.4s ease'
          }}
        >
          <RotateCw size={15} />
        </button>
      </div>

      {/* 3. 7가지 근무 상태 그리드 (스크린샷 100% 일치) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        rowGap: '20px',
        columnGap: '6px',
        padding: '12px 18px 24px 18px'
      }}>
        {statusItems.map((item, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 컬러 도트 + 라벨 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: item.color,
                flexShrink: 0
              }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#191F28' }}>
                {item.label}
              </span>
            </div>

            {/* 인원 카운트 */}
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#6B7684', paddingLeft: '14px' }}>
              {item.count}
            </div>
          </div>
        ))}
      </div>

      {/* 4. 본문 영역 (스크린샷 일치하는 깔끔한 빈 상태) */}
      <div style={{ flex: 1, background: '#F8F9FA', borderTop: '1px solid #ECEFF2' }} />
    </div>
  );
};
