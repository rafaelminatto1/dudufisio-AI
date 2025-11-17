import { NextRequest, NextResponse } from 'next/server';
import { PackageService } from '~/lib/services/financial/packageService';
import { createServerComponentClient } from '~/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await PackageService.create(body);

    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to create package' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');

    if (patientId) {
      const result = await PackageService.getByPatient(patientId);
      if (result.error) {
        return NextResponse.json(
          { error: 'Failed to fetch packages' },
          { status: 500 }
        );
      }
      return NextResponse.json(result.data);
    }

    // Se não houver patientId, buscar todos com join em patients
    const { data, error } = await supabase
      .from('patient_packages')
      .select(`
        *,
        patient:patients(id, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch packages' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

