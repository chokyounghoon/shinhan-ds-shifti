import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ChevronDown, Send, CheckCircle2, MapPin, Clock } from 'lucide-react';
import { User, DayGroupedCommuteLogs, CommuteLogItem } from '../types';
import { dbService } from '../services/db';

export interface CommuteLogEntry {
  id: string;
  userId: string;
  userName: string;
  deptName: string;
  position: string;
  workDate: string;
  dateGroupLabel: string;
  totalGroupHours: string;
  clockInTime: string;
  clockOutTime: string;
  locationName?: string;
  isVerified?: boolean;
}

interface LogsViewProps {
  user: User;
  themeMode: 'ddangyo' | 'shinhan';
  onOpenNewPunchRequest: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({
  user,
  themeMode,
  onOpenNewPunchRequest
}) => {
  const isSiteManager = user.role === 'PARTNER_SITE_MANAGER' || user.role === 'DS_PRINCIPAL_PM';
  const [viewScope, setViewScope] = useState<'my' | 'all'>(isSiteManager ? 'all' : 'my');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('08.01 - 08.31');
  const [d1Logs, setD1Logs] = useState<CommuteLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cloudflare D1 DB에서 실시간 출퇴근/투입 기록 조회
  const fetchD1CommuteLogs = async () => {
    setIsLoading(true);
    try {
      const empId = user.employeeId || (user as any).id || 'S01832';
      const url = isSiteManager && viewScope === 'all'
        ? 'https://sguardai.khcho0421.workers.dev/commute/today'
        : `https://sguardai.khcho0421.workers.dev/commute/logs?employee_id=${encodeURIComponent(empId)}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const rows = json.data || [];
        const mapped: CommuteLogEntry[] = rows.map((r: any) => ({
          id: r.id || `log-${r.employee_id}-${r.work_date}`,
          userId: r.employee_id,
          userName: r.worker_name || user.name || '조경훈',
          deptName: r.part || r.team || user.partName || '상담',
          position: r.position || user.position || '수석',
          workDate: r.work_date,
          dateGroupLabel: `${r.work_date} (도급 투입 확정)`,
          totalGroupHours: '8시간 0분 (1 M/D)',
          clockInTime: r.clock_in_time || '08:50',
          clockOutTime: r.clock_out_time || '18:00',
          locationName: r.location_name || '파인에비뉴(카드)',
          isVerified: true
        }));

        // 만약 오늘 출근 기록이 D1에 있고 기존 목록과 병합
        setD1Logs(mapped);
      }
    } catch (e) {
      console.warn('Failed to fetch D1 commute logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchD1CommuteLogs();
  }, [viewScope, user.employeeId]);

  // 기본 D1 기록 및 필터링
  const displayLogs: CommuteLogEntry[] = d1Logs.length > 0 ? d1Logs : [
    {
      id: 'log-today',
      userId: user.employeeId || 'S01832',
      userName: user.name || '조경훈',
      deptName: user.partName || '상담팀',
      position: user.position || '수석',
      workDate: '2026-08-17',
      dateGroupLabel: '2026년 8월 17일, 월 (당일 투입)',
      totalGroupHours: '8시간 0분 (1 M/D)',
      clockInTime: '08:50',
      clockOutTime: '18:00',
      locationName: '파인에비뉴(카드)',
      isVerified: true
    }
  ];

  // 권한 및 토글에 따른 출퇴근 기록 필터링
  const visibleEntries = displayLogs.filter(entry => {
    const matchesSearch = entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.deptName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (!isSiteManager || viewScope === 'my') {
      return entry.userId === (user.employeeId || user.id) || entry.userName === (user.name || '조경훈');
    }
    return true;
  });

  // 날짜별 그룹핑
  const groupedByDate = visibleEntries.reduce((acc, cur) => {
    if (!acc[cur.dateGroupLabel]) {
      acc[cur.dateGroupLabel] = {
        totalHours: cur.totalGroupHours,
        items: []
      };
    }
    acc[cur.dateGroupLabel].items.push(cur);
    return acc;
  }, {} as Record<string, { totalHours: string; items: CommuteLogEntry[] }>);

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 1. 상단 검색바 & 필터 (스크린샷 일치) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF',
        gap: '12px'
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
            placeholder="검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '14px',
              color: '#191F28',
              width: '100%'
            }}
          />
        </div>

        <button 
          onClick={() => alert('출퇴근기록 필터: 지각/조퇴/연장근무/누락 필터링')}
          style={{ color: '#4E5968', display: 'flex', alignItems: 'center', padding: '4px' }}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* 2. 날짜 선택기 & [내 기록 / 팀원 전체] 토글 버튼 (스크린샷 일치) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        borderBottom: '1px solid #ECEFF2'
      }}>
        {/* 날짜 범위 */}
        <div 
          onClick={() => alert('조회 기간 변경: 2026.08.01 ~ 2026.08.31')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
        >
          <Calendar size={16} color="#333D4B" />
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#191F28' }}>{dateRange}</span>
          <ChevronDown size={15} color="#8B95A1" />
        </div>

        {/* 내 기록 버튼 (현장대리인은 전체보기 토글 가능) */}
        {isSiteManager ? (
          <button
            onClick={() => setViewScope(viewScope === 'my' ? 'all' : 'my')}
            style={{
              height: '32px',
              padding: '0 12px',
              borderRadius: '6px',
              border: '1px solid #DDE2E5',
              background: '#FFFFFF',
              color: '#191F28',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {viewScope === 'my' ? '내 기록' : '팀원 전체'}
          </button>
        ) : (
          <div style={{
            height: '32px',
            padding: '0 12px',
            borderRadius: '6px',
            border: '1px solid #DDE2E5',
            background: '#F8F9FA',
            color: '#191F28',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center'
          }}>
            내 기록 (독자보호)
          </div>
        )}
      </div>

      {/* 철학 가이드 배너 */}
      {!isSiteManager && (
        <div style={{
          background: '#FFF9F5',
          borderBottom: '1px solid #FFE8D6',
          padding: '8px 18px',
          fontSize: '12px',
          color: '#D9480F',
          fontWeight: 600
        }}>
          🛡️ <strong>노란봉투법 & 파견법 개인정보 분리 원칙</strong>: 협력사 일반 직원은 본인 출퇴근 기록만 조회되며, 타사 직원의 동선은 격리됩니다.
        </div>
      )}

      {/* 3. 일자별 출퇴근 기록 목록 (스크린샷 100% 일치) */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '90px' }}>
        {Object.entries(groupedByDate).map(([dateLabel, group]) => (
          <div key={dateLabel} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 일자 헤더 바 (2026년 8월 1일, 토 2시간 9분) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 18px',
              background: '#F8F9FA',
              borderBottom: '1px solid #ECEFF2',
              fontSize: '13.5px',
              fontWeight: 800,
              color: '#191F28'
            }}>
              <span>{dateLabel}</span>
              <span>{group.totalHours}</span>
            </div>

            {/* 해당 일자의 출퇴근 기록 항목들 (스크린샷 일치) */}
            {group.items.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #ECEFF2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* 시간 (출근/퇴근) */}
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#191F28', textAlign: 'center', minWidth: '45px', lineHeight: 1.2 }}>
                    {item.clockInTime}<br />{item.clockOutTime}
                  </div>

                  {/* 민트 바 */}
                  <div style={{ width: '3.5px', height: '36px', background: '#00C7AE', borderRadius: '2px' }} />

                  {/* 사원 이름 및 소속 부서 */}
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', marginBottom: '2px' }}>
                      {item.userName}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#6B7684' }}>
                      {item.deptName} / {item.position}
                    </div>
                  </div>
                </div>

                {/* 완료 체크 아이콘 (스크린샷 일치) */}
                {item.isVerified && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#CED4DA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 4. 우측 하단 플로팅 종이비행기 버튼 (스크린샷 일치) */}
      <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 90 }}>
        <button
          onClick={onOpenNewPunchRequest}
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
          title="출퇴근기록 수정 요청"
        >
          <Send size={22} style={{ transform: 'translate(1px, -1px)' }} />
        </button>
      </div>
    </div>
  );
};
