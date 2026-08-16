import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Check } from 'lucide-react';
import { dbService } from '../services/db';

interface CreateScheduleRequestViewProps {
  onBack: () => void;
  onSubmitted: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const CreateScheduleRequestView: React.FC<CreateScheduleRequestViewProps> = ({
  onBack,
  onSubmitted,
  themeMode
}) => {
  const [selectedPosition, setSelectedPosition] = useState('팀원');
  const [selectedTime, setSelectedTime] = useState<string | null>(null); // e.g. '09:00 - 18:00'
  const [isTimeSheetOpen, setIsTimeSheetOpen] = useState(true); // 스크린샷처럼 기본 오픈
  const [selectedDates, setSelectedDates] = useState<number[]>([16]); // 8월 16일
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [reason, setReason] = useState('신한DS 땡겨요 프론트엔드 연동 개발');

  const timeOptions = [
    { id: 'custom', label: '직접 입력' },
    { id: 'opt-1', label: '08:45 - 17:45' },
    { id: 'opt-2', label: '08~17' },
    { id: 'opt-3', label: '09~18' },
    { id: 'more', label: '더보기...' },
    { id: 'cancel', label: '취소' },
  ];

  const handleTimeSelect = (label: string) => {
    if (label === '취소') {
      setIsTimeSheetOpen(false);
      return;
    }

    if (label === '더보기...') {
      alert('추가 템플릿: 교대(야간) 18:00 - 09:00, 교대(전일) 09:00 - 09:00');
      return;
    }

    if (label === '직접 입력') {
      const customTime = prompt('근무 시간을 입력하세요 (예: 10:00 - 19:00)', '10:00 - 19:00');
      if (customTime) {
        setSelectedTime(customTime);
        setIsTimeSheetOpen(false);
      }
      return;
    }

    setSelectedTime(label === '08~17' ? '08:00 - 17:00' : label === '09~18' ? '09:00 - 18:00' : label);
    setIsTimeSheetOpen(false);
  };

  const handleNextOrSubmit = () => {
    if (!selectedTime) {
      setIsTimeSheetOpen(true);
      return;
    }

    if (step === 'select') {
      setStep('confirm');
    } else {
      // 협력사 현장대리인 결재로 상신 (노란봉투법 세이프가드)
      dbService.addRequest({
        requestType: 'SCHEDULE',
        targetDate: `2026-08-${String(selectedDates[0] || 16).padStart(2, '0')}`,
        startTime: selectedTime.split(' - ')[0] || '09:00',
        endTime: selectedTime.split(' - ')[1] || '18:00',
        reason: reason
      });

      alert(`✅ [근무일정 생성 요청]이 협력사 현장대리인(김협력 PM)에게 성공적으로 상신되었습니다.\n• 일자: 2026-08-${selectedDates[0] || 16}\n• 시간: ${selectedTime}`);
      onSubmitted();
    }
  };

  const toggleDate = (d: number) => {
    if (selectedDates.includes(d)) {
      setSelectedDates(selectedDates.filter(x => x !== d));
    } else {
      setSelectedDates([...selectedDates, d]);
    }
  };

  // 2026년 8월 캘린더 날짜 매트릭스 (일~토)
  const calendarDays = [
    { day: 26, isPrev: true },
    { day: 27, isPrev: true },
    { day: 28, isPrev: true },
    { day: 29, isPrev: true },
    { day: 30, isPrev: true },
    { day: 31, isPrev: true },
    { day: 1, isPrev: false },
    { day: 2, isPrev: false },
    { day: 3, isPrev: false },
    { day: 4, isPrev: false },
    { day: 5, isPrev: false },
    { day: 6, isPrev: false },
    { day: 7, isPrev: false },
    { day: 8, isPrev: false },
    { day: 9, isPrev: false },
    { day: 10, isPrev: false, isFlight: true },
    { day: 11, isPrev: false, isFlight: true },
    { day: 12, isPrev: false, isFlight: true },
    { day: 13, isPrev: false, isFlight: true },
    { day: 14, isPrev: false, isFlight: true },
    { day: 15, isPrev: false, isHoliday: true },
    { day: 16, isPrev: false, isToday: true },
    { day: 17, isPrev: false },
    { day: 18, isPrev: false },
    { day: 19, isPrev: false },
    { day: 20, isPrev: false },
    { day: 21, isPrev: false },
    { day: 22, isPrev: false },
    { day: 23, isPrev: false },
    { day: 24, isPrev: false },
    { day: 25, isPrev: false },
    { day: 26, isPrev: false },
    { day: 27, isPrev: false },
    { day: 28, isPrev: false },
    { day: 29, isPrev: false },
    { day: 30, isPrev: false },
    { day: 31, isPrev: false },
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 1. 상단 헤더 (← 근무일정 생성 요청 | 다음) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={step === 'confirm' ? () => setStep('select') : onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>
            {step === 'select' ? '근무일정 생성 요청' : '요청 확인 및 상신'}
          </span>
        </div>

        <button
          onClick={handleNextOrSubmit}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            fontWeight: 800,
            color: selectedTime ? (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF') : '#8B95A1',
            cursor: 'pointer'
          }}
        >
          {step === 'select' ? '다음' : '상신하기'}
        </button>
      </div>

      {step === 'select' ? (
        <>
          {/* 2. 직무 & 시간 선택 행 (스크린샷 일치) */}
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #ECEFF2' }}>
            {/* 직무 행 */}
            <div 
              onClick={() => alert('직무 변경: 팀원 / 파트리더 / 현장대리인')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 18px',
                borderBottom: '1px solid #ECEFF2',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#191F28' }}>직무</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#4E5968' }}>{selectedPosition}</span>
                <ChevronRight size={18} color="#8B95A1" />
              </div>
            </div>

            {/* 시간 행 */}
            <div 
              onClick={() => setIsTimeSheetOpen(true)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 18px',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#191F28' }}>시간</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                  fontSize: '15px',
                  fontWeight: selectedTime ? 700 : 500,
                  color: selectedTime ? (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF') : '#8B95A1'
                }}>
                  {selectedTime || '선택안됨'}
                </span>
                <ChevronRight size={18} color="#8B95A1" />
              </div>
            </div>
          </div>

          {/* 3. 8월 2026 캘린더 그리드 (스크린샷 일치) */}
          <div style={{ padding: '16px 18px', flex: 1, position: 'relative' }}>
            {/* 캘린더 월 헤더 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              padding: '0 8px'
            }}>
              <button style={{ color: '#0066FF', display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={20} />
              </button>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0066FF' }}>8월 2026</span>
              <button style={{ color: '#0066FF', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* 요일 헤더 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 600,
              color: '#8B95A1',
              marginBottom: '12px'
            }}>
              <span style={{ color: '#F04438' }}>일</span>
              <span>월</span>
              <span>화</span>
              <span>수</span>
              <span>목</span>
              <span>금</span>
              <span style={{ color: '#0066FF' }}>토</span>
            </div>

            {/* 날짜 그리드 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              rowGap: '12px',
              textAlign: 'center'
            }}>
              {calendarDays.map((item, idx) => {
                const isSelected = selectedDates.includes(item.day) && !item.isPrev;
                const isSun = idx % 7 === 0;
                const isSat = idx % 7 === 6;

                return (
                  <div
                    key={idx}
                    onClick={() => !item.isPrev && toggleDate(item.day)}
                    style={{
                      height: '42px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: item.isPrev ? 'default' : 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isSelected ? (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF') : 'transparent',
                      color: isSelected 
                        ? '#FFFFFF' 
                        : item.isPrev 
                          ? '#D0D5DD' 
                          : isSun || item.isHoliday 
                            ? '#F04438' 
                            : isSat 
                              ? '#0066FF' 
                              : '#191F28',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: isSelected ? 800 : 600
                    }}>
                      {item.isFlight && <span style={{ fontSize: '10px', marginRight: '1px' }}>✈</span>}
                      {item.day}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 시간을 입력해주세요 중앙 안내 (시간 미선택 시) */}
            {!selectedTime && (
              <div style={{
                position: 'absolute',
                top: '52%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '17px',
                fontWeight: 700,
                color: '#6B7684',
                pointerEvents: 'none'
              }}>
                시간을 입력해주세요
              </div>
            )}
          </div>
        </>
      ) : (
        /* 2단계: 사유 입력 및 결재선 확인 (노란봉투법 세이프가드) */
        <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#F8F9FA',
            borderRadius: '10px',
            padding: '16px',
            border: '1px solid #ECEFF2'
          }}>
            <div style={{ fontSize: '13px', color: '#8B95A1', marginBottom: '6px' }}>신청 내역 요약</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#191F28', marginBottom: '4px' }}>
              근무일정 생성 (2026-08-{selectedDates[0] || 16})
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF' }}>
              희망 시간: {selectedTime}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: 700, color: '#191F28', marginBottom: '8px', display: 'block' }}>
              신청 사유
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #DDE2E5',
                fontSize: '14px',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <div style={{
            background: '#FFF5F2',
            border: '1px solid #FFE0D9',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '12.5px',
            color: '#B42318',
            lineHeight: 1.4
          }}>
            ⚖️ <strong>노란봉투법 & 파견법 컴플라이언스</strong><br />
            본 근무일정 신청서는 원청(신한DS)이 아닌 <strong>협력사 현장대리인(김협력 PM)</strong>의 독자적 노무지휘권 하에서 전결 승인됩니다.
          </div>
        </div>
      )}

      {/* 4. 시간 선택 바텀 시트 (스크린샷 100% 일치) */}
      {isTimeSheetOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsTimeSheetOpen(false)}
          style={{
            alignItems: 'flex-end',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.45)',
            zIndex: 1000
          }}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '430px',
              background: '#FFFFFF',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              padding: '24px 24px 32px 24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.15)',
              animation: 'slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* 상단 가이드 텍스트 (스크린샷 일치) */}
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#4E5968',
              marginBottom: '16px',
              lineHeight: 1.4
            }}>
              아래 옵션을 선택해 시간을 직접 입력하거나, 템플릿을 선택하세요.
            </div>

            {/* 시간 옵션 리스트 (스크린샷 일치) */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {timeOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleTimeSelect(opt.label)}
                  style={{
                    padding: '13px 0',
                    fontSize: '16px',
                    fontWeight: opt.id === 'cancel' ? 700 : 600,
                    color: opt.id === 'cancel' ? '#4E5968' : '#191F28',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
