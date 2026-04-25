import { NextRequest, NextResponse } from 'next/server';
import { AgentIncidentInput } from '@/types';
import { runIncidentAgent } from '@/lib/agent';
import { addIncident } from '@/lib/incident-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payloadString = JSON.stringify(body, null, 2);


    const eventType   = body.eventType   || 'unknown';
    const entityId    = body.entityId    || 'unknown';
    const entityType  = body.entityType  || 'table';

    // entity field arrives as a stringified JSON string from OM
    let entityName = 'unknown';
    try {
      const entityObj = typeof body.entity === 'string'
        ? JSON.parse(body.entity)
        : body.entity;
      entityName = entityObj?.name || entityObj?.fullyQualifiedName || 'unknown';
    } catch {
      entityName = entityId;
    }

    const changedField =
      body.changeDescription?.fieldsUpdated?.[0]?.name ||
      body.changeDescription?.fieldsAdded?.[0]?.name   ||
      'entity updated';

    const failureReason =
      `Automated detection: ${eventType} event on ${entityType} — ${changedField} changed`;


    const input: AgentIncidentInput = {
      assetId:       entityId,
      assetName:     entityName,
      assetType:     entityType,
      failureReason,
      timestamp:     new Date().toISOString(),
    };

    const report = await runIncidentAgent(input);

    // Push into in-memory store so the dashboard polling can pick it up
    addIncident(report);

    return NextResponse.json(report, { status: 200 });

  } catch (error) {
    console.error('[API Webhook]', error);
    // Always return 200 so OM marks the delivery as successful
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 200 }
    );
  }
}
