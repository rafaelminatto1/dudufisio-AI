/**
 * Script para popular dados de demonstração do App de Pacientes
 * MoocaFisio
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDemoData() {
  console.log('🌱 Populando dados de demonstração do App de Pacientes...\n');
  
  try {
    // 1. Buscar ou criar paciente de teste
    console.log('1. Buscando paciente de teste...');
    
    let { data: testPatient } = await supabase
      .from('patients')
      .select('id, full_name')
      .eq('email', 'paciente.teste@moocafisio.com.br')
      .single();
    
    if (!testPatient) {
      console.log('   Criando paciente de teste...');
      const { data: newPatient, error: patientError} = await supabase
        .from('patients')
        .insert({
          full_name: 'João da Silva',
          email: 'paciente.teste@moocafisio.com.br',
          phone: '(11) 99999-9999',
          birth_date: '1985-05-15',
        })
        .select()
        .single();
      
      if (patientError) throw patientError;
      testPatient = newPatient;
    }
    
    console.log(`   ✅ Paciente: ${testPatient.full_name} (${testPatient.id})\n`);
    
    // 2. Criar vídeos de exercícios de exemplo
    console.log('2. Criando vídeos de exercícios...');
    
    const exerciseVideos = [
      {
        title: 'Alongamento de Quadríceps',
        description: 'Exercício para alongar o músculo quadríceps femoral',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        video_type: 'youtube',
        category: 'Alongamento',
        tags: ['quadríceps', 'pernas', 'alongamento'],
        duration: 180,
      },
      {
        title: 'Fortalecimento de Core',
        description: 'Prancha isométrica para fortalecimento abdominal',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        video_type: 'youtube',
        category: 'Fortalecimento',
        tags: ['core', 'abdômen', 'prancha'],
        duration: 120,
      },
      {
        title: 'Mobilidade de Ombro',
        description: 'Exercício de mobilidade articular do ombro',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        video_type: 'youtube',
        category: 'Mobilidade',
        tags: ['ombro', 'mobilidade', 'articular'],
        duration: 150,
      },
    ];
    
    const createdVideos = [];
    for (const video of exerciseVideos) {
      const { data: createdVideo, error } = await supabase
        .from('exercise_videos')
        .insert(video)
        .select()
        .single();
      
      if (error) {
        console.log(`   ⚠️ Vídeo já existe ou erro: ${video.title}`);
      } else {
        createdVideos.push(createdVideo);
        console.log(`   ✅ Vídeo criado: ${video.title}`);
      }
    }
    
    console.log(`   Total: ${createdVideos.length} vídeos criados\n`);
    
    // 3. Prescrever exercícios para o paciente
    console.log('3. Prescrevendo exercícios para o paciente...');
    
    // Buscar terapeuta de teste
    const { data: therapist } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'therapist')
      .limit(1)
      .single();
    
    if (!therapist) {
      console.log('   ⚠️ Nenhum terapeuta encontrado. Pulando prescrição de exercícios.\n');
    } else {
      for (const video of createdVideos) {
        const { error } = await supabase
          .from('patient_exercises')
          .insert({
            patient_id: testPatient.id,
            exercise_video_id: video.id,
            prescribed_by: therapist.id,
            exercise_name: video.title,
            description: video.description,
            instructions: `Realize este exercício com atenção.\n\nDica: Mantenha a postura correta durante toda a execução.`,
            sets: 3,
            reps: 10,
            duration_seconds: 180,
            rest_seconds: 60,
            frequency_per_week: 3,
            is_active: true,
            notes: 'Importante: Pare se sentir dor.',
          });
        
        if (error) {
          console.log(`   ⚠️ Exercício já prescrito: ${video.title}`);
        } else {
          console.log(`   ✅ Exercício prescrito: ${video.title}`);
        }
      }
    }
    
    console.log();
    
    // 4. Criar código de acesso
    console.log('4. Gerando código de acesso...');
    
    const { data: codeResult, error: codeError } = await supabase
      .rpc('create_patient_access_code', {
        p_patient_id: testPatient.id,
        p_created_by: therapist?.id || null,
        p_expires_in_days: 30,
      });
    
    if (codeError) {
      console.error('   ❌ Erro ao gerar código:', codeError.message);
    } else if (codeResult && codeResult.length > 0) {
      const code = codeResult[0].code;
      console.log(`   ✅ Código gerado: ${code}`);
      console.log(`   Expira em: ${new Date(codeResult[0].expires_at).toLocaleDateString('pt-BR')}\n`);
      
      // Salvar código em arquivo para fácil acesso
      const fs = await import('fs/promises');
      await fs.writeFile(
        'CODIGO_ACESSO_TESTE.txt',
        `CÓDIGO DE ACESSO PARA TESTE\n\nPaciente: ${testPatient.full_name}\nCódigo: ${code}\nExpira em: ${new Date(codeResult[0].expires_at).toLocaleDateString('pt-BR')}\n\nUse este código em: http://localhost:5173/patient/login\n`
      );
      console.log('   📄 Código salvo em: CODIGO_ACESSO_TESTE.txt\n');
    }
    
    // 5. Criar estatísticas iniciais
    console.log('5. Inicializando estatísticas...');
    
    await supabase.rpc('update_patient_stats', { p_patient_id: testPatient.id });
    
    console.log('   ✅ Estatísticas inicializadas\n');
    
    console.log('✨ Dados de demonstração criados com sucesso!\n');
    console.log('════════════════════════════════════════');
    console.log('PRÓXIMOS PASSOS:');
    console.log('════════════════════════════════════════');
    console.log('1. Acesse: http://localhost:5173/patient/login');
    console.log(`2. Use o código: ${codeResult?.[0]?.code || '(ver CODIGO_ACESSO_TESTE.txt)'}`);
    console.log('3. Explore o app do paciente!');
    console.log('════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Erro ao popular dados:', error);
    process.exit(1);
  }
}

// Executar
seedDemoData();

