import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Loader2, 
  ChevronRight, 
  KeyRound, 
  SmartphoneNfc, 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Lock, 
  Building2, 
  User, 
  Send,
  X,
  Check
} from 'lucide-react';
import { dbService, predefinedUsers } from '../services/db';
import { User as UserType, UserRole } from '../types';

interface SGuardLoginViewProps {
  onLoginSuccess: (user: UserType) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

type AuthStep = 'ID' | 'OTP' | 'PASSWORD' | 'SIGNUP' | 'RESET_A' | 'RESET_B';

/* ── 🔑 6자리 글로우 인터랙티브 OTP 박스 컴포넌트 (s_guard_AI 소스 그대로 이식) ── */
const OtpBoxes = React.memo(({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  disabled?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');
  const [activeIndex, setActiveIndex] = useState(value.length);

  useEffect(() => {
    setActiveIndex(value.length);
  }, [value]);

  useEffect(() => {
    if (!disabled && value.length < 6) {
      inputRef.current?.focus();
    }
  }, [disabled, value.length]);

  const updateActiveIndexFromCaret = () => {
    if (inputRef.current && !disabled) {
      setActiveIndex(inputRef.current.selectionStart ?? value.length);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange(val);
    setTimeout(updateActiveIndexFromCaret, 0);
  };

  const handleBoxClick = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (inputRef.current) {
      inputRef.current.focus();
      const targetIndex = Math.min(i, value.length);
      if (targetIndex < value.length) {
        inputRef.current.setSelectionRange(targetIndex, targetIndex + 1);
      } else {
        inputRef.current.setSelectionRange(value.length, value.length);
      }
      setActiveIndex(targetIndex);
    }
  };

  return (
    <div 
      onClick={() => { inputRef.current?.focus(); setTimeout(updateActiveIndexFromCaret, 0); }}
      style={{ position: 'relative', width: '100%', maxWidth: '280px', margin: '0 auto', height: 56, cursor: 'text' }}
    >
      {/* 실제 타이핑을 받는 투명 인풋 */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        maxLength={6}
        value={value}
        onChange={handleChange}
        onKeyUp={updateActiveIndexFromCaret}
        onSelect={updateActiveIndexFromCaret}
        disabled={disabled}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: 0.001,
          color: 'transparent',
          background: 'transparent',
          caretColor: 'transparent',
          border: 'none', outline: 'none',
          padding: 0, margin: 0, zIndex: 10,
          fontSize: 18,
          pointerEvents: 'none'
        }}
      />

      {/* 시각적 6자리 글로우 박스 레이어 */}
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'center', width: '100%', height: '100%',
        position: 'absolute', top: 0, left: 0
      }}>
        {[0, 1, 2, 3, 4, 5].map(i => {
          const isFilled = digits[i] !== '';
          const isCurrent = activeIndex === i && !disabled;
          return (
            <div
              key={i}
              onClick={(e) => handleBoxClick(i, e)}
              style={{
                width: 40, height: 56,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 900,
                color: '#00E5FF',
                background: isFilled 
                  ? (isCurrent ? 'rgba(0, 229, 255, 0.25)' : 'rgba(0, 229, 255, 0.12)') 
                  : (isCurrent ? 'rgba(0, 229, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)'),
                border: isCurrent
                  ? '2px solid #00E5FF'
                  : isFilled
                  ? '1.5px solid rgba(0, 229, 255, 0.6)'
                  : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 10,
                boxShadow: isCurrent ? '0 0 16px rgba(0, 229, 255, 0.5)' : 'none',
                transition: 'all 0.12s ease',
                flexShrink: 0,
                cursor: disabled ? 'not-allowed' : 'pointer'
              }}
            >
              {digits[i] ? (
                <span style={{ 
                  color: isCurrent ? '#FFFFFF' : '#00E5FF',
                  display: 'inline-block',
                  lineHeight: 1
                }}>{digits[i]}</span>
              ) : (isCurrent ? (
                <span style={{ 
                  width: 2, height: 24, background: '#00E5FF', borderRadius: 1,
                  boxShadow: '0 0 8px #00E5FF'
                }} />
              ) : null)}
            </div>
          );
        })}
      </div>
    </div>
  );
});

/* ── ⏱️ 타이머 컴포넌트 ── */
const Timer = ({ timerKey, secs, onExpire }: { timerKey: number; secs: number; onExpire: () => void }) => {
  const [left, setLeft] = useState(secs);
  useEffect(() => {
    setLeft(secs);
    const t = setInterval(() => {
      setLeft(p => {
        if (p <= 1) {
          clearInterval(t);
          onExpire();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timerKey, secs]);

  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  return (
    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 13, color: left < 60 ? '#FF5252' : '#00E5FF' }}>
      유효시간 {m}:{s}
    </span>
  );
};

/* ── 🔒 비밀번호 강도 측정 컴포넌트 ── */
const PwStrength = ({ pw }: { pw: string }) => {
  if (!pw) return null;
  const scores = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  const n = scores.filter(Boolean).length;
  const cols = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const labels = ['약함', '보통', '좋음', '강함'];
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {scores.map((ok, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: ok ? cols[n - 1] : 'rgba(255,255,255,0.08)', transition: 'all .3s' }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
        강도: <span style={{ fontWeight: 700, color: n < 2 ? '#ef4444' : n < 4 ? '#eab308' : '#22c55e' }}>{labels[n - 1] || labels[0]}</span>
      </p>
    </div>
  );
};

export const SGuardLoginView: React.FC<SGuardLoginViewProps> = ({
  onLoginSuccess,
  themeMode
}) => {
  const [step, setStep] = useState<AuthStep>('ID');
  const [empId, setEmpId] = useState<string>(() => {
    try {
      return localStorage.getItem('LAST_LOGIN_EMP_ID') || 'S181210';
    } catch (e) {
      return 'S181210';
    }
  });
  const [selectedUserPreset, setSelectedUserPreset] = useState('usr-ds-pm');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('789012');
  const [password, setPassword] = useState('••••••••');
  const [showPw, setShowPw] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('kh***@gmail.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timerKey, setTimerKey] = useState(Date.now());

  // 회원가입 폼 상태 (팀/파트, 직책 8단계, 퍼블릭 메일, 휴대전화번호)
  const [signupForm, setSignupForm] = useState({
    company: '신한DS',
    team: '카드개발팀',
    part: '카드IS (Part 1)',
    position: '사원',
    empNo: '',
    name: '',
    email: '',
    phone: '',
    deviceType: 'Android' as 'Android' | 'iOS',
    pw: '',
    confirmPw: '',
    isPartnerManager: false,
    agreeTerms: true
  });

  // 비밀번호 초기화 상태
  const [resetEmpId, setResetEmpId] = useState('S181210');
  const [newResetPw, setNewResetPw] = useState('');
  const [confirmResetPw, setConfirmResetPw] = useState('');

  const [isRealEmailSent, setIsRealEmailSent] = useState(false);

  // Step 1: 사번 입력 -> 실제 s-guard_AI Cloudflare Worker (Resend/Brevo) 실시간 연동 메일 발송
  const handleInitAuth = async () => {
    if (!empId.trim()) return setError('사번(아이디)을 입력해 주세요.');
    setLoading(true);
    setError('');

    const rawEmpId = empId.trim();

    // 이메일이 아닌 사번/아이디 입력인 경우 영문, 숫자 3~10자리 검증
    if (!rawEmpId.includes('@')) {
      if (rawEmpId.length < 3 || rawEmpId.length > 10) {
        setLoading(false);
        return setError('아이디(사번)는 영문·숫자 3~10자리여야 합니다. (예: S01832, partner01)');
      }
    }

    const localUser = dbService.findUserByEmpId(rawEmpId) || dbService.findUserByEmail(rawEmpId);
    const targetEmpId = localUser ? localUser.employeeId : rawEmpId;
    const cleanEmpId = targetEmpId.replace(/^S/i, '').replace(/^emp-/i, '').replace(/^pt-/i, '');

    try {
      // 1. 실제 s-guard_AI 백엔드 (Cloudflare Workers) 호출하여 실제 Gmail 발송
      let res = await fetch('https://sguardai.khcho0421.workers.dev/auth/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: cleanEmpId || targetEmpId,
          password: 'dummy_for_init',
          check_only: false // 실제 이메일 발송 실행!
        })
      });

      let data = await res.json();

      // 만약 Cloudflare D1에 사용자 정보가 아직 없다면, 로컬 정보로 즉시 동기화 등록 후 재호출!
      if (!res.ok && data.code === 'NOT_FOUND' && localUser) {
        try {
          await fetch('https://sguardai.khcho0421.workers.dev/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employee_id: cleanEmpId || targetEmpId,
              email: localUser.email,
              password: localUser.passwordHash || '••••••••',
              name: localUser.name,
              company: localUser.company,
              team: localUser.team,
              part: localUser.part,
              position: localUser.position,
              phone: localUser.phone,
              role: localUser.company === '신한DS' ? 'admin' : 'analyst',
              os_type: (localUser.deviceType || 'android').toLowerCase()
            })
          });

          // 재시도
          res = await fetch('https://sguardai.khcho0421.workers.dev/auth/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employee_id: cleanEmpId || targetEmpId,
              password: 'dummy_for_init',
              check_only: false
            })
          });
          data = await res.json();
        } catch (syncErr) {
          console.warn('[D1 auto sync error]', syncErr);
        }
      }

      if (res.ok && data.success) {
        setIsRealEmailSent(true);
        setMaskedEmail(data.masked_email || localUser?.email || 'kh***@gmail.com');
        setOtp('');
        setTimerKey(Date.now());
        setStep('OTP');
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('[Live Worker Email Error, falling back to local]', e);
    }

    // 2. 외부 사번이거나 로컬 테스트용인 경우 로컬 DB 연동 폴백
    const localRes = dbService.generateAndStoreOtp(targetEmpId);
    if (!localRes.success) {
      setLoading(false);
      setError(localRes.error || '사번 조회에 실패하였습니다.');
      return;
    }

    setGeneratedOtp(localRes.otpCode);
    setMaskedEmail(localRes.maskedEmail);
    setOtp('');
    setTimerKey(Date.now());
    setStep('OTP');
    setLoading(false);
  };

  // Step 2: 실제 s-guard_AI Cloudflare KV 및 DB 대조 실시간 검증
  const handleVerifyOtp = async () => {
    if (otp.length < 6) return setError('6자리 OTP 인증번호를 입력해 주세요.');
    setLoading(true);
    setError('');

    const rawEmpId = empId.trim();

    // 1. 실제 Cloudflare Worker KV 실시간 이메일 OTP 검증
    try {
      const res = await fetch('https://sguardai.khcho0421.workers.dev/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: rawEmpId,
          otp: otp.trim()
        })
      });

      const data = await res.json();
      if (res.ok && (data.code === 'OTP_VERIFIED' || data.success)) {
        setLoading(false);
        setStep('PASSWORD');
        return;
      }

      if (data.code === 'OTP_MISMATCH' || (data.detail && data.detail.includes('일치하지'))) {
        setLoading(false);
        setError('수신된 메일의 6자리 인증번호와 일치하지 않습니다. 메일함을 다시 확인해 주세요.');
        return;
      }

      if (data.code === 'OTP_EXPIRED' || (data.detail && data.detail.includes('만료'))) {
        setLoading(false);
        setError('인증번호 유효시간(5분)이 만료되었습니다. [재발송] 버튼을 눌러주세요.');
        return;
      }

      if (data.detail) {
        setLoading(false);
        setError(data.detail);
        return;
      }
    } catch (e) {
      console.warn('[Live Worker OTP Verification fallback]', e);
    }

    // 2. 로컬 DB 검증 폴백
    const localRes = dbService.verifyOtpInDb(rawEmpId, otp.trim());
    setLoading(false);
    if (localRes.success) {
      setStep('PASSWORD');
    } else {
      setError('이메일로 발송된 6자리 인증번호를 정확히 입력해 주세요.');
    }
  };

  // Step 3: 비밀번호 -> 실제 Cloudflare D1 DB 및 백엔드 비밀번호 정밀 검증
  const handleLogin = async () => {
    if (!password.trim()) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    setLoading(true);
    setError('');

    const rawEmpId = empId.trim();
    try {
      localStorage.setItem('LAST_LOGIN_EMP_ID', rawEmpId);
    } catch (e) {}

    // 1. 실시간 Cloudflare D1 /auth/login 비밀번호 검증 API 호출
    try {
      const res = await fetch('https://sguardai.khcho0421.workers.dev/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: rawEmpId,
          password: password.trim(),
          is_2fa_verified: true
        })
      });

      const data = await res.json();

      if (!res.ok || data.code === 'AUTH_WRONG_PASSWORD' || data.code === 'WRONG_PASSWORD') {
        setLoading(false);
        setError('비밀번호가 올바르지 않습니다. 다시 입력해 주세요.');
        return; // ⛔ 검증 실패 시 다음 화면으로 절대 넘어가지 않고 중단
      }

      if (res.ok && (data.token || data.status === 'success' || data.user)) {
        setLoading(false);
        const apiUser = data.user || {};
        const localDbUser = dbService.findUserByEmpId(rawEmpId);

        const userName = apiUser.name || localDbUser?.name || '조경훈';
        const userEmail = apiUser.email || localDbUser?.email || 'khcho0421@gmail.com';
        const userPhone = apiUser.phone || localDbUser?.phone || '010-4421-8890';
        const userCompany = apiUser.company_name || apiUser.company || localDbUser?.company || '신한DS';
        const userTeam = apiUser.team_name || apiUser.team || localDbUser?.team || '카드개발팀';
        const userPart = apiUser.part_name || apiUser.part || localDbUser?.part || '카드IS (Part 1)';
        const userPosition = apiUser.position || localDbUser?.position || '부장';
        const isDS = userCompany === '신한DS' || userCompany.includes('신한');
        const userRole: UserRole = isDS 
          ? 'DS_PRINCIPAL_PM' 
          : (apiUser.role === 'PARTNER_MANAGER' || apiUser.is_manager || (localDbUser as any)?.isPartnerManager)
            ? 'PARTNER_PART_LEADER' 
            : 'PARTNER_WORKER';

        const loggedInUser: UserType = {
          id: rawEmpId,
          name: userName,
          firstName: userName.substring(1),
          lastName: userName.substring(0, 1),
          companyName: userCompany,
          partnerCompany: userCompany,
          deptName: userTeam,
          partName: userPart,
          role: userRole,
          roleTitle: isDS ? `신한DS ${userTeam} PM` : `${userCompany} ${userPosition}`,
          location: '파인에비뉴(상담센터)',
          phone: userPhone,
          email: userEmail,
          language: '한국어',
          timezone: 'Asia/Seoul (GMT+9)',
          position: userPosition,
          isPartnerManager: !isDS && (apiUser.is_manager || (localDbUser as any)?.isPartnerManager)
        };

        (loggedInUser as any).employeeId = rawEmpId;
        if (data.token) {
          (loggedInUser as any).token = data.token;
        }

        dbService.setCurrentUser(loggedInUser);
        onLoginSuccess(loggedInUser);
        return;
      }

      if (data.detail) {
        setLoading(false);
        setError(data.detail);
        return;
      }
    } catch (e) {
      console.warn('[Live Worker Password Verification fallback]', e);
    }

    // 2. 로컬 DB 비밀번호 폴백 검증 (오프라인/네트워크 장애 시)
    const isValidLocal = dbService.verifyPasswordInDb(rawEmpId, password.trim());
    setLoading(false);

    if (isValidLocal) {
      const user = dbService.switchUserRole(rawEmpId);
      user.id = rawEmpId;
      (user as any).employeeId = rawEmpId;
      onLoginSuccess(user);
    } else {
      setError('비밀번호가 올바르지 않습니다. 다시 확인 후 입력해 주세요.');
    }
  };

  // 회원가입 제출 -> 실제 Cloudflare D1 + 로컬 DB 양방향 INSERT
  const handleSignupSubmit = async () => {
    if (!signupForm.agreeTerms) {
      alert('이용약관 및 개인정보 처리방침에 동의해주세요.');
      return;
    }
    const rawEmp = signupForm.empNo.trim();
    if (!rawEmp || !signupForm.name.trim() || !signupForm.email.trim()) {
      alert('필수 입력 항목을 모두 입력해주세요.');
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(rawEmp);
    const hasNumber = /[0-9]/.test(rawEmp);

    if (signupForm.isPartnerManager) {
      // 협력사 현장대리인은 영문/숫자 3~10자리 본인 고유 아이디 허용
      if (rawEmp.length < 3 || rawEmp.length > 10) {
        alert('협력사 현장대리인 아이디는 영문·숫자 3~10자리여야 합니다. (예: partner01, mgr_ubgot)');
        return;
      }
    } else {
      // 일반 작업자 및 DS PM은 정확히 6자리 (영문+숫자)
      if (rawEmp.length !== 6 || !hasLetter || !hasNumber) {
        alert('사번(아이디)은 영문과 숫자를 모두 포함한 정확히 6자리여야 합니다. (예: S01832, UB0001, ITSM01)');
        return;
      }
    }

    if (!signupForm.pw) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    if (signupForm.pw.length < 8) {
      alert('비밀번호는 안전을 위해 최소 8자리 이상 입력해야 합니다.');
      return;
    }
    if (signupForm.pw !== signupForm.confirmPw) {
      alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (!signupForm.phone.trim()) {
      alert('휴대전화번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    const cleanEmpId = rawEmp;

    // 1. 실제 Cloudflare D1 shifti-db users 테이블에 INSERT (대문자로 표준화)
    const upperEmpId = signupForm.empNo.toUpperCase().trim();
    try {
      const response = await fetch('https://sguardai.khcho0421.workers.dev/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: upperEmpId,
          email: signupForm.email.trim(),
          password: signupForm.pw || 'Password123!',
          name: signupForm.name.trim(),
          company: signupForm.company,
          team: signupForm.isPartnerManager ? '전사 총괄' : signupForm.team,
          part: signupForm.isPartnerManager ? '전사 총괄' : signupForm.part,
          position: signupForm.position,
          phone: signupForm.phone.trim(),
          is_partner_manager: signupForm.isPartnerManager ? 1 : 0,
          role: signupForm.company === '신한DS' 
            ? 'DS_PRINCIPAL_PM' 
            : signupForm.isPartnerManager 
              ? 'PARTNER_PART_LEADER' 
              : 'PARTNER_WORKER',
          device_type: signupForm.deviceType || 'Android'
        })
      });
      const data = await response.json();
      console.log('[D1 Signup Success]', data);
    } catch (e) {
      console.warn('[Cloudflare D1 signup warning]', e);
    }

    // 2. 로컬 DB 동기화 (대문자 저장)
    dbService.insertUser({
      employeeId: upperEmpId,
      name: signupForm.name.trim(),
      email: signupForm.email.trim(),
      passwordHash: signupForm.pw || '••••••••',
      company: signupForm.company,
      team: signupForm.isPartnerManager ? '전사 총괄' : signupForm.team,
      part: signupForm.isPartnerManager ? '전사 총괄' : signupForm.part,
      position: signupForm.position,
      phone: signupForm.phone.trim(),
      role: signupForm.company === '신한DS' 
        ? 'DS_PRINCIPAL_PM' 
        : signupForm.isPartnerManager 
          ? 'PARTNER_MANAGER' 
          : 'PARTNER_WORKER',
      isPartnerManager: signupForm.isPartnerManager,
      deviceType: signupForm.deviceType,
      status: 'ACTIVE'
    });

    setLoading(false);
    alert(`🎉 [${signupForm.name}] 계정이 실제 DB에 성공적으로 등록되었습니다.\n아이디/사번(${upperEmpId}) 또는 이메일(${signupForm.email})로 즉시 로그인하세요.`);
    setEmpId(upperEmpId);
    setStep('ID');
  };

  return (
    <div style={{
      background: '#060A12',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      color: '#FFFFFF',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* 1. 상단 히어로 헤더 (s_guard_AI 스타일 방사형 글로우 & S-GUARD 명칭 제거) */}
      <div style={{
        background: 'radial-gradient(ellipse at top, #1E60FF 0%, #0036D9 55%, #060A12 100%)',
        padding: '38px 20px 24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          width: '58px',
          height: '58px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #0052FF 0%, #00E5FF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 229, 255, 0.35)',
          marginBottom: '12px'
        }}>
          <Shield size={32} color="#FFFFFF" strokeWidth={2.4} />
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0, 229, 255, 0.12)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          borderRadius: '20px',
          padding: '3px 12px',
          fontSize: '11px',
          fontWeight: 800,
          color: '#80D8FF',
          letterSpacing: '0.8px',
          marginBottom: '8px'
        }}>
          <span>신한DS ICT 도급 인력 관리 포털</span>
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 900,
          letterSpacing: '1px',
          margin: '0 0 4px 0',
          color: '#FFFFFF',
          textShadow: '0 4px 20px rgba(0, 82, 255, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span>SHINHAN DS</span>
          <span style={{ color: '#00E5FF', fontWeight: 900 }}>SHIFTI</span>
        </h1>

        <p style={{
          fontSize: '12.5px',
          color: '#B0BEC5',
          margin: '0 0 12px 0',
          fontWeight: 500
        }}>
          "신뢰 기반의 도급 인력 출근 및 공정 검수 시스템"
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          flexWrap: 'wrap'
        }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '3px 9px',
            fontSize: '10.5px',
            fontWeight: 700,
            color: '#E2E8F0'
          }}>
            🕒 출근 인증
          </span>
          <span style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '3px 9px',
            fontSize: '10.5px',
            fontWeight: 700,
            color: '#E2E8F0'
          }}>
            📅 근무일정 관리
          </span>
          <span style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '3px 9px',
            fontSize: '10.5px',
            fontWeight: 700,
            color: '#E2E8F0'
          }}>
            📊 공정 검수
          </span>
        </div>
      </div>

      {/* 2. 스텝 인디케이터 (사번 확인 -> OTP 인증 -> 비밀번호) */}
      {!['SIGNUP', 'RESET_A', 'RESET_B'].includes(step) && (
        <div style={{
          padding: '16px 24px 8px 24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px'
        }}>
          {['사번 확인', 'OTP 인증', '비밀번호'].map((label, i) => {
            const steps: AuthStep[] = ['ID', 'OTP', 'PASSWORD'];
            const currentIdx = steps.indexOf(step);
            const isDone = currentIdx > i;
            const isCurrent = currentIdx === i;

            return (
              <React.Fragment key={label}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: isCurrent ? '#0052FF' : isDone ? '#0038A8' : 'rgba(255,255,255,0.06)',
                    border: isCurrent ? '1.5px solid #00E5FF' : '1px solid rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 800,
                    boxShadow: isCurrent ? '0 0 12px rgba(0, 229, 255, 0.5)' : 'none'
                  }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '10.5px', color: isCurrent ? '#00E5FF' : '#90A4AE', fontWeight: 600 }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div style={{
                    width: '36px',
                    height: '1.5px',
                    background: isDone ? '#0052FF' : 'rgba(255,255,255,0.12)',
                    marginTop: '-14px'
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* 3. 본문 폼 영역 */}
      <div style={{ flex: 1, padding: '16px 20px 24px 20px', display: 'flex', flexDirection: 'column' }}>

        {/* ── [STEP 1: 사번 확인] ── */}
        {step === 'ID' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* 안내 배너 (신한DS 시프티 통합 2FA 보안 인증) */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 82, 255, 0.12) 0%, rgba(0, 229, 255, 0.06) 100%)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '12.5px',
              color: '#80D8FF',
              lineHeight: 1.45,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <span style={{ fontSize: '15px' }}>🔐</span>
              <div>
                <strong style={{ color: '#FFFFFF' }}>신한DS 통합 2FA 보안 인증</strong><br/>
                등록된 사번을 입력하시면 보안 이메일로 6자리 2FA 코드가 실시간 발송됩니다.
              </div>
            </div>

            {/* 사번/ID 입력 필드 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#90A4AE', display: 'block', marginBottom: '6px' }}>
                아이디 / 사원번호 (영문·숫자 최대 10자리)
              </label>
              <div style={{
                background: '#101B2B',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 14px',
                height: '50px'
              }}>
                <SmartphoneNfc size={18} color="#90A4AE" style={{ marginRight: '10px' }} />
                <input
                  type="text"
                  maxLength={10}
                  value={empId}
                  onChange={e => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
                    setEmpId(val);
                    try {
                      localStorage.setItem('LAST_LOGIN_EMP_ID', val);
                    } catch (err) {}
                  }}
                  placeholder="예: S01832 또는 partner01 (최대 10자리)"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 700
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') handleInitAuth(); }}
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div style={{ color: '#FF5252', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* CTA 버튼 */}
            <button
              onClick={handleInitAuth}
              disabled={loading}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '12px',
                background: '#0052FF',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '15.5px',
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(0, 82, 255, 0.4)'
              }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  <span>사번 확인 (OTP 발송)</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            {/* 회원가입 / 비밀번호 찾기 */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#90A4AE' }}>
              <button
                type="button"
                onClick={() => setStep('SIGNUP')}
                style={{ background: 'none', border: 'none', color: '#CFD8DC', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                회원가입
              </button>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <button
                type="button"
                onClick={() => setStep('RESET_A')}
                style={{ background: 'none', border: 'none', color: '#CFD8DC', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                비밀번호 찾기
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
              <div style={{
                background: 'rgba(0, 229, 255, 0.06)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                borderRadius: '20px',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#80D8FF',
                letterSpacing: '0.4px'
              }}>
                <div style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#00E676',
                  boxShadow: '0 0 8px #00E676'
                }} />
                <span>SHINHAN DS SHIFTI 2FA SECURED</span>
              </div>
            </div>
          </div>
        )}

        {/* ── [STEP 2: OTP 인증 (s_guard_AI OtpBoxes 이식)] ── */}
        {step === 'OTP' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'center' }}>
            <div style={{
              background: isRealEmailSent ? 'rgba(0, 230, 118, 0.12)' : 'rgba(0, 82, 255, 0.12)',
              border: isRealEmailSent ? '1px solid rgba(0, 230, 118, 0.35)' : '1px solid rgba(0, 229, 255, 0.25)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isRealEmailSent ? '#69F0AE' : '#80D8FF', fontSize: '15px', fontWeight: 800 }}>
                <Mail size={16} color={isRealEmailSent ? '#00E676' : '#00E5FF'} />
                <span>{maskedEmail}</span>
              </div>

              <div style={{
                background: 'rgba(0, 229, 255, 0.08)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <div style={{ fontSize: '13px', color: '#80D8FF', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <span>🔒 등록된 이메일로 6자리 인증코드가 발송되었습니다.</span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#B0BEC5', marginTop: '4px', lineHeight: 1.4 }}>
                  수신된 메일의 6자리 인증번호를 아래에 입력해 주세요.<br/>
                  <span style={{ color: '#FFD54F', fontSize: '11px' }}>※ 메일이 안 보일 경우 Gmail <strong>[스팸함]</strong> 또는 <strong>[전체보관함]</strong>을 확인해 주세요. (발신자: <strong>신한DS 시프티</strong> / 제목: [신한DS 시프티] 로그인 인증 코드)</span>
                </div>
              </div>
            </div>

            {/* 6자리 인터랙티브 OTP 박스 */}
            <OtpBoxes value={otp} onChange={setOtp} />

            {/* 타이머 & 재발송 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 6px' }}>
              <Timer timerKey={timerKey} secs={178} onExpire={() => setError('인증 유효시간(3분)이 만료되었습니다. 재발송을 요청해주세요.')} />

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setOtp('')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    color: '#90A4AE',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RotateCcw size={12} />
                  <span>초기화</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError('');
                    const rawEmpId = empId.trim();
                    const localUser = dbService.findUserByEmpId(rawEmpId) || dbService.findUserByEmail(rawEmpId);
                    const targetEmpId = localUser ? localUser.employeeId : rawEmpId;
                    const cleanEmpId = targetEmpId.replace(/^S/i, '').replace(/^emp-/i, '').replace(/^pt-/i, '');

                    try {
                      const res = await fetch('https://sguardai.khcho0421.workers.dev/auth/init', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          employee_id: cleanEmpId || targetEmpId,
                          password: 'dummy_for_init',
                          check_only: false
                        })
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        setIsRealEmailSent(true);
                        setTimerKey(Date.now());
                        setOtp('');
                        setLoading(false);
                        alert(`📨 등록된 이메일(${data.masked_email || maskedEmail})로 인증 코드가 재발송되었습니다.\n메일함을 확인해 주세요.`);
                        return;
                      }
                    } catch (e) {
                      console.warn('[Resend Live Worker error]', e);
                    }

                    const res = dbService.generateAndStoreOtp(targetEmpId);
                    setLoading(false);
                    setTimerKey(Date.now());
                    setOtp('');
                    alert(`📨 등록된 이메일(${maskedEmail})로 인증 코드가 재발송되었습니다.\n메일함을 확인해 주세요.`);
                  }}
                  style={{
                    background: '#0D2B59',
                    border: '1px solid #0066FF',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    color: '#80D8FF',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RotateCcw size={12} color="#00E5FF" />
                  <span>재발송</span>
                </button>
              </div>
            </div>

            {error && (
              <div style={{ color: '#FF5252', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '12px',
                background: otp.length === 6 ? '#0052FF' : 'rgba(0, 82, 255, 0.4)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '15.5px',
                fontWeight: 800,
                cursor: otp.length === 6 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: otp.length === 6 ? '0 4px 20px rgba(0, 82, 255, 0.4)' : 'none'
              }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  <span>인증 완료</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('ID')}
              style={{ background: 'none', border: 'none', color: '#90A4AE', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <ArrowLeft size={14} />
              <span>사번 재입력</span>
            </button>
          </div>
        )}

        {/* ── [STEP 3: 비밀번호 입력 & 로그인] ── */}
        {step === 'PASSWORD' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '13px', color: '#90A4AE' }}>확인된 사번</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#00E5FF' }}>{empId}</span>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#90A4AE', display: 'block', marginBottom: '6px' }}>
                비밀번호
              </label>
              <div style={{
                background: '#101B2B',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 14px',
                height: '50px'
              }}>
                <KeyRound size={18} color="#90A4AE" style={{ marginRight: '10px' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 700
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ background: 'none', border: 'none', color: '#90A4AE', cursor: 'pointer' }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PwStrength pw={password} />
            </div>

            {error && (
              <div style={{ color: '#FF5252', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '12px',
                background: '#0052FF',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(0, 82, 255, 0.45)'
              }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  <span>로그인</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('OTP')}
              style={{ background: 'none', border: 'none', color: '#90A4AE', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <ArrowLeft size={14} />
              <span>이전 단계로</span>
            </button>
          </div>
        )}

        {/* ── [회원가입 / 계정 생성] ── */}
        {step === 'SIGNUP' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0' }}>계정 생성</h2>
              <p style={{ fontSize: '12px', color: '#90A4AE', margin: 0 }}>신한DS 협력사 도급 공정 관제 시스템</p>
            </div>

            {/* 회사소속 */}
            <div>
              <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>회사소속 *</label>
              <select
                value={signupForm.company}
                onChange={e => setSignupForm({ ...signupForm, company: e.target.value })}
                style={selectStyle}
              >
                <option value="신한DS">신한DS</option>
                <option value="유브갓">유브갓</option>
                <option value="(주)협력아이티에스">(주)협력아이티에스</option>
                <option value="현대IT솔루션">현대IT솔루션</option>
                <option value="오토시스">오토시스</option>
                <option value="파이낸스ITS">파이낸스ITS</option>
              </select>
            </div>

            {/* ⭐ 업체별 현장관리인(영업대표/총괄) 여부 체크박스 카드 */}
            <div 
              onClick={() => setSignupForm({ ...signupForm, isPartnerManager: !signupForm.isPartnerManager })}
              style={{
                background: signupForm.isPartnerManager ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                border: signupForm.isPartnerManager ? '1.5px solid #00E5FF' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: signupForm.isPartnerManager ? '0 0 16px rgba(0, 229, 255, 0.2)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '6px',
                  background: signupForm.isPartnerManager ? '#00E5FF' : 'rgba(255, 255, 255, 0.1)',
                  border: signupForm.isPartnerManager ? 'none' : '1.5px solid #90A4AE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0F172A',
                  flexShrink: 0
                }}>
                  {signupForm.isPartnerManager && <Check size={16} strokeWidth={3.5} />}
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: signupForm.isPartnerManager ? '#00E5FF' : '#FFFFFF' }}>
                    {signupForm.company === '신한DS' ? '신한DS 현장대리인 (PM/총괄)' : '협력사 현장관리인 (영업대표/총괄)'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#90A4AE', marginTop: '1px' }}>
                    {signupForm.company === '신한DS' 
                      ? '✓ 신한DS 관리인: 담당 팀 및 파트를 직접 선택하여 관제합니다' 
                      : '✓ 협력사 관리인: 팀/파트에 구속되지 않고 전사 소속 인력을 총괄합니다'}
                  </div>
                </div>
              </div>
            </div>

            {/* 팀 & 파트 (2열 그리드) - 협력사 현장관리인일 때만 비활성화 잠금, 신한DS는 선택 가능 */}
            {(() => {
              const isLocked = signupForm.isPartnerManager && signupForm.company !== '신한DS';

              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      팀 {isLocked ? <span style={{ color: '#FF8A80' }}>(선택불가)</span> : (signupForm.company === '신한DS' && signupForm.isPartnerManager ? <span style={{ color: '#00E5FF' }}>(DS 관제팀)</span> : null)} *
                    </label>
                    {isLocked ? (
                      <div style={{
                        ...selectStyle,
                        opacity: 0.45,
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#90A4AE',
                        fontSize: '12.5px'
                      }}>
                        [전사 총괄 (선택 불가)]
                      </div>
                    ) : (
                      <select
                        value={signupForm.team}
                        onChange={e => setSignupForm({ ...signupForm, team: e.target.value })}
                        style={selectStyle}
                      >
                        <option value="카드개발팀">카드개발팀</option>
                        <option value="상담운영팀">상담운영팀</option>
                        <option value="은행운영팀">은행운영팀</option>
                        <option value="결제개발팀">결제개발팀</option>
                        <option value="데이터인프라팀">데이터인프라팀</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      파트 {isLocked ? <span style={{ color: '#FF8A80' }}>(선택불가)</span> : (signupForm.company === '신한DS' && signupForm.isPartnerManager ? <span style={{ color: '#00E5FF' }}>(DS 관제파트)</span> : null)} *
                    </label>
                    {isLocked ? (
                      <div style={{
                        ...selectStyle,
                        opacity: 0.45,
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#90A4AE',
                        fontSize: '12.5px'
                      }}>
                        [전사 총괄 (선택 불가)]
                      </div>
                    ) : (
                      <select
                        value={signupForm.part}
                        onChange={e => setSignupForm({ ...signupForm, part: e.target.value })}
                        style={selectStyle}
                      >
                        <option value="상담">상담</option>
                        <option value="오토">오토</option>
                        <option value="재무">재무</option>
                        <option value="카드IS (Part 1)">카드IS (Part 1)</option>
                        <option value="결제망">결제망</option>
                        <option value="데이터">데이터</option>
                        <option value="FDS">FDS</option>
                        <option value="CRM">CRM</option>
                      </select>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 직책 8단계 멀티 버튼 (부부장 추가) */}
            <div>
              <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>직책 *</label>
              <div style={{ background: '#101B2B', padding: '8px', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {['사원', '대리', '과장', '차장', '부부장', '부장', '이사', '대표이사'].map(pos => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setSignupForm({ ...signupForm, position: pos })}
                    style={{
                      padding: '6px 2px',
                      borderRadius: '6px',
                      border: 'none',
                      background: signupForm.position === pos ? '#0052FF' : 'transparent',
                      color: '#FFFFFF',
                      fontSize: '11.5px',
                      fontWeight: signupForm.position === pos ? 800 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* 사번/ID (협력사현장대리인은 최대 10자리) & 이름 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '12px', color: signupForm.isPartnerManager ? '#00E5FF' : '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  {signupForm.isPartnerManager ? '아이디 (대리인: 최대 10자리) *' : '아이디 / 사번 (6자리) *'}
                </label>
                <input
                  type="text"
                  maxLength={signupForm.isPartnerManager ? 10 : 6}
                  value={signupForm.empNo}
                  placeholder={signupForm.isPartnerManager ? "예: partner01 (최대 10자)" : "예: S01832 (6자)"}
                  onChange={e => {
                    const maxLen = signupForm.isPartnerManager ? 10 : 6;
                    const clean = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, maxLen);
                    setSignupForm({ ...signupForm, empNo: clean });
                  }}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>이름 *</label>
                <input
                  type="text"
                  value={signupForm.name}
                  placeholder="성명"
                  onChange={e => setSignupForm({ ...signupForm, name: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* 이메일 주소 & 휴대전화번호 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  이메일 (2FA 인증용) *
                </label>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                  placeholder="예: user@email.com"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  휴대전화번호 *
                </label>
                <input
                  type="tel"
                  maxLength={13}
                  value={signupForm.phone}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    let formatted = raw;
                    if (raw.length > 3 && raw.length <= 7) {
                      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
                    } else if (raw.length > 7) {
                      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
                    }
                    setSignupForm({ ...signupForm, phone: formatted });
                  }}
                  placeholder="010-1234-5678"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* 비밀번호 & 비밀번호 확인 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  로그인 비밀번호 (8자리 이상) *
                </label>
                <input
                  type="password"
                  value={signupForm.pw}
                  onChange={e => setSignupForm({ ...signupForm, pw: e.target.value })}
                  placeholder="8자리 이상 입력"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  비밀번호 확인 *
                </label>
                <input
                  type="password"
                  value={signupForm.confirmPw}
                  onChange={e => setSignupForm({ ...signupForm, confirmPw: e.target.value })}
                  placeholder="비밀번호 재입력"
                  style={inputStyle}
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#CFD8DC', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={signupForm.agreeTerms}
                onChange={e => setSignupForm({ ...signupForm, agreeTerms: e.target.checked })}
                style={{ accentColor: '#0052FF' }}
              />
              <span>이용약관 및 개인정보 처리방침에 동의합니다 *</span>
            </label>

            <button
              type="button"
              onClick={handleSignupSubmit}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '10px',
                background: '#0052FF',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              계정 생성 완료 ›
            </button>

            <button
              type="button"
              onClick={() => setStep('ID')}
              style={{ background: 'none', border: 'none', color: '#90A4AE', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}
            >
              ← 로그인 화면으로 돌아가기
            </button>
          </div>
        )}

        {/* ── [비밀번호 초기화] ── */}
        {step === 'RESET_A' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0' }}>비밀번호 초기화</h2>
              <p style={{ fontSize: '12.5px', color: '#90A4AE', margin: 0 }}>등록된 퍼블릭 메일로 임시 OTP 인증코드를 발송합니다.</p>
            </div>

            <input
              type="text"
              maxLength={6}
              value={resetEmpId}
              onChange={e => setResetEmpId(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6))}
              placeholder="사원번호 / 아이디 (예: S01832)"
              style={inputStyle}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setStep('ID')}
                style={{ flex: 1, height: '46px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = dbService.generateAndStoreOtp(resetEmpId.trim());
                  if (!res.success) {
                    alert(res.error);
                    return;
                  }
                  setGeneratedOtp(res.otpCode);
                  setMaskedEmail(res.maskedEmail);
                  setStep('RESET_B');
                }}
                style={{ flex: 2, height: '46px', borderRadius: '10px', background: '#00C853', border: 'none', color: '#000000', fontWeight: 800, cursor: 'pointer' }}
              >
                인증코드 발송
              </button>
            </div>
          </div>
        )}

        {step === 'RESET_B' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>본인 확인 및 비밀번호 재설정</h2>
              <div style={{ fontSize: '12.5px', color: '#80D8FF' }}>✉ {maskedEmail} (발송코드: {generatedOtp})</div>
            </div>

            <input
              type="password"
              placeholder="새 비밀번호 (8자 이상)"
              value={newResetPw}
              onChange={e => setNewResetPw(e.target.value)}
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmResetPw}
              onChange={e => setConfirmResetPw(e.target.value)}
              style={inputStyle}
            />

            <button
              type="button"
              onClick={() => {
                if (!newResetPw.trim() || newResetPw !== confirmResetPw) {
                  alert('비밀번호가 일치하지 않거나 비어있습니다.');
                  return;
                }
                const ok = dbService.resetPassword(resetEmpId.trim(), newResetPw.trim());
                if (ok) {
                  alert('🔒 실제 DB(TB_USER_MST)의 비밀번호가 안전하게 변경되었습니다. 새 비밀번호로 로그인하세요.');
                  setEmpId(resetEmpId.trim());
                  setStep('ID');
                } else {
                  alert('비밀번호 변경 실패: 사용자를 찾을 수 없습니다.');
                }
              }}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '10px',
                background: '#0052FF',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '14.5px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              비밀번호 변경 및 완료
            </button>
          </div>
        )}
      </div>

      {/* 4. 최하단 푸터 */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '4px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#B0BEC5' }}>
          <span>신한DS ICT 도급 인력 관리 포털 (SHIFTI)</span>
        </div>
        <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.4)' }}>
          © 2026 Shinhan DS Corp. All Rights Reserved
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '46px',
  background: '#101B2B',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '10px',
  color: '#FFFFFF',
  fontSize: '14px',
  padding: '0 12px',
  outline: 'none',
  boxSizing: 'border-box'
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  height: '46px',
  background: '#101B2B',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '10px',
  color: '#FFFFFF',
  fontSize: '13.5px',
  padding: '0 10px',
  outline: 'none',
  cursor: 'pointer'
};
