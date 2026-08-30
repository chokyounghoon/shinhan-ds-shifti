import React from 'react';
import { ChevronRight, FileSpreadsheet, ShieldCheck } from 'lucide-react';

interface ReportCardProps {
  onClick: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ onClick }) => {
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
          background: '#EFF6FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FileSpreadsheet size={18} color="#0052FF" />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#191F28' }}>
            도급 공정 검수 및 법적 방어 리포트
          </div>
          <div style={{ fontSize: '11px', color: '#8B95A1', marginTop: '1px' }}>
            월간 공수 달성률 및 완성물 검수 증빙서 확인
          </div>
        </div>
      </div>
      <ChevronRight size={18} color="#8B95A1" />
    </div>
  );
};
