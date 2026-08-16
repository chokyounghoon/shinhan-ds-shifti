import React, { useState } from 'react';
import { 
  Search, Filter, Calendar, Clock, Plane, FileText, 
  Plus, X, ChevronDown, CheckCircle2, AlertCircle, Send
} from 'lucide-react';
import { AttendanceRequest } from '../types';
import { RequestTypeSelectActionSheetModal, RequestCategoryType } from '../components/modals/RequestTypeSelectActionSheetModal';

interface RequestsViewProps {
  requests: AttendanceRequest[];
  onOpenNewRequest: (initialType?: string, actionName?: string) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  onOpenNewRequest,
  themeMode
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'my' | 'completed' | 'ref'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('08.02 - 08.16');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RequestCategoryType | null>(null);

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const completedRequests = requests.filter(r => r.status === 'APPROVED' || r.status === 'REJECTED');

  const fabItems = [
    { id: 'schedule', label: '근무일정 요청', icon: Calendar, type: 'SCHEDULE' as RequestCategoryType },
    { id: 'punch', label: '출퇴근기록 요청', icon: Clock, type: 'PUNCH_CORRECTION' as RequestCategoryType },
    { id: 'vacation', label: '휴가 요청', icon: Plane, type: 'VACATION' as RequestCategoryType },
    { id: 'custom', label: '커스텀 요청', icon: FileText, type: 'CUSTOM' as RequestCategoryType },
  ];

  const handleFabItemClick = (type: RequestCategoryType) => {
    setIsFabOpen(false);
    setSelectedCategory(type);
  };

  const handleSubActionSelect = (actionName: string) => {
    setSelectedCategory(null);
    onOpenNewRequest(selectedCategory || 'SCHEDULE', actionName);
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 1. 상단 검색바 & 필터 */}
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
          onClick={() => alert('요청 필터: 기간별, 유형별(휴가/연장/근무일정), 승인상태별')}
          style={{ color: '#4E5968', display: 'flex', alignItems: 'center', padding: '4px' }}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* 2. 상단 4개 서브탭 (대기중 0 / 내 요청 0 / 완료 8 / 참조) (스크린샷 일치) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ECEFF2', background: '#FFFFFF' }}>
        {[
          { id: 'pending', label: '대기중', count: pendingRequests.length },
          { id: 'my', label: '내 요청', count: 0 },
          { id: 'completed', label: '완료', count: 8 },
          { id: 'ref', label: '참조', count: undefined }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '12px 0',
                fontSize: '14px',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#191F28' : '#8B95A1',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  fontSize: '11px',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: isActive ? (themeMode === 'ddangyo' ? '#FFF0ED' : '#EBF1FF') : '#F1F3F5',
                  color: isActive ? (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF') : '#8B95A1',
                  fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '15%',
                  right: '15%',
                  height: '2.5px',
                  background: '#191F28'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. 날짜 범위 드롭다운 (스크린샷 일치) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 18px',
        borderBottom: '1px solid #F1F3F5'
      }}>
        <div 
          onClick={() => alert('조회 기간 변경: 2026.08.02 ~ 2026.08.16')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
        >
          <Calendar size={16} color="#4E5968" />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#4E5968' }}>{dateRange}</span>
          <ChevronDown size={15} color="#8B95A1" />
        </div>
      </div>

      {/* 4. 본문 목록 또는 빈 상태 (스크린샷 일치) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'pending' && pendingRequests.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: '140px'
          }}>
            {/* 종이비행기 & 문서 일러스트 (스크린샷 일치) */}
            <div style={{
              width: '90px',
              height: '90px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                width: '60px',
                height: '45px',
                background: '#F1F3F5',
                borderRadius: '6px',
                border: '1px solid #E4E8EB'
              }} />
              <div style={{
                position: 'absolute',
                transform: 'rotate(-20deg) translate(8px, -4px)',
                color: '#CED4DA'
              }}>
                <Send size={42} strokeWidth={1.2} />
              </div>
            </div>

            <div style={{ fontSize: '15px', fontWeight: 600, color: '#8B95A1' }}>
              승인이 필요한 요청이 없습니다
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px 16px 80px 16px' }}>
            {requests.map(req => (
              <div
                key={req.id}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #ECEFF2',
                  marginBottom: '10px',
                  background: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#191F28' }}>
                    {req.requestType === 'VACATION' ? '휴가' : req.requestType === 'OVERTIME' ? '연장근무' : '근무일정'}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    background: req.status === 'APPROVED' ? '#E6F9F0' : req.status === 'REJECTED' ? '#FFEBEB' : '#FFF0ED',
                    color: req.status === 'APPROVED' ? '#00A859' : req.status === 'REJECTED' ? '#FF3B30' : '#FF462D'
                  }}>
                    {req.status === 'APPROVED' ? '승인완료' : req.status === 'REJECTED' ? '반려' : '대기중'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#4E5968' }}>
                  {req.targetDate} ({req.startTime} ~ {req.endTime})
                </div>
                <div style={{ fontSize: '12px', color: '#8B95A1', marginTop: '4px' }}>
                  사유: {req.reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. 플로팅 스피드 다이얼 메뉴 (스크린샷 100% 일치) */}
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
        {isFabOpen && fabItems.map((item, index) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => handleFabItemClick(item.type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                animation: `fadeInUp ${0.15 + index * 0.05}s ease-out`
              }}
            >
              <span style={{
                fontSize: '14.5px',
                fontWeight: 700,
                color: '#191F28',
                letterSpacing: '-0.3px',
                textShadow: '0 1px 3px rgba(255,255,255,0.9)'
              }}>
                {item.label}
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
                <IconComp size={22} strokeWidth={2.2} />
              </div>
            </div>
          );
        })}

        {/* 메인 FAB 버튼 (+ / ✕) */}
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
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isFabOpen ? 'rotate(90deg)' : 'none'
          }}
        >
          {isFabOpen ? <X size={26} strokeWidth={2.5} /> : <Plus size={28} strokeWidth={2.5} />}
        </button>
      </div>

      {/* 6. 요청 세부 종류 선택 바텀 액션 시트 모달 (스크린샷 일치) */}
      <RequestTypeSelectActionSheetModal
        isOpen={selectedCategory !== null}
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
        onSelectAction={handleSubActionSelect}
        themeMode={themeMode}
      />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
