import React from 'react';
import { ChevronRight, FileEdit } from 'lucide-react';

interface MissedPunchCardProps {
  onClick: () => void;
}

export const MissedPunchCard: React.FC<MissedPunchCardProps> = ({ onClick }) => {
  return (
    <div className="quick-nav-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="quick-nav-left">
        <FileEdit size={18} color="#FF6D00" />
        <span style={{ fontWeight: 700 }}>투입 실적 누락/보정 소명</span>
      </div>
      <ChevronRight size={18} className="quick-nav-arrow" />
    </div>
  );
};
