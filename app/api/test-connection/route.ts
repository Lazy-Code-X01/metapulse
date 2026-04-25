import { NextRequest, NextResponse } from 'next/server';
import { pingOpenMetadata } from '@/lib/openmetadata';

export async function POST(req: NextRequest) {
  try {
    const { omUrl, omToken } = await req.json();

    if (!omUrl || !omToken) {
      return NextResponse.json(
        { error: 'Missing OpenMetadata URL or Personal Access Token' },
        { status: 400 }
      );
    }

    const isAlive = await pingOpenMetadata({ baseURL: omUrl, token: omToken });

    if (isAlive) {
      return NextResponse.json({ success: true, message: 'Successfully connected to OpenMetadata' });
    } else {
      return NextResponse.json({ success: false, error: 'Cannot reach OpenMetadata instance' }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
