import React from 'react';
import { Menu, MessageSquare, Bell, Sparkles } from 'lucide-react';
import { ShinhanLogo } from './ShinhanLogo';
import { User } from '../types';

interface HeaderProps {
  onOpenDrawer: () => void;
  onOpenMessages: () => void;
  onOpenNotifications: () => void;
  onOpenAiStats?: () => void;
  onOpenMyPage?: () => void;
  currentUser?: User;
  themeMode: 'ddangyo' | 'shinhan';
  unreadMessageCount?: number;
  unreadNotificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDrawer,
  onOpenMessages,
  onOpenNotifications,
  onOpenAiStats,
  onOpenMyPage,
  currentUser,
  themeMode,
  unreadMessageCount = 0,
  unreadNotificationCount = 0
}) => {
  // D1 데이터베이스에 등록된 실제 프로필 사진 우선 적용
  const avatarPhoto = (currentUser as any)?.profile_picture || currentUser?.avatarUrl || currentUser?.profileImage || (currentUser?.name?.includes('조경훈') ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' : null);
  const avatarInitial = (currentUser?.name || '').trim().replace(/\s*\([^)]*\)/g, '')[0] || '조';

  return (
    <header className="top-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 14px',
      height: '56px',
      background: '#FFFFFF',
      borderBottom: '1px solid #ECEFF2',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxSizing: 'border-box'
    }}>
      {/* 좌측: 메뉴 토글 + 신한DS 브랜드 로고 (절대 줄바꿈 방지) */}
      <div className="top-header-left" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0,
        whiteSpace: 'nowrap'
      }}>
        <button 
          onClick={onOpenDrawer} 
          className="icon-btn-badge" 
          aria-label="메뉴 열기"
          style={{ width: '28px', height: '28px', padding: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Menu size={24} strokeWidth={2.2} color="#191F28" />
        </button>

        <div className="brand-logo-wrap" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          flexShrink: 0,
          whiteSpace: 'nowrap'
        }}>
          {/* 신한금융그룹 공식 CI 심볼 마크 + 신한DS 브랜드 로고 */}
          <ShinhanLogo size={26} textColor="#0046FF" />
        </div>
      </div>

      <div className="top-header-right" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0
      }}>
        {/* 실시간 공정/SLA 알림 벨 아이콘 (0건일 때는 뱃지 미노출, 역할별 건수만 표시) */}
        <button 
          onClick={onOpenNotifications} 
          className="icon-btn-badge"
          aria-label="알림 센터"
          title={`미확인 알림 ${unreadNotificationCount}건`}
          style={{ width: '34px', height: '34px', position: 'relative', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={22} strokeWidth={1.8} color={unreadNotificationCount > 0 ? '#EF4444' : '#333D4B'} />
            {unreadNotificationCount > 0 && (
              <span 
                className="badge-count" 
                style={{ 
                  position: 'absolute',
                  top: '-5px', 
                  right: '-8px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  minWidth: '17px',
                  height: '17px',
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(239,68,68,0.4)',
                  padding: '0 3px'
                }}
              >
                {unreadNotificationCount}
              </span>
            )}
          </div>
        </button>

        {/* S-Sign 마이페이지 프로필 버튼 (파트 : 로그인 사용자 이름 풀네임) */}
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
              marginLeft: '2px',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            title="S-Sign 회원 정보 관리"
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
              fontSize: '11px',
              fontWeight: 900,
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {avatarPhoto ? (
                <img 
                  src={avatarPhoto} 
                  alt="프로필" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => {
                    // 이미지 로드 실패 시 이니셜 대체
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span style={{ color: '#0052FF', fontWeight: 900, fontSize: '11px' }}>{avatarInitial}</span>
              )}
            </div>

            {/* 파트 : 로그인 사용자 풀네임 */}
            {(() => {
              const rawName = (currentUser?.name || '조경훈').trim();
              const pureName = rawName.replace(/\s*\(.*?\)/g, '').trim();
              // 로컬 기준: 파트명이 없거나 '신한DS' 또는 '전사 총괄'이면 '상담'으로 표기
              const partText = (currentUser?.partName && currentUser.partName !== '전사 총괄' && currentUser.partName !== '총괄' && currentUser.partName !== '신한DS')
                ? currentUser.partName.replace(/파트$/, '')
                : '상담';
              
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
                  fontSize: '12px',
                  letterSpacing: '-0.2px',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0
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
