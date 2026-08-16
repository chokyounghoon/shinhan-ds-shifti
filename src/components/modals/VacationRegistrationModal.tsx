import React, { useState } from 'react';
import { X, Calendar, ShieldCheck, Megaphone, CheckCircle2, Building2, Clock, AlertCircle, Send } from 'lucide-react';
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
  const [vacationType, setVacationType] = useState<string>('연차(소속사 승인)');
  const [startDate, setStartDate] = useState<string>('2026-08-17');
  const [endDate, setEndDate] = useState<string>('2026-08-18');
  const [reason, setReason] = useState<string>('소속사(유브갓) 복무규정에 따른 하계 정기 연차 승인에 따른 부재');

  if (!isOpen) return null;

  const partnerCompany = currentUser.partnerCompany || currentUser.companyName || '유브갓';
  const workerName = currentUser.name.split(' ')[0] || '송무준';

  const handleRegister = () => {
    if (!startDate || !endDate) {
      alert('공백 발생 일정을 선택해주세요.');
      return;
    }
    if (!reason.trim()) {
      alert('통보 사유를 입력해주세요.');
      return;
    }

    const dateRange = startDate === endDate ? startDate : `${startDate} ~ ${endDate}`;
    
    // DB에 도급 투입 공백 사전 통보 등록
    dbService.addRequest({
      id: `req-vac-${Date.now()}`,
      userId: currentUser.id,
      userName: workerName,
      userDept: currentUser.deptName || '상담팀',
      partnerApproverName: `${partnerCompany} 현장관리인 (영업대표)`,
      requestType: 'VACATION',
      targetDate: dateRange,
      timeRange: vacationType.includes('반차') ? '0.5 M/D 공백' : '전일 (1.0 M/D 공백)',
      hours: vacationType.includes('반차') ? 4 : 8,
      reason: `[투입 공백 사전 통보] 본 협력사(${partnerCompany}) 소속 ${workerName} 직원이 ${dateRange} 기간 개인 사정(${vacationType})으로 투입 불가(공백 발생)함을 사전 통보합니다.`,
      status: 'APPROVED', // 협력사 자체 승인 완료 상태
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      approvalMemo: `협력사 자체 휴가 승인 완료 ➔ DS PM 공정 투입 공백 사전 통보서 발송`
    });

    onSuccess(vacationType, dateRange);
    alert(`📢 [투입 공백 사전 통보 완료]\n• 통보 대상: 신한DS 현장대리인 (PM) 귀하\n• 대상 직원: [${partnerCompany}] ${workerName}\n• 공백 기간: ${dateRange} (${vacationType})\n\n🛡️ [법적 컴플라이언스 보호]\n본 통보는 원청(신한DS)의 '휴가 승인' 절차가 아니며, 협력사의 [투입 공백 사전 통보] 공문입니다. DS PM은 '공정 투입 공백 확인(검수)'만 수행하게 됩니다.`);
    onClose();
  };

  const vacationTypes = [
    { label: '연차 (전일 공백)', val: '연차(전일 공백)', desc: '1.0 M/D 투입 공백 발생' },
    { label: '오전 반차 (오전 공백)', val: '오전반차(오전 공백)', desc: '0.5 M/D 오후 투입 예정' },
    { label: '오후 반차 (오후 공백)', val: '오후반차(오후 공백)', desc: '0.5 M/D 오전 투입 예정' },
    { label: '체력단련휴가', val: '체력단련휴가', desc: '소속사 자체 유급 특별휴가' },
    { label: '경조사 부재', val: '경조사 부재', desc: '경조사로 인한 투입 공백' },
    { label: '병가 / 공가', val: '병가/공가', desc: '진단서 첨부 및 부재' }
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
        maxWidth: '440px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Megaphone size={20} color="#0052FF" />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: '#191F28' }}>
                투입 공백 사전 통보 (부재 공유)
              </div>
              <div style={{ fontSize: '11.5px', color: '#6B7684' }}>
                휴가 결재(승인) 대체 ➔ 원청 DS PM 앞 사전 공문 발송
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
          
          {/* 법적 컴플라이언스 3단계 안내 배너 */}
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '11.5px',
            color: '#15803D',
            lineHeight: 1.5
          }}>
            🛡️ <strong>[도급 관리 컴플라이언스 원칙]</strong><br />
            1. 협력사 직원은 <strong>소속사({partnerCompany})에 휴가를 신청·승인</strong>받습니다.<br />
            2. 협력사는 원청(신한DS) PM에게 <strong>'투입 공백 사전 통보'</strong>를 발송합니다.<br />
            3. DS PM은 휴가를 승인하는 것이 아니라 <strong>'공정 투입 공백 확인(검수)'</strong>만 수행합니다.
          </div>

          {/* 공백 유형 선택 */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
              공백 유형 (소속사 자체 승인 항목) *
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

          {/* 공백 발생 기간 선택 */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
              투입 공백 발생 기간 *
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

          {/* 원청 PM 앞 통보 공문 미리보기 */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
              원청(신한DS PM) 앞 사전 통보 공문 내용 *
            </label>
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '12.5px',
              color: '#1E293B',
              lineHeight: 1.55
            }}>
              <div style={{ fontWeight: 800, color: '#0052FF', marginBottom: '4px' }}>
                [수신: 신한DS 현장대리인(PM) 귀하]
              </div>
              "본 협력사(<strong>{partnerCompany}</strong>) 소속 <strong>{workerName}</strong> 직원이 <strong>{startDate} ~ {endDate}</strong> 기간 동안 개인 사정(<strong>{vacationType}</strong>)으로 인하여 도급 현장 투입이 불가(공백 발생)함을 사전 통보합니다."
            </div>
          </div>

          {/* 상세 사유 */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px' }}>
              상세 사유 (소속사 내부 관리용)
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="예: 소속사 하계 연차 승인에 따른 부재"
              style={{
                width: '100%',
                height: '40px',
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
              fontSize: '14.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 82, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Send size={17} />
            <span>투입 공백 사전 통보서 발송</span>
          </button>
        </div>
      </div>
    </div>
  );
};
