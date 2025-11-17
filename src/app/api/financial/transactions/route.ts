import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '~/lib/services/financial/transactionService';
import { createServerComponentClient } from '~/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await TransactionService.create(body);

    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const result = await TransactionService.getAll({
      patientId: patientId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

