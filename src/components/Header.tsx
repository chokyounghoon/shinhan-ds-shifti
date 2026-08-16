import React from 'react';
import { Menu, MessageSquare, Bell } from 'lucide-react';

interface HeaderProps {
  onOpenDrawer: () => void;
  onOpenMessages: () => void;
  onOpenNotifications: () => void;
  onOpenMyPage?: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDrawer,
  onOpenMessages,
  onOpenNotifications,
  onOpenMyPage,
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
          {/* 신한DS 로고 */}
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

        {/* S-GUARD 마이페이지 프로필 버튼 */}
        {onOpenMyPage && (
          <button
            onClick={onOpenMyPage}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0052FF 0%, #00D4FF 100%)',
              border: '1.5px solid #FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 82, 255, 0.3)',
              marginLeft: '4px'
            }}
            title="S-GUARD 회원 정보 관리"
          >
            조
          </button>
        )}
      </div>
    </header>
  );
};
