import React from 'react';
import { Menu, MessageSquare, Bell } from 'lucide-react';

interface HeaderProps {
  onOpenDrawer: () => void;
  onOpenMessages: () => void;
  onOpenNotifications: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDrawer,
  onOpenMessages,
  onOpenNotifications,
  themeMode
}) => {
  return (
    <header className="top-header">
      <div className="top-header-left">
        <button 
          onClick={onOpenDrawer} 
          className="icon-btn-badge" 
          aria-label="메뉴 열기"
          style={{ width: '28px', height: '28px' }}
        >
          <Menu size={24} strokeWidth={2.2} color="#191F28" />
        </button>

        <div className="brand-logo-wrap">
          {/* 신한DS 로고 & 땡겨요 협력사 브랜딩 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill={themeMode === 'ddangyo' ? '#FF462D' : '#0046FF'} />
              <path d="M7 13.5C7.5 10 10.5 7.5 14 8C12 9.5 11 11.5 11 14.5C11 16.5 12.5 17 14 17C10 17 7 15.5 7 13.5Z" fill="white" />
              <circle cx="15.5" cy="11.5" r="2" fill="white" />
            </svg>
            <span style={{ 
              fontWeight: 800, 
              fontSize: '18px', 
              letterSpacing: '-0.4px', 
              color: themeMode === 'ddangyo' ? '#FF462D' : '#0046FF',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              신한<span style={{ fontWeight: 900 }}>DS</span>
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#FF462D',
              background: '#FFF0ED',
              padding: '2px 6px',
              borderRadius: '4px',
              marginLeft: '2px'
            }}>
              땡겨요 협력사
            </span>
          </div>
        </div>
      </div>

      <div className="top-header-right">
        {/* 메시지 / 상담 채팅 아이콘 (뱃지 0) */}
        <button 
          onClick={onOpenMessages} 
          className="icon-btn-badge"
          aria-label="메시지"
        >
          <div style={{ position: 'relative' }}>
            <MessageSquare size={22} strokeWidth={1.8} />
            <span className="badge-count" style={{ top: '-4px', right: '-8px' }}>0</span>
          </div>
        </button>

        {/* 알림 벨 아이콘 (뱃지 0) */}
        <button 
          onClick={onOpenNotifications} 
          className="icon-btn-badge"
          aria-label="알림"
        >
          <div style={{ position: 'relative' }}>
            <Bell size={22} strokeWidth={1.8} />
            <span className="badge-count" style={{ top: '-4px', right: '-8px' }}>0</span>
          </div>
        </button>
      </div>
    </header>
  );
};
