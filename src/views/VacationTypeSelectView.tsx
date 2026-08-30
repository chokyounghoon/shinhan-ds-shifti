import React, { useState } from 'react';
import { ArrowLeft, Search, Check } from 'lucide-react';

export interface VacationTypeCategory {
  categoryName: string;
  items: {
    id: string;
    title: string; // e.g. 연차 (0h, 1일)
    description?: string;
    unit: string;
  }[];
}

// 스크린샷 2와 100% 일치하는 휴가 항목 리스트
export const vacationTypeCategories: VacationTypeCategory[] = [
  {
    categoryName: '01. 연차휴가',
    items: [
      { id: 'v-01-1', title: '연차 (0h, 1일)', unit: '1일' },
      { id: 'v-01-2', title: '반차(오후/오전) (0h, 0.25일/0.5일)', description: '휴가등록 후 근무일정 수정 요망 (연차 기준 미달시 무급)', unit: '0.5일' },
      { id: 'v-01-3', title: '반차(오전) (0h, 0.5일)', unit: '0.5일' },
      { id: 'v-01-4', title: '연차(1시간단위) (0h, 1일)', description: '주 40시간(연장근로시간 제외 산정 기준)', unit: '1시간' }
    ]
  },
  {
    categoryName: '02. 여름휴가',
    items: [
      { id: 'v-02-1', title: '여름휴가 (0h, 1일)', description: '소속사 하계 정기 유급휴가', unit: '1일' }
    ]
  },
  {
    categoryName: '03. 특별휴가',
    items: [
      { id: 'v-03-1', title: '특별휴가 (0h, 1일)', unit: '1일' },
      { id: 'v-03-2', title: '특별휴가(반차) (0h, 0.5일)', unit: '0.5일' }
    ]
  },
  {
    categoryName: '04. 대체휴가',
    items: [
      { id: 'v-04-1', title: '대체휴가 (0h, 1일)', unit: '1일' },
      { id: 'v-04-2', title: '대체휴가(반차) (0h, 0.5일)', unit: '0.5일' }
    ]
  },
  {
    categoryName: '05. 청원휴가(최대5일)',
    items: [
      { id: 'v-05-1', title: '가족돌봄 (0h, 1일)', description: '본인 필요', unit: '1일' },
      { id: 'v-05-2', title: '사망(배우자,자녀,부모) (0h, 1일)', description: '증빙서류(사망진단서) 제출', unit: '1일' }
    ]
  },
  {
    categoryName: '06. 청원휴가(최대3일)',
    items: [
      { id: 'v-06-1', title: '사망(조부모,손자녀) (0h, 1일)', description: '증빙서류(사망진단서) 제출', unit: '1일' }
    ]
  },
  {
    categoryName: '07. 청원휴가(최대2일)',
    items: [
      { id: 'v-07-1', title: '사망(형제자매) (0h, 1일)', description: '증빙서류(사망진단서) 제출', unit: '1일' }
    ]
  },
  {
    categoryName: '08. 청원휴가(최대1일)',
    items: [
      { id: 'v-08-1', title: '수습 (0h, 1일)', unit: '1일' },
      { id: 'v-08-2', title: '백일/돌잔치(본인자녀) (0h, 1일)', description: '자녀 출생 증빙서류 제출', unit: '1일' },
      { id: 'v-08-3', title: '결혼기념일(본인) (0h, 1일)', description: '본인의 결혼기념일(해당 월 이내 사용)', unit: '1일' },
      { id: 'v-08-4', title: '부모잔치 (0h, 1일)', description: '(시)부모 회갑/칠순/팔순 잔치', unit: '1일' },
      { id: 'v-08-5', title: '사망(백부,숙부,외조부모) (0h, 1일)', description: '증빙서류 제출', unit: '1일' },
      { id: 'v-08-6', title: '주택구입 (0h, 1일)', description: '본인 명의 주택구입(전입 1월 이내)', unit: '1일' },
      { id: 'v-08-7', title: '탈상 (0h, 1일)', description: '증빙서류 제출', unit: '1일' }
    ]
  },
  {
    categoryName: '09. 기타공상휴가',
    items: [
      { id: 'v-09-1', title: '공적공상휴가 (0h, 1일)', description: '회사 지정 공무 수행', unit: '1일' }
    ]
  },
  {
    categoryName: '10. 예비군/민방위',
    items: [
      { id: 'v-10-1', title: '예비군/민방위훈련 (0h, 1일)', description: '교육 소집 통지서 증빙 필수', unit: '1일' }
    ]
  },
  {
    categoryName: '11. 배우자출산휴가',
    items: [
      { id: 'v-11-1', title: '배우자출산휴가 (0h, 1일)', unit: '1일' }
    ]
  },
  {
    categoryName: '12. 난임휴가',
    items: [
      { id: 'v-12-1', title: '난임휴가 (0h, 1일)', description: '의료기관 진단서 제출', unit: '1일' }
    ]
  },
  {
    categoryName: '13. 건강검진',
    items: [
      { id: 'v-13-1', title: '건강검진 (0h, 1일)', description: '회사 지정 검진', unit: '1일' }
    ]
  },
  {
    categoryName: '14. 포상휴가',
    items: [
      { id: 'v-14-1', title: '포상휴가 (0h, 1일)', description: '우수직원 포상 승인건', unit: '1일' }
    ]
  },
  {
    categoryName: '15. 생리',
    items: [
      { id: 'v-15-1', title: '생리 (0h, 1일)', unit: '1일' }
    ]
  },
  {
    categoryName: '16. 출산전후휴가',
    items: [
      { id: 'v-16-1', title: '출산전후휴가 (0h, 1일)', description: '의사 진단서 제출 필수', unit: '1일' }
    ]
  },
  {
    categoryName: '17. 육아기단축근무',
    items: [
      { id: 'v-17-1', title: '육아기단축근무 (0h, 1일)', description: '정관에 따른 육아 단축 근무 확인서 첨부', unit: '1일' }
    ]
  },
  {
    categoryName: '18. 무급휴가',
    items: [
      { id: 'v-18-1', title: '무급휴가 (0h, 1일)', unit: '1일' }
    ]
  },
  {
    categoryName: '19. 기타 휴가',
    items: [
      { id: 'v-19-1', title: '기타 휴가 (0h, 1일)', description: '기타 소속사 승인 휴가', unit: '1일' },
      { id: 'v-19-2', title: '기타 반차 (0h, 0.5일)', description: '기타 소속사 승인 반차', unit: '0.5일' }
    ]
  },
  {
    categoryName: '휴직',
    items: [
      { id: 'v-99-1', title: '휴직 (0h, 1일)', description: '인사팀 사전 승인서 첨부 필수', unit: '1일' }
    ]
  }
];

interface VacationTypeSelectViewProps {
  onBack: () => void;
  onSelectType: (typeName: string) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const VacationTypeSelectView: React.FC<VacationTypeSelectViewProps> = ({
  onBack,
  onSelectType,
  themeMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>('v-01-1');

  const filteredCategories = vacationTypeCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 (← 휴가 항목 선택) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF',
        gap: '14px'
      }}>
        <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>휴가 항목 선택</span>
      </div>

      {/* 2. 검색창 (스크린샷 일치) */}
      <div style={{ padding: '12px 16px 8px 16px' }}>
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

      {/* 3. 휴가 항목 목록 (스크린샷 100% 일치) */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '70px' }}>
        {filteredCategories.map(cat => (
          <div key={cat.categoryName} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 카테고리 헤더 바 (회색 배경) */}
            <div style={{
              background: '#F8F9FA',
              padding: '12px 18px 8px 18px',
              fontSize: '13px',
              fontWeight: 800,
              color: '#191F28',
              borderBottom: '1px solid #ECEFF2'
            }}>
              {cat.categoryName}
            </div>

            {/* 항목 리스트 */}
            {cat.items.map(item => {
              const isSelected = item.id === selectedId;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    onSelectType(item.title);
                  }}
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #ECEFF2',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    cursor: 'pointer',
                    background: '#FFFFFF'
                  }}
                >
                  {/* 라디오 원형 버튼 (스크린샷 일치) */}
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isSelected 
                      ? (themeMode === 'ddangyo' ? '6px solid #FF462D' : '6px solid #0066FF')
                      : '2px solid #D0D5DD',
                    marginTop: '2px',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }} />

                  {/* 텍스트 내용 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#191F28', marginBottom: '2px' }}>
                      {item.title}
                    </div>
                    {item.description && (
                      <div style={{ fontSize: '12.5px', color: '#8B95A1', lineHeight: 1.3 }}>
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
