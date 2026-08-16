import React, { useState } from 'react';
import { Info, RotateCw, ChevronRight, ShieldCheck, CheckCircle2, FileCheck } from 'lucide-react';
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

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
    }, 500);
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '16px 18px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      border: '1px solid #E5E8EB',
      marginBottom: '12px'
    }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#191F28' }}>
            도급 계약 이행 공수 현황
          </span>
          <button onClick={onOpenInfo} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
            <Info size={15} color="#8B95A1" />
          </button>
        </div>

        <button
          onClick={handleRefresh}
          style={{
            background: 'none',
            border: 'none',
            color: '#8B95A1',
            cursor: 'pointer',
            padding: '2px',
            transform: isSpinning ? 'rotate(360deg)' : 'none',
            transition: 'transform 0.5s ease'
          }}
          aria-label="공수 현황 새로고침"
        >
          <RotateCw size={17} />
        </button>
      </div>

      {/* 중앙: 도급 공수 달성 현황 (52시간/근태 용어 완전 배제) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#F8FAFC',
        padding: '14px 12px',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        gap: '8px'
      }}>
        {/* 지표 1: 누적 실투입 공수 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>
            누적 실투입 공수
          </div>
          <div style={{ fontSize: '19px', fontWeight: 900, color: '#0052FF' }}>
            40.0<span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>h</span>
          </div>
          <div style={{ fontSize: '10.5px', color: '#16A34A', fontWeight: 700, marginTop: '2px' }}>
            ✓ 주간 약정 공수 100% 달성
          </div>
        </div>

        {/* 지표 2: 도급비 정산 검수 상태 */}
        <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>
            도급 검수 상태
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0D9488', marginTop: '3px' }}>
            협력사 1차 확인완료
          </div>
          <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, marginTop: '3px' }}>
            도급 정산 정상 반영
          </div>
        </div>
      </div>

      {/* 하단 법적 선언 고지 */}
      <div style={{
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11.5px',
        color: '#64748B'
      }}>
        <span>※ 용역 완성물 및 공수(Man-Hour) 기준 정산</span>
        <button
          type="button"
          onClick={onOpenDetail}
          style={{
            background: 'none',
            border: 'none',
            color: '#0052FF',
            fontWeight: 700,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <span>내역 보기</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
