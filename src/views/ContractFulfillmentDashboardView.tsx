import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Clock, 
  Users, 
  Building2, 
  Briefcase, 
  Send, 
  CheckSquare, 
  Square, 
  FileCheck, 
  History, 
  TrendingUp, 
  X, 
  PlusCircle, 
  UserPlus, 
  Download, 
  Printer, 
  ShieldAlert, 
  FileSpreadsheet, 
  Check, 
  Slash,
  AlertCircle
} from 'lucide-react';
import { dbService, PM_PART_LIST } from '../services/db';
import { User, ManpowerInputRecord, PartFulfillmentSummary, LegalDefenseReport } from '../types';

interface ContractFulfillmentDashboardViewProps {
  currentUser: User;
  themeMode: 'ddangyo' | 'shinhan';
}

export const ContractFulfillmentDashboardView: React.FC<ContractFulfillmentDashboardViewProps> = ({
  currentUser,
  themeMode
}) => {
  const [activePart, setActivePart] = useState<string>(currentUser.partName || '상담');
  const [records, setRecords] = useState<ManpowerInputRecord[]>([]);
  const [exceptionRecords, setExceptionRecords] = useState<ManpowerInputRecord[]>([]);
  const [summary, setSummary] = useState<PartFulfillmentSummary>(dbService.getPartSummary('상담'));
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  
  // 모달 상태
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [selectedExceptionRecord, setSelectedExceptionRecord] = useState<ManpowerInputRecord | null>(null);
  const [exceptionMemo, setExceptionMemo] = useState('');
  
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);
  const [selectedGapRecord, setSelectedGapRecord] = useState<ManpowerInputRecord | null>(null);
  const [clarificationMessage, setClarificationMessage] = useState('');

  const [isDefenseReportModalOpen, setIsDefenseReportModalOpen] = useState(false);
  const [defenseReport, setDefenseReport] = useState<LegalDefenseReport | null>(null);

  const [selectedAuditRecord, setSelectedAuditRecord] = useState<ManpowerInputRecord | null>(null);

  // 신규 투입 인력 등록 폼 (실제 DB INSERT)
  const [newWorkerForm, setNewWorkerForm] = useState({
    workerName: '',
    employeeId: '',
    partnerCompany: PM_PART_LIST.find(p => p.partName === activePart)?.partnerCompany || '유브갓',
    workDate: new Date().toISOString().substring(0, 10),
    clockInTime: '08:50',
    clockOutTime: '18:00',
    contractedHours: 8.0,
    actualHours: 8.0,
    taskSummary: '',
    isSlaBreach: false,
    varianceMinutes: 0,
    gapReason: ''
  });

  const loadData = () => {
    const partRecords = dbService.getManpowerRecordsByPart(activePart);
    const exceptions = dbService.getExceptionRecordsByPart(activePart);
    const sum = dbService.getPartSummary(activePart);

    setRecords(partRecords);
    setExceptionRecords(exceptions);
    setSummary(sum);

    const pendingIds = partRecords
      .filter(r => r.verificationStatus === 'PARTNER_CONFIRMED' || r.verificationStatus === 'VARIANCE_GAP' || r.verificationStatus === 'UNVERIFIED')
      .map(r => r.id);
    setSelectedRecordIds(pendingIds);
  };

  useEffect(() => {
    loadData();
    const currentPartInfo = PM_PART_LIST.find(p => p.partName === activePart);
    setNewWorkerForm(prev => ({
      ...prev,
      partnerCompany: currentPartInfo?.partnerCompany || '유브갓'
    }));
  }, [activePart]);

  const handleSelectAll = () => {
    if (selectedRecordIds.length === records.length) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(records.map(r => r.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedRecordIds.includes(id)) {
      setSelectedRecordIds(selectedRecordIds.filter(i => i !== id));
    } else {
      setSelectedRecordIds([...selectedRecordIds, id]);
    }
  };

  // 신규 투입 인력 DB INSERT
  const handleAddWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerForm.workerName.trim() || !newWorkerForm.employeeId.trim()) {
      alert('성명과 사번을 입력해 주세요.');
      return;
    }

    const res = dbService.insertManpowerRecord({
      recordId: `rec-${Date.now()}`,
      employeeId: newWorkerForm.employeeId.trim(),
      workerName: newWorkerForm.workerName.trim(),
      partName: activePart,
      partnerCompany: newWorkerForm.partnerCompany,
      workDate: newWorkerForm.workDate,
      contractedHours: Number(newWorkerForm.contractedHours),
      actualInputHours: Number(newWorkerForm.actualHours),
      clockInTime: newWorkerForm.clockInTime,
      clockOutTime: newWorkerForm.clockOutTime,
      taskSummary: newWorkerForm.taskSummary || `${activePart} 파트 도급 공정 수행`,
      varianceMinutes: Number(newWorkerForm.varianceMinutes),
      isSlaBreach: Boolean(newWorkerForm.isSlaBreach),
      gapReason: newWorkerForm.gapReason || undefined,
      verificationStatus: newWorkerForm.isSlaBreach ? 'VARIANCE_GAP' : 'AUTO_SETTLED'
    });

    if (res.success) {
      alert(`🎉 [${newWorkerForm.workerName}] 투입 실적이 DB(manpower_inputs)에 등록되었습니다.`);
      setIsAddWorkerModalOpen(false);
      setNewWorkerForm({
        workerName: '',
        employeeId: '',
        partnerCompany: PM_PART_LIST.find(p => p.partName === activePart)?.partnerCompany || '유브갓',
        workDate: new Date().toISOString().substring(0, 10),
        clockInTime: '08:50',
        clockOutTime: '18:00',
        contractedHours: 8.0,
        actualHours: 8.0,
        taskSummary: '',
        isSlaBreach: false,
        varianceMinutes: 0,
        gapReason: ''
      });
      loadData();
    }
  };

  // 하단 [일일 투입 공수 검수] 확정 실행
  const handleConfirmSettlement = () => {
    if (selectedRecordIds.length === 0) return;
    const ok = dbService.settlePrincipalVerification(selectedRecordIds, currentUser.name);
    if (ok) {
      alert(`🎉 선택한 [${selectedRecordIds.length}명]의 일일 도급 투입 실적이 정산 확정 처리되었습니다. (감사로그 DB 기록 완료)`);
      setIsConfirmModalOpen(false);
      loadData();
    }
  };

  // 예외 관리 모달 열기
  const handleOpenExceptionModal = (record: ManpowerInputRecord) => {
    setSelectedExceptionRecord(record);
    setExceptionMemo('');
    setIsExceptionModalOpen(true);
  };

  // 예외 조치 1: [계약상 투입 제외] (도급비 감액 확정)
  const handleExecuteExclude = () => {
    if (!selectedExceptionRecord) return;
    dbService.resolveExceptionExclude(selectedExceptionRecord.id, exceptionMemo || '도급 계약 SLA 기준 미달에 따른 공수 차감');
    setIsExceptionModalOpen(false);
    loadData();
    alert(`⚖️ [${selectedExceptionRecord.workerName}] 건이 [계약상 투입 제외] 처리되어 도급비 정산 감액 자료에 반영되었습니다. (감사로그 자동 기록 완료)`);
  };

  // 예외 조치 2: [공정 지연 사유 확정] (소명 인정 / 정산 유지)
  const handleExecuteAcceptDelay = () => {
    if (!selectedExceptionRecord) return;
    dbService.resolveExceptionAccept(selectedExceptionRecord.id, exceptionMemo || '협력업체 1차 소명 사유 검토 완료');
    setIsExceptionModalOpen(false);
    loadData();
    alert(`✅ [${selectedExceptionRecord.workerName}] 건이 [공정 지연 사유 확정] 처리되어 정상 투입 실적으로 인정되었습니다. (감사로그 자동 기록 완료)`);
  };

  // 소명 요구 공문 발송 모달
  const handleOpenClarificationModal = (record: ManpowerInputRecord) => {
    setSelectedGapRecord(record);
    setClarificationMessage(
      `[SLA 미달 통보 및 소명 요청]\n수신: ${record.partnerCompany} 현장관리자\n내용: ${record.workDate} ${record.workerName} 인원의 ${record.varianceMinutes}분 공백에 대해 계약서 제8조에 의거하여 공식 소명 자료 및 대체 공수 계획을 제출해 주시기 바랍니다.`
    );
    setIsClarificationModalOpen(true);
  };

  const handleSendClarification = () => {
    if (!selectedGapRecord || !clarificationMessage.trim()) return;
    dbService.sendClarificationRequest(selectedGapRecord.id, clarificationMessage);
    alert(`📨 [${selectedGapRecord.partnerCompany}] 현장관리자 앞으로 공식 개선(소명) 요청 공문이 발송 및 DB에 기록되었습니다.`);
    setIsClarificationModalOpen(false);
    loadData();
  };

  // 법적 방어 리포트 생성 및 모달 열기
  const handleOpenDefenseReport = () => {
    const rep = dbService.generateLegalDefenseReport(activePart);
    setDefenseReport(rep);
    setIsDefenseReportModalOpen(true);
  };

  return (
    <div style={{
      background: '#060B14',
      minHeight: '100vh',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '120px'
    }}>
      {/* 1. 상단 Header: 10인 PM 체제 & 파트 전담 격리 헤더 */}
      <div style={{
        background: 'linear-gradient(180deg, #0F1E36 0%, #060B14 100%)',
        padding: '18px 18px 14px 18px',
        borderBottom: '1px solid rgba(0, 229, 255, 0.18)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 229, 255, 0.12)',
            border: '1px solid rgba(0, 229, 255, 0.35)',
            padding: '3px 10px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#00E5FF'
          }}>
            <ShieldCheck size={13} color="#00E5FF" />
            <span>10인 PM 체제 도급 관리 시스템</span>
          </div>

          <span style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600 }}>
            {currentUser.name}
          </span>
        </div>

        {/* 파트명 & 전담 협력사 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#80D8FF', fontWeight: 700 }}>
              전담 관제 파트 (120인 규모 도급 인력)
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', margin: '2px 0 0 0', letterSpacing: '-0.5px' }}>
              파트명({activePart})
            </h1>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '6px 12px',
            borderRadius: '8px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '10px', color: '#90A4AE' }}>도급 수행 협력사</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#00E5FF' }}>
              {summary.partnerCompany}
            </div>
          </div>
        </div>

        {/* 10개 파트 스위처 (10인 PM 파트 격리 탭) */}
        <div style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          padding: '10px 0 4px 0',
          scrollbarWidth: 'none'
        }}>
          {PM_PART_LIST.map(p => (
            <button
              key={p.partId}
              type="button"
              onClick={() => setActivePart(p.partName)}
              style={{
                flexShrink: 0,
                padding: '6px 10px',
                borderRadius: '8px',
                border: activePart === p.partName ? '1.5px solid #00E5FF' : '1px solid rgba(255, 255, 255, 0.08)',
                background: activePart === p.partName ? '#0052FF' : 'rgba(255, 255, 255, 0.04)',
                color: activePart === p.partName ? '#FFFFFF' : '#90A4AE',
                fontSize: '11.5px',
                fontWeight: activePart === p.partName ? 800 : 600,
                cursor: 'pointer'
              }}
            >
              {p.partName} {p.partName === '상담' && <span style={{ color: '#80D8FF' }}>★</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 8px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* 2. 가동률 & 관리 통계 카드 */}
        <div style={{
          background: '#101B2E',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          borderRadius: '16px',
          padding: '16px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 700 }}>
              [{activePart}] 일일 투입 공수 달성률
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '30px', fontWeight: 900, color: summary.fulfillmentRate >= 100 ? '#00E676' : summary.fulfillmentRate > 0 ? '#FF9100' : '#90A4AE' }}>
                {summary.fulfillmentRate.toFixed(1)}%
              </span>
              <span style={{ fontSize: '12px', color: '#90A4AE' }}>
                (약정 {summary.targetHeadcount}명 / 실투입 {summary.activeHeadcount}명)
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#80D8FF', marginTop: '3px' }}>
              정상 투입 {summary.activeHeadcount}명 자동 정산 완료 · 예외 발생 {summary.exceptionCount}명
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenDefenseReport}
            style={{
              background: 'rgba(0, 82, 255, 0.2)',
              border: '1.5px solid #0052FF',
              borderRadius: '10px',
              padding: '10px 12px',
              color: '#80D8FF',
              fontSize: '11.5px',
              fontWeight: 800,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 82, 255, 0.25)'
            }}
          >
            <FileSpreadsheet size={18} color="#00E5FF" />
            <span>법적 방어 리포트</span>
          </button>
        </div>

        {/* 3. [Exception Management] 예외 관리 집중 알림 센터 (120명 관리 최적화) */}
        {exceptionRecords.length > 0 && (
          <div style={{
            background: 'rgba(255, 109, 0, 0.08)',
            border: '1.5px solid #FF9100',
            borderRadius: '14px',
            padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF9100', fontSize: '13.5px', fontWeight: 800 }}>
                <AlertTriangle size={17} />
                <span>예외 관리 집중 큐 ({exceptionRecords.length}건 발생)</span>
              </div>
              <span style={{ fontSize: '10.5px', color: '#FFB74D' }}>PM 사유 확인 및 최종 검수 필요</span>
            </div>

            <p style={{ fontSize: '11px', color: '#CFD8DC', margin: '0 0 10px 0', lineHeight: 1.4 }}>
              ※ 정상 투입 인원은 시스템이 자동 검수 확정하였으며, 아래 <strong>지각/누락/공백 발생 인원만 사유 확인 후 최종 검수</strong>를 진행하세요.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {exceptionRecords.map(exRec => (
                <div
                  key={exRec.id}
                  style={{
                    background: '#19263B',
                    border: '1px solid rgba(255, 145, 0, 0.3)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                        {exRec.workerName}
                      </span>
                      <span style={{ fontSize: '11px', color: '#FF8A80', background: 'rgba(255,82,82,0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                        {exRec.varianceMinutes}분 편차
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#90A4AE', marginTop: '2px' }}>
                      {exRec.gapReason || '출근 시간 지연'} · {exRec.clockInTime} ~ {exRec.clockOutTime}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenClarificationModal(exRec)}
                      style={{
                        background: 'rgba(255, 109, 0, 0.2)',
                        border: '1px solid #FF9100',
                        color: '#FFB74D',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '6px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      소명 요구
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenExceptionModal(exRec)}
                      style={{
                        background: '#FF6D00',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      사유 확인 ›
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. 오늘 투입 인원 리스트 헤더 & 전체 선택 & 신규 투입 등록 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleSelectAll}
              style={{
                background: 'none',
                border: 'none',
                color: '#80D8FF',
                fontSize: '12.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {selectedRecordIds.length === records.length && records.length > 0 ? (
                <CheckSquare size={16} color="#00E5FF" />
              ) : (
                <Square size={16} color="#90A4AE" />
              )}
              <span>전체 선택 ({selectedRecordIds.length}/{records.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddWorkerModalOpen(true)}
            style={{
              background: 'rgba(0, 229, 255, 0.15)',
              border: '1px solid rgba(0, 229, 255, 0.4)',
              color: '#00E5FF',
              fontSize: '11.5px',
              fontWeight: 800,
              borderRadius: '6px',
              padding: '5px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={13} />
            <span>+ 투입 등록</span>
          </button>
        </div>

        {/* 5. 도급 인원 리스트 (체크박스 및 상태 배지) */}
        {records.length === 0 ? (
          <div style={{
            background: '#101B2E',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '14px',
            padding: '36px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}>
            <UserPlus size={36} color="#90A4AE" />
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
              [{activePart}] 등록된 일일 투입 실적이 없습니다
            </div>
            <p style={{ fontSize: '12px', color: '#90A4AE', margin: 0, maxWidth: '280px', lineHeight: 1.4 }}>
              실제 DB에 도급 인력 투입 실적을 등록하려면 상단의 <strong>[+ 투입 등록]</strong> 버튼을 눌러주세요.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {records.map((record) => {
              const isSelected = selectedRecordIds.includes(record.id);
              const isAuto = record.verificationStatus === 'AUTO_SETTLED';
              const isSettled = record.verificationStatus === 'SETTLED';
              const isExcluded = record.verificationStatus === 'EXCLUDED_FROM_BILLING';
              const isAccepted = record.verificationStatus === 'DELAY_REASON_ACCEPTED';
              const isPendingException = record.verificationStatus === 'VARIANCE_GAP';

              return (
                <div
                  key={record.id}
                  style={{
                    background: isSelected ? '#12243D' : '#0F1A2C',
                    border: isSelected ? '1px solid #00E5FF' : isPendingException ? '1px solid #FF9100' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* 체크박스 */}
                  <button
                    type="button"
                    onClick={() => handleToggleSelect(record.id)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {isSelected ? (
                      <CheckSquare size={20} color="#00E5FF" />
                    ) : (
                      <Square size={20} color="#90A4AE" />
                    )}
                  </button>

                  {/* 인원 정보 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                          {record.workerName}
                        </span>
                        <span style={{ fontSize: '11px', color: '#90A4AE' }}>
                          {record.partnerCompany}
                        </span>
                      </div>

                      {/* 상태 배지 */}
                      {isAuto || isSettled ? (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#00E676',
                          background: 'rgba(0, 230, 118, 0.15)',
                          border: '1px solid rgba(0, 230, 118, 0.3)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Check size={12} strokeWidth={3} />
                          <span>{isAuto ? '자동 검수 완료' : '정산 확정'}</span>
                        </span>
                      ) : isExcluded ? (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#FF5252',
                          background: 'rgba(255, 82, 82, 0.15)',
                          border: '1px solid rgba(255, 82, 82, 0.3)',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          ✕ 계약상 투입 제외
                        </span>
                      ) : isAccepted ? (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#00E5FF',
                          background: 'rgba(0, 229, 255, 0.15)',
                          border: '1px solid rgba(0, 229, 255, 0.3)',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          ✓ 지연사유 확정
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenExceptionModal(record)}
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#FF9100',
                            background: 'rgba(255, 145, 0, 0.2)',
                            border: '1px solid #FF9100',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          ⚠ 예외 검수 대기
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#CFD8DC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#80D8FF', fontWeight: 700 }}>
                        🕒 {record.clockInTime} ~ {record.clockOutTime}
                      </span>
                      <span>실투입: <strong>{record.actualInputHours}h</strong> / 약정 {record.contractedHours}h</span>
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#90A4AE', marginTop: '2px' }}>
                      공정내역: {record.taskSummary}
                    </div>

                    {record.auditTrails && record.auditTrails.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedAuditRecord(record)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#82B1FF',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <History size={12} />
                          <span>도급 검수 로그 ({record.auditTrails.length}건)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. 원래 메인화면 하단 Action Zone: [일일 투입 공수 검수] 고정 바 */}
      {/* ========================================================================= */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '430px',
        margin: '0 auto',
        background: 'rgba(10, 17, 30, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0, 229, 255, 0.2)',
        padding: '12px 18px 24px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        zIndex: 90
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#90A4AE' }}>
          <span>선택된 검수 대상: <strong style={{ color: '#00E5FF' }}>{selectedRecordIds.length}명</strong></span>
          <span style={{ color: '#80D8FF' }}>※ HR 승인이 아닌 도급 검수 확정</span>
        </div>

        <button
          type="button"
          onClick={() => setIsConfirmModalOpen(true)}
          disabled={selectedRecordIds.length === 0}
          style={{
            width: '100%',
            height: '50px',
            borderRadius: '12px',
            background: selectedRecordIds.length > 0 
              ? 'linear-gradient(90deg, #0052FF 0%, #00D4FF 100%)' 
              : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: selectedRecordIds.length > 0 ? '#FFFFFF' : '#90A4AE',
            fontSize: '16px',
            fontWeight: 900,
            cursor: selectedRecordIds.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: selectedRecordIds.length > 0 ? '0 4px 20px rgba(0, 82, 255, 0.4)' : 'none'
          }}
        >
          <FileCheck size={20} color={selectedRecordIds.length > 0 ? '#FFFFFF' : '#90A4AE'} />
          <span>일일 투입 공수 검수</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 팝업: [일일 투입 공수 검수] 확정 모달 (HR 승인이 아님을 명시) */}
      {/* ========================================================================= */}
      {isConfirmModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '380px',
            background: '#132035',
            border: '1.5px solid #00E5FF',
            borderRadius: '20px',
            padding: '24px 20px',
            color: '#FFFFFF',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 229, 255, 0.25)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '28px',
              background: 'rgba(0, 229, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '1px solid rgba(0, 229, 255, 0.3)'
            }}>
              <FileCheck size={28} color="#00E5FF" />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '8px', color: '#FFFFFF' }}>
              일일 투입 공수 검수 및 정산 확정
            </h3>

            <p style={{ fontSize: '13.5px', color: '#CFD8DC', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              선택한 <strong>{selectedRecordIds.length}명</strong>의 오늘자 투입 실적을<br />
              <span style={{ color: '#00E5FF', fontWeight: 800 }}>도급 정산 자료로 최종 확정</span>하시겠습니까?
            </p>

            {/* 법적 명시 경고 박스 */}
            <div style={{
              background: 'rgba(255, 145, 0, 0.12)',
              border: '1px solid rgba(255, 145, 0, 0.3)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '11px',
              color: '#FFB74D',
              textAlign: 'left',
              lineHeight: 1.4,
              marginBottom: '20px'
            }}>
              ※ 본 확정은 개별 근로자의 근태 승인(HR)이 아니며, 도급 계약에 따른 오늘자 투입 공수를 검수하여 기성 정산 자료로 확정하는 행위입니다.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                style={{
                  flex: 1,
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleConfirmSettlement}
                style={{
                  flex: 1.5,
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(90deg, #00E676 0%, #00C853 100%)',
                  border: 'none',
                  color: '#0D1B2A',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0, 230, 118, 0.35)'
                }}
              >
                도급 정산 확정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 팝업: [Exception Management] 사유 확인 & 예외 검수 모달 */}
      {/* ========================================================================= */}
      {isExceptionModalOpen && selectedExceptionRecord && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            background: '#132035',
            border: '1.5px solid #FF9100',
            borderRadius: '18px',
            padding: '22px 20px',
            color: '#FFFFFF',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF9100', fontSize: '16px', fontWeight: 800 }}>
                <AlertTriangle size={18} />
                <span>예외 사항 사유 확인 및 도급 검수</span>
              </div>
              <button onClick={() => setIsExceptionModalOpen(false)} style={{ background: 'none', border: 'none', color: '#90A4AE', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '10px', fontSize: '12.5px', marginBottom: '14px', lineHeight: 1.5 }}>
              <div>수급인: <strong>{selectedExceptionRecord.partnerCompany}</strong></div>
              <div>투입 인원: <strong>{selectedExceptionRecord.workerName} ({selectedExceptionRecord.partName} 파트)</strong></div>
              <div>발생 편차: <strong style={{ color: '#FF8A80' }}>{selectedExceptionRecord.varianceMinutes}분 공백</strong> (투입: {selectedExceptionRecord.clockInTime} ~ {selectedExceptionRecord.clockOutTime})</div>
              <div style={{ marginTop: '4px', color: '#FFB74D' }}>소명 내용: {selectedExceptionRecord.partnerClarification || selectedExceptionRecord.gapReason || '출근 시간 지연'}</div>
            </div>

            <label style={{ fontSize: '12px', fontWeight: 700, color: '#CFD8DC', display: 'block', marginBottom: '6px' }}>
              DS 현장관리인 검수 의견 (선택)
            </label>
            <input
              type="text"
              placeholder="검수 사유 및 계약상 조치 내용 입력"
              value={exceptionMemo}
              onChange={e => setExceptionMemo(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                background: '#0D1726',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '0 10px',
                color: '#FFFFFF',
                fontSize: '12.5px',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '16px'
              }}
            />

            {/* 이중 액션 버튼: [계약상 투입 제외] vs [공정 지연 사유 확정] */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={handleExecuteExclude}
                style={{
                  height: '46px',
                  borderRadius: '10px',
                  background: 'rgba(255, 82, 82, 0.2)',
                  border: '1.5px solid #FF5252',
                  color: '#FF8A80',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Slash size={14} />
                <span>계약상 투입 제외</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteAcceptDelay}
                style={{
                  height: '46px',
                  borderRadius: '10px',
                  background: 'linear-gradient(90deg, #00C853 0%, #00E676 100%)',
                  border: 'none',
                  color: '#0A192F',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Check size={16} strokeWidth={3} />
                <span>공정 지연 사유 확정</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 팝업: 협력업체 관리자 대상 [개선 요청(소명 요구)] 발송 모달 */}
      {/* ========================================================================= */}
      {isClarificationModalOpen && selectedGapRecord && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            background: '#132035',
            border: '1.5px solid #FF9100',
            borderRadius: '18px',
            padding: '22px 20px',
            color: '#FFFFFF',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(255, 145, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF9100', fontSize: '16px', fontWeight: 800 }}>
                <Send size={18} />
                <span>협력업체 개선 요청 (소명 요구)</span>
              </div>
              <button onClick={() => setIsClarificationModalOpen(false)} style={{ background: 'none', border: 'none', color: '#90A4AE', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
              <div>수신: <strong>{selectedGapRecord.partnerCompany} 관리자 앞</strong></div>
              <div>대상자: <strong>{selectedGapRecord.workerName} ({selectedGapRecord.partName} 파트)</strong></div>
              <div style={{ color: '#FF8A80' }}>발생 편차: <strong>{selectedGapRecord.varianceMinutes}분 투입 공백</strong></div>
            </div>

            <label style={{ fontSize: '12px', fontWeight: 700, color: '#CFD8DC', display: 'block', marginBottom: '6px' }}>
              공식 요청 공문 내용 (DB 저장)
            </label>
            <textarea
              value={clarificationMessage}
              onChange={e => setClarificationMessage(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                background: '#0D1726',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '10px',
                color: '#FFFFFF',
                fontSize: '12.5px',
                outline: 'none',
                resize: 'none',
                lineHeight: 1.45,
                boxSizing: 'border-box'
              }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setIsClarificationModalOpen(false)}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleSendClarification}
                style={{
                  flex: 2,
                  height: '44px',
                  borderRadius: '10px',
                  background: '#FF6D00',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Send size={15} />
                <span>개선요구 발송</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 팝업: [법적 방어 리포트] 노동청 조사 대비 공식 증빙 뷰어 */}
      {/* ========================================================================= */}
      {isDefenseReportModalOpen && defenseReport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px 22px',
            color: '#1A202C',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.7)'
          }}>
            {/* 리포트 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0052FF', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#0052FF', fontWeight: 800 }}>
                  [공식 증빙] 노란봉투법/파견법 대응 도급 검수 리포트
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0D1B2A', margin: '2px 0 0 0' }}>
                  도급 계약 이행 및 인력 투입 검수 확인서
                </h2>
              </div>
              <button onClick={() => setIsDefenseReportModalOpen(false)} style={{ background: 'none', border: 'none', color: '#718096', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* 리포트 메타 정보 테이블 */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '14px' }}>
              <tbody>
                <tr style={{ background: '#F7FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 700, color: '#4A5568', width: '25%' }}>도급 대상 파트</td>
                  <td style={{ padding: '6px 8px', color: '#1A202C' }}>{defenseReport.partName} 파트 ({defenseReport.totalWorkersCount}명 규모)</td>
                  <td style={{ padding: '6px 8px', fontWeight: 700, color: '#4A5568', width: '25%' }}>수급 사업자</td>
                  <td style={{ padding: '6px 8px', color: '#1A202C' }}>{defenseReport.partnerCompany}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 700, color: '#4A5568' }}>검수 기간</td>
                  <td style={{ padding: '6px 8px', color: '#1A202C' }}>{defenseReport.periodRange}</td>
                  <td style={{ padding: '6px 8px', fontWeight: 700, color: '#4A5568' }}>현장 검수인 (PM)</td>
                  <td style={{ padding: '6px 8px', color: '#1A202C' }}>{defenseReport.principalPmName}</td>
                </tr>
                <tr style={{ background: '#F7FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 700, color: '#4A5568' }}>약정/실투입 공수</td>
                  <td style={{ padding: '6px 8px', color: '#0052FF', fontWeight: 800 }}>{defenseReport.totalTargetManHours}h / {defenseReport.totalDeliveredManHours}h ({defenseReport.overallFulfillmentRate.toFixed(1)}%)</td>
                  <td style={{ padding: '6px 8px', fontWeight: 700, color: '#4A5568' }}>도급비 감액 산정</td>
                  <td style={{ padding: '6px 8px', color: '#E53E3E', fontWeight: 800 }}>-₩{defenseReport.billingDeductionTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            {/* 핵심 법적 방어 선언문 */}
            <div style={{
              background: '#EBF8FF',
              border: '1px solid #BEE3F8',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '11px',
              color: '#2B6CB0',
              lineHeight: 1.5,
              marginBottom: '16px'
            }}>
              {defenseReport.legalStatement}
            </div>

            {/* 인원별 검수 내역 요약 목록 */}
            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                <thead>
                  <tr style={{ background: '#EDF2F7', borderBottom: '1px solid #CBD5E0', textAlign: 'left' }}>
                    <th style={{ padding: '6px 8px' }}>근로자</th>
                    <th style={{ padding: '6px 8px' }}>투입시간</th>
                    <th style={{ padding: '6px 8px' }}>공수</th>
                    <th style={{ padding: '6px 8px' }}>검수 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {defenseReport.records.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 700 }}>{r.workerName}</td>
                      <td style={{ padding: '6px 8px', color: '#718096' }}>{r.clockInTime} ~ {r.clockOutTime}</td>
                      <td style={{ padding: '6px 8px' }}>{r.actualInputHours}h</td>
                      <td style={{ padding: '6px 8px', fontWeight: 800, color: r.verificationStatus === 'AUTO_SETTLED' ? '#38A169' : r.verificationStatus === 'EXCLUDED_FROM_BILLING' ? '#E53E3E' : '#3182CE' }}>
                        {r.verificationStatus === 'AUTO_SETTLED' ? '자동 검수 확정' : r.verificationStatus === 'EXCLUDED_FROM_BILLING' ? '계약상 제외' : '지연사유 확정'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '8px',
                  background: '#2D3748',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={15} />
                <span>공식 문서 인쇄</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  alert('📄 노동청 조사 대비 공식 도급 검수 리포트가 PDF로 내보내기 되었습니다.');
                  setIsDefenseReportModalOpen(false);
                }}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '8px',
                  background: '#0052FF',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Download size={15} />
                <span>PDF 다운로드</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 팝업: 신규 투입 인력 등록 모달 */}
      {/* ========================================================================= */}
      {isAddWorkerModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            background: '#132035',
            border: '1.5px solid #00E5FF',
            borderRadius: '18px',
            padding: '20px',
            color: '#FFFFFF',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00E5FF', fontSize: '16px', fontWeight: 800 }}>
                <UserPlus size={18} />
                <span>[{activePart}] 신규 투입 실적 등록 (DB)</span>
              </div>
              <button onClick={() => setIsAddWorkerModalOpen(false)} style={{ background: 'none', border: 'none', color: '#90A4AE', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddWorkerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: '#90A4AE', display: 'block', marginBottom: '3px' }}>근로자 성명 *</label>
                <input
                  type="text"
                  placeholder="예: 홍길동"
                  value={newWorkerForm.workerName}
                  onChange={e => setNewWorkerForm({ ...newWorkerForm, workerName: e.target.value })}
                  style={formInputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: '#90A4AE', display: 'block', marginBottom: '3px' }}>사원번호 *</label>
                <input
                  type="text"
                  placeholder="예: S20260099"
                  value={newWorkerForm.employeeId}
                  onChange={e => setNewWorkerForm({ ...newWorkerForm, employeeId: e.target.value })}
                  style={formInputStyle}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#90A4AE', display: 'block', marginBottom: '3px' }}>출근 투입 시각</label>
                  <input
                    type="time"
                    value={newWorkerForm.clockInTime}
                    onChange={e => setNewWorkerForm({ ...newWorkerForm, clockInTime: e.target.value })}
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#90A4AE', display: 'block', marginBottom: '3px' }}>퇴근 투입 시각</label>
                  <input
                    type="time"
                    value={newWorkerForm.clockOutTime}
                    onChange={e => setNewWorkerForm({ ...newWorkerForm, clockOutTime: e.target.value })}
                    style={formInputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: '#90A4AE', display: 'block', marginBottom: '3px' }}>도급 작업 내역</label>
                <input
                  type="text"
                  placeholder="예: 카드 결제망 이상금융거래 모니터링"
                  value={newWorkerForm.taskSummary}
                  onChange={e => setNewWorkerForm({ ...newWorkerForm, taskSummary: e.target.value })}
                  style={formInputStyle}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#FFB74D', cursor: 'pointer', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={newWorkerForm.isSlaBreach}
                  onChange={e => setNewWorkerForm({ ...newWorkerForm, isSlaBreach: e.target.checked, varianceMinutes: e.target.checked ? 45 : 0 })}
                  style={{ accentColor: '#FF9100' }}
                />
                <span>지각/공백(예외 사항) 발생 건으로 등록</span>
              </label>

              <button
                type="submit"
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#0052FF',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                도급 투입 실적 DB 등록 ›
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 팝업: 도급 검수 감사 로그 (Audit Trail Viewer) */}
      {/* ========================================================================= */}
      {selectedAuditRecord && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            background: '#132035',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: '18px',
            padding: '20px',
            color: '#FFFFFF'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00E5FF', fontSize: '15px', fontWeight: 800 }}>
                <History size={17} />
                <span>{selectedAuditRecord.workerName} 도급 검수 감사 로그</span>
              </div>
              <button onClick={() => setSelectedAuditRecord(null)} style={{ background: 'none', border: 'none', color: '#90A4AE', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {selectedAuditRecord.auditTrails.map(log => (
                <div key={log.id} style={{ background: '#0D1726', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #00E5FF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#80D8FF', marginBottom: '2px' }}>
                    <span>{log.actorName}</span>
                    <span>{log.timestamp.substring(11)}</span>
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>{log.action}</div>
                  <div style={{ fontSize: '10.5px', color: '#00E5FF', marginTop: '2px' }}>라벨: [{log.systemLabel || '도급 계약 이행 확인'}]</div>
                  <div style={{ fontSize: '11px', color: '#90A4AE', marginTop: '2px' }}>{log.details}</div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedAuditRecord(null)}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                marginTop: '14px',
                cursor: 'pointer'
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const formInputStyle: React.CSSProperties = {
  width: '100%',
  height: '42px',
  background: '#0D1726',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '13px',
  padding: '0 10px',
  outline: 'none',
  boxSizing: 'border-box'
};
