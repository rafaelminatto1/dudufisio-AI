import { ClinicalMaterialsLibrary } from '~/components/features/clinical-materials/ClinicalMaterialsLibrary';

export default function ClinicalMaterialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Materiais Clínicos</h1>
        <p className="text-muted-foreground">
          Fichas, escalas e formulários clínicos
        </p>
      </div>
      <ClinicalMaterialsLibrary />
    </div>
  );
}

