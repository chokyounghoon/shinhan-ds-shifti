import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldAlert, 
  Building2,
  Send,
  Search,
  Filter,
  Palmtree,
  Plane,
  UserCheck
} from 'lucide-react';
import { formatKstDateTime } from '../utils/dateUtils';

interface DsLateAttendanceCalendarProps {
  themeMode?: 'ddangyo' | 'shinhan';
  onDemandClarification?: (worker: any) => void;
  onApproveClarification?: (clarId: string) => void;
  onApproveVacation?: (vacId: string) => void;
}

export interface LateWorkerDetail {
  id: string;
  employeeId: string;
  workerName: string;
  companyName: string;
  partName: string;
  workDate: string;
  scheduledTime: string;
  clockInTime: string;
  delayMinutes: number;
  clarificationStatus: 'UNSUBMITTED' | 'PENDING_PARTNER' | 'PENDING_DS' | 'APPROVED' | 'REJECTED';
  clarificationId?: string;
  clarificationReason?: string;
  clarificationSubmittedAt?: string;
  partnerApproverName?: string;
  partnerApprovedAt?: string;
  dsApprovedAt?: string;
}

export interface VacationWorkerDetail {
  id: string;
  employeeId: string;
  workerName: string;
  companyName: string;
  partName: string;
  vacationType: string;
  targetDate: string;
  reason: string;
  status: 'PENDING_PARTNER' | 'PENDING_DS' | 'APPROVED' | 'REJECTED';
  manDays: number;
  submittedAt?: string;
  partnerApproverName?: string;
  dsApproverName?: string;
}

export const DsLateAttendanceCalendar: React.FC<DsLateAttendanceCalendarProps> = ({
  themeMode = 'shinhan',
  onDemandClarification,
  onApproveClarification,
  onApproveVacation
}) => {
  const primaryColor = themeMode === 'ddangyo' ? '#FF462D' : '#0052FF';

  const today = new Date();
  const realYear = today.getFullYear();
  const realMonth = today.getMonth() + 1;
  const realDay = today.getDate();

  const [currentYear, setCurrentYear] = useState<number>(realYear);
  const [currentMonth, setCurrentMonth] = useState<number>(realMonth);
  const [selectedDay, setSelectedDay] = useState<number>(realDay);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'LATE' | 'VACATION'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // D1 DB 실시간 데이터 상태
  const [commuteLogs, setCommuteLogs] = useState<any[]>([]);
  const [clarifications, setClarifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [manpowerRecords, setManpowerRecords] = useState<any[]>([]);
  const [vacationRequests, setVacationRequests] = useState<any[]>([]);
  const [preGapNotices, setPreGapNotices] = useState<any[]>([]);

  // D1 DB 당월 데이터 실시간 조회
  const fetchData = async () => {
    setIsRefreshing(true);
    const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    try {
      const [logsRes, clarRes, usersRes, manRes, vacRes, gapRes] = await Promise.all([
        fetch(`/api/commute/logs?month=${monthStr}`),
        fetch(`/api/clarification-requests`),
        fetch(`/api/users`),
        fetch(`/api/manpower`),
        fetch(`/api/attendance/requests`),
        fetch(`/api/pre-gap-notices`)
      ]);

      if (logsRes.ok) {
        const j = await logsRes.json();
        setCommuteLogs(j.data || []);
      }
      if (clarRes.ok) {
        const j = await clarRes.json();
        setClarifications(j.data || []);
      }
      if (usersRes.ok) {
        const j = await usersRes.json();
        setUsers(j.data || []);
      }
      if (manRes.ok) {
        const j = await manRes.json();
        setManpowerRecords(j.data || []);
      }
      if (vacRes.ok) {
        const j = await vacRes.json();
        setVacationRequests(j.data || []);
      }
      if (gapRes.ok) {
        const j = await gapRes.json();
        setPreGapNotices(j.data || []);
      }
    } catch (e) {
      console.warn('Failed to fetch late attendance & vacation calendar data:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentYear, currentMonth]);

  // 협력사 목록 동적 추출
  const partnerCompanies = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => {
      if (u.company && u.company !== '신한DS') set.add(u.company);
    });
    commuteLogs.forEach(l => {
      if (l.company_name && l.company_name !== '신한DS') set.add(l.company_name);
    });
    return Array.from(set);
  }, [users, commuteLogs]);

  // 당월 일자별 지각자 및 소명 매핑 데이터 구축
  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  // 1. 일자별 지각자 매핑
  const lateDataByDay = useMemo(() => {
    const map: Record<number, LateWorkerDetail[]> = {};

    // commute_logs 분석 (09:00 이후 타각이거나 status가 LATE인 경우)
    commuteLogs.forEach((log: any) => {
      if (!log.work_date || !log.work_date.startsWith(monthPrefix)) return;
      const dayNum = parseInt(log.work_date.split('-')[2], 10);
      if (isNaN(dayNum)) return;

      const clockIn = log.clock_in_time || '';
      let isLate = log.status === 'LATE';
      let delayMinutes = 0;

      if (clockIn && clockIn > '09:00') {
        isLate = true;
        const [h, m] = clockIn.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          delayMinutes = Math.max(0, (h - 9) * 60 + m);
        }
      }

      if (!isLate && log.status !== 'MISSING_PUNCH') return;

      const user = users.find(u => u.employee_id === log.employee_id || u.id === log.employee_id);
      const company = log.company_name || user?.company || '유브갓';
      const workerName = log.user_name || user?.name || '근로자';
      const partName = user?.part || log.part_name || '상담';

      const clar = clarifications.find((c: any) => 
        (c.incident_date === log.work_date || c.incidentDate === log.work_date) &&
        (c.employee_id === log.employee_id || c.employeeId === log.employee_id || c.worker_name === workerName)
      );

      let clarStatus: LateWorkerDetail['clarificationStatus'] = 'UNSUBMITTED';
      if (clar) {
        clarStatus = clar.status;
      }

      if (!map[dayNum]) map[dayNum] = [];
      
      if (!map[dayNum].some(d => d.employeeId === log.employee_id)) {
        map[dayNum].push({
          id: log.id || `late-${dayNum}-${log.employee_id}`,
          employeeId: log.employee_id,
          workerName,
          companyName: company,
          partName,
          workDate: log.work_date,
          scheduledTime: '09:00 ~ 18:00',
          clockInTime: clockIn || '미타각',
          delayMinutes: delayMinutes || 30,
          clarificationStatus: clarStatus,
          clarificationId: clar?.id,
          clarificationReason: clar?.reason || clar?.memo,
          clarificationSubmittedAt: clar?.created_at,
          partnerApproverName: clar?.partner_approver_name,
          partnerApprovedAt: clar?.partner_approved_at,
          dsApprovedAt: clar?.ds_approved_at
        });
      }
    });

    // manpower_inputs 중 variance_minutes > 0 또는 is_sla_breach인 경우도 통합
    manpowerRecords.forEach((m: any) => {
      if (!m.work_date || !m.work_date.startsWith(monthPrefix)) return;
      const dayNum = parseInt(m.work_date.split('-')[2], 10);
      if (isNaN(dayNum)) return;

      const hasBreach = m.is_sla_breach === 1 || m.is_sla_breach === true || (m.variance_minutes && m.variance_minutes > 0);
      if (!hasBreach) return;

      if (!map[dayNum]) map[dayNum] = [];
      const exists = map[dayNum].some(d => d.employeeId === m.employee_id || d.workerName === m.worker_name);
      if (!exists) {
        const clar = clarifications.find((c: any) => 
          (c.incident_date === m.work_date) &&
          (c.employee_id === m.employee_id || c.worker_name === m.worker_name)
        );

        map[dayNum].push({
          id: m.record_id || `man-${m.employee_id}`,
          employeeId: m.employee_id || 'EMP-UNKNOWN',
          workerName: m.worker_name || '근로자',
          companyName: m.partner_company || '협력사',
          partName: m.part_name || '상담',
          workDate: m.work_date,
          scheduledTime: '09:00 ~ 18:00',
          clockInTime: m.clock_in_time || '09:15',
          delayMinutes: Number(m.variance_minutes) || 15,
          clarificationStatus: clar ? clar.status : 'UNSUBMITTED',
          clarificationId: clar?.id,
          clarificationReason: clar?.reason || m.gap_reason,
          clarificationSubmittedAt: clar?.created_at
        });
      }
    });

    return map;
  }, [commuteLogs, clarifications, users, manpowerRecords, monthPrefix]);

  // 2. 일자별 휴가/공백자 매핑 (attendance_requests + pre_gap_notices)
  const vacationDataByDay = useMemo(() => {
    const map: Record<number, VacationWorkerDetail[]> = {};

    // A. attendance_requests
    vacationRequests.forEach((req: any) => {
      const isVac = req.request_type === 'VACATION' || req.vacation_type || req.type === 'VACATION';
      if (!isVac) return;

      const target = req.target_date || req.start_date || req.work_date || '';
      const datesToApply: string[] = [];

      if (target.includes('~')) {
        const [startStr, endStr] = target.split('~').map((s: string) => s.trim());
        try {
          const s = new Date(startStr);
          const e = new Date(endStr);
          for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
            datesToApply.push(d.toISOString().slice(0, 10));
          }
        } catch (_) {
          datesToApply.push(startStr);
        }
      } else if (target) {
        datesToApply.push(target);
      }

      datesToApply.forEach(dateStr => {
        if (!dateStr.startsWith(monthPrefix)) return;
        const dayNum = parseInt(dateStr.split('-')[2], 10);
        if (isNaN(dayNum)) return;

        const user = users.find(u => u.employee_id === req.employee_id || u.name === req.user_name || u.id === req.employee_id);
        const company = req.company_name || req.company || user?.company || '유브갓';
        const workerName = req.user_name || req.userName || user?.name || '근로자';
        const partName = user?.part || req.part_name || '상담';

        if (!map[dayNum]) map[dayNum] = [];
        if (!map[dayNum].some(v => v.employeeId === req.employee_id && v.vacationType === (req.vacation_type || '연차'))) {
          map[dayNum].push({
            id: req.id || `vac-${dayNum}-${req.employee_id}`,
            employeeId: req.employee_id || user?.employee_id || 'EMP-UNKNOWN',
            workerName,
            companyName: company,
            partName,
            vacationType: req.vacation_type || '연차 (휴가)',
            targetDate: dateStr,
            reason: req.reason || '사전 통보 승인 휴가',
            status: req.status || 'APPROVED',
            manDays: req.vacation_type?.includes('반차') ? 0.5 : 0.0,
            submittedAt: req.created_at,
            partnerApproverName: req.partner_approver_name || req.approver_name,
            dsApproverName: req.ds_approver_name
          });
        }
      });
    });

    // B. pre_gap_notices
    preGapNotices.forEach((gap: any) => {
      const dateStr = gap.target_date || gap.gap_date || '';
      if (!dateStr.startsWith(monthPrefix)) return;
      const dayNum = parseInt(dateStr.split('-')[2], 10);
      if (isNaN(dayNum)) return;

      const user = users.find(u => u.employee_id === gap.employee_id || u.name === gap.worker_name);
      const company = gap.partner_company || user?.company || '유브갓';
      const workerName = gap.worker_name || user?.name || '근로자';
      const partName = gap.part_name || user?.part || '상담';

      if (!map[dayNum]) map[dayNum] = [];
      if (!map[dayNum].some(v => v.employeeId === gap.employee_id)) {
        map[dayNum].push({
          id: gap.notice_id || `gap-${dayNum}-${gap.employee_id}`,
          employeeId: gap.employee_id || 'EMP-UNKNOWN',
          workerName,
          companyName: company,
          partName,
          vacationType: gap.gap_type || '사전 공백 통보',
          targetDate: dateStr,
          reason: gap.reason || '도급 인력 공백 사전 통지서',
          status: gap.status || 'APPROVED',
          manDays: 0.0,
          submittedAt: gap.created_at
        });
      }
    });

    return map;
  }, [vacationRequests, preGapNotices, users, monthPrefix]);

  // 달력 날짜 계산
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ isCurrentMonth: false, day: 0 });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ isCurrentMonth: true, day: d });
    }
    return cells;
  }, [daysInMonth, firstDayOfWeek]);

  // 당월 통계 집계 (지각 + 휴가 통합)
  const monthlyStats = useMemo(() => {
    let totalLate = 0;
    let pendingDs = 0;
    let approved = 0;
    let unsubmitted = 0;
    let totalVacations = 0;

    Object.values(lateDataByDay).forEach(list => {
      list.forEach(item => {
        if (selectedCompanyFilter !== 'ALL' && item.companyName !== selectedCompanyFilter) return;
        totalLate++;
        if (item.clarificationStatus === 'APPROVED') approved++;
        else if (item.clarificationStatus === 'PENDING_DS' || item.clarificationStatus === 'PENDING_PARTNER') pendingDs++;
        else unsubmitted++;
      });
    });

    Object.values(vacationDataByDay).forEach(list => {
      list.forEach(item => {
        if (selectedCompanyFilter !== 'ALL' && item.companyName !== selectedCompanyFilter) return;
        totalVacations++;
      });
    });

    return { totalLate, pendingDs, approved, unsubmitted, totalVacations };
  }, [lateDataByDay, vacationDataByDay, selectedCompanyFilter]);

  // 선택된 날짜의 지각자 및 휴가자 목록
  const selectedDayLateList = useMemo(() => {
    const list = lateDataByDay[selectedDay] || [];
    return list.filter(item => {
      if (selectedCompanyFilter !== 'ALL' && item.companyName !== selectedCompanyFilter) return false;
      if (selectedStatusFilter !== 'ALL' && item.clarificationStatus !== selectedStatusFilter) return false;
      return true;
    });
  }, [lateDataByDay, selectedDay, selectedCompanyFilter, selectedStatusFilter]);

  const selectedDayVacationList = useMemo(() => {
    const list = vacationDataByDay[selectedDay] || [];
    return list.filter(item => {
      if (selectedCompanyFilter !== 'ALL' && item.companyName !== selectedCompanyFilter) return false;
      return true;
    });
  }, [vacationDataByDay, selectedDay, selectedCompanyFilter]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getStatusBadge = (status: LateWorkerDetail['clarificationStatus']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span style={{
            background: '#DCFCE7',
            color: '#15803D',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <CheckCircle2 size={12} /> 최종 소명 승인완료
          </span>
        );
      case 'PENDING_DS':
        return (
          <span style={{
            background: '#EFF6FF',
            color: '#1D4ED8',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Clock size={12} /> 협력사 1차 승인 (DS 검수대기)
          </span>
        );
      case 'PENDING_PARTNER':
        return (
          <span style={{
            background: '#FEF3C7',
            color: '#B45309',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Clock size={12} /> 협력사 1차 검토 중
          </span>
        );
      case 'REJECTED':
        return (
          <span style={{
            background: '#FEE2E2',
            color: '#B91C1C',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <AlertTriangle size={12} /> 소명 반려됨
          </span>
        );
      default:
        return (
          <span style={{
            background: '#FEF2F2',
            color: '#DC2626',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            border: '1px solid #FECACA'
          }}>
            <ShieldAlert size={12} /> 소명서 미제출 (지각 결손)
          </span>
        );
    }
  };

  const getVacationStatusBadge = (status: VacationWorkerDetail['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span style={{
            background: '#DCFCE7',
            color: '#15803D',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <CheckCircle2 size={12} /> 사전 승인 완료
          </span>
        );
      case 'PENDING_DS':
        return (
          <span style={{
            background: '#EFF6FF',
            color: '#1D4ED8',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Clock size={12} /> DS 검수 확인 대기
          </span>
        );
      case 'PENDING_PARTNER':
        return (
          <span style={{
            background: '#FEF3C7',
            color: '#B45309',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Clock size={12} /> 협력사 1차 결재 중
          </span>
        );
      default:
        return (
          <span style={{
            background: '#F1F5F9',
            color: '#475569',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800
          }}>
            처리 완료
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* 1. 상단 타이틀 및 월간 통계 대시보드 */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '18px 20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#EFF6FF',
                color: primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CalendarIcon size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#0F172A' }}>
                협력사 지각자 및 휴가·공백 통합 캘린더
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 40px', fontSize: '12px', color: '#64748B' }}>
              일자별 지각 인원(소명 이행 여부) 및 사전 승인된 휴가(연차/병가/공가) 공백 현황을 한눈에 통합 관제합니다.
            </p>
          </div>

          {/* 월 이동 및 필터 컨트롤 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* 협력사 필터 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', padding: '4px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
              <Building2 size={13} color="#64748B" />
              <select
                value={selectedCompanyFilter}
                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#1E293B',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">전체 협력사</option>
                {partnerCompanies.map(comp => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>

            {/* 월 네비게이터 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', padding: '4px 8px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#475569' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', minWidth: '85px', textAlign: 'center' }}>
                {currentYear}년 {currentMonth}월
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#475569' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* 새로고침 */}
            <button
              type="button"
              onClick={fetchData}
              title="D1 실시간 데이터 새로고침"
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#475569'
              }}
            >
              <RefreshCw size={13} className={isRefreshing ? 'spin-icon' : ''} />
              <span>새로고침</span>
            </button>
          </div>
        </div>

        {/* 5대 KPI 요약 카드 (휴가 포함) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '16px' }}>
          <div style={{ background: '#FFF1F2', padding: '12px', borderRadius: '10px', border: '1px solid #FECDD3' }}>
            <div style={{ fontSize: '11px', color: '#BE123C', fontWeight: 700 }}>🚨 당월 총 지각/결손</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#9F1239', marginTop: '2px' }}>
              {monthlyStats.totalLate} <span style={{ fontSize: '12px', fontWeight: 600 }}>건</span>
            </div>
          </div>

          <div style={{ background: '#F0F9FF', padding: '12px', borderRadius: '10px', border: '1px solid #BAE6FD' }}>
            <div style={{ fontSize: '11px', color: '#0369A1', fontWeight: 700 }}>🏖️ 당월 총 휴가/공백</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0C4A6E', marginTop: '2px' }}>
              {monthlyStats.totalVacations} <span style={{ fontSize: '12px', fontWeight: 600 }}>건</span>
            </div>
          </div>

          <div style={{ background: '#EFF6FF', padding: '12px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: '11px', color: '#1D4ED8', fontWeight: 700 }}>⏳ 소명 검수 대기</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#1E40AF', marginTop: '2px' }}>
              {monthlyStats.pendingDs} <span style={{ fontSize: '12px', fontWeight: 600 }}>건</span>
            </div>
          </div>

          <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: '11px', color: '#15803D', fontWeight: 700 }}>✅ 최종 소명 승인</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#166534', marginTop: '2px' }}>
              {monthlyStats.approved} <span style={{ fontSize: '12px', fontWeight: 600 }}>건</span>
            </div>
          </div>

          <div style={{ background: '#FEF2F2', padding: '12px', borderRadius: '10px', border: '1px solid #FECACA' }}>
            <div style={{ fontSize: '11px', color: '#B91C1C', fontWeight: 700 }}>⚠️ 미소명/미처리 건</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#991B1B', marginTop: '2px' }}>
              {monthlyStats.unsubmitted} <span style={{ fontSize: '12px', fontWeight: 600 }}>건</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 월간 캘린더 그리드 */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        {/* 요일 헤더 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
          {['일', '월', '화', '수', '목', '금', '토'].map((dow, idx) => (
            <div
              key={dow}
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: idx === 0 ? '#EF4444' : idx === 6 ? '#2563EB' : '#64748B',
                padding: '4px 0'
              }}
            >
              {dow}
            </div>
          ))}
        </div>

        {/* 날짜 셀 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {calendarCells.map((cell, idx) => {
            if (!cell.isCurrentMonth || !cell.day) {
              return (
                <div key={`empty-${idx}`} style={{ minHeight: '82px', background: '#FAFAFA', borderRadius: '8px', opacity: 0.2 }} />
              );
            }

            const day = cell.day;
            const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isToday = currentYear === realYear && currentMonth === realMonth && day === realDay;
            const isSelected = selectedDay === day;
            
            const lateList = lateDataByDay[day] || [];
            const lateCount = lateList.length;

            const vacationList = vacationDataByDay[day] || [];
            const vacCount = vacationList.length;

            return (
              <div
                key={`day-${day}`}
                onClick={() => setSelectedDay(day)}
                style={{
                  minHeight: '84px',
                  background: isSelected 
                    ? '#EFF6FF' 
                    : isToday 
                      ? '#F0FDF4' 
                      : lateCount > 0 
                        ? '#FFF5F5' 
                        : vacCount > 0 
                          ? '#F0F9FF' 
                          : '#FFFFFF',
                  borderRadius: '10px',
                  border: isSelected 
                    ? `2px solid ${primaryColor}` 
                    : isToday 
                      ? '1.5px solid #16A34A' 
                      : lateCount > 0 
                        ? '1px solid #FECDD3' 
                        : vacCount > 0 
                          ? '1px solid #BAE6FD' 
                          : '1px solid #E2E8F0',
                  padding: '6px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                {/* 날짜 상단 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: isToday || isSelected ? 900 : 700,
                    color: isToday ? '#15803D' : dayOfWeek === 0 ? '#EF4444' : dayOfWeek === 6 ? '#2563EB' : '#191F28'
                  }}>
                    {day}
                  </span>
                  {isToday && (
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#15803D', background: '#DCFCE7', padding: '1px 4px', borderRadius: '4px' }}>
                      오늘
                    </span>
                  )}
                </div>

                {/* 지각 및 휴가 뱃지 영역 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                  {lateCount > 0 && (
                    <div style={{
                      background: '#FEE2E2',
                      color: '#B91C1C',
                      fontSize: '9.5px',
                      fontWeight: 800,
                      padding: '1.5px 3px',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}>
                      🚨 지각 {lateCount}명
                    </div>
                  )}

                  {vacCount > 0 && (
                    <div style={{
                      background: '#E0F2FE',
                      color: '#0369A1',
                      fontSize: '9.5px',
                      fontWeight: 800,
                      padding: '1.5px 3px',
                      borderRadius: '4px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2px'
                    }}>
                      <Plane size={9} /> 휴가 {vacCount}명
                    </div>
                  )}

                  {lateCount === 0 && vacCount === 0 && (
                    isWeekend ? (
                      <span style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>휴무</span>
                    ) : (
                      <span style={{ fontSize: '10px', color: '#CBD5E1', textAlign: 'center', fontWeight: 600 }}>정상</span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 선택된 일자 상세 현황 테이블 (지각자 & 휴가자 탭 분기) */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        {/* 테이블 헤더 바 & 서브 탭 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '15.5px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📅 {currentMonth}월 {selectedDay}일 상세 현황</span>
              <span style={{
                background: '#EFF6FF',
                color: '#1D4ED8',
                fontSize: '12px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                지각 {selectedDayLateList.length}명 / 휴가 {selectedDayVacationList.length}명
              </span>
            </h4>
          </div>

          {/* 서브 탭 필터 (전체 / 지각자 / 휴가자) */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
            <button
              type="button"
              onClick={() => setActiveSubTab('ALL')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeSubTab === 'ALL' ? '#FFFFFF' : 'transparent',
                color: activeSubTab === 'ALL' ? '#0F172A' : '#64748B',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: activeSubTab === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              전체 ({selectedDayLateList.length + selectedDayVacationList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('LATE')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeSubTab === 'LATE' ? '#FFFFFF' : 'transparent',
                color: activeSubTab === 'LATE' ? '#DC2626' : '#64748B',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: activeSubTab === 'LATE' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              🚨 지각·소명 ({selectedDayLateList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('VACATION')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeSubTab === 'VACATION' ? '#FFFFFF' : 'transparent',
                color: activeSubTab === 'VACATION' ? '#0284C7' : '#64748B',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: activeSubTab === 'VACATION' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              🏖️ 휴가·공백 ({selectedDayVacationList.length})
            </button>
          </div>
        </div>

        {/* 1. 지각자 목록 테이블 */}
        {(activeSubTab === 'ALL' || activeSubTab === 'LATE') && (
          <div style={{ marginBottom: activeSubTab === 'ALL' && selectedDayVacationList.length > 0 ? '24px' : '0' }}>
            {activeSubTab === 'ALL' && (
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#991B1B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={14} /> 🚨 지각 발생 및 소명 이행 현황 ({selectedDayLateList.length}명)
              </div>
            )}

            {selectedDayLateList.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '24px 0',
                background: '#F8FAFC',
                borderRadius: '10px',
                border: '1px dashed #CBD5E1',
                fontSize: '12.5px',
                color: '#64748B'
              }}>
                해당 일자에는 지각자가 없습니다 (정상 투입).
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', color: '#334155', textAlign: 'left', borderBottom: '2px solid #CBD5E1' }}>
                      <th style={{ padding: '9px 10px', fontWeight: 800 }}>협력사</th>
                      <th style={{ padding: '9px 10px', fontWeight: 800 }}>성명 (사번)</th>
                      <th style={{ padding: '9px 10px', fontWeight: 800 }}>소속 공정</th>
                      <th style={{ padding: '9px 10px', fontWeight: 800 }}>실제 타각 (결손)</th>
                      <th style={{ padding: '9px 10px', fontWeight: 800 }}>소명 처리 상태</th>
                      <th style={{ padding: '9px 10px', fontWeight: 800 }}>소명 사유 및 증빙</th>
                      <th style={{ padding: '9px 10px', fontWeight: 800, textAlign: 'center' }}>조치 / 관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDayLateList.map((item, idx) => (
                      <tr key={item.id || idx} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                        <td style={{ padding: '10px', fontWeight: 700 }}>
                          <span style={{ background: '#E2E8F0', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                            {item.companyName}
                          </span>
                        </td>
                        <td style={{ padding: '10px', fontWeight: 800, color: '#0F172A' }}>
                          {item.workerName}
                          <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 500 }}>{item.employeeId}</span>
                        </td>
                        <td style={{ padding: '10px', color: '#475569', fontWeight: 600 }}>{item.partName}</td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ color: '#DC2626', fontWeight: 800 }}>{item.clockInTime}</div>
                          <div style={{ fontSize: '11px', color: '#EF4444', fontWeight: 700 }}>({item.delayMinutes}분 결손)</div>
                        </td>
                        <td style={{ padding: '10px' }}>{getStatusBadge(item.clarificationStatus)}</td>
                        <td style={{ padding: '10px', maxWidth: '240px' }}>
                          {item.clarificationReason ? (
                            <div>
                              <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 600, lineHeight: 1.35 }}>"{item.clarificationReason}"</div>
                              {item.clarificationSubmittedAt && (
                                <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>제출: {formatKstDateTime(item.clarificationSubmittedAt)}</div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '11.5px', color: '#94A3B8', fontStyle: 'italic' }}>소명서 미제출</span>
                          )}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {item.clarificationStatus === 'PENDING_DS' ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (onApproveClarification && item.clarificationId) {
                                  onApproveClarification(item.clarificationId);
                                } else {
                                  alert(`✅ [DS 최종 승인] ${item.workerName}님의 소명서가 승인되었습니다.`);
                                }
                              }}
                              style={{ background: '#0052FF', color: '#FFFFFF', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
                            >
                              최종 승인
                            </button>
                          ) : item.clarificationStatus === 'UNSUBMITTED' ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (onDemandClarification) {
                                  onDemandClarification({
                                    name: item.workerName,
                                    employee_id: item.employeeId,
                                    company: item.companyName,
                                    part: item.partName,
                                    delayMinutes: item.delayMinutes,
                                    workDate: item.workDate
                                  });
                                } else {
                                  alert(`📨 [소명 요구 공문 발송] ${item.companyName} 현장대리인 앞으로 ${item.workerName}님의 지각 소명서 제출 요구가 발송되었습니다.`);
                                }
                              }}
                              style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
                            >
                              소명 요구
                            </button>
                          ) : item.clarificationStatus === 'APPROVED' ? (
                            <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 800 }}>✓ 승인 완료</span>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>검토 대기</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2. 휴가자 목록 테이블 */}
        {(activeSubTab === 'ALL' || activeSubTab === 'VACATION') && (
          <div>
            {activeSubTab === 'ALL' && (
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0369A1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plane size={14} /> 🏖️ 사전 승인된 휴가 및 공백 인력 현황 ({selectedDayVacationList.length}명)
              </div>
            )}

            {selectedDayVacationList.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '24px 0',
                background: '#F8FAFC',
                borderRadius: '10px',
                border: '1px dashed #CBD5E1',
                fontSize: '12.5px',
                color: '#64748B'
              }}>
                해당 일자에는 휴가자가 없습니다.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#F0F9FF', color: '#0369A1', textAlign: 'left', borderBottom: '2px solid #BAE6FD' }}>
                      <th style={{ padding: '9px 10px', fontWeight: 800 }}>협력사</th>
                      <th style={{ padding: '9px 10px', fontWeight: 800 }}>성명 (사번)</th>
                      <th style={{ padding: '9px 10px', fontWeight: 800 }}>소속 공정</th>
                      <th style={{ padding: '9px 10px', fontWeight: 800 }}>휴가 구분</th>
                      <th style={{ padding: '9px 10px', fontWeight: 800 }}>공수 영향</th>
                      <th style={{ padding: '9px 10px', fontWeight: 800 }}>결재 상태</th>
                      <th style={{ padding: '9px 10px', fontWeight: 800 }}>휴가 사유 및 통보 내역</th>
                      <th style={{ padding: '9px 10px', fontWeight: 800, textAlign: 'center' }}>DS 확인</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDayVacationList.map((item, idx) => (
                      <tr key={item.id || idx} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                        <td style={{ padding: '10px', fontWeight: 700 }}>
                          <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                            {item.companyName}
                          </span>
                        </td>
                        <td style={{ padding: '10px', fontWeight: 800, color: '#0F172A' }}>
                          {item.workerName}
                          <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 500 }}>{item.employeeId}</span>
                        </td>
                        <td style={{ padding: '10px', color: '#475569', fontWeight: 600 }}>{item.partName}</td>
                        <td style={{ padding: '10px', fontWeight: 800, color: '#0284C7' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Plane size={12} /> {item.vacationType}
                          </span>
                        </td>
                        <td style={{ padding: '10px', fontWeight: 800, color: '#64748B' }}>
                          {item.manDays} M/D
                        </td>
                        <td style={{ padding: '10px' }}>{getVacationStatusBadge(item.status)}</td>
                        <td style={{ padding: '10px', maxWidth: '240px' }}>
                          <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>"{item.reason}"</div>
                          {item.partnerApproverName && (
                            <div style={{ fontSize: '10.5px', color: '#0369A1', marginTop: '2px' }}>
                              협력사 승인: {item.partnerApproverName}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle2 size={13} /> 공백 검수완료
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
