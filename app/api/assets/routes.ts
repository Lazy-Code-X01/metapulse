import { NextResponse } from 'next/server';
import { pingOpenMetadata, listTables } from '@/lib/openmetadata';

export async function GET() {
  try {
    const isAlive = await pingOpenMetadata();

    if (!isAlive) {
      return NextResponse.json(
        { error: 'Cannot reach OpenMetadata. Is Docker running?' },
        { status: 503 }
      );
    }

    const tables = await listTables(10);

    return NextResponse.json({
      status: 'connected',
      tableCount: tables.length,
      tables,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
