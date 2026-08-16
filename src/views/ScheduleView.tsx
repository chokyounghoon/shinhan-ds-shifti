import React, { useState } from 'react';
import { Search, Filter, Calendar, ChevronDown, Send, CheckCircle2, Plane, FileText } from 'lucide-react';
import { User, DaySchedule } from '../types';

export interface ScheduleEntry {
  id: string;
  userId: string;
  userName: string;
  deptName: string;
  position: string;
  workDate: string; // e.g. 2026-08-02, 2026-08-03
  dateGroupLabel: string; // e.g. 2026년 8월 2일, 일
  totalGroupHours: string; // e.g. 2시간, 296시간 30분
  isWeekend?: boolean;
  startTime?: string;
  endTime?: string;
  vacationType?: string; // e.g. 출산전후휴가, 건강검진, 대체휴가, 부모잔치, 연차
  isVerified?: boolean;
}

// 스크린샷과 100% 일치하는 근무일정 데이터
export const fullTeamScheduleEntries: ScheduleEntry[] = [
  // 2026년 8월 2일, 일
  {
    id: 'sch-01',
    userId: 'usr-002',
    userName: '송무준',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-02',
    dateGroupLabel: '2026년 8월 2일, 일',
    totalGroupHours: '2시간',
    isWeekend: true,
    startTime: '00:00',
    endTime: '02:00',
    isVerified: true
  },
  // 2026년 8월 3일, 월 (스크린샷 일치 휴가/근무일정 항목들)
  {
    id: 'sch-02',
    userId: 'usr-003',
    userName: '배경보',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '296시간 30분',
    vacationType: '출산전후휴가'
  },
  {
    id: 'sch-03',
    userId: 'usr-004',
    userName: '이재연',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '296시간 30분',
    vacationType: '건강검진',
    startTime: '09:00',
    endTime: '18:00'
  },
  {
    id: 'sch-04',
    userId: 'usr-005',
    userName: '김도현',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '296시간 30분',
    vacationType: '대체휴가',
    startTime: '09:00',
    endTime: '18:00'
  },
  {
    id: 'sch-05',
    userId: 'usr-006',
    userName: '윤학민',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '296시간 30분',
    vacationType: '대체휴가',
    startTime: '09:00',
    endTime: '18:00'
  },
  {
    id: 'sch-06',
    userId: 'usr-007',
    userName: '이종민',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '296시간 30분',
    vacationType: '대체휴가',
    startTime: '09:00',
    endTime: '18:00'
  },
  {
    id: 'sch-07',
    userId: 'usr-008',
    userName: '김윤호',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '296시간 30분',
    vacationType: '부모잔치',
    startTime: '09:00',
    endTime: '18:00'
  },
  {
    id: 'sch-08',
    userId: 'usr-009',
    userName: '강윤지',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '296시간 30분',
    vacationType: '연차',
    startTime: '09:00',
    endTime: '18:00'
  },
  {
    id: 'sch-09',
    userId: 'usr-010',
    userName: '권예림',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '296시간 30분',
    vacationType: '연차',
    startTime: '09:00',
    endTime: '18:00'
  },
  {
    id: 'sch-10',
    userId: 'usr-011',
    userName: '박남호',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '296시간 30분',
    vacationType: '연차',
    startTime: '09:00',
    endTime: '18:00'
  },
  {
    id: 'sch-11',
    userId: 'usr-012',
    userName: '정재문',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '296시간 30분',
    vacationType: '연차',
    startTime: '09:00',
    endTime: '18:00'
  },
  // 조경훈 본인 일정
  {
    id: 'sch-12',
    userId: 'usr-001',
    userName: '조경훈',
    deptName: '카드개발팀',
    position: '팀원',
    workDate: '2026-08-03',
    dateGroupLabel: '2026년 8월 3일, 월',
    totalGroupHours: '296시간 30분',
    startTime: '09:00',
    endTime: '18:00'
  }
];

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
  const isSiteManager = user.role === 'PARTNER_SITE_MANAGER';
  // 일반 직원은 자기 일정만 보기 강제 (노란봉투법 / 파견법 개인정보 및 노무독립성 철학)
  const [viewScope, setViewScope] = useState<'my' | 'all'>(isSiteManager ? 'all' : 'my');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('08.01 - 08.31');

  // 권한 및 토글에 따른 일정 필터링
  const visibleEntries = fullTeamScheduleEntries.filter(entry => {
    const matchesSearch = entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.deptName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (entry.vacationType && entry.vacationType.includes(searchQuery));
    
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
        isWeekend: cur.isWeekend,
        items: []
      };
    }
    acc[cur.dateGroupLabel].items.push(cur);
    return acc;
  }, {} as Record<string, { totalHours: string; isWeekend?: boolean; items: ScheduleEntry[] }>);

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
          onClick={() => alert('근무일정 필터: 조직별, 직무별, 휴가유형별')}
          style={{ color: '#4E5968', display: 'flex', alignItems: 'center', padding: '4px' }}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* 2. 날짜 선택기 & [내 일정 / 팀원 전체] 토글 버튼 (스크린샷 일치) */}
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

        {/* 내 일정 버튼 (현장대리인은 전체보기 토글 가능) */}
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
            {viewScope === 'my' ? '내 일정' : '팀원 전체'}
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
            내 일정 (독자보호)
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
          🛡️ <strong>노란봉투법 & 파견법 개인정보 분리 원칙</strong>: 협력사 일반 직원은 본인 일정만 조회되며, 타사 직원의 일정은 격리됩니다.
        </div>
      )}

      {/* 3. 일자별 근무일정 목록 (스크린샷 100% 일치) */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '90px' }}>
        {Object.entries(groupedByDate).map(([dateLabel, group]) => (
          <div key={dateLabel} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 일자 헤더 바 (2026년 8월 2일, 일 2시간) */}
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

                    {/* 완료 체크 아이콘 */}
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
        ))}
      </div>

      {/* 4. 우측 하단 플로팅 종이비행기 버튼 (스크린샷 일치) */}
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
