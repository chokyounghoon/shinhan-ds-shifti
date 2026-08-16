import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  KeyRound, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Building, 
  Briefcase, 
  UserCheck, 
  Eye, 
  EyeOff,
  Lock,
  Mail,
  Phone,
  Building2,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import { dbService, predefinedUsers } from '../services/db';
import { User as UserType } from '../types';

interface SGuardLoginViewProps {
  onLoginSuccess: (user: UserType) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

type LoginStep = 'STEP1_EMP_NO' | 'STEP2_PASSWORD' | 'STEP3_OTP' | 'SIGNUP' | 'RESET_PW' | 'RESET_PW_VERIFY';

export const SGuardLoginView: React.FC<SGuardLoginViewProps> = ({
  onLoginSuccess,
  themeMode
}) => {
  const [currentStep, setCurrentStep] = useState<LoginStep>('STEP1_EMP_NO');
  const [empNo, setEmpNo] = useState<string>('18121020');
  const [selectedUserPreset, setSelectedUserPreset] = useState<string>('usr-ds-pm');
  const [password, setPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('789012');
  const [timerSeconds, setTimerSeconds] = useState<number>(178); // 02:58
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 회원가입 폼 상태 (Screenshot 2 일치)
  const [signupForm, setSignupForm] = useState({
    company: '신한DS',
    department: '부문 선택',
    division: '해당없음',
    team: '카드개발팀',
    part: '카드IS (Part 1)',
    position: '사원',
    empNo: 'SH202400001',
    name: '홍길동',
    email: 'name@shinhan.com',
    phone: '010-4732-8880',
    deviceType: 'Android' as 'Android' | 'iOS',
    pw: '',
    confirmPw: '',
    agreeTerms: true
  });

  // 비밀번호 초기화 상태
  const [resetEmpNo, setResetEmpNo] = useState('18121020');
  const [newResetPw, setNewResetPw] = useState('');
  const [confirmResetPw, setConfirmResetPw] = useState('');

  // OTP 타이머
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(sec => sec - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStep1Next = () => {
    if (!empNo) {
      setErrorMessage('사원번호를 입력해주세요.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep('STEP2_PASSWORD');
  };

  const handleStep2Next = () => {
    if (!password) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }
    setErrorMessage(null);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpDigits(['', '', '', '', '', '']);
    setTimerSeconds(178);
    setIsTimerRunning(true);
    setCurrentStep('STEP3_OTP');
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val[val.length - 1];
    }
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleFinalLogin = () => {
    const inputOtp = otpDigits.join('');
    if (inputOtp.length < 6) {
      setErrorMessage('6자리 OTP 인증번호를 입력해주세요.');
      return;
    }

    if (inputOtp !== generatedOtp && inputOtp !== '123456' && inputOtp !== '789012') {
      setErrorMessage('OTP 인증번호가 일치하지 않습니다. (테스트용: ' + generatedOtp + ')');
      return;
    }

    const user = dbService.switchUserRole(selectedUserPreset);
    onLoginSuccess(user);
  };

  const handleSignupSubmit = () => {
    if (!signupForm.agreeTerms) {
      alert('이용약관 및 개인정보 처리방침에 동의해주세요.');
      return;
    }
    alert(`🎉 [${signupForm.name}] 계정이 성공적으로 생성되었습니다. 사번으로 로그인하세요.`);
    setEmpNo(signupForm.empNo);
    setCurrentStep('STEP1_EMP_NO');
  };

  return (
    <div style={{
      background: '#070D18',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      color: '#FFFFFF',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* 1. 상단 히어로 헤더 영역 (스크린샷 1, 3, 4, 5 일치) */}
      <div style={{
        background: 'radial-gradient(ellipse at top, #1E60FF 0%, #0036D9 55%, #070D18 100%)',
        padding: '38px 20px 28px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* 시스템 대형 타이틀 (S-GUARD 명칭 제거하고 신한DS 통합 타이틀 적용) */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 900,
          letterSpacing: '2px',
          margin: '0 0 6px 0',
          color: '#FFFFFF',
          textShadow: '0 4px 16px rgba(0, 82, 255, 0.5)'
        }}>
          SHINHAN DS
        </h1>

        <p style={{
          fontSize: '13px',
          fontStyle: 'italic',
          color: '#CFD8DC',
          margin: '0 0 16px 0',
          letterSpacing: '0.3px'
        }}>
          "Knowledge Today, Foresight Tomorrow"
        </p>

        {/* 캡슐 알약 태그 (스크린샷 일치) */}
        <div style={{
          background: 'rgba(0, 82, 255, 0.35)',
          border: '1px solid rgba(0, 229, 255, 0.4)',
          borderRadius: '30px',
          padding: '6px 16px',
          fontSize: '11px',
          fontWeight: 800,
          color: '#E1F5FE',
          letterSpacing: '1px',
          boxShadow: '0 0 14px rgba(0, 102, 255, 0.4)'
        }}>
          DETECTION ➔ DIAGNOSIS ➔ MITIGATION ➔ FORESIGHT
        </div>
      </div>

      {/* 2. 단계별 프로그레스 인디케이터 (1 사번 확인 ➔ 2 비밀번호 ➔ 3 OTP 인증) */}
      {!['SIGNUP', 'RESET_PW', 'RESET_PW_VERIFY'].includes(currentStep) && (
        <div style={{
          padding: '16px 24px 8px 24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Step 1: 사번 확인 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: currentStep === 'STEP1_EMP_NO' ? '#0052FF' : '#0038A8',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
              boxShadow: currentStep === 'STEP1_EMP_NO' ? '0 0 10px #0052FF' : 'none'
            }}>
              {currentStep !== 'STEP1_EMP_NO' ? '✓' : '1'}
            </div>
            <span style={{ fontSize: '10.5px', color: '#90A4AE', fontWeight: 600 }}>사번 확인</span>
          </div>

          <div style={{ width: '40px', height: '1.5px', background: currentStep !== 'STEP1_EMP_NO' ? '#0052FF' : 'rgba(255,255,255,0.15)', marginTop: '-14px' }} />

          {/* Step 2: 비밀번호 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: currentStep === 'STEP2_PASSWORD' ? '#0052FF' : (currentStep === 'STEP3_OTP' ? '#0038A8' : 'rgba(255,255,255,0.08)'),
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
              boxShadow: currentStep === 'STEP2_PASSWORD' ? '0 0 10px #0052FF' : 'none'
            }}>
              {currentStep === 'STEP3_OTP' ? '✓' : '2'}
            </div>
            <span style={{ fontSize: '10.5px', color: '#90A4AE', fontWeight: 600 }}>비밀번호</span>
          </div>

          <div style={{ width: '40px', height: '1.5px', background: currentStep === 'STEP3_OTP' ? '#0052FF' : 'rgba(255,255,255,0.15)', marginTop: '-14px' }} />

          {/* Step 3: OTP 인증 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: currentStep === 'STEP3_OTP' ? '#0052FF' : 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
              boxShadow: currentStep === 'STEP3_OTP' ? '0 0 10px #0052FF' : 'none'
            }}>
              3
            </div>
            <span style={{ fontSize: '10.5px', color: '#90A4AE', fontWeight: 600 }}>OTP 인증</span>
          </div>
        </div>
      )}

      {/* 3. 본문 뷰 분기 */}
      <div style={{ flex: 1, padding: '16px 20px 24px 20px', display: 'flex', flexDirection: 'column' }}>
        
        {/* ========================================================================= */}
        {/* 1) STEP 1: 사번 확인 (Screenshot 1 일치) */}
        {/* ========================================================================= */}
        {currentStep === 'STEP1_EMP_NO' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 빠른 역할 프리셋 선택기 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#00E5FF', display: 'block', marginBottom: '8px' }}>
                👤 로그인 역할 선택 (테스트 프리셋)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserPreset('usr-ds-pm');
                    setEmpNo('18121020');
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: selectedUserPreset === 'usr-ds-pm' ? '1.5px solid #0052FF' : '1px solid rgba(255,255,255,0.1)',
                    background: selectedUserPreset === 'usr-ds-pm' ? 'rgba(0,82,255,0.2)' : 'rgba(255,255,255,0.04)',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800 }}>신한DS PM</div>
                  <div style={{ fontSize: '9.5px', color: '#82B1FF' }}>18121020</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserPreset('usr-part-lead-1');
                    setEmpNo('20240012');
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: selectedUserPreset === 'usr-part-lead-1' ? '1.5px solid #FF9500' : '1px solid rgba(255,255,255,0.1)',
                    background: selectedUserPreset === 'usr-part-lead-1' ? 'rgba(255,149,0,0.2)' : 'rgba(255,255,255,0.04)',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800 }}>협력 파트장</div>
                  <div style={{ fontSize: '9.5px', color: '#FFB74D' }}>20240012</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserPreset('usr-worker-01');
                    setEmpNo('20260031');
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: selectedUserPreset === 'usr-worker-01' ? '1.5px solid #12B76A' : '1px solid rgba(255,255,255,0.1)',
                    background: selectedUserPreset === 'usr-worker-01' ? 'rgba(18,183,106,0.2)' : 'rgba(255,255,255,0.04)',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800 }}>협력 근로자</div>
                  <div style={{ fontSize: '9.5px', color: '#81C784' }}>20260031</div>
                </button>
              </div>
            </div>

            {/* 사원번호 입력창 (스크린샷 일치) */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#90A4AE', display: 'block', marginBottom: '8px' }}>
                사원번호
              </label>
              <div style={{
                background: '#121D2C',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                height: '52px'
              }}>
                <input
                  type="text"
                  value={empNo}
                  onChange={e => setEmpNo(e.target.value)}
                  placeholder="사원번호를 입력하세요"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '0.5px'
                  }}
                />
                <User size={20} color="#90A4AE" />
              </div>
            </div>

            {errorMessage && (
              <div style={{ color: '#FF5252', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 로그인 버튼 (스크린샷 일치) */}
            <button
              onClick={handleStep1Next}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '12px',
                background: '#0052FF',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(0, 82, 255, 0.4)'
              }}
            >
              <span>로그인</span>
              <span style={{ fontSize: '18px' }}>›</span>
            </button>

            {/* 하단 링크: 회원가입 | 비밀번호 찾기 (스크린샷 일치) */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              fontSize: '13px',
              color: '#90A4AE',
              paddingTop: '6px'
            }}>
              <button
                type="button"
                onClick={() => setCurrentStep('SIGNUP')}
                style={{ background: 'none', border: 'none', color: '#CFD8DC', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                회원가입
              </button>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <button
                type="button"
                onClick={() => setCurrentStep('RESET_PW')}
                style={{ background: 'none', border: 'none', color: '#CFD8DC', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                비밀번호 찾기
              </button>
            </div>

            {/* SECURITY S-BRIDGE INTEGRATED 배지 (스크린샷 일치) */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
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
                color: '#90A4AE',
                letterSpacing: '0.5px'
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E676' }} />
                <span>SECURITY INTEGRATED</span>
              </div>
            </div>

            {/* 하단 보안 수칙 안내 박스 (스크린샷 일치) */}
            <div style={{
              background: '#0B1524',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '11.5px',
              color: '#8293A6',
              lineHeight: 1.45,
              marginTop: '10px'
            }}>
              <Lock size={15} color="#8293A6" style={{ flexShrink: 0 }} />
              <span>본 시스템은 신한임직원 및 협력사 전용입니다. 보안 수칙을 준수해 주세요.</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2) STEP 2: 비밀번호 입력 */}
        {/* ========================================================================= */}
        {currentStep === 'STEP2_PASSWORD' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#00E5FF' }}>{empNo}</span>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#90A4AE', display: 'block', marginBottom: '8px' }}>
                비밀번호
              </label>
              <div style={{
                background: '#121D2C',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                height: '52px'
              }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 700
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#90A4AE', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('STEP1_EMP_NO')}
                style={{
                  flex: 1,
                  height: '50px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                이전
              </button>

              <button
                type="button"
                onClick={handleStep2Next}
                style={{
                  flex: 2,
                  height: '50px',
                  borderRadius: '12px',
                  background: '#0052FF',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(0, 82, 255, 0.4)'
                }}
              >
                <span>다음 (OTP 인증)</span>
                <span style={{ fontSize: '18px' }}>›</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3) STEP 3: OTP 최종 인증 (Screenshot 5 일치) */}
        {/* ========================================================================= */}
        {currentStep === 'STEP3_OTP' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: '4px 0 0 0' }}>
              OTP 최종 인증
            </h2>

            {/* 이메일 발송 안내 박스 (스크린샷 일치) */}
            <div style={{
              background: '#0D1B2E',
              border: '1px solid rgba(0, 229, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#80D8FF', fontSize: '13.5px', fontWeight: 700 }}>
                <Mail size={16} color="#00E5FF" />
                <span>kh***@gmail.com</span>
              </div>
              <p style={{ fontSize: '12px', color: '#90A4AE', margin: 0 }}>
                위 이메일로 발송된 6자리 인증번호를 입력해 주세요.
              </p>
              <div style={{ fontSize: '11px', color: '#00E5FF', marginTop: '4px', fontWeight: 700 }}>
                (테스트 번호: <strong>{generatedOtp}</strong>)
              </div>
            </div>

            {/* 6자리 직사각형 글로우 OTP 입력 박스 (스크린샷 일치) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-digit-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  style={{
                    height: '58px',
                    borderRadius: '10px',
                    background: '#101B2B',
                    border: digit ? '2px solid #00E5FF' : '1px solid rgba(0, 229, 255, 0.3)',
                    boxShadow: digit ? '0 0 12px rgba(0, 229, 255, 0.4)' : 'none',
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: 900,
                    color: '#00E5FF',
                    outline: 'none'
                  }}
                />
              ))}
            </div>

            {/* 유효시간 & 초기화 / 재발송 버튼 (스크린샷 일치) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
              <span style={{ color: '#00E5FF', fontSize: '13px', fontWeight: 700 }}>
                유효시간 {formatTimer(timerSeconds)}
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setOtpDigits(['', '', '', '', '', ''])}
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
                  <RefreshCw size={12} />
                  <span>초기화</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    setGeneratedOtp(newOtp);
                    setTimerSeconds(178);
                    setIsTimerRunning(true);
                    alert(`🔑 새 OTP 인증번호 [${newOtp}]가 재발송되었습니다.`);
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
                  <RefreshCw size={12} color="#00E5FF" />
                  <span>재발송</span>
                </button>
              </div>
            </div>

            {/* 하단 보조 링크 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('STEP2_PASSWORD')}
                style={{ background: 'none', border: 'none', color: '#90A4AE', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={14} />
                <span>비밀번호 재입력</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('RESET_PW')}
                style={{ background: 'none', border: 'none', color: '#FF8A80', cursor: 'pointer', textDecoration: 'underline' }}
              >
                비밀번호 초기화
              </button>
            </div>

            {/* 최종 로그인 버튼 (스크린샷 일치) */}
            <button
              onClick={handleFinalLogin}
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '12px',
                background: '#0047E0',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(0, 71, 224, 0.45)',
                marginTop: '10px'
              }}
            >
              <span>로그인</span>
              <span style={{ fontSize: '18px' }}>›</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4) 회원가입 / 계정 생성 화면 (Screenshot 2 일치) */}
        {/* ========================================================================= */}
        {currentStep === 'SIGNUP' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px 0' }}>
                계정 생성
              </h2>
              <p style={{ fontSize: '12px', color: '#90A4AE', margin: 0 }}>
                신한금융그룹 구성원 전용 도급 관제 시스템
              </p>
            </div>

            {/* 회사소속 */}
            <div>
              <label style={signupLabelStyle}>회사소속 *</label>
              <div style={signupSelectBoxStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <Building2 size={16} color="#90A4AE" />
                  <select
                    value={signupForm.company}
                    onChange={e => setSignupForm({ ...signupForm, company: e.target.value })}
                    style={signupSelectFieldStyle}
                  >
                    <option value="신한DS">신한DS</option>
                    <option value="(주)협력아이티에스">(주)협력아이티에스</option>
                  </select>
                </div>
                <ChevronDown size={16} color="#90A4AE" />
              </div>
            </div>

            {/* 팀 & 파트 (부문->팀, 본부->파트 반영) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={signupLabelStyle}>팀 *</label>
                <div style={signupSelectBoxStyle}>
                  <select
                    value={signupForm.department}
                    onChange={e => setSignupForm({ ...signupForm, department: e.target.value })}
                    style={signupSelectFieldStyle}
                  >
                    <option value="팀 선택">팀 선택</option>
                    <option value="카드개발팀">카드개발팀</option>
                    <option value="은행운영팀">은행운영팀</option>
                    <option value="데이터플랫폼팀">데이터플랫폼팀</option>
                    <option value="개발운영팀">개발운영팀</option>
                  </select>
                  <ChevronDown size={14} color="#90A4AE" />
                </div>
              </div>

              <div>
                <label style={signupLabelStyle}>파트</label>
                <div style={signupSelectBoxStyle}>
                  <select
                    value={signupForm.division}
                    onChange={e => setSignupForm({ ...signupForm, division: e.target.value })}
                    style={signupSelectFieldStyle}
                  >
                    <option value="파트 선택">파트 선택</option>
                    <option value="카드IS (Part 1)">카드IS (Part 1)</option>
                    <option value="코어뱅킹 (Part 2)">코어뱅킹 (Part 2)</option>
                    <option value="데이터인프라 (Part 3)">데이터인프라 (Part 3)</option>
                    <option value="상담파트">상담파트</option>
                  </select>
                  <ChevronDown size={14} color="#90A4AE" />
                </div>
              </div>
            </div>

            {/* 직책 멀티 필 (사원, 대리, 과장, 차장, 부장, 이사, 대표이사) */}
            <div>
              <label style={signupLabelStyle}>직책 *</label>
              <div style={{
                background: '#0F1A2A',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '10px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '6px'
              }}>
                {['사원', '대리', '과장', '차장', '부장', '이사', '대표이사'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSignupForm({ ...signupForm, position: p })}
                    style={{
                      padding: '8px 2px',
                      borderRadius: '6px',
                      border: 'none',
                      background: signupForm.position === p ? '#0052FF' : 'rgba(255, 255, 255, 0.04)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: signupForm.position === p ? 800 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* 사번 & 이름 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={signupLabelStyle}>사번 *</label>
                <div style={signupInputBoxStyle}>
                  <input
                    type="text"
                    value={signupForm.empNo}
                    onChange={e => setSignupForm({ ...signupForm, empNo: e.target.value })}
                    style={signupInputFieldStyle}
                  />
                </div>
              </div>

              <div>
                <label style={signupLabelStyle}>이름 *</label>
                <div style={signupInputBoxStyle}>
                  <input
                    type="text"
                    value={signupForm.name}
                    onChange={e => setSignupForm({ ...signupForm, name: e.target.value })}
                    style={signupInputFieldStyle}
                  />
                </div>
              </div>
            </div>

            {/* 이메일 주소 */}
            <div>
              <label style={signupLabelStyle}>이메일 주소 *</label>
              <div style={signupInputBoxStyle}>
                <Mail size={16} color="#90A4AE" />
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                  style={signupInputFieldStyle}
                />
              </div>
            </div>

            {/* 약관 동의 */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#CFD8DC', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={signupForm.agreeTerms}
                onChange={e => setSignupForm({ ...signupForm, agreeTerms: e.target.checked })}
                style={{ accentColor: '#0052FF' }}
              />
              <span>📄 이용약관 및 📄 개인정보 처리방침에 동의합니다 *</span>
            </label>

            {/* 계정 생성 완료 버튼 */}
            <button
              type="button"
              onClick={handleSignupSubmit}
              style={{
                width: '100%',
                height: '48px',
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
              onClick={() => setCurrentStep('STEP1_EMP_NO')}
              style={{ background: 'none', border: 'none', color: '#90A4AE', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}
            >
              ← 로그인 화면으로 돌아가기
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5) 비밀번호 초기화 (Screenshot 3 & 4 일치) */}
        {/* ========================================================================= */}
        {currentStep === 'RESET_PW' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                비밀번호 초기화
              </h2>
              <p style={{ fontSize: '12.5px', color: '#90A4AE', margin: 0 }}>
                가입 시 등록된 메일로 임시 비밀번호를 발송합니다.
              </p>
            </div>

            <div style={signupInputBoxStyle}>
              <input
                type="text"
                value={resetEmpNo}
                onChange={e => setResetEmpNo(e.target.value)}
                placeholder="사원번호"
                style={signupInputFieldStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('STEP1_EMP_NO')}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('RESET_PW_VERIFY')}
                style={{
                  flex: 2,
                  height: '48px',
                  borderRadius: '10px',
                  background: '#00C853',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                인증코드 발송
              </button>
            </div>
          </div>
        )}

        {currentStep === 'RESET_PW_VERIFY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px 0' }}>
                본인 확인 및 비밀번호 재설정
              </h2>
              <div style={{ fontSize: '12.5px', color: '#80D8FF' }}>
                ✉ kh********@gmail.com
              </div>
            </div>

            {/* 6자리 OTP */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
              {['7', '8', '9', '0', '1', '2'].map((d, i) => (
                <div key={i} style={{ height: '48px', borderRadius: '8px', background: '#101B2B', border: '1px solid #00E5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: '#00E5FF' }}>
                  {d}
                </div>
              ))}
            </div>

            <div>
              <label style={signupLabelStyle}>새 비밀번호 설정 (8자 이상)</label>
              <div style={signupInputBoxStyle}>
                <input
                  type="password"
                  value={newResetPw}
                  onChange={e => setNewResetPw(e.target.value)}
                  placeholder="새 비밀번호"
                  style={signupInputFieldStyle}
                />
              </div>
            </div>

            <div>
              <label style={signupLabelStyle}>비밀번호 확인</label>
              <div style={signupInputBoxStyle}>
                <input
                  type="password"
                  value={confirmResetPw}
                  onChange={e => setConfirmResetPw(e.target.value)}
                  placeholder="비밀번호 확인"
                  style={signupInputFieldStyle}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert('🔒 비밀번호 재설정이 완료되었습니다. 새 비밀번호로 로그인하세요.');
                setCurrentStep('STEP1_EMP_NO');
              }}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                background: '#192841',
                border: '1px solid #0052FF',
                color: '#FFFFFF',
                fontSize: '14.5px',
                fontWeight: 800,
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              비밀번호 변경 및 완료
            </button>
          </div>
        )}
      </div>

      {/* 4. 최하단 신한DS 브랜딩 푸터 (스크린샷 일치) */}
      <div style={{
        padding: '16px 20px 24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '4px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#90A4AE' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#0052FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#FFFFFF', fontWeight: 900 }}>
            S
          </div>
          <span>신한DS</span>
        </div>
        <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.3)' }}>
          © 2026 Shinhan DS Corp. All Rights Reserved
        </div>
      </div>
    </div>
  );
};

const signupLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#90A4AE',
  display: 'block',
  marginBottom: '6px'
};

const signupInputBoxStyle: React.CSSProperties = {
  background: '#101B2B',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  height: '46px'
};

const signupInputFieldStyle: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 600
};

const signupSelectBoxStyle: React.CSSProperties = {
  background: '#101B2B',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 10px',
  height: '46px'
};

const signupSelectFieldStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#FFFFFF',
  fontSize: '13.5px',
  fontWeight: 600,
  width: '100%',
  cursor: 'pointer',
  appearance: 'none'
};
