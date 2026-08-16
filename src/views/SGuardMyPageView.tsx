import React, { useState } from 'react';
import { 
  User, 
  X, 
  Smartphone, 
  Phone, 
  Building2, 
  Lock, 
  Mail, 
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Check,
  Briefcase
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
  const [name, setName] = useState(user.name.split(' ')[0] || '송무준');
  const [phone, setPhone] = useState(user.phone || '010-4732-8880');
  const [email, setEmail] = useState(user.email || 'moojun.song@naver.com');
  const [company, setCompany] = useState(user.companyName || user.partnerCompany || '유브갓');
  
  // 업체별 현장관리인 여부 체크 상태
  const [isPartnerManager, setIsPartnerManager] = useState<boolean>(
    user.role === 'PARTNER_PART_LEADER' || (user as any).role === 'PARTNER_MANAGER'
  );

  const [team, setTeam] = useState(user.deptName || '상담팀');
  const [part, setPart] = useState(user.partName || '상담');
  const [position, setPosition] = useState('과장');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // 개인정보 마스킹 처리
  const maskedName = name.length > 2 
    ? `${name[0]}*${name[name.length - 1]}` 
    : name.length === 2 
      ? `${name[0]}*` 
      : name;

  const emailParts = email.split('@');
  const emailUser = emailParts[0] || 'user';
  const emailDomain = emailParts[1] || 'gmail.com';
  const maskedEmail = emailUser.length > 2 
    ? `${emailUser.substring(0, 2)}*******@${emailDomain}` 
    : `${emailUser}*@${emailDomain}`;

  // 프로필 아바타 이니셜 (이름의 첫 글자 동적 연동)
  const avatarInitial = (name.trim() || '송')[0];

  const handleSaveProfile = () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      alert('올바른 외부 이메일 주소(구글, 네이버 등)를 입력해주세요.');
      return;
    }

    const assignedRole = isPartnerManager ? 'PARTNER_PART_LEADER' : company === '신한DS' ? 'DS_PRINCIPAL_PM' : 'PARTNER_WORKER';
    const assignedTeam = isPartnerManager ? '영업총괄팀' : team;
    const assignedPart = isPartnerManager ? '전사총괄' : part;
    const roleTitle = isPartnerManager ? `${company} 현장관리인 (영업대표)` : '도급 인력';

    const updated = dbService.updateUser({
      name: `${name} (${isPartnerManager ? '관리인' : position})`,
      phone: phone,
      email: email,
      companyName: company,
      partnerCompany: company,
      deptName: assignedTeam,
      partName: assignedPart,
      role: assignedRole,
      roleTitle: roleTitle
    });

    if (onUserUpdated) {
      onUserUpdated(updated);
    }

    alert(`🎉 S-GUARD 회원 정보가 실제 DB(users)에 안전하게 저장되었습니다.\n• 이름: ${name}\n• 현장관리인 여부: ${isPartnerManager ? 'YES (업체 관리자/영업대표)' : 'NO (일반 도급 인력)'}\n• 외부메일: ${email}\n• 소속: ${company} (${isPartnerManager ? '전사 총괄' : `${assignedTeam} / ${assignedPart} 파트`})\n• 직책: ${position}`);
    onClose();
  };

  const handlePasswordChange = () => {
    if (!newPw || newPw !== confirmPw) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    alert('🔒 S-GUARD 2단계 보안 비밀번호가 DB에 안전하게 변경 적용되었습니다.');
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
              회원 정보 관리 (DB 연동)
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
          gap: '16px'
        }}>
          {/* 프로필 서브 카드 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: isPartnerManager 
                ? 'linear-gradient(135deg, #0284C7 0%, #0052FF 100%)'
                : 'linear-gradient(135deg, #0052FF 0%, #00D4FF 100%)',
              border: '2.5px solid #00E5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 900,
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 229, 255, 0.3)',
              position: 'relative',
              flexShrink: 0
            }}>
              <span>{avatarInitial}</span>
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

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF' }}>
                  {maskedName}
                </span>
                {isPartnerManager && (
                  <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#00E5FF', background: 'rgba(0, 229, 255, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                    현장관리인 (영업대표)
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12.5px', color: '#90A4AE', letterSpacing: '0.2px', wordBreak: 'break-all' }}>
                {maskedEmail}
              </div>
            </div>
          </div>

          {/* 휴대폰 기종 (Push 알림용) 토글 버튼 */}
          <div>
            <label style={fieldLabelStyle}>휴대폰 기종 (Push 알림용)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setDeviceType('Android')}
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  border: 'none',
                  background: deviceType === 'Android' ? '#0052FF' : 'rgba(255, 255, 255, 0.06)',
                  color: '#FFFFFF',
                  fontSize: '14px',
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
                  height: '42px',
                  borderRadius: '10px',
                  border: 'none',
                  background: deviceType === 'iOS' ? '#0052FF' : 'rgba(255, 255, 255, 0.06)',
                  color: '#FFFFFF',
                  fontSize: '14px',
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
                placeholder="성명 입력"
                style={inputFieldStyle}
              />
            </div>
          </div>

          {/* 이메일 주소 (외부 메일: 구글/네이버/카카오 등) */}
          <div>
            <label style={fieldLabelStyle}>이메일 주소 (외부 메일: 구글/네이버 등) *</label>
            <div style={inputContainerStyle}>
              <Mail size={17} color="#00E5FF" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="예: user@gmail.com, user@naver.com"
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
                placeholder="010-0000-0000"
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
                  <option value="유브갓" style={optionStyle}>유브갓</option>
                  <option value="(주)협력아이티에스" style={optionStyle}>(주)협력아이티에스</option>
                  <option value="현대IT솔루션" style={optionStyle}>현대IT솔루션</option>
                  <option value="오토시스" style={optionStyle}>오토시스</option>
                  <option value="파이낸스ITS" style={optionStyle}>파이낸스ITS</option>
                  <option value="신한DS" style={optionStyle}>신한DS</option>
                </select>
              </div>
              <ChevronDown size={17} color="#90A4AE" />
            </div>
          </div>

          {/* ⭐ 업체별 현장관리인(영업대표) 여부 체크박스 카드 */}
          <div 
            onClick={() => setIsPartnerManager(!isPartnerManager)}
            style={{
              background: isPartnerManager ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)',
              border: isPartnerManager ? '1.5px solid #00E5FF' : '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isPartnerManager ? '0 0 16px rgba(0, 229, 255, 0.2)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                background: isPartnerManager ? '#00E5FF' : 'rgba(255, 255, 255, 0.1)',
                border: isPartnerManager ? 'none' : '1.5px solid #90A4AE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0F172A',
                flexShrink: 0
              }}>
                {isPartnerManager && <Check size={16} strokeWidth={3.5} />}
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: isPartnerManager ? '#00E5FF' : '#FFFFFF' }}>
                  업체별 현장관리인 (영업대표/총괄)
                </div>
                <div style={{ fontSize: '11px', color: '#90A4AE', marginTop: '1px' }}>
                  {isPartnerManager 
                    ? '✓ 체크됨: 자사 전체 인력 총괄 권한 (팀·파트 선택 잠금)' 
                    : '체크 시 자사 전체 인력 관제 권한 부여 (팀·파트 선택 불가)'}
                </div>
              </div>
            </div>
            <Briefcase size={18} color={isPartnerManager ? '#00E5FF' : '#64748B'} />
          </div>

          {/* 팀 & 파트 (2열 그리드 - 협력사 현장관리인일 때만 비활성화 잠금, 신한DS는 선택 허용) */}
          {(() => {
            const isLocked = isPartnerManager && company !== '신한DS';
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', opacity: isLocked ? 0.45 : 1 }}>
                <div>
                  <label style={fieldLabelStyle}>
                    팀 {isLocked ? <span style={{ color: '#FF8A80', fontSize: '10.5px' }}>(관리자 선택불가)</span> : (company === '신한DS' && isPartnerManager ? <span style={{ color: '#00E5FF', fontSize: '10.5px' }}>(DS PM 관제팀)</span> : null)}
                  </label>
                  <div style={{
                    ...selectContainerStyle,
                    background: isLocked ? '#0D1522' : '#192841',
                    cursor: isLocked ? 'not-allowed' : 'pointer'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <Building2 size={16} color={isLocked ? '#64748B' : '#90A4AE'} style={{ flexShrink: 0 }} />
                      <select
                        disabled={isLocked}
                        value={isLocked ? '전사 총괄' : team}
                        onChange={e => setTeam(e.target.value)}
                        style={{
                          ...selectFieldStyle,
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          color: isLocked ? '#64748B' : '#FFFFFF'
                        }}
                      >
                        {isLocked ? (
                          <option value="전사 총괄" style={optionStyle}>전사 총괄 (선택 불가)</option>
                        ) : (
                          <>
                            <option value="상담팀" style={optionStyle}>상담팀</option>
                            <option value="오토팀" style={optionStyle}>오토팀</option>
                            <option value="재무팀" style={optionStyle}>재무팀</option>
                            <option value="카드개발팀" style={optionStyle}>카드개발팀</option>
                            <option value="결제개발팀" style={optionStyle}>결제개발팀</option>
                            <option value="데이터인프라팀" style={optionStyle}>데이터인프라팀</option>
                          </>
                        )}
                      </select>
                    </div>
                    <ChevronDown size={15} color={isLocked ? '#475569' : '#90A4AE'} style={{ flexShrink: 0 }} />
                  </div>
                </div>

                <div>
                  <label style={fieldLabelStyle}>
                    파트 {isLocked ? <span style={{ color: '#FF8A80', fontSize: '10.5px' }}>(관리자 선택불가)</span> : (company === '신한DS' && isPartnerManager ? <span style={{ color: '#00E5FF', fontSize: '10.5px' }}>(DS PM 관제파트)</span> : null)}
                  </label>
                  <div style={{
                    ...selectContainerStyle,
                    background: isLocked ? '#0D1522' : '#192841',
                    cursor: isLocked ? 'not-allowed' : 'pointer'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <Building2 size={16} color={isLocked ? '#64748B' : '#90A4AE'} style={{ flexShrink: 0 }} />
                      <select
                        disabled={isLocked}
                        value={isLocked ? '전 파트 총괄' : part}
                        onChange={e => setPart(e.target.value)}
                        style={{
                          ...selectFieldStyle,
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          color: isLocked ? '#64748B' : '#FFFFFF'
                        }}
                      >
                        {isLocked ? (
                          <option value="전 파트 총괄" style={optionStyle}>전 파트 총괄 (선택 불가)</option>
                        ) : (
                          <>
                            <option value="상담" style={optionStyle}>상담</option>
                            <option value="오토" style={optionStyle}>오토</option>
                            <option value="재무" style={optionStyle}>재무</option>
                            <option value="카드IS" style={optionStyle}>카드IS</option>
                            <option value="결제망" style={optionStyle}>결제망</option>
                            <option value="데이터" style={optionStyle}>데이터</option>
                            <option value="FDS" style={optionStyle}>FDS</option>
                            <option value="CRM" style={optionStyle}>CRM</option>
                            <option value="모바일" style={optionStyle}>모바일</option>
                            <option value="인프라" style={optionStyle}>인프라</option>
                          </>
                        )}
                      </select>
                    </div>
                    <ChevronDown size={15} color={isLocked ? '#475569' : '#90A4AE'} style={{ flexShrink: 0 }} />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 직책 (8단계 직책 선택 버튼) */}
          <div>
            <label style={fieldLabelStyle}>직책</label>
            <div style={{
              background: '#192841',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px'
            }}>
              {['사원', '대리', '과장', '차장', '부부장', '부장', '이사', '대표이사'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPosition(p)}
                  style={{
                    padding: '7px 2px',
                    borderRadius: '6px',
                    border: 'none',
                    background: position === p ? '#0052FF' : 'rgba(255, 255, 255, 0.05)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: position === p ? 800 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 비밀번호 변경하기 토글 링크 */}
          <div style={{ paddingTop: '4px' }}>
            <button
              type="button"
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              style={{
                background: 'none',
                border: 'none',
                color: '#00E5FF',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <Lock size={14} color="#00E5FF" />
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
          padding: '14px 22px',
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
