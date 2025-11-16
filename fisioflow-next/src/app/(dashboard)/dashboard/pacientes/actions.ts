'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createPatient(formData: FormData) {
  const supabase = await createClient()

  const data = {
    nome: formData.get('nome') as string,
    email: formData.get('email') as string || null,
    telefone: formData.get('telefone') as string || null,
    cpf: formData.get('cpf') as string || null,
    data_nascimento: formData.get('data_nascimento') as string || null,
    endereco: formData.get('endereco') as string || null,
  }

  const { error } = await supabase.from('pacientes').insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/pacientes')
  return { success: true }
}

export async function updatePatient(id: string, formData: FormData) {
  const supabase = await createClient()

  const data = {
    nome: formData.get('nome') as string,
    email: formData.get('email') as string || null,
    telefone: formData.get('telefone') as string || null,
    cpf: formData.get('cpf') as string || null,
    data_nascimento: formData.get('data_nascimento') as string || null,
    endereco: formData.get('endereco') as string || null,
  }

  const { error } = await supabase
    .from('pacientes')
    .update(data)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/pacientes')
  revalidatePath(`/dashboard/pacientes/${id}`)
  return { success: true }
}

export async function deletePatient(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('pacientes').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/pacientes')
  return { success: true }
}

