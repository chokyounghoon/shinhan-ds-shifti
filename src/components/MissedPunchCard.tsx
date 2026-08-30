import React from 'react';
import { ChevronRight, FileEdit, AlertCircle } from 'lucide-react';

interface MissedPunchCardProps {
  onClick: () => void;
}

export const MissedPunchCard: React.FC<MissedPunchCardProps> = ({ onClick }) => {
  return (
    <div 
      className="quick-nav-card" 
      onClick={onClick} 
      role="button" 
      tabIndex={0}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        background: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E5E8EB',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: '10px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: '#FFF7ED',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FileEdit size={18} color="#EA580C" />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#191F28' }}>
            투입 실적 누락 / 편차 보정 소명
          </div>
          <div style={{ fontSize: '11px', color: '#8B95A1', marginTop: '1px' }}>
            미태깅 또는 공백 발생 시 소속사 관리자에게 소명 상신
          </div>
        </div>
      </div>
      <ChevronRight size={18} color="#8B95A1" />
    </div>
  );
};
