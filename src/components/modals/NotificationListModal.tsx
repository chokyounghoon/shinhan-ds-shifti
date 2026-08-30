import React, { useState } from 'react';
import { X, Bell, AlertTriangle, Calendar, CheckCircle2, ChevronRight, Check, Scale, ShieldCheck } from 'lucide-react';
import { DbAppNotification } from '../../services/db';
import { YellowEnvelopeComplianceModal } from './YellowEnvelopeComplianceModal';
import { formatKstDateTime } from '../../utils/dateUtils';

interface NotificationListModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DbAppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate?: (linkUrl?: string) => void;
  onNavigateNotification?: (noti: DbAppNotification) => void;
  themeMode?: 'ddangyo' | 'shinhan';
}

export const NotificationListModal: React.FC<NotificationListModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
  onNavigateNotification,
  themeMode = 'shinhan'
}) => {
  const [isYellowEnvelopeModalOpen, setIsYellowEnvelopeModalOpen] = useState(false);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 날짜/시간 포맷 헬퍼 (한국 표준시 KST YYYY-MM-DD HH:mm:ss)
  const formatDateTimeSec = (dateStr?: string | null): string => {
    return formatKstDateTime(dateStr);
  };

  // 🔔 알림 목록 최신순 (생성일시 기준 내림차순) 정렬
  const sortedNotifications = [...notifications].sort((a, b) => {
    const timeA = a.createdAt || '';
    const timeB = b.createdAt || '';
    return timeB.localeCompare(timeA);
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'SLA_ALERT':
        return <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AlertTriangle size={18} /></div>;
      case 'GAP_NOTICE':
        return <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Calendar size={18} /></div>;
      case 'CONTRACT_SETTLE':
        return <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CheckCircle2 size={18} /></div>;
      default:
        return <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bell size={18} /></div>;
    }
  };

  const handleItemClick = (noti: DbAppNotification) => {
    onMarkRead(noti.id);
    if (onNavigateNotification) {
      onNavigateNotification(noti);
    } else if (noti.linkUrl && onNavigate) {
      onNavigate(noti.linkUrl);
    }
    onClose();
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px',
        backdropFilter: 'blur(3px)'
      }}>
        <div style={{
          background: '#FFFFFF',
          width: '100%',
          maxWidth: '430px',
          maxHeight: '85vh',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.2s ease-out'
        }}>
          {/* 모달 헤더 */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FAFAFA'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#0052FF',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bell size={16} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                  알림 센터
                </h3>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B' }}>
                  미확인 알림 <span style={{ color: '#0052FF', fontWeight: 700 }}>{unreadCount}건</span>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setIsYellowEnvelopeModalOpen(true)}
                title="노란봉투법 및 적법 도급 컴플라이언스 진단 결과 보기"
                style={{
                  padding: '5px 9px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                  border: '1px solid #F59E0B',
                  color: '#92400E',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Scale size={12} />
                <span>노란봉투법</span>
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '6px',
                    background: '#F1F5F9',
                    border: 'none',
                    color: '#475569',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  모두 읽음
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* 알림 목록 본문 */}
          <div style={{
            padding: '12px 16px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div
              onClick={() => setIsYellowEnvelopeModalOpen(true)}
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                border: '1.5px solid #F59E0B',
                color: '#FFFFFF',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#FBBF24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Scale size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#FBBF24' }}>
                    [법적 컴플라이언스 인증]
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#38BDF8', fontWeight: 700 }}>
                    100% 적합 ➔
                  </span>
                </div>
                <h4 style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                  노란봉투법(노조법 제2조) 및 적법 도급 검증 완료
                </h4>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.35 }}>
                  지휘명령 분리, 인사노무 자율권, D1 감사 원장 및 기성 검수 체계 완비
                </p>
              </div>
            </div>

            {sortedNotifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
                <Bell size={36} strokeWidth={1.5} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>수신된 알림이 없습니다.</p>
              </div>
            ) : (
              sortedNotifications.map((noti) => (
                <div
                  key={noti.id}
                  onClick={() => handleItemClick(noti)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: noti.isRead ? '#F8FAFC' : '#EFF6FF',
                    border: noti.isRead ? '1px solid #E2E8F0' : '1px solid #BFDBFE',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    {getIcon(noti.type)}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: noti.isRead ? '#64748B' : '#0052FF' }}>
                          [{noti.partName || '도급 관리'} 파트]
                        </span>
                        <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600 }}>{formatDateTimeSec(noti.createdAt)}</span>
                      </div>
                      <h4 style={{ margin: '0 0 3px', fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                        {noti.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                        {noti.content}
                      </p>
                    </div>
                    {!noti.isRead && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0052FF', marginTop: '6px', flexShrink: 0 }} />
                    )}
                  </div>

                  {/* 🔗 클릭 유도 액션 버튼 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    paddingTop: '6px',
                    borderTop: '1px dashed #E2E8F0',
                    marginTop: '2px'
                  }}>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: noti.isRead ? '#64748B' : '#0052FF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      👉 해당 관리 화면으로 바로가기 <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        {/* 모달 하단 푸터 */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', background: '#FAFAFA', textAlign: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              background: '#0F172A',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none'
            }}
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>

    {/* 노란봉투법 및 적법 도급 컴플라이언스 진단 모달 */}
    <YellowEnvelopeComplianceModal
      isOpen={isYellowEnvelopeModalOpen}
      onClose={() => setIsYellowEnvelopeModalOpen(false)}
      themeMode={themeMode}
    />
  </>
  );
};
