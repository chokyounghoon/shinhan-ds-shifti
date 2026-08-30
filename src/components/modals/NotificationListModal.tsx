import React from 'react';
import { X, Bell, AlertTriangle, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
import { DbAppNotification } from '../../services/db';
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
  if (!isOpen) return null;

  // 🔔 알림 목록 최신순 (생성일시 기준 내림차순) 정렬 및 중복 제거
  const sortedNotifications = [...notifications]
    .sort((a, b) => {
      const timeA = a.createdAt || '';
      const timeB = b.createdAt || '';
      return timeB.localeCompare(timeA);
    })
    .filter((noti, idx, arr) => {
      // 동일한 제목 및 분 단위 생성 시점의 중복 알림 배제
      const notiTitle = (noti.title || '').trim().replace(/\s+/g, ' ');
      const notiTime = (noti.createdAt || '').slice(0, 16);
      return idx === arr.findIndex(item => {
        const itemTitle = (item.title || '').trim().replace(/\s+/g, ' ');
        const itemTime = (item.createdAt || '').slice(0, 16);
        return itemTitle === notiTitle && itemTime === notiTime;
      });
    });

  const unreadCount = sortedNotifications.filter(n => !n.isRead).length;

  // 날짜/시간 포맷 헬퍼 (한국 표준시 KST YYYY-MM-DD HH:mm:ss)
  const formatDateTimeSec = (dateStr?: string | null): string => {
    return formatKstDateTime(dateStr);
  };

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
                  padding: '14px',
                  borderRadius: '14px',
                  background: noti.isRead ? '#F8FAFC' : '#F0F7FF',
                  border: noti.isRead ? '1px solid #E2E8F0' : '1.5px solid #BFDBFE',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                {getIcon(noti.type)}

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: noti.isRead ? 700 : 800, color: noti.isRead ? '#334155' : '#0F172A' }}>
                      {noti.title}
                    </span>
                    {!noti.isRead && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0052FF' }} />
                    )}
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                    {noti.content}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                      {formatDateTimeSec(noti.createdAt)}
                    </span>
                    {(noti.linkUrl || onNavigateNotification) && (
                      <span style={{ fontSize: '11px', color: '#0052FF', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                        상세보기 <ChevronRight size={12} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 모달 푸터 */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #F1F5F9',
          background: '#FAFAFA',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#0052FF',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
