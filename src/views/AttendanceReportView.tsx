import React, { useState } from 'react';
import { ArrowLeft, Filter, Search, Calendar, ChevronDown, ChevronRight } from 'lucide-react';

export interface EmployeeReportRow {
  id: string;
  name: string;
  deptName: string;
  regularHours: string; // 소정근로시간 (e.g. 0m, 160h)
  overtimeHours: string; // 시간외수당산정시간 (e.g. 0m, 6h 50m, 3h)
  substituteLeaveHours: string; // 대체휴가산정시간 (e.g. 0m)
}

// 스크린샷과 100% 일치하는 리포트 데이터 목록
export const defaultReportRows: EmployeeReportRow[] = [
  {
    id: 'rep-01',
    name: '김현호',
    deptName: '카드개발팀',
    regularHours: '0m',
    overtimeHours: '0m',
    substituteLeaveHours: '0m'
  },
  {
    id: 'rep-02',
    name: '김연섭',
    deptName: '카드개발팀',
    regularHours: '0m',
    overtimeHours: '6h 50m',
    substituteLeaveHours: '0m'
  },
  {
    id: 'rep-03',
    name: '김현석',
    deptName: '카드개발팀',
    regularHours: '0m',
    overtimeHours: '0m',
    substituteLeaveHours: '0m'
  },
  {
    id: 'rep-04',
    name: '김종현',
    deptName: '카드개발팀',
    regularHours: '0m',
    overtimeHours: '0m',
    substituteLeaveHours: '0m'
  },
  {
    id: 'rep-05',
    name: '김흥섭',
    deptName: '카드개발팀',
    regularHours: '0m',
    overtimeHours: '0m',
    substituteLeaveHours: '0m'
  },
  {
    id: 'rep-06',
    name: '이종민',
    deptName: '카드개발팀',
    regularHours: '0m',
    overtimeHours: '0m',
    substituteLeaveHours: '0m'
  },
  {
    id: 'rep-07',
    name: '김정림',
    deptName: '카드개발팀',
    regularHours: '0m',
    overtimeHours: '0m',
    substituteLeaveHours: '0m'
  },
  {
    id: 'rep-08',
    name: '김범',
    deptName: '카드개발팀',
    regularHours: '160h',
    overtimeHours: '3h',
    substituteLeaveHours: '0m'
  },
  {
    id: 'rep-09',
    name: '이동은',
    deptName: '카드개발팀',
    regularHours: '160h',
    overtimeHours: '0m',
    substituteLeaveHours: '0m'
  },
  {
    id: 'rep-10',
    name: '박상구',
    deptName: '카드개발팀',
    regularHours: '160h',
    overtimeHours: '0m',
    substituteLeaveHours: '0m'
  },
  {
    id: 'rep-11',
    name: '홍성민',
    deptName: '카드개발팀',
    regularHours: '160h',
    overtimeHours: '0m',
    substituteLeaveHours: '0m'
  }
];

interface AttendanceReportViewProps {
  onBack: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const AttendanceReportView: React.FC<AttendanceReportViewProps> = ({
  onBack,
  themeMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('08.01 - 08.31');
  const [columnFilterCount, setColumnFilterCount] = useState(3);
  const [sortField, setSortField] = useState<'regular' | 'overtime' | 'substitute'>('regular');
  const [sortAsc, setSortAsc] = useState(true);

  const filteredRows = defaultReportRows.filter(row =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.deptName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 (← 리포트 | 필터) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>리포트</span>
        </div>

        <button 
          onClick={() => alert('리포트 상세 필터: 팀별, 직무별, 52시간 초과자 필터링')}
          style={{ color: '#4E5968', display: 'flex', alignItems: 'center', padding: '4px' }}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* 2. 기간 선택기 및 [3 선택됨 ∨] 버튼 (스크린샷 일치) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px 8px 18px'
      }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          onClick={() => alert('조회 기간 변경: 2026.08.01 ~ 2026.08.31')}
        >
          <Calendar size={17} color="#333D4B" />
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#191F28' }}>{dateRange}</span>
          <ChevronDown size={16} color="#6B7684" />
        </div>

        <button
          onClick={() => alert('컬럼 표시 선택: 소정근로시간, 시간외수당산정시간, 대체휴가산정시간 등 3개 선택됨')}
          style={{
            height: '32px',
            padding: '0 12px',
            borderRadius: '6px',
            border: themeMode === 'ddangyo' ? '1.5px solid #FF462D' : '1.5px solid #0066FF',
            background: '#FFFFFF',
            color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>{columnFilterCount} 선택됨</span>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* 3. 검색창 (스크린샷 일치) */}
      <div style={{ padding: '4px 16px 10px 16px' }}>
        <div style={{
          height: '42px',
          background: '#F1F3F5',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '8px'
        }}>
          <Search size={18} color="#8B95A1" />
          <input
            type="text"
            placeholder="검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '15px',
              color: '#191F28',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* 4. 컬럼 헤더 바 (스크린샷 일치) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '100px 1fr 1fr 1fr 16px',
        alignItems: 'center',
        padding: '8px 16px',
        background: '#F8F9FA',
        borderTop: '1px solid #ECEFF2',
        borderBottom: '1px solid #ECEFF2',
        fontSize: '11px',
        fontWeight: 700,
        color: '#4E5968',
        textAlign: 'right'
      }}>
        <div style={{ textAlign: 'left' }}></div>

        {/* 소정근로시간 컬럼 (하이라이트 박스) */}
        <div
          onClick={() => { setSortField('regular'); setSortAsc(!sortAsc); }}
          style={{
            background: '#E9ECEF',
            padding: '6px 4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            color: '#191F28',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          <span>소정근로시간</span>
          <span style={{ fontSize: '9px' }}>▲</span>
        </div>

        <div style={{ padding: '0 4px', lineHeight: 1.2 }}>
          시간외수당<br />산정시간*
        </div>

        <div style={{ padding: '0 4px', lineHeight: 1.2 }}>
          대체휴가<br />산정시간*
        </div>

        <div></div>
      </div>

      {/* 5. 직원별 리포트 데이터 목록 (스크린샷 100% 일치) */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '70px' }}>
        {filteredRows.map(row => (
          <div
            key={row.id}
            onClick={() => alert(`📊 [${row.name}] 근태 리포트 상세\n• 소정근로: ${row.regularHours}\n• 시간외수당: ${row.overtimeHours}\n• 대체휴가: ${row.substituteLeaveHours}`)}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr 1fr 1fr 16px',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid #F1F3F5',
              background: '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'right'
            }}
          >
            {/* 좌측 성명 및 부서 */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28' }}>
                {row.name}
              </div>
              <div style={{ fontSize: '11.5px', color: '#8B95A1', marginTop: '2px' }}>
                {row.deptName}
              </div>
            </div>

            {/* 소정근로시간 */}
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#333D4B' }}>
              {row.regularHours}
            </div>

            {/* 시간외수당산정시간 */}
            <div style={{ fontSize: '13px', fontWeight: 700, color: row.overtimeHours !== '0m' ? (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF') : '#333D4B' }}>
              {row.overtimeHours}
            </div>

            {/* 대체휴가산정시간 */}
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#333D4B' }}>
              {row.substituteLeaveHours}
            </div>

            {/* 우측 화살표 */}
            <ChevronRight size={16} color="#B0B8C1" />
          </div>
        ))}
      </div>
    </div>
  );
};
