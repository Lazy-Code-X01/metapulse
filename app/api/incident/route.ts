import { NextRequest, NextResponse } from 'next/server';
import { AgentIncidentInput } from '@/types';
import { runIncidentAgent } from '@/lib/agent';
import { addIncident } from '@/lib/incident-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assetId, assetName, assetType, failureReason } = body;

    // Validate required fields
    if (!assetId || !assetName || !assetType || !failureReason) {
      return NextResponse.json(
        { error: 'Missing required fields: assetId, assetName, assetType, failureReason' },
        { status: 400 }
      );
    }

    // Build AgentIncidentInput
    const input: AgentIncidentInput = {
      assetId,
      assetName,
      assetType,
      failureReason,
      timestamp: new Date().toISOString(),
    };

    // Call agent
    const report = await runIncidentAgent(input);

    // Persist to in-memory store for dashboard polling
    addIncident(report);

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error('[API Incident]', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
