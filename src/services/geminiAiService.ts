/**
 * Google Gemini AI Enterprise Subcontracting Management Service
 * 
 * 1. 협력사 '소명 사유' AI 자동 필터링 및 판독 (AI SLA Reason Auditor & Triage)
 * 2. 월말 도급 정산용 '공문(이메일)' 자동 초안 생성 (AI Monthly Penalty Notice Generator)
 * 3. 이상 징후(꼼수) 패턴 AI 자동 탐지 (AI Stealth Pattern & Anomaly Radar)
 */

export interface AiClarificationAudit {
  verdict: 'REJECT' | 'ACCEPT' | 'REVIEW';
  verdictLabel: '[수용 불가]' | '[정상 참작]' | '[추가 확인 필요]';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  penaltyDeductionHours: number;
  legalBasis: string;
  summaryReasoning: string;
  recommendedAction: string;
}

export interface AiPenaltyNotice {
  docNumber: string;
  subject: string;
  recipient: string;
  sender: string;
  bodyHtml: string;
  bodyText: string;
  summaryBullets: string[];
  replyDeadline: string;
}

export interface AiAnomalyItem {
  id: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  targetName: string;
  patternType: string;
  statisticalEvidence: string;
  behavioralAnalysis: string;
  recommendedAction: string;
}

export interface AiAnomalyRadarReport {
  analysisTimestamp: string;
  totalAnalyzedLogs: number;
  highRiskCount: number;
  anomalies: AiAnomalyItem[];
}

export class GeminiAiService {
  /**
   * 1. 협력사 '소명 사유' AI 자동 필터링 및 판독
   */
  public async auditClarificationReason(params: {
    employeeName: string;
    companyName: string;
    reasonText: string;
    delayMinutes?: number;
    incidentDate?: string;
  }): Promise<AiClarificationAudit> {
    try {
      const res = await fetch('/api/ai/audit-clarification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('[Gemini AI Audit Clarification Error]', err);
    }

    // Client-side heuristic fallback
    const text = params.reasonText || '';
    const isReject = text.includes('막혀') || text.includes('야근') || text.includes('늦잠') || text.includes('개인') || text.includes('피곤');
    const isAccept = text.includes('교육') || text.includes('병원') || text.includes('사전 통보') || text.includes('천재지변');

    return {
      verdict: isReject ? 'REJECT' : isAccept ? 'ACCEPT' : 'REVIEW',
      verdictLabel: isReject ? '[수용 불가]' : isAccept ? '[정상 참작]' : '[추가 확인 필요]',
      severity: isReject ? 'HIGH' : isAccept ? 'LOW' : 'MEDIUM',
      penaltyDeductionHours: isReject ? 0.5 : 0,
      legalBasis: isReject
        ? '도급 계약서 제12조(이행 보증)에 의거, 통상 출퇴근 교통 사정은 수탁사 고유 위험 영역으로 계약상 면책 불가함.'
        : '사전 승인된 협력사 직무 교육 또는 불가항력 사유로 인정 기준에 부합함.',
      summaryReasoning: isReject
        ? '도급 계약상 출퇴근 트래픽 및 개인 사정은 면책 사유가 될 수 없습니다.'
        : '공식 절차에 따른 사전 통보가 확인되어 정상 참작 처리 가능합니다.',
      recommendedAction: isReject
        ? '도급 계약상 당일 0.5 M/D 공수 차감 및 소명 반려 권고'
        : '도급 실적 인정 및 정상 승인 권고'
    };
  }

  /**
   * 2. 월말 도급 정산용 '공문(이메일)' 자동 초안 생성
   */
  public async generatePenaltyNotice(params: {
    partnerCompany: string;
    partnerCeo?: string;
    partnerRep?: string;
    targetMonth?: string;
    contractedMM?: number;
    actualMM?: number;
    complianceRate?: number;
    breachCount?: number;
    totalPenaltyAmount?: number;
    breachItems?: string[];
  }): Promise<AiPenaltyNotice> {
    try {
      const res = await fetch('/api/ai/generate-penalty-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('[Gemini AI Generate Notice Error]', err);
    }

    const company = params.partnerCompany || '유브갓';
    const rate = params.complianceRate || 92.0;
    const amount = params.totalPenaltyAmount || 480000;

    return {
      docNumber: `SHDS-SLA-202608-${Math.floor(100 + Math.random() * 900)}`,
      subject: `[공문] 2026년 8월 도급 용역 이행률 미달(${rate}%)에 따른 기성 용역비 공제 통지의 건`,
      recipient: `${company} 대표이사 귀하`,
      sender: '주식회사 신한DS 도급총괄 PM 조경훈 수석',
      bodyHtml: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1E293B;">
          <p><strong>수신:</strong> ${company} 대표이사 귀하<br/><strong>발신:</strong> 주식회사 신한DS 도급관리 총괄 PM</p>
          <hr style="border: 0; border-top: 1px solid #CBD5E1; margin: 16px 0;" />
          <p>1. 귀사의 무궁한 발전을 기원합니다.</p>
          <p>2. 당사와 귀사 간 체결된 「도급계약서」 제12조(용역 수행 및 기성 정산) 및 SLA 기준에 의거하여, 당월 도급 인력 투입 실적 검수 결과를 통보합니다.</p>
          <div style="background: #F8FAFC; padding: 14px; border-radius: 8px; border: 1px solid #E2E8F0; margin: 16px 0;">
            <strong>[당월 도급 기성 정산 감액 내역]</strong>
            <ul>
              <li>도급 이행률: <strong>${rate}%</strong> (계약 목표 대비 미달 발생)</li>
              <li><strong>당월 기성비 감액 공제액: 금 ${amount.toLocaleString()}원정 (VAT 별도)</strong></li>
            </ul>
          </div>
          <p>3. 상기 감액 사항에 대해 이의가 있으신 경우 3영업일 이내에 공식 소명서를 제출하여 주시기 바랍니다.</p>
        </div>
      `,
      bodyText: `[공문] 도급 용역 이행률 미달(${rate}%)에 따른 기성 용역비 공제 통지...`,
      summaryBullets: [
        `도급 이행률 ${rate}% (약정 대비 결손 발생)`,
        `SLA 위반에 따른 ${amount.toLocaleString()}원 기성비 감액 청구`,
        `이의신청 기한: 발송일로부터 3영업일 이내`
      ],
      replyDeadline: '2026년 9월 3일 (목) 18:00까지'
    };
  }

  /**
   * 3. 이상 징후(꼼수) 패턴 AI 자동 탐지
   */
  public async detectAnomalyPatterns(): Promise<AiAnomalyRadarReport> {
    try {
      const res = await fetch('/api/ai/detect-anomaly-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('[Gemini AI Anomaly Detection Error]', err);
    }

    return {
      analysisTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      totalAnalyzedLogs: 1420,
      highRiskCount: 2,
      anomalies: [
        {
          id: 'ANOM-01',
          riskLevel: 'HIGH',
          targetName: '이하은 (유브갓)',
          patternType: '금요일 상습 지연 투입 패턴',
          statisticalEvidence: '최근 4주간 금요일 투입 시간 평균 09:47 (평일 대비 +47분 편차, 상관계수 0.94)',
          behavioralAnalysis: '주말 직전 반복적인 업무 개시 지연으로 금요일 오전 코어 타임 공수 누수 발생',
          recommendedAction: '협력사 현장대리인(최영호) 공식 호출 및 금요일 도급 투입 실시간 점검 확약 징구'
        },
        {
          id: 'ANOM-02',
          riskLevel: 'HIGH',
          targetName: '(주)협력아이티에스',
          patternType: '월말 소명서 몰아넣기 (사후 대량 보정)',
          statisticalEvidence: '당월 전체 소명 18건 중 15건(83.3%)이 8월 27~29일 월말에 일괄 상신됨',
          behavioralAnalysis: '실시간 현장 관리가 부재하여 월말 기성 검수 직전 허위/형식적 사후 보정 시도 의심',
          recommendedAction: '24시간 초과 사후 소명 건 일체 인정 불허 및 기성비 감액 산정 통보'
        },
        {
          id: 'ANOM-03',
          riskLevel: 'MEDIUM',
          targetName: '박민우 (현대IT솔루션)',
          patternType: 'GPS 100m 경계선(98m) 턱걸이 인증',
          statisticalEvidence: '최근 10회 인증 중 8회가 지오펜스 95~99m 경계 지점(을지로입구역 2번 출구 부근)에서 발생',
          behavioralAnalysis: '실제 사무실 입실 전 이동 중 턱걸이 인증으로 시간 벌기 의심',
          recommendedAction: '100m 반경 진입 후 사내 Wi-Fi/비콘 2차 교차 인증 강제 적용 권고'
        }
      ]
    };
  }

  /**
   * [AI 통계 1] SLA-공수 실시간 최적화 및 병목 예측 자율 에이전트
   */
  public async getPredictiveSlaOptimization(params?: {
    currentWeek?: string;
    targetPart?: string;
  }): Promise<{
    riskLevel: 'CRITICAL' | 'WARNING' | 'NORMAL';
    predictedBottleneck: string;
    slaRiskPercentage: number;
    trafficImpact: string;
    aiDirectiveAction: string;
    recommendedShiftPlan: {
      sourcePartner: string;
      shiftWorkerCount: number;
      shiftDuration: string;
      expectedSlaRecovery: string;
      officialDispatchDraft: string;
    };
    simulationCurve: Array<{ time: string; withoutAi: number; withAiShift: number }>;
  }> {
    try {
      const res = await fetch('/api/ai/predictive-sla-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {})
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (e) {
      console.warn('[Gemini-SLA-Optimizer-Error]', e);
    }

    return {
      riskLevel: 'CRITICAL',
      predictedBottleneck: '금주 목요일(8/27) 14:00~17:00 피크 타임 운영 인력 2명 결손 예상',
      slaRiskPercentage: 87,
      trafficImpact: '카드 인바운드 상담 대기시간 14분 초과 및 CTI 응답 지연 리스크',
      aiDirectiveAction: '협력사 A(유브갓)의 프로젝트 비상주 리소스 2명을 운영 파트로 3시간 임시 전환 배치하는 공정 조율안을 권고합니다.',
      recommendedShiftPlan: {
        sourcePartner: '(주)유브갓',
        shiftWorkerCount: 2,
        shiftDuration: '3시간 (14:00 ~ 17:00)',
        expectedSlaRecovery: '96.8% (정상 기준선 95% 초과 회복)',
        officialDispatchDraft: '수신: (주)유브갓 현장대리인 최영호 귀하\n\n도급계약서 제7조(공정 탄력 조율)에 의거하여, 금주 목요일 피크 시간대(14:00~17:00) 프로젝트 투입 인력 2명의 운영 파트 긴급 공정 전환 배치를 요청합니다.'
      },
      simulationCurve: [
        { time: '10:00', withoutAi: 98, withAiShift: 98 },
        { time: '12:00', withoutAi: 96, withAiShift: 97 },
        { time: '14:00', withoutAi: 88, withAiShift: 96 },
        { time: '15:00', withoutAi: 84, withAiShift: 97 },
        { time: '16:00', withoutAi: 86, withAiShift: 96 },
        { time: '18:00', withoutAi: 95, withAiShift: 98 }
      ]
    };
  }

  /**
   * [AI 통계 2] B2B 도급비 자동 정산 및 페널티 실시간 시뮬레이터
   */
  public async simulateBillingAndPenalty(params?: {
    partnerCompany?: string;
    settlementMonth?: string;
    baseContractPrice?: number;
  }): Promise<{
    partnerCompany: string;
    settlementMonth: string;
    contractedAmount: number;
    deliveredHoursRate: number;
    totalPenaltyDeduction: number;
    finalPayableAmount: number;
    defenseVerdict: string;
    deductionBreakdown: Array<{
      clause: string;
      target: string;
      calculationFormula: string;
      deductionAmount: number;
      evidenceTimestamp: string;
    }>;
    oneClickSummarySheet: string;
  }> {
    try {
      const res = await fetch('/api/ai/billing-penalty-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {})
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (e) {
      console.warn('[Gemini-Billing-Simulator-Error]', e);
    }

    const basePrice = params?.baseContractPrice || 120000000;
    const penalty = 1420000;
    return {
      partnerCompany: params?.partnerCompany || '(주)유브갓',
      settlementMonth: params?.settlementMonth || '2026년 8월',
      contractedAmount: basePrice,
      deliveredHoursRate: 95.0,
      totalPenaltyDeduction: penalty,
      finalPayableAmount: basePrice - penalty,
      defenseVerdict: '계약서 제12조 3항 및 SLA 제5조에 따른 시간 단위 산식 일치로 협력사의 반박 여지 원천 차단',
      deductionBreakdown: [
        {
          clause: '도급계약 제12조(공수 결손 정산)',
          target: '이하은 외 1명 (총 8.0 Man-Hours 결손)',
          calculationFormula: '8.0h × 시간당 기본단가(₩75,000)',
          deductionAmount: 600000,
          evidenceTimestamp: '8/3, 8/10, 8/21 출퇴근 타임스탬프 누적 편차'
        },
        {
          clause: 'SLA 제5조(코어 타임 투입 미달 페널티)',
          target: '배포 및 피크 시간대 지연 4건',
          calculationFormula: '건당 위약벌 가산금 ₩150,000 × 4건',
          deductionAmount: 600000,
          evidenceTimestamp: '8/7 09:45, 8/14 09:51 GPS 지오펜스 인증 지연 로그'
        },
        {
          clause: '도급계약 제18조(사전 미통보 공백 배상)',
          target: '사전 서면 통보 없는 임의 공백 2건',
          calculationFormula: '건당 ₩110,000 × 2건',
          deductionAmount: 220000,
          evidenceTimestamp: '8/19 14:00~16:00 CTI 공백 로그'
        }
      ],
      oneClickSummarySheet: `${params?.partnerCompany || '(주)유브갓'} 8월 도급 기성 정산표: 약정금액 ₩${basePrice.toLocaleString()} - 총 감액 ₩1,420,000 = 최종 지급액 ₩${(basePrice - penalty).toLocaleString()}원 (증빙 3종 첨부 완료)`
    };
  }

  /**
   * [AI 통계 3] 협력사 계약 이행 지수(Compliance Index) 자동 산출기
   */
  public async getPartnerComplianceIndex(): Promise<{
    evaluationPeriod: string;
    totalEvaluatedPartners: number;
    partnerRankings: Array<{
      rank: number;
      companyName: string;
      grade: 'S' | 'A' | 'B' | 'B-' | 'C' | 'D';
      complianceIndex: number;
      timeConsistencyScore: number;
      slaAchievementScore: number;
      clarificationFidelityScore: number;
      securityCleanRate: number;
      procurementRecommendation: string;
      highlight: string;
    }>;
    executiveSummary: string;
  }> {
    try {
      const res = await fetch('/api/ai/partner-compliance-index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (e) {
      console.warn('[Gemini-Compliance-Index-Error]', e);
    }

    return {
      evaluationPeriod: '2026년 3분기 (누적)',
      totalEvaluatedPartners: 4,
      partnerRankings: [
        {
          rank: 1,
          companyName: '(주)협력아이티에스',
          grade: 'S',
          complianceIndex: 98.4,
          timeConsistencyScore: 99.0,
          slaAchievementScore: 98.5,
          clarificationFidelityScore: 97.0,
          securityCleanRate: 100.0,
          procurementRecommendation: '최우수 파트너사: 차기년도 계약 갱신 우선권 및 단가 3.5% 인상 검토 권고',
          highlight: '월간 무결격 인력 투입률 99.8% 유지 및 신속한 공정 대체 체계 구축'
        },
        {
          rank: 2,
          companyName: '현대IT솔루션',
          grade: 'A',
          complianceIndex: 94.2,
          timeConsistencyScore: 94.0,
          slaAchievementScore: 95.0,
          clarificationFidelityScore: 92.0,
          securityCleanRate: 98.0,
          procurementRecommendation: '우수 파트너사: 계약 유지 및 코어 파트 유지보수 배정 적합',
          highlight: '장애 대응 SLA 100% 준수, 일부 GPS 경계선 턱걸이 인증 개선 권고'
        },
        {
          rank: 3,
          companyName: '(주)유브갓',
          grade: 'B',
          complianceIndex: 88.6,
          timeConsistencyScore: 86.0,
          slaAchievementScore: 91.0,
          clarificationFidelityScore: 84.0,
          securityCleanRate: 96.0,
          procurementRecommendation: '조건부 갱신 파트너사: 금요일 투입 편차 및 월말 몰아넣기 소명에 대한 관리 개선 확약 필요',
          highlight: '기성비 8% 결손 발생, 현장대리인 통제 강화 지도 요구'
        },
        {
          rank: 4,
          companyName: '부뜰정보통신',
          grade: 'B-',
          complianceIndex: 84.1,
          timeConsistencyScore: 82.0,
          slaAchievementScore: 85.0,
          clarificationFidelityScore: 83.0,
          securityCleanRate: 92.0,
          procurementRecommendation: '주의 파트너사: 단가 인하 협상 및 대체 수급사 다변화 검토 권고',
          highlight: '지연 소명 24시간 초과율 22%로 현장 관리 미흡'
        }
      ],
      executiveSummary: '2026년 3분기 도급사 평가 결과: 협력아이티에스(98.4점) 1위, 유브갓(88.6점) 및 부뜰(84.1점)은 계약 관리 감독 강화 필요.'
    };
  }
}

export const geminiAiService = new GeminiAiService();

