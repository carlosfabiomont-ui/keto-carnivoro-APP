import React from 'react';
import type { AnalysisResult, Macros, DetectedItem } from '../types';
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, LightBulbIcon, SparklesIcon, XCircleIcon, ShoppingCartIcon } from './Icons';

const CompatibilityBadge: React.FC<{ compatibility: AnalysisResult['compatibilidade'] }> = ({ compatibility }) => {
  const config = {
    sim: { text: 'Compatível', color: 'bg-status-green', icon: <CheckCircleIcon className="w-5 h-5" /> },
    parcial: { text: 'Parcialmente Compatível', color: 'bg-status-yellow', icon: <ExclamationCircleIcon className="w-5 h-5" /> },
    não: { text: 'Incompatível', color: 'bg-status-red', icon: <XCircleIcon className="w-5 h-5" /> },
  };
  const current = config[compatibility];
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-bold ${current.color}`}>
      {current.icon}
      <span>{current.text}</span>
    </div>
  );
};

const MacroBar: React.FC<{ label: string; value: number; color: string; max: number }> = ({ label, value, color, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-brand-gray-light">{label}</span>
                <span className="text-sm font-bold text-white">{value.toFixed(1)}g</span>
            </div>
            <div className="w-full bg-brand-gray rounded-full h-2.5">
                <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


const MacroChart: React.FC<{ macros: Macros }> = ({ macros }) => {
    const totalMacros = macros.proteina + macros.gordura + macros.carboidratos;
    const maxForPercentage = totalMacros > 0 ? totalMacros : 1;

    return (
        <div className="space-y-4">
            <MacroBar label="Proteína" value={macros.proteina} color="bg-sky-400" max={maxForPercentage} />
            <MacroBar label="Gordura" value={macros.gordura} color="bg-brand-primary" max={maxForPercentage} />
            <MacroBar label="Gordura Saturada" value={macros.gordura_saturada} color="bg-brand-secondary" max={macros.gordura > 0 ? macros.gordura : 1} />
            <MacroBar label="Carboidratos" value={macros.carboidratos} color="bg-brand-accent" max={maxForPercentage} />
        </div>
    );
};

const DetectedItemsList: React.FC<{ items: DetectedItem[] }> = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item, index) => (
      <li key={index} className="flex items-center justify-between bg-brand-gray p-3 rounded-lg">
        <span className="text-white font-medium">{item.item}</span>
        {item.compativel ? 
          <CheckCircleIcon className="w-5 h-5 text-green-500" /> : 
          <XCircleIcon className="w-5 h-5 text-red-500" />}
      </li>
    ))}
  </ul>
);

// MOCK PRODUCTS FOR AFFILIATE SECTION
const RECOMMENDED_PRODUCTS = [
    {
        id: 1,
        name: "Sal de Parrilla Argentino",
        description: "Essencial para carnes.",
        price: "R$ 25,90",
        image: "https://images.unsplash.com/photo-1626139576127-9a9fa5cb5482?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
        id: 2,
        name: "Óleo MCT 100% Puro",
        description: "Energia instantânea Cetogênica.",
        price: "R$ 89,90",
        image: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
        id: 3,
        name: "Monitor de Cetose",
        description: "Meça seus níveis em casa.",
        price: "R$ 149,00",
        image: "https://images.unsplash.com/photo-1576091160550-2187d37dc6d9?auto=format&fit=crop&q=80&w=200&h=200"
    }
];

const AffiliateProductCard: React.FC<{ product: typeof RECOMMENDED_PRODUCTS[0] }> = ({ product }) => (
    <div className="bg-brand-gray rounded-lg overflow-hidden border border-brand-gray-light/10 hover:border-brand-primary/50 transition-colors group">
        <div className="h-32 overflow-hidden relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-3">
            <h4 className="text-white font-bold text-sm truncate">{product.name}</h4>
            <p className="text-xs text-brand-gray-light mt-1 mb-2">{product.description}</p>
            <div className="flex justify-between items-center">
                <span className="text-brand-primary font-bold text-sm">{product.price}</span>
                <button className="bg-brand-light/10 hover:bg-brand-light/20 text-brand-light p-1.5 rounded-md transition-colors">
                    <ShoppingCartIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);

interface ResultsDashboardProps {
    result: AnalysisResult;
    onReset: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onReset }) => {
  return (
    <div className="w-full bg-brand-dark rounded-lg p-6 space-y-6 animate-fade-in border border-brand-gray">
        <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-white">Análise da Refeição</h2>
            <CompatibilityBadge compatibility={result.compatibilidade} />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-brand-primary"/> Resumo Nutricional</h3>
                    <div className="bg-brand-gray p-4 rounded-lg">
                       <MacroChart macros={result.macros_estimados} />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><LightBulbIcon className="w-5 h-5 text-brand-primary"/> Recomendações</h3>
                    <ul className="list-disc list-inside space-y-2 text-brand-gray-light pl-2">
                        {result.ajustes_recomendados.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Itens Detectados</h3>
                    <DetectedItemsList items={result.itens_detectados} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Explicação do Assistente</h3>
                    <p className="text-brand-gray-light bg-brand-gray p-4 rounded-lg whitespace-pre-wrap">{result.explicacao}</p>
                </div>
            </div>
        </div>

        {/* Affiliate / Recommendation Section */}
        <div className="border-t border-brand-gray pt-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ShoppingCartIcon className="w-5 h-5 text-brand-primary"/> 
                Melhore sua dieta com estes itens
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {RECOMMENDED_PRODUCTS.map(product => (
                    <AffiliateProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>

        <div className="border-t border-brand-gray pt-6 flex justify-center">
            <button
                onClick={onReset}
                className="flex items-center justify-center gap-2 bg-brand-primary text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-brand-secondary transition-colors duration-300"
            >
                <ArrowPathIcon className="w-5 h-5" />
                Analisar Nova Refeição
            </button>
        </div>
    </div>
  );
};

export default ResultsDashboard;