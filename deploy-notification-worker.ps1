Write-Host "🚀 Deploy Worker process-notification-tasks" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Passo 1: Login no Supabase (apenas se ainda não estiver logado)" -ForegroundColor Yellow
Write-Host "Comando sugerido: npx supabase login"
Write-Host "Pressione ENTER para continuar..." -ForegroundColor DarkGray
Read-Host | Out-Null

Write-Host ""
Write-Host "🔗 Passo 2: Linkar projeto (urfxniitfbbvsaskicfo)" -ForegroundColor Yellow
npx supabase link --project-ref urfxniitfbbvsaskicfo

Write-Host ""
Write-Host "🔐 Passo 3: Confirme que os segredos WHATSAPP_* e FIREBASE_SERVICE_ACCOUNT já estão definidos" -ForegroundColor Yellow
Write-Host "Use: npx supabase secrets list --project-ref urfxniitfbbvsaskicfo" -ForegroundColor DarkGray
Write-Host ""

Write-Host "🧪 Passo 4: Opcional - testar read_notification_tasks diretamente" -ForegroundColor Yellow
Write-Host "SQL sugerido: SELECT * FROM public.read_notification_tasks();" -ForegroundColor DarkGray
Write-Host ""

Write-Host "🚀 Passo 5: Deploy da Edge Function process-notification-tasks" -ForegroundColor Yellow
npx supabase functions deploy process-notification-tasks

Write-Host ""
Write-Host "✅ Worker publicado! Próximos passos:" -ForegroundColor Green
Write-Host "- Validar o job no cron: SELECT * FROM cron.job WHERE jobname = 'process_appointment_reminders_every_5m';" -ForegroundColor DarkGray
Write-Host "- Enfileirar payload com public.enqueue_notification_task para smoke test." -ForegroundColor DarkGray
Write-Host "- Conferir logs em notification_logs." -ForegroundColor DarkGray
Write-Host ""
Write-Host "=================================================="

