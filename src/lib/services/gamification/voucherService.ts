import { createServerComponentClient } from '~/lib/supabase/server';

export class VoucherService {
  static async redeemVoucher(params: { patientId: string; voucherId: string }) {
    try {
      const supabase = await createServerComponentClient();
      
      const { data: voucher } = await supabase
        .from('vouchers' as any)
        .select('*')
        .eq('id', params.voucherId)
        .eq('is_active', true)
        .single();

      if (!voucher) throw new Error('Voucher not found');

      const { data: patient } = await supabase
        .from('patients' as any)
        .select('xp_points')
        .eq('id', params.patientId)
        .single();

      if (!patient || (patient as any).xp_points < (voucher as any).xp_cost) {
        throw new Error('Insufficient XP');
      }

      const { data: redemption, error } = await supabase
        .from('voucher_redemptions' as any)
        .insert({
          voucher_id: params.voucherId,
          patient_id: params.patientId,
          xp_spent: (voucher as any).xp_cost,
        })
        .select('*, voucher:vouchers(*)')
        .single();

      if (error) throw error;

      // Deduct XP
      await supabase
        .from('patients' as any)
        .update({ xp_points: (patient as any).xp_points - (voucher as any).xp_cost } as any)
        .eq('id', params.patientId);

      return { data: redemption, error: null };
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      return { data: null, error };
    }
  }
}

