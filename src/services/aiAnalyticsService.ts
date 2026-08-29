/**
 * AI & Smart SLA Risk Analytics Engine
 * - 도급 파트별 공정 리스크 지수(SLA Risk Score) 실시간 산출
 * - 노동청 표준 준수 소명서 AI 자동 완성 가이드
 * - 투입 공백 사전 예측 및 대체인력 추천
 */

export interface PartRiskAnalysis {
  partName: string;
  partnerCompany: string;
  riskScore: number; // 0 ~ 100 (높을수록 위험)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lateRate: number; // 지각률 (%)
  gapRate: number; // 공백률 (%)
  slaBreachCount: number;
  recommendations: string[];
  predictedBreachRisk: string; // e.g. "다음 주 월요일 오전 9시 투입 지연 가능성 38%"
}

export interface ClarificationDraftOption {
  category: 'TRANSPORT_DELAY' | 'MILITARY_TRAINING' | 'FAMILY_EVENT' | 'CUSTOMER_OUTSIDE' | 'HEALTH_CHECK';
  title: string;
  generatedText: string;
  legalChecklist: string[];
}

export class AIAnalyticsService {
  /**
   * 파트별 도급 공정 SLA 리스크 예측 및 분석
   */
  public analyzePartSlaRisk(records: any[], partName: string, partnerCompany?: string): PartRiskAnalysis {
    const partRecords = records.filter(r => {
      const matchPart = !partName || partName === 'ALL' || r.partName === partName || r.part_name === partName;
      const matchComp = !partnerCompany || partnerCompany === 'ALL' || r.partnerCompany === partnerCompany || r.partner_company === partnerCompany;
      return matchPart && matchComp;
    });

    if (partRecords.length === 0) {
      return {
        partName: partName || '전체 파트',
        partnerCompany: partnerCompany || '전체 협력사',
        riskScore: 5,
        riskLevel: 'LOW',
        lateRate: 0,
        gapRate: 0,
        slaBreachCount: 0,
        recommendations: ['현재 등록된 공정 편차 데이터가 없어 정상 상태로 유지 중입니다.'],
        predictedBreachRisk: '특이 위험 징후 없음 (정상 운영 중)'
      };
    }

    const total = partRecords.length;
    const lates = partRecords.filter(r => (r.varianceMinutes || r.variance_minutes || 0) > 0 || r.status === 'LATE').length;
    const breaches = partRecords.filter(r => r.isSlaBreach === 1 || r.is_sla_breach === 1 || (r.varianceMinutes || r.variance_minutes || 0) >= 30).length;
    const gaps = partRecords.filter(r => r.actualInputHours < 8 || r.actual_input_hours < 8).length;

    const lateRate = Math.round((lates / total) * 100);
    const gapRate = Math.round((gaps / total) * 100);

    // 가중치 스코어링 (지각 30%, SLA위반 50%, 공백 20%)
    let riskScore = Math.min(100, Math.round((lateRate * 0.3) + (breaches / total * 50) + (gapRate * 0.2)));
    if (breaches > 2) riskScore = Math.max(riskScore, 75);

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 50) riskLevel = 'HIGH';
    else if (riskScore >= 25) riskLevel = 'MEDIUM';

    const recommendations: string[] = [];
    if (lateRate > 15) {
      recommendations.push('협력사 현장관리자 앞 대중교통 혼잡 노선 파악 및 유연근무 시차 출퇴근 권고 공문 발송 필요');
    }
    if (breaches > 0) {
      recommendations.push(`SLA 30분 이상 지연 ${breaches}건에 대해 수급사업자 자율 소명서 공식 징구 요망`);
    }
    if (gapRate > 20) {
      recommendations.push('사전 투입 공백 통보제(Pre-Gap Notice) 준수율 확인 및 대체 인력 풀 가동 점검 권고');
    }
    if (recommendations.length === 0) {
      recommendations.push('도급 공수 기준 100% 정상 투입 중이며 SLA 컴플라이언스 우수 수준을 유지하고 있습니다.');
    }

    const predictedBreachRisk = riskScore >= 50
      ? `🚨 [주의] 익일 오전 08:30~09:30 투입 지연 발생 확률 ${riskScore}% (사전 소명 권고)`
      : `✅ 안정적 공정 이행 중 (익일 리스크 지수: ${riskScore}%)`;

    return {
      partName: partName || '상담 파트',
      partnerCompany: partnerCompany || '전체',
      riskScore,
      riskLevel,
      lateRate,
      gapRate,
      slaBreachCount: breaches,
      recommendations,
      predictedBreachRisk
    };
  }

  /**
   * 노동청 적법 도급 기준 소명서 AI 자동 초안 생성
   */
  public generateClarificationDraft(
    category: ClarificationDraftOption['category'],
    workerName: string,
    partnerCompany: string,
    partName: string,
    varianceMinutes: number
  ): ClarificationDraftOption {
    switch (category) {
      case 'TRANSPORT_DELAY':
        return {
          category,
          title: '대중교통 지연 및 돌발 상황 소명서',
          generatedText: `[수급사업자(${partnerCompany}) 공식 소명서]
수신: 신한DS 카드개발팀 ${partName} 파트 담당 PM 귀하
발신: ${partnerCompany} 현장관리인

1. 공정 투입 개요:
   - 대상 인력: ${partnerCompany} 소속 ${workerName}
   - 편차 시간: 약 ${varianceMinutes || 45}분 투입 지연 발생

2. 사유 및 경위:
   금일 오전 출근 시간대 지하철(대중교통) 운행 장애로 인하여 현장 도착이 지연되었습니다.
   해당 근로자는 소속사(${partnerCompany}) 현장대리인에게 즉시 보고하였으며, 서울교통공사 간편지연증명서를 수급사업자가 접수·확인하였습니다.

3. 공정 만회 조치:
   당일 부여된 도급 과업의 일정 차질 방지를 위해 금일 잔여 시간 내 집중 공정을 수행하여 계약된 서비스 결과물을 정상 납품하도록 수급사업자 자체 관리·감독하겠습니다.

첨부: 대중교통 지연확인서 1부.`,
          legalChecklist: [
            '원청의 직접 징계권 행사 차단 문구 포함',
            '수급사업자 자체 보고 및 통제 체계 명시',
            '과업 결과물 완수 보증 확약'
          ]
        };

      case 'CUSTOMER_OUTSIDE':
        return {
          category,
          title: '고객사 외부 지원 및 공정 외근 소명서',
          generatedText: `[수급사업자(${partnerCompany}) 공식 소명서]
수신: 신한DS 카드개발팀 ${partName} 파트 담당 PM 귀하
발신: ${partnerCompany} 현장관리인

1. 공정 투입 개요:
   - 대상 인력: ${partnerCompany} 소속 ${workerName}
   - 수행 업무: ${partName} 시스템 현장 데이터 이행 지원 및 외부 연계 검증

2. 사유 및 경위:
   계약된 도급 공정 범위 내 외부 사업장 연계 테스트 지원을 위하여 당사(${partnerCompany})의 자체 업무 지시에 따라 현장 출장 투입되었습니다.

3. 정상 도급 공수 인정 요청:
   본 외근은 도급 계약 목적 달성을 위한 필수 단위 공정이므로 당일 8.0 공수를 전액 정상 이행으로 인정하여 주시기 바랍니다.`,
          legalChecklist: [
            '수급사업자 자체 외근 명령 입증',
            '도급 계약 목적물 연계성 증빙',
            '정상 기성 인정 요청 양식 준수'
          ]
        };

      case 'MILITARY_TRAINING':
        return {
          category,
          title: '법정 공민권(예비군/민방위) 행사 사전 통보 및 소명서',
          generatedText: `[수급사업자(${partnerCompany}) 공식 소명서]
수신: 신한DS 카드개발팀 ${partName} 파트 담당 PM 귀하
발신: ${partnerCompany} 현장관리인

1. 대상 인력: ${partnerCompany} 소속 ${workerName}
2. 법정 공민권 행사: 향토예비군설치법 및 민방위기본법에 의거한 법정 훈련 소집
3. 조치 사항:
   소속사에서 훈련 소집 통지서를 사전 접수하였으며, 공정 결손 방지를 위해 동일 파트 내 백업 인력이 기 지정된 유지보수 모듈을 지원하도록 조치 완료하였습니다.`,
          legalChecklist: [
            '근로기준법 제10조(공민권 행사의 보장) 근거 명시',
            '파트 내 백업 지원 계획 포함',
            '도급 공정 연속성 확보 증빙'
          ]
        };

      case 'HEALTH_CHECK':
        return {
          category,
          title: '산업안전보건법 지정 정기 건강검진 소명서',
          generatedText: `[수급사업자(${partnerCompany}) 공식 소명서]
수신: 신한DS 카드개발팀 ${partName} 파트 담당 PM 귀하
발신: ${partnerCompany} 현장관리인

1. 대상 인력: ${partnerCompany} 소속 ${workerName}
2. 사유: 산업안전보건법 제129조에 따른 ${partnerCompany} 연례 일반건강검진 수검
3. 소속사 자체 복무 규정에 의거 4시간 공가 승인 처리 후 오후 정상 투입을 확인하였습니다.`,
          legalChecklist: [
            '산업안전보건법 법령 근거 명시',
            '소속사 자체 공가 승인 내역 명시'
          ]
        };

      case 'FAMILY_EVENT':
      default:
        return {
          category: 'FAMILY_EVENT',
          title: '수급사업자 경조사 및 청원 휴가 소명서',
          generatedText: `[수급사업자(${partnerCompany}) 공식 소명서]
수신: 신한DS 카드개발팀 ${partName} 파트 담당 PM 귀하
발신: ${partnerCompany} 현장관리인

1. 대상 인력: ${partnerCompany} 소속 ${workerName}
2. 사유: 당사(${partnerCompany}) 취업규칙 제28조(경조휴가)에 따른 법정 경조사 참여
3. 소속사 현장관리인이 증빙서류(청첩장/가족관계증명서)를 수령·검토 완료하였으며, 투입 공백을 사전 통보 드립니다.`,
          legalChecklist: [
            '수급사업자 취업규칙 근거 명시',
            '원청 승인이 아닌 수급사 자율 승인 후 통보 절차 준수'
          ]
        };
    }
  }
}

export const aiAnalyticsService = new AIAnalyticsService();
