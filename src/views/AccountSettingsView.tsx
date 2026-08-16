import React from 'react';
import { ArrowLeft, User as UserIcon, Mail, Lock, Code, LogOut, ChevronRight } from 'lucide-react';
import { User } from '../types';

interface AccountSettingsViewProps {
  onBack: () => void;
  onNavigateToProfileEdit: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  onBack,
  onNavigateToProfileEdit,
  themeMode
}) => {
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 상단 헤더 (← 내 계정) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF',
        gap: '14px'
      }}>
        <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>내 계정</span>
      </div>

      {/* 섹션 라벨: 계정 */}
      <div style={{
        background: '#F8F9FA',
        padding: '12px 18px 8px 18px',
        fontSize: '13px',
        fontWeight: 700,
        color: '#4E5968'
      }}>
        계정
      </div>

      {/* 계정 메뉴 리스트 (스크린샷 4 일치) */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* 1. 내 계정 (프로필 편집으로 이동) */}
        <div
          onClick={onNavigateToProfileEdit}
          style={rowItemStyle}
          role="button"
          tabIndex={0}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <UserIcon size={20} color="#4E5968" />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#191F28' }}>내 계정</span>
          </div>
          <ChevronRight size={18} color="#B0B8C1" />
        </div>

        {/* 2. 이메일 변경 */}
        <div
          onClick={() => alert('이메일 변경: 관리자 및 본인 인증 후 변경 가능합니다.')}
          style={rowItemStyle}
          role="button"
          tabIndex={0}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Mail size={20} color="#4E5968" />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#191F28' }}>이메일 변경</span>
          </div>
          <ChevronRight size={18} color="#B0B8C1" />
        </div>

        {/* 3. 비밀번호 등록 */}
        <div
          onClick={() => alert('비밀번호 등록 및 변경 팝업')}
          style={rowItemStyle}
          role="button"
          tabIndex={0}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Lock size={20} color="#4E5968" />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#191F28' }}>비밀번호 등록</span>
          </div>
          <ChevronRight size={18} color="#B0B8C1" />
        </div>
      </div>

      {/* 구분 영역 */}
      <div style={{ height: '10px', background: '#F8F9FA', borderTop: '1px solid #ECEFF2', borderBottom: '1px solid #ECEFF2' }} />

      {/* 앱 버전 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 18px',
        borderBottom: '1px solid #ECEFF2'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Code size={20} color="#4E5968" />
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#191F28' }}>앱 버전</span>
        </div>
        <span style={{ fontSize: '14px', color: '#4E5968', fontWeight: 500 }}>1.3.30</span>
      </div>

      {/* 구분 영역 */}
      <div style={{ height: '10px', background: '#F8F9FA', borderBottom: '1px solid #ECEFF2' }} />

      {/* 로그아웃 */}
      <div
        onClick={() => {
          if (confirm('로그아웃 하시겠습니까?')) {
            alert('로그아웃 되었습니다.');
          }
        }}
        style={rowItemStyle}
        role="button"
        tabIndex={0}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <LogOut size={20} color="#4E5968" />
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#191F28' }}>로그아웃</span>
        </div>
      </div>
    </div>
  );
};

const rowItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 18px',
  borderBottom: '1px solid #F1F3F5',
  cursor: 'pointer',
  background: '#FFFFFF'
};
