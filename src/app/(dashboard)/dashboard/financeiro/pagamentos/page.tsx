import { PaymentForm } from '~/components/features/financial/PaymentForm';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Pagamentos</h1>
        <p className="text-muted-foreground">
          Registre receitas e despesas da clínica
        </p>
      </div>
      <PaymentForm />
    </div>
  );
}

