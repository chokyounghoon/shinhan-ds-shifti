import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileCheck, 
  AlertTriangle, 
  Scale, 
  Send, 
  Download, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  Clock, 
  DollarSign, 
  Lock, 
  X
} from 'lucide-react';
import { dbService } from '../services/db';
import { ServiceDeliveryInspection } from '../types';

interface PrincipalInspectionPortalViewProps {
  themeMode: 'ddangyo' | 'shinhan';
}

interface SlaBreachEvidence {
  id: string;
  partnerCompany: string;
  project: string;
  incidentDate: string;
  title: string; // 계약 이행 미달 항목 (지각 대신 계약 미달로 명명)
  varianceTime: string; // 투입 공수 결손 시간
  financialPenalty: number; // 도급비 감액 산정액 (원)
  status: 'EVIDENCE_RECORDED' | 'NOTICE_ISSUED' | 'DEDUCTION_SETTLED';
  description: string;
}

export const PrincipalInspectionPortalView: React.FC<PrincipalInspectionPortalViewProps> = ({
  themeMode
}) => {
  const [inspections, setInspections] = useState<ServiceDeliveryInspection[]>(dbService.getInspections());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedEvidenceForNotice, setSelectedEvidenceForNotice] = useState<SlaBreachEvidence | null>(null);
  const [isOfficialNoticeModalOpen, setIsOfficialNoticeModalOpen] = useState(false);

  // 법적 방어형 SLA 계약 불이행 증거 아카이브 (Evidence Vault)
  const [evidences, setEvidences] = useState<SlaBreachEvidence[]>([
    {
      id: 'ev-01',
      partnerCompany: '(주)협력아이티에스',
      project: '신한 카드IS 개발운영',
      incidentDate: '2026-08-03',
      title: '계약 업무 개시시간(09:00) 투입 인력 공수 미달',
      varianceTime: '51분 결손 (0.85 Man-Hour)',
      financialPenalty: 42500,
      status: 'NOTICE_ISSUED',
      description: '계약서 제12조(업무 수행 시간)에 명시된 필수 상주 인력 투입 지연 발생 건 (협력사 자체 보정 승인 확인 완료)'
    },
    {
      id: 'ev-02',
      partnerCompany: '(주)협력아이티에스',
      project: '신한 카드IS 개발운영',
      incidentDate: '2026-08-10',
      title: '코어 정기 배포 시간대 계약 인력 배치 편차',
      varianceTime: '1시간 결손 (1.0 Man-Hour)',
      financialPenalty: 50000,
      status: 'EVIDENCE_RECORDED',
      description: '도급 계약 SLA 제5조에 따른 야간 이행 공수 결손에 대한 도급비 감액 청구 대상'
    }
  ]);

  const handleAcceptInspection = (inspId: string) => {
    dbService.acceptContractInspection(inspId, '신한DS 도급 검수 완료: SLA 공수 정산 및 도급 대금 지급 승인');
    setInspections(dbService.getInspections());
    setToastMsg('🎉 도급 계약 이행 검수가 승인되어 용역비 정산이 확정되었습니다.');
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenNoticeModal = (ev: SlaBreachEvidence) => {
    setSelectedEvidenceForNotice(ev);
    setIsOfficialNoticeModalOpen(true);
  };

  const handleSendOfficialNotice = () => {
    if (!selectedEvidenceForNotice) return;

    setEvidences(evidences.map(e => 
      e.id === selectedEvidenceForNotice.id ? { ...e, status: 'NOTICE_ISSUED' } : e
    ));

    setIsOfficialNoticeModalOpen(false);
    setToastMsg(`📜 협력사 대표 및 현장대리인 앞으로 [계약 이행 미달(SLA) 시정 요구 및 용역비 감액 통지 공문]이 정식 발송되었습니다.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* 1. 상단 법적 컴플라이언스 보호막 안내 배너 */}
      <div style={{
        background: '#EDF3FF',
        border: '1.5px solid #ADC6FF',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#002C8C', fontSize: '14px', fontWeight: 800 }}>
          <ShieldCheck size={20} color="#0046FF" />
          <span>신한DS 도급 계약 검수 포털 (Contract Performance & SLA)</span>
        </div>
        <p style={{ fontSize: '12px', color: '#1D39C4', lineHeight: 1.5, margin: 0 }}>
          ⚖️ <strong>노란봉투법 & 파견법 세이프가드 가동 중</strong><br />
          신한DS(원청)는 하청 근로자 개인에 대한 인사권(지각 판단, 징계, 근태 수정)을 행사하지 않으며, 
          <strong>'협력사별 총 투입 인력(Man-Power) 준수율'</strong> 및 <strong>'도급 계약상 SLA 이행 검수'</strong>를 통해 용역비 감액/손해배상 청구 근거를 적법하게 확보합니다.
        </p>
      </div>

      {toastMsg && (
        <div style={{
          background: '#191F28',
          color: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toastMsg}
        </div>
      )}

      {/* 2. 총 투입 공수(Man-Power) 및 SLA 준수율 KPI 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div style={kpiBoxStyle}>
          <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600 }}>총 도급 프로젝트</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#191F28', marginTop: '4px' }}>2개</div>
        </div>
        <div style={kpiBoxStyle}>
          <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600 }}>총 약정 공수</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0046FF', marginTop: '4px' }}>24.0 M/M</div>
        </div>
        <div style={kpiBoxStyle}>
          <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600 }}>평균 SLA 준수율</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#12B76A', marginTop: '4px' }}>99.6%</div>
        </div>
      </div>

      {/* 3. 섹션: 협력사별 총 투입 인력(Man-Power) 이행 검수 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileCheck size={18} color="#4E5968" />
          <span>협력사별 월간 투입 공수(M/M) 정산 검수</span>
        </div>

        {inspections.map(insp => (
          <div
            key={insp.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #ECEFF2',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#191F28' }}>
                {insp.projectName}
              </span>
              <span style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: insp.status === 'INSPECTED_ACCEPTED' ? '#12B76A' : '#FF9500',
                background: insp.status === 'INSPECTED_ACCEPTED' ? '#E8F8F0' : '#FFF9E6',
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                {insp.status === 'INSPECTED_ACCEPTED' ? '검수 완료 (대금 확정)' : '검수 대기중'}
              </span>
            </div>

            <div style={{ fontSize: '12.5px', color: '#6B7684', marginBottom: '12px', lineHeight: 1.4 }}>
              • 도급 수급인: <strong>{insp.partnerCompanyName}</strong> (현장대리인: {insp.partnerSiteRepName})<br />
              • 검수 정산 주기: {insp.inspectionMonth}
            </div>

            {/* 투입 인력 M/M 준수율 게이지 */}
            <div style={{ background: '#F8F9FA', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#4E5968' }}>약정 인력: <strong>{insp.contractedManMonths} M/M</strong></span>
                <span style={{ color: '#0046FF', fontWeight: 800 }}>실투입 인력: {insp.actualDeliveredManMonths} M/M ({insp.complianceRate}%)</span>
              </div>
              <div style={{ height: '7px', background: '#E5E8EB', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${insp.complianceRate}%`, height: '100%', background: '#0046FF', borderRadius: '4px' }} />
              </div>
            </div>

            {insp.inspectionNotes && (
              <div style={{ fontSize: '12px', color: '#4E5968', marginBottom: '12px', background: '#FAFAFA', padding: '8px 10px', borderRadius: '6px' }}>
                ℹ️ {insp.inspectionNotes}
              </div>
            )}

            {insp.status === 'SUBMITTED' && (
              <button
                onClick={() => handleAcceptInspection(insp.id)}
                style={{
                  width: '100%',
                  height: '42px',
                  background: '#0046FF',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={16} />
                <span>도급 공수 이행 검수 승인 (용역 대금 정산 확정)</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 4. 섹션: 계약 이행 미달(SLA 미준수) 증거 아카이브 (Evidence Vault) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Scale size={18} color="#D9480F" />
            <span>계약 이행 미달(SLA) 증거 및 도급비 감액 산출 내역</span>
          </div>
          <span style={{ fontSize: '11.5px', color: '#8B95A1' }}>징계 ❌ / 계약 패널티 ⭕</span>
        </div>

        {evidences.map(ev => (
          <div
            key={ev.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #ECEFF2',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#8B95A1' }}>
                  {ev.incidentDate} · {ev.partnerCompany}
                </span>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#191F28', marginTop: '2px' }}>
                  {ev.title}
                </div>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: ev.status === 'NOTICE_ISSUED' ? '#0066FF' : '#D9480F',
                background: ev.status === 'NOTICE_ISSUED' ? '#EDF3FF' : '#FFF4E6',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {ev.status === 'NOTICE_ISSUED' ? '공문 발송완료' : '증거 기록됨'}
              </span>
            </div>

            <p style={{ fontSize: '12.5px', color: '#4E5968', lineHeight: 1.4, margin: 0 }}>
              {ev.description}
            </p>

            <div style={{
              background: '#FFF9F5',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #FFE8D6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11.5px', color: '#8B95A1' }}>투입 결손 편차</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#191F28' }}>{ev.varianceTime}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11.5px', color: '#8B95A1' }}>도급 용역비 감액 산정액</span>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#D9480F' }}>
                  -₩{ev.financialPenalty.toLocaleString()}원
                </div>
              </div>
            </div>

            {ev.status === 'EVIDENCE_RECORDED' && (
              <button
                onClick={() => handleOpenNoticeModal(ev)}
                style={{
                  height: '38px',
                  background: '#191F28',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                <Send size={15} />
                <span>협력사에 공식 시정 요구 및 감액 통지 공문 발행</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 5. 물리 보안 출입로그 정책 (산안법 & 보안 목적) */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #ECEFF2',
        borderRadius: '12px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#191F28' }}>
          <Lock size={16} color="#8B95A1" />
          <span>신한DS 데이터센터 물리 보안 출입로그 연동 기준</span>
        </div>
        <p style={{ fontSize: '11.5px', color: '#6B7684', lineHeight: 1.45, margin: 0 }}>
          출퇴근 태깅 기록은 <strong>'산업안전보건법 제63조(도급인의 안전조치) 및 금융보안원 물리적 망분리·시설보안 규정'</strong>에 의거하여 재난·보안 관리 목적으로만 수집되며, 하청 근로자 개인에 대한 직접적인 복무 징계 목적으로 사용되지 않습니다.
        </p>
      </div>

      {/* 6. 공식 시정 요구 공문 발행 모달 (Official SLA Violation Notice) */}
      {isOfficialNoticeModalOpen && selectedEvidenceForNotice && (
        <div 
          className="modal-overlay"
          onClick={() => setIsOfficialNoticeModalOpen(false)}
          style={{ alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
        >
          <div 
            style={{
              width: '90%',
              maxWidth: '380px',
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '22px 20px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#191F28' }}>
                📜 도급 계약 SLA 위반 시정 공문
              </span>
              <button onClick={() => setIsOfficialNoticeModalOpen(false)} style={{ color: '#8B95A1' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: '#F8F9FA',
              border: '1px solid #ECEFF2',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '12.5px',
              color: '#333D4B',
              lineHeight: 1.5,
              marginBottom: '16px'
            }}>
              <strong>문서번호</strong>: SH-DS-SLA-2026-{selectedEvidenceForNotice.id}<br />
              <strong>수신</strong>: {selectedEvidenceForNotice.partnerCompany} 대표이사 및 현장대리인<br />
              <strong>발신</strong>: (주)신한DS ICT운영부문 도급계약관리팀<br />
              <strong>제목</strong>: 도급 계약(SLA) 투입 공수 편차에 따른 시정 요구 및 정산 감액 통지 건<br />
              <hr style={{ border: 'none', borderTop: '1px solid #E5E8EB', margin: '10px 0' }} />
              귀사와 체결한 도급계약 제14조(서비스수준협약)에 의거하여, {selectedEvidenceForNotice.incidentDate} 발생한 투입 공수 결손({selectedEvidenceForNotice.varianceTime})에 대해 차기 도급 대금에서 <strong>₩{selectedEvidenceForNotice.financialPenalty.toLocaleString()}원</strong>을 정산 감액함을 사전 통지하며, 재발 방지 대책서 제출을 요청합니다.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsOfficialNoticeModalOpen(false)}
                style={{ padding: '10px 16px', background: '#F1F3F5', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 700, color: '#4E5968' }}
              >
                닫기
              </button>
              <button
                onClick={handleSendOfficialNotice}
                style={{ padding: '10px 16px', background: '#0046FF', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}
              >
                공문 발행 및 정산 반영
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const kpiBoxStyle: React.CSSProperties = {
  background: '#FFFFFF',
  padding: '12px 10px',
  borderRadius: '10px',
  border: '1px solid #ECEFF2',
  textAlign: 'center'
};
