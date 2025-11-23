import { createServerComponentClient } from '~/lib/supabase/server';

export class VoucherService {
  static async redeemVoucher(params: { patientId: string; voucherId: string }) {
    try {
      const supabase = await createServerComponentClient();

      // @ts-expect-error - vouchers table not in schema yet
      const { data: voucher } = await (supabase as any)
        .from('vouchers')
        .select('*')
        .eq('id', params.voucherId)
        .eq('is_active', true)
        .single();

      if (!voucher) throw new Error('Voucher not found');

      const voucherData = voucher as Record<string, unknown>;
      const voucherCost = typeof voucherData.xp_cost === 'number' ? voucherData.xp_cost : 0;

      const { data: patient } = await supabase
        .from('patients')
        .select('xp_points')
        .eq('id', params.patientId)
        .single();

      if (!patient) throw new Error('Patient not found');

      const patientData = patient as Record<string, unknown>;
      const patientXP = typeof patientData.xp_points === 'number' ? patientData.xp_points : 0;

      if (patientXP < voucherCost) {
        throw new Error('Insufficient XP');
      }

      // @ts-expect-error - voucher_redemptions table not in schema yet
      const { data: redemption, error } = await (supabase as any)
        .from('voucher_redemptions')
        .insert({
          voucher_id: params.voucherId,
          patient_id: params.patientId,
          xp_spent: voucherCost,
        })
        .select('*, voucher:vouchers(*)')
        .single();

      if (error) throw error;

      // Deduct XP
      await supabase
        .from('patients')
        .update({ xp_points: patientXP - voucherCost })
        .eq('id', params.patientId);

      return { data: redemption, error: null };
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      return { data: null, error };
    }
  }
}

