import React, { useState } from 'react';
import { ArrowLeft, X, ChevronDown, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { dbService } from '../services/db';

interface ProfileEditViewProps {
  onBack: () => void;
  user: User;
  onUserUpdated: (user: User) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const ProfileEditView: React.FC<ProfileEditViewProps> = ({
  onBack,
  user,
  onUserUpdated,
  themeMode
}) => {
  const [lastName, setLastName] = useState(user.lastName || 'cho');
  const [firstName, setFirstName] = useState(user.firstName || 'kyounghoon');
  const [phone, setPhone] = useState(user.phone || '01047328880');
  const [language, setLanguage] = useState(user.language || '한국어');
  const [timezone, setTimezone] = useState(user.timezone || 'Asia/Seoul');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    const updatedUser: User = {
      ...user,
      lastName,
      firstName,
      name: `${lastName} ${firstName}`,
      phone,
      language,
      timezone
    };

    dbService.updateUser(updatedUser);
    onUserUpdated(updatedUser);
    setToastMessage('✅ 계정 정보가 성공적으로 저장되었습니다.');

    setTimeout(() => {
      setToastMessage(null);
      onBack();
    }, 800);
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 상단 헤더 (← 내 계정 | 저장) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>내 계정</span>
        </div>

        <button
          onClick={handleSave}
          style={{
            fontSize: '15px',
            fontWeight: 800,
            color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF',
            cursor: 'pointer'
          }}
        >
          저장
        </button>
      </div>

      {toastMessage && (
        <div style={{
          background: '#191F28',
          color: '#FFFFFF',
          padding: '10px 16px',
          fontSize: '13px',
          textAlign: 'center',
          fontWeight: 600
        }}>
          {toastMessage}
        </div>
      )}

      {/* 필드 목록 (스크린샷 3 일치) */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* 1. 이메일 (Read-only) */}
        <div style={fieldRowStyle}>
          <span style={labelStyle}>이메일</span>
          <span style={{ fontSize: '15px', color: '#6B7684', flex: 1 }}>{user.email}</span>
        </div>

        {/* 2. 성 */}
        <div style={fieldRowStyle}>
          <span style={labelStyle}>성</span>
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            style={inputStyle}
          />
          {lastName && (
            <button onClick={() => setLastName('')} style={clearBtnStyle}>
              <X size={16} color="#8B95A1" />
            </button>
          )}
        </div>

        {/* 3. 이름 */}
        <div style={fieldRowStyle}>
          <span style={labelStyle}>이름</span>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            style={inputStyle}
          />
          {firstName && (
            <button onClick={() => setFirstName('')} style={clearBtnStyle}>
              <X size={16} color="#8B95A1" />
            </button>
          )}
        </div>

        {/* 4. 전화번호 */}
        <div style={fieldRowStyle}>
          <span style={labelStyle}>전화번호</span>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={inputStyle}
          />
          {phone && (
            <button onClick={() => setPhone('')} style={clearBtnStyle}>
              <X size={16} color="#8B95A1" />
            </button>
          )}
        </div>

        {/* 5. 언어 */}
        <div style={fieldRowStyle}>
          <span style={labelStyle}>언어</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <span style={{ fontSize: '15px', color: '#191F28' }}>{language}</span>
            <ChevronDown size={16} color="#6B7684" />
          </div>
        </div>

        {/* 6. 시간대 */}
        <div style={fieldRowStyle}>
          <span style={labelStyle}>시간대</span>
          <span style={{ fontSize: '15px', color: '#191F28' }}>{timezone}</span>
        </div>
      </div>

      {/* 구분선 */}
      <div style={{ height: '12px', background: '#F8F9FA', borderTop: '1px solid #ECEFF2', borderBottom: '1px solid #ECEFF2' }} />

      {/* 모든 기기에서 로그아웃 */}
      <div
        onClick={() => {
          if (confirm('모든 기기에서 로그아웃 하시겠습니까?')) {
            alert('모든 기기에서 로그아웃 처리되었습니다.');
          }
        }}
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid #ECEFF2',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#0066FF' }}>모든 기기에서 로그아웃</span>
      </div>

      {/* 구분선 */}
      <div style={{ height: '12px', background: '#F8F9FA', borderBottom: '1px solid #ECEFF2' }} />

      {/* 계정 탈퇴 */}
      <div
        onClick={() => {
          if (confirm('정말로 계정을 탈퇴하시겠습니까? 관련 근태 데이터가 파기됩니다.')) {
            alert('계정 탈퇴 요청이 접수되었습니다.');
          }
        }}
        style={{
          padding: '16px 18px',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#F04438' }}>계정 탈퇴</span>
      </div>
    </div>
  );
};

const fieldRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '14px 18px',
  borderBottom: '1px solid #F1F3F5',
  background: '#FFFFFF'
};

const labelStyle: React.CSSProperties = {
  width: '80px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#8B95A1'
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  outline: 'none',
  fontSize: '15px',
  color: '#191F28',
  background: 'transparent'
};

const clearBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
  color: '#8B95A1'
};
