/**
 * Nutritional Service - Supabase Implementation
 * Serviço para orientação nutricional integrada
 */

import { supabase } from '../../lib/supabaseClient';

export interface NutritionalAssessment {
  id: string;
  patient_id: string;
  assessment_date: string;
  assessed_by: string;
  weight: number;
  height: number;
  bmi: number;
  body_fat_percentage?: number;
  muscle_mass_percentage?: number;
  visceral_fat?: number;
  waist_circumference?: number;
  hip_circumference?: number;
  waist_hip_ratio?: number;
  bmr?: number;
  tdee?: number;
  activity_level: string;
  current_caloric_intake?: number;
  protein_intake?: number;
  carb_intake?: number;
  fat_intake?: number;
  water_intake?: number;
  nutritional_deficiencies?: string[];
  nutritional_status: string;
  dietary_restrictions?: string[];
  allergies?: string[];
  preferences?: string[];
  notes?: string;
  created_at: string;
}

export interface NutritionalPlan {
  id: string;
  patient_id: string;
  assessment_id?: string;
  plan_start_date: string;
  plan_end_date?: string;
  primary_goal: string;
  secondary_goals?: string[];
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
  target_water: number;
  protein_percentage?: number;
  carbs_percentage?: number;
  fats_percentage?: number;
  meals_per_day: number;
  meal_timing?: any;
  foods_to_include: string[];
  foods_to_avoid?: string[];
  supplements_recommended?: string[];
  hydration_schedule?: string[];
  pre_workout_nutrition?: string;
  post_workout_nutrition?: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

class NutritionalServiceSupabase {
  /**
   * Buscar avaliações nutricionais
   */
  async getAssessments(patientId: string): Promise<NutritionalAssessment[]> {
    const { data, error } = await supabase
      .from('nutritional_assessments')
      .select('*')
      .eq('patient_id', patientId)
      .order('assessment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Criar nova avaliação nutricional
   */
  async createAssessment(assessment: Partial<NutritionalAssessment>): Promise<NutritionalAssessment> {
    // Calcular BMI
    if (assessment.weight && assessment.height) {
      const heightInMeters = assessment.height / 100;
      assessment.bmi = Number((assessment.weight / (heightInMeters * heightInMeters)).toFixed(2));
      assessment.nutritional_status = this.classifyBMI(assessment.bmi);
    }

    // Calcular WHR (Waist-Hip Ratio)
    if (assessment.waist_circumference && assessment.hip_circumference) {
      assessment.waist_hip_ratio = Number(
        (assessment.waist_circumference / assessment.hip_circumference).toFixed(3)
      );
    }

    // Calcular BMR (Basal Metabolic Rate)
    if (assessment.weight && assessment.height) {
      // Precisaria do sexo e idade do paciente para cálculo preciso
      // Por enquanto, estimativa básica
      assessment.bmr = this.calculateBMR(assessment.weight, assessment.height);
    }

    // Calcular TDEE (Total Daily Energy Expenditure)
    if (assessment.bmr && assessment.activity_level) {
      assessment.tdee = this.calculateTDEE(assessment.bmr, assessment.activity_level);
    }

    const { data, error } = await supabase
      .from('nutritional_assessments')
      .insert(assessment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar planos nutricionais
   */
  async getPlans(patientId: string): Promise<NutritionalPlan[]> {
    const { data, error } = await supabase
      .from('nutritional_plans')
      .select('*')
      .eq('patient_id', patientId)
      .order('plan_start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Criar plano nutricional
   */
  async createPlan(plan: Partial<NutritionalPlan>): Promise<NutritionalPlan> {
    // Calcular percentuais de macros
    const totalCalories = plan.target_calories || 2000;
    const proteinCals = (plan.target_protein || 0) * 4;
    const carbsCals = (plan.target_carbs || 0) * 4;
    const fatsCals = (plan.target_fats || 0) * 9;

    plan.protein_percentage = Math.round((proteinCals / totalCalories) * 100);
    plan.carbs_percentage = Math.round((carbsCals / totalCalories) * 100);
    plan.fats_percentage = Math.round((fatsCals / totalCalories) * 100);

    const { data, error } = await supabase
      .from('nutritional_plans')
      .insert(plan)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar composição corporal (tracking)
   */
  async getBodyComposition(patientId: string, limit: number = 30) {
    const { data, error } = await supabase
      .from('body_composition_tracking')
      .select('*')
      .eq('patient_id', patientId)
      .order('measurement_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Adicionar medição de composição corporal
   */
  async addBodyComposition(measurement: any) {
    const { data, error } = await supabase
      .from('body_composition_tracking')
      .insert(measurement)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar registros de refeições
   */
  async getMealLogs(patientId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('patient_id', patientId)
      .gte('meal_date', startDate.toISOString().split('T')[0])
      .order('meal_date', { ascending: false })
      .order('meal_time', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Registrar refeição
   */
  async logMeal(meal: any) {
    // Calcular macros totais baseado nos alimentos
    if (meal.foods_consumed) {
      const totals = this.calculateMealMacros(meal.foods_consumed);
      meal.total_calories = totals.calories;
      meal.total_protein = totals.protein;
      meal.total_carbs = totals.carbs;
      meal.total_fats = totals.fats;
    }

    const { data, error } = await supabase
      .from('meal_logs')
      .insert(meal)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar aderência nutricional
   */
  async getAdherenceSummary(patientId: string) {
    const { data, error } = await supabase
      .from('nutritional_adherence_summary')
      .select('*')
      .eq('patient_id', patientId)
      .order('week', { ascending: false })
      .limit(12); // 12 semanas

    if (error) throw error;
    return data || [];
  }

  /**
   * Classificar BMI
   */
  private classifyBMI(bmi: number): string {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    if (bmi < 35) return 'obese_i';
    if (bmi < 40) return 'obese_ii';
    return 'obese_iii';
  }

  /**
   * Calcular BMR (Fórmula de Harris-Benedict simplificada)
   */
  private calculateBMR(weight: number, height: number): number {
    // Estimativa básica (precisaria sexo e idade)
    return 10 * weight + 6.25 * height - 5 * 30 + 5;
  }

  /**
   * Calcular TDEE
   */
  private calculateTDEE(bmr: number, activityLevel: string): number {
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    return Number((bmr * (multipliers[activityLevel] || 1.2)).toFixed(2));
  }

  /**
   * Calcular macros de uma refeição
   */
  private calculateMealMacros(foods: any[]) {
    return foods.reduce(
      (totals, food) => ({
        calories: totals.calories + (food.calories || 0),
        protein: totals.protein + (food.protein || 0),
        carbs: totals.carbs + (food.carbs || 0),
        fats: totals.fats + (food.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }
}

export const nutritionalServiceSupabase = new NutritionalServiceSupabase();































