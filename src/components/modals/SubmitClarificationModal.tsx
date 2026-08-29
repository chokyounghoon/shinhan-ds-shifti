import React, { useState } from 'react';
import { X, Send, Calendar, Clock, AlertTriangle, Sparkles, FileText, CheckCircle2, Paperclip, RefreshCw, ShieldCheck } from 'lucide-react';
import { dbService } from '../../services/db';

export interface UnclarifiedIncident {
  id: string;
  incidentDate: string;
  type: 'LATE' | 'MISSING_PUNCH' | 'EARLY_LEAVE';
  typeLabel: string;
  delayMinutes?: number;
  varianceTime: string;
  scheduledTime: string;
  actualTime: string;
  defaultReason?: string;
}

interface SubmitClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident?: UnclarifiedIncident | null;
  onClarificationSubmitted: (newRequest: any) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const SubmitClarificationModal: React.FC<SubmitClarificationModalProps> = ({
  isOpen,
  onClose,
  incident,
  onClarificationSubmitted,
  themeMode
}) => {
  const currentUser = dbService.getCurrentUser();
  const partnerCompany = currentUser?.partnerCompany || currentUser?.companyName || '유브갓';
  const approverName = `${partnerCompany} 현장대리인 (PM)`;

  const [category, setCategory] = useState<'TRAFFIC' | 'CLIENT_OFFSITE' | 'SYSTEM_GPS_ERROR' | 'OFFICIAL_DUTY' | 'OTHER'>('TRAFFIC');
  const [targetDate, setTargetDate] = useState(incident?.incidentDate || '2026-08-28');
  const [actualStartTime, setActualStartTime] = useState(incident?.type === 'LATE' ? '09:45' : '09:00');
  const [actualEndTime, setActualEndTime] = useState('18:00');
  const [reasonText, setReasonText] = useState(incident?.defaultReason || '');
  const [hasAttachment, setHasAttachment] = useState(true);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달이 열릴 때 incident 정보로 초기화
  React.useEffect(() => {
    if (incident) {
      setTargetDate(incident.incidentDate);
      if (incident.type === 'LATE') {
        setActualStartTime('09:45');
        setCategory('TRAFFIC');
      } else {
        setActualStartTime('09:00');
        setCategory('SYSTEM_GPS_ERROR');
      }
    }
  }, [incident]);

  if (!isOpen) return null;

  // AI 자동 소명문 추천 생성
  const handleGenerateAiReason = async (presetType: string) => {
    setIsAiGenerating(true);
    try {
      // Gemini AI 기반 표준 도급 소명 템플릿
      let text = '';
      if (presetType === 'TRAFFIC') {
        text = `출근 시간대 지하철 2호선 열차 신호 고장으로 인해 당일 09:45경 지연 투입되었습니다. 서울교통공사 공식 간편지연증명서(45분 지연)를 증빙으로 첨부하며, 퇴근 후 잔여 공수를 성실히 보충 완료하였습니다. 도급 SLA 공수 정상 참작을 요청드립니다.`;
      } else if (presetType === 'CLIENT_OFFSITE') {
        text = `당일 오전 09:00부터 신한카드 고객사 현장(을지로 본사 12층) 긴급 SM 장애 대응 및 운영 지원을 위해 외근지로 직접 이동하여 근무를 개시하였습니다. 현장 작업 일지 및 고객사 담당자 확인 내역을 첨부합니다.`;
      } else if (presetType === 'SYSTEM_GPS_ERROR') {
        text = `08:55경 사옥 3층 사무실 입실 완료하였으나 단말기 GPS 수신 음영 및 사내 Wi-Fi 교차 검증 일시 지연으로 출근 태그가 누락되었습니다. 사옥 출입 게이트 스피드게이트 통과 기록(08:53)을 증빙으로 첨부하여 소명합니다.`;
      } else if (presetType === 'OFFICIAL_DUTY') {
        text = `예비군 훈련 소집 통지서에 따른 공적 의무 수행 건으로 사전 구두 보고 후 참가하였습니다. 훈련 이수증명서를 첨부하오니 공정 약정 공수로 인정 승인을 요청합니다.`;
      } else {
        text = `계약서 제12조에 따른 불가피한 업무 사유로 투입 시간이 편차 발생하였으며, 세부 작업 증빙을 첨부하여 소명서를 제출합니다.`;
      }

      setReasonText(text);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonText.trim()) {
      alert('소명 사유를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    const empId = currentUser?.employeeId || currentUser?.id || 'PT20260816';
    const empName = currentUser?.name || '직원';
    const companyName = currentUser?.partnerCompany || currentUser?.companyName || '유브갓';
    const typeTitle = incident?.type === 'LATE' ? '지각 투입 소명' : '출근 누락 소명';
    const incidentType = incident?.type || 'LATE';

    try {
      // D1 clarification_requests 테이블에 저장 (2단계 결재 시작)
      const res = await fetch('/api/clarification-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: empId,
          employee_name: empName,
          company_name: companyName,
          incident_type: incidentType,
          incident_date: targetDate,
          scheduled_time: incident?.scheduledTime || '09:00',
          actual_time: actualStartTime,
          delay_minutes: incident?.delayMinutes || 0,
          reason_text: reasonText,
          category: category,
          has_attachment: hasAttachment
        })
      });

      const json = res.ok ? await res.json() : null;
      const newId = json?.id || `clar-${Date.now()}`;

      // 로컬 상태 동기화용 요청 객체 (RequestsView 탭에 즉시 반영)
      const newRequest = {
        id: newId,
        requestType: 'PUNCH_CORRECTION',
        title: typeTitle,
        targetDate,
        startTime: actualStartTime,
        endTime: actualEndTime,
        reason: reasonText,
        status: 'PENDING_PARTNER' as any,
        partnerCompany: companyName,
        approverName: `${companyName} 현장대리인`,
        createdDate: new Date().toISOString().substring(0, 10),
        // 결재 진행 상태 표시용
        clarificationStep: 1,
        incidentType
      };

      dbService.addRequest(newRequest);
      onClarificationSubmitted(newRequest);

      alert(`🎉 [${typeTitle}] 소명서가 상신되었습니다.\n\n결재 단계:\n1️⃣ [대기중] 협력사(${companyName}) 현장대리인 1차 검수\n2️⃣ [대기중] 신한DS 현장대리인 최종 승인\n\n• 발생 일자: ${targetDate}\n• 실제 투입: ${actualStartTime}\n• 증빙: ${hasAttachment ? '첨부 완료' : '없음'}\n\n🛡️ 승인 완료 시 해당 공수가 정상 인정됩니다.`);
      onClose();
    } catch (err) {
      console.warn('소명 등록 오류:', err);
      alert('소명서 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        maxWidth: '540px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 헤더 */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          padding: '18px 22px',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '10px',
              padding: '8px',
              display: 'flex'
            }}>
              <AlertTriangle size={22} color="#F87171" />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px' }}>
                SUBCONTRACTING SLA CLARIFICATION
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 900, margin: '2px 0 0 0' }}>
                투입 결손 및 지각 소명서 등록
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 폼 본문 */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* 노란봉투법 준수 결재선 배너 */}
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '11.5px',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <ShieldCheck size={16} color="#16A34A" />
            <span>
              <strong>적법 소명 결재선:</strong> 원청이 아닌 <strong>소속사({partnerCompany}) 현장대리인</strong>에게 전결 상신됩니다.
            </span>
          </div>

          {/* 발생 일자 및 소명 유형 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                결손 발생일자
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                소명 사유 분류
              </label>
              <select
                value={category}
                onChange={(e: any) => {
                  setCategory(e.target.value);
                  handleGenerateAiReason(e.target.value);
                }}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 600 }}
              >
                <option value="TRAFFIC">대중교통 연착/체증</option>
                <option value="CLIENT_OFFSITE">고객사 외근/긴급배포</option>
                <option value="SYSTEM_GPS_ERROR">사옥 게이트/GPS 오류</option>
                <option value="OFFICIAL_DUTY">예비군/공적의무 수행</option>
                <option value="OTHER">기타 사유</option>
              </select>
            </div>
          </div>

          {/* 실제 근무 투입 시간 */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              실제 투입 시간 (인정 요청 시간)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="time"
                value={actualStartTime}
                onChange={(e) => setActualStartTime(e.target.value)}
                style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', textAlign: 'center' }}
              />
              <span style={{ color: '#64748B', fontWeight: 700 }}>~</span>
              <input
                type="time"
                value={actualEndTime}
                onChange={(e) => setActualEndTime(e.target.value)}
                style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', textAlign: 'center' }}
              />
            </div>
          </div>

          {/* Google Gemini AI 소명 템플릿 추천 버튼 바 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>상세 소명 사유</span>
              </label>
              <button
                type="button"
                onClick={() => handleGenerateAiReason(category)}
                disabled={isAiGenerating}
                style={{
                  background: 'linear-gradient(135deg, #312E81 0%, #4338CA 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={12} color="#A5B4FC" />
                <span>{isAiGenerating ? 'AI 작성중...' : '✨ AI 소명문 자동작성'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="예: 출근길 지하철 2호선 고장으로 인한 지연 투입이며, 지연증명서를 구비하여 제출합니다..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                lineHeight: 1.5,
                resize: 'none'
              }}
            />
          </div>

          {/* 증빙 자료 첨부 박스 */}
          <div style={{
            background: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Paperclip size={16} color="#64748B" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  증빙자료 첨부: {hasAttachment ? '지연증명서_20260828.pdf (첨부됨)' : '파일 없음'}
                </div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                  지하철 간편지연증명서, 사옥 게이트 로그, 외근 확인서 등
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHasAttachment(!hasAttachment)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              {hasAttachment ? '변경' : '파일 추가'}
            </button>
          </div>

          {/* 하단 제출 버튼 */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: '#F1F5F9',
                color: '#475569',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              취소
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 2,
                background: 'linear-gradient(90deg, #0052FF 0%, #0046E0 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0, 82, 255, 0.3)'
              }}
            >
              <Send size={15} />
              <span>{isSubmitting ? '소명서 상신 중...' : '소명서 제출 및 결재 요청'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
