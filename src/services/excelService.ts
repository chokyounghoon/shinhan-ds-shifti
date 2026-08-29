/**
 * Excel & CSV Export / Import Service
 * - 한글 깨짐 방지 UTF-8 BOM 인코딩 완벽 지원
 * - 도급 인력 투입 실적(Manpower Inputs) 엑셀 내보내기
 * - 월별 근태 리포트 엑셀 내보내기
 */

export class ExcelService {
  /**
   * 데이터 배열을 UTF-8 BOM CSV 파일로 다운로드
   */
  public exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
    const bom = '\uFEFF';
    const csvContent = [
      headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 도급 인력 투입 실적(Manpower Inputs) 엑셀 내보내기
   */
  public exportManpowerRecords(records: any[], partName?: string) {
    const headers = [
      '기록ID', '일자', '파트명', '협력사', '사번', '성명', 
      '계약공수(h)', '실투입공수(h)', '출근시간', '퇴근시간', 
      '편차(분)', 'SLA위반여부', '업무내역', '검수정산상태'
    ];

    const rows = records.map(r => [
      r.recordId || r.record_id || '',
      r.workDate || r.work_date || '',
      r.partName || r.part_name || '',
      r.partnerCompany || r.partner_company || '',
      r.employeeId || r.employee_id || '',
      r.workerName || r.worker_name || '',
      r.contractedHours || r.contracted_hours || 8.0,
      r.actualInputHours || r.actual_input_hours || 8.0,
      r.clockInTime || r.clock_in_time || '',
      r.clockOutTime || r.clock_out_time || '',
      r.varianceMinutes || r.variance_minutes || 0,
      (r.isSlaBreach || r.is_sla_breach) ? '위반' : '정상',
      r.taskSummary || r.task_summary || '',
      r.verificationStatus || r.verification_status || 'AUTO_SETTLED'
    ]);

    const title = `신한DS_도급인력투입실적_${partName || '전체'}`;
    this.exportToCsv(title, headers, rows);
  }

  /**
   * 근태 현황 리포트 엑셀 내보내기
   */
  public exportAttendanceStats(stats: any[], dateRange: string) {
    const headers = ['성명', '소속사', '파트', '정상출근', '지각', '조퇴', '휴가/결근', '총근무시간(h)'];
    const rows = stats.map(s => [
      s.name,
      s.company,
      s.part || '상담',
      s.normalCount || 0,
      s.lateCount || 0,
      s.earlyLeaveCount || 0,
      s.vacationCount || 0,
      s.totalHours || 40
    ]);

    this.exportToCsv(`신한DS_근태통계리포트_${dateRange.replace(/\s+/g, '')}`, headers, rows);
  }
}

export const excelService = new ExcelService();
