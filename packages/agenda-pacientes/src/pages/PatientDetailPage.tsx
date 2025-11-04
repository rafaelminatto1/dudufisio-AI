import React from 'react';
import { useParams } from 'react-router-dom';

const PatientDetailPage: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalhes do Paciente</h1>
      <p>ID: {id}</p>
      <p>Página de Detalhes do Paciente - Remote Microfrontend</p>
      {/* TODO: Import actual PatientDetailPage component from main codebase */}
    </div>
  );
};

export default PatientDetailPage;

