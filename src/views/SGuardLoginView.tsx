import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
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
  EyeOff
} from 'lucide-react';
import { dbService, predefinedUsers } from '../services/db';
import { User as UserType } from '../types';

interface SGuardLoginViewProps {
  onLoginSuccess: (user: UserType) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const SGuardLoginView: React.FC<SGuardLoginViewProps> = ({
  onLoginSuccess,
  themeMode
}) => {
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [selectedUserId, setSelectedUserId] = useState<string>('usr-ds-pm');
  const [password, setPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('789012');
  const [timerSeconds, setTimerSeconds] = useState<number>(180); // 3분
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [agreeSecurity, setAgreeSecurity] = useState<boolean>(true);
  const [agreeContract, setAgreeContract] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentUserPreset = predefinedUsers.find(u => u.id === selectedUserId) || predefinedUsers[0];

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

  const handleRequestOtp = () => {
    if (!agreeSecurity || !agreeContract) {
      setErrorMessage('법적 필수 동의 항목에 모두 체크해주세요.');
      return;
    }

    setErrorMessage(null);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpDigits(['', '', '', '', '', '']);
    setTimerSeconds(180);
    setIsTimerRunning(true);
    setStep('OTP');
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val[val.length - 1];
    }
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    // 다음 인풋으로 포커스 이동
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtpAndLogin = () => {
    const inputOtp = otpDigits.join('');
    if (inputOtp.length < 6) {
      setErrorMessage('6자리 OTP 인증번호를 모두 입력해주세요.');
      return;
    }

    if (inputOtp !== generatedOtp && inputOtp !== '123456' && inputOtp !== '789012') {
      setErrorMessage('OTP 인증번호가 일치하지 않습니다. 다시 확인해주세요.');
      return;
    }

    const user = dbService.switchUserRole(selectedUserId);
    onLoginSuccess(user);
  };

  return (
    <div style={{
      background: '#0D1B2A',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      color: '#FFFFFF',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* 상단 보안 뱃지 & S-GUARD 로고 */}
      <div style={{
        padding: '36px 24px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #132E59 0%, #0D1B2A 100%)',
        borderBottom: '1px solid rgba(0, 229, 255, 0.15)'
      }}>
        {/* S-GUARD 쉴드 엠블럼 */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #0052FF 0%, #00D4FF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0, 212, 255, 0.35)',
          marginBottom: '14px'
        }}>
          <ShieldCheck size={36} color="#FFFFFF" strokeWidth={2.4} />
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0, 229, 255, 0.12)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 800,
          color: '#00E5FF',
          letterSpacing: '1px',
          marginBottom: '8px'
        }}>
          <span>SHINHAN DS • S-GUARD 2.0</span>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          도급 인력 투입 및 보안 인증
        </h1>
        <p style={{ fontSize: '12px', color: '#90A4AE', margin: 0, lineHeight: 1.4 }}>
          금융보안원 2-Factor(OTP) 통합 인증 센터
        </p>
      </div>

      {/* 본문 인증 폼 카드 */}
      <div style={{
        flex: 1,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {step === 'CREDENTIALS' ? (
          /* STEP 1: 계정 선택 및 1차 로그인 */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* 빠른 역할 프리셋 선택 탭 */}
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#00E5FF', display: 'block', marginBottom: '8px' }}>
                👤 로그인 계정 (3대 역할 프리셋)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedUserId('usr-ds-pm')}
                  style={{
                    padding: '10px 6px',
                    borderRadius: '8px',
                    border: selectedUserId === 'usr-ds-pm' ? '1.5px solid #00E5FF' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: selectedUserId === 'usr-ds-pm' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Building size={16} color={selectedUserId === 'usr-ds-pm' ? '#00E5FF' : '#90A4AE'} style={{ margin: '0 auto 4px auto' }} />
                  <div style={{ fontSize: '11px', fontWeight: 800 }}>신한DS PM</div>
                  <div style={{ fontSize: '9.5px', color: '#90A4AE' }}>총괄 검수</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUserId('usr-part-lead-1')}
                  style={{
                    padding: '10px 6px',
                    borderRadius: '8px',
                    border: selectedUserId === 'usr-part-lead-1' ? '1.5px solid #FF9500' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: selectedUserId === 'usr-part-lead-1' ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Briefcase size={16} color={selectedUserId === 'usr-part-lead-1' ? '#FF9500' : '#90A4AE'} style={{ margin: '0 auto 4px auto' }} />
                  <div style={{ fontSize: '11px', fontWeight: 800 }}>협력 파트장</div>
                  <div style={{ fontSize: '9.5px', color: '#90A4AE' }}>Part 1 대리인</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUserId('usr-worker-01')}
                  style={{
                    padding: '10px 6px',
                    borderRadius: '8px',
                    border: selectedUserId === 'usr-worker-01' ? '1.5px solid #12B76A' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: selectedUserId === 'usr-worker-01' ? 'rgba(18, 183, 106, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <UserCheck size={16} color={selectedUserId === 'usr-worker-01' ? '#12B76A' : '#90A4AE'} style={{ margin: '0 auto 4px auto' }} />
                  <div style={{ fontSize: '11px', fontWeight: 800 }}>협력 근로자</div>
                  <div style={{ fontSize: '9.5px', color: '#90A4AE' }}>송무준 (30인)</div>
                </button>
              </div>
            </div>

            {/* 선택된 계정 프로필 카드 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#0052FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px'
              }}>
                {currentUserPreset.name.substring(0, 1)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF' }}>
                  {currentUserPreset.name}
                </div>
                <div style={{ fontSize: '12px', color: '#82B1FF' }}>
                  {currentUserPreset.partnerCompany} · {currentUserPreset.deptName}
                </div>
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#CFD8DC', display: 'block', marginBottom: '6px' }}>
                S-GUARD 보안 비밀번호
              </label>
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px'
              }}>
                <KeyRound size={16} color="#82B1FF" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 10px',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#90A4AE', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* 법적 필수 동의 항목 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#CFD8DC', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreeSecurity}
                  onChange={e => setAgreeSecurity(e.target.checked)}
                  style={{ accentColor: '#00E5FF' }}
                />
                <span>[필수] 산업안전보건법 및 시설보안 출입로그 수집 동의</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#CFD8DC', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreeContract}
                  onChange={e => setAgreeContract(e.target.checked)}
                  style={{ accentColor: '#00E5FF' }}
                />
                <span>[필수] 도급 계약 공수 및 SLA 이행 검수 동의</span>
              </label>
            </div>

            {errorMessage && (
              <div style={{ color: '#FF5252', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: S-GUARD 2FA OTP 인증 */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(0, 229, 255, 0.15)',
                border: '1.5px solid #00E5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <Smartphone size={26} color="#00E5FF" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 4px 0' }}>
                2단계 S-GUARD OTP 인증
              </h3>
              <p style={{ fontSize: '12.5px', color: '#90A4AE', margin: 0 }}>
                등록된 보안 모바일 기기로 발송된 6자리 번호를 입력하세요.
              </p>
            </div>

            {/* 시뮬레이션용 OTP 번호 힌트 배너 */}
            <div style={{
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px dashed rgba(0, 229, 255, 0.4)',
              borderRadius: '8px',
              padding: '10px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#80D8FF'
            }}>
              🔑 <strong>테스트용 생성 OTP 번호</strong>: <span style={{ fontSize: '16px', fontWeight: 800, color: '#00E5FF', letterSpacing: '2px' }}>{generatedOtp}</span>
            </div>

            {/* 6자리 OTP 인풋 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  style={{
                    height: '50px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: digit ? '2px solid #00E5FF' : '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#00E5FF',
                    outline: 'none'
                  }}
                />
              ))}
            </div>

            {/* 타이머 & 재발송 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
              <span style={{ color: '#FF5252', fontWeight: 700 }}>
                남은 시간: {formatTimer(timerSeconds)}
              </span>
              <button
                type="button"
                onClick={handleRequestOtp}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#82B1FF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                <RefreshCw size={13} />
                <span>OTP 재발송</span>
              </button>
            </div>

            {errorMessage && (
              <div style={{ color: '#FF5252', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* 하단 액션 버튼 */}
        <div style={{ paddingTop: '24px' }}>
          {step === 'CREDENTIALS' ? (
            <button
              onClick={handleRequestOtp}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                background: 'linear-gradient(90deg, #0052FF 0%, #00D4FF 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(0, 82, 255, 0.4)'
              }}
            >
              <span>S-GUARD OTP 인증 요청</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep('CREDENTIALS')}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                이전
              </button>
              <button
                onClick={handleVerifyOtpAndLogin}
                style={{
                  flex: 2,
                  height: '48px',
                  borderRadius: '10px',
                  background: 'linear-gradient(90deg, #00C853 0%, #00E676 100%)',
                  border: 'none',
                  color: '#0D1B2A',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(0, 230, 118, 0.35)'
                }}
              >
                <CheckCircle2 size={18} color="#0D1B2A" />
                <span>OTP 인증 완료 및 시스템 진입</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
