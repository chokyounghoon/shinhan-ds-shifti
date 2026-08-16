import React, { useState } from 'react';
import { Info, RotateCw, ChevronRight, Clock, ShieldCheck } from 'lucide-react';
import { WeeklyWorkStat } from '../types';

interface CurrentStatusCardProps {
  stats: WeeklyWorkStat;
  onOpenDetail: () => void;
  onOpenInfo: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const CurrentStatusCard: React.FC<CurrentStatusCardProps> = ({
  stats,
  onOpenDetail,
  onOpenInfo,
  themeMode
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showQuickStat, setShowQuickStat] = useState(true);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
    }, 600);
  };

  return (
    <div className="current-status-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="status-card-header">
          <span>현재 근무 상황</span>
          <button onClick={onOpenInfo} style={{ display: 'flex', alignItems: 'center' }}>
            <Info size={16} color="#8B95A1" />
          </button>
        </div>

        <button
          className={`reload-spinner-btn ${isSpinning ? 'spinning' : ''}`}
          onClick={handleRefresh}
          aria-label="근태 상황 새로고침"
        >
          <RotateCw size={19} strokeWidth={2.2} />
        </button>
      </div>

      {/* 중앙 근무 상태 영역 */}
      <div className="status-card-body">
        <div style={{ width: '100%', textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            background: '#F8F9FA',
            padding: '14px 10px',
            borderRadius: '10px',
            border: '1px solid #ECEFF2'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600, marginBottom: '2px' }}>
                인정 근로시간
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: themeMode === 'ddangyo' ? '#FF462D' : '#0046FF' }}>
                40<span style={{ fontSize: '13px', fontWeight: 600, color: '#4E5968' }}>시간</span>
              </div>
              <div style={{ fontSize: '10px', color: '#12B76A', fontWeight: 700, marginTop: '2px' }}>
                ✓ 휴가 5일 완벽 반영
              </div>
            </div>

            <div style={{ width: '1px', height: '36px', background: '#E5E8EB' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600, marginBottom: '2px' }}>
                주 52시간 잔여
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>
                12<span style={{ fontSize: '13px', fontWeight: 600, color: '#4E5968' }}>시간</span>
              </div>
              <div style={{ fontSize: '10px', color: '#6B7684', fontWeight: 600, marginTop: '2px' }}>
                연장근무 0시간
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="status-card-footer">
        <div 
          className={`view-detail-btn ${themeMode === 'ddangyo' ? 'ddangyo-color' : ''}`}
          onClick={onOpenDetail}
          role="button"
          tabIndex={0}
        >
          <span>자세히 보기</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};
