import type { IncidentReport } from '@/types';

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '*$1*')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^---$/gm, '—')
    .replace(/^-\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
}
export async function sendSlackIncidentAlert(
  incident: IncidentReport
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('[Notify] SLACK_WEBHOOK_URL is not set. Skipping Slack notification.');
    return;
  }

  const formattedTime = new Date(incident.timestamp).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const strippedReport = stripMarkdown(incident.report);
  const reportPreview =
    strippedReport.length > 500
      ? strippedReport.substring(0, 500) + '...'
      : strippedReport;

  const payload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 MetaPulse Incident Detected',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Asset:*\n${incident.assetName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Status:*\n${incident.status.toUpperCase()}`,
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${formattedTime}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Failure Reason:*\n${incident.failureReason}`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Report Preview:*\n${reportPreview}`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Detected by MetaPulse · Powered by OpenMetadata',
          },
        ],
      },
    ],
  };



  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `[Notify] Slack API error: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error(
      '[Notify] Failed to send Slack incident alert:',
      error instanceof Error ? error.message : String(error)
    );
  }
}
