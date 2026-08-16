import React from 'react';
import { ChevronRight, FileSpreadsheet } from 'lucide-react';

interface ReportCardProps {
  onClick: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ onClick }) => {
  return (
    <div className="quick-nav-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="quick-nav-left">
        <FileSpreadsheet size={18} color="#0052FF" />
        <span style={{ fontWeight: 700 }}>도급 공정 검수 리포트</span>
      </div>
      <ChevronRight size={18} className="quick-nav-arrow" />
    </div>
  );
};
