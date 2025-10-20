
import React from 'react';
import { CheckCircle, Star } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    price_monthly: number;
    price_yearly: number;
    features: string[];
    popular?: boolean;
}

interface PlanCardProps {
    plan: Plan;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
    return (
        <div className={`rounded-lg border-2 p-6 flex flex-col h-full transition-all duration-200 shadow-md hover:shadow-lg ${plan.popular ? 'border-blue-400 bg-white' : 'border-slate-200 bg-white'}`}>
             {plan.popular && (
                <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Star className="w-4 h-4 mr-2" /> Mais Popular
                    </span>
                </div>
            )}
            <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                 <div className="my-6">
                    <span className="text-4xl font-extrabold text-slate-900">R${plan.price_monthly.toFixed(2).replace('.', ',')}</span>
                    <span className="text-base font-medium text-slate-500">/mês</span>
                    <p className="text-sm text-slate-500 mt-1">ou R${plan.price_yearly.toFixed(2).replace('.', ',')} por ano</p>
                </div>
            </div>
            <ul className="space-y-3 text-slate-600 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button 
                className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-all duration-200 ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
                {plan.price_monthly === 0 ? 'Começar Gratuitamente' : 'Assinar Plano'}
            </button>
        </div>
    );
};

export default PlanCard;
