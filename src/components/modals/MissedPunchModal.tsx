import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Clock, MapPin } from 'lucide-react';

interface MissedPunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRequest: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const MissedPunchModal: React.FC<MissedPunchModalProps> = ({
  isOpen,
  onClose,
  onOpenRequest,
  themeMode
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>출근/퇴근 누락 기록</h3>
            <p style={{ fontSize: '12px', color: '#6B7684' }}>미체크 및 미인식된 타임로그 소명</p>
          </div>
          <button onClick={onClose} style={{ color: '#8B95A1' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{
          background: '#F8F9FA',
          padding: '24px 16px',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #ECEFF2',
          marginBottom: '18px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#E8F8F0',
            color: '#12B76A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <CheckCircle2 size={28} />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', marginBottom: '4px' }}>
            현재 누락된 출퇴근 기록이 없습니다.
          </div>
          <div style={{ fontSize: '12px', color: '#8B95A1' }}>
            최근 30일간 모든 출퇴근 및 휴가 일정이 정상 처리되었습니다.
          </div>
        </div>

        <div style={{
          padding: '14px',
          borderRadius: '10px',
          background: '#FFF9F0',
          border: '1px solid #FFE7BA',
          marginBottom: '18px',
          fontSize: '12px',
          color: '#873800',
          lineHeight: 1.5
        }}>
          <strong>💡 출퇴근 기록 누락 시 대처 방법:</strong><br />
          출입 게이트 태그 오류나 시스템 점검으로 누락된 경우, 아래 [소명 신청하기]를 통해 실제 입실 시간과 업무 증빙을 제출하시면 관리자 승인 후 반영됩니다.
        </div>

        <button
          onClick={() => {
            onClose();
            onOpenRequest();
          }}
          style={{
            width: '100%',
            height: '46px',
            background: themeMode === 'ddangyo' ? '#FF462D' : '#0046FF',
            color: '#FFFFFF',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span>누락 소명 신청하기</span>
        </button>
      </div>
    </div>
  );
};
