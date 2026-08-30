import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  Plane, 
  Edit3, 
  Trash2, 
  X, 
  Plus, 
  RotateCw, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { User, AttendanceRequest } from '../types';
import { dbService } from '../services/db';

export interface VacationBalanceItem {
  name: string;
  total: string;
  used: string;
  remaining: string;
}

export interface VacationItem {
  id: string;
  dateLabel: string;
  rawDate: string;
  vacationType: string;
  timeRange: string;
  memo: string;
  status: string;
}

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
  const [isLoading, setIsLoading] = useState(false);
  const [vacationList, setVacationList] = useState<VacationItem[]>([]);
  const [balances, setBalances] = useState<VacationBalanceItem[]>([
    { name: '01.연차휴가', total: '18', used: '0', remaining: '18' },
    { name: '02.여름휴가', total: '5', used: '0', remaining: '5' },
    { name: '08.청원휴가(최대3일)', total: '3', used: '0', remaining: '3' },
  ]);

  const empId = user?.employeeId || (user as any)?.id || 'S01832';
  const primaryColor = themeMode === 'ddangyo' ? '#FF462D' : '#0046FF';

  // D1 DB에서 휴가 신청 목록 및 잔여일수 실시간 조회
  const fetchVacationDataFromD1 = async () => {
    setIsLoading(true);
    try {
      // 1. D1 DB 휴가 신청 목록 조회
      const reqRes = await fetch(`/api/attendance/requests?employee_id=${encodeURIComponent(empId)}&request_type=VACATION`);
      let listFromD1: VacationItem[] = [];

      if (reqRes.ok) {
        const json = await reqRes.json();
        const d1Data: any[] = json.data || [];

        listFromD1 = d1Data.map(item => {
          const targetDateStr = item.target_date || item.created_at?.slice(0, 10) || '2026-08-30';
          let dateLabel = targetDateStr;
          try {
            const d = new Date(targetDateStr);
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const dow = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()] || '평일';
            dateLabel = `${mm}/${dd}\n${dow}요일`;
          } catch (_) {}

          let vacType = '연차';
          const r = (item.reason || '').toLowerCase();
          if (r.includes('체력단련')) vacType = '체력단련휴가';
          else if (r.includes('반차')) vacType = '반차';
          else if (r.includes('청원') || r.includes('경조')) vacType = '청원휴가';

          return {
            id: item.id,
            dateLabel,
            rawDate: targetDateStr,
            vacationType: vacType,
            timeRange: '09:00 - 18:00',
            memo: item.reason || '소속사 휴가 사용',
            status: item.status || 'APPROVED'
          };
        });
      }

      // 2. local dbService와 병합 (내 휴가 요청 건만 실시간 필터링)
      const currentEmpId = empId.toUpperCase().trim();
      const currentUserName = user?.name?.trim() || '';
      const localRequests = dbService.getRequests().filter(r => {
        if (r.requestType !== 'VACATION') return false;
        const rUserId = (r.userId || (r as any).employeeId || '').toUpperCase().trim();
        const rName = (r.userName || '').trim();
        return rUserId === currentEmpId || rUserId === (user.id || '').toUpperCase().trim() || (currentUserName && rName === currentUserName);
      });
      localRequests.forEach(loc => {
        if (!listFromD1.some(d1 => d1.id === loc.id)) {
          const targetDateStr = loc.targetDate || '2026-08-30';
          let dateLabel = targetDateStr;
          try {
            const d = new Date(targetDateStr);
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const dow = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()] || '평일';
            dateLabel = `${mm}/${dd}\n${dow}요일`;
          } catch (_) {}

          listFromD1.unshift({
            id: loc.id,
            dateLabel,
            rawDate: targetDateStr,
            vacationType: loc.reason.includes('체력단련') ? '체력단련휴가' : '연차',
            timeRange: loc.timeRange || '09:00 - 18:00',
            memo: loc.reason,
            status: loc.status
          });
        }
      });

      setVacationList(listFromD1);

      // 3. D1 DB 휴가 잔여 일수 조회
      const balRes = await fetch(`/api/vacation/balances?employee_id=${encodeURIComponent(empId)}`);
      if (balRes.ok) {
        const balJson = await balRes.json();
        if (balJson.data?.balances) {
          setBalances(balJson.data.balances);
        }
      }
    } catch (err) {
      console.warn('Failed to load vacation data from D1:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVacationDataFromD1();

    const handleUpdate = () => {
      fetchVacationDataFromD1();
    };

    window.addEventListener('attendance_request_updated', handleUpdate);
    window.addEventListener('notification_updated', handleUpdate);

    return () => {
      window.removeEventListener('attendance_request_updated', handleUpdate);
      window.removeEventListener('notification_updated', handleUpdate);
    };
  }, [user]);

  // 휴가 삭제 핸들러 (D1 DB 동기화)
  const handleDeleteVacation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('정말 해당 휴가 신청 내역을 취소 및 삭제하시겠습니까?\n삭제 시 D1 DB에서 영구 삭제되며 공수가 복원됩니다.')) return;

    try {
      await fetch(`/api/attendance/requests/${id}`, { method: 'DELETE' });
      setVacationList(prev => prev.filter(v => v.id !== id));
      dbService.deleteRequest(id);
      fetchVacationDataFromD1();
      alert('✅ D1 DB에서 휴가 신청 내역이 삭제되었습니다.');
    } catch (err) {
      alert('휴가 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleFabAction = (action: string) => {
    setIsFabOpen(false);
    if (action === 'create') {
      onOpenTypeSelect();
    } else if (action === 'edit') {
      alert('📝 휴가 수정은 목록에서 특정 일자를 터치하거나 새로운 소속사 휴가를 신청해 주세요.');
    } else {
      alert('🗑️ 취소하고자 하는 휴가 항목의 휴지통 아이콘을 터치해 주세요.');
    }
  };

  // 검색어 필터링
  const filteredList = vacationList.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.vacationType.toLowerCase().includes(q) ||
      item.memo.toLowerCase().includes(q) ||
      item.rawDate.toLowerCase().includes(q) ||
      item.dateLabel.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', paddingBottom: '70px' }}>
      {/* 1. 상단 검색창 & D1 새로고침 바 */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          height: '38px',
          background: '#F1F3F5',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          gap: '8px',
          flex: 1
        }}>
          <Search size={16} color="#8B95A1" />
          <input
            type="text"
            placeholder="휴가 유형, 사유, 일자 검색"
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
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#8B95A1', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={fetchVacationDataFromD1}
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            height: '38px',
            padding: '0 10px',
            color: '#475569',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="D1 DB 실시간 동기화"
        >
          <RotateCw size={13} className={isLoading ? 'spinning' : ''} />
          <span>동기화</span>
        </button>
      </div>

      {/* 2. 상단 탭: [내 휴가] vs [전체] */}
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
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <span>내 휴가</span>
          {activeTab === 'my' && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '3px',
              background: '#191F28',
              borderRadius: '2px'
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
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <span>전체 조직 휴가</span>
          {activeTab === 'all' && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '3px',
              background: '#191F28',
              borderRadius: '2px'
            }} />
          )}
        </button>
      </div>

      {/* 3. 상단 연차/휴가 실시간 잔여 현황 헤더 (Cloudflare D1 연동) */}
      <div style={{
        padding: '14px 18px 12px 18px',
        borderBottom: '1px solid #F1F3F5',
        background: '#FFFFFF'
      }}>
        {/* 날짜 선택기 & 상태 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <Calendar size={16} color="#0052FF" />
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#191F28' }}>
              2026.08.30(일) 기준
            </span>
            <ChevronDown size={14} color="#8B95A1" />
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', fontWeight: 700, color: '#6B7684' }}>
            <span style={{ width: '28px', textAlign: 'right' }}>총</span>
            <span style={{ width: '28px', textAlign: 'right' }}>사용</span>
            <span style={{ width: '28px', textAlign: 'right' }}>잔여</span>
          </div>
        </div>

        {/* 연차/휴가 유형별 수치 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {balances.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13.5px'
            }}>
              <span style={{ fontWeight: 800, color: '#191F28' }}>{item.name}</span>
              <div style={{ display: 'flex', gap: '20px', fontSize: '13.5px', fontWeight: 800 }}>
                <span style={{ width: '28px', textAlign: 'right', color: '#191F28' }}>{item.total}</span>
                <span style={{ width: '28px', textAlign: 'right', color: '#4E5968' }}>{item.used}</span>
                <span style={{
                  width: '28px',
                  textAlign: 'right',
                  color: item.remaining === '-' ? '#8B95A1' : item.remaining === '0' ? '#0046FF' : '#0052FF'
                }}>
                  {item.remaining}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. D1 DB 실시간 휴가 사용 내역 리스트 */}
      <div style={{ flex: 1, padding: '0 0 80px 0' }}>
        {filteredList.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#8B95A1' }}>
            <Plane size={36} color="#D1D5DB" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#334155' }}>
              등록된 휴가 내역이 없습니다.
            </div>
            <div style={{ fontSize: '12.5px', color: '#94A3B8', marginTop: '4px' }}>
              하단 + 버튼을 눌러 소속사 휴가를 신청해 보세요.
            </div>
          </div>
        ) : (
          filteredList.map((item) => {
            const isPending1 = item.status === 'PENDING';
            const isPendingDs = item.status === 'PENDING_DS';
            const isApproved = item.status === 'APPROVED';
            const isRejected = item.status === 'REJECTED';

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px 18px',
                  borderBottom: '1px solid #F1F3F5',
                  background: '#FFFFFF',
                  gap: '10px'
                }}
              >
                {/* 상단 기본 정보 및 상태 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: '#191F28',
                      lineHeight: 1.3,
                      whiteSpace: 'pre-line'
                    }}>
                      {item.dateLabel}
                    </div>

                    <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                          {item.vacationType}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          {item.timeRange}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        {item.memo}
                      </div>
                    </div>
                  </div>

                  {/* 삭제/취소 버튼 */}
                  <button
                    onClick={(e) => handleDeleteVacation(item.id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="휴가 취소/삭제"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* 🌟 3단계 결재 진행 상태 스텝 바 (실시간 트래커) */}
                <div style={{
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {/* 스텝 게이지 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', position: 'relative' }}>
                    {/* 1단계: 협력사 1차 결재 */}
                    <div style={{
                      padding: '6px 4px',
                      borderRadius: '6px',
                      background: isPending1 ? '#FEF3C7' : (isPendingDs || isApproved) ? '#DCFCE7' : '#F1F5F9',
                      border: isPending1 ? '1.5px solid #F59E0B' : (isPendingDs || isApproved) ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: isPending1 ? '#B45309' : (isPendingDs || isApproved) ? '#16A34A' : '#64748B'
                    }}>
                      ① 협력사 {isPending1 ? '검토중 ⏳' : '승인 완료 ✓'}
                    </div>

                    {/* 2단계: 신한DS 공정 검수 */}
                    <div style={{
                      padding: '6px 4px',
                      borderRadius: '6px',
                      background: isPendingDs ? '#EFF6FF' : isApproved ? '#DCFCE7' : '#F8FAFC',
                      border: isPendingDs ? '1.5px solid #3B82F6' : isApproved ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: isPendingDs ? '#1D4ED8' : isApproved ? '#16A34A' : '#94A3B8'
                    }}>
                      ② 원청DS {isPendingDs ? '검수중 📢' : isApproved ? '검수 완료 ✓' : '대기'}
                    </div>

                    {/* 3단계: 최종 승인 */}
                    <div style={{
                      padding: '6px 4px',
                      borderRadius: '6px',
                      background: isApproved ? '#DCFCE7' : isRejected ? '#FEE2E2' : '#F8FAFC',
                      border: isApproved ? '1.5px solid #16A34A' : isRejected ? '1.5px solid #EF4444' : '1px solid #E2E8F0',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: isApproved ? '#15803D' : isRejected ? '#DC2626' : '#94A3B8'
                    }}>
                      ③ {isApproved ? '최종 완료 🎉' : isRejected ? '반려 ❌' : '최종 확정'}
                    </div>
                  </div>

                  {/* 현재 진행 상태 한줄 요약 안내 */}
                  <div style={{ fontSize: '11.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isPending1 && (
                      <span style={{ color: '#D97706', fontWeight: 700 }}>
                        ⏳ 소속사 현장대리인의 1차 결재 승인을 기다리고 있습니다.
                      </span>
                    )}
                    {isPendingDs && (
                      <span style={{ color: '#2563EB', fontWeight: 700 }}>
                        📢 협력사 1차 승인 완료! 원청 신한DS 현장대리인(PM)의 공정 검수 대기 중입니다.
                      </span>
                    )}
                    {isApproved && (
                      <span style={{ color: '#16A34A', fontWeight: 700 }}>
                        ✅ 원청 신한DS 최종 검수 완료! 공수 정산에 정상 반영되었습니다.
                      </span>
                    )}
                    {isRejected && (
                      <span style={{ color: '#DC2626', fontWeight: 700 }}>
                        ❌ 휴가 신청이 반려되었습니다. 사유를 확인 후 다시 상신해 주세요.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. 플로팅 액션 버튼 (FAB: + 휴가 신청) */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
        zIndex: 100
      }}>
        {isFabOpen && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'flex-end',
            marginBottom: '4px'
          }}>
            <button
              onClick={() => handleFabAction('create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: '#FFFFFF',
                color: '#191F28',
                borderRadius: '20px',
                border: '1px solid #E5E8EB',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Plus size={16} color="#0052FF" />
              <span>소속사 휴가 신청</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: primaryColor,
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0, 82, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transform: isFabOpen ? 'rotate(45deg)' : 'none',
            transition: 'transform 0.2s ease'
          }}
          aria-label="휴가 신청 메뉴 열기"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};
