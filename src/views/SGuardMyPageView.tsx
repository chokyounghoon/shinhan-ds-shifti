import React, { useState, useEffect, useRef } from 'react';
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
  Briefcase,
  LogOut,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { dbService } from '../services/db';

interface SGuardMyPageViewProps {
  user: UserType;
  onClose: () => void;
  onLogout?: () => void;
  onUserUpdated?: (updated: UserType) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const SGuardMyPageView: React.FC<SGuardMyPageViewProps> = ({
  user,
  onClose,
  onLogout,
  onUserUpdated,
  themeMode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return (user as any).avatarUrl || (user as any).profileImage || '';
  });
  const [deviceType, setDeviceType] = useState<'Android' | 'iOS'>(() => {
    const dt = (user as any).deviceType || (user as any).device_type;
    return (dt === 'iOS' || dt === 'ios') ? 'iOS' : 'Android';
  });
  const [name, setName] = useState<string>(() => {
    const raw = user.name || '조경훈';
    return raw.replace(/\s*\([^)]*\)/g, '').trim();
  });
  const [phone, setPhone] = useState(user.phone || '010-4732-8880');
  const [email, setEmail] = useState(user.email || 'khcho0421@gmail.com');
  const [company, setCompany] = useState(user.companyName || user.partnerCompany || '신한DS');
  
  // 업체별 현장관리인 여부 체크 상태 (정확한 영속성 바인딩)
  const [isPartnerManager, setIsPartnerManager] = useState<boolean>(() => {
    return (
      (user as any).isPartnerManager === true ||
      user.role === 'PARTNER_PART_LEADER' || 
      (user as any).role === 'PARTNER_MANAGER' ||
      (user.roleTitle || '').includes('관리인') ||
      (user.roleTitle || '').includes('영업대표')
    );
  });

  const [team, setTeam] = useState(user.deptName || '카드개발팀');
  const [part, setPart] = useState(user.partName || '카드IS');

  // 직책 초기화 (user.position 또는 roleTitle/name에서 추출)
  const [position, setPosition] = useState<string>(() => {
    if ((user as any).position) return (user as any).position;
    const match = (user.name || '').match(/\(([^)]+)\)/);
    if (match && match[1] && match[1] !== '관리인') return match[1];
    if (user.role === 'DS_PRINCIPAL_PM') return '부장';
    if (user.role === 'PARTNER_PART_LEADER' || (user as any).role === 'PARTNER_MANAGER') return '이사';
    return '과장';
  });

  const formatPhone344 = (val: string): string => {
    const raw = (val || '').replace(/[^0-9]/g, '').slice(0, 11);
    if (raw.length <= 3) return raw;
    if (raw.length <= 7) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
    return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
  };

  // 사진 업로드 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('사진 파일 크기는 5MB 이하만 업로드 가능합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatarUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  // user prop 변경 시 모달 내부 폼 값 실시간 동기화
  useEffect(() => {
    if (user) {
      setAvatarUrl((user as any).avatarUrl || (user as any).profileImage || '');
      const dt = (user as any).deviceType || (user as any).device_type;
      setDeviceType((dt === 'iOS' || dt === 'ios') ? 'iOS' : 'Android');
      setName((user.name || '').replace(/\s*\([^)]*\)/g, '').trim());
      setPhone(formatPhone344(user.phone || ''));
      setEmail(user.email || '');
      setCompany(user.companyName || user.partnerCompany || '신한DS');
      setTeam(user.deptName || '카드개발팀');
      setPart(user.partName || '카드IS');
      setIsPartnerManager(
        (user as any).isPartnerManager === true ||
        user.role === 'PARTNER_PART_LEADER' || 
        (user as any).role === 'PARTNER_MANAGER' ||
        (user.roleTitle || '').includes('관리인') ||
        (user.roleTitle || '').includes('영업대표')
      );
      const pos = (user as any).position || (user.role === 'DS_PRINCIPAL_PM' ? '부장' : '과장');
      setPosition(pos);
    }
  }, [user]);

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
  const avatarInitial = (name.trim() || '조')[0];

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      alert('올바른 외부 이메일 주소(구글, 네이버 등)를 입력해주세요.');
      return;
    }

    const isDS = company === '신한DS' || company.includes('신한');
    const assignedRole: UserRole = isDS 
      ? 'DS_PRINCIPAL_PM' 
      : isPartnerManager 
        ? 'PARTNER_PART_LEADER' 
        : 'PARTNER_WORKER';
    const assignedTeam = (isPartnerManager && !isDS) ? '영업총괄팀' : team;
    const assignedPart = (isPartnerManager && !isDS) ? '전사총괄' : part;
    const roleTitle = isDS 
      ? `신한DS ${assignedTeam} PM` 
      : isPartnerManager 
        ? `${company} 현장관리인 (영업대표)` 
        : `${position}`;

    let rawEmpId = ((user as any).employeeId || user.id || 'S01832').toUpperCase().trim();
    if (rawEmpId === 'USR-001') rawEmpId = 'UB0001';
    else if (rawEmpId === 'USR-002') rawEmpId = 'MGRUB1';
    else if (rawEmpId === 'S18121020' || rawEmpId === '01832') rawEmpId = 'S01832';
    const userEmpId = rawEmpId;

    const updated = dbService.updateUser({
      id: userEmpId,
      employeeId: userEmpId,
      name: `${name}`,
      phone: phone,
      email: email,
      companyName: company,
      partnerCompany: company,
      deptName: assignedTeam,
      partName: assignedPart,
      role: assignedRole,
      roleTitle: roleTitle,
      isPartnerManager: isPartnerManager,
      position: position,
      deviceType: deviceType,
      avatarUrl: avatarUrl,
      profileImage: avatarUrl
    } as any);

    // 1. 세션 로컬스토리지(SGUARD_AUTH_SESSION) 갱신
    try {
      const savedSession = localStorage.getItem('SGUARD_AUTH_SESSION');
      if (savedSession) {
        const sessionObj = JSON.parse(savedSession);
        const newSession = {
          ...sessionObj,
          ...updated,
          id: userEmpId,
          employeeId: userEmpId,
          name: name,
          companyName: company,
          partnerCompany: company,
          deptName: assignedTeam,
          partName: assignedPart,
          role: assignedRole,
          roleTitle: roleTitle,
          isPartnerManager: isPartnerManager,
          position: position,
          deviceType: deviceType,
          avatarUrl: avatarUrl,
          profileImage: avatarUrl
        };
        localStorage.setItem('SGUARD_AUTH_SESSION', JSON.stringify(newSession));
      }
    } catch (e) {}

    // 2. 실제 Cloudflare D1 shifti-db users 테이블 실시간 동기화 (기존 키 기준 1:1 UPDATE)
    try {
      await fetch('https://sguardai.khcho0421.workers.dev/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: userEmpId,
          name: name,
          email: email,
          phone: phone,
          company: company,
          team: assignedTeam,
          part: assignedPart,
          position: position,
          role: assignedRole,
          isPartnerManager: isPartnerManager ? 1 : 0,
          deviceType: deviceType,
          avatarUrl: avatarUrl,
          actor: userEmpId
        })
      });
    } catch (err) {
      console.warn('[D1 update error]', err);
    }

    if (onUserUpdated) {
      onUserUpdated({
        ...updated,
        id: userEmpId,
        employeeId: userEmpId,
        isPartnerManager: isPartnerManager,
        position: position,
        deviceType: deviceType,
        avatarUrl: avatarUrl,
        profileImage: avatarUrl
      } as any);
    }

    alert(`🎉 회원 정보가 안전하게 저장되었습니다.\n• 이름: ${name}\n• 프로필 사진: ${avatarUrl ? '등록 완료' : '기본 이니셜'}\n• 휴대폰 기종: ${deviceType === 'iOS' ? 'iOS (iPhone)' : 'Android'}\n• 소속: ${company} (${isPartnerManager ? '전사 총괄' : `${assignedTeam} / ${assignedPart} 파트`})\n• 직책: ${position}`);
    onClose();
  };

  const handlePasswordChange = async () => {
    const trimmedCurrentPw = currentPw.trim();
    const trimmedNewPw = newPw.trim();
    const trimmedConfirmPw = confirmPw.trim();

    if (!trimmedCurrentPw) {
      alert('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (!trimmedNewPw) {
      alert('새 비밀번호를 입력해주세요.');
      return;
    }
    if (trimmedNewPw.length < 8) {
      alert('새 비밀번호는 보안을 위해 최소 8자리 이상이어야 합니다.');
      return;
    }
    if (trimmedNewPw !== trimmedConfirmPw) {
      alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (trimmedCurrentPw === trimmedNewPw) {
      alert('새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.');
      return;
    }

    let rawEmpId = ((user as any).employeeId || user.id || 'S01832').toUpperCase().trim();
    if (rawEmpId === 'USR-001') rawEmpId = 'UB0001';
    else if (rawEmpId === 'USR-002') rawEmpId = 'MGRUB1';
    else if (rawEmpId === 'S18121020' || rawEmpId === '01832') rawEmpId = 'S01832';
    const userEmpId = rawEmpId;

    try {
      const res = await fetch('https://sguardai.khcho0421.workers.dev/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: userEmpId,
          old_password: trimmedCurrentPw,
          new_password: trimmedNewPw
        })
      });
      const data = await res.json();

      if (!res.ok || data.success === false) {
        alert(`❌ 비밀번호 변경 실패\n${data.detail || '현재 비밀번호가 올바르지 않습니다. 다시 확인해 주세요.'}`);
        return;
      }

      // 로컬 DB 및 세션에도 업데이트
      dbService.updateUserPassword(userEmpId, trimmedNewPw);
      alert('🔒 S-GUARD 2단계 보안 비밀번호가 DB에 안전하게 변경 적용되었습니다.\n다음 로그인 시 변경된 새 비밀번호를 사용해 주세요.');
      setIsChangingPassword(false);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err: any) {
      // 오프라인/네트워크 폴백 검증
      const isValidLocal = dbService.verifyPasswordInDb(userEmpId, trimmedCurrentPw);
      if (!isValidLocal) {
        alert('❌ 현재 비밀번호가 올바르지 않습니다. 다시 확인해 주세요.');
        return;
      }
      dbService.updateUserPassword(userEmpId, trimmedNewPw);
      alert('🔒 S-GUARD 2단계 보안 비밀번호가 안전하게 변경 적용되었습니다.');
      setIsChangingPassword(false);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    }
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
      {/* 숨겨진 파일 업로드 인풋 */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
      />

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
            {/* 사진 업로드 가능한 원형 아바타 */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              title="클릭하여 프로필 사진 등록/변경"
              style={{
                width: '56px',
                height: '56px',
                position: 'relative',
                flexShrink: 0,
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: isPartnerManager 
                  ? 'linear-gradient(135deg, #0284C7 0%, #0052FF 100%)'
                  : 'linear-gradient(135deg, #0052FF 0%, #00D4FF 100%)',
                border: '2.5px solid #00E5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '21px',
                fontWeight: 900,
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(0, 229, 255, 0.4)',
                overflow: 'hidden'
              }}>
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="프로필" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <span>{avatarInitial}</span>
                )}
              </div>

              {/* 카메라 아이콘 뱃지 */}
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#00E5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
                zIndex: 2
              }}>
                <Camera size={12} color="#0D1B2A" strokeWidth={2.6} />
              </div>
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF' }}>
                  {maskedName}
                </span>
                {isPartnerManager && (
                  <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#00E5FF', background: 'rgba(0, 229, 255, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                    현장관리인 (영업대표)
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#90A4AE', letterSpacing: '0.2px', wordBreak: 'break-all' }}>
                {maskedEmail}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'rgba(0, 229, 255, 0.15)',
                    border: '1px solid rgba(0, 229, 255, 0.4)',
                    borderRadius: '6px',
                    color: '#00E5FF',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <Camera size={11} />
                  <span>{avatarUrl ? '사진 변경' : '사진 등록'}</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      color: '#F87171',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <Trash2 size={11} />
                    <span>삭제</span>
                  </button>
                )}
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
                maxLength={13}
                value={formatPhone344(phone)}
                onChange={e => setPhone(formatPhone344(e.target.value))}
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
                  {company === '신한DS' ? '신한DS 현장대리인 (PM/총괄)' : '협력사 현장관리인 (영업대표/총괄)'}
                </div>
                <div style={{ fontSize: '11px', color: '#90A4AE', marginTop: '1px' }}>
                  {company === '신한DS' 
                    ? `✓ 신한DS 관리인: 선택하신 [${team} / ${part}]의 도급 공정을 총괄 관제합니다` 
                    : isPartnerManager 
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
        {/* 3. 하단 버튼 바 (로그아웃 / 닫기 / 저장) */}
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: '10px',
          background: '#0F1A2C'
        }}>
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                if (confirm('로그아웃 하시겠습니까?\n로그아웃 시 최초 로그인 화면으로 이동합니다.')) {
                  onLogout();
                }
              }}
              style={{
                flex: 1.1,
                height: '46px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#FF5252',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={16} />
              <span>로그아웃</span>
            </button>
          )}

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
              flex: 1.5,
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
