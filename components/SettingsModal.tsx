import React, { useState, useEffect } from 'react';
import { XCircleIcon, LightBulbIcon, UserCircleIcon, CrownIcon, Cog6ToothIcon } from './Icons';
import { getStoredApiKey, setStoredApiKey } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showDevSettings, setShowDevSettings] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKey();
      if (stored) setApiKey(stored);
      setIsSaved(false);
      // Se já tiver chave, não abre a aba dev automaticamente, a menos que queira
    }
  }, [isOpen]);

  const handleSave = () => {
    setStoredApiKey(apiKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleClear = () => {
      setApiKey('');
      setStoredApiKey('');
      setIsSaved(true);
       setTimeout(() => {
        onClose();
      }, 1000);
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-brand-dark rounded-2xl shadow-2xl border border-brand-gray p-6 transform transition-all">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-gray-light hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <XCircleIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <UserCircleIcon className="w-7 h-7 text-brand-primary" />
            Minha Conta
        </h2>
        
        {/* Seção Simulada de Perfil SaaS */}
        <div className="mb-6 bg-brand-gray/30 p-4 rounded-lg border border-brand-gray-light/10">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-gray rounded-full flex items-center justify-center text-brand-gray-light">
                    <UserCircleIcon className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-white font-semibold">Visitante</p>
                    <p className="text-sm text-brand-gray-light">Faça login para salvar dados</p>
                </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-brand-gray-light/10">
                <span className="text-sm text-brand-gray-light">Plano Atual:</span>
                <span className="text-xs font-bold bg-brand-gray-light/20 text-brand-gray-light px-2 py-1 rounded-full border border-brand-gray-light/20">
                    GRATUITO
                </span>
            </div>
            <button className="mt-4 w-full py-2 bg-brand-primary/10 text-brand-primary text-sm font-bold rounded hover:bg-brand-primary/20 transition-colors flex items-center justify-center gap-2">
                <CrownIcon className="w-4 h-4" />
                Fazer Upgrade para PRO
            </button>
        </div>

        <hr className="border-brand-gray mb-6" />

        {/* Seção Ocultável de Desenvolvedor (Chave API) */}
        <div className="space-y-4">
            <button 
                onClick={() => setShowDevSettings(!showDevSettings)}
                className="flex items-center gap-2 text-sm text-brand-gray-light hover:text-white w-full"
            >
                <Cog6ToothIcon className="w-4 h-4" />
                {showDevSettings ? 'Ocultar Configurações Avançadas' : 'Configurações Avançadas (Desenvolvedor)'}
            </button>

            {showDevSettings && (
                <div className="bg-brand-gray/20 p-4 rounded-lg border border-dashed border-brand-gray-light/30 animate-fade-in">
                    <label className="block text-xs font-medium text-brand-primary mb-2 uppercase tracking-wider">
                        Modo Sem Backend (B.Y.O.K)
                    </label>
                    <p className="text-xs text-brand-gray-light mb-3">
                        Como ainda não conectamos o Supabase, você precisa da sua chave pessoal para testar o app.
                    </p>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Cole sua API Key aqui..."
                        className="w-full bg-brand-dark text-white border border-brand-gray-light/30 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-primary transition-colors mb-3"
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className={`flex-1 text-sm font-bold py-2 px-3 rounded-lg transition-all duration-300 ${isSaved ? 'bg-status-green text-white' : 'bg-brand-gray text-white hover:bg-brand-gray-light/20'}`}
                        >
                            {isSaved ? 'Salvo!' : 'Salvar Chave'}
                        </button>
                         {getStoredApiKey() && (
                            <button
                                onClick={handleClear}
                                className="px-3 py-2 text-sm font-semibold text-red-400 hover:text-red-300 border border-red-900/50 rounded-lg hover:bg-red-900/20 transition-colors"
                            >
                                Limpar
                            </button>
                        )}
                    </div>
                     <div className="text-center mt-2">
                        <a 
                            href="https://aistudio.google.com/app/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-brand-gray-light hover:text-brand-primary underline"
                        >
                            Gerar chave no Google AI Studio
                        </a>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;