import React, { useState } from 'react';
import { Search, Calendar, ChevronDown, Plane, Edit3, Trash2, X, Plus } from 'lucide-react';
import { User } from '../types';

export interface VacationHistoryItem {
  id: string;
  dateLabel: string; // e.g. 08/14 금요일
  vacationType: string; // e.g. 연차, 체력단련휴가
  timeRange: string; // e.g. 09:00 - 18:00
  memo: string; // e.g. 여휴, 어머니 병원 간병
}

export const myVacationHistory: VacationHistoryItem[] = [
  {
    id: 'vac-01',
    dateLabel: '08/14\n금요일',
    vacationType: '연차',
    timeRange: '09:00 - 18:00',
    memo: '여휴'
  },
  {
    id: 'vac-02',
    dateLabel: '08/13\n목요일',
    vacationType: '연차',
    timeRange: '09:00 - 18:00',
    memo: '여휴'
  },
  {
    id: 'vac-03',
    dateLabel: '08/12\n수요일',
    vacationType: '연차',
    timeRange: '09:00 - 18:00',
    memo: '여휴'
  },
  {
    id: 'vac-04',
    dateLabel: '08/11\n화요일',
    vacationType: '체력단련휴가',
    timeRange: '09:00 - 18:00',
    memo: '여휴'
  },
  {
    id: 'vac-05',
    dateLabel: '08/10\n월요일',
    vacationType: '체력단련휴가',
    timeRange: '09:00 - 18:00',
    memo: '여휴'
  },
  {
    id: 'vac-06',
    dateLabel: '07/08\n수요일',
    vacationType: '연차',
    timeRange: '09:00 - 18:00',
    memo: '어머니 병원 간병'
  },
  {
    id: 'vac-07',
    dateLabel: '07/07\n화요일',
    vacationType: '연차',
    timeRange: '09:00 - 18:00',
    memo: '어머니 병원 간병'
  }
];

interface VacationViewProps {
  user: User;
  onOpenTypeSelect: () => void;
  onOpenRequest: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const VacationView: React.FC<VacationViewProps> = ({
  user,
  onOpenTypeSelect,
  onOpenRequest,
  themeMode
}) => {
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);

  const vacationBalances = [
    { name: '01.연차휴가', total: '18', used: '9.25', remaining: '8.75' },
    { name: '02.체력단련휴가', total: '5', used: '5', remaining: '0' },
    { name: '08.청원휴가(최대3일)', total: '0', used: '2', remaining: '-' },
  ];

  const handleFabAction = (action: string) => {
    setIsFabOpen(false);
    if (action === 'create') {
      onOpenTypeSelect();
    } else if (action === 'edit') {
      alert('📝 휴가 수정 요청 화면입니다.');
    } else {
      alert('🗑️ 휴가 삭제 요청 화면입니다.');
    }
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 1. 상단 검색창 */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF'
      }}>
        <div style={{
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
      </div>

      {/* 2. 상단 탭: [내 휴가] vs [전체] (스크린샷 일치) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ECEFF2', background: '#FFFFFF' }}>
        <button
          onClick={() => setActiveTab('my')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: '15px',
            fontWeight: activeTab === 'my' ? 800 : 600,
            color: activeTab === 'my' ? '#191F28' : '#8B95A1',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <span>내 휴가</span>
          {activeTab === 'my' && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '25%',
              right: '25%',
              height: '2.5px',
              background: '#191F28'
            }} />
          )}
        </button>

        <button
          onClick={() => setActiveTab('all')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: '15px',
            fontWeight: activeTab === 'all' ? 800 : 600,
            color: activeTab === 'all' ? '#191F28' : '#8B95A1',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <span>전체</span>
          {activeTab === 'all' && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '25%',
              right: '25%',
              height: '2.5px',
              background: '#191F28'
            }} />
          )}
        </button>
      </div>

      {/* 3. 휴가 잔여 일수 요약 테이블 (스크린샷 100% 일치) */}
      <div style={{
        padding: '16px 18px 14px 18px',
        borderBottom: '8px solid #F8F9FA',
        background: '#FFFFFF'
      }}>
        {/* 기준일자 및 컬럼 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} color="#333D4B" />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#191F28' }}>2026.08.16(일)</span>
            <ChevronDown size={15} color="#8B95A1" />
          </div>

          <div style={{ display: 'flex', gap: '22px', fontSize: '13.5px', fontWeight: 700, color: '#333D4B', paddingRight: '6px' }}>
            <span style={{ minWidth: '22px', textAlign: 'center' }}>총</span>
            <span style={{ minWidth: '28px', textAlign: 'center' }}>사용</span>
            <span style={{ minWidth: '28px', textAlign: 'center' }}>잔여</span>
          </div>
        </div>

        {/* 3개 휴가 잔여 행 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {vacationBalances.map(v => (
            <div key={v.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#191F28' }}>
                {v.name}
              </span>

              <div style={{ display: 'flex', gap: '22px', fontSize: '14.5px', fontWeight: 700 }}>
                <span style={{ minWidth: '22px', textAlign: 'center', color: '#191F28' }}>{v.total}</span>
                <span style={{ minWidth: '28px', textAlign: 'center', color: '#191F28' }}>{v.used}</span>
                <span style={{ minWidth: '28px', textAlign: 'center', color: '#0066FF', fontWeight: 800 }}>{v.remaining}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 휴가 사용 내역 목록 (스크린샷 100% 일치) */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '90px' }}>
        {myVacationHistory.map(item => (
          <div
            key={item.id}
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #ECEFF2',
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF'
            }}
          >
            {/* 좌측 날짜 및 요일 */}
            <div style={{
              width: '65px',
              fontSize: '13.5px',
              fontWeight: 800,
              color: '#191F28',
              lineHeight: 1.3,
              whiteSpace: 'pre-line'
            }}>
              {item.dateLabel}
            </div>

            {/* 세로 구분선 */}
            <div style={{ width: '1px', height: '36px', background: '#ECEFF2', margin: '0 14px' }} />

            {/* 우측 휴가 종류, 시간 및 사유 */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', marginBottom: '4px' }}>
                {item.vacationType} &nbsp;
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#4E5968' }}>
                  {item.timeRange}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#6B7684' }}>
                {item.memo}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. 플로팅 스피드 다이얼 메뉴 (스크린샷 3 일치) */}
      {isFabOpen && (
        <div 
          onClick={() => setIsFabOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(2px)',
            zIndex: 900
          }}
        />
      )}

      {/* 스피드 다이얼 액션 아이템들 */}
      <div style={{
        position: 'fixed',
        bottom: '84px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '16px',
        zIndex: 950
      }}>
        {isFabOpen && (
          <>
            {/* 휴가 생성 요청 */}
            <div
              onClick={() => handleFabAction('create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                animation: 'fadeInUp 0.15s ease-out'
              }}
            >
              <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#191F28' }}>
                휴가 생성 요청
              </span>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF'
              }}>
                <Plane size={22} fill={themeMode === 'ddangyo' ? '#FF462D' : '#0066FF'} strokeWidth={1.5} />
              </div>
            </div>

            {/* 휴가 수정 요청 */}
            <div
              onClick={() => handleFabAction('edit')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                animation: 'fadeInUp 0.2s ease-out'
              }}
            >
              <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#191F28' }}>
                휴가 수정 요청
              </span>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF'
              }}>
                <Edit3 size={20} strokeWidth={2.2} />
              </div>
            </div>

            {/* 휴가 삭제 요청 */}
            <div
              onClick={() => handleFabAction('delete')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                animation: 'fadeInUp 0.25s ease-out'
              }}
            >
              <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#191F28' }}>
                휴가 삭제 요청
              </span>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF'
              }}>
                <Trash2 size={20} strokeWidth={2.2} />
              </div>
            </div>
          </>
        )}

        {/* 메인 FAB 버튼 (비행기 ✈ ↔ ✕) */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF',
            boxShadow: '0 4px 16px rgba(0, 102, 255, 0.35)',
            border: 'none',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {isFabOpen ? (
            <X size={26} strokeWidth={2.5} />
          ) : (
            <Plane size={24} fill="#FFFFFF" style={{ transform: 'rotate(-45deg)' }} />
          )}
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
