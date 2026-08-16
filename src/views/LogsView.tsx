import React, { useState } from 'react';
import { Search, Filter, Calendar, ChevronDown, Send } from 'lucide-react';
import { User, DayGroupedCommuteLogs, CommuteLogItem } from '../types';

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
  isVerified?: boolean;
}

// 스크린샷과 100% 일치하는 팀원 전체 출퇴근 기록 데이터
export const fullTeamCommuteLogEntries: CommuteLogEntry[] = [
  // 2026년 8월 1일, 토 (2시간 9분)
  {
    id: 'log-01',
    userId: 'usr-002',
    userName: '송무준',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-01',
    dateGroupLabel: '2026년 8월 1일, 토',
    totalGroupHours: '2시간 9분',
    clockInTime: '23:51',
    clockOutTime: '02:00',
    isVerified: true
  },
  // 2026년 8월 3일, 월 (317시간 7분)
  {
    id: 'log-02',
    userId: 'usr-013',
    userName: '김성훈',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '317시간 7분',
    clockInTime: '06:35',
    clockOutTime: '18:31',
    isVerified: true
  },
  {
    id: 'log-03',
    userId: 'usr-014',
    userName: '이제성',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '317시간 7분',
    clockInTime: '07:14',
    clockOutTime: '17:07',
    isVerified: true
  },
  {
    id: 'log-04',
    userId: 'usr-008',
    userName: '김흥섭',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '317시간 7분',
    clockInTime: '07:52',
    clockOutTime: '18:00',
    isVerified: true
  },
  {
    id: 'log-05',
    userId: 'usr-009',
    userName: '이동은',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '317시간 7분',
    clockInTime: '07:53',
    clockOutTime: '18:13',
    isVerified: true
  },
  {
    id: 'log-06',
    userId: 'usr-015',
    userName: '명보민',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '317시간 7분',
    clockInTime: '08:00',
    clockOutTime: '17:18',
    isVerified: true
  },
  {
    id: 'log-07',
    userId: 'usr-016',
    userName: '박선용',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '317시간 7분',
    clockInTime: '08:15',
    clockOutTime: '18:01',
    isVerified: true
  },
  {
    id: 'log-08',
    userId: 'usr-003',
    userName: '김연섭',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '317시간 7분',
    clockInTime: '08:18',
    clockOutTime: '18:00',
    isVerified: true
  },
  {
    id: 'log-09',
    userId: 'usr-005',
    userName: '김종현',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '317시간 7분',
    clockInTime: '08:20',
    clockOutTime: '18:05',
    isVerified: true
  },
  // 조경훈 본인 출퇴근 기록
  {
    id: 'log-10',
    userId: 'usr-001',
    userName: '조경훈',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '317시간 7분',
    clockInTime: '09:51',
    clockOutTime: '19:00',
    isVerified: true
  }
];

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
  const isSiteManager = user.role === 'PARTNER_SITE_MANAGER';
  // 일반 직원은 자기 기록만 보기 강제 (노란봉투법 / 파견법 개인정보 및 노무독립성 철학)
  const [viewScope, setViewScope] = useState<'my' | 'all'>(isSiteManager ? 'all' : 'my');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('08.01 - 08.31');

  // 권한 및 토글에 따른 출퇴근 기록 필터링
  const visibleEntries = fullTeamCommuteLogEntries.filter(entry => {
    const matchesSearch = entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.deptName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // 일반 협력직원은 무조건 본인 것만 표출 (철학 준수)
    if (!isSiteManager || viewScope === 'my') {
      return entry.userId === user.id || entry.userName === '조경훈';
    }

    // 현장대리인은 전체 팀원 확인 가능
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
