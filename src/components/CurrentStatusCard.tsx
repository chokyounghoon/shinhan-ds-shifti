import React, { useState, useEffect } from 'react';
import { Info, RotateCw, ChevronRight, ChevronLeft, Calendar, ShieldCheck, CheckCircle2, FileCheck, Clock, Palmtree, AlertTriangle, FileText, X } from 'lucide-react';
import { WeeklyWorkStat } from '../types';
import { dbService } from '../services/db';
import { VacationRegistrationModal } from './modals/VacationRegistrationModal';
import { SubmitClarificationModal } from './modals/SubmitClarificationModal';

interface CurrentStatusCardProps {
  stats: WeeklyWorkStat;
  onOpenDetail: () => void;
  onOpenInfo: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const CurrentStatusCard: React.FC<CurrentStatusCardProps> = ({
  stats,
  onOpenDetail,
  onOpenInfo,
  themeMode
}) => {
  const now = new Date();
  const realYear = now.getFullYear();
  const realMonth = now.getMonth() + 1;
  const realDay = now.getDate();

  const [currentYear, setCurrentYear] = useState<number>(realYear);
  const [currentMonth, setCurrentMonth] = useState<number>(realMonth);
  const [selectedDay, setSelectedDay] = useState<number>(realDay);
  const [isSpinning, setIsSpinning] = useState(false);

  // 날짜 관리 모달 상태
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);
  const [isDayActionModalOpen, setIsDayActionModalOpen] = useState(false);
  const [punchedDates, setPunchedDates] = useState<Record<number, { time: string; status: string; hours: number }>>({
    3: { time: '08:50', status: 'NORMAL', hours: 8 },
    4: { time: '08:45', status: 'NORMAL', hours: 8 },
    5: { time: '08:50', status: 'NORMAL', hours: 8 },
    6: { time: '08:55', status: 'NORMAL', hours: 8 },
    7: { time: '08:50', status: 'NORMAL', hours: 8 },
    10: { time: '08:48', status: 'NORMAL', hours: 8 },
    11: { time: '08:50', status: 'NORMAL', hours: 8 },
    12: { time: '08:52', status: 'NORMAL', hours: 8 },
    13: { time: '08:45', status: 'NORMAL', hours: 8 },
    14: { time: '08:50', status: 'NORMAL', hours: 8 },
    17: { time: '08:50', status: 'NORMAL', hours: 8 },
    19: { time: '08:50', status: 'NORMAL', hours: 8 },
    20: { time: '08:45', status: 'NORMAL', hours: 8 },
    21: { time: '08:52', status: 'NORMAL', hours: 8 },
    24: { time: '08:48', status: 'NORMAL', hours: 8 },
    25: { time: '08:50', status: 'NORMAL', hours: 8 },
    26: { time: '08:50', status: 'NORMAL', hours: 8 },
    27: { time: '08:55', status: 'NORMAL', hours: 8 },
    28: { time: '08:50', status: 'NORMAL', hours: 8 },
    29: { time: '08:50', status: 'NORMAL', hours: 8 },
  });

  // D1 실시간 승인된 휴가/연차 데이터 맵 (day -> { type, status, hours, reason })
  const [vacationDates, setVacationDates] = useState<Record<number, { type: string; status: string; hours: number; reason: string }>>({
    18: { type: '연차', status: 'APPROVED', hours: 8, reason: '하계 정기 연차' }
  });

  // D1 DB에서 당월 출근/투입 기록 및 휴가 승인 데이터 실시간 조회
  const fetchMonthLogs = async () => {
    const currentUser = dbService.getCurrentUser();
    const empId = currentUser?.employeeId || (currentUser as any)?.id || 'S01832';
    const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    try {
      const [commuteRes, vacRes] = await Promise.all([
        fetch(`/api/commute/logs?employee_id=${encodeURIComponent(empId)}`),
        fetch(`/api/attendance/requests?employee_id=${encodeURIComponent(empId)}`)
      ]);

      if (commuteRes.ok) {
        const json = await commuteRes.json();
        const logs = json.data || [];
        const newMap = { ...punchedDates };
        logs.forEach((log: any) => {
          if (log.work_date && log.work_date.startsWith(monthPrefix)) {
            const dayNum = parseInt(log.work_date.split('-')[2], 10);
            newMap[dayNum] = {
              time: log.clock_in_time || '08:50',
              status: log.status || 'NORMAL',
              hours: 8
            };
          }
        });
        setPunchedDates(newMap);
      }

      if (vacRes.ok) {
        const vacJson = await vacRes.json();
        const vacs = vacJson.data || [];
        const newVacMap: Record<number, { type: string; status: string; hours: number; reason: string }> = {};

        vacs.forEach((vac: any) => {
          if (vac.status === 'REJECTED' || vac.status === 'REJECTED_PARTNER') return;
          const target = vac.target_date || vac.start_date || '';
          const vacType = vac.vacation_type || (vac.request_type === 'VACATION' ? '연차' : '휴가');
          const hours = Number(vac.hours) || (vacType.includes('반차') ? 4 : 8);

          // 단일 일자 또는 범위 일자 파싱
          if (target.includes('~')) {
            const [startStr, endStr] = target.split('~').map((s: string) => s.trim());
            if (startStr.startsWith(monthPrefix)) {
              const startDay = parseInt(startStr.split('-')[2], 10);
              const endDay = endStr.startsWith(monthPrefix) ? parseInt(endStr.split('-')[2], 10) : startDay;
              for (let d = startDay; d <= endDay; d++) {
                newVacMap[d] = { type: vacType, status: vac.status, hours, reason: vac.reason || '휴가' };
              }
            }
          } else if (target.startsWith(monthPrefix)) {
            const dayNum = parseInt(target.split('-')[2], 10);
            newVacMap[dayNum] = { type: vacType, status: vac.status, hours, reason: vac.reason || '휴가' };
          }
        });

        setVacationDates(newVacMap);
      }
    } catch (e) {
      console.warn('Failed to fetch monthly commute logs & vacations:', e);
    }
  };

  useEffect(() => {
    fetchMonthLogs();

    const handleUpdate = () => fetchMonthLogs();
    window.addEventListener('attendance_request_updated', handleUpdate);
    window.addEventListener('notification_updated', handleUpdate);

    return () => {
      window.removeEventListener('attendance_request_updated', handleUpdate);
      window.removeEventListener('notification_updated', handleUpdate);
    };
  }, [currentYear, currentMonth]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 1) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 12) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpinning(true);
    fetchMonthLogs().finally(() => {
      setTimeout(() => setIsSpinning(false), 500);
    });
  };

  // 달력 날짜 계산 (2026년 8월 기준 1일은 토요일)
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0(일) ~ 6(토)
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate(); // 31일

  const calendarCells = [];
  // 이전 달 빈 칸
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push({ day: null, isCurrentMonth: false });
  }
  // 이번 달 일자들
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, isCurrentMonth: true });
  }

  // 월간 총 누적 공수 계산 (출근일 + 승인/신청된 휴가일)
  const totalWorkedDays = Object.keys(punchedDates).filter(k => parseInt(k, 10) <= realDay).length + 
    Object.keys(vacationDates).filter(k => parseInt(k, 10) <= realDay && !punchedDates[parseInt(k, 10)]).length;
  const totalHours = totalWorkedDays * 8;
  const totalMonthWorkingDays = 21; // 8월 평일 21일

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '18px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      border: '1px solid #E5E8EB',
      marginBottom: '12px'
    }}>
      {/* 1. 상단 타이틀 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
          <Calendar size={18} color="#0052FF" />
          <span style={{ fontSize: '16.5px', fontWeight: 900, color: '#191F28', whiteSpace: 'nowrap' }}>
            월간 도급 투입 공수 관리
          </span>
          <button onClick={onOpenInfo} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
            <Info size={15} color="#8B95A1" />
          </button>
        </div>
      </div>

      {/* 2. 월간 누적 공수 요약 바 */}
      <div style={{
        background: '#F8FAFC',
        borderRadius: '12px',
        padding: '12px 14px',
        border: '1px solid #E2E8F0',
        marginBottom: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{currentMonth}월 누적 실투입 공수</div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#0052FF', marginTop: '1px', whiteSpace: 'nowrap' }}>
            {totalHours}.0<span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>h</span>
            <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700, marginLeft: '6px' }}>
              ({totalWorkedDays}/{totalMonthWorkingDays} M/D 투입완료)
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>도급 검수 상태</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0D9488', marginTop: '2px' }}>
            ✓ 협력사 1차 확정
          </div>
        </div>
      </div>

      {/* 3. 달력 위 년월 네비게이션 컨트롤 (달력 바로 상단 중앙 배치) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '10px',
        padding: '4px 0'
      }}>
        <button
          type="button"
          onClick={handlePrevMonth}
          style={{
            background: '#F1F3F5',
            border: 'none',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          aria-label="이전 달"
        >
          <ChevronLeft size={16} color="#4E5968" />
        </button>

        <span style={{ fontSize: '15px', fontWeight: 900, color: '#191F28', minWidth: '95px', textAlign: 'center', whiteSpace: 'nowrap' }}>
          {currentYear}년 {currentMonth}월
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          style={{
            background: '#F1F3F5',
            border: 'none',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          aria-label="다음 달"
        >
          <ChevronRight size={16} color="#4E5968" />
        </button>

        <button
          onClick={handleRefresh}
          style={{
            background: 'none',
            border: 'none',
            color: '#8B95A1',
            cursor: 'pointer',
            marginLeft: '2px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            transform: isSpinning ? 'rotate(360deg)' : 'none',
            transition: 'transform 0.5s ease'
          }}
          aria-label="달력 데이터 새로고침"
        >
          <RotateCw size={15} />
        </button>
      </div>

      {/* 4. 월 달력 요일 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
        {['일', '월', '화', '수', '목', '금', '토'].map((dow, idx) => (
          <div key={dow} style={{
            fontSize: '11.5px',
            fontWeight: 800,
            color: idx === 0 ? '#EF4444' : idx === 6 ? '#2563EB' : '#64748B',
            paddingBottom: '4px'
          }}>
            {dow}
          </div>
        ))}
      </div>

      {/* 4. 월 달력 날짜 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {calendarCells.map((cell, idx) => {
          if (!cell.isCurrentMonth || !cell.day) {
            return (
              <div key={`empty-${idx}`} style={{ minHeight: '52px', background: '#FAFAFA', borderRadius: '8px', opacity: 0.3 }} />
            );
          }

          const day = cell.day;
          const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isToday = currentYear === realYear && currentMonth === realMonth && day === realDay;
          const isSelected = selectedDay === day;
          const punch = punchedDates[day];
          const vacInfo = vacationDates[day];

          return (
            <div
              key={`day-${day}`}
              onClick={() => setSelectedDay(day)}
              style={{
                minHeight: '52px',
                background: isSelected 
                  ? (themeMode === 'ddangyo' ? '#FFF0ED' : '#EFF6FF')
                  : isToday 
                    ? '#F0FDF4'
                    : vacInfo
                      ? '#FFFBEB'
                      : '#FFFFFF',
                borderRadius: '8px',
                border: isSelected 
                  ? `2px solid ${themeMode === 'ddangyo' ? '#FF462D' : '#0052FF'}` 
                  : isToday 
                    ? '1.5px solid #16A34A' 
                    : vacInfo
                      ? '1px solid #FDE68A'
                      : '1px solid #E5E8EB',
                padding: '4px 2px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {/* 날짜 숫자 */}
              <div style={{
                fontSize: '11.5px',
                fontWeight: isToday || isSelected ? 900 : 700,
                color: isToday 
                  ? '#15803D' 
                  : dayOfWeek === 0 
                    ? '#EF4444' 
                    : dayOfWeek === 6 
                      ? '#2563EB' 
                      : '#191F28',
                lineHeight: 1
              }}>
                {day}
                {isToday && <span style={{ fontSize: '9px', display: 'block', color: '#16A34A', fontWeight: 800 }}>오늘</span>}
              </div>

              {/* 공수 / 휴가 뱃지 */}
              <div style={{ width: '100%', textAlign: 'center' }}>
                {vacInfo ? (
                  <span style={{
                    display: 'block',
                    background: '#FEF3C7',
                    color: '#B45309',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    borderRadius: '4px',
                    padding: '1px 0',
                    margin: '0 2px'
                  }}>
                    {vacInfo.type || '연차'}
                  </span>
                ) : punch ? (
                  <span style={{
                    display: 'block',
                    background: isToday ? '#DCFCE7' : '#E0F2FE',
                    color: isToday ? '#15803D' : '#0369A1',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    borderRadius: '4px',
                    padding: '1px 0',
                    margin: '0 2px'
                  }}>
                    8h
                  </span>
                ) : isWeekend ? (
                  <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 600 }}>휴무</span>
                ) : (
                  <span style={{ fontSize: '9px', color: '#CBD5E1', fontWeight: 600 }}>-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. 선택 일자 상세 투입 정보 및 휴가/소명 관리 액션 바 */}
      <div style={{
        marginTop: '12px',
        background: '#F8FAFC',
        borderRadius: '12px',
        padding: '12px 14px',
        border: '1.5px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color="#0052FF" />
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#191F28' }}>
              {currentMonth}월 {selectedDay}일 도급 투입 실적
            </div>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 800 }}>
            {vacationDates[selectedDay] ? (
              <span style={{ color: '#D97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: '6px' }}>
                🏖️ {vacationDates[selectedDay].type} ({vacationDates[selectedDay].hours}.0h M/D 인정) {vacationDates[selectedDay].status === 'APPROVED' ? '✓ 최종 승인' : '검수중'}
              </span>
            ) : punchedDates[selectedDay] ? (
              <span style={{ color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '6px' }}>
                ✓ 8.0h 정상 투입 ({punchedDates[selectedDay].time})
              </span>
            ) : (selectedDay % 7 === 1 || selectedDay % 7 === 2) ? (
              <span style={{ color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '6px' }}>
                주말 휴무
              </span>
            ) : (
              <span style={{ color: '#0052FF', background: '#EFF6FF', padding: '2px 8px', borderRadius: '6px' }}>
                투입 예정 (8.0h)
              </span>
            )}
          </div>
        </div>

        {/* 날짜별 원터치 관리 액션 버튼들 (휴가 신청 / 지각·누락 소명 작성 / 공수 내역) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '2px' }}>
          <button
            type="button"
            onClick={() => setIsVacationModalOpen(true)}
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '8px',
              padding: '8px 4px',
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#0046FF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <Palmtree size={13} color="#0046FF" />
            <span>휴가 신청</span>
          </button>

          <button
            type="button"
            onClick={() => setIsClarificationModalOpen(true)}
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              padding: '8px 4px',
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#D97706',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <AlertTriangle size={13} color="#D97706" />
            <span>소명서 작성</span>
          </button>

          <button
            type="button"
            onClick={onOpenDetail}
            style={{
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '8px 4px',
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={13} color="#64748B" />
            <span>내역 보기</span>
          </button>
        </div>
      </div>

      {/* 6. 하단 도급비 정산 법적 기준 고지 */}
      <div style={{
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        color: '#64748B'
      }}>
        <span>※ 용역 완성물 및 공수(Man-Hour) 기준 정산</span>
        <span style={{ color: '#16A34A', fontWeight: 700 }}>✓ 독립 노무 관리 준수</span>
      </div>

      {/* 🌟 선택한 날짜 기준 휴가 신청 모달 */}
      <VacationRegistrationModal
        isOpen={isVacationModalOpen}
        onClose={() => setIsVacationModalOpen(false)}
        themeMode={themeMode}
        onSuccess={() => {
          fetchMonthLogs();
        }}
      />

      {/* 🌟 선택한 날짜 기준 소명서 작성 모달 */}
      <SubmitClarificationModal
        isOpen={isClarificationModalOpen}
        onClose={() => setIsClarificationModalOpen(false)}
        incident={{
          id: `incident-${currentYear}${String(currentMonth).padStart(2, '0')}${String(selectedDay).padStart(2, '0')}`,
          incidentDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`,
          type: 'LATE',
          typeLabel: '지각/출근 누락 소명',
          delayMinutes: 15,
          varianceTime: '15분',
          scheduledTime: '09:00',
          actualTime: '09:15',
          defaultReason: '출근 시간대 대중교통 지연으로 인한 일시 투입 지연'
        }}
        onClarificationSubmitted={() => {
          fetchMonthLogs();
        }}
        themeMode={themeMode}
      />
    </div>
  );
};

