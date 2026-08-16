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
  HelpCircle,
  TrendingUp,
  X,
  MessageSquare,
  AlertCircle,
  Check
} from 'lucide-react';
import { dbService } from '../services/db';
import { User, ManpowerInputRecord, PartFulfillmentSummary } from '../types';

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
  const [summary, setSummary] = useState<PartFulfillmentSummary>(dbService.getPartSummary('상담'));
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  
  // 모달 상태
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);
  const [selectedGapRecord, setSelectedGapRecord] = useState<ManpowerInputRecord | null>(null);
  const [clarificationMessage, setClarificationMessage] = useState('');
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<ManpowerInputRecord | null>(null);

  const loadData = () => {
    const partRecords = dbService.getManpowerRecordsByPart(activePart);
    setRecords(partRecords);
    setSummary(dbService.getPartSummary(activePart));
    
    // 검수 대기(PARTNER_CONFIRMED) 상태인 레코드들을 기본 선택
    const pendingIds = partRecords
      .filter(r => r.verificationStatus === 'PARTNER_CONFIRMED')
      .map(r => r.id);
    setSelectedRecordIds(pendingIds);
  };

  useEffect(() => {
    loadData();
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

  // DS PM 최종 정산 확정 핸들러
  const handleExecuteSettlement = () => {
    if (selectedRecordIds.length === 0) {
      alert('검수 확정할 인원을 1명 이상 선택해주세요.');
      return;
    }

    dbService.settlePrincipalVerification(selectedRecordIds, currentUser.name);
    setIsConfirmModalOpen(false);
    loadData();
    alert(`✅ 선택된 ${selectedRecordIds.length}명의 일일 투입 공수 검수가 완료되어 [도급 정산 확정] 처리되었습니다.`);
  };

  // 소명 요구 / 개선 요청 모달 열기
  const handleOpenClarification = (record: ManpowerInputRecord) => {
    setSelectedGapRecord(record);
    setClarificationMessage(
      `[공식 개선 요청] 귀사(${record.partnerCompany}) 소속 ${record.workerName} 상담원의 2026-08-16일자 투입 공백(편차 ${record.varianceMinutes}분)에 대하여 SLA 계약 기준에 따른 원인 분석 및 재발 방지 개선 대책서 제출을 요청합니다.`
    );
    setIsClarificationModalOpen(true);
  };

  // 소명 요구 메시지 전송
  const handleSendClarification = () => {
    if (!selectedGapRecord || !clarificationMessage.trim()) return;

    dbService.sendClarificationRequest(selectedGapRecord.id, clarificationMessage);
    setIsClarificationModalOpen(false);
    loadData();
    alert(`📨 협력업체(${selectedGapRecord.partnerCompany}) 관리자 앞 개선 요청(소명 요구) 공문이 공식 발송되었습니다.`);
  };

  const gapRecords = records.filter(r => r.isSlaBreach);

  return (
    <div style={{
      background: '#0A111E',
      minHeight: '100vh',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '100px'
    }}>
      {/* 1. 상단: 파트 전담 PM 헤더 & 파트명(상담) 명확히 표시 */}
      <div style={{
        background: 'linear-gradient(180deg, #10233F 0%, #0A111E 100%)',
        padding: '20px 18px 16px 18px',
        borderBottom: '1px solid rgba(0, 229, 255, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 229, 255, 0.12)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            padding: '3px 10px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#00E5FF'
          }}>
            <ShieldCheck size={13} color="#00E5FF" />
            <span>신한DS 현장관리인 전담 대시보드</span>
          </div>

          <span style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 600 }}>
            {currentUser.name}
          </span>
        </div>

        {/* 메인 파트명 명시 (스크린샷 / 지침 일치: '파트명(상담)') */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#90A4AE', fontWeight: 600 }}>
              전담 관제 파트
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#FFFFFF', margin: '2px 0 0 0', letterSpacing: '-0.5px' }}>
              파트명({activePart})
            </h1>
          </div>

          {/* 담당 협력사 뱃지 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
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

        {/* 3개 파트 스위처 (파트별 데이터 격리 테스트용 탭) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          marginTop: '14px',
          background: 'rgba(0,0,0,0.3)',
          padding: '4px',
          borderRadius: '10px'
        }}>
          {['상담', '오토', '재무'].map(pName => (
            <button
              key={pName}
              type="button"
              onClick={() => setActivePart(pName)}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: 'none',
                background: activePart === pName ? '#0052FF' : 'transparent',
                color: activePart === pName ? '#FFFFFF' : '#90A4AE',
                fontSize: '12px',
                fontWeight: activePart === pName ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {pName} 파트 {pName === '상담' && <span style={{ fontSize: '9px', color: '#80D8FF' }}>★</span>}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 중앙: 파트별 가동률(%) & 투입 통계 카드 */}
      <div style={{ padding: '16px 16px 8px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{
          background: '#111E33',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          borderRadius: '16px',
          padding: '16px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#90A4AE', fontWeight: 700 }}>
              {activePart} 파트 실시간 가동률
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '32px', fontWeight: 900, color: summary.fulfillmentRate >= 100 ? '#00E676' : '#FF9100' }}>
                {summary.fulfillmentRate.toFixed(1)}%
              </span>
              <span style={{ fontSize: '12.5px', color: '#90A4AE' }}>
                (약정 {summary.targetHeadcount}명 / 실투입 {summary.activeHeadcount}명)
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#80D8FF', marginTop: '4px' }}>
              약정 공수 {summary.targetManHours}h 중 {summary.actualManHours}h 달성
            </div>
          </div>

          {/* 가동률 원형 링 게이지 시각화 */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: `conic-gradient(${summary.fulfillmentRate >= 100 ? '#00E676' : '#FF9100'} ${summary.fulfillmentRate * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0, 229, 255, 0.2)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#111E33',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
              color: '#FFFFFF'
            }}>
              {summary.activeHeadcount}/{summary.targetHeadcount}
            </div>
          </div>
        </div>

        {/* 3. 위반 사례 리포트: '파트 내 투입 공백 발생 인원' (지각/징계 용어 배제) */}
        {gapRecords.length > 0 && (
          <div style={{
            background: 'rgba(255, 109, 0, 0.08)',
            border: '1px solid rgba(255, 145, 0, 0.3)',
            borderRadius: '14px',
            padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF9100', fontSize: '13px', fontWeight: 800 }}>
                <AlertTriangle size={16} />
                <span>파트 내 투입 공백 발생 인원 ({gapRecords.length}명)</span>
              </div>
              <span style={{ fontSize: '10.5px', color: '#FFB74D' }}>클릭 시 개선/소명 요청</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {gapRecords.map(gapRec => (
                <div
                  key={gapRec.id}
                  onClick={() => handleOpenClarification(gapRec)}
                  style={{
                    background: '#192538',
                    border: '1px solid rgba(255, 145, 0, 0.25)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                        {gapRec.workerName} 상담원
                      </span>
                      <span style={{ fontSize: '11px', color: '#FF8A80', background: 'rgba(255,82,82,0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                        {gapRec.varianceMinutes}분 편차
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#90A4AE', marginTop: '2px' }}>
                      {gapRec.gapReason || '출근 시간 지연'} · {gapRec.partnerClarification || '협력사 1차 소명 접수됨'}
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      background: '#FF6D00',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Send size={11} />
                    <span>소명요구</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. 오늘 투입 인원 리스트 헤더 & 전체선택 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              오늘 투입 인원 리스트 ({records.length}명)
            </h2>
            <span style={{ fontSize: '11px', color: '#00E5FF', background: 'rgba(0,229,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              {activePart} 파트 전용
            </span>
          </div>

          <button
            type="button"
            onClick={handleSelectAll}
            style={{
              background: 'none',
              border: 'none',
              color: '#80D8FF',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            {selectedRecordIds.length === records.length ? (
              <>
                <CheckSquare size={14} color="#00E5FF" />
                <span>선택 해제</span>
              </>
            ) : (
              <>
                <Square size={14} color="#90A4AE" />
                <span>전체 선택</span>
              </>
            )}
          </button>
        </div>

        {/* 5. 투입 인원 목록 카드 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {records.map((record) => {
            const isSelected = selectedRecordIds.includes(record.id);
            const isPending = record.verificationStatus === 'PARTNER_CONFIRMED';
            const isSettled = record.verificationStatus === 'SETTLED';

            return (
              <div
                key={record.id}
                style={{
                  background: isSelected ? '#12243D' : '#0F1A2C',
                  border: isSelected ? '1px solid #00E5FF' : '1px solid rgba(255, 255, 255, 0.08)',
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

                    {/* 상태 배지 (지침 일치: 검수 대기 vs 정산 확정) */}
                    {isSettled ? (
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
                        <span>정산 확정</span>
                      </span>
                    ) : isPending ? (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#00E5FF',
                        background: 'rgba(0, 229, 255, 0.15)',
                        border: '1px solid rgba(0, 229, 255, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        검수 대기 (1차 확인완료)
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '11px',
                        color: '#FFB74D',
                        background: 'rgba(255, 183, 77, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        미검증 (협력사 확인전)
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '12.5px', color: '#CFD8DC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#80D8FF', fontWeight: 700 }}>
                      🕒 {record.clockInTime} ~ {record.clockOutTime}
                    </span>
                    <span>실투입: <strong>{record.actualInputHours}h</strong> / 약정 {record.contractedHours}h</span>
                  </div>

                  <div style={{ fontSize: '11.5px', color: '#90A4AE', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    작업내역: {record.taskSummary}
                  </div>

                  {/* 감사 이력 조회 버튼 */}
                  {record.auditTrails && record.auditTrails.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedAuditRecord(record)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#82B1FF',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: 0,
                        marginTop: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <History size={12} />
                      <span>검수 이력 ({record.auditTrails.length}건)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. 하단 Action Zone: '근태 승인'이 아닌 [일일 투입 공수 검수] 버튼 (지침 일치) */}
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
      {/* 팝업 1: [일일 투입 공수 검수] 최종 정산 확정 팝업 (지침 일치 문구) */}
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
            borderRadius: '18px',
            padding: '22px 20px',
            color: '#FFFFFF',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 229, 255, 0.25)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(0, 229, 255, 0.15)',
              border: '1.5px solid #00E5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto'
            }}>
              <FileCheck size={26} color="#00E5FF" />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 900, textAlign: 'center', margin: '0 0 10px 0', color: '#FFFFFF' }}>
              도급 투입 공수 정산 검수
            </h3>

            {/* 고정 지침 팝업 문구 */}
            <p style={{
              fontSize: '14px',
              lineHeight: 1.55,
              color: '#E0E6ED',
              textAlign: 'center',
              margin: '0 0 14px 0',
              fontWeight: 700
            }}>
              "선택한 인원들의 오늘자 투입 실적을 도급 정산 자료로 최종 확정하시겠습니까?"
            </p>

            {/* HR 근태 승인이 아님을 명시하는 법적 고지 배너 */}
            <div style={{
              background: 'rgba(0, 82, 255, 0.15)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '11px',
              color: '#80D8FF',
              lineHeight: 1.4,
              marginBottom: '18px'
            }}>
              ⚖️ <strong>법적 고지</strong>: 본 절차는 파견법 및 노란봉투법 리스크 방지를 위해 <strong>원청의 인사관리상 근태 승인이 아니며</strong>, 도급 계약에 따른 투입 공수 정산 및 SLA 검수 절차입니다.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                style={{
                  flex: 1,
                  height: '46px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
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
                onClick={handleExecuteSettlement}
                style={{
                  flex: 2,
                  height: '46px',
                  borderRadius: '10px',
                  background: 'linear-gradient(90deg, #00C853 0%, #00E676 100%)',
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
      {/* 팝업 2: 협력업체 관리자 대상 [개선 요청(소명 요구)] 발송 모달 */}
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
              공식 요청 공문 내용
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
      {/* 팝업 3: 감사 로그 (Audit Trail Viewer) */}
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
                <span>{selectedAuditRecord.workerName} 검수 감사 로그</span>
              </div>
              <button onClick={() => setSelectedAuditRecord(null)} style={{ background: 'none', border: 'none', color: '#90A4AE', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {selectedAuditRecord.auditTrails.map(log => (
                <div key={log.id} style={{ background: '#0D1726', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #00E5FF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#80D8FF', marginBottom: '2px' }}>
                    <span>{log.actorName} ({log.actorRole})</span>
                    <span>{log.timestamp.substring(11)}</span>
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>{log.action}</div>
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
