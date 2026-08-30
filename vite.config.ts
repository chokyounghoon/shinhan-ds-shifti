import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// 로컬 개발 환경용 D1 API 미들웨어
function localApiPlugin(): Plugin {
  // 로컬 메모리 DB 저장소
  const localRequests: any[] = [
    {
      id: 'req-init-1',
      employee_id: 'PT20260816',
      user_id: 'PT20260816',
      user_name: '김신한',
      company_name: '유브갓',
      request_type: 'VACATION',
      vacation_type: '연차',
      target_date: '2026-08-25',
      start_date: '2026-08-25',
      end_date: '2026-08-25',
      hours: 8,
      reason: '소속사 정기 연차 휴가',
      status: 'APPROVED',
      approver_name: '유브갓 현장관리인',
      created_at: '2026-08-24 09:00:00'
    }
  ];

  const localNotifications: any[] = [
    {
      id: 'noti-init-1',
      type: 'GENERAL',
      title: '시스템 정상 가동 중',
      content: '신한DS 도급 인력 투입 및 공정 검수 관리 포털이 정상 구동되었습니다.',
      target_role: 'ALL',
      part_name: '상담',
      is_read: 0,
      link_url: '',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      created_by: 'SYSTEM',
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updated_by: 'SYSTEM'
    }
  ];

  const localMessages: any[] = [];

  return {
    name: 'local-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        // 1) /api/notifications (GET, POST, PUT)
        if (url.startsWith('/api/notifications')) {
          res.setHeader('Content-Type', 'application/json');

          if (req.method === 'GET') {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: localNotifications }));
            return;
          }

          if (req.method === 'POST') {
            let bodyStr = '';
            req.on('data', chunk => { bodyStr += chunk; });
            req.on('end', () => {
              try {
                const body = bodyStr ? JSON.parse(bodyStr) : {};
                const newNoti = {
                  id: body.id || `noti-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                  type: body.type || 'GENERAL',
                  title: body.title || '새 알림',
                  content: body.content || '',
                  target_role: body.target_role || body.targetRole || 'ALL',
                  part_name: body.part_name || body.partName || '상담',
                  link_url: body.link_url || body.linkUrl || '',
                  is_read: 0,
                  created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  created_by: body.created_by || 'SYSTEM',
                  updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  updated_by: 'SYSTEM'
                };
                localNotifications.unshift(newNoti);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, message: '알림이 등록되었습니다.', id: newNoti.id }));
              } catch (e) {
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, message: '로컬 알림 처리 완료' }));
              }
            });
            return;
          }

          if (req.method === 'PUT') {
            if (url.includes('/read-all')) {
              localNotifications.forEach(n => { n.is_read = 1; });
            } else {
              const id = url.split('/')[3];
              const noti = localNotifications.find(n => n.id === id);
              if (noti) noti.is_read = 1;
            }
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: '알림 읽음 처리 완료' }));
            return;
          }
        }

        // 2) /api/messages (GET, POST, PUT)
        if (url.startsWith('/api/messages')) {
          res.setHeader('Content-Type', 'application/json');

          if (req.method === 'GET') {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: localMessages }));
            return;
          }

          if (req.method === 'POST') {
            let bodyStr = '';
            req.on('data', chunk => { bodyStr += chunk; });
            req.on('end', () => {
              try {
                const body = bodyStr ? JSON.parse(bodyStr) : {};
                const newMsg = {
                  id: body.id || `msg-${Date.now()}`,
                  sender_id: body.sender_id || 'USER',
                  sender_name: body.sender_name || '신한DS PM',
                  sender_role: body.sender_role || 'DS_PRINCIPAL_PM',
                  receiver_role: body.receiver_role || 'ALL',
                  part_name: body.part_name || '상담',
                  title: body.title || '메시지',
                  content: body.content || '',
                  reply_content: null,
                  is_read: 0,
                  created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                };
                localMessages.unshift(newMsg);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, message: '메시지 발송 완료', id: newMsg.id }));
              } catch (e) {
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, message: '로컬 메시지 처리 완료' }));
              }
            });
            return;
          }

          if (req.method === 'PUT') {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: '처리되었습니다.' }));
            return;
          }
        }

        // 3) /api/attendance/requests (GET, POST, DELETE, PUT)
        if (url.startsWith('/api/attendance/requests') || url.startsWith('/api/attendance/request')) {
          res.setHeader('Content-Type', 'application/json');

          // [PUT] 협력사 1차 결재 / DS 최종 승인
          if (req.method === 'PUT') {
            let bodyStr = '';
            req.on('data', chunk => { bodyStr += chunk; });
            req.on('end', () => {
              try {
                const body = bodyStr ? JSON.parse(bodyStr) : {};
                const parts = url.split('/');
                const id = parts[4];
                const action = parts[5];

                const target = localRequests.find(r => r.id === id);
                if (target) {
                  if (action === 'partner-approve') {
                    target.status = 'PENDING_DS';
                    target.approver_name = body.approver_name || '협력사 현장관리인';
                    target.review_comment = body.memo || '1차 결재 완료';
                  } else if (action === 'partner-reject') {
                    target.status = 'REJECTED';
                    target.approver_name = body.approver_name || '협력사 현장관리인';
                  } else if (action === 'ds-approve') {
                    target.status = 'APPROVED';
                    target.approver_name = body.approver_name || '신한DS 수석PM';
                    target.review_comment = body.memo || '최종 검수 승인';
                  } else if (action === 'ds-reject') {
                    target.status = 'REJECTED';
                    target.approver_name = body.approver_name || '신한DS 수석PM';
                  }
                }
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, message: '상태가 업데이트되었습니다.' }));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: String(e) }));
              }
            });
            return;
          }

          // [DELETE] 삭제
          if (req.method === 'DELETE') {
            const parts = url.split('/');
            const id = parts[4];
            const idx = localRequests.findIndex(r => r.id === id);
            if (idx >= 0) localRequests.splice(idx, 1);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: '삭제되었습니다.' }));
            return;
          }

          // [POST] 등록
          if (req.method === 'POST') {
            let bodyStr = '';
            req.on('data', chunk => { bodyStr += chunk; });
            req.on('end', () => {
              try {
                const body = JSON.parse(bodyStr);
                const newReq = {
                  id: body.id || `req-vac-${Date.now()}`,
                  employee_id: body.employee_id || 'PT20260816',
                  user_id: body.user_id || 'PT20260816',
                  user_name: body.user_name || '김신한',
                  company_name: body.company_name || body.partner_company || '유브갓',
                  request_type: body.request_type || 'VACATION',
                  vacation_type: body.vacation_type || '연차',
                  target_date: body.target_date || '2026-08-30',
                  start_date: body.start_date || body.target_date || '2026-08-30',
                  end_date: body.end_date || body.target_date || '2026-08-30',
                  hours: Number(body.hours) || 8,
                  reason: body.reason || '휴가 신청',
                  status: body.status || 'PENDING',
                  approver_name: body.approver_name || '협력사 현장관리인',
                  created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                };
                localRequests.unshift(newReq);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, message: '등록되었습니다.', data: newReq }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: String(e) }));
              }
            });
            return;
          }

          // [GET] 조회
          if (req.method === 'GET') {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: localRequests }));
            return;
          }
        }

        // 4) /api/vacation/balances
        if (url.startsWith('/api/vacation/balances')) {
          res.setHeader('Content-Type', 'application/json');
          const approvedCount = localRequests.filter(r => r.request_type === 'VACATION' && r.status === 'APPROVED').length;
          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            data: {
              annual: { total: 18, used: approvedCount, remaining: Math.max(0, 18 - approvedCount) },
              fitness: { total: 5, used: 0, remaining: 5 },
              special: { total: 3, used: 0, remaining: 3 }
            }
          }));
          return;
        }

        // 5) /api/ai/audit-clarification
        if (url.startsWith('/api/ai/audit-clarification')) {
          res.setHeader('Content-Type', 'application/json');
          if (req.method === 'POST') {
            let bodyStr = '';
            req.on('data', chunk => { bodyStr += chunk; });
            req.on('end', async () => {
              try {
                const body = bodyStr ? JSON.parse(bodyStr) : {};
                const reasonText = (body.reasonText || '').toLowerCase();
                const delayMinutes = Number(body.delayMinutes) || 45;

                const rejectKeywords = ['지하철', '고장', '교통', '체증', '정체', '막혀', '늦잠', '숙취', '피곤', '개인', '늦었', '지각', '버스', '택시', '도로', '18', '짜증'];
                const acceptKeywords = ['사전 승인', '직무 교육', '공식 교육', '예비군', '민방위', '법정 공가', '천재지변', '원청 요청', '야간 장애'];

                const isReject = rejectKeywords.some(kw => reasonText.includes(kw));
                const isAccept = !isReject && acceptKeywords.some(kw => reasonText.includes(kw));

                const aiResult = {
                  verdict: isReject ? 'REJECT' : isAccept ? 'ACCEPT' : 'REVIEW',
                  verdictLabel: isReject ? '[수용 불가]' : isAccept ? '[정상 참작]' : '[추가 확인 필요]',
                  severity: isReject ? 'HIGH' : isAccept ? 'LOW' : 'MEDIUM',
                  penaltyDeductionHours: isReject ? (delayMinutes >= 60 ? 1.0 : 0.5) : 0,
                  legalBasis: isReject 
                    ? '도급계약서 제12조(용역 이행 보증) 및 SLA 기준: 출퇴근 대중교통 지연/고장, 도로 체증 및 개인 사정은 수탁사(협력사)의 고유 노무관리 위험 부담 영역으로 원청 도급비 면책 불가함.'
                    : '사전 승인된 협력사 직무 교육 또는 불가항력 사유로 인정 기준에 부합함.',
                  summaryReasoning: isReject
                    ? '지하철 고장 및 출퇴근 교통 체증은 수탁사 귀책 사유로 도급 공수 인정이 불가합니다.'
                    : '공식 절차에 따른 사전 승인이 확인되어 정상 참작 처리 가능합니다.',
                  recommendedAction: isReject
                    ? `도급 용역비 ${delayMinutes >= 60 ? '1.0' : '0.5'} Man-Hour 공수 차감 및 소명서 [반려] 권고`
                    : '도급 실적 인정 및 [정상 승인] 권고'
                };

                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, data: aiResult }));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: String(e) }));
              }
            });
            return;
          }
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://shinhan-ds-shifti.pages.dev',
        changeOrigin: true,
        secure: true
      }
    }
  }
});
