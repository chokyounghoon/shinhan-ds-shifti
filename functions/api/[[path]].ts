import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

type Bindings = {
  DB: D1Database;
  BREVO_API_KEY?: string;
  RESEND_API_KEY?: string;
  ENVIRONMENT?: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

// CORS Middleware
app.use('*', async (c, next) => {
  await next();
  c.res.headers.set('Access-Control-Allow-Origin', '*');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

app.options('*', (c) => c.text('', 204));

// 한국 표준시 (KST) 생성 유틸
const getKst = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kst = new Date(utc + (9 * 3600000));
  return kst.toISOString().replace('T', ' ').slice(0, 19);
};

// 비밀번호 해싱 유틸
const hashPassword = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const encoder = new TextEncoder();
  const data = encoder.encode(saltHex + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
};

const verifyPassword = async (password: string, storedHash: string | null) => {
  if (!storedHash) return false;
  if (storedHash === password) return true;
  if (!storedHash.includes(':')) {
    return storedHash === '••••••••' ? password.length >= 6 : false;
  }
  try {
    const [saltHex, originalHash] = storedHash.split(':');
    const encoder = new TextEncoder();
    const data = encoder.encode(saltHex + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex === originalHash;
  } catch (e) {
    return false;
  }
};

// 이메일 발송 유틸 (Resend / Brevo)
const sendEmail = async (c: any, { to, subject, html, fromName }: { to: string; subject: string; html: string; fromName?: string }) => {
  const resendApiKey = c.env.RESEND_API_KEY;
  const brevoApiKey = c.env.BREVO_API_KEY;
  const mailFromName = fromName || '신한DS 시프티 (SHIFTI)';
  const mailFrom = 'noreply@chokerslab.store';

  let success = false;

  // 1. Resend
  if (resendApiKey) {
    try {
      const rsRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${mailFromName} <${mailFrom}>`,
          to: [to],
          subject,
          html
        })
      });
      if (rsRes.ok) success = true;
    } catch (e) {
      console.error('[Email-Resend-Error]', e);
    }
  }

  // 2. Brevo
  if (!success && brevoApiKey) {
    try {
      const bvRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'x-sib-api-key': brevoApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: mailFromName, email: mailFrom },
          to: [{ email: to }],
          subject,
          htmlContent: html
        })
      });
      if (bvRes.ok) success = true;
    } catch (e) {
      console.error('[Email-Brevo-Error]', e);
    }
  }

  // 3. Fallback: 공용 메일 발송 Worker 프록시
  if (!success) {
    try {
      const proxyRes = await fetch('https://sguardai.khcho0421.workers.dev/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, fromName: mailFromName })
      });
      if (proxyRes.ok) {
        const json: any = await proxyRes.json();
        if (json.success) success = true;
      }
    } catch (e) {
      console.error('[Email-Proxy-Error]', e);
    }
  }

  return success;
};

// ==========================================
// 1. 비밀번호 재설정 (Reset Password)
// ==========================================

// 1-1. 재설정 인증코드 요청 (이메일 발송)
app.post('/auth/reset/request', async (c) => {
  try {
    const { employee_id } = await c.req.json();
    const db = c.env.DB;

    if (!employee_id) {
      return c.json({ success: false, detail: '사번 또는 이메일을 입력해주세요.' }, 400);
    }

    const rawEmpId = employee_id.trim();
    const user: any = await db.prepare(
      "SELECT employee_id, email, name FROM users WHERE UPPER(employee_id) = UPPER(?) OR LOWER(email) = LOWER(?)"
    ).bind(rawEmpId, rawEmpId).first();

    if (!user) {
      return c.json({ success: false, detail: '가입 정보가 없거나 사번이 일치하지 않습니다.', code: 'NOT_FOUND' }, 404);
    }

    const email = user.email;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // reset_verifications 테이블 저장
    await db.prepare(
      "INSERT INTO reset_verifications (email, code, created_at, is_verified) VALUES (?, ?, ?, 0)"
    ).bind(email, code, getKst()).run();

    // 이메일 마스킹
    const [userPart, domainPart] = email.split('@');
    const maskedEmail = userPart.slice(0, 2) + '*'.repeat(Math.max(1, userPart.length - 2)) + '@' + domainPart;

    // 이메일 발송 시도
    await sendEmail(c, {
      to: email,
      subject: '[신한DS SHIFTI] 비밀번호 재설정 인증코드 안내',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: auto; padding: 32px; background: #0A101D; color: #FFFFFF; border-radius: 16px; border: 1px solid #1E293B;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #00E5FF; font-size: 22px; margin: 0 0 6px 0; font-weight: 800;">신한DS SHIFTI</h1>
            <p style="color: #94A3B8; font-size: 13px; margin: 0;">도급 인력 근태 관리 포털</p>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #E2E8F0;">
            안녕하세요, <strong>${user.name || rawEmpId}</strong>님.<br/>
            요청하신 비밀번호 재설정을 위한 6자리 인증코드입니다.
          </p>
          <div style="background: rgba(0, 229, 255, 0.08); border: 1px dashed #00E5FF; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #00E5FF;">${code}</span>
          </div>
          <p style="font-size: 12px; color: #64748B; margin-top: 20px; line-height: 1.5;">
            • 본 인증번호는 10분간 유효합니다.<br/>
            • 본인이 요청하지 않은 경우 신한DS 담당자에게 즉시 문의 바랍니다.
          </p>
        </div>
      `
    });

    console.log(`[Shifti-Reset-OTP] ${rawEmpId} (${email}) -> OTP: ${code}`);

    return c.json({
      success: true,
      status: 'success',
      message: '인증코드가 발송되었습니다. 수신함을 확인해 주세요.',
      masked_email: maskedEmail,
      dev_otp: c.env.ENVIRONMENT !== 'production' ? code : undefined
    });
  } catch (err: any) {
    console.error('[Reset-Request-Error]', err);
    return c.json({ success: false, detail: err.message || '인증코드 요청 중 오류가 발생했습니다.' }, 500);
  }
});

// 1-2. 재설정 인증코드 검증 및 새 비밀번호 설정
app.post('/auth/reset/verify', async (c) => {
  try {
    const { employee_id, code, password } = await c.req.json();
    const db = c.env.DB;

    if (!employee_id || !code) {
      return c.json({ success: false, detail: '사번과 인증번호를 모두 입력해 주세요.' }, 400);
    }
    if (!password || password.length < 8) {
      return c.json({ success: false, detail: '비밀번호는 8자 이상이어야 합니다.' }, 400);
    }

    const rawEmpId = employee_id.trim();
    const user: any = await db.prepare(
      "SELECT employee_id, email FROM users WHERE UPPER(employee_id) = UPPER(?) OR LOWER(email) = LOWER(?)"
    ).bind(rawEmpId, rawEmpId).first();

    if (!user) {
      return c.json({ success: false, detail: '사용자를 찾을 수 없습니다.' }, 404);
    }

    const record: any = await db.prepare(
      "SELECT * FROM reset_verifications WHERE email = ? AND code = ? AND is_verified = 0 ORDER BY created_at DESC LIMIT 1"
    ).bind(user.email, code.trim()).first();

    if (!record) {
      return c.json({ success: false, detail: '인증번호가 일치하지 않거나 이미 사용되었습니다.' }, 400);
    }

    // 비밀번호 해싱 및 사용자 업데이트
    const hashedPw = await hashPassword(password);
    const now = getKst();

    await db.batch([
      db.prepare("UPDATE reset_verifications SET is_verified = 1 WHERE inc_id = ?").bind(record.inc_id),
      db.prepare("UPDATE users SET password_hash = ?, status = 'ACTIVE', failed_attempts = 0, updated_at = ? WHERE employee_id = ?")
        .bind(hashedPw, now, user.employee_id)
    ]);

    return c.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해 주세요.'
    });
  } catch (err: any) {
    console.error('[Reset-Verify-Error]', err);
    return c.json({ success: false, detail: err.message || '비밀번호 재설정 중 오류가 발생했습니다.' }, 500);
  }
});

// ==========================================
// 2. 기본 인증 (Auth Flow)
// ==========================================

// 2-1. 사번 조회 및 2FA 이메일 OTP 발송 (/auth/init)
app.post('/auth/init', async (c) => {
  try {
    const { employee_id, check_only } = await c.req.json();
    const db = c.env.DB;

    if (!employee_id) {
      return c.json({ success: false, detail: '사번을 입력해주세요.' }, 400);
    }

    const rawEmpId = employee_id.trim();
    const user: any = await db.prepare(
      "SELECT * FROM users WHERE UPPER(employee_id) = UPPER(?) OR LOWER(email) = LOWER(?)"
    ).bind(rawEmpId, rawEmpId).first();

    if (!user) {
      return c.json({
        success: true,
        exists: false,
        status: 'NOT_FOUND',
        code: 'NOT_FOUND',
        message: '등록되지 않은 사번입니다. 신규 가입을 진행해주세요.'
      });
    }

    const [userPart, domainPart] = (user.email || '').split('@');
    const maskedEmail = userPart ? `${userPart.slice(0, 2)}***@${domainPart}` : '';

    // check_only가 아니면 실제 OTP 생성 및 이메일 발송
    let devOtp: string | undefined = undefined;
    if (!check_only) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Math.floor(Date.now() / 1000) + 600; // 10분 유효
      const now = getKst();
      const otpId = `otp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      await db.prepare(`
        INSERT INTO otp_verifications 
        (id, employee_id, email, otp_code, expires_at, is_verified, created_at, created_by)
        VALUES (?, ?, ?, ?, ?, 0, ?, 'SYSTEM')
      `).bind(otpId, user.employee_id, user.email, code, expiresAt, now).run();

      devOtp = code;

      // 이메일 발송
      await sendEmail(c, {
        to: user.email,
        subject: '[신한DS SHIFTI] 2FA 로그인 1회용 인증코드 (OTP)',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: auto; padding: 32px; background: #0A101D; color: #FFFFFF; border-radius: 16px; border: 1px solid #1E293B;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #00E5FF; font-size: 22px; margin: 0 0 6px 0; font-weight: 800;">신한DS SHIFTI</h1>
              <p style="color: #94A3B8; font-size: 13px; margin: 0;">도급 인력 근태 관리 포털</p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #E2E8F0;">
              안녕하세요, <strong>${user.name || user.employee_id}</strong>님.<br/>
              포털 로그인을 위한 2FA 인증코드입니다.
            </p>
            <div style="background: rgba(0, 229, 255, 0.08); border: 1px dashed #00E5FF; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #00E5FF;">${code}</span>
            </div>
            <p style="font-size: 12px; color: #64748B; margin-top: 20px; line-height: 1.5;">
              • 본 인증번호는 10분간 유효합니다.<br/>
              • 본인이 요청하지 않은 경우 신한DS 보안 담당자에게 문의 바랍니다.
            </p>
          </div>
        `
      });

      console.log(`[Shifti-Init-OTP] ${user.employee_id} (${user.email}) -> OTP: ${code}`);
    }

    return c.json({
      success: true,
      exists: true,
      status: user.status || 'ACTIVE',
      employee_id: user.employee_id,
      name: user.name,
      email: user.email,
      masked_email: maskedEmail,
      company: user.company,
      team: user.team,
      part: user.part,
      role: user.role,
      has_password: !!user.password_hash && user.password_hash !== '••••••••',
      dev_otp: devOtp
    });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// 2-2. 2FA 이메일 OTP 검증 (/auth/verify-otp)
app.post('/auth/verify-otp', async (c) => {
  try {
    const { employee_id, otp, password, is_new_user, mode } = await c.req.json();
    const db = c.env.DB;

    if (!employee_id || !otp) {
      return c.json({ success: false, detail: '사번과 인증번호를 모두 입력해주세요.' }, 400);
    }

    const rawEmpId = employee_id.trim();
    const user: any = await db.prepare(
      "SELECT * FROM users WHERE UPPER(employee_id) = UPPER(?) OR LOWER(email) = LOWER(?)"
    ).bind(rawEmpId, rawEmpId).first();

    if (!user) {
      return c.json({ success: false, detail: '사용자를 찾을 수 없습니다.' }, 404);
    }

    const currentEpoch = Math.floor(Date.now() / 1000);
    const otpRecord: any = await db.prepare(`
      SELECT * FROM otp_verifications 
      WHERE employee_id = ? AND otp_code = ? AND is_verified = 0 AND expires_at >= ?
      ORDER BY created_at DESC LIMIT 1
    `).bind(user.employee_id, otp.trim(), currentEpoch).first();

    if (!otpRecord) {
      return c.json({ success: false, detail: '인증번호가 일치하지 않거나 만료되었습니다.' }, 400);
    }

    const now = getKst();
    const batchQueries: any[] = [
      db.prepare("UPDATE otp_verifications SET is_verified = 1, verified_at = ? WHERE id = ?").bind(now, otpRecord.id)
    ];

    if (password && password.length >= 8) {
      const hashedPw = await hashPassword(password);
      batchQueries.push(
        db.prepare("UPDATE users SET password_hash = ?, status = 'ACTIVE', failed_attempts = 0, last_login_at = ?, updated_at = ? WHERE employee_id = ?")
          .bind(hashedPw, now, now, user.employee_id)
      );
    } else {
      batchQueries.push(
        db.prepare("UPDATE users SET failed_attempts = 0, last_login_at = ?, updated_at = ? WHERE employee_id = ?")
          .bind(now, now, user.employee_id)
      );
    }

    await db.batch(batchQueries);

    return c.json({
      success: true,
      message: '인증이 완료되었습니다.',
      user: {
        employee_id: user.employee_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        team: user.team,
        part: user.part,
        position: user.position,
        role: user.role,
        is_partner_manager: user.is_partner_manager,
        is_admin: user.is_admin,
        status: 'ACTIVE'
      }
    });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// 2-2. 비밀번호 로그인 (/auth/login)
app.post('/auth/login', async (c) => {
  try {
    const { employee_id, password } = await c.req.json();
    const db = c.env.DB;

    if (!employee_id || !password) {
      return c.json({ success: false, detail: '사번과 비밀번호를 입력해주세요.' }, 400);
    }

    const rawEmpId = employee_id.trim();
    const user: any = await db.prepare(
      "SELECT * FROM users WHERE UPPER(employee_id) = UPPER(?) OR LOWER(email) = LOWER(?)"
    ).bind(rawEmpId, rawEmpId).first();

    if (!user) {
      return c.json({ success: false, detail: '등록되지 않은 사번입니다.' }, 404);
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      await db.prepare("UPDATE users SET failed_attempts = failed_attempts + 1 WHERE employee_id = ?").bind(user.employee_id).run();
      return c.json({ success: false, detail: '비밀번호가 일치하지 않습니다.' }, 401);
    }

    const now = getKst();
    await db.prepare("UPDATE users SET failed_attempts = 0, last_login_at = ?, updated_at = ? WHERE employee_id = ?")
      .bind(now, now, user.employee_id).run();

    return c.json({
      success: true,
      user: {
        employee_id: user.employee_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        team: user.team,
        part: user.part,
        position: user.position,
        role: user.role,
        is_partner_manager: user.is_partner_manager,
        is_admin: user.is_admin,
        status: user.status
      }
    });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// 2-3. 신규 사용자 등록 (/auth/signup)
app.post('/auth/signup', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    const now = getKst();

    const empId = (body.employee_id || body.employeeId || '').trim();
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim();
    const company = body.company || '신한DS';
    const team = body.team || '카드개발팀';
    const part = body.part || '카드IS';
    const position = body.position || '연구원';
    const role = body.role || 'PARTNER_WORKER';
    const isPartnerManager = body.is_partner_manager || body.isPartnerManager ? 1 : 0;
    const password = body.password || body.pw || '••••••••';
    const hashedPw = password !== '••••••••' ? await hashPassword(password) : '••••••••';

    await db.prepare(`
      INSERT OR REPLACE INTO users 
      (employee_id, name, email, phone, company, team, part, position, role, is_partner_manager, password_hash, status, is_active, is_admin, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 1, ?, ?, ?)
    `).bind(
      empId, name, email, phone, company, team, part, position, role, isPartnerManager, hashedPw,
      role === 'DS_PRINCIPAL_PM' ? 1 : 0, now, now
    ).run();

    return c.json({ success: true, message: '사용자가 성공적으로 등록되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// ==========================================
// 3. 사용자 및 조직/협력사 관리 (CRUD)
// ==========================================

// 3-1. 사용자 목록 & 단일 조회
app.get('/users', async (c) => {
  try {
    const db = c.env.DB;
    const { results } = await db.prepare("SELECT * FROM users ORDER BY name ASC").all();
    return c.json({ success: true, data: results || [] });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.get('/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    const user = await db.prepare("SELECT * FROM users WHERE UPPER(employee_id) = UPPER(?) OR LOWER(email) = LOWER(?)").bind(id, id).first();
    if (!user) return c.json({ success: false, detail: '사용자를 찾을 수 없습니다.' }, 404);
    return c.json({ success: true, data: user });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// 3-1-1. 사용자 등록 / 프로필 업데이트 (사진 및 개인정보 영구 저장)
app.post('/users', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    const now = getKst();

    const empId = (body.employee_id || body.employeeId || body.id || '').trim();
    if (!empId) {
      return c.json({ success: false, detail: '사번(employeeId)이 필요합니다.' }, 400);
    }

    const name = body.name ? body.name.trim() : null;
    const email = body.email ? body.email.trim() : null;
    const phone = body.phone !== undefined ? body.phone : null;
    const company = body.company || body.partnerCompany || null;
    const team = body.team || body.deptName || null;
    const part = body.part || body.partName || null;
    const position = body.position || null;
    const role = body.role || null;
    const isPartnerManager = body.is_partner_manager !== undefined ? (body.is_partner_manager ? 1 : 0) : (body.isPartnerManager !== undefined ? (body.isPartnerManager ? 1 : 0) : null);
    const deviceType = body.deviceType || body.device_type || null;
    const profilePicture = body.profile_picture || body.avatarUrl || body.profileImage || null;

    // 기존 사용자 조회
    const existing: any = await db.prepare("SELECT * FROM users WHERE UPPER(employee_id) = UPPER(?)").bind(empId).first();

    if (existing) {
      await db.prepare(`
        UPDATE users SET
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          company = COALESCE(?, company),
          team = COALESCE(?, team),
          part = COALESCE(?, part),
          position = COALESCE(?, position),
          role = COALESCE(?, role),
          is_partner_manager = COALESCE(?, is_partner_manager),
          device_type = COALESCE(?, device_type),
          profile_picture = COALESCE(?, profile_picture),
          updated_at = ?
        WHERE UPPER(employee_id) = UPPER(?)
      `).bind(
        name, email, phone, company, team, part, position, role, isPartnerManager, deviceType, profilePicture, now, empId
      ).run();
    } else {
      await db.prepare(`
        INSERT INTO users
        (employee_id, name, email, phone, company, team, part, position, role, is_partner_manager, password_hash, status, is_active, is_admin, device_type, profile_picture, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '••••••••', 'ACTIVE', 1, ?, ?, ?, ?, ?)
      `).bind(
        empId,
        name || empId,
        email || `${empId.toLowerCase()}@shinhands.co.kr`,
        phone || '',
        company || '신한DS',
        team || '카드개발팀',
        part || '카드IS',
        position || '연구원',
        role || 'PARTNER_WORKER',
        isPartnerManager || 0,
        role === 'DS_PRINCIPAL_PM' ? 1 : 0,
        deviceType || 'Android',
        profilePicture,
        now,
        now
      ).run();
    }

    const updatedUser = await db.prepare("SELECT * FROM users WHERE UPPER(employee_id) = UPPER(?)").bind(empId).first();
    return c.json({ success: true, message: '회원 정보 및 프로필 사진이 D1 DB에 저장되었습니다.', data: updatedUser });
  } catch (err: any) {
    console.error('[User-Update-Error]', err);
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.put('/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const db = c.env.DB;
    const now = getKst();

    const profilePicture = body.profile_picture || body.avatarUrl || body.profileImage || null;

    await db.prepare(`
      UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        company = COALESCE(?, company),
        team = COALESCE(?, team),
        part = COALESCE(?, part),
        position = COALESCE(?, position),
        role = COALESCE(?, role),
        profile_picture = COALESCE(?, profile_picture),
        updated_at = ?
      WHERE UPPER(employee_id) = UPPER(?)
    `).bind(
      body.name || null, body.email || null, body.phone || null, body.company || null,
      body.team || null, body.part || null, body.position || null, body.role || null,
      profilePicture, now, id
    ).run();

    const updatedUser = await db.prepare("SELECT * FROM users WHERE UPPER(employee_id) = UPPER(?)").bind(id).first();
    return c.json({ success: true, message: '사용자 정보가 수정되었습니다.', data: updatedUser });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.delete('/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    await db.prepare("DELETE FROM users WHERE UPPER(employee_id) = UPPER(?)").bind(id).run();
    return c.json({ success: true, message: '사용자가 삭제되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// 3-2. 조직 목록 & 등록/삭제
app.get('/organizations', async (c) => {
  try {
    const db = c.env.DB;
    const { results } = await db.prepare("SELECT * FROM organizations ORDER BY team_name ASC, part_name ASC").all();
    return c.json({ success: true, data: results || [] });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.post('/organizations', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    const now = getKst();

    await db.prepare(`
      INSERT OR REPLACE INTO organizations
      (id, company_name, team_name, part_name, hierarchy_path, leader_name, location_name, member_count, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.id || `org-${Date.now()}`,
      body.company_name || '신한DS',
      body.team_name,
      body.part_name,
      body.hierarchy_path || `${body.company_name} > ${body.team_name} > ${body.part_name}`,
      body.leader_name,
      body.location_name || '파인에비뉴(카드)',
      body.member_count || 0,
      body.description || '',
      now
    ).run();

    return c.json({ success: true, message: '조직이 저장되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.delete('/organizations/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    await db.prepare("DELETE FROM organizations WHERE id = ?").bind(id).run();
    return c.json({ success: true, message: '조직이 삭제되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// 3-3. 협력사 목록 & 등록/삭제
app.get('/companies', async (c) => {
  try {
    const db = c.env.DB;
    const { results } = await db.prepare("SELECT * FROM companies ORDER BY company_name ASC").all();
    return c.json({ success: true, data: results || [] });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.post('/companies', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    const now = getKst();

    await db.prepare(`
      INSERT OR REPLACE INTO companies
      (id, company_code, company_name, biz_number, company_type, contact_person, contact_phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.id || `comp-${Date.now()}`,
      body.company_code || body.company_name,
      body.company_name,
      body.biz_number || '',
      body.company_type || 'PARTNER',
      body.contact_person || '',
      body.contact_phone || '',
      now
    ).run();

    return c.json({ success: true, message: '협력사가 저장되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// ==========================================
// 4. 출퇴근 / 도급 투입 / 근태 신청
// ==========================================

app.get('/commute/logs', async (c) => {
  try {
    const empId = c.req.query('employee_id');
    const workDate = c.req.query('work_date');
    const db = c.env.DB;

    let query = "SELECT * FROM commute_logs WHERE 1=1";
    const params: any[] = [];

    if (empId) {
      query += " AND employee_id = ?";
      params.push(empId);
    }
    if (workDate) {
      query += " AND work_date = ?";
      params.push(workDate);
    }
    query += " ORDER BY work_date DESC, created_at DESC LIMIT 100";

    const stmt = db.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    return c.json({ success: true, data: results || [] });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.post('/commute/punch', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    const now = getKst();

    const empId = body.employee_id || body.user_id;
    const workDate = body.work_date || now.slice(0, 10);
    const id = `commute-${empId}-${workDate}`;

    await db.prepare(`
      INSERT OR REPLACE INTO commute_logs
      (id, user_id, employee_id, work_date, clock_in_time, clock_out_time, clock_in_method, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, empId, empId, workDate,
      body.clock_in_time || now.slice(11, 16),
      body.clock_out_time || null,
      body.clock_in_method || 'APP',
      body.status || 'NORMAL',
      now
    ).run();

    return c.json({ success: true, message: '출근/투입 인증이 기록되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.post('/attendance/request', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    const now = getKst();

    const id = `req-${Date.now()}`;
    await db.prepare(`
      INSERT INTO attendance_requests
      (id, user_id, employee_id, user_name, company_name, request_type, target_date, reason, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `).bind(
      id, body.user_id || body.employee_id, body.employee_id, body.user_name || '',
      body.company_name || '', body.request_type || 'VACATION',
      body.target_date || now.slice(0, 10), body.reason || '', now
    ).run();

    return c.json({ success: true, message: '근태/휴가 신청이 접수되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// ==========================================
// 5. 실시간 알림 센터 & 메시지/소통 센터
// ==========================================

// 5-1. 알림 목록 조회 & 읽음 처리
app.get('/notifications', async (c) => {
  try {
    const role = c.req.query('role');
    const part = c.req.query('part');
    const db = c.env.DB;

    let query = "SELECT * FROM app_notifications WHERE 1=1";
    const params: any[] = [];

    if (role) {
      query += " AND (target_role = ? OR target_role = 'ALL')";
      params.push(role);
    }
    if (part) {
      query += " AND (part_name = ? OR part_name IS NULL)";
      params.push(part);
    }
    query += " ORDER BY created_at DESC LIMIT 50";

    const stmt = db.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    return c.json({ success: true, data: results || [] });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.put('/notifications/:id/read', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    await db.prepare("UPDATE app_notifications SET is_read = 1 WHERE id = ?").bind(id).run();
    return c.json({ success: true, message: '알림이 읽음 처리되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.put('/notifications/read-all', async (c) => {
  try {
    const db = c.env.DB;
    await db.prepare("UPDATE app_notifications SET is_read = 1").run();
    return c.json({ success: true, message: '모든 알림이 읽음 처리되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// 5-2. 메시지/소통 목록 조회 & 등록 & 답변
app.get('/messages', async (c) => {
  try {
    const part = c.req.query('part');
    const db = c.env.DB;

    let query = "SELECT * FROM app_messages WHERE 1=1";
    const params: any[] = [];

    if (part) {
      query += " AND part_name = ?";
      params.push(part);
    }
    query += " ORDER BY created_at DESC LIMIT 50";

    const stmt = db.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    return c.json({ success: true, data: results || [] });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.post('/messages', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    const now = getKst();
    const id = `msg-${Date.now()}`;

    await db.prepare(`
      INSERT INTO app_messages
      (id, sender_name, sender_role, part_name, title, content, is_read, reply_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, 'PENDING', ?)
    `).bind(
      id, body.sender_name || body.senderName || '협력사 관리자',
      body.sender_role || body.senderRole || '협력사 현장관리인',
      body.part_name || body.partName || '상담',
      body.title, body.content, now
    ).run();

    return c.json({ success: true, message: '메시지가 등록되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

export const onRequest = handle(app);

