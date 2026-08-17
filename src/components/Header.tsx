import React from 'react';
import { Menu, MessageSquare, Bell } from 'lucide-react';

import { User } from '../types';

interface HeaderProps {
  onOpenDrawer: () => void;
  onOpenMessages: () => void;
  onOpenNotifications: () => void;
  onOpenMyPage?: () => void;
  currentUser?: User;
  themeMode: 'ddangyo' | 'shinhan';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDrawer,
  onOpenMessages,
  onOpenNotifications,
  onOpenMyPage,
  currentUser,
  themeMode
}) => {
  const avatarPhoto = currentUser?.avatarUrl || currentUser?.profileImage;
  const avatarInitial = (currentUser?.name || '').trim().replace(/\s*\([^)]*\)/g, '')[0] || '?';
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
          {/* 신한금융그룹 공식 CI 심볼 마크 + 신한DS 브랜드 로고 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <svg width="24" height="24" viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="18" cy="18" r="18" fill="#0046FF" />
              {/* 신한금융그룹 공식 비둘기 날개 & 태양 모티프 CI */}
              <path 
                d="M9.5 20.2C10.8 14.5 15.2 11.2 21 12C18.2 14 16.6 16.8 16.2 21.2C16.2 24.2 18.2 25.2 20.2 25.2C14.8 25.2 10.2 23 9.5 20.2Z" 
                fill="white" 
              />
              <path 
                d="M19.5 14C22.6 14.8 25.8 18 26.5 22C25 21.5 22.5 20.8 21 19.2C19.8 18 19.3 16 19.5 14Z" 
                fill="white" 
              />
              <circle cx="23" cy="16.5" r="2.5" fill="white" />
            </svg>
            <span style={{ 
              fontWeight: 800, 
              fontSize: '18px', 
              letterSpacing: '-0.5px', 
              color: '#0046FF',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
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

        {/* S-GUARD 마이페이지 프로필 버튼 (파트 : 로그인 사용자 이름 풀네임) */}
        {onOpenMyPage && (
          <button
            onClick={onOpenMyPage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px 4px 5px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0052FF 0%, #0072FF 100%)',
              border: '1px solid rgba(0, 82, 255, 0.3)',
              boxShadow: '0 2px 8px rgba(0, 82, 255, 0.25)',
              color: '#FFFFFF',
              cursor: 'pointer',
              marginLeft: '4px',
              transition: 'all 0.15s ease'
            }}
            title="S-GUARD 회원 정보 관리"
          >
            {/* 사용자 프로필 아바타 / 사진 */}
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#FFFFFF',
              color: '#0052FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11.5px',
              fontWeight: 900,
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {avatarPhoto ? (
                <img 
                  src={avatarPhoto} 
                  alt="프로필" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span>{avatarInitial}</span>
              )}
            </div>

            {/* 파트 : 로그인 사용자 풀네임 */}
            {(() => {
              const rawName = (currentUser?.name || '조경훈').trim();
              const pureName = rawName.replace(/\s*\(.*?\)/g, '').trim();
              const partText = (currentUser?.partName && currentUser.partName !== '전사 총괄' && currentUser.partName !== '총괄')
                ? currentUser.partName.replace(/파트$/, '')
                : (currentUser?.companyName || '신한DS');
              
              let roleBadge = '';
              if (currentUser?.role === 'DS_PRINCIPAL_PM' || currentUser?.companyName === '신한DS') {
                roleBadge = 'DS PM';
              } else if (currentUser?.role === 'PARTNER_PART_LEADER' || currentUser?.isPartnerManager) {
                roleBadge = '협력사 관리인';
              } else {
                roleBadge = currentUser?.position || '도급원';
              }

              return (
                <span style={{
                  fontSize: '12.5px',
                  letterSpacing: '-0.2px',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#BAE6FD', fontWeight: 700 }}>
                    {partText}
                  </span>
                  <span style={{ margin: '0 3px', color: '#E0F2FE', opacity: 0.8 }}>:</span>
                  <span style={{ fontWeight: 800, color: '#FFFFFF' }}>
                    {pureName}
                  </span>
                  <span style={{ marginLeft: '4px', fontSize: '11px', color: '#E0F2FE', fontWeight: 600, opacity: 0.9 }}>
                    ({roleBadge})
                  </span>
                </span>
              );
            })()}
          </button>
        )}
      </div>
    </header>
  );
};
