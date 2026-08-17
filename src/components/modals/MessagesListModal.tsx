import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2, User, Clock, Building } from 'lucide-react';
import { DbAppMessage } from '../../services/db';

interface MessagesListModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: DbAppMessage[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  currentUserRole?: string;
}

export const MessagesListModal: React.FC<MessagesListModalProps> = ({
  isOpen,
  onClose,
  messages,
  onMarkRead,
  onMarkAllRead,
  currentUserRole
}) => {
  const [selectedMsg, setSelectedMsg] = useState<DbAppMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySentMap, setReplySentMap] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const unreadCount = messages.filter(m => !m.isRead).length;

  const handleSendReply = () => {
    if (!selectedMsg || !replyText.trim()) return;
    setReplySentMap(prev => ({
      ...prev,
      [selectedMsg.id]: replyText.trim()
    }));
    setReplyText('');
    alert('답변 및 확인 메시지가 협력사 관리자 앞 실시간 전송되었습니다.');
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
        {/* 헤더 */}
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
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                도급 소통 / 메시지함
              </h3>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B' }}>
                미확인 메시지 <span style={{ color: '#0052FF', fontWeight: 700 }}>{unreadCount}건</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {unreadCount > 0 && !selectedMsg && (
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
              onClick={() => { setSelectedMsg(null); onClose(); }}
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

        {/* 본문: 세부 보기 or 리스트 */}
        {selectedMsg ? (
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button
              type="button"
              onClick={() => setSelectedMsg(null)}
              style={{
                alignSelf: 'flex-start',
                padding: '4px 8px',
                borderRadius: '6px',
                background: '#F1F5F9',
                color: '#475569',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ← 목록으로 돌아가기
            </button>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0052FF', background: '#DBEAFE', padding: '2px 8px', borderRadius: '6px' }}>
                  {selectedMsg.partName} 파트
                </span>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>{selectedMsg.createdAt}</span>
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                {selectedMsg.title}
              </h4>
              <p style={{ margin: '0 0 10px', fontSize: '11.5px', color: '#64748B' }}>
                발신: {selectedMsg.senderName} ({selectedMsg.senderRole})
              </p>
              <div style={{ padding: '10px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
                {selectedMsg.content}
              </div>
            </div>

            {/* 발송된 답변 표시 */}
            {replySentMap[selectedMsg.id] && (
              <div style={{ background: '#EFF6FF', padding: '12px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0052FF', fontSize: '11.5px', fontWeight: 800, marginBottom: '4px' }}>
                  <CheckCircle2 size={14} />
                  <span>내 회신 완료</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#1E293B' }}>
                  {replySentMap[selectedMsg.id]}
                </p>
              </div>
            )}

            {/* 답변 입력 폼 */}
            {!replySentMap[selectedMsg.id] && (
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>
                  회신 및 확인 메시지 작성:
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="협력사 관리자에게 전달할 확인 답변 또는 지침을 입력해 주세요..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleSendReply}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#0052FF',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={14} />
                  <span>회신 전송하기</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            padding: '12px 16px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
                <MessageSquare size={36} strokeWidth={1.5} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>수신된 메시지가 없습니다.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    onMarkRead(msg.id);
                    setSelectedMsg(msg);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: msg.isRead ? '#F8FAFC' : '#EFF6FF',
                    border: msg.isRead ? '1px solid #E2E8F0' : '1px solid #BFDBFE',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: msg.isRead ? '#64748B' : '#0052FF' }}>
                      {msg.senderName} ({msg.senderRole})
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{msg.createdAt}</span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    {msg.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {msg.content}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#0052FF', background: '#DBEAFE', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      {msg.partName} 파트
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#0052FF' }}>
                      열람 및 회신 →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 푸터 */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', background: '#FAFAFA', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => { setSelectedMsg(null); onClose(); }}
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
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
