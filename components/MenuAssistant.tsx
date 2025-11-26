import React, { useState, useCallback } from 'react';
import type { DietType, StrictnessLevel, ProteinType } from '../types';
import { generateMenuSuggestion } from '../services/geminiService';
import { SparklesIcon } from './Icons';

interface MenuAssistantProps {
    diet: DietType;
    strictness: StrictnessLevel;
}

const proteinOptions: { value: ProteinType, label: string, emoji: string }[] = [
    { value: 'carne', label: 'Carne', emoji: '🥩' },
    { value: 'frango', label: 'Frango', emoji: '🍗' },
    { value: 'porco', label: 'Porco', emoji: '🥓' },
    { value: 'peixe', label: 'Peixe', emoji: '🐟' },
];

const MenuAssistant: React.FC<MenuAssistantProps> = ({ diet, strictness }) => {
    const [selectedProtein, setSelectedProtein] = useState<ProteinType | null>(null);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!selectedProtein) {
            setError("Por favor, escolha um tipo de proteína.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuggestion(null);

        try {
            const result = await generateMenuSuggestion(selectedProtein, diet, strictness);
            setSuggestion(result);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocorreu um erro desconhecido.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [selectedProtein, diet, strictness]);

    return (
        <div className="w-full bg-brand-gray/50 p-6 rounded-xl border border-brand-gray text-center animate-fade-in">
            <SparklesIcon className="w-16 h-16 text-brand-primary opacity-50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white">Assistente de Cardápio</h2>
            <p className="text-brand-gray-light mb-6">Sem ideias? Deixe a IA criar uma sugestão para você com base na sua dieta.</p>
            
            <div className="mb-4">
                <p className="text-sm font-medium text-brand-gray-light mb-2">Selecione a proteína principal:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {proteinOptions.map(p => (
                        <button
                            key={p.value}
                            onClick={() => setSelectedProtein(p.value)}
                            className={`p-3 rounded-lg border-2 transition-colors duration-200 ${selectedProtein === p.value ? 'bg-brand-primary/20 border-brand-primary' : 'bg-brand-gray border-transparent hover:border-brand-secondary'}`}
                        >
                            <span className="text-2xl">{p.emoji}</span>
                            <span className="block text-sm font-semibold text-brand-light mt-1">{p.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={!selectedProtein || isLoading}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary transition-colors duration-300 disabled:bg-brand-gray disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Gerando...
                    </>
                ) : (
                    <>
                        <SparklesIcon className="w-5 h-5"/>
                        Gerar Sugestão
                    </>
                )}
            </button>

            {error && <div className="mt-4 bg-red-900/50 text-red-300 p-3 rounded-lg border border-red-700 text-sm">{error}</div>}
            
            {suggestion && (
                <div className="mt-6 text-left bg-brand-gray p-4 rounded-lg animate-fade-in">
                    <h3 className="text-lg font-semibold text-white mb-2">Aqui está sua sugestão:</h3>
                    <div className="text-brand-gray-light whitespace-pre-wrap">{suggestion}</div>
                </div>
            )}
        </div>
    );
};

export default MenuAssistant;