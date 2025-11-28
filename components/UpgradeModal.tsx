import React, { useState } from 'react';
import { CrownIcon, SparklesIcon, XCircleIcon, CheckCircleIcon } from './Icons';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async (planId: string) => {
      setIsLoading(true);
      
      // LÓGICA FUTURA:
      // 1. Chamar uma Edge Function no Supabase passando o `planId`.
      // 2. A Edge Function cria uma sessão de checkout no Stripe.
      // 3. A função retorna a URL de checkout do Stripe.
      // 4. Redirecionar o usuário para a URL: window.location.href = checkoutUrl;
      
      // Simulação:
      console.log(`Iniciando checkout para o plano: ${planId}`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula chamada de rede
      alert(`Integração com Stripe para o plano "${planId}" será acionada aqui.`);

      setIsLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl m-4 bg-brand-dark rounded-2xl shadow-2xl border border-brand-gray-light/20 p-8 text-center overflow-y-auto max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-gray-light hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <XCircleIcon className="w-8 h-8" />
        </button>

        <div className="inline-block p-3 bg-brand-primary/10 rounded-full mb-4">
             <CrownIcon className="w-10 h-10 text-brand-primary" />
        </div>
        
        <h2 id="modal-title" className="text-3xl font-extrabold text-white">
          Escolha o Plano Ideal para Você
        </h2>
        <p className="mt-2 text-lg text-brand-gray-light max-w-2xl mx-auto">
          Seu limite foi atingido. Continue sua jornada com mais análises ou torne-se PRO para acesso ilimitado.
        </p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan 1: Credit Pack */}
          <div className="bg-brand-gray/20 border border-brand-gray rounded-xl p-6 flex flex-col hover:border-brand-gray-light/50 transition-colors">
            <h3 className="text-xl font-bold text-white">Pacote de Créditos</h3>
            <p className="text-sm text-brand-gray-light mt-1">Ideal para uso esporádico</p>
            <div className="my-4">
              <span className="text-4xl font-bold text-white">R$19,90</span>
              <span className="text-brand-gray-light"> /pagamento único</span>
            </div>
            <ul className="text-left space-y-3 mb-6 flex-grow">
                <li className="flex items-center gap-2 text-sm text-brand-light"><CheckCircleIcon className="w-4 h-4 text-brand-primary"/> 15 Análises de Foto</li>
                <li className="flex items-center gap-2 text-sm text-brand-gray-light"><XCircleIcon className="w-4 h-4 text-brand-gray"/> Assistente de Cardápio</li>
            </ul>
            <button disabled={isLoading} onClick={() => handleSubscribe('credit_pack')} className="w-full bg-brand-light text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50">
              {isLoading ? 'Aguarde...' : 'Comprar Créditos'}
            </button>
          </div>

          {/* Plan 2: Monthly PRO */}
          <div className="relative bg-brand-gray/40 border-2 border-brand-primary rounded-xl p-6 flex flex-col shadow-[0_0_30px_rgba(217,164,14,0.15)] transform scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-brand-dark text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                MAIS POPULAR
            </div>
            <h3 className="text-xl font-bold text-brand-primary">PRO Mensal</h3>
            <p className="text-sm text-brand-gray-light mt-1">Acesso total, sem limites</p>
            <div className="my-4">
              <span className="text-4xl font-bold text-white">R$29,90</span>
              <span className="text-brand-gray-light">/mês</span>
            </div>
             <ul className="text-left space-y-3 mb-6 flex-grow">
                <li className="flex items-center gap-2 text-sm text-white font-medium"><CheckCircleIcon className="w-4 h-4 text-brand-primary"/> Análises de Foto Ilimitadas</li>
                <li className="flex items-center gap-2 text-sm text-white font-medium"><SparklesIcon className="w-4 h-4 text-brand-primary"/> Assistente de Cardápio</li>
                <li className="flex items-center gap-2 text-sm text-white font-medium"><CheckCircleIcon className="w-4 h-4 text-brand-primary"/> Histórico Completo</li>
            </ul>
            <button disabled={isLoading} onClick={() => handleSubscribe('pro_monthly')} className="w-full bg-brand-primary text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary transition-colors shadow-lg disabled:opacity-50">
              {isLoading ? 'Aguarde...' : 'Assinar Mensal'}
            </button>
          </div>

          {/* Plan 3: Annual PRO */}
          <div className="bg-brand-gray/20 border border-brand-gray rounded-xl p-6 flex flex-col hover:border-brand-gray-light/50 transition-colors">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-secondary text-brand-dark text-xs font-bold px-3 py-1 rounded-full hidden">ECONOMIZE</div>
            <h3 className="text-xl font-bold text-white">PRO Anual</h3>
            <p className="text-sm text-brand-gray-light mt-1">2 meses grátis</p>
            <div className="my-4">
              <span className="text-4xl font-bold text-white">R$290</span>
              <span className="text-brand-gray-light">/ano</span>
            </div>
            <ul className="text-left space-y-3 mb-6 flex-grow">
                <li className="flex items-center gap-2 text-sm text-brand-light"><CheckCircleIcon className="w-4 h-4 text-brand-primary"/> Tudo do plano PRO Mensal</li>
                <li className="flex items-center gap-2 text-sm text-brand-light"><CheckCircleIcon className="w-4 h-4 text-brand-primary"/> Suporte Prioritário</li>
            </ul>
            <button disabled={isLoading} onClick={() => handleSubscribe('pro_annual')} className="w-full bg-brand-light text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50">
              {isLoading ? 'Aguarde...' : 'Assinar Anual'}
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-brand-gray-light">
          Pagamento único e seguro via Stripe. Assinaturas podem ser canceladas a qualquer momento.
        </p>
      </div>
    </div>
  );
};

export default UpgradeModal;