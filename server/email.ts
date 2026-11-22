import nodemailer, { Transporter } from 'nodemailer';
import { getSetting } from './db.js';

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  adminEmail: string;
}

export async function getEmailConfig(): Promise<EmailConfig> {
  const dbNotificationEmail = await getSetting('notification_email', '');
  const dbSmtpHost = await getSetting('smtp_host', '');
  const dbSmtpUser = await getSetting('smtp_user', '');
  const dbSmtpPass = await getSetting('smtp_pass', '');
  const dbSmtpPort = await getSetting('smtp_port', '');

  let rawHost = (dbSmtpHost || process.env.SMTP_HOST || 'smtp.gmail.com').trim().toLowerCase();
  // Auto-correct common typos like "smpt.gmail.com"
  if (rawHost.startsWith('smpt.')) {
    rawHost = rawHost.replace('smpt.', 'smtp.');
  }

  const port = Number(dbSmtpPort || process.env.SMTP_PORT) || 587;
  const user = (dbSmtpUser || process.env.SMTP_USER || 'urohjohanna25@gmail.com').trim();
  // Remove whitespace in app password
  const pass = (dbSmtpPass || process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const adminEmail = (dbNotificationEmail || process.env.ADMIN_EMAIL || 'urohjohanna25@gmail.com').trim();
  const from = (process.env.SMTP_FROM || `"Johanna Uroh" <${user}>`).trim();

  return {
    host: rawHost,
    port,
    user,
    pass,
    from,
    adminEmail,
  };
}

export async function getTransporter(): Promise<{ transporter: Transporter | null; config: EmailConfig }> {
  const config = await getEmailConfig();

  if (!config.user || !config.pass) {
    console.warn('[Email Service] Incomplete credentials (missing SMTP_USER or SMTP_PASS).');
    return { transporter: null, config };
  }

  let transporter: Transporter;

  // Optimize for Gmail if host is gmail or user ends with @gmail.com
  if (config.host.includes('gmail') || config.user.endsWith('@gmail.com')) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return { transporter, config };
}

// ============================================================================
// 1. CONTACT FORM EMAILS (Confirmation to Sender + Notification to Admin)
// ============================================================================

export interface ContactEmailParams {
  name: string;
  email: string;
  service?: string;
  message: string;
}

export async function sendContactEmails(params: ContactEmailParams): Promise<{
  senderDelivered: boolean;
  adminDelivered: boolean;
  errors: string[];
}> {
  const { name, email, service, message } = params;
  const errors: string[] = [];
  let senderDelivered = false;
  let adminDelivered = false;

  const { transporter, config } = await getTransporter();

  if (!transporter) {
    errors.push('Email transporter could not be initialized: missing user or password.');
    return { senderDelivered, adminDelivered, errors };
  }

  const topicDisplay = service ? service : 'General Inquiry / Digital Solutions';
  const formattedDate = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  // A. Humane, complimentary, professional confirmation email to SENDER
  const senderSubject = `Thank you for reaching out, ${name} | Johanna Uroh`;
  const senderHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Thank you for reaching out</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #18181b; background-color: #f4f4f5; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #6d28d9, #4f46e5); color: #ffffff; padding: 32px 32px 28px; }
    .header h1 { margin: 0 0 8px 0; font-size: 22px; font-weight: 700; }
    .header p { margin: 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 32px; font-size: 15px; color: #27272a; }
    .content p { margin: 0 0 16px; }
    .greeting { font-size: 17px; font-weight: 600; color: #18181b; margin-bottom: 16px; }
    .card { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }
    .card h3 { margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #7c3aed; }
    .card-item { margin-bottom: 10px; font-size: 14px; }
    .card-item strong { color: #581c87; }
    .message-quote { background: #ffffff; border-left: 3px solid #7c3aed; padding: 12px 16px; border-radius: 4px; font-style: italic; color: #374151; margin-top: 8px; }
    .footer { padding: 24px 32px; background: #fafafa; border-top: 1px solid #f4f4f5; font-size: 13px; color: #71717a; text-align: left; }
    .signoff { margin-top: 24px; }
    .signoff-name { font-weight: 700; color: #18181b; }
    .signoff-title { font-size: 13px; color: #6b21a8; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Johanna Uroh</h1>
      <p>AI Digital Specialist &amp; Executive Operations</p>
    </div>
    <div class="content">
      <div class="greeting">Dear ${name},</div>
      <p>
        Thank you for taking the time to reach out. Connecting with proactive people and teams seeking to build practical digital systems and elevated workflows is always a privilege, and I truly appreciate your inquiry.
      </p>
      <p>
        This email confirms that your message has been delivered directly to my personal inbox. Here is a summary of what you submitted for your records:
      </p>

      <div class="card">
        <h3>Submission Overview</h3>
        <div class="card-item"><strong>Topic / Service:</strong> ${topicDisplay}</div>
        <div class="card-item"><strong>Received Date:</strong> ${formattedDate}</div>
        <div class="card-item">
          <strong>Your Message:</strong>
          <div class="message-quote">"${message.replace(/\n/g, '<br>')}"</div>
        </div>
      </div>

      <p>
        I take care to read and consider every note thoughtfully. You can expect a direct response from me within <strong>24 business hours</strong> so we can discuss the most effective way to collaborate on your goals.
      </p>
      <p>
        If you have any project briefs, attachments, or extra details to share in the meantime, please feel free to <strong>reply directly to this email</strong>.
      </p>

      <div class="signoff">
        <p style="margin-bottom: 4px;">With warm appreciation,</p>
        <div class="signoff-name">Johanna Uroh</div>
        <div class="signoff-title">AI Digital Specialist &amp; Executive Virtual Assistant</div>
        <div style="font-size: 12px; color: #71717a; margin-top: 4px;">urohjohanna25@gmail.com</div>
      </div>
    </div>
    <div class="footer">
      This is an automated confirmation sent to ${email} regarding your inquiry submitted via Johanna Uroh's portfolio.
    </div>
  </div>
</body>
</html>
  `;

  const senderText = `Dear ${name},

Thank you for taking the time to reach out! Connecting with proactive people and teams seeking to build practical digital systems and elevated workflows is always a privilege, and I truly appreciate your inquiry.

Your message regarding "${topicDisplay}" has safely arrived in my personal inbox.

Here is a copy of what you shared:
"${message}"

I review all inquiries thoughtfully and will be in touch within 24 business hours to discuss how we can best collaborate. In the meantime, if there are any additional materials, briefs, or ideas you'd like to share, feel free to reply directly to this email.

With warm appreciation,

Johanna Uroh
AI Digital Specialist & Executive Virtual Assistant
urohjohanna25@gmail.com
  `;

  // B. Notification email to ADMIN (Johanna)
  const adminSubject = `🔔 New Portfolio Message from ${name} (${topicDisplay})`;
  const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Message Alert</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #18181b; background-color: #f4f4f5; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7; }
    .header { background: #18181b; color: #ffffff; padding: 24px 32px; }
    .header h2 { margin: 0; font-size: 18px; }
    .content { padding: 32px; font-size: 15px; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px; }
    .meta-row { margin-bottom: 8px; font-size: 14px; }
    .meta-row strong { color: #475569; display: inline-block; width: 90px; }
    .message-box { background: #faf5ff; border-left: 4px solid #7c3aed; padding: 16px 20px; border-radius: 6px; font-size: 15px; color: #1e1b4b; line-height: 1.6; }
    .action-btn { display: inline-block; background: #7c3aed; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📬 New Message via Portfolio Contact Form</h2>
    </div>
    <div class="content">
      <div class="meta-box">
        <div class="meta-row"><strong>Sender:</strong> ${name}</div>
        <div class="meta-row"><strong>Email:</strong> <a href="mailto:${email}" style="color: #7c3aed;">${email}</a></div>
        <div class="meta-row"><strong>Topic:</strong> ${topicDisplay}</div>
        <div class="meta-row"><strong>Date:</strong> ${formattedDate}</div>
      </div>

      <div style="font-weight: 600; margin-bottom: 8px; color: #0f172a;">Message Content:</div>
      <div class="message-box">
        ${message.replace(/\n/g, '<br>')}
      </div>

      <a href="mailto:${email}?subject=Re:%20${encodeURIComponent(topicDisplay)}%20-%20Johanna%20Uroh" class="action-btn">
        Reply directly to ${name}
      </a>
    </div>
  </div>
</body>
</html>
  `;

  const adminText = `New Message via Portfolio Contact Form

Sender: ${name}
Email: ${email}
Topic: ${topicDisplay}
Date: ${formattedDate}

Message:
${message}

Reply directly to: ${email}
  `;

  // Dispatch Sender Email
  try {
    await transporter.sendMail({
      from: config.from,
      to: email,
      subject: senderSubject,
      text: senderText,
      html: senderHtml,
      replyTo: config.adminEmail,
    });
    senderDelivered = true;
    console.log(`[Email Service] Humane confirmation sent to sender: ${email}`);
  } catch (err: any) {
    console.error(`[Email Service] Error sending confirmation to sender (${email}):`, err);
    errors.push(`Sender delivery failed: ${err.message || err}`);
  }

  // Dispatch Admin Notification Email
  try {
    await transporter.sendMail({
      from: config.from,
      to: config.adminEmail,
      subject: adminSubject,
      text: adminText,
      html: adminHtml,
      replyTo: `"${name}" <${email}>`,
    });
    adminDelivered = true;
    console.log(`[Email Service] Notification sent to admin: ${config.adminEmail}`);
  } catch (err: any) {
    console.error(`[Email Service] Error sending notification to admin (${config.adminEmail}):`, err);
    errors.push(`Admin delivery failed: ${err.message || err}`);
  }

  return { senderDelivered, adminDelivered, errors };
}

// ============================================================================
// 2. MENTORSHIP APPLICATION EMAILS (Humane Confirmation to Applicant + Notification to Admin)
// ============================================================================

export interface MentorshipEmailParams {
  fullName: string;
  email: string;
  whatsapp: string;
  currentSkillLevel: string;
  skillToLearn: string;
  whyMentorship: string;
  goals: string;
  programmeName: string;
  availability: string;
  portfolioLink?: string;
}

export async function sendMentorshipEmails(params: MentorshipEmailParams): Promise<{
  applicantDelivered: boolean;
  adminDelivered: boolean;
  errors: string[];
}> {
  const {
    fullName,
    email,
    whatsapp,
    currentSkillLevel,
    skillToLearn,
    whyMentorship,
    goals,
    programmeName,
    availability,
    portfolioLink,
  } = params;

  const errors: string[] = [];
  let applicantDelivered = false;
  let adminDelivered = false;

  const { transporter, config } = await getTransporter();

  if (!transporter) {
    errors.push('Email transporter could not be initialized: missing user or password.');
    return { applicantDelivered, adminDelivered, errors };
  }

  const formattedDate = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  // A. Humane, complimentary, encouraging confirmation to APPLICANT
  const applicantSubject = `Your Mentorship Application Received: ${programmeName} | Johanna Uroh`;
  const applicantHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Mentorship Application Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #18181b; background-color: #f4f4f5; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #7c3aed, #4338ca); color: #ffffff; padding: 32px 32px 28px; }
    .header h1 { margin: 0 0 6px 0; font-size: 22px; font-weight: 700; }
    .header p { margin: 0; font-size: 14px; opacity: 0.9; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
    .content { padding: 32px; font-size: 15px; color: #27272a; }
    .greeting { font-size: 17px; font-weight: 600; color: #18181b; margin-bottom: 16px; }
    .quote-box { background: #faf5ff; border: 1px solid #f3e8ff; border-left: 4px solid #7c3aed; border-radius: 10px; padding: 16px 20px; margin: 20px 0; }
    .quote-box h4 { margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b21a8; }
    .detail-grid { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
    .detail-grid td { padding: 6px 0; vertical-align: top; }
    .detail-grid td.label { color: #6b7280; width: 140px; font-weight: 500; }
    .detail-grid td.value { color: #1f2937; font-weight: 600; }
    .highlight-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin: 24px 0; color: #166534; font-size: 14px; }
    .highlight-card strong { color: #14532d; }
    .signoff { margin-top: 28px; }
    .signoff-name { font-weight: 700; color: #18181b; font-size: 16px; }
    .signoff-title { font-size: 13px; color: #6b21a8; font-weight: 500; }
    .footer { padding: 24px 32px; background: #fafafa; border-top: 1px solid #f4f4f5; font-size: 13px; color: #71717a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Johanna Uroh</h1>
      <p>Executive Mentorship &amp; Digital Acceleration</p>
      <div class="badge">Application Confirmed</div>
    </div>
    <div class="content">
      <div class="greeting">Dear ${fullName},</div>
      <p>
        Thank you for submitting your application for the <strong>${programmeName}</strong> mentorship programme. Taking this decisive step to invest in your craft, sharpen your technical edge, and master practical digital workflows speaks volumes about your ambition and dedication.
      </p>
      <p>
        I have received your application and reviewed your focus on <strong>${skillToLearn}</strong> and your stated aspiration:
      </p>

      <div style="background: #f8fafc; border-left: 3px solid #6366f1; padding: 12px 18px; border-radius: 6px; font-style: italic; color: #334155; margin: 16px 0;">
        "${goals.replace(/\n/g, '<br>')}"
      </div>

      <p>
        Bringing focused intentionality to your growth is exactly the mindset that thrives in this mentorship. Here is a summary of your application details:
      </p>

      <div class="quote-box">
        <h4>Application Snapshot</h4>
        <table class="detail-grid">
          <tr>
            <td class="label">Programme:</td>
            <td class="value">${programmeName}</td>
          </tr>
          <tr>
            <td class="label">Experience Level:</td>
            <td class="value">${currentSkillLevel}</td>
          </tr>
          <tr>
            <td class="label">Focus Skill:</td>
            <td class="value">${skillToLearn}</td>
          </tr>
          <tr>
            <td class="label">Availability:</td>
            <td class="value">${availability}</td>
          </tr>
          <tr>
            <td class="label">WhatsApp / Phone:</td>
            <td class="value">${whatsapp}</td>
          </tr>
          ${portfolioLink ? `<tr><td class="label">Portfolio / Link:</td><td class="value"><a href="${portfolioLink}" style="color: #7c3aed;">${portfolioLink}</a></td></tr>` : ''}
        </table>
      </div>

      <div class="highlight-card">
        <strong>What happens next?</strong><br>
        I personally review every application to ensure our mentorship cohort is deeply tailored and actionable. You will hear directly from me within <strong>24 to 48 hours</strong> via email and WhatsApp with next steps regarding cohort scheduling, onboarding materials, and introductory prep.
      </div>

      <p>
        If you have any questions or want to update any details in the meantime, please feel free to <strong>reply directly to this email</strong>.
      </p>

      <div class="signoff">
        <p style="margin-bottom: 4px;">Cheering on your growth and looking forward to working together,</p>
        <div class="signoff-name">Johanna Uroh</div>
        <div class="signoff-title">Mentor &amp; AI Digital Specialist</div>
        <div style="font-size: 12px; color: #71717a; margin-top: 4px;">urohjohanna25@gmail.com</div>
      </div>
    </div>
    <div class="footer">
      This application confirmation was sent to ${email} for the ${programmeName} Mentorship Programme with Johanna Uroh.
    </div>
  </div>
</body>
</html>
  `;

  const applicantText = `Dear ${fullName},

Thank you for submitting your application for the ${programmeName} mentorship programme! Taking this decisive step to invest in your craft, sharpen your technical edge, and master practical digital workflows speaks volumes about your ambition and dedication.

I have received your application and reviewed your focus on ${skillToLearn} and your goal:
"${goals}"

Here is a summary of your application details:
- Programme: ${programmeName}
- Current Level: ${currentSkillLevel}
- Focus Skill: ${skillToLearn}
- Availability: ${availability}
- WhatsApp / Phone: ${whatsapp}
${portfolioLink ? `- Portfolio Link: ${portfolioLink}` : ''}

Next Steps:
I personally review every application to ensure each mentee receives tailored guidance, practical frameworks, and high-impact feedback. You will hear directly from me within 24 to 48 hours with next steps regarding cohort scheduling, onboarding materials, and introductory prep.

If you have any questions in the meantime, please feel free to reply directly to this email.

Cheering on your growth and looking forward to working together,

Johanna Uroh
Mentor & AI Digital Specialist
urohjohanna25@gmail.com
  `;

  // B. Notification email to ADMIN (Johanna)
  const adminSubject = `🎓 New Mentorship Application: ${fullName} (${programmeName})`;
  const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Mentorship Application Alert</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #18181b; background-color: #f4f4f5; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7; }
    .header { background: #4338ca; color: #ffffff; padding: 24px 32px; }
    .header h2 { margin: 0; font-size: 20px; }
    .content { padding: 32px; font-size: 15px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .info-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .info-table td.lbl { color: #64748b; font-weight: 600; width: 150px; background: #f8fafc; }
    .info-table td.val { color: #0f172a; font-weight: 500; }
    .section-title { font-weight: 700; color: #1e1b4b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin: 18px 0 8px; }
    .box { background: #faf5ff; border-left: 4px solid #7c3aed; padding: 14px 18px; border-radius: 6px; font-size: 14px; color: #1e1b4b; margin-bottom: 16px; }
    .action-btn { display: inline-block; background: #4338ca; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px; margin-right: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🎓 New Mentorship Application Received</h2>
    </div>
    <div class="content">
      <table class="info-table">
        <tr>
          <td class="lbl">Applicant Name:</td>
          <td class="val"><strong>${fullName}</strong></td>
        </tr>
        <tr>
          <td class="lbl">Email:</td>
          <td class="val"><a href="mailto:${email}" style="color: #4338ca;">${email}</a></td>
        </tr>
        <tr>
          <td class="lbl">WhatsApp:</td>
          <td class="val"><a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" style="color: #059669;" target="_blank">${whatsapp}</a></td>
        </tr>
        <tr>
          <td class="lbl">Programme:</td>
          <td class="val"><strong>${programmeName}</strong></td>
        </tr>
        <tr>
          <td class="lbl">Current Level:</td>
          <td class="val">${currentSkillLevel}</td>
        </tr>
        <tr>
          <td class="lbl">Skill to Learn:</td>
          <td class="val">${skillToLearn}</td>
        </tr>
        <tr>
          <td class="lbl">Availability:</td>
          <td class="val">${availability}</td>
        </tr>
        ${portfolioLink ? `<tr><td class="lbl">Portfolio / Link:</td><td class="val"><a href="${portfolioLink}" target="_blank" style="color: #4338ca;">${portfolioLink}</a></td></tr>` : ''}
        <tr>
          <td class="lbl">Applied Date:</td>
          <td class="val">${formattedDate}</td>
        </tr>
      </table>

      <div class="section-title">Why They Want Mentorship:</div>
      <div class="box">${whyMentorship.replace(/\n/g, '<br>')}</div>

      <div class="section-title">Their Goals &amp; Expectations:</div>
      <div class="box">${goals.replace(/\n/g, '<br>')}</div>

      <a href="mailto:${email}?subject=Mentorship%20Application%20Next%20Steps%20-%20${encodeURIComponent(programmeName)}" class="action-btn">
        Reply to ${fullName}
      </a>
      <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(fullName)},%20this%20is%20Johanna%20Uroh%20regarding%20your%20application%20for%20the%20${encodeURIComponent(programmeName)}%20mentorship!" class="action-btn" style="background: #059669;">
        Chat on WhatsApp
      </a>
    </div>
  </div>
</body>
</html>
  `;

  const adminText = `New Mentorship Application Received

Applicant: ${fullName}
Email: ${email}
WhatsApp: ${whatsapp}
Programme: ${programmeName}
Current Level: ${currentSkillLevel}
Skill to Learn: ${skillToLearn}
Availability: ${availability}
${portfolioLink ? `Portfolio: ${portfolioLink}\n` : ''}
Date: ${formattedDate}

Why Mentorship:
${whyMentorship}

Goals:
${goals}

Reply to: ${email}
WhatsApp: https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}
  `;

  // Dispatch Applicant Email
  try {
    await transporter.sendMail({
      from: config.from,
      to: email,
      subject: applicantSubject,
      text: applicantText,
      html: applicantHtml,
      replyTo: config.adminEmail,
    });
    applicantDelivered = true;
    console.log(`[Email Service] Humane mentorship confirmation sent to applicant: ${email}`);
  } catch (err: any) {
    console.error(`[Email Service] Error sending mentorship confirmation to applicant (${email}):`, err);
    errors.push(`Applicant delivery failed: ${err.message || err}`);
  }

  // Dispatch Admin Notification Email
  try {
    await transporter.sendMail({
      from: config.from,
      to: config.adminEmail,
      subject: adminSubject,
      text: adminText,
      html: adminHtml,
      replyTo: `"${fullName}" <${email}>`,
    });
    adminDelivered = true;
    console.log(`[Email Service] Mentorship notification sent to admin: ${config.adminEmail}`);
  } catch (err: any) {
    console.error(`[Email Service] Error sending mentorship notification to admin (${config.adminEmail}):`, err);
    errors.push(`Admin delivery failed: ${err.message || err}`);
  }

  return { applicantDelivered, adminDelivered, errors };
}

// ============================================================================
// 3. ADMIN TEST EMAIL
// ============================================================================

export async function sendTestEmail(): Promise<{ success: boolean; message: string }> {
  const { transporter, config } = await getTransporter();

  if (!transporter) {
    return {
      success: false,
      message: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in environment variables or settings.',
    };
  }

  const subject = `✅ Email System Test: Johanna Uroh Portfolio`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 24px; color: #18181b; background: #f4f4f5; }
    .box { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 28px; border: 1px solid #e4e4e7; }
  </style>
</head>
<body>
  <div class="box">
    <h2 style="color: #7c3aed; margin-top: 0;">Email System Operational!</h2>
    <p>This is a test notification confirming that your SMTP email service is actively working and connected.</p>
    <p>Automatic email delivery is active for:</p>
    <ul>
      <li><strong>Send a Message Form</strong>: Humane complimentary reply to sender + admin alert to you.</li>
      <li><strong>Apply for Mentorship Form</strong>: Personalized complimentary confirmation to applicant + admin alert to you.</li>
    </ul>
    <p style="font-size: 13px; color: #71717a;">Sent at ${new Date().toISOString()}</p>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: config.from,
    to: config.adminEmail,
    subject,
    text: `Email System Operational! Test notification sent to ${config.adminEmail}`,
    html,
  });

  return {
    success: true,
    message: `Test email successfully dispatched to ${config.adminEmail}`,
  };
}
