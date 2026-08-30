import React, { useState } from 'react';
import { X, Calendar, ShieldCheck, Megaphone, CheckCircle2, Building2, Clock, AlertCircle, Send, UserCheck, FileText } from 'lucide-react';
import { dbService } from '../../services/db';
import { User } from '../../types';
import { getKstNowString } from '../../utils/dateUtils';

interface VacationRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (type: string, dateRange: string) => void;
  currentUser?: User;
  isManagerMode?: boolean; // true: 협력사 관리자 (원청 통보 모드), false: 협력사 개인 (소속사 신청 모드)
  initialType?: string;
  themeMode: 'ddangyo' | 'shinhan';
}

export const VacationRegistrationModal: React.FC<VacationRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser = dbService.getCurrentUser(),
  isManagerMode = false,
  initialType,
  themeMode
}) => {
  const isManager = Boolean(isManagerMode);
  
  // 협력사명 산출 (신한DS가 원청이므로 협력사는 소속 협력사명으로 명확화)
  const rawComp = currentUser.partnerCompany || currentUser.companyName || '유브갓';
  const partnerCompany = rawComp === '신한DS' ? '유브갓' : rawComp;
  
  // 소속 근로자 목록 (관리자 모드용)
  const rosterWorkers = dbService.getManpowerInputs().filter(r => r.partnerCompany === partnerCompany);
  const [selectedWorkerName, setSelectedWorkerName] = useState<string>(
    isManager ? (rosterWorkers[0]?.workerName || currentUser.name) : currentUser.name
  );

  // 오늘 이후 첫 번째 영업일(평일, 월~금) 자동 계산 함수
  const getNextBusinessDay = (offsetDays: number = 1): string => {
    const now = new Date();
    const base = new Date(now);
    if (base.getFullYear() < 2026) {
      base.setFullYear(2026, 7, 30); // 2026-08-30 (일) 기준
    }
    
    let target = new Date(base);
    target.setDate(target.getDate() + offsetDays);
    
    // 주말(일: 0, 토: 6) 건너뛰고 가장 빠른 평일로 이동
    while (target.getDay() === 0 || target.getDay() === 6) {
      target.setDate(target.getDate() + 1);
    }
    
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const defaultBizDay = getNextBusinessDay(1); // 다음 영업일 (2026-08-31 월요일)

  const [vacationType, setVacationType] = useState<string>(initialType || '연차');
  const [startDate, setStartDate] = useState<string>(defaultBizDay);
  const [endDate, setEndDate] = useState<string>(defaultBizDay);
  const [reason, setReason] = useState<string>('협력사 복무규정에 따른 하계 정기 연차 휴가 사용');

  // 모달이 열릴 때마다 다음 영업일 및 사용자 이름으로 갱신
  React.useEffect(() => {
    if (isOpen) {
      const bizDay = getNextBusinessDay(1);
      setStartDate(bizDay);
      setEndDate(bizDay);
      if (!isManager) {
        setSelectedWorkerName(currentUser.name);
      }
    }
  }, [isOpen, isManager, currentUser.name]);

  if (!isOpen) return null;

  const handleRegister = async () => {
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
    const targetWorker = isManager ? selectedWorkerName : currentUser.name;
    const empId = currentUser.employeeId || currentUser.id || 'UB0001';

    if (isManager) {
      // 1. [협력사 관리자 모드]: 원청(신한DS PM) 앞 투입 공백 사전 통보 공문 발송
      dbService.dispatchPreGapNotice({
        partnerCompany: partnerCompany,
        workerName: targetWorker,
        partName: currentUser.partName || '상담',
        gapPeriod: dateRange,
        gapHours: hours,
        gapType: `${vacationType} (자체승인)`,
        reason: reason
      });

      // D1 DB attendance_requests 테이블로 실시간 POST
      const reqId = `req-gap-${Date.now()}`;
      fetch('/api/attendance/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reqId,
          employee_id: empId,
          user_id: empId,
          user_name: targetWorker,
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
      alert(`📢 [원청 앞 투입 공백 사전 통보 완료]\n• 발신: [${partnerCompany}] 현장관리인 (${currentUser.name})\n• 수신: 신한DS 현장대리인 (PM) 귀하\n• 대상 인력: ${targetWorker} (${dateRange})\n• D1 DB: attendance_requests 테이블에 저장 완료\n\n🛡️ [원청 공정 검수 연동]\n신한DS PM의 대시보드에 공문이 접수되었으며, PM의 '공정 투입 공백 확인(검수)'을 거치게 됩니다.`);
      onClose();
    } else {
      // 2. [협력사 개인 모드]: 수신: 협력사 관리인, 대상인력: 로그인한 사람(본인)
      const reqId = `req-vac-${Date.now()}`;

      dbService.addRequest({
        id: reqId,
        userId: currentUser.id || empId,
        userName: targetWorker,
        userDept: currentUser.deptName || '상담팀',
        partnerApproverName: `${partnerCompany} 현장관리인`,
        requestType: 'VACATION',
        targetDate: dateRange,
        timeRange: vacationType.includes('반차') ? '0.5 M/D' : '전일 (1.0 M/D)',
        hours: hours,
        reason: reason,
        status: 'PENDING',
        createdAt: getKstNowString(),
        approvalMemo: `협력사(${partnerCompany}) 내부 복무 신청 접수 (1차 결재 대기)`
      });

      // D1 DB attendance_requests 테이블로 실시간 POST (status: PENDING)
      let isUpdate = false;
      try {
        const res = await fetch('/api/attendance/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: reqId,
            employee_id: empId,
            user_id: empId,
            user_name: targetWorker,
            company_name: partnerCompany,
            request_type: 'VACATION',
            vacation_type: vacationType,
            target_date: dateRange,
            start_date: startDate,
            end_date: endDate,
            hours: hours,
            reason: reason,
            status: 'PENDING', // 1차 결재 대기
            partner_company: partnerCompany,
            approver_name: `${partnerCompany} 현장관리인`
          })
        });
        if (res.ok) {
          const json = await res.json();
          isUpdate = Boolean(json.isUpdate);
        }
      } catch (e) {
        console.warn('D1 vacation request sync error:', e);
      }

      // 🔔 알림센터에 미확인 알림 푸시 (협력사 관리인 앞)
      if (isUpdate) {
        dbService.addNotification({
          type: 'APPROVAL_REQUEST',
          title: `🔄 [휴가 변경/수정] ${targetWorker}님 ${vacationType} 신청 내용 변경`,
          content: `${targetWorker}님이 ${dateRange} 휴가 신청을 '${vacationType}' (${hours}시간)으로 수정했습니다. 협력사 관리인의 1차 결재가 필요합니다.`,
          targetRole: 'PARTNER_MANAGER',
          partName: currentUser.partName || '상담'
        });
      } else {
        dbService.addNotification({
          type: 'APPROVAL_REQUEST',
          title: `📢 [결재 요청] ${targetWorker}님 ${vacationType} 신청`,
          content: `${targetWorker}님이 ${vacationType} (${dateRange}) 결재를 요청했습니다. 협력사 관리인의 1차 승인이 필요합니다.`,
          targetRole: 'PARTNER_MANAGER',
          partName: currentUser.partName || '상담'
        });
      }

      // 화면 전역 실시간 갱신 이벤트 발행
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attendance_request_updated'));
      }

      onSuccess(vacationType, dateRange);

      if (isUpdate) {
        alert(`🔄 [동일 일자 휴가 신청 내용 수정 완료]\n• 발신(신청자): ${targetWorker} (${empId})\n• 수신: [${partnerCompany}] 현장관리인 귀하\n• 대상 일정: ${dateRange}\n• 변경된 유형: ${vacationType} (${hours}시간)\n• 변경 사유: ${reason}\n\n💡 [안내] 동일 일자에 등록된 기존 휴가 신청서가 최신 내용으로 정상 갱신되었으며, 협력사 관리인에게 1차 결재가 재상신되었습니다.`);
      } else {
        alert(`🎉 [협력사 관리인 앞 휴가 신청 접수 완료 (1단계)]\n• 발신(신청자): ${targetWorker} (${empId})\n• 수신: [${partnerCompany}] 현장관리인 귀하\n• 대상 인력: ${targetWorker} (${dateRange})\n• 신청 유형: ${vacationType} (${hours}시간)\n• D1 DB: attendance_requests 테이블에 저장 완료 (상태: 1차 결재 대기)\n\n🛡️ [도급 승인 체계 (2단계 프로세스)]\n1. [1차] 협력사 현장관리인이 사유를 검토 후 [1차 승인]을 진행합니다.\n2. [2차] 승인된 공백 내역이 신한DS 현장대리인(PM)에게 전달되어 최종 공정 검수를 거치게 됩니다.`);
      }
      onClose();
    }
  };

  const vacationTypes = [
    { label: '연차 (전일)', val: '연차', desc: '1.0 M/D 전일 부재' },
    { label: '오전 반차', val: '오전반차', desc: '0.5 M/D 오후 투입 예정' },
    { label: '오후 반차', val: '오후반차', desc: '0.5 M/D 오전 투입 예정' },
    { label: '여름휴가', val: '여름휴가', desc: '하계 정기 휴가 (유급)' },
    { label: '경조사 부재', val: '경조사', desc: '경조사 관련 유급 부재' },
    { label: '병가 / 공가', val: '병가', desc: '진단서 첨부 및 부재' },
    { label: '기타 휴가', val: '기타', desc: '기타 협력사 승인 휴가' }
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
                {isManager ? '원청 앞 투입 공백 사전 통보 (관리자용)' : '협력사 관리인 앞 휴가 신청 (근로자용)'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#6B7684' }}>
                {isManager ? `수신: 신한DS 현장대리인 (PM) 귀하` : `수신: [${partnerCompany}] 현장관리인 귀하`}
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
              🛡️ <strong>[협력사 1차 결재 원칙]</strong><br />
              본 신청서는 원청(신한DS)이 아닌 <strong>소속 협력사({partnerCompany}) 현장관리인</strong>에게 제출됩니다. 협력사 관리인의 1차 승인 후, 신한DS PM에게 공백이 공식 통보(검수 연동)됩니다.
            </div>
          )}

          {/* 대상 인력 정보 표출 */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
              {isManager ? '공백 발생 대상 인력 (자사 소속) *' : '신청 대상 인력 (로그인 본인) *'}
            </label>
            {isManager ? (
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
            ) : (
              <div style={{
                height: '42px',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#1E293B',
                background: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>{currentUser.name} ({currentUser.employeeId || 'PT20260816'})</span>
                <span style={{ fontSize: '11px', background: '#E2E8F0', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>
                  {partnerCompany} 소속
                </span>
              </div>
            )}
          </div>

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
                "본 협력사(<strong>{partnerCompany === '신한DS' ? '협력사' : partnerCompany}</strong>) 소속 <strong>{selectedWorkerName}</strong> 직원이 <strong>{startDate} ~ {endDate}</strong> 기간 동안 개인 사정(<strong>{vacationType}</strong>)으로 도급 투입 불가(공백 발생)함을 사전 통보합니다."
              </>
            ) : (
              <>
                <div style={{ fontWeight: 800, color: '#16A34A', marginBottom: '4px' }}>
                  [수신 : 협력사 관리인 귀하]
                </div>
                "협력사 복무규정에 따라 <strong>{startDate} ~ {endDate}</strong> 기간 <strong>{vacationType}</strong> 사용을 신청합니다."
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
              placeholder={isManager ? '공백 사유 입력' : '협력사 관리인 제출용 사유 입력'}
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
            <span>{isManager ? '원청 앞 공백 통보서 발송' : '협력사 관리인에게 신청서 제출 (1차 결재)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
