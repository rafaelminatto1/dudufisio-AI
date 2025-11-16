# Stripe Wrapper

## O que foi feito
- Migration `20251114020000_schedule_notifications.sql` cria (condicionalmente) a view `vw_stripe_customer_payments`, unindo:
  - `payments` (dados internos)
  - `stripe.payment_intents`
  - `stripe.customers`
- Serviço `services/payments/StripeWrapperService.ts` consulta a view para dashboards e relatórios.

## Pré-requisitos
1. Habilitar a integração **Stripe Wrapper** no Supabase Dashboard.
2. Executar a migration (`supabase db push`).
3. Garantir que o schema disponibilizado pela integração seja `stripe`. Caso outro nome seja utilizado, ajuste a migration na seção final.

## Uso no frontend
```ts
import { fetchStripeCustomerPayments } from '@/services/payments/StripeWrapperService';

const payments = await fetchStripeCustomerPayments({ patientId });
```

## Testes recomendados após credenciais
1. Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e `RESEND_API_KEY` via `supabase secrets set`.
2. Rode `supabase db push` para garantir que a view `vw_stripe_customer_payments` esteja publicada no ambiente atual.
3. Execute `SELECT * FROM vw_stripe_customer_payments LIMIT 10;` direto no SQL editor para validar permissões.
4. No front, chame `fetchStripeCustomerPayments()` e confirme que a resposta contém `stripe_status` e `stripe_customer_email`.

## Ajustando o schema
Se o wrapper expuser schema diferente (ex.: `stripe_wrapper`), edite a migration:
```sql
LEFT JOIN stripe_wrapper.payment_intents ...
```
e replique para demais referências.

