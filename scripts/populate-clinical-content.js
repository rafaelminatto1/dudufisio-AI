#!/usr/bin/env tsx
/**
 * Script Principal para Popular Conteúdo Clínico
 * Gera imagens com Google Imagen e popula o sistema
 */
import { imagenService } from '../services/ai/imagenService';
import CLINICAL_PROTOCOLS from './generate-clinical-content';
import EXERCISES_LIBRARY from './generate-exercises';
import { SPECIALIZED_ASSESSMENTS, CLINICAL_MATERIALS, CLINICAL_LIBRARY, EDUCATIONAL_CONTENT } from './generate-assessments-materials';
// ===== CONFIGURAÇÃO =====
const GENERATE_IMAGES = false; // Set to false para apenas gerar prompts sem imagens
// ===== FUNÇÕES AUXILIARES =====
async function generateProtocolImages(protocol) {
    console.log(`  📸 Gerando imagens para protocolo: ${protocol.title}`);
    const imagePromises = [];
    // Imagem principal do protocolo
    imagePromises.push(imagenService.generateImageObject('protocol', {
        name: protocol.title,
        specialty: protocol.specialty
    }));
    // Imagens para cada fase (máximo 3)
    const phasesToImage = protocol.phases.slice(0, 3);
    for (const phase of phasesToImage) {
        imagePromises.push(imagenService.generateImageObject('educational', {
            topic: `${protocol.title} - ${phase.name}`,
            audience: 'fisioterapeutas'
        }));
    }
    const images = await Promise.all(imagePromises);
    protocol.images = images.map((img, index) => ({
        url: img.url,
        prompt: img.prompt,
        caption: index === 0 ? protocol.title : protocol.phases[index - 1]?.name || '',
        type: 'illustration'
    }));
    console.log(`  ✅ Geradas ${images.length} imagens para ${protocol.title}`);
}
async function generateExerciseImages(exercise) {
    console.log(`  📸 Gerando imagens para exercício: ${exercise.name}`);
    const imagePromises = [];
    // Imagens para diferentes fases do exercício
    const phases = ['inicio', 'meio', 'fim'];
    for (const phase of phases) {
        imagePromises.push(imagenService.generateImageObject('exercise', {
            name: exercise.name,
            bodyPart: exercise.bodyParts[0] || 'corpo-inteiro',
            difficulty: exercise.difficulty
        }));
    }
    const images = await Promise.all(imagePromises);
    exercise.images = images.map((img, index) => ({
        url: img.url,
        prompt: img.prompt,
        caption: `${exercise.name} - ${phases[index]}`,
        phase: phases[index],
        angle: index === 0 ? 'vista frontal' : index === 1 ? 'vista lateral' : 'vista geral'
    }));
    console.log(`  ✅ Geradas ${images.length} imagens para ${exercise.name}`);
}
async function generateAssessmentImages(assessment) {
    console.log(`  📸 Gerando imagens para avaliação: ${assessment.title}`);
    const imagePromises = [];
    // Imagem principal
    imagePromises.push(imagenService.generateImageObject('educational', {
        topic: assessment.title,
        audience: 'fisioterapeutas'
    }));
    // Imagens para procedimentos principais (máximo 2)
    const proceduresToImage = assessment.procedures.slice(0, 2);
    for (const procedure of proceduresToImage) {
        imagePromises.push(imagenService.generateImageObject('educational', {
            topic: `${assessment.title} - ${procedure.step}`,
            audience: 'fisioterapeutas'
        }));
    }
    const images = await Promise.all(imagePromises);
    assessment.images = images.map((img, index) => ({
        url: img.url,
        prompt: img.prompt,
        caption: index === 0 ? assessment.title : proceduresToImage[index - 1]?.step || '',
        type: 'photo'
    }));
    console.log(`  ✅ Geradas ${images.length} imagens para ${assessment.title}`);
}
// ===== PROCESSAMENTO PRINCIPAL =====
async function processProtocols() {
    console.log(`\n🏥 Processando ${CLINICAL_PROTOCOLS.length} Protocolos Clínicos...`);
    for (const protocol of CLINICAL_PROTOCOLS) {
        if (GENERATE_IMAGES) {
            await generateProtocolImages(protocol);
        }
        else {
            console.log(`  📝 Protocolo: ${protocol.title} (sem imagens)`);
        }
    }
    console.log(`✅ Protocolos processados!`);
    return CLINICAL_PROTOCOLS;
}
async function processExercises() {
    console.log(`\n💪 Processando ${EXERCISES_LIBRARY.length} Exercícios...`);
    for (const exercise of EXERCISES_LIBRARY) {
        if (GENERATE_IMAGES) {
            await generateExerciseImages(exercise);
        }
        else {
            console.log(`  📝 Exercício: ${exercise.name} (sem imagens)`);
        }
    }
    console.log(`✅ Exercícios processados!`);
    return EXERCISES_LIBRARY;
}
async function processAssessments() {
    console.log(`\n📋 Processando ${SPECIALIZED_ASSESSMENTS.length} Avaliações...`);
    for (const assessment of SPECIALIZED_ASSESSMENTS) {
        if (GENERATE_IMAGES) {
            await generateAssessmentImages(assessment);
        }
        else {
            console.log(`  📝 Avaliação: ${assessment.title} (sem imagens)`);
        }
    }
    console.log(`✅ Avaliações processadas!`);
    return SPECIALIZED_ASSESSMENTS;
}
async function processMaterials() {
    console.log(`\n📄 Processando ${CLINICAL_MATERIALS.length} Materiais Clínicos...`);
    for (const material of CLINICAL_MATERIALS) {
        console.log(`  📝 Material: ${material.title}`);
        // Materiais geralmente não precisam de imagens complexas
    }
    console.log(`✅ Materiais processados!`);
    return CLINICAL_MATERIALS;
}
async function processLibrary() {
    console.log(`\n📚 Processando ${CLINICAL_LIBRARY.length} Itens de Biblioteca...`);
    for (const item of CLINICAL_LIBRARY) {
        console.log(`  📝 Biblioteca: ${item.title}`);
    }
    console.log(`✅ Biblioteca processada!`);
    return CLINICAL_LIBRARY;
}
async function processEducational() {
    console.log(`\n🎓 Processando ${EDUCATIONAL_CONTENT.length} Conteúdos Educacionais...`);
    for (const content of EDUCATIONAL_CONTENT) {
        console.log(`  📝 Educacional: ${content.title}`);
    }
    console.log(`✅ Conteúdos educacionais processados!`);
    return EDUCATIONAL_CONTENT;
}
// ===== EXPORTAÇÃO DE DADOS =====
async function exportToJSON() {
    const fs = await import('fs/promises');
    const path = await import('path');
    const outputDir = path.join(process.cwd(), 'public', 'clinical-content');
    try {
        await fs.mkdir(outputDir, { recursive: true });
    }
    catch (error) {
        // Diretório já existe
    }
    const data = {
        protocols: CLINICAL_PROTOCOLS,
        exercises: EXERCISES_LIBRARY,
        assessments: SPECIALIZED_ASSESSMENTS,
        materials: CLINICAL_MATERIALS,
        library: CLINICAL_LIBRARY,
        educational: EDUCATIONAL_CONTENT,
        metadata: {
            generatedAt: new Date().toISOString(),
            totalProtocols: CLINICAL_PROTOCOLS.length,
            totalExercises: EXERCISES_LIBRARY.length,
            totalAssessments: SPECIALIZED_ASSESSMENTS.length,
            totalMaterials: CLINICAL_MATERIALS.length,
            totalLibraryItems: CLINICAL_LIBRARY.length,
            totalEducational: EDUCATIONAL_CONTENT.length
        }
    };
    await fs.writeFile(path.join(outputDir, 'clinical-content-complete.json'), JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n💾 Dados exportados para: public/clinical-content/clinical-content-complete.json`);
}
// ===== GERAÇÃO DE RELATÓRIO =====
function generateReport() {
    console.log(`\n
╔════════════════════════════════════════════════════════════════╗
║              RELATÓRIO DE CONTEÚDO CLÍNICO GERADO              ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  📊 ESTATÍSTICAS                                               ║
║  ───────────────────────────────────────────────────────────  ║
║  • Protocolos Clínicos:          ${String(CLINICAL_PROTOCOLS.length).padStart(3)} protocolos       ║
║  • Exercícios:                   ${String(EXERCISES_LIBRARY.length).padStart(3)} exercícios        ║
║  • Avaliações Especializadas:    ${String(SPECIALIZED_ASSESSMENTS.length).padStart(3)} avaliações        ║
║  • Materiais Clínicos:           ${String(CLINICAL_MATERIALS.length).padStart(3)} materiais         ║
║  • Biblioteca Clínica:           ${String(CLINICAL_LIBRARY.length).padStart(3)} artigos           ║
║  • Conteúdo Educacional:         ${String(EDUCATIONAL_CONTENT.length).padStart(3)} conteúdos        ║
║                                                                ║
║  📋 DISTRIBUIÇÃO POR ESPECIALIDADE                             ║
║  ───────────────────────────────────────────────────────────  ║
║  • Fisioterapia Esportiva:       Completo ✓                   ║
║  • Fisioterapia Pós-Operatória:  Completo ✓                   ║
║  • Fisioterapia Gerontológica:   Completo ✓                   ║
║                                                                ║
║  🎯 PRÓXIMOS PASSOS                                            ║
║  ───────────────────────────────────────────────────────────  ║
║  1. Revisar conteúdos gerados                                  ║
║  2. Gerar imagens reais com Imagen 3 quando disponível         ║
║  3. Integrar com banco de dados do sistema                     ║
║  4. Treinar equipe nos novos protocolos                        ║
║  5. Coletar feedback e iterar                                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
}
// ===== FUNÇÃO PRINCIPAL =====
async function main() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║         🏥 GERADOR DE CONTEÚDO CLÍNICO - DUDUFISIO AI         ║
║                                                                ║
║  Baseado em: Activity Fisioterapia (activityfisioterapia.com) ║
║  Usando: Google Gemini + Imagen 3 (Banana)                    ║
╚════════════════════════════════════════════════════════════════╝
  `);
    try {
        // Processar todos os conteúdos
        await processProtocols();
        await processExercises();
        await processAssessments();
        await processMaterials();
        await processLibrary();
        await processEducational();
        // Exportar dados
        await exportToJSON();
        // Gerar relatório
        generateReport();
        console.log(`\n✅ PROCESSO CONCLUÍDO COM SUCESSO!\n`);
    }
    catch (error) {
        console.error(`\n❌ ERRO ao gerar conteúdo:`, error);
        process.exit(1);
    }
}
// Executar o script
main().catch(console.error);
export { main, CLINICAL_PROTOCOLS, EXERCISES_LIBRARY, SPECIALIZED_ASSESSMENTS, CLINICAL_MATERIALS, CLINICAL_LIBRARY, EDUCATIONAL_CONTENT };
