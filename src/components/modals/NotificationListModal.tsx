import React from 'react';
import { X, Bell, AlertTriangle, Calendar, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { DbAppNotification } from '../../services/db';

interface NotificationListModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DbAppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate?: (linkUrl?: string) => void;
}

export const NotificationListModal: React.FC<NotificationListModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigate
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
        maxWidth: '420px',
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
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                모두 읽음
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#E2E8F0',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
              <Bell size={36} strokeWidth={1.5} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>수신된 알림이 없습니다.</p>
            </div>
          ) : (
            notifications.map((noti) => (
              <div
                key={noti.id}
                onClick={() => {
                  onMarkRead(noti.id);
                  if (noti.linkUrl && onNavigate) {
                    onNavigate(noti.linkUrl);
                    onClose();
                  }
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: noti.isRead ? '#F8FAFC' : '#EFF6FF',
                  border: noti.isRead ? '1px solid #E2E8F0' : '1px solid #BFDBFE',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {getIcon(noti.type)}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: noti.isRead ? '#64748B' : '#0052FF' }}>
                      [{noti.partName} 파트]
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{noti.createdAt}</span>
                  </div>
                  <h4 style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    {noti.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                    {noti.content}
                  </p>
                </div>
                {!noti.isRead && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0052FF', marginTop: '6px' }} />
                )}
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
  );
};
