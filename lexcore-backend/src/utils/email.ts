import nodemailer from 'nodemailer';

// ─── Transporter ──────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 465,
  secure: (Number(process.env.SMTP_PORT) || 465) === 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // needed for some shared hosting providers
  },
});

// ─── HTML Template ────────────────────────────────────────────────────────────
const buildEmail = (body: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Asalaw LP</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border:1px solid #334155;border-radius:16px;overflow:hidden;max-width:560px;">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px;text-align:center;border-bottom:1px solid #334155;">
              <div style="display:inline-block;background:#f59e0b;border-radius:12px;padding:12px 16px;margin-bottom:16px;">
                <span style="font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">⚖ Asalaw LP</span>
              </div>
              <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Practice Management System</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">${body}</td>
          </tr>
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #334155;text-align:center;">
              <p style="margin:0;color:#475569;font-size:11px;">This is an automated message from Asalaw LP Practice Management.</p>
              <p style="margin:4px 0 0;color:#475569;font-size:11px;">Please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Activation email (sent after admin approves a signup request) ────────────
export const sendActivationEmail = async ({
  to, name, code, expiresAt,
}: {
  to: string; name: string; code: string; expiresAt: Date;
}) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const activateUrl = `${frontendUrl}/activate?email=${encodeURIComponent(to)}&code=${code}`;
  const expiryStr = expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const body = `
    <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;font-weight:700;">You've been granted access</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">
      Hi <strong style="color:#e2e8f0;">${name}</strong>, an administrator has approved your access to
      the Asalaw LP Practice Management System. Use the activation code below to set your password and log in.
    </p>
    <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your Activation Code</p>
      <div style="font-family:'Courier New',monospace;font-size:36px;font-weight:900;letter-spacing:10px;color:#f59e0b;">${code}</div>
      <p style="margin:8px 0 0;color:#475569;font-size:12px;">Expires ${expiryStr}</p>
    </div>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${activateUrl}" style="display:inline-block;background:#f59e0b;color:#0f172a;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;">
        Activate My Account →
      </a>
    </div>
    <div style="background:#0f172a;border-left:3px solid #f59e0b;border-radius:4px;padding:14px 16px;">
      <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
        <strong style="color:#94a3b8;">Can't click the button?</strong><br/>
        Go to <a href="${frontendUrl}/activate" style="color:#f59e0b;">${frontendUrl}/activate</a>
        and enter your email plus the code above manually.
      </p>
    </div>`;

  await transporter.sendMail({
    from:    process.env.SMTP_FROM || `"Asalaw LP" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your Asalaw LP Account — Activate Now',
    html:    buildEmail(body),
  });
};

// ─── Direct invite email (admin creates user without a signup request) ────────
export const sendDirectInviteEmail = async ({
  to, name, code, expiresAt, role,
}: {
  to: string; name: string; code: string; expiresAt: Date; role: string;
}) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const activateUrl = `${frontendUrl}/activate?email=${encodeURIComponent(to)}&code=${code}`;
  const expiryStr = expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const roleLabel = role === 'admin' ? 'Administrator' : 'Staff Member';

  const body = `
    <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;font-weight:700;">Welcome to Asalaw LP</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">
      Hi <strong style="color:#e2e8f0;">${name}</strong>, you have been added to the Asalaw LP Practice
      Management System as a <strong style="color:#f59e0b;">${roleLabel}</strong>.
      Use the code below to set your password.
    </p>
    <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your Activation Code</p>
      <div style="font-family:'Courier New',monospace;font-size:36px;font-weight:900;letter-spacing:10px;color:#f59e0b;">${code}</div>
      <p style="margin:8px 0 0;color:#475569;font-size:12px;">Expires ${expiryStr}</p>
    </div>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${activateUrl}" style="display:inline-block;background:#f59e0b;color:#0f172a;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;">
        Set My Password →
      </a>
    </div>
    <div style="background:#0f172a;border-left:3px solid #334155;border-radius:4px;padding:14px 16px;">
      <ol style="margin:0;padding-left:16px;color:#64748b;font-size:12px;line-height:1.8;">
        <li>Click the button above</li>
        <li>Enter your email and the code above</li>
        <li>Choose a password — minimum 6 characters</li>
        <li>Log in at <a href="${frontendUrl}/login" style="color:#f59e0b;">${frontendUrl}/login</a></li>
      </ol>
    </div>`;

  await transporter.sendMail({
    from:    process.env.SMTP_FROM || `"Asalaw LP" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Welcome to Asalaw LP — Set Your Password',
    html:    buildEmail(body),
  });
};

// ─── Admin notification — fired when someone submits a signup request ─────────
export const sendAdminRequestNotification = async ({
  adminEmails,
  requesterName,
  requesterEmail,
  requesterPhone,
  requesterPosition,
}: {
  adminEmails: string[];
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string | null;
  requesterPosition?: string | null;
}) => {
  if (!adminEmails.length) return;

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const usersUrl = `${frontendUrl}/users`;

  const body = `
    <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;font-weight:700;">New Access Request</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">
      Someone has requested access to the Asalaw LP system and is waiting for your approval.
    </p>
    <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:7px 0;color:#64748b;font-size:13px;width:110px;">Name</td>
          <td style="padding:7px 0;color:#e2e8f0;font-size:13px;font-weight:600;">${requesterName}</td>
        </tr>
        <tr>
          <td style="padding:7px 0;color:#64748b;font-size:13px;">Email</td>
          <td style="padding:7px 0;color:#f59e0b;font-size:13px;">${requesterEmail}</td>
        </tr>
        ${requesterPhone ? `
        <tr>
          <td style="padding:7px 0;color:#64748b;font-size:13px;">Phone</td>
          <td style="padding:7px 0;color:#e2e8f0;font-size:13px;">${requesterPhone}</td>
        </tr>` : ''}
        ${requesterPosition ? `
        <tr>
          <td style="padding:7px 0;color:#64748b;font-size:13px;">Position</td>
          <td style="padding:7px 0;color:#e2e8f0;font-size:13px;">${requesterPosition}</td>
        </tr>` : ''}
      </table>
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${usersUrl}" style="display:inline-block;background:#f59e0b;color:#0f172a;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;">
        Review Request →
      </a>
    </div>
    <div style="background:#0f172a;border-left:3px solid #334155;border-radius:4px;padding:14px 16px;">
      <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
        Log in and go to <strong style="color:#94a3b8;">User Management → Requests tab</strong> to approve or reject.
      </p>
    </div>`;

  await transporter.sendMail({
    from:    process.env.SMTP_FROM || `"Asalaw LP" <${process.env.SMTP_USER}>`,
    to:      adminEmails.join(', '),
    subject: `⚠️ New Access Request — ${requesterName}`,
    html:    buildEmail(body),
  });
};