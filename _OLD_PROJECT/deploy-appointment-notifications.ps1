# ======================================================================
# MOOCAFISIO - Deploy Appointment Notifications Integration
# ======================================================================
# Deploy completo da integração Push Notifications + Agendamentos
#
# Data: 05 de Novembro de 2025
# Status: Pronto para uso
# ======================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MOOCAFISIO - Appointment Notifications  " -ForegroundColor Cyan
Write-Host "  Deploy Integration                      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ==================================================
# STEP 1: Apply Database Migration
# ==================================================
Write-Host "[1/3] Aplicando Migration do Banco de Dados..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Tabela: notification_schedules" -ForegroundColor Cyan
Write-Host "Migration: 20251105000006_create_notification_schedules.sql" -ForegroundColor Gray
Write-Host ""

Write-Host "Opções:" -ForegroundColor White
Write-Host "  1. Aplicar via Supabase CLI (supabase db push)"
Write-Host "  2. Aplicar via Dashboard SQL Editor (manual)"
Write-Host "  3. Pular este passo (já aplicado)"
Write-Host ""

$migrationChoice = Read-Host "Escolha uma opção (1-3)"

switch ($migrationChoice) {
    "1" {
        Write-Host "Executando: npx supabase db push" -ForegroundColor Gray
        Push-Location supabase
        try {
            npx supabase db push
            Write-Host "✅ Migration aplicada com sucesso!" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Erro ao aplicar migration." -ForegroundColor Red
            Write-Host "Aplique manualmente via Dashboard:" -ForegroundColor Yellow
            Write-Host "https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql" -ForegroundColor Cyan
            Pop-Location
            exit 1
        }
        Pop-Location
    }
    "2" {
        Write-Host ""
        Write-Host "📋 Copie o SQL da migration:" -ForegroundColor Yellow
        Write-Host "   Arquivo: supabase/migrations/20251105000006_create_notification_schedules.sql" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📌 Cole no Dashboard SQL Editor:" -ForegroundColor Yellow
        Write-Host "   https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "Pressione Enter após aplicar a migration..."
        Write-Host "✅ Migration aplicada!" -ForegroundColor Green
    }
    "3" {
        Write-Host "⏭️  Pulando migration (assumindo que já foi aplicada)" -ForegroundColor Yellow
    }
    default {
        Write-Host "❌ Opção inválida. Abortando." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# ==================================================
# STEP 2: Deploy Edge Function
# ==================================================
Write-Host "[2/3] Deploy da Edge Function..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Function: process-appointment-reminders" -ForegroundColor Cyan
Write-Host "Descrição: Processa lembretes pendentes e envia notificações" -ForegroundColor Gray
Write-Host ""

$deployChoice = Read-Host "Deploy Edge Function? (s/n)"

if ($deployChoice -eq "s" -or $deployChoice -eq "S") {
    Write-Host "Executando: npx supabase functions deploy process-appointment-reminders" -ForegroundColor Gray
    try {
        npx supabase functions deploy process-appointment-reminders

        Write-Host ""
        Write-Host "✅ Edge Function deployed com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📌 URL da Function:" -ForegroundColor Yellow
        Write-Host "   https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/process-appointment-reminders" -ForegroundColor Cyan
    }
    catch {
        Write-Host "❌ Erro ao fazer deploy da Edge Function." -ForegroundColor Red
        Write-Host "Tente novamente ou faça deploy manual via Dashboard." -ForegroundColor Yellow
        exit 1
    }
}
else {
    Write-Host "⏭️  Pulando deploy da Edge Function" -ForegroundColor Yellow
}

Write-Host ""

# ==================================================
# STEP 3: Setup Cron Job (Optional)
# ==================================================
Write-Host "[3/3] Configurar Cron Job (Opcional)..." -ForegroundColor Yellow
Write-Host ""

Write-Host "O Cron Job executará a function process-appointment-reminders automaticamente" -ForegroundColor White
Write-Host "a cada 5 minutos para processar lembretes pendentes." -ForegroundColor White
Write-Host ""

$cronChoice = Read-Host "Configurar Cron Job agora? (s/n)"

if ($cronChoice -eq "s" -or $cronChoice -eq "S") {
    Write-Host ""
    Write-Host "📋 SQL para configurar Cron Job:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "-- Cole este SQL no Dashboard SQL Editor" -ForegroundColor Gray
    Write-Host "SELECT cron.schedule(" -ForegroundColor Cyan
    Write-Host "  'process-appointment-reminders'," -ForegroundColor Cyan
    Write-Host "  '*/5 * * * *', -- A cada 5 minutos" -ForegroundColor Cyan
    Write-Host "  \$\$" -ForegroundColor Cyan
    Write-Host "  SELECT net.http_post(" -ForegroundColor Cyan
    Write-Host "    url:='https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/process-appointment-reminders'," -ForegroundColor Cyan
    Write-Host "    headers:=jsonb_build_object(" -ForegroundColor Cyan
    Write-Host "      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')" -ForegroundColor Cyan
    Write-Host "    )" -ForegroundColor Cyan
    Write-Host "  );" -ForegroundColor Cyan
    Write-Host "  \$\$" -ForegroundColor Cyan
    Write-Host ");" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📌 Abra o Dashboard SQL Editor:" -ForegroundColor Yellow
    Write-Host "   https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Pressione Enter após configurar o Cron Job..."
    Write-Host "✅ Cron Job configurado!" -ForegroundColor Green
}
else {
    Write-Host "⏭️  Pulando configuração do Cron Job" -ForegroundColor Yellow
    Write-Host "   Você pode processar lembretes manualmente chamando a Edge Function" -ForegroundColor Gray
}

Write-Host ""
Write-Host ""

# ==================================================
# SUMMARY
# ==================================================
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ DEPLOY CONCLUÍDO COM SUCESSO!       " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📊 O que foi deployado:" -ForegroundColor Yellow
Write-Host "  ✅ Tabela: notification_schedules" -ForegroundColor Green
Write-Host "  ✅ Edge Function: process-appointment-reminders" -ForegroundColor Green
Write-Host "  ✅ Serviço: AppointmentNotificationService" -ForegroundColor Green
Write-Host "  ✅ Hook: useAppointmentNotifications" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Como usar na aplicação:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  import { useAppointmentNotifications } from '../hooks/useAppointmentNotifications';" -ForegroundColor Cyan
Write-Host ""
Write-Host "  const { sendConfirmation, scheduleReminders } = useAppointmentNotifications();" -ForegroundColor Cyan
Write-Host ""
Write-Host "  // Ao criar agendamento:" -ForegroundColor Gray
Write-Host "  await sendConfirmation(appointment);" -ForegroundColor Cyan
Write-Host "  await scheduleReminders(appointment);" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Documentação:" -ForegroundColor Yellow
Write-Host "  Veja: GUIA_INTEGRACAO_PUSH_AGENDAMENTOS.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "🧪 Testar manualmente:" -ForegroundColor Yellow
Write-Host "  https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/functions/process-appointment-reminders" -ForegroundColor Cyan
Write-Host "  Clique em 'Invoke' para processar lembretes pendentes" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host ""
