import React from 'react';
import { CrownIcon, SparklesIcon, XCircleIcon, CheckCircleIcon } from './Icons';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSubscribe = () => {
      alert("Integração com Stripe (Checkout) será acionada aqui. O usuário será redirecionado para pagamento seguro.");
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl m-4 bg-brand-dark rounded-2xl shadow-2xl border border-brand-gray-light/20 p-8 text-center overflow-y-auto max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-gray-light hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <XCircleIcon className="w-8 h-8" />
        </button>

        <div className="inline-block p-3 bg-brand-primary/10 rounded-full mb-4">
             <SparklesIcon className="w-10 h-10 text-brand-primary" />
        </div>
        
        <h2 id="modal-title" className="text-3xl font-extrabold text-white">
          Desbloqueie o Poder Total
        </h2>
        <p className="mt-2 text-lg text-brand-gray-light max-w-xl mx-auto">
          Seu limite diário gratuito foi atingido. Torne-se PRO para manter o foco na dieta sem interrupções.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Plan */}
          <div className="bg-brand-gray/20 border border-brand-gray rounded-xl p-6 flex flex-col hover:border-brand-primary/50 transition-colors">
            <h3 className="text-xl font-bold text-white">Mensal</h3>
            <div className="my-4">
              <span className="text-4xl font-bold text-white">R$29,90</span>
              <span className="text-brand-gray-light">/mês</span>
            </div>
            <ul className="text-left space-y-3 mb-6 flex-grow">
                <li className="flex items-center gap-2 text-sm text-brand-light"><CheckCircleIcon className="w-4 h-4 text-brand-primary"/> Análises Ilimitadas</li>
                <li className="flex items-center gap-2 text-sm text-brand-light"><CheckCircleIcon className="w-4 h-4 text-brand-primary"/> Histórico de Refeições</li>
                <li className="flex items-center gap-2 text-sm text-brand-light"><CheckCircleIcon className="w-4 h-4 text-brand-primary"/> Sem Anúncios</li>
            </ul>
            <button onClick={handleSubscribe} className="w-full bg-brand-light text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-white/90 transition-colors">
              Assinar Mensal
            </button>
          </div>

          {/* PRO (Annual) Plan */}
          <div className="relative bg-brand-gray/40 border-2 border-brand-primary rounded-xl p-6 flex flex-col shadow-[0_0_30px_rgba(217,164,14,0.15)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-brand-dark text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <CrownIcon className="w-3 h-3" />
                ECONOMIZE 20%
            </div>
            <h3 className="text-xl font-bold text-brand-primary">Anual PRO</h3>
            <div className="my-4">
              <span className="text-4xl font-bold text-white">R$290</span>
              <span className="text-brand-gray-light">/ano</span>
            </div>
             <ul className="text-left space-y-3 mb-6 flex-grow">
                <li className="flex items-center gap-2 text-sm text-white font-medium"><CheckCircleIcon className="w-4 h-4 text-brand-primary"/> Tudo do plano mensal</li>
                <li className="flex items-center gap-2 text-sm text-white font-medium"><CheckCircleIcon className="w-4 h-4 text-brand-primary"/> Acesso Antecipado a Recursos</li>
                <li className="flex items-center gap-2 text-sm text-white font-medium"><CheckCircleIcon className="w-4 h-4 text-brand-primary"/> Suporte Prioritário</li>
            </ul>
            <button onClick={handleSubscribe} className="w-full bg-brand-primary text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary transition-colors shadow-lg">
              Assinar Anual
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-brand-gray-light">
          Pagamento seguro via Stripe. Cancele quando quiser nas configurações.
        </p>
      </div>
    </div>
  );
};

export default UpgradeModal;