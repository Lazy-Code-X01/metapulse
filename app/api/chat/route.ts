import { NextRequest, NextResponse } from 'next/server';
import { AgentOnboardingInput } from '@/types';
import { runOnboardingAgent } from '@/lib/agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userName, role, team, message, conversationHistory } = body;

    // Validate required fields
    if (!userName || !role || !team || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userName, role, team, message' },
        { status: 400 }
      );
    }

    // Build AgentOnboardingInput
    const input: AgentOnboardingInput = {
      userName,
      role,
      team,
      message,
      conversationHistory: conversationHistory || [],
    };

    // Call agent
    const result = await runOnboardingAgent(input);

    return NextResponse.json({ response: result }, { status: 200 });
  } catch (error) {
    console.error('[API Chat]', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
