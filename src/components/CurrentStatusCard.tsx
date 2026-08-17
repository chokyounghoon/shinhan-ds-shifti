import React, { useState, useEffect } from 'react';
import { Info, RotateCw, ChevronRight, ChevronLeft, Calendar, ShieldCheck, CheckCircle2, FileCheck, Clock } from 'lucide-react';
import { WeeklyWorkStat } from '../types';
import { dbService } from '../services/db';

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
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8월 기본값
  const [selectedDay, setSelectedDay] = useState<number>(17); // 17일 오늘 기본값
  const [isSpinning, setIsSpinning] = useState(false);
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
  });

  // D1 DB에서 당월 출근/투입 기록 실시간 조회
  const fetchMonthLogs = async () => {
    const currentUser = dbService.getCurrentUser();
    const empId = currentUser?.employeeId || (currentUser as any)?.id || 'S01832';
    try {
      const res = await fetch(`https://sguardai.khcho0421.workers.dev/commute/logs?employee_id=${encodeURIComponent(empId)}`);
      if (res.ok) {
        const json = await res.json();
        const logs = json.data || [];
        const newMap = { ...punchedDates };
        logs.forEach((log: any) => {
          if (log.work_date && log.work_date.startsWith(`${currentYear}-${String(currentMonth).padStart(2, '0')}`)) {
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
    } catch (e) {
      console.warn('Failed to fetch monthly commute logs:', e);
    }
  };

  useEffect(() => {
    fetchMonthLogs();
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

  // 월간 총 누적 공수 계산
  const totalWorkedDays = Object.keys(punchedDates).filter(k => parseInt(k, 10) <= 17).length;
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
      {/* 1. 헤더 & 월 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={18} color="#0052FF" />
          <span style={{ fontSize: '16px', fontWeight: 900, color: '#191F28' }}>
            월간 도급 투입 공수 관리
          </span>
          <button onClick={onOpenInfo} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
            <Info size={15} color="#8B95A1" />
          </button>
        </div>

        {/* 월 변경 및 새로고침 컨트롤 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={handlePrevMonth}
            style={{
              background: '#F1F3F5',
              border: 'none',
              borderRadius: '6px',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={16} color="#4E5968" />
          </button>
          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#191F28', minWidth: '78px', textAlign: 'center' }}>
            {currentYear}년 {currentMonth}월
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            style={{
              background: '#F1F3F5',
              border: 'none',
              borderRadius: '6px',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
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
              marginLeft: '4px',
              padding: '2px',
              transform: isSpinning ? 'rotate(360deg)' : 'none',
              transition: 'transform 0.5s ease'
            }}
            aria-label="달력 데이터 새로고침"
          >
            <RotateCw size={15} />
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
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#0052FF', marginTop: '1px' }}>
            {totalHours}.0<span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>h</span>
            <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700, marginLeft: '6px' }}>
              ({totalWorkedDays}/{totalMonthWorkingDays} M/D 투입완료)
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>도급 검수 상태</div>
          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0D9488', marginTop: '2px' }}>
            ✓ 협력사 1차 확정
          </div>
        </div>
      </div>

      {/* 3. 월 달력 요일 헤더 */}
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
          const isToday = currentYear === 2026 && currentMonth === 8 && day === 17;
          const isSelected = selectedDay === day;
          const punch = punchedDates[day];
          const isVacation = day === 18; // 8월 18일 연차

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
                    : '#FFFFFF',
                borderRadius: '8px',
                border: isSelected 
                  ? `2px solid ${themeMode === 'ddangyo' ? '#FF462D' : '#0052FF'}` 
                  : isToday 
                    ? '1.5px solid #16A34A' 
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
                {isVacation ? (
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
                    연차
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

      {/* 5. 선택 일자 상세 투입 정보 툴팁 카드 */}
      <div style={{
        marginTop: '12px',
        background: '#F8F9FA',
        borderRadius: '10px',
        padding: '10px 14px',
        border: '1px solid #ECEFF2',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={15} color="#0052FF" />
          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#191F28' }}>
            8월 {selectedDay}일 도급 투입 실적:
            {selectedDay === 18 ? (
              <span style={{ color: '#D97706', marginLeft: '6px' }}>소속사 연차 휴가 (1 M/D 공백 통보완료)</span>
            ) : punchedDates[selectedDay] ? (
              <span style={{ color: '#16A34A', marginLeft: '6px' }}>
                1 M/D (8.0h) 정상 투입 확정 ({punchedDates[selectedDay].time} 파인에비뉴)
              </span>
            ) : (selectedDay % 7 === 1 || selectedDay % 7 === 2) ? (
              <span style={{ color: '#64748B', marginLeft: '6px' }}>주말 정기 휴무</span>
            ) : (
              <span style={{ color: '#64748B', marginLeft: '6px' }}>투입 예정 (정규 8.0h)</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDetail}
          style={{
            background: 'none',
            border: 'none',
            color: '#0052FF',
            fontWeight: 800,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: 0,
            whiteSpace: 'nowrap'
          }}
        >
          <span>내역 보기</span>
          <ChevronRight size={14} />
        </button>
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
    </div>
  );
};

