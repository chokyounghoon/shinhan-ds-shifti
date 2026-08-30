import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Calendar, ChevronDown, ChevronLeft, ChevronRight, 
  Send, CheckCircle2, Plane, FileText, Clock, UserCheck, 
  Layers, BarChart3, Grid, List, Sparkles, X, RefreshCw, Briefcase, Award
} from 'lucide-react';
import { User, DaySchedule } from '../types';

export interface ScheduleEntry {
  id: string;
  userId: string;
  userName: string;
  deptName: string;
  position: string;
  workDate: string; // e.g. 2026-08-02, 2026-08-03
  dateGroupLabel: string; // e.g. 2026년 8월 2일, 일
  totalGroupHours: string;
  isWeekend?: boolean;
  startTime?: string;
  endTime?: string;
  vacationType?: string; // e.g. 출산전후휴가, 건강검진, 대체휴가, 부모잔치, 연차, 체력단련
  workType?: 'NORMAL' | 'VACATION' | 'OVERTIME' | 'BUSINESS_TRIP' | 'EDUCATION';
  taskSummary?: string;
  isVerified?: boolean;
}

// 8월 기본 일정 데이터 생성기 (2026년 8월 1일 ~ 31일)
const generateAugustSchedules = (currentEmpId: string, currentName: string): ScheduleEntry[] => {
  const entries: ScheduleEntry[] = [];
  const daysInMonth = 31;
  const teamMembers = [
    { id: currentEmpId, name: currentName, dept: '카드개발팀', pos: '팀원' },
    { id: 'usr-002', name: '송무준', dept: '카드개발팀', pos: '팀원' },
    { id: 'usr-003', name: '배경보', dept: '카드개발팀', pos: '팀원' },
    { id: 'usr-004', name: '이재연', dept: '카드개발팀', pos: '팀원' },
    { id: 'usr-005', name: '김도현', dept: '카드개발팀', pos: '팀원' },
    { id: 'usr-006', name: '윤학민', dept: '카드개발팀', pos: '팀원' },
    { id: 'usr-007', name: '이종민', dept: '카드개발팀', pos: '팀원' },
    { id: 'usr-008', name: '김윤호', dept: '카드개발팀', pos: '팀원' },
    { id: 'usr-009', name: '강윤지', dept: '카드개발팀', pos: '팀원' },
    { id: 'usr-010', name: '권예림', dept: '카드개발팀', pos: '팀원' },
    { id: 'usr-011', name: '박남호', dept: '카드개발팀', pos: '팀원' },
    { id: 'usr-012', name: '정재문', dept: '카드개발팀', pos: '팀원' }
  ];

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `2026-08-${dayStr}`;
    const d = new Date(`2026-08-${dayStr}T09:00:00`);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dowLabel = ['일', '월', '화', '수', '목', '금', '토'][dayOfWeek];
    const groupLabel = `2026년 8월 ${day}일, ${dowLabel}`;

    if (isWeekend) {
      if (day === 2) {
        entries.push({
          id: `sch-aug-${day}-1`,
          userId: 'usr-002',
          userName: '송무준',
          deptName: '카드개발팀',
          position: '팀원',
          workDate: dateStr,
          dateGroupLabel: groupLabel,
          totalGroupHours: '2시간',
          isWeekend: true,
          startTime: '00:00',
          endTime: '02:00',
          workType: 'OVERTIME',
          taskSummary: '상담/카드 코어 모듈 무중단 점검',
          isVerified: true
        });
      }
      continue;
    }

    // 평일 근무 편성
    teamMembers.forEach((member, idx) => {
      let vacType: string | undefined = undefined;
      let wType: 'NORMAL' | 'VACATION' | 'OVERTIME' | 'BUSINESS_TRIP' | 'EDUCATION' = 'NORMAL';
      let start = '09:00';
      let end = '18:00';

      if (day === 3) {
        if (member.name === '배경보') { vacType = '출산전후휴가'; wType = 'VACATION'; }
        else if (member.name === '이재연') { vacType = '건강검진'; wType = 'VACATION'; }
        else if (member.name === '김도현' || member.name === '윤학민' || member.name === '이종민') { vacType = '대체휴가'; wType = 'VACATION'; }
        else if (member.name === '김윤호') { vacType = '부모잔치'; wType = 'VACATION'; }
        else if (['강윤지', '권예림', '박남호', '정재문'].includes(member.name)) { vacType = '연차'; wType = 'VACATION'; }
      } else if (day === 7 && member.name === currentName) {
        vacType = '연차';
        wType = 'VACATION';
      } else if (day === 14 && member.name === '김도현') {
        vacType = '체력단련';
        wType = 'VACATION';
      } else if (day === 19 && member.name === currentName) {
        wType = 'BUSINESS_TRIP';
        vacType = '외근/출장';
      }

      entries.push({
        id: `sch-aug-${day}-${idx}`,
        userId: member.id,
        userName: member.name,
        deptName: member.dept,
        position: member.pos,
        workDate: dateStr,
        dateGroupLabel: groupLabel,
        totalGroupHours: day === 3 ? '296시간 30분' : '8시간 0분',
        isWeekend: false,
        startTime: start,
        endTime: end,
        vacationType: vacType,
        workType: wType,
        taskSummary: vacType ? `${vacType} (사전 승인 공백)` : `${member.dept} 코어 도급 SLA 완수 및 운영`,
        isVerified: true
      });
    });
  }

  return entries;
};

interface ScheduleViewProps {
  user: User;
  onOpenNewScheduleRequest?: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  user,
  onOpenNewScheduleRequest,
  themeMode
}) => {
  const isSiteManager = user.role === 'PARTNER_SITE_MANAGER' || user.role === 'DS_PRINCIPAL_PM';
  const currentEmpId = user.employeeId || user.id || 'S01832';
  const currentName = user.name || '조경훈';

  // 상태 관리
  const [viewScope, setViewScope] = useState<'my' | 'all'>(isSiteManager ? 'all' : 'my');
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 일자별 / 월별 / 조건별 필터
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 1~12
  const [selectedWorkType, setSelectedWorkType] = useState<string>('ALL'); // ALL, NORMAL, VACATION, OVERTIME, BUSINESS_TRIP
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'ALL'>('ALL'); // 특정 일자 선택 (1~31 or ALL)

  const [schedules, setSchedules] = useState<ScheduleEntry[]>(() => generateAugustSchedules(currentEmpId, currentName));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Cloudflare D1 DB에서 실시간 스케줄 및 휴가 결합 조회
  const fetchSchedulesFromD1 = async () => {
    setIsLoading(true);
    try {
      const monthStr = `${selectedYear}-${selectedMonth < 10 ? '0' + selectedMonth : selectedMonth}`;
      const url = isSiteManager && viewScope === 'all' 
        ? `/api/schedules?month=${monthStr}` 
        : `/api/schedules?employee_id=${encodeURIComponent(currentEmpId)}&month=${monthStr}`;

      const [res, vacRes] = await Promise.all([
        fetch(url),
        fetch(`/api/attendance/requests?employee_id=${encodeURIComponent(currentEmpId)}`)
      ]);

      let baseList = generateAugustSchedules(currentEmpId, currentName);

      if (res.ok) {
        const json = await res.json();
        const rows: any[] = json.data || [];
        if (rows.length > 0) {
          const mapped: ScheduleEntry[] = rows.map((r: any) => {
            const dateStr = r.workDate || `${monthStr}-15`;
            let label = dateStr;
            try {
              const d = new Date(dateStr);
              const mm = d.getMonth() + 1;
              const dd = d.getDate();
              const dow = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()] || '평일';
              label = `2026년 ${mm}월 ${dd}일, ${dow}`;
            } catch (_) {}

            return {
              id: r.id,
              userId: r.userId || currentEmpId,
              userName: r.userName || currentName,
              deptName: r.deptName || '카드개발팀',
              position: r.position || '팀원',
              workDate: dateStr,
              dateGroupLabel: label,
              totalGroupHours: '8시간 0분',
              vacationType: r.vacationType || (r.isVacation ? '휴가' : undefined),
              workType: r.isVacation ? 'VACATION' : 'NORMAL',
              startTime: '09:00',
              endTime: '18:00',
              taskSummary: r.taskSummary || '카드 기간계 코어 도급 운영',
              isVerified: true
            };
          });
          baseList = mapped;
        }
      }

      // D1 attendance_requests 휴가 승인 건 실시간 결합
      if (vacRes.ok) {
        const vacJson = await vacRes.json();
        const vacs: any[] = vacJson.data || [];
        vacs.forEach((v: any) => {
          if (v.status === 'APPROVED' || v.status === 'PENDING_DS' || v.status === 'PENDING') {
            const matchIdx = baseList.findIndex(e => e.workDate === v.target_date && (e.userName === v.user_name || e.userId === v.employee_id));
            if (matchIdx >= 0) {
              baseList[matchIdx].vacationType = v.vacation_type || '연차';
              baseList[matchIdx].workType = 'VACATION';
              baseList[matchIdx].taskSummary = `[${v.status === 'APPROVED' ? '승인완료' : '검수대기'}] ${v.reason || '휴가 공백'}`;
            }
          }
        });
      }

      setSchedules(baseList);
    } catch (e) {
      console.warn('Failed to fetch schedules from D1:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedulesFromD1();
  }, [viewScope, currentEmpId, selectedYear, selectedMonth]);

  // 다차원 필터링 연산
  const filteredEntries = useMemo(() => {
    return schedules.filter(entry => {
      // 1) 권한/스코프 필터
      if (!isSiteManager || viewScope === 'my') {
        const isMe = entry.userId === currentEmpId || entry.userName === currentName;
        if (!isMe) return false;
      }

      // 2) 특정 일자 필터
      if (selectedDayFilter !== 'ALL') {
        const targetDayStr = `${selectedYear}-${selectedMonth < 10 ? '0' + selectedMonth : selectedMonth}-${selectedDayFilter < 10 ? '0' + selectedDayFilter : selectedDayFilter}`;
        if (entry.workDate !== targetDayStr) return false;
      }

      // 3) 근무/휴가 유형 필터
      if (selectedWorkType !== 'ALL') {
        if (selectedWorkType === 'VACATION' && !entry.vacationType) return false;
        if (selectedWorkType === 'NORMAL' && (entry.vacationType || entry.workType !== 'NORMAL')) return false;
        if (selectedWorkType === 'OVERTIME' && entry.workType !== 'OVERTIME') return false;
        if (selectedWorkType === 'BUSINESS_TRIP' && entry.workType !== 'BUSINESS_TRIP') return false;
      }

      // 4) 텍스트 검색 (사원명, 부서명, 날짜, 휴가유형)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = entry.userName.toLowerCase().includes(q);
        const matchesDept = entry.deptName.toLowerCase().includes(q);
        const matchesDate = entry.workDate.includes(q);
        const matchesVac = entry.vacationType && entry.vacationType.toLowerCase().includes(q);
        const matchesTask = entry.taskSummary && entry.taskSummary.toLowerCase().includes(q);
        if (!matchesName && !matchesDept && !matchesDate && !matchesVac && !matchesTask) {
          return false;
        }
      }

      return true;
    });
  }, [schedules, viewScope, currentEmpId, currentName, selectedDayFilter, selectedWorkType, searchQuery, selectedYear, selectedMonth]);

  // 날짜별 그룹핑
  const groupedByDate = useMemo(() => {
    return filteredEntries.reduce((acc, cur) => {
      if (!acc[cur.dateGroupLabel]) {
        acc[cur.dateGroupLabel] = {
          workDate: cur.workDate,
          totalHours: cur.totalGroupHours,
          isWeekend: cur.isWeekend,
          items: []
        };
      }
      acc[cur.dateGroupLabel].items.push(cur);
      return acc;
    }, {} as Record<string, { workDate: string; totalHours: string; isWeekend?: boolean; items: ScheduleEntry[] }>);
  }, [filteredEntries]);

  // 통계 KPI 연산
  const kpiStats = useMemo(() => {
    const totalItems = filteredEntries.length;
    const vacationItems = filteredEntries.filter(e => e.vacationType).length;
    const normalWorkItems = filteredEntries.filter(e => !e.vacationType && !e.isWeekend).length;
    const totalHours = (normalWorkItems * 8.0).toFixed(1);

    return {
      totalHours,
      normalDays: normalWorkItems,
      vacationDays: vacationItems,
      totalCount: totalItems
    };
  }, [filteredEntries]);

  // 월 변경 핸들러
  const handlePrevMonth = () => {
    setSelectedDayFilter('ALL');
    if (selectedMonth === 1) {
      setSelectedYear(y => y - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDayFilter('ALL');
    if (selectedMonth === 12) {
      setSelectedYear(y => y + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* 1. 상단 검색바 & 뷰 토글 & 새로고침 (스크린샷 일치) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF',
        gap: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          flex: 1,
          height: '38px',
          background: '#F1F3F5',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          gap: '8px'
        }}>
          <Search size={16} color="#8B95A1" />
          <input
            type="text"
            placeholder="사원명, 일자(08-03), 휴가명칭 검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13.5px',
              color: '#191F28',
              width: '100%'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
              <X size={14} color="#8B95A1" />
            </button>
          )}
        </div>

        {/* 뷰 모드 토글 (목록형 / 달력형) */}
        <button
          onClick={() => setViewMode(viewMode === 'timeline' ? 'calendar' : 'timeline')}
          style={{
            height: '38px',
            padding: '0 10px',
            borderRadius: '8px',
            border: '1px solid #DDE2E5',
            background: viewMode === 'calendar' ? '#EFF6FF' : '#FFFFFF',
            color: viewMode === 'calendar' ? '#0066FF' : '#4E5968',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="보기 방식 전환"
        >
          {viewMode === 'timeline' ? <Grid size={16} /> : <List size={16} />}
          <span>{viewMode === 'timeline' ? '달력' : '목록'}</span>
        </button>

        {/* 새로고침 */}
        <button 
          onClick={fetchSchedulesFromD1}
          style={{ height: '38px', padding: '0 10px', color: '#4E5968', display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #DDE2E5', borderRadius: '8px', cursor: 'pointer' }}
          title="새로고침"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 2. 월간 / 일자별 탐색 컨트롤러 바 (스크린샷 일치) */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #ECEFF2',
        padding: '10px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* 월 네비게이션 & 스코프 토글 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* 월 전환 버튼 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              onClick={handlePrevMonth}
              style={{ border: 'none', background: '#F1F3F5', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronLeft size={16} color="#4E5968" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={16} color="#333D4B" />
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#191F28' }}>
                {selectedYear}.{selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth}.01 - {selectedYear}.{selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth}.31
              </span>
              <ChevronDown size={14} color="#8B95A1" />
            </div>
            <button 
              onClick={handleNextMonth}
              style={{ border: 'none', background: '#F1F3F5', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronRight size={16} color="#4E5968" />
            </button>
          </div>

          {/* 내 일정 / 전체 일정 스코프 토글 (스크린샷 일치) */}
          {isSiteManager ? (
            <div style={{ display: 'flex', background: '#F1F3F5', padding: '2px', borderRadius: '6px' }}>
              <button
                onClick={() => setViewScope('my')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewScope === 'my' ? '#FFFFFF' : 'transparent',
                  color: viewScope === 'my' ? '#191F28' : '#8B95A1',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                내 일정
              </button>
              <button
                onClick={() => setViewScope('all')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewScope === 'all' ? '#FFFFFF' : 'transparent',
                  color: viewScope === 'all' ? '#0066FF' : '#8B95A1',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                팀원 전체
              </button>
            </div>
          ) : (
            <div style={{
              height: '30px',
              padding: '0 10px',
              borderRadius: '6px',
              border: '1px solid #DDE2E5',
              background: '#F8F9FA',
              color: '#191F28',
              fontSize: '12.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center'
            }}>
              내 일정 (독자보호)
            </div>
          )}
        </div>

        {/* 3. 일자별 빠른 선택 칩 (일자별 조건 검색) */}
        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '2px' }}>
          <button
            onClick={() => setSelectedDayFilter('ALL')}
            style={{
              padding: '4px 10px',
              borderRadius: '16px',
              border: selectedDayFilter === 'ALL' ? '1px solid #0066FF' : '1px solid #E5E8EB',
              background: selectedDayFilter === 'ALL' ? '#EBF4FF' : '#FFFFFF',
              color: selectedDayFilter === 'ALL' ? '#0066FF' : '#4E5968',
              fontSize: '11.5px',
              fontWeight: selectedDayFilter === 'ALL' ? 800 : 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            전체 일자
          </button>
          {[2, 3, 7, 10, 14, 19, 21, 28, 30].map(day => (
            <button
              key={day}
              onClick={() => setSelectedDayFilter(day)}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                border: selectedDayFilter === day ? '1px solid #0066FF' : '1px solid #E5E8EB',
                background: selectedDayFilter === day ? '#EBF4FF' : '#FFFFFF',
                color: selectedDayFilter === day ? '#0066FF' : '#4E5968',
                fontSize: '11.5px',
                fontWeight: selectedDayFilter === day ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              8월 {day}일 ({day === 2 ? '일' : day === 3 ? '월' : day === 7 ? '금' : day === 14 ? '금' : day === 19 ? '수' : '평일'})
            </button>
          ))}
        </div>

        {/* 4. 근무/휴가 조건 필터 칩 */}
        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto' }}>
          {[
            { id: 'ALL', label: '전체 유형' },
            { id: 'NORMAL', label: '정상근무' },
            { id: 'VACATION', label: '휴가·공백' },
            { id: 'BUSINESS_TRIP', label: '외근·출장' },
            { id: 'OVERTIME', label: '연장근무' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedWorkType(type.id)}
              style={{
                padding: '4px 9px',
                borderRadius: '14px',
                border: selectedWorkType === type.id ? '1px solid #191F28' : '1px solid #ECEFF2',
                background: selectedWorkType === type.id ? '#191F28' : '#F8F9FA',
                color: selectedWorkType === type.id ? '#FFFFFF' : '#6B7684',
                fontSize: '11.5px',
                fontWeight: selectedWorkType === type.id ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* 철학 가이드 배너 (스크린샷 일치) */}
      {!isSiteManager && (
        <div style={{
          background: '#FFF9F5',
          borderBottom: '1px solid #FFE8D6',
          padding: '8px 18px',
          fontSize: '12px',
          color: '#D9480F',
          fontWeight: 600
        }}>
          🛡️ <strong>노란봉투법 & 파견법 개인정보 분리 원칙</strong>: 협력사 일반 직원은 본인 일정만 조회되며, 타사 직원의 일정은 격리됩니다.
        </div>
      )}

      {/* 5. 뷰 모드별 렌더링 (타임라인 목록형 vs 달력 그리드형) */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '90px' }}>
        
        {viewMode === 'timeline' ? (
          /* [A] 타임라인 목록형 뷰 (스크린샷 100% 일치) */
          <div>
            {Object.keys(groupedByDate).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#8B95A1', fontSize: '13.5px' }}>
                <Calendar size={36} color="#CED4DA" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                선택하신 조건(일자/유형)에 해당하는 일정이 없습니다.
              </div>
            ) : (
              Object.entries(groupedByDate).map(([dateLabel, group]) => (
                <div key={dateLabel} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* 일자 헤더 바 (스크린샷 일치: 2026년 8월 3일, 월 296시간 30분) */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 18px',
                    background: '#F8F9FA',
                    borderBottom: '1px solid #ECEFF2',
                    fontSize: '13.5px',
                    fontWeight: 800
                  }}>
                    <span style={{ color: group.isWeekend ? '#F04438' : '#191F28' }}>
                      {dateLabel}
                    </span>
                    <span style={{ color: '#191F28' }}>
                      {group.totalHours}
                    </span>
                  </div>

                  {/* 해당 일자의 일정 항목들 */}
                  {group.items.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid #ECEFF2',
                        display: 'flex',
                        alignItems: 'center',
                        background: '#FFFFFF'
                      }}
                    >
                      {/* 1) 일반 근무 항목 (민트 바 + 시간 + 사원 정보 + 체크) */}
                      {item.startTime && !item.vacationType ? (
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            {/* 시간 */}
                            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#191F28', textAlign: 'center', minWidth: '45px', lineHeight: 1.2 }}>
                              {item.startTime}<br />{item.endTime}
                            </div>

                            {/* 민트 바 */}
                            <div style={{ width: '3.5px', height: '36px', background: '#00C7AE', borderRadius: '2px' }} />

                            {/* 이름 및 부서 */}
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', marginBottom: '2px' }}>
                                {item.userName}
                              </div>
                              <div style={{ fontSize: '12.5px', color: '#6B7684', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>📄 / {item.deptName} / {item.position}</span>
                              </div>
                            </div>
                          </div>

                          {/* 체크 아이콘 */}
                          {item.isVerified && (
                            <CheckCircle2 size={18} color="#00C7AE" />
                          )}
                        </div>
                      ) : (
                        /* 2) 비행기 아이콘 휴가 항목 (스크린샷 일치) */
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ color: '#0066FF', display: 'flex', alignItems: 'center' }}>
                            <Plane size={18} fill="#0066FF" />
                          </div>
                          <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#191F28' }}>
                            {item.userName} / {item.vacationType} {item.startTime ? `${item.startTime} - ${item.endTime}` : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        ) : (
          /* [B] 캘린더 그리드형 뷰 */
          <div style={{ padding: '16px' }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #ECEFF2',
              padding: '12px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
            }}>
              {/* 요일 헤더 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px', fontSize: '12px', fontWeight: 800 }}>
                <div style={{ color: '#F04438' }}>일</div>
                <div style={{ color: '#191F28' }}>월</div>
                <div style={{ color: '#191F28' }}>화</div>
                <div style={{ color: '#191F28' }}>수</div>
                <div style={{ color: '#191F28' }}>목</div>
                <div style={{ color: '#191F28' }}>금</div>
                <div style={{ color: '#0066FF' }}>토</div>
              </div>

              {/* 일자 그리드 셀 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ minHeight: '52px', background: '#F8F9FA', borderRadius: '6px' }} />
                ))}

                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const dayStr = day < 10 ? `0${day}` : `${day}`;
                  const dateStr = `2026-08-${dayStr}`;
                  const dayEntries = filteredEntries.filter(e => e.workDate === dateStr);
                  const hasVacation = dayEntries.some(e => e.vacationType);
                  const isWeekend = (i + 6) % 7 === 0 || (i + 6) % 7 === 6;
                  const isSelected = selectedDayFilter === day;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => {
                        setSelectedDayFilter(isSelected ? 'ALL' : day);
                        setViewMode('timeline');
                      }}
                      style={{
                        minHeight: '52px',
                        padding: '4px',
                        borderRadius: '6px',
                        border: isSelected ? '2px solid #0066FF' : '1px solid #ECEFF2',
                        background: isSelected ? '#EBF4FF' : hasVacation ? '#FFF9F5' : isWeekend ? '#F8F9FA' : '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: isWeekend ? '#F04438' : '#191F28'
                      }}>
                        {day}
                      </div>

                      {dayEntries.length > 0 && !isWeekend && (
                        <div style={{
                          fontSize: '9.5px',
                          padding: '1px 2px',
                          borderRadius: '3px',
                          background: hasVacation ? '#FF462D' : '#0066FF',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {hasVacation ? '휴가' : `${dayEntries.length}명`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. 우측 하단 플로팅 종이비행기 버튼 (스크린샷 일치) */}
      <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 90 }}>
        <button
          onClick={onOpenNewScheduleRequest}
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF',
            boxShadow: '0 4px 16px rgba(0, 102, 255, 0.35)',
            border: 'none',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="근무일정 요청 작성"
        >
          <Send size={22} style={{ transform: 'translate(1px, -1px)' }} />
        </button>
      </div>
    </div>
  );
};
