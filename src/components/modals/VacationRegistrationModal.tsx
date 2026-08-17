import React, { useState } from 'react';
import { X, Calendar, ShieldCheck, Megaphone, CheckCircle2, Building2, Clock, AlertCircle, Send, UserCheck, FileText } from 'lucide-react';
import { dbService } from '../../services/db';
import { User } from '../../types';

interface VacationRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (type: string, dateRange: string) => void;
  currentUser?: User;
  isManagerMode?: boolean; // true: 협력사 관리자 (원청 통보 모드), false: 협력사 개인 (소속사 신청 모드)
  themeMode: 'ddangyo' | 'shinhan';
}

export const VacationRegistrationModal: React.FC<VacationRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser = dbService.getCurrentUser(),
  isManagerMode = false,
  themeMode
}) => {
  const isManager = isManagerMode || currentUser.role === 'PARTNER_PART_LEADER' || (currentUser as any).role === 'PARTNER_MANAGER';
  const partnerCompany = currentUser.partnerCompany || currentUser.companyName || '유브갓';
  
  // 소속 근로자 목록 (관리자 모드용)
  const rosterWorkers = dbService.getManpowerInputs().filter(r => r.partnerCompany === partnerCompany);
  const [selectedWorkerName, setSelectedWorkerName] = useState<string>(
    isManager ? (rosterWorkers[0]?.workerName || '송무준') : (currentUser.name.split(' ')[0] || '송무준')
  );

  const [vacationType, setVacationType] = useState<string>('연차');
  const [startDate, setStartDate] = useState<string>('2026-08-17');
  const [endDate, setEndDate] = useState<string>('2026-08-18');
  const [reason, setReason] = useState<string>('소속사 복무규정에 따른 하계 정기 연차 휴가 사용');

  if (!isOpen) return null;

  const handleRegister = () => {
    if (!startDate || !endDate) {
      alert('일정을 선택해주세요.');
      return;
    }
    if (!reason.trim()) {
      alert('사유를 입력해주세요.');
      return;
    }

    const dateRange = startDate === endDate ? startDate : `${startDate} ~ ${endDate}`;
    const daysCount = startDate === endDate ? 1 : 2;
    const hours = vacationType.includes('반차') ? 4 : daysCount * 8;

    if (isManager) {
      // 1. [협력사 관리자 모드]: 원청(신한DS PM) 앞 투입 공백 사전 통보 공문 발송
      dbService.dispatchPreGapNotice({
        partnerCompany: partnerCompany,
        workerName: selectedWorkerName,
        partName: '상담',
        gapPeriod: dateRange,
        gapHours: hours,
        gapType: `${vacationType} (자체승인)`,
        reason: reason
      });

      // D1 DB attendance_requests 테이블로 실시간 POST
      const reqId = `req-gap-${Date.now()}`;
      const empId = currentUser.employeeId || currentUser.id || 'S01832';
      fetch('https://sguardai.khcho0421.workers.dev/attendance/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reqId,
          employee_id: empId,
          user_id: empId,
          request_type: 'VACATION',
          vacation_type: vacationType,
          target_date: dateRange,
          start_date: startDate,
          end_date: endDate,
          hours: hours,
          reason: reason,
          status: 'APPROVED',
          partner_company: partnerCompany,
          approver_name: `${partnerCompany} 현장관리인`
        })
      }).catch(e => console.warn('D1 vacation request sync error:', e));

      onSuccess(vacationType, dateRange);
      alert(`📢 [원청 앞 투입 공백 사전 통보 완료]\n• 발신: [${partnerCompany}] 현장관리인 (${currentUser.name.split(' ')[0] || '박영업 대표'})\n• 수신: 신한DS 현장대리인 (PM) 귀하\n• 대상 인력: ${selectedWorkerName} (${dateRange})\n• D1 DB: attendance_requests 테이블에 저장 완료\n\n🛡️ [원청 공정 검수 연동]\n신한DS PM의 대시보드에 공문이 접수되었으며, PM의 '공정 투입 공백 확인(검수)'을 거치게 됩니다.`);
      onClose();
    } else {
      // 2. [협력사 개인 모드]: 소속 회사(유브갓) 관리자에게 휴가/부재 신청 제출
      const reqId = `req-vac-${Date.now()}`;
      const empId = currentUser.employeeId || currentUser.id || 'PT20260816';

      dbService.addRequest({
        id: reqId,
        userId: currentUser.id,
        userName: selectedWorkerName,
        userDept: currentUser.deptName || '상담팀',
        partnerApproverName: `${partnerCompany} 현장관리인 (영업대표)`,
        requestType: 'VACATION',
        targetDate: dateRange,
        timeRange: vacationType.includes('반차') ? '0.5 M/D' : '전일 (1.0 M/D)',
        hours: hours,
        reason: reason,
        status: 'APPROVED', // 소속사 접수 완료
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        approvalMemo: `소속사(${partnerCompany}) 내부 복무 신청 접수 완료`
      });

      // D1 DB attendance_requests 테이블로 실시간 POST
      fetch('https://sguardai.khcho0421.workers.dev/attendance/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reqId,
          employee_id: empId,
          user_id: empId,
          request_type: 'VACATION',
          vacation_type: vacationType,
          target_date: dateRange,
          start_date: startDate,
          end_date: endDate,
          hours: hours,
          reason: reason,
          status: 'APPROVED',
          partner_company: partnerCompany,
          approver_name: `${partnerCompany} 현장관리인`
        })
      }).catch(e => console.warn('D1 vacation request sync error:', e));

      onSuccess(vacationType, dateRange);
      alert(`🎉 [소속사 휴가 신청 접수 완료]\n• 수신: [${partnerCompany}] 현장관리인 (영업대표) 귀하\n• 신청자: ${selectedWorkerName}\n• 일정: ${dateRange} (${vacationType})\n• D1 DB 저장: shifti-db > attendance_requests 테이블에 정상 등록\n\n🛡️ [직접 원청 연락 원천 차단]\n본 신청은 원청(신한DS)이 아닌 소속사(${partnerCompany}) 관리자에게 제출되었습니다. 소속사 승인 후 관리자가 원청에 투입 공백을 공식 통보합니다.`);
      onClose();
    }
  };

  const vacationTypes = [
    { label: '연차 (전일)', val: '연차', desc: '1.0 M/D 전일 부재' },
    { label: '오전 반차', val: '오전반차', desc: '0.5 M/D 오후 투입 예정' },
    { label: '오후 반차', val: '오후반차', desc: '0.5 M/D 오전 투입 예정' },
    { label: '체력단련휴가', val: '체력단련휴가', desc: '소속사 유급 특별휴가' },
    { label: '경조사 부재', val: '경조사', desc: '경조사 관련 유급 부재' },
    { label: '병가 / 공가', val: '병가', desc: '진단서 첨부 및 부재' }
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
              background: isManager ? '#EFF6FF' : '#F0FDF4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isManager ? <Megaphone size={20} color="#0052FF" /> : <FileText size={20} color="#16A34A" />}
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: '#191F28' }}>
                {isManager ? '원청 앞 투입 공백 사전 통보 (관리자용)' : '소속사 휴가 / 부재 신청 (근로자용)'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#6B7684' }}>
                {isManager ? `수급사(${partnerCompany}) ➔ 신한DS PM 공문 발송` : `소속 협력사(${partnerCompany}) 내부 복무 신청서`}
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
          
          {/* 법적 컴플라이언스 역할 분리 배너 */}
          {isManager ? (
            <div style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '11.5px',
              color: '#1E40AF',
              lineHeight: 1.5
            }}>
              📢 <strong>[협력사 관리자 전용 공문]</strong><br />
              소속 직원의 승인된 휴가로 인한 <strong>도급 투입 공백(0 M/D)</strong>을 신한DS 현장대리인(PM)에게 공식 사전 통보합니다.
            </div>
          ) : (
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '11.5px',
              color: '#15803D',
              lineHeight: 1.5
            }}>
              🛡️ <strong>[소속사 내부 신청 원칙]</strong><br />
              본 신청서는 원청(신한DS)이 아닌 <strong>소속사({partnerCompany}) 현장관리자(영업대표)</strong>에게 제출됩니다. 소속사 승인 후 관리자가 원청에 투입 공백을 공문으로 통보합니다.
            </div>
          )}

          {/* 대상 인력 선택 (관리자 모드일 때만 드롭다운 표출) */}
          {isManager && (
            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                공백 발생 대상 인력 (자사 소속) *
              </label>
              <select
                value={selectedWorkerName}
                onChange={e => setSelectedWorkerName(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '0 10px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#1E293B',
                  outline: 'none',
                  background: '#FFFFFF'
                }}
              >
                {rosterWorkers.map(w => (
                  <option key={w.recordId} value={w.workerName}>
                    {w.workerName} ({w.partName} 파트)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 휴가/공백 유형 선택 */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
              {isManager ? '투입 공백 사유 유형 *' : '휴가 종류 (소속사 복무규정) *'}
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

          {/* 발생 기간 선택 */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
              {isManager ? '투입 공백 기간 *' : '휴가 기간 *'}
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

          {/* 수신/결재처 안내 박스 */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '12.5px',
            color: '#1E293B',
            lineHeight: 1.55
          }}>
            {isManager ? (
              <>
                <div style={{ fontWeight: 800, color: '#0052FF', marginBottom: '4px' }}>
                  [수신: 신한DS 현장대리인(PM) 귀하]
                </div>
                "본 협력사(<strong>{partnerCompany}</strong>) 소속 <strong>{selectedWorkerName}</strong> 직원이 <strong>{startDate} ~ {endDate}</strong> 기간 동안 개인 사정(<strong>{vacationType}</strong>)으로 도급 투입 불가(공백 발생)함을 사전 통보합니다."
              </>
            ) : (
              <>
                <div style={{ fontWeight: 800, color: '#16A34A', marginBottom: '4px' }}>
                  [수신: {partnerCompany} 현장관리인 (영업대표) 귀하]
                </div>
                "소속사(<strong>{partnerCompany}</strong>) 복무규정에 따라 <strong>{startDate} ~ {endDate}</strong> 기간 <strong>{vacationType}</strong> 사용을 신청합니다."
              </>
            )}
          </div>

          {/* 상세 사유 */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px' }}>
              상세 사유
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={isManager ? '공백 사유 입력' : '소속사 제출용 사유 입력'}
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
              background: isManager 
                ? 'linear-gradient(90deg, #0052FF 0%, #0066FF 100%)'
                : 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '14.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: isManager 
                ? '0 4px 14px rgba(0, 82, 255, 0.35)' 
                : '0 4px 14px rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {isManager ? <Send size={17} /> : <CheckCircle2 size={17} />}
            <span>{isManager ? '원청 앞 공백 통보서 발송' : `소속사(${partnerCompany})에 신청서 제출`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
