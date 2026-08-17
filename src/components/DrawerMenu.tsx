import React, { useState } from 'react';
import { 
  X, Megaphone, Users, Network, MapPin, 
  MessageSquare, HelpCircle, MessagesSquare,
  Lock, LogOut
} from 'lucide-react';
import { User } from '../types';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  themeMode: 'ddangyo' | 'shinhan';
  onToggleTheme: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  onLogout?: () => void;
  onOpenReport: () => void;
  onOpenMissedPunch: () => void;
  onOpenRequests: () => void;
  onOpenAccountSettings: () => void;
  onOpenWorkLocations: () => void;
  onOpenOrganizations: () => void;
  onOpenEmployees: () => void;
  onOpenScheduleTemplates: () => void;
  onOpenVacation?: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  user,
  themeMode,
  onToggleTheme,
  isMobileFrame,
  onToggleFrame,
  onLogout,
  onOpenAccountSettings,
  onOpenWorkLocations,
  onOpenOrganizations,
  onOpenEmployees,
  onOpenScheduleTemplates,
  onOpenVacation
}) => {
  if (!isOpen) return null;

  const handleMenuClick = (menuTitle: string) => {
    if (menuTitle === '내 계정' || menuTitle === '내 프로필') {
      onClose();
      onOpenAccountSettings();
      return;
    }

    if (menuTitle === '직원') {
      onClose();
      onOpenEmployees();
      return;
    }

    if (menuTitle === '조직') {
      onClose();
      onOpenOrganizations();
      return;
    }

    if (menuTitle === '도급 투입 장소' || menuTitle === '출퇴근 장소') {
      onClose();
      onOpenWorkLocations();
      return;
    }

    if (menuTitle === '약정 투입 계획 템플릿' || menuTitle === '근무일정 템플릿') {
      onClose();
      onOpenScheduleTemplates();
      return;
    }

    if (menuTitle === '회사 바꾸기') {
      alert('🏢 소속 회사 전환: [신한DS] ↔ [땡겨요테크솔루션(협력사)]');
      return;
    }

    if (menuTitle === '1:1 채팅 문의') {
      alert('💬 신한DS 협력사 전용 1:1 헬프데스크 채팅창이 연결되었습니다.');
      return;
    }

    alert(`[${menuTitle}] 상세 설정 및 관리 화면이 열렸습니다.`);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      <div 
        style={{
          width: '320px',
          maxWidth: '82vw',
          height: '100%',
          background: '#FFFFFF',
          padding: '24px 20px 40px 20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '10px 0 30px rgba(0, 0, 0, 0.15)',
          animation: 'slideRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 1. 상단 프로필 헤더 (스크린샷 일치) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#191F28', letterSpacing: '-0.5px' }}>
                {user.name || '조경훈'}
              </span>
              <span style={{ fontSize: '13.5px', color: '#4E5968', fontWeight: 500 }}>
                {user.role === 'PARTNER_SITE_MANAGER' ? '현장대리인' : user.role === 'PRINCIPAL_INSPECTOR' ? '도급검수관' : '조직관리자'}
              </span>
            </div>

            {/* 내 계정 | 내 프로필 파란색 링크 */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <button 
                onClick={() => { onClose(); onOpenAccountSettings(); }}
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF'
                }}
              >
                내 계정
              </button>
              <button 
                onClick={() => { onClose(); onOpenAccountSettings(); }}
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF'
                }}
              >
                내 프로필
              </button>
            </div>
          </div>

          <button onClick={onClose} style={{ color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF', padding: '2px' }}>
            <X size={26} strokeWidth={2.2} />
          </button>
        </div>

        {/* 상단 구분선 */}
        <div style={{ height: '1px', background: '#ECEFF2', margin: '8px 0 16px 0' }} />

        {/* 2. 섹션: 신한DS (스크린샷 일치) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#191F28', marginBottom: '10px', paddingLeft: '4px' }}>
            신한DS
          </div>

          {/* 투입 공백 사전 통보 (부재 일정 공유) */}
          {onOpenVacation && (
            <button 
              style={{ ...menuItemStyle, color: '#0052FF', background: '#EFF6FF', borderRadius: '8px' }} 
              onClick={() => {
                onClose();
                onOpenVacation();
              }}
            >
              <Megaphone size={19} color="#0052FF" strokeWidth={2} />
              <span style={{ fontWeight: 800 }}>📢 투입 공백 사전 통보 (부재 공유)</span>
            </button>
          )}

          {/* 직원 */}
          <button style={menuItemStyle} onClick={() => handleMenuClick('직원')}>
            <Users size={19} color="#4E5968" strokeWidth={1.8} />
            <span>직원</span>
          </button>

          {/* 조직 */}
          <button style={menuItemStyle} onClick={() => handleMenuClick('조직')}>
            <Network size={19} color="#4E5968" strokeWidth={1.8} />
            <span>조직</span>
          </button>

          {/* 도급 투입 장소 */}
          <button style={menuItemStyle} onClick={() => handleMenuClick('도급 투입 장소')}>
            <MapPin size={19} color="#4E5968" strokeWidth={1.8} />
            <span>출퇴근 장소</span>
          </button>
        </div>

        {/* 3. 섹션: 도움 및 지원 (스크린샷 일치) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#191F28', marginBottom: '10px', paddingLeft: '4px' }}>
            도움 및 지원
          </div>

          {/* 피드백 보내기 */}
          <button style={menuItemStyle} onClick={() => handleMenuClick('피드백 보내기')}>
            <MessageSquare size={19} color="#4E5968" strokeWidth={1.8} />
            <span>피드백 보내기</span>
          </button>

          {/* 도움말 가이드 */}
          <button style={menuItemStyle} onClick={() => handleMenuClick('도움말 가이드')}>
            <HelpCircle size={19} color="#4E5968" strokeWidth={1.8} />
            <span>도움말 가이드</span>
          </button>

          {/* 1:1 채팅 문의 */}
          <button style={menuItemStyle} onClick={() => handleMenuClick('1:1 채팅 문의')}>
            <MessagesSquare size={19} color="#4E5968" strokeWidth={1.8} />
            <span>1:1 채팅 문의</span>
          </button>
        </div>

        {/* 4. 로그아웃 (S-GUARD 보안 세션 종료) */}
        <div style={{ marginTop: '14px', marginBottom: '14px' }}>
          <button 
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            style={{
              ...menuItemStyle,
              width: '100%',
              color: '#D9480F',
              background: '#FFF5F2',
              borderRadius: '8px'
            }}
          >
            <Lock size={18} color="#D9480F" />
            <span style={{ fontWeight: 700 }}>S-GUARD 보안 로그아웃</span>
          </button>
        </div>

        {/* 하단 유틸리티 (테마 & 프레임 토글) */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '20px',
          borderTop: '1px solid #ECEFF2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#8B95A1'
        }}>
          <button onClick={onToggleTheme} style={{ color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF', fontWeight: 700 }}>
            ● {themeMode === 'ddangyo' ? '땡겨요 테마' : '신한블루 테마'}
          </button>
          <span>v2.0 (S-GUARD)</span>
        </div>
      </div>
    </div>
  );
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '12px 8px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 600,
  color: '#191F28',
  textAlign: 'left',
  width: '100%',
  transition: 'background 0.15s ease'
};
