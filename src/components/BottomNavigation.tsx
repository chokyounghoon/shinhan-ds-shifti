import React from 'react';
import { Home, FolderClosed, Calendar, Clock, Plane, QrCode } from 'lucide-react';

export type TabType = 'home' | 'request' | 'schedule' | 'logs' | 'vacation';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenQR: () => void;
  requestCount?: number;
  themeMode: 'ddangyo' | 'shinhan';
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenQR,
  requestCount = 0,
  themeMode
}) => {
  return (
    <nav className={`bottom-nav-bar ${themeMode === 'ddangyo' ? 'ddangyo-bar' : ''}`}>
      {/* 1. 홈 */}
      <button
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
      >
        <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 1.8} />
        <span>홈</span>
      </button>

      {/* 2. 요청 (뱃지 0) */}
      <button
        className={`nav-item ${activeTab === 'request' ? 'active' : ''}`}
        onClick={() => onTabChange('request')}
      >
        <div style={{ position: 'relative' }}>
          <FolderClosed size={22} strokeWidth={activeTab === 'request' ? 2.5 : 1.8} />
          <span className="badge-count" style={{ top: '-4px', right: '-8px' }}>
            {requestCount}
          </span>
        </div>
        <span>요청</span>
      </button>

      {/* 3. 근무일정 (5/5 뱃지) */}
      <button
        className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
        onClick={() => onTabChange('schedule')}
      >
        <div style={{ position: 'relative' }}>
          <Calendar size={22} strokeWidth={activeTab === 'schedule' ? 2.5 : 1.8} />
          {/* 스크린샷 중앙의 5/5 표시 */}
          <span style={{
            position: 'absolute',
            bottom: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.75)',
            color: '#FFFFFF',
            fontSize: '8.5px',
            fontWeight: 700,
            padding: '1px 4px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            border: '0.5px solid rgba(255, 255, 255, 0.2)'
          }}>
            5/5
          </span>
        </div>
        <span style={{ marginTop: '2px' }}>근무일정</span>
      </button>

      {/* 4. 출퇴근기록 */}
      <button
        className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
        onClick={() => onTabChange('logs')}
      >
        <Clock size={22} strokeWidth={activeTab === 'logs' ? 2.5 : 1.8} />
        <span>출퇴근기록</span>
      </button>

      {/* 5. 휴가 */}
      <button
        className={`nav-item ${activeTab === 'vacation' ? 'active' : ''}`}
        onClick={() => onTabChange('vacation')}
      >
        <Plane size={22} strokeWidth={activeTab === 'vacation' ? 2.5 : 1.8} style={{ transform: 'rotate(-45deg)' }} />
        <span>휴가</span>
      </button>

      {/* 플로팅 QR 스캐너 버튼 (스크린샷 우측 하단 QR 아이콘) */}
      <button
        className="qr-floating-btn"
        onClick={onOpenQR}
        aria-label="QR 근태 태깅"
        title="QR 출퇴근 태깅"
      >
        <QrCode size={20} />
      </button>
    </nav>
  );
};
