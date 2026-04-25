import { NextResponse } from 'next/server';
import { getIncidents } from '@/lib/incident-store';

export async function GET() {
  return NextResponse.json({ incidents: getIncidents() });
}
