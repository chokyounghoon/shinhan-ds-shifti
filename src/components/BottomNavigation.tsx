import React from 'react';
import { Home, FolderClosed, Calendar, Clock, FileCheck2, QrCode } from 'lucide-react';

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
      {/* 1. 투입홈 */}
      <button
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
      >
        <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 1.8} />
        <span>투입홈</span>
      </button>

      {/* 2. 투입소명 */}
      <button
        className={`nav-item ${activeTab === 'request' ? 'active' : ''}`}
        onClick={() => onTabChange('request')}
      >
        <div style={{ position: 'relative' }}>
          <FolderClosed size={22} strokeWidth={activeTab === 'request' ? 2.5 : 1.8} />
          {requestCount > 0 && (
            <span className="badge-count" style={{ top: '-4px', right: '-8px' }}>
              {requestCount}
            </span>
          )}
        </div>
        <span>투입소명</span>
      </button>

      {/* 3. 투입계획 */}
      <button
        className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
        onClick={() => onTabChange('schedule')}
      >
        <div style={{ position: 'relative' }}>
          <Calendar size={22} strokeWidth={activeTab === 'schedule' ? 2.5 : 1.8} />
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
            약정
          </span>
        </div>
        <span style={{ marginTop: '2px' }}>투입계획</span>
      </button>

      {/* 4. 투입이력 */}
      <button
        className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
        onClick={() => onTabChange('logs')}
      >
        <Clock size={22} strokeWidth={activeTab === 'logs' ? 2.5 : 1.8} />
        <span>투입이력</span>
      </button>

      {/* 5. 도급정산 */}
      <button
        className={`nav-item ${activeTab === 'vacation' ? 'active' : ''}`}
        onClick={() => onTabChange('vacation')}
      >
        <FileCheck2 size={22} strokeWidth={activeTab === 'vacation' ? 2.5 : 1.8} />
        <span>도급정산</span>
      </button>

      {/* 플로팅 QR 스캐너 버튼 */}
      <button
        className="qr-floating-btn"
        onClick={onOpenQR}
        aria-label="QR 투입 인증"
        title="QR 도급 투입 인증"
      >
        <QrCode size={20} />
      </button>
    </nav>
  );
};
