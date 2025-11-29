/**
 * Email Notifications Service using Resend
 * Transactional emails for research updates, errors, and digests
 */

import { Resend } from 'resend';

export interface EmailConfig {
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;
  private enabled: boolean;

  constructor(config: EmailConfig = {}) {
    const apiKey = config.apiKey || process.env.RESEND_API_KEY;
    this.fromEmail = config.fromEmail || process.env.FROM_EMAIL || 'noreply@researchhive.ai';
    this.fromName = config.fromName || 'ResearchHive';
    this.enabled = !!apiKey;

    if (!this.enabled) {
      console.warn('⚠️  Resend API key not found. Email notifications disabled.');
      this.resend = null as any;
    } else {
      this.resend = new Resend(apiKey);
      console.log('✅ Email service initialized');
    }
  }

  /**
   * Send email
   */
  async sendEmail(params: SendEmailParams): Promise<{ id: string } | null> {
    if (!this.enabled) {
      console.log('📧 Email disabled (would send):', params.subject);
      return null;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: params.replyTo,
        cc: params.cc,
        bcc: params.bcc,
      });

      if (error) {
        console.error('Email send error:', error);
        throw new Error(error.message);
      }

      console.log(`✅ Email sent: ${params.subject} (ID: ${data?.id})`);
      return data as { id: string };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Send research completion email
   */
  async sendResearchComplete(params: {
    to: string;
    researchId: string;
    topic: string;
    keyFindings: string[];
    sourcesCount: number;
    dashboardUrl: string;
  }): Promise<void> {
    const findingsList = params.keyFindings
      .slice(0, 5)
      .map((finding) => `<li>${finding}</li>`)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .stats { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .stat { display: inline-block; margin-right: 30px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
            .stat-label { font-size: 12px; color: #6b7280; }
            ul { padding-left: 20px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Research Complete!</h1>
            </div>
            <div class="content">
              <h2>Your research on "${params.topic}" is ready</h2>
              <p>Our AI agents have finished analyzing multiple sources and compiled comprehensive findings for you.</p>

              <div class="stats">
                <div class="stat">
                  <div class="stat-value">${params.sourcesCount}</div>
                  <div class="stat-label">Sources Analyzed</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${params.keyFindings.length}</div>
                  <div class="stat-label">Key Findings</div>
                </div>
              </div>

              <h3>Top Findings:</h3>
              <ul>${findingsList}</ul>

              <a href="${params.dashboardUrl}/research/${params.researchId}" class="button">
                View Full Results →
              </a>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                You can export your findings in multiple formats including APA, MLA, Chicago citations.
              </p>
            </div>
            <div class="footer">
              <p>ResearchHive - AI-Powered Research Platform</p>
              <p>
                <a href="${params.dashboardUrl}/settings" style="color: #3b82f6;">Notification Settings</a> |
                <a href="${params.dashboardUrl}/help" style="color: #3b82f6;">Help Center</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Research Complete: ${params.topic}

Your research has been completed with ${params.sourcesCount} sources analyzed.

Top Findings:
${params.keyFindings.slice(0, 5).map((f, i) => `${i + 1}. ${f}`).join('\n')}

View full results: ${params.dashboardUrl}/research/${params.researchId}

---
ResearchHive - AI-Powered Research Platform
    `.trim();

    await this.sendEmail({
      to: params.to,
      subject: `✅ Research Complete: ${params.topic}`,
      html,
      text,
    });
  }

  /**
   * Send research failed email
   */
  async sendResearchFailed(params: {
    to: string;
    researchId: string;
    topic: string;
    error: string;
    supportUrl: string;
  }): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .error-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Research Failed</h1>
            </div>
            <div class="content">
              <h2>Unable to complete research: "${params.topic}"</h2>
              <p>We encountered an error while processing your research request.</p>

              <div class="error-box">
                <strong>Error Details:</strong><br>
                ${params.error}
              </div>

              <h3>Next Steps:</h3>
              <ul>
                <li>Try creating a new research with a different topic or search terms</li>
                <li>Check if the topic is too broad or too specific</li>
                <li>Contact support if the issue persists</li>
              </ul>

              <a href="${params.supportUrl}" class="button">
                Contact Support →
              </a>
            </div>
            <div class="footer">
              <p>ResearchHive - AI-Powered Research Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: params.to,
      subject: `⚠️ Research Failed: ${params.topic}`,
      html,
    });
  }

  /**
   * Send weekly research digest
   */
  async sendWeeklyDigest(params: {
    to: string;
    userName: string;
    completedResearch: number;
    totalSources: number;
    topTopics: string[];
    dashboardUrl: string;
  }): Promise<void> {
    const topicsList = params.topTopics
      .map((topic) => `<li>${topic}</li>`)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-card { background: white; padding: 20px; border-radius: 6px; text-align: center; }
            .stat-value { font-size: 32px; font-weight: bold; color: #3b82f6; }
            .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Your Weekly Research Summary</h1>
            </div>
            <div class="content">
              <p>Hi ${params.userName},</p>
              <p>Here's your research activity from the past week:</p>

              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-value">${params.completedResearch}</div>
                  <div class="stat-label">Research Completed</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${params.totalSources}</div>
                  <div class="stat-label">Sources Analyzed</div>
                </div>
              </div>

              <h3>Top Research Topics:</h3>
              <ul>${topicsList}</ul>

              <a href="${params.dashboardUrl}" class="button">
                View Dashboard →
              </a>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                Keep up the great work! Start a new research to continue your learning journey.
              </p>
            </div>
            <div class="footer">
              <p>ResearchHive - AI-Powered Research Platform</p>
              <p>
                <a href="${params.dashboardUrl}/settings" style="color: #3b82f6;">Unsubscribe from weekly digest</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: params.to,
      subject: '📊 Your Weekly Research Summary',
      html,
    });
  }

  /**
   * Check if email service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

/**
 * Get or create email service instance
 */
export function getEmailService(config?: EmailConfig): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService(config);
  }
  return emailServiceInstance;
}
