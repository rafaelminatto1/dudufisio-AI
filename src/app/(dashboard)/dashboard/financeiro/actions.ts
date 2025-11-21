'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createServerComponentClient } from '~/lib/supabase/server';

export async function createTransaction(formData: FormData) {
  const amount = formData.get('amount') as string;
  const transactionType = formData.get('transaction_type') as string;
  const paymentStatus = formData.get('payment_status') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const dueDate = formData.get('due_date') as string;

  try {
    const supabase = await createServerComponentClient();

    const { data, error } = await supabase
      .from('financial_transactions' as any)
      .insert({
        amount: parseFloat(amount),
        transaction_type: transactionType,
        payment_status: paymentStatus,
        description,
        category,
        due_date: dueDate,
      } as any)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/financeiro');
    revalidateTag('transactions', 'page');
    revalidateTag('transactions:stats', 'page');

    return { success: true, data };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar transação',
    };
  }
}

export async function updateTransaction(id: string, formData: FormData) {
  const amount = formData.get('amount') as string;
  const transactionType = formData.get('transaction_type') as string;
  const paymentStatus = formData.get('payment_status') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const dueDate = formData.get('due_date') as string;

  try {
    const supabase = await createServerComponentClient();

    const { data, error } = await supabase
      .from('payment_transactions' as any)
      .update({
        amount: parseFloat(amount),
        transaction_type: transactionType,
        payment_status: paymentStatus,
        description,
        category,
        due_date: dueDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/financeiro');
    revalidateTag('transactions', 'page');
    revalidateTag('transactions:stats', 'page');

    return { success: true, data };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar transação',
    };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const supabase = await createServerComponentClient();

    const { error } = await supabase
      .from('payment_transactions' as any)
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/dashboard/financeiro');
    revalidateTag('transactions', 'page');
    revalidateTag('transactions:stats', 'page');

    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao excluir transação',
    };
  }
}

export async function updatePaymentStatus(id: string, status: string) {
  try {
    const supabase = await createServerComponentClient();

    const { data, error } = await supabase
      .from('payment_transactions' as any)
      .update({
        payment_status: status,
        updated_at: new Date().toISOString(),
        ...(status === 'pago' && { payment_date: new Date().toISOString() }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/financeiro');
    revalidateTag('transactions', 'page');
    revalidateTag('transactions:stats', 'page');

    return { success: true, data };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar status',
    };
  }
}
