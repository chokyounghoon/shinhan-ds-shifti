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

    const companyName = body.company_name || body.companyName || '신한DS';
    const teamName = body.team_name || body.teamName || '카드개발';
    const partName = body.part_name || body.partName || '';
    const hierarchyPath = body.hierarchy_path || body.hierarchyPath || `${companyName} > ${teamName} > ${partName}`;
    const leaderName = body.leader_name || body.leaderName || '';
    const locationName = body.location_name || body.locationName || '파인에비뉴(카드)';
    const rawMemberCount = body.member_count !== undefined ? body.member_count : (body.memberCount !== undefined ? body.memberCount : 0);
    const memberCount = isNaN(Number(rawMemberCount)) ? 0 : Number(rawMemberCount);
    const description = body.description || '';

    await db.prepare(`
      INSERT OR REPLACE INTO organizations
      (id, company_name, team_name, part_name, hierarchy_path, leader_name, location_name, member_count, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.id || `org-${Date.now()}`,
      companyName,
      teamName,
      partName,
      hierarchyPath,
      leaderName,
      locationName,
      memberCount,
      description,
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

app.delete('/companies/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    await db.prepare("DELETE FROM companies WHERE id = ?").bind(id).run();
    return c.json({ success: true, message: '협력사가 삭제되었습니다.' });
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

// ==========================================
// 4-1. 7중 안티스푸핑(Anti-GPS Spoofing) & VPN/프록시 우회 실시간 탐지/차단 엔진
// ==========================================
app.post('/security/anti-spoof/verify', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    const now = getKst();

    // 1. Cloudflare Edge 헤더 및 클라이언트 IP / ASN 추출
    const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || '127.0.0.1';
    const cf: any = (c.req.raw as any).cf || {};
    const country = c.req.header('cf-ipcountry') || cf.country || 'KR';
    const asOrg = (cf.asOrganization || cf.asn || '').toString().toLowerCase();
    const isTor = cf.isTor === true || cf.isTor === 'true';
    const ipCity = cf.city || 'Seoul';
    const ipLat = cf.latitude ? parseFloat(cf.latitude) : null;
    const ipLng = cf.longitude ? parseFloat(cf.longitude) : null;

    const {
      lat,
      lng,
      accuracy = 15,
      altitude = 38,
      speed = 0,
      isWebdriver = false,
      webrtcIps = [],
      employee_id = 'S01832'
    } = body;

    const threats: string[] = [];
    let score = 100;
    let isVpn = false;
    let isMockGps = false;

    // A. VPN / 프록시 / 호스팅 데이터센터 IP 대역 분석 (클라우드/데이터센터 ASN 탐지)
    const datacenterKeywords = [
      'amazon', 'aws', 'google cloud', 'digitalocean', 'linode', 'vultr', 'ovh',
      'm247', 'packethub', 'datacamp', 'choopa', 'expressvpn', 'nordvpn', 'surfshark',
      'private internet access', 'cyberghost', 'mullvad', 'proton', 'ipvanish',
      'hostinger', 'hetzner', 'alibaba', 'tencent', 'oracle', 'microsoft azure'
    ];

    if (datacenterKeywords.some(keyword => asOrg.includes(keyword))) {
      threats.push(`[VPN/프록시 감지] 호스팅/데이터센터 ASN(${asOrg || 'Cloud'})을 통한 우회 접속이 감지되었습니다.`);
      score -= 80;
      isVpn = true;
    }

    // B. 해외 IP 접속 차단 (대한민국 외 VPN 터널링 탐지)
    if (country && country !== 'KR' && country !== 'T1' && country !== 'XX') {
      threats.push(`[해외 IP 우회 감지] 국내 근무지 위치 인증에 해외 IP(${country}) 접속이 감지되었습니다.`);
      score -= 70;
      isVpn = true;
    }

    // C. Tor 익명 네트워크 차단
    if (isTor) {
      threats.push('[Tor 익명망 감지] Tor 오니언 라우팅을 통한 접근이 감지되어 차단되었습니다.');
      score -= 90;
      isVpn = true;
    }

    // D. GPS 하드웨어 센서 오차율(Accuracy) 무결성 검증 (0m 또는 비현실적 오차 탐지)
    if (accuracy === 0 || accuracy < 0.5) {
      threats.push('[모의 GPS 감지] 가상 위치(Mock Location) 주입으로 인한 인위적 0m 오차율이 감지되었습니다.');
      score -= 80;
      isMockGps = true;
    }

    // E. 브라우저 자동화 도구(Puppeteer, Selenium, Webdriver) 및 DevTools 센서 변작 감지
    if (isWebdriver) {
      threats.push('[자동화 봇 감지] 브라우저 개발자도구(F12) 또는 자동화 프레임워크(Webdriver) 변작이 감지되었습니다.');
      score -= 85;
    }

    // F. WebRTC 로컬/공인 IP 불일치 및 다중 인터페이스 터널링 탐지
    if (Array.isArray(webrtcIps) && webrtcIps.length > 0) {
      const hasVpnAdapter = webrtcIps.some((ip: string) => 
        ip.startsWith('10.8.') || ip.startsWith('10.0.') || ip.startsWith('192.168.100.')
      );
      if (hasVpnAdapter) {
        threats.push('[VPN 가상 어댑터 감지] WebRTC 인터페이스에서 가상 네트워크 터널 어댑터가 발견되었습니다.');
        score -= 40;
        isVpn = true;
      }
    }

    // G. GPS ↔ IP 삼각측량 교차 검증 (위치가 한국 외이거나 500km 이상 괴리 발생 시)
    if (ipLat && ipLng && lat && lng) {
      const R = 6371;
      const dLat = (ipLat - lat) * (Math.PI / 180);
      const dLon = (ipLng - lng) * (Math.PI / 180);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat*(Math.PI/180)) * Math.cos(ipLat*(Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const cDist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distKm = R * cDist;

      if (distKm > 400) {
        threats.push(`[삼각측량 불일치] GPS 위치와 IP 기지국 위치 간 과도한 이격(${Math.round(distKm)}km)이 감지되었습니다.`);
        score -= 50;
      }
    }

    const isSecure = score >= 70 && threats.length === 0;
    const securityToken = `SGUARD-ZT-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`;

    // 위반 시도 발견 시 D1 audit_trails에 실시간 보안 감사 로그 기록
    if (!isSecure) {
      try {
        const auditId = `audit-sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        await db.prepare(`
          INSERT INTO audit_trails 
          (id, action_type, actor_id, actor_name, target_id, target_name, details, ip_address, created_at)
          VALUES (?, 'SECURITY_SPOOF_BLOCKED', ?, ?, ?, 'GPS_PUNCH_SYSTEM', ?, ?, ?)
        `).bind(
          auditId,
          employee_id,
          '보안엔진(S-Guard)',
          employee_id,
          JSON.stringify({ threats, score, isVpn, isMockGps, asOrg, country, clientIp }),
          clientIp,
          now
        ).run();
      } catch (logErr) {
        console.warn('[Audit-Log-Error]', logErr);
      }
    }

    return c.json({
      success: true,
      isSecure,
      securityScore: Math.max(0, score),
      isVpn,
      isMockGps,
      detectedThreats: threats,
      securityToken,
      telemetry: {
        clientIp: clientIp.includes(':') ? clientIp : clientIp.replace(/\.\d+$/, '.***'),
        country,
        isp: asOrg || 'SK Telecom / KT / LG Uplus 사내망 검증',
        ipCity,
        verificationTimestamp: now
      }
    });
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

app.put('/messages/:id/read', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    await db.prepare("UPDATE app_messages SET is_read = 1 WHERE id = ?").bind(id).run();
    return c.json({ success: true, message: '메시지가 읽음 처리되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.put('/messages/:id/reply', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const db = c.env.DB;
    const now = getKst();
    await db.prepare(`
      UPDATE app_messages 
      SET reply_status = 'COMPLETED', reply_content = ?, replied_at = ?, is_read = 1 
      WHERE id = ?
    `).bind(body.replyContent || body.reply_content || '', now, id).run();
    return c.json({ success: true, message: '답변이 등록되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.put('/messages/read-all', async (c) => {
  try {
    const db = c.env.DB;
    await db.prepare("UPDATE app_messages SET is_read = 1").run();
    return c.json({ success: true, message: '모든 메시지가 읽음 처리되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// =========================================================================
// 6. 도급 인력 투입 실적 (Manpower Inputs) D1 API
// =========================================================================
const ensureManpowerTables = async (db: D1Database) => {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS manpower_inputs (
        record_id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL,
        worker_name TEXT NOT NULL,
        part_name TEXT NOT NULL,
        partner_company TEXT NOT NULL,
        work_date TEXT NOT NULL,
        contracted_hours REAL DEFAULT 8.0,
        actual_input_hours REAL DEFAULT 8.0,
        clock_in_time TEXT,
        clock_out_time TEXT,
        task_summary TEXT,
        variance_minutes INTEGER DEFAULT 0,
        is_sla_breach INTEGER DEFAULT 0,
        exception_type TEXT,
        gap_reason TEXT,
        partner_clarification TEXT,
        verification_status TEXT DEFAULT 'AUTO_SETTLED',
        reg_id TEXT DEFAULT 'SYSTEM',
        reg_dt DATETIME DEFAULT CURRENT_TIMESTAMP,
        mod_id TEXT,
        mod_dt DATETIME,
        UNIQUE(employee_id, work_date)
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS audit_trails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        record_id TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        action TEXT NOT NULL,
        system_label TEXT DEFAULT '도급 계약 이행 확인',
        details TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS sla_clarifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        record_id TEXT NOT NULL,
        part_name TEXT NOT NULL,
        partner_company TEXT NOT NULL,
        requester_id TEXT NOT NULL,
        official_title TEXT NOT NULL,
        message_content TEXT NOT NULL,
        status TEXT DEFAULT 'REQUESTED',
        answer_content TEXT,
        answered_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS pre_gap_notices (
        id TEXT PRIMARY KEY,
        partner_company TEXT NOT NULL,
        worker_name TEXT NOT NULL,
        part_name TEXT NOT NULL,
        gap_period TEXT NOT NULL,
        gap_hours REAL DEFAULT 8.0,
        gap_type TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'DISPATCHED',
        acknowledged_by TEXT,
        acknowledged_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS service_delivery_inspections (
        id TEXT PRIMARY KEY,
        project_code TEXT NOT NULL,
        partner_company TEXT NOT NULL,
        inspector_id TEXT NOT NULL,
        inspector_name TEXT NOT NULL,
        inspection_month TEXT NOT NULL,
        contracted_man_days REAL NOT NULL,
        actual_delivered_man_days REAL NOT NULL,
        inspection_status TEXT DEFAULT 'SUBMITTED',
        inspection_notes TEXT,
        inspected_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  } catch (e) {
    console.warn('ensureManpowerTables warning:', e);
  }
};

app.get('/manpower', async (c) => {
  try {
    const db = c.env.DB;
    await ensureManpowerTables(db);

    const part = c.req.query('part');
    const workDate = c.req.query('work_date') || c.req.query('workDate');
    const company = c.req.query('company');

    let query = "SELECT * FROM manpower_inputs WHERE 1=1";
    const params: any[] = [];

    if (part && part !== 'ALL') {
      query += " AND part_name = ?";
      params.push(part);
    }
    if (workDate) {
      query += " AND work_date = ?";
      params.push(workDate);
    }
    if (company && company !== 'ALL') {
      query += " AND partner_company = ?";
      params.push(company);
    }
    query += " ORDER BY reg_dt DESC, record_id DESC";

    const stmt = db.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    // 초기 데이터가 비어있는 경우 기본 Roster 자동 생성
    if (!results || results.length === 0) {
      const todayStr = getKst().substring(0, 10);
      const defaultRecords = [
        {
          record_id: 'rec-init-01',
          employee_id: 'UB0001',
          worker_name: '송무준',
          part_name: '상담',
          partner_company: '유브갓',
          work_date: todayStr,
          contracted_hours: 8.0,
          actual_input_hours: 8.0,
          clock_in_time: '08:50',
          clock_out_time: '18:00',
          task_summary: '상담 시스템 기간계 계정계 승인 코어 모듈 유지보수',
          variance_minutes: 0,
          is_sla_breach: 0,
          verification_status: 'AUTO_SETTLED'
        }
      ];

      for (const rec of defaultRecords) {
        await db.prepare(`
          INSERT OR IGNORE INTO manpower_inputs
          (record_id, employee_id, worker_name, part_name, partner_company, work_date, contracted_hours, actual_input_hours, clock_in_time, clock_out_time, task_summary, variance_minutes, is_sla_breach, verification_status, reg_id, reg_dt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SYSTEM', ?)
        `).bind(
          rec.record_id, rec.employee_id, rec.worker_name, rec.part_name, rec.partner_company, rec.work_date,
          rec.contracted_hours, rec.actual_input_hours, rec.clock_in_time, rec.clock_out_time, rec.task_summary,
          rec.variance_minutes, rec.is_sla_breach, rec.verification_status, getKst()
        ).run();
      }

      const refetched = await db.prepare("SELECT * FROM manpower_inputs ORDER BY reg_dt DESC").all();
      return c.json({ success: true, data: refetched.results || [] });
    }

    return c.json({ success: true, data: results || [] });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.post('/manpower', async (c) => {
  try {
    const db = c.env.DB;
    await ensureManpowerTables(db);
    const body = await c.req.json();
    const now = getKst();
    const recordId = body.recordId || body.record_id || `rec-${Date.now()}`;

    await db.prepare(`
      INSERT OR REPLACE INTO manpower_inputs
      (record_id, employee_id, worker_name, part_name, partner_company, work_date, contracted_hours, actual_input_hours, clock_in_time, clock_out_time, task_summary, variance_minutes, is_sla_breach, exception_type, gap_reason, partner_clarification, verification_status, reg_id, reg_dt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      recordId,
      body.employeeId || body.employee_id,
      body.workerName || body.worker_name,
      body.partName || body.part_name || '상담',
      body.partnerCompany || body.partner_company || '유브갓',
      body.workDate || body.work_date || now.substring(0, 10),
      body.contractedHours || body.contracted_hours || 8.0,
      body.actualInputHours || body.actual_input_hours || 8.0,
      body.clockInTime || body.clock_in_time || '08:50',
      body.clockOutTime || body.clock_out_time || '18:00',
      body.taskSummary || body.task_summary || '',
      body.varianceMinutes || body.variance_minutes || 0,
      body.isSlaBreach ? 1 : (body.is_sla_breach ? 1 : 0),
      body.exceptionType || body.exception_type || null,
      body.gapReason || body.gap_reason || null,
      body.partnerClarification || body.partner_clarification || null,
      body.verificationStatus || body.verification_status || 'AUTO_SETTLED',
      body.regId || body.reg_id || 'SYSTEM',
      now
    ).run();

    // 감사 로그 기록
    await db.prepare(`
      INSERT INTO audit_trails (record_id, actor_id, actor_name, actor_role, action, system_label, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      recordId,
      body.regId || 'SYSTEM',
      body.regName || '도급 인력 투입 관제 엔진',
      body.regRole || '시스템 자동화',
      body.isSlaBreach ? '도급 투입 실적 등록 (예외 발생 - PM 검수 대기)' : '도급비 산정을 위한 투입 실적 확정 (시스템 자동 검수)',
      '도급 계약 이행 확인',
      `${body.workDate || now.substring(0, 10)} ${body.workerName || body.worker_name} (${body.partnerCompany || body.partner_company}) 투입 실적 등록 완료`,
      now
    ).run();

    return c.json({ success: true, recordId, message: '도급 투입 실적이 등록되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// PM 일괄 검수 확정
app.put('/manpower/verify', async (c) => {
  try {
    const db = c.env.DB;
    await ensureManpowerTables(db);
    const body = await c.req.json();
    const recordIds: string[] = body.recordIds || body.record_ids || [];
    const pmName = body.pmName || '조경훈 PM';
    const now = getKst();

    for (const rid of recordIds) {
      await db.prepare(`
        UPDATE manpower_inputs 
        SET verification_status = 'SETTLED_BY_PRINCIPAL', mod_id = ?, mod_dt = ?
        WHERE record_id = ?
      `).bind(pmName, now, rid).run();

      await db.prepare(`
        INSERT INTO audit_trails (record_id, actor_id, actor_name, actor_role, action, system_label, details, created_at)
        VALUES (?, 'PM', ?, '원청 책임PM', '원청 책임PM 수동 정산 확정', '도급 계약 이행 확인', ?, ?)
      `).bind(rid, pmName, `원청 책임PM(${pmName})이 도급 실적을 승인 및 정산 확정하였습니다.`, now).run();
    }

    return c.json({ success: true, count: recordIds.length, message: `${recordIds.length}건 검수 확정 완료` });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// 예외 수용/차감 처리
app.put('/manpower/:id/exception', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const db = c.env.DB;
    await ensureManpowerTables(db);
    const now = getKst();

    const action = body.action; // 'ACCEPT' or 'EXCLUDE'
    const memo = body.memo || '';
    const newStatus = action === 'ACCEPT' ? 'SETTLED_BY_PRINCIPAL' : 'EXCLUDED_FROM_SLA';

    await db.prepare(`
      UPDATE manpower_inputs
      SET verification_status = ?, gap_reason = ?, mod_id = 'PM', mod_dt = ?
      WHERE record_id = ?
    `).bind(newStatus, memo, now, id).run();

    await db.prepare(`
      INSERT INTO audit_trails (record_id, actor_id, actor_name, actor_role, action, system_label, details, created_at)
      VALUES (?, 'PM', '원청 책임PM', '원청 책임PM', ?, '도급 계약 이행 확인', ?, ?)
    `).bind(
      id,
      action === 'ACCEPT' ? '예외 사유 수용 (정산 반영)' : '도급비 산정 제외 확정 (공수 차감)',
      memo,
      now
    ).run();

    return c.json({ success: true, message: '예외 처리가 완료되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// =========================================================================
// 7. 전산 감사 로그 (Audit Trails) D1 API
// =========================================================================
app.get('/audit-trails', async (c) => {
  try {
    const db = c.env.DB;
    await ensureManpowerTables(db);
    const recordId = c.req.query('record_id');

    let query = "SELECT * FROM audit_trails WHERE 1=1";
    const params: any[] = [];
    if (recordId) {
      query += " AND record_id = ?";
      params.push(recordId);
    }
    query += " ORDER BY created_at DESC LIMIT 100";

    const stmt = db.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    return c.json({ success: true, data: results || [] });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// =========================================================================
// 8. SLA 소명 요청/회신 (SLA Clarifications) D1 API
// =========================================================================
app.get('/sla-clarifications', async (c) => {
  try {
    const db = c.env.DB;
    await ensureManpowerTables(db);
    const part = c.req.query('part');

    let query = "SELECT * FROM sla_clarifications WHERE 1=1";
    const params: any[] = [];
    if (part && part !== 'ALL') {
      query += " AND part_name = ?";
      params.push(part);
    }
    query += " ORDER BY created_at DESC";

    const stmt = db.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    return c.json({ success: true, data: results || [] });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.post('/sla-clarifications', async (c) => {
  try {
    const db = c.env.DB;
    await ensureManpowerTables(db);
    const body = await c.req.json();
    const now = getKst();

    await db.prepare(`
      INSERT INTO sla_clarifications
      (record_id, part_name, partner_company, requester_id, official_title, message_content, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'REQUESTED', ?)
    `).bind(
      body.recordId || body.record_id,
      body.partName || body.part_name || '상담',
      body.partnerCompany || body.partner_company || '유브갓',
      body.requesterId || body.requester_id || 'PM',
      body.officialTitle || body.official_title || 'SLA 투입 편차 소명 요청',
      body.messageContent || body.message_content || '',
      now
    ).run();

    return c.json({ success: true, message: '소명 요청이 등록되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.put('/sla-clarifications/:id/answer', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    await ensureManpowerTables(db);
    const body = await c.req.json();
    const now = getKst();

    await db.prepare(`
      UPDATE sla_clarifications
      SET status = 'ANSWERED', answer_content = ?, answered_at = ?
      WHERE id = ?
    `).bind(body.answerContent || body.answer_content || '', now, id).run();

    return c.json({ success: true, message: '소명 답변이 등록되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// =========================================================================
// 9. 사전 공수 결손 통보 (Pre Gap Notices) D1 API
// =========================================================================
app.get('/gap-notices', async (c) => {
  try {
    const db = c.env.DB;
    await ensureManpowerTables(db);
    const part = c.req.query('part');

    let query = "SELECT * FROM pre_gap_notices WHERE 1=1";
    const params: any[] = [];
    if (part && part !== 'ALL') {
      query += " AND part_name = ?";
      params.push(part);
    }
    query += " ORDER BY created_at DESC";

    const stmt = db.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    // 기본 사전 결손 통보 시드 주입 (비어있을 시)
    if (!results || results.length === 0) {
      const todayStr = getKst().substring(0, 10);
      const defaultNotices = [
        {
          id: 'gap-notice-01',
          partner_company: '유브갓',
          worker_name: '송무준',
          part_name: '상담',
          gap_period: `${todayStr} 09:00 ~ 13:00`,
          gap_hours: 4.0,
          gap_type: '오전반차 (협력사 자체 승인)',
          reason: '가족 행사로 인한 사전 휴무 신청건',
          status: 'DISPATCHED'
        }
      ];

      for (const n of defaultNotices) {
        await db.prepare(`
          INSERT OR IGNORE INTO pre_gap_notices
          (id, partner_company, worker_name, part_name, gap_period, gap_hours, gap_type, reason, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(n.id, n.partner_company, n.worker_name, n.part_name, n.gap_period, n.gap_hours, n.gap_type, n.reason, n.status, getKst()).run();
      }

      const refetched = await db.prepare("SELECT * FROM pre_gap_notices ORDER BY created_at DESC").all();
      return c.json({ success: true, data: refetched.results || [] });
    }

    return c.json({ success: true, data: results || [] });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.post('/gap-notices', async (c) => {
  try {
    const db = c.env.DB;
    await ensureManpowerTables(db);
    const body = await c.req.json();
    const now = getKst();
    const id = body.id || `gap-${Date.now()}`;

    await db.prepare(`
      INSERT INTO pre_gap_notices
      (id, partner_company, worker_name, part_name, gap_period, gap_hours, gap_type, reason, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DISPATCHED', ?)
    `).bind(
      id,
      body.partnerCompany || body.partner_company || '유브갓',
      body.workerName || body.worker_name,
      body.partName || body.part_name || '상담',
      body.gapPeriod || body.gap_period,
      body.gapHours || body.gap_hours || 8.0,
      body.gapType || body.gap_type || '휴가',
      body.reason,
      now
    ).run();

    return c.json({ success: true, id, message: '사전 결손 통보가 등록되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.put('/gap-notices/:id/acknowledge', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    await ensureManpowerTables(db);
    const body = await c.req.json();
    const now = getKst();
    const acknowledgedBy = body.acknowledgedBy || body.acknowledged_by || '조경훈 PM';

    await db.prepare(`
      UPDATE pre_gap_notices
      SET status = 'ACKNOWLEDGED', acknowledged_by = ?, acknowledged_at = ?
      WHERE id = ?
    `).bind(acknowledgedBy, now, id).run();

    return c.json({ success: true, message: '사전 결손 통보 확인 처리가 완료되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

// =========================================================================
// 10. 도급 공수 검수 (Service Delivery Inspections) D1 API
// =========================================================================
app.get('/inspections', async (c) => {
  try {
    const db = c.env.DB;
    await ensureManpowerTables(db);
    const { results } = await db.prepare("SELECT * FROM service_delivery_inspections ORDER BY created_at DESC").all();

    if (!results || results.length === 0) {
      const defaultInspections = [
        {
          id: 'insp-2026-08',
          project_code: 'PRJ-SHIFTI-2026-08',
          partner_company: '유브갓',
          inspector_id: 'S01832',
          inspector_name: '조경훈 PM',
          inspection_month: '2026-08',
          contracted_man_days: 120.0,
          actual_delivered_man_days: 118.5,
          inspection_status: 'SUBMITTED',
          inspection_notes: '2026년 8월 도급 용역 이행 공수 검수 제출'
        }
      ];

      for (const item of defaultInspections) {
        await db.prepare(`
          INSERT OR IGNORE INTO service_delivery_inspections
          (id, project_code, partner_company, inspector_id, inspector_name, inspection_month, contracted_man_days, actual_delivered_man_days, inspection_status, inspection_notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(item.id, item.project_code, item.partner_company, item.inspector_id, item.inspector_name, item.inspection_month, item.contracted_man_days, item.actual_delivered_man_days, item.inspection_status, item.inspection_notes, getKst()).run();
      }

      const refetched = await db.prepare("SELECT * FROM service_delivery_inspections ORDER BY created_at DESC").all();
      return c.json({ success: true, data: refetched.results || [] });
    }

    return c.json({ success: true, data: results || [] });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

app.put('/inspections/:id/accept', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    await ensureManpowerTables(db);
    const body = await c.req.json();
    const now = getKst();

    await db.prepare(`
      UPDATE service_delivery_inspections
      SET inspection_status = 'INSPECTED_ACCEPTED', inspection_notes = ?, inspected_at = ?
      WHERE id = ?
    `).bind(body.memo || '신한DS 도급 검수 완료: SLA 공수 정산 및 도급 대금 지급 승인', now, id).run();

    return c.json({ success: true, message: '도급 검수가 승인 완료되었습니다.' });
  } catch (err: any) {
    return c.json({ success: false, detail: err.message }, 500);
  }
});

export const onRequest = handle(app);


