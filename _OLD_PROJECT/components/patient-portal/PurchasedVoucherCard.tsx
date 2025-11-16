// components/patient-portal/PurchasedVoucherCard.tsx
import React from 'react';
import { Voucher } from '../../types';
import { Calendar, CheckCircle } from 'lucide-react';

interface PurchasedVoucherCardProps {
    voucher: Voucher;
}

const PurchasedVoucherCard: React.FC<PurchasedVoucherCardProps> = ({ voucher }) => {
    const { plan, remainingCredits, status, expiryDate } = voucher;
    const progressPercentage = (remainingCredits / plan.credits) * 100;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg border-l-4 border-blue-500 transition-all duration-200">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-600">{plan.description}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${
                    status === 'activated' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                    {status === 'activated' ? 'Ativo' : status}
                </span>
            </div>
            
            <div className="my-6">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-700">Créditos Restantes</span>
                    <span className="text-sm font-bold text-blue-600">{remainingCredits} / {plan.credits}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm text-slate-600 border-t border-slate-200 pt-4">
                 <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                    <span>Validade: {new Date(expiryDate).toLocaleDateString('pt-BR')}</span>
                 </div>
                 <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-slate-500" />
                    <span>Ativado em: {new Date(voucher.activationDate!).toLocaleDateString('pt-BR')}</span>
                 </div>
            </div>
        </div>
    );
};

export default PurchasedVoucherCard;
