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
  X
} from 'lucide-react';
import { dbService, predefinedUsers } from '../services/db';
import { User as UserType } from '../types';

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
  const [empId, setEmpId] = useState('S18121020');
  const [selectedUserPreset, setSelectedUserPreset] = useState('usr-ds-pm');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('789012');
  const [password, setPassword] = useState('••••••••');
  const [showPw, setShowPw] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('kh***@gmail.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timerKey, setTimerKey] = useState(Date.now());

  // 회원가입 폼 상태 (지침 반영: 팀/파트, 직책 7단계, 퍼블릭 메일)
  const [signupForm, setSignupForm] = useState({
    company: '신한DS',
    team: '카드개발팀',
    part: '카드IS (Part 1)',
    position: '사원',
    empNo: 'S20260088',
    name: '홍길동',
    email: 'hong.gildong@gmail.com',
    phone: '010-4732-8880',
    deviceType: 'Android' as 'Android' | 'iOS',
    pw: '',
    confirmPw: '',
    agreeTerms: true
  });

  // 비밀번호 초기화 상태
  const [resetEmpId, setResetEmpId] = useState('S18121020');
  const [newResetPw, setNewResetPw] = useState('');
  const [confirmResetPw, setConfirmResetPw] = useState('');

  // Step 1: 사번 입력 -> 실제 DB (TB_AUTH_OTP_LOG)에 OTP 생성 및 발송
  const handleInitAuth = async () => {
    if (!empId.trim()) return setError('사번을 입력해 주세요.');
    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      const res = dbService.generateAndStoreOtp(empId.trim());
      if (!res.success) {
        setError(res.error || '사번 조회에 실패하였습니다.');
        return;
      }

      setGeneratedOtp(res.otpCode);
      setMaskedEmail(res.maskedEmail);
      setOtp('');
      setTimerKey(Date.now());
      setStep('OTP');
    }, 350);
  };

  // Step 2: 실제 DB의 OTP 로그와 대조 검증 (TB_AUTH_OTP_LOG SELECT & UPDATE)
  const handleVerifyOtp = async () => {
    if (otp.length < 6) return setError('6자리 OTP 인증번호를 입력해 주세요.');
    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      const res = dbService.verifyOtpInDb(empId.trim(), otp.trim());
      if (!res.success) {
        setError(res.error || 'OTP 인증 실패');
        return;
      }
      setStep('PASSWORD');
    }, 350);
  };

  // Step 3: 비밀번호 -> 최종 로그인
  const handleLogin = async () => {
    if (!password.trim()) return setError('비밀번호를 입력해 주세요.');
    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      const user = dbService.switchUserRole(empId.trim());
      onLoginSuccess(user);
    }, 350);
  };

  // 회원가입 제출 -> 실제 DB (TB_USER_MST) INSERT
  const handleSignupSubmit = () => {
    if (!signupForm.agreeTerms) {
      alert('이용약관 및 개인정보 처리방침에 동의해주세요.');
      return;
    }
    if (!signupForm.empNo.trim() || !signupForm.name.trim() || !signupForm.email.trim()) {
      alert('필수 입력 항목을 모두 입력해주세요.');
      return;
    }

    const res = dbService.insertUser({
      employeeId: signupForm.empNo.trim(),
      name: signupForm.name.trim(),
      email: signupForm.email.trim(),
      passwordHash: signupForm.pw || '••••••••',
      company: signupForm.company,
      team: signupForm.team,
      part: signupForm.part,
      position: signupForm.position,
      phone: signupForm.phone.trim(),
      role: signupForm.company === '신한DS' ? 'DS_PRINCIPAL_PM' : 'PARTNER_WORKER',
      deviceType: signupForm.deviceType,
      status: 'ACTIVE'
    });

    if (!res.success) {
      alert(`❌ ${res.message}`);
      return;
    }

    alert(`🎉 [${signupForm.name}] 계정이 실제 DB(users)에 등록되었습니다. 사번(${signupForm.empNo})으로 로그인하세요.`);
    setEmpId(signupForm.empNo.trim());
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
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
          marginBottom: '10px'
        }}>
          <Shield size={30} color="#FFFFFF" strokeWidth={2.2} />
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 900,
          letterSpacing: '1.5px',
          margin: '0 0 4px 0',
          color: '#FFFFFF',
          textShadow: '0 4px 16px rgba(0, 82, 255, 0.5)'
        }}>
          SHINHAN DS
        </h1>

        <p style={{
          fontSize: '12.5px',
          fontStyle: 'italic',
          color: '#CFD8DC',
          margin: '0 0 14px 0',
          letterSpacing: '0.2px'
        }}>
          "Knowledge Today, Foresight Tomorrow"
        </p>

        <div style={{
          background: 'rgba(0, 82, 255, 0.35)',
          border: '1px solid rgba(0, 229, 255, 0.4)',
          borderRadius: '30px',
          padding: '4px 14px',
          fontSize: '10.5px',
          fontWeight: 800,
          color: '#E1F5FE',
          letterSpacing: '0.8px'
        }}>
          DETECTION ➔ DIAGNOSIS ➔ MITIGATION ➔ FORESIGHT
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
            {/* 안내 배너 (100% 실제 DB 기반) */}
            <div style={{
              background: 'rgba(0, 82, 255, 0.1)',
              border: '1px solid rgba(0, 229, 255, 0.2)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '12px',
              color: '#80D8FF',
              lineHeight: 1.4
            }}>
              💡 <strong>DB 인증 안내</strong>: DB에 등록된 사번을 입력하여 로그인하거나, 처음이신 경우 하단의 <strong>[회원가입]</strong> 버튼을 눌러 계정을 생성해 주세요.
            </div>

            {/* 사번 입력 필드 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#90A4AE', display: 'block', marginBottom: '6px' }}>
                사원번호 (S로 시작하는 사번)
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
                  value={empId}
                  onChange={e => setEmpId(e.target.value)}
                  placeholder="예: S18121020"
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
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#90A4AE'
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E676' }} />
                <span>SECURITY S-BRIDGE INTEGRATED</span>
              </div>
            </div>
          </div>
        )}

        {/* ── [STEP 2: OTP 인증 (s_guard_AI OtpBoxes 이식)] ── */}
        {step === 'OTP' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'center' }}>
            <div style={{
              background: 'rgba(0, 82, 255, 0.12)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#80D8FF', fontSize: '13.5px', fontWeight: 700 }}>
                <Mail size={16} color="#00E5FF" />
                <span>{maskedEmail}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#90A4AE', margin: 0 }}>
                위 퍼블릭 메일로 발송된 6자리 인증번호를 입력해 주세요.
              </p>
              <div style={{ fontSize: '11.5px', color: '#00E5FF', marginTop: '4px', fontWeight: 800, background: 'rgba(0, 229, 255, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                실제 DB 발송 인증번호: <span style={{ letterSpacing: '2px', textDecoration: 'underline' }}>{generatedOtp}</span>
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
                  onClick={() => {
                    const res = dbService.generateAndStoreOtp(empId.trim());
                    if (res.success) {
                      setGeneratedOtp(res.otpCode);
                      setTimerKey(Date.now());
                      setOtp('');
                      alert(`🔑 실제 DB(TB_AUTH_OTP_LOG)에 새 OTP [${res.otpCode}]가 생성 및 발송되었습니다.`);
                    } else {
                      alert(res.error);
                    }
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
              <p style={{ fontSize: '12px', color: '#90A4AE', margin: 0 }}>신한금융그룹 구성원 전용 도급 관제 시스템</p>
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
              </select>
            </div>

            {/* 팀 & 파트 (2열 그리드) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>팀 *</label>
                <select
                  value={signupForm.team}
                  onChange={e => setSignupForm({ ...signupForm, team: e.target.value })}
                  style={selectStyle}
                >
                  <option value="카드개발팀">카드개발팀</option>
                  <option value="상담운영팀">상담운영팀</option>
                  <option value="은행운영팀">은행운영팀</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>파트 *</label>
                <select
                  value={signupForm.part}
                  onChange={e => setSignupForm({ ...signupForm, part: e.target.value })}
                  style={selectStyle}
                >
                  <option value="상담">상담</option>
                  <option value="오토">오토</option>
                  <option value="재무">재무</option>
                  <option value="카드IS (Part 1)">카드IS (Part 1)</option>
                </select>
              </div>
            </div>

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

            {/* 사번 & 이름 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>사번 (S로 시작) *</label>
                <input
                  type="text"
                  value={signupForm.empNo}
                  onChange={e => setSignupForm({ ...signupForm, empNo: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>이름 *</label>
                <input
                  type="text"
                  value={signupForm.name}
                  onChange={e => setSignupForm({ ...signupForm, name: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* 이메일 주소 (OTP 인증용 퍼블릭 메일) */}
            <div>
              <label style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                이메일 주소 (OTP 인증용 퍼블릭 메일) *
              </label>
              <input
                type="email"
                value={signupForm.email}
                onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                placeholder="예: hong.gildong@gmail.com"
                style={inputStyle}
              />
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
              value={resetEmpId}
              onChange={e => setResetEmpId(e.target.value)}
              placeholder="사원번호 (예: S18121020)"
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#90A4AE' }}>
          <span>신한DS</span>
        </div>
        <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.3)' }}>
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
