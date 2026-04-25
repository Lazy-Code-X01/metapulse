import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'Webhook URL is required' }, { status: 400 });
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '*MetaPulse Connection Test*\nYour Slack integration is now active and ready to receive incident reports.',
      }),
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    } else {
      const errText = await res.text();
      return NextResponse.json({ error: `Slack returned an error: ${errText}` }, { status: res.status });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to test Slack webhook', details: String(error) }, { status: 500 });
  }
}
