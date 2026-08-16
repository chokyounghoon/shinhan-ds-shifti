import React, { useState } from 'react';
import { 
  User, 
  X, 
  Smartphone, 
  Phone, 
  Building2, 
  Lock, 
  Check, 
  ChevronDown,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { User as UserType } from '../types';
import { dbService } from '../services/db';

interface SGuardMyPageViewProps {
  user: UserType;
  onClose: () => void;
  onUserUpdated?: (updated: UserType) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const SGuardMyPageView: React.FC<SGuardMyPageViewProps> = ({
  user,
  onClose,
  onUserUpdated,
  themeMode
}) => {
  const [deviceType, setDeviceType] = useState<'Android' | 'iOS'>('Android');
  const [name, setName] = useState(user.name.split(' ')[0] || '조경훈');
  const [phone, setPhone] = useState(user.phone || '010-4732-8880');
  const [company, setCompany] = useState(user.companyName || user.partnerCompany || '신한DS');
  const [department, setDepartment] = useState('개발운영부문');
  const [division, setDivision] = useState('금융본부');
  const [team, setTeam] = useState('카드개발팀');
  const [part, setPart] = useState('상담');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // 개인정보 마스킹 처리 (스크린샷 일치: 조*훈 / kh*******@gmail.com)
  const maskedName = name.length > 2 
    ? `${name[0]}*${name[name.length - 1]}` 
    : name.length === 2 
      ? `${name[0]}*` 
      : name;

  const emailUser = (user.email || 'khcho.pm@gmail.com').split('@')[0];
  const emailDomain = (user.email || 'khcho.pm@gmail.com').split('@')[1] || 'gmail.com';
  const maskedEmail = emailUser.length > 2 
    ? `${emailUser.substring(0, 2)}*******@${emailDomain}` 
    : `${emailUser}*@${emailDomain}`;

  const handleSaveProfile = () => {
    const updated = dbService.updateUser({
      name: name,
      phone: phone,
      companyName: company,
      partnerCompany: company,
      deptName: team
    });

    if (onUserUpdated) {
      onUserUpdated(updated);
    }

    alert('✅ S-GUARD 회원 정보가 성공적으로 업데이트되었습니다.');
    onClose();
  };

  const handlePasswordChange = () => {
    if (!newPw || newPw !== confirmPw) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    alert('🔒 S-GUARD 2단계 보안 비밀번호가 안전하게 변경되었습니다.');
    setIsChangingPassword(false);
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(10, 15, 29, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '92vh',
          background: '#132035',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          borderRadius: '18px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 82, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          color: '#FFFFFF',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 1. 모달 헤더 (👤 회원 정보 관리 | ✕) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 22px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="#00E5FF" strokeWidth={2.4} />
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
              회원 정보 관리
            </span>
          </div>

          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#90A4AE', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. 본문 스크롤 영역 */}
        <div style={{
          padding: '20px 22px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          {/* 프로필 서브 카드 (사진 + 조*훈 + kh*******@gmail.com) */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            {/* 프로필 아바타 (실제 사진 느낌의 그라디언트 + 이니셜) */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
              border: '2.5px solid #00E5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 800,
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 229, 255, 0.3)',
              position: 'relative'
            }}>
              <span>조</span>
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#00E5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={11} color="#0D1B2A" strokeWidth={3} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
                {maskedName}
              </div>
              <div style={{ fontSize: '13px', color: '#90A4AE', letterSpacing: '0.2px' }}>
                {maskedEmail}
              </div>
            </div>
          </div>

          {/* 휴대폰 기종 (Push 알림용) 토글 버튼 (스크린샷 일치) */}
          <div>
            <label style={fieldLabelStyle}>휴대폰 기종 (Push 알림용)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setDeviceType('Android')}
                style={{
                  height: '44px',
                  borderRadius: '10px',
                  border: 'none',
                  background: deviceType === 'Android' ? '#0052FF' : 'rgba(255, 255, 255, 0.06)',
                  color: '#FFFFFF',
                  fontSize: '14.5px',
                  fontWeight: deviceType === 'Android' ? 800 : 600,
                  cursor: 'pointer',
                  boxShadow: deviceType === 'Android' ? '0 4px 12px rgba(0, 82, 255, 0.4)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Android
              </button>

              <button
                type="button"
                onClick={() => setDeviceType('iOS')}
                style={{
                  height: '44px',
                  borderRadius: '10px',
                  border: 'none',
                  background: deviceType === 'iOS' ? '#0052FF' : 'rgba(255, 255, 255, 0.06)',
                  color: '#FFFFFF',
                  fontSize: '14.5px',
                  fontWeight: deviceType === 'iOS' ? 800 : 600,
                  cursor: 'pointer',
                  boxShadow: deviceType === 'iOS' ? '0 4px 12px rgba(0, 82, 255, 0.4)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                iOS (iPhone)
              </button>
            </div>
          </div>

          {/* 이름 * 입력창 */}
          <div>
            <label style={fieldLabelStyle}>이름 *</label>
            <div style={inputContainerStyle}>
              <User size={17} color="#90A4AE" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputFieldStyle}
              />
            </div>
          </div>

          {/* 핸드폰 번호 입력창 */}
          <div>
            <label style={fieldLabelStyle}>핸드폰 번호</label>
            <div style={inputContainerStyle}>
              <Phone size={17} color="#90A4AE" />
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={inputFieldStyle}
              />
            </div>
          </div>

          {/* 회사소속 드롭다운 */}
          <div>
            <label style={fieldLabelStyle}>회사소속</label>
            <div style={selectContainerStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={17} color="#90A4AE" />
                <select
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  style={selectFieldStyle}
                >
                  <option value="신한DS" style={optionStyle}>신한DS</option>
                  <option value="(주)협력아이티에스" style={optionStyle}>(주)협력아이티에스</option>
                  <option value="신한은행" style={optionStyle}>신한은행</option>
                  <option value="신한카드" style={optionStyle}>신한카드</option>
                </select>
              </div>
              <ChevronDown size={17} color="#90A4AE" />
            </div>
          </div>

          {/* 팀 & 파트 (2열 그리드: 부문->팀, 본부->파트 반영) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={fieldLabelStyle}>팀</label>
              <div style={selectContainerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <Building2 size={16} color="#90A4AE" style={{ flexShrink: 0 }} />
                  <select
                    value={team}
                    onChange={e => setTeam(e.target.value)}
                    style={selectFieldStyle}
                  >
                    <option value="카드개발팀" style={optionStyle}>카드개발팀</option>
                    <option value="은행운영팀" style={optionStyle}>은행운영팀</option>
                    <option value="데이터플랫폼팀" style={optionStyle}>데이터플랫폼팀</option>
                    <option value="개발운영팀" style={optionStyle}>개발운영팀</option>
                    <option value="ICT운영팀" style={optionStyle}>ICT운영팀</option>
                  </select>
                </div>
                <ChevronDown size={15} color="#90A4AE" style={{ flexShrink: 0 }} />
              </div>
            </div>

            <div>
              <label style={fieldLabelStyle}>파트</label>
              <div style={selectContainerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <Building2 size={16} color="#90A4AE" style={{ flexShrink: 0 }} />
                  <select
                    value={part}
                    onChange={e => setPart(e.target.value)}
                    style={selectFieldStyle}
                  >
                    <option value="카드IS (Part 1)" style={optionStyle}>카드IS (Part 1)</option>
                    <option value="코어뱅킹 (Part 2)" style={optionStyle}>코어뱅킹 (Part 2)</option>
                    <option value="데이터인프라 (Part 3)" style={optionStyle}>데이터인프라 (Part 3)</option>
                    <option value="상담파트" style={optionStyle}>상담파트</option>
                    <option value="금융파트" style={optionStyle}>금융파트</option>
                  </select>
                </div>
                <ChevronDown size={15} color="#90A4AE" style={{ flexShrink: 0 }} />
              </div>
            </div>
          </div>

          {/* 비밀번호 변경하기 토글 링크 */}
          <div style={{ paddingTop: '6px' }}>
            <button
              type="button"
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              style={{
                background: 'none',
                border: 'none',
                color: '#00E5FF',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <Lock size={15} color="#00E5FF" />
              <span>비밀번호 변경하기</span>
            </button>
          </div>

          {/* 비밀번호 변경 폼 (펼쳐짐) */}
          {isChangingPassword && (
            <div style={{
              background: 'rgba(0, 229, 255, 0.05)',
              border: '1px dashed rgba(0, 229, 255, 0.3)',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                style={{ ...inputFieldStyle, background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '10px' }}
              />
              <input
                type="password"
                placeholder="새 비밀번호"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                style={{ ...inputFieldStyle, background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '10px' }}
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                style={{ ...inputFieldStyle, background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '10px' }}
              />
              <button
                type="button"
                onClick={handlePasswordChange}
                style={{
                  height: '38px',
                  background: '#0052FF',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                비밀번호 변경 적용
              </button>
            </div>
          )}
        </div>

        {/* 3. 하단 액션 버튼 바 */}
        <div style={{
          padding: '16px 22px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: '10px',
          background: '#0F1A2C'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: '46px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              fontSize: '14.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            닫기
          </button>

          <button
            type="button"
            onClick={handleSaveProfile}
            style={{
              flex: 2,
              height: '46px',
              borderRadius: '10px',
              background: 'linear-gradient(90deg, #0052FF 0%, #00D4FF 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 82, 255, 0.35)'
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#90A4AE',
  display: 'block',
  marginBottom: '6px'
};

const inputContainerStyle: React.CSSProperties = {
  background: '#192841',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  height: '44px'
};

const inputFieldStyle: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#FFFFFF',
  fontSize: '14.5px',
  fontWeight: 600,
  paddingLeft: '10px'
};

const selectContainerStyle: React.CSSProperties = {
  background: '#192841',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 10px',
  height: '44px'
};

const selectFieldStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#FFFFFF',
  fontSize: '13.5px',
  fontWeight: 600,
  cursor: 'pointer',
  appearance: 'none',
  width: '100%'
};

const optionStyle: React.CSSProperties = {
  background: '#132035',
  color: '#FFFFFF'
};
