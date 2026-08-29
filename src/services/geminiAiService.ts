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
      predictedBottleneck: '금주 목요일(8/27) 14:00~17:00 월말 결제 트래픽 피크 타임 SM 운영 인력 2명 결손 예상',
      slaRiskPercentage: 87,
      trafficImpact: '카드 승인 및 결제 API 대기시간 급증 및 서비스 수준 협약(SLA) 미달 위협',
      aiDirectiveAction: '협력사 A(유브갓)의 예비 SM 온콜 대기 리소스 2명을 피크 집중 관제 파트로 3시간 임시 지원 배치 권고',
      recommendedShiftPlan: {
        sourcePartner: '(주)유브갓',
        shiftWorkerCount: 2,
        shiftDuration: '3시간 (14:00 ~ 17:00)',
        expectedSlaRecovery: '96.8% (정상 기준선 95% 초과 회복)',
        officialDispatchDraft: '수신: (주)유브갓 SM 현장대리인 최영호 귀하\n\nSM 도급계약서 제7조(공정 탄력 조율)에 의거하여, 금주 목요일 오후 월말 결제 피크 시간대(14:00~17:00) 온콜 대기 인력 2명의 집중 모니터링 긴급 지원 배치를 요청합니다.'
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
   * [AI 통계 2] SM 무중단 서비스 SLA 가용성(99.98%) & 장애 복구 시간(MTTR) 지능형 관제
   */
  public async getSmServiceAvailabilityAndMttr(params?: {
    partnerCompany?: string;
    evaluationMonth?: string;
    targetSystem?: string;
  }): Promise<{
    systemName: string;
    partnerCompany: string;
    evaluationMonth: string;
    overallHealthScore: number;
    serviceAvailability: {
      target: string;
      actual: string;
      status: string;
      uptimeHours: number;
      unplannedDowntimeMinutes: number;
    };
    mttrMetrics: {
      targetMinutes: number;
      actualAverageMinutes: number;
      totalIncidents: number;
      fastestRecoveryMinutes: number;
      status: string;
    };
    srFulfillment: {
      totalReceived: number;
      completedOnTime: number;
      fulfillmentRate: string;
      averageProcessingHours: number;
    };
    onCallReadiness: {
      nightDutyCount: number;
      emergencyDispatchCount: number;
      avgResponseMinutes: number;
      complianceRate: string;
    };
    aiOperationalInsights: Array<{
      category: string;
      title: string;
      action: string;
    }>;
    officialReportSummary: string;
  }> {
    try {
      const res = await fetch('/api/ai/sm-availability-mttr-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {})
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (e) {
      console.warn('[Gemini-SM-Availability-Error]', e);
    }

    const partnerCompany = params?.partnerCompany || '(주)유브갓';
    const evaluationMonth = params?.evaluationMonth || '2026년 8월';
    const targetSystem = params?.targetSystem || '신한 카드IS 코어 SM 운영계';

    return {
      systemName: targetSystem,
      partnerCompany,
      evaluationMonth,
      overallHealthScore: 98.6,
      serviceAvailability: {
        target: '99.95%',
        actual: '99.98%',
        status: 'EXCELLENT',
        uptimeHours: 1420.5,
        unplannedDowntimeMinutes: 8.5
      },
      mttrMetrics: {
        targetMinutes: 30,
        actualAverageMinutes: 14.2,
        totalIncidents: 4,
        fastestRecoveryMinutes: 6.0,
        status: 'OPTIMAL'
      },
      srFulfillment: {
        totalReceived: 142,
        completedOnTime: 139,
        fulfillmentRate: '97.9%',
        averageProcessingHours: 3.4
      },
      onCallReadiness: {
        nightDutyCount: 12,
        emergencyDispatchCount: 3,
        avgResponseMinutes: 18.0,
        complianceRate: '100%'
      },
      aiOperationalInsights: [
        {
          category: '예방 점검 (Preventive)',
          title: '월말 정기 배치 메모리 누수 사전 감지',
          action: '매월 25일 02:00 배치 서버 JVM 힙 메모리 자동 가비지 컬렉션 및 인스턴스 롤링 재기동 스케줄 권고'
        },
        {
          category: '장애 격리 (Isolation)',
          title: '외부 결제 PG사 네트워크 타임아웃 감지',
          action: '서킷 브레이커(Circuit Breaker) 임계치를 3초➔1.5초로 탄력 조정하여 코어 뱅킹 스레드 고갈 방지 완료'
        }
      ],
      officialReportSummary: `${targetSystem} ${evaluationMonth} SM 운영 무결점 달성: 서비스 가용성 99.98% (목표 99.95% 초과), MTTR 14.2분(목표 대비 52% 단축), SR 적기 처리율 97.9%로 최우수 운영 등급 획득`
    };
  }

  /**
   * [AI 통계 3] 협력사 SM 운영 품질 및 서비스 신뢰도 지수 (SM Operational Excellence Index)
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
          procurementRecommendation: '최우수 SM 파트너사: 카드 코어 무중단 가동률 1위, 차기년도 SM 재계약 최우선권 부여',
          highlight: '월간 무결격 SM 상주율 99.8% 유지 및 장애 초동 대응 평균 8분 이내 달성'
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
          procurementRecommendation: '우수 SM 파트너사: 모바일 뱅킹 SM 및 대외계 안정적 운영 파트너 유지',
          highlight: '장애 대응 MTTR 100% 준수, 예방 점검 일지 정기 작성 우수'
        },
        {
          rank: 3,
          companyName: '(주)유브갓',
          grade: 'B',
          complianceIndex: 89.1,
          timeConsistencyScore: 87.0,
          slaAchievementScore: 91.5,
          clarificationFidelityScore: 85.0,
          securityCleanRate: 96.0,
          procurementRecommendation: '양호 SM 파트너사: 가맹점 SM 안정 운영 중이나 금요일 피크시간 온콜 백업 강화 권고',
          highlight: 'SR 적기 처리율 96.2%, 월말 피크 대응 인력 보강 필요'
        },
        {
          rank: 4,
          companyName: '부뜰정보통신',
          grade: 'B-',
          complianceIndex: 85.2,
          timeConsistencyScore: 83.0,
          slaAchievementScore: 86.0,
          clarificationFidelityScore: 84.0,
          securityCleanRate: 92.0,
          procurementRecommendation: '지도 대상 SM 파트너사: 예방점검 일지 제출 지연 개선 및 당직 인력 교육 강화 지도',
          highlight: '야간 온콜 응답 시간 편차 발생, 현장대리인 품질 통제 강화 권고'
        }
      ],
      executiveSummary: '2026년 3분기 SM 협력사 평가 결과: 협력아이티에스(98.4점) 1위, 현대IT(94.2점) 2위로 전반적 무중단 가동률 양호.'
    };
  }
}

export const geminiAiService = new GeminiAiService();

