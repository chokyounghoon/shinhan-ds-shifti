import React, { useState } from 'react';
import { ArrowLeft, Info, RotateCw, ShieldCheck } from 'lucide-react';

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
    { label: '공정투입중', count: '1명', color: '#2AC769' },
    { label: '약정투입', count: '8.0h', color: '#70B6F6' },
    { label: '실적확인', count: '완료', color: '#0F9F90' },
    { label: '편차발생', count: '0건', color: '#FAB005' },
    { label: '소명대기', count: '0건', color: '#E8590C' },
    { label: '약정휴무', count: '0건', color: '#A855F7' },
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>도급 인력 투입 공수 상세</span>
        </div>

        <button 
          onClick={() => alert('도급 투입 기준: 원·하청 도급 계약서 제5조에 따른 일일 투입 공수(Man-Hour)를 확인 및 정산합니다.')}
          style={{ color: '#4E5968', display: 'flex', alignItems: 'center', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Info size={22} />
        </button>
      </div>

      {/* 2. 최종 집계 시간 & 새로고침 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '12px 18px 6px 18px',
        gap: '6px',
        fontSize: '12px',
        color: '#6B7684'
      }}>
        <span>실적 집계 기준: {lastUpdateTime}</span>
        <button
          onClick={handleRefresh}
          style={{
            background: 'none',
            border: 'none',
            color: '#6B7684',
            cursor: 'pointer',
            padding: '2px',
            transform: isRotating ? 'rotate(360deg)' : 'none',
            transition: 'transform 0.4s ease',
            display: 'flex'
          }}
        >
          <RotateCw size={14} />
        </button>
      </div>

      {/* 3. 상태 그리드 */}
      <div style={{
        padding: '10px 18px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
      }}>
        {statusItems.map((item, idx) => (
          <div key={idx} style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px 10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: item.color }}>
              {item.count}
            </div>
          </div>
        ))}
      </div>

      {/* 4. 법적 고지 박스 */}
      <div style={{
        margin: '16px 18px',
        padding: '12px 14px',
        background: '#EFF6FF',
        border: '1px solid #DBEAFE',
        borderRadius: '10px',
        fontSize: '11.5px',
        color: '#1E40AF',
        lineHeight: 1.5
      }}>
        <div style={{ fontWeight: 800, marginBottom: '2px' }}>[도급 계약 이행 확인 지침]</div>
        본 시스템은 개별 근로자의 인사 노무 및 근태 관리를 행하지 않으며, 협력사가 자체 관리하여 전송한 일일 완성물 제작 공수(Man-Hour)를 도급 정산에 반영하기 위한 실적 확인 툴입니다.
      </div>
    </div>
  );
};
