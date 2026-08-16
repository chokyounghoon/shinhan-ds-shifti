import React from 'react';
import { ChevronRight } from 'lucide-react';

interface MissedPunchCardProps {
  onClick: () => void;
}

export const MissedPunchCard: React.FC<MissedPunchCardProps> = ({ onClick }) => {
  return (
    <div className="quick-nav-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="quick-nav-left">
        {/* 스크린샷의 가방/지갑/카드 형태 아이콘 */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="14" rx="2" fill="currentColor" fillOpacity="0.8" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" />
          <line x1="3" y1="10" x2="21" y2="10" stroke="white" strokeWidth="1.5" />
        </svg>
        <span>출근/퇴근 누락 기록</span>
      </div>
      <ChevronRight size={20} className="quick-nav-arrow" />
    </div>
  );
};
