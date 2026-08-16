import React, { useState } from 'react';
import { X, Calendar, ShieldCheck, Sun, CheckCircle2, Building2, Clock, AlertCircle } from 'lucide-react';
import { dbService } from '../../services/db';
import { User } from '../../types';

interface VacationRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (type: string, dateRange: string) => void;
  currentUser?: User;
  themeMode: 'ddangyo' | 'shinhan';
}

export const VacationRegistrationModal: React.FC<VacationRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser = dbService.getCurrentUser(),
  themeMode
}) => {
  const [vacationType, setVacationType] = useState<string>('연차');
  const [startDate, setStartDate] = useState<string>('2026-08-17');
  const [endDate, setEndDate] = useState<string>('2026-08-18');
  const [reason, setReason] = useState<string>('소속사(유브갓) 복무규정에 따른 하계 정기 연차 휴가 사용');

  if (!isOpen) return null;

  const partnerCompany = currentUser.partnerCompany || '유브갓';

  const handleRegister = () => {
    if (!startDate || !endDate) {
      alert('휴가 일정을 선택해주세요.');
      return;
    }
    if (!reason.trim()) {
      alert('휴가 사유를 입력해주세요.');
      return;
    }

    const dateRange = startDate === endDate ? startDate : `${startDate} ~ ${endDate}`;
    
    // DB에 도급 사전 공수 제외(휴가) 등록
    dbService.addRequest({
      id: `req-vac-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name.split(' ')[0],
      userDept: currentUser.deptName || '상담팀',
      partnerApproverName: `${partnerCompany} 현장관리인 (영업대표)`,
      requestType: 'VACATION',
      targetDate: dateRange,
      timeRange: vacationType.includes('반차') ? '0.5 M/D' : '전일 (1.0 M/D)',
      hours: vacationType.includes('반차') ? 4 : 8,
      reason: reason,
      status: 'APPROVED', // 소속사 사전 승인 연동
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      approvalMemo: `${partnerCompany} 현장관리인 전결 승인 및 당일 도급 공수 사전 제외 완료`
    });

    onSuccess(vacationType, dateRange);
    alert(`🎉 [${vacationType}] 휴가 등록이 완료되었습니다!\n• 일정: ${dateRange}\n• 승인 주체: ${partnerCompany} 현장관리인 (영업대표)\n\n🛡️ [도급 공정 보호 조치]\n해당 일자는 사전 승인 휴무로 등록되어 원청(신한DS) 도급 투입 계획에서 자동 제외(예정 공수 0 M/D)되며, 지각/미투입 패널티가 발생하지 않습니다.`);
    onClose();
  };

  const vacationTypes = [
    { label: '연차 (1 M/D)', val: '연차', desc: '전일 휴무 (투입 공수 0 M/D)' },
    { label: '오전 반차 (0.5 M/D)', val: '오전반차', desc: '오후 투입 (0.5 M/D 인정)' },
    { label: '오후 반차 (0.5 M/D)', val: '오후반차', desc: '오전 투입 (0.5 M/D 인정)' },
    { label: '체력단련휴가', val: '체력단련휴가', desc: '소속사 유급 특별 휴가' },
    { label: '경조 휴가', val: '경조휴가', desc: '경조사 관련 유급 휴가' },
    { label: '병가 / 공가', val: '병가', desc: '진단서 첨부 요망' }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        maxHeight: '92vh',
        background: '#FFFFFF',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 1. 헤더 */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid #ECEFF2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sun size={20} color="#0052FF" />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: '#191F28' }}>
                휴가 / 사전 공수 제외 등록
              </div>
              <div style={{ fontSize: '11.5px', color: '#6B7684' }}>
                소속 협력사({partnerCompany}) 복무규정 기준
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#8B95A1', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. 본문 */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 법적 컴플라이언스 안내 배너 */}
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '11.5px',
            color: '#15803D',
            lineHeight: 1.45
          }}>
            🛡️ <strong>[도급 공수 사전 제외 원칙]</strong>: 본 휴가 등록은 원청(신한DS)의 승인이 아닌 <strong>소속사({partnerCompany}) 현장관리인 전결</strong>로 처리되며, 해당 일자의 도급 투입 의무(예정 공수)에서 자동 제외됩니다.
          </div>

          {/* 휴가 종류 선택 (그리드) */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
              휴가 종류 *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {vacationTypes.map(t => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => setVacationType(t.val)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: vacationType === t.val ? '2px solid #0052FF' : '1px solid #E2E8F0',
                    background: vacationType === t.val ? '#EFF6FF' : '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 800, color: vacationType === t.val ? '#0052FF' : '#1E293B' }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 대상 기간 선택 */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
              휴가 기간 *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px' }}>시작일</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '0 10px',
                    fontSize: '13px',
                    color: '#1E293B',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px' }}>종료일</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '0 10px',
                    fontSize: '13px',
                    color: '#1E293B',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* 사유 입력란 */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
              휴가 사유 (소속사 제출용) *
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="휴가 사유를 상세히 입력하세요."
              style={{
                width: '100%',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '13px',
                color: '#1E293B',
                outline: 'none',
                resize: 'none',
                lineHeight: 1.4,
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 승인처 안내 카드 */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '11.5px',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Building2 size={16} color="#0052FF" />
            <span>결재선: <strong>[{partnerCompany}] 현장관리인 (영업대표) 전결 승인</strong></span>
          </div>
        </div>

        {/* 3. 하단 액션 버튼 */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #ECEFF2',
          display: 'flex',
          gap: '10px',
          background: '#F8FAFC'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: '46px',
              borderRadius: '10px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#475569',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleRegister}
            style={{
              flex: 2,
              height: '46px',
              borderRadius: '10px',
              background: 'linear-gradient(90deg, #0052FF 0%, #0066FF 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 82, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={18} />
            <span>휴가 등록 및 소속사 제출</span>
          </button>
        </div>
      </div>
    </div>
  );
};
