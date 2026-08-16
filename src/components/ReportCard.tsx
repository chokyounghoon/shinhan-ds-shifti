import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ReportCardProps {
  onClick: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ onClick }) => {
  return (
    <div className="quick-nav-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="quick-nav-left">
        {/* 스크린샷의 3개 세로 바 차트 아이콘 */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="20" x2="6" y2="12" />
          <line x1="12" y1="20" x2="12" y2="6" />
          <line x1="18" y1="20" x2="18" y2="10" />
        </svg>
        <span>리포트</span>
      </div>
      <ChevronRight size={20} className="quick-nav-arrow" />
    </div>
  );
};
