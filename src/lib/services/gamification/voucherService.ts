import { createServerComponentClient } from '~/lib/supabase/server';

export class VoucherService {
  static async redeemVoucher(params: { patientId: string; voucherId: string }) {
    try {
      const supabase = await createServerComponentClient();
      
      const { data: voucher } = await supabase
        .from('vouchers')
        .select('*')
        .eq('id', params.voucherId)
        .eq('is_active', true)
        .single();

      if (!voucher) throw new Error('Voucher not found');

      const { data: patient } = await supabase
        .from('patients')
        .select('xp_points')
        .eq('id', params.patientId)
        .single();

      if (!patient || patient.xp_points < voucher.xp_cost) {
        throw new Error('Insufficient XP');
      }

      const { data: redemption, error } = await supabase
        .from('voucher_redemptions')
        .insert({
          voucher_id: params.voucherId,
          patient_id: params.patientId,
          xp_spent: voucher.xp_cost,
        })
        .select('*, voucher:vouchers(*)')
        .single();

      if (error) throw error;

      // Deduct XP
      await supabase
        .from('patients')
        .update({ xp_points: patient.xp_points - voucher.xp_cost })
        .eq('id', params.patientId);

      return { data: redemption, error: null };
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      return { data: null, error };
    }
  }
}

