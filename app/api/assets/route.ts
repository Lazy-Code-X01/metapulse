import { NextRequest, NextResponse } from 'next/server'
import { pingOpenMetadata, listTables } from '@/lib/openmetadata'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const omUrl = searchParams.get('omUrl');
    const omToken = searchParams.get('omToken');

    const config = {
      baseURL: req.headers.get('x-om-url') || omUrl || undefined,
      token: req.headers.get('x-om-token') || omToken || undefined,
    };

    const isAlive = await pingOpenMetadata(config);

    if (!isAlive) {
      return NextResponse.json(
        { error: 'Cannot reach OpenMetadata. Check your URL and Personal Access Token.' },
        { status: 503 }
      );
    }

    // If testing credentials (from onboarding), we just care if it's alive.
    if (omUrl && omToken) {
      return NextResponse.json({ status: 'connected' });
    }

    const tables = await listTables(10, config);
    return NextResponse.json({
      status: 'connected',
      tableCount: tables.length,
      tables,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
