import React, { useState } from 'react';
import { CrownIcon, SparklesIcon, XCircleIcon, CheckCircleIcon } from './Icons';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabaseClient';


interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ================================================================================= //
// ================================================================================= //
//                                                                                 //
//   👇👇👇   COLE SEUS IDs DE PREÇO DO STRIPE AQUI DENTRO DAS ASPAS   👇👇👇   //
//                                                                                 //
// ================================================================================= //
//  1. Vá no seu painel do Stripe -> Produtos.                                      //
//  2. Clique em cada produto que você criou.                                       //
//  3. Na seção "Preços", clique nos 3 pontinhos (...) e "Copiar ID".               //
//  4. O ID começa com "price_...".                                                 //
// ================================================================================= //

const CREDIT_PACK_PRICE_ID = "SEU_ID_DE_PRECO_PACOTE_CREDITOS"; // Ex: price_1P...
const PRO_MONTHLY_PRICE_ID = "SEU_ID_DE_PRECO_PRO_MENSAL";       // Ex: price_1P...
const PRO_ANNUAL_PRICE_ID  = "SEU_ID_DE_PRECO_PRO_ANUAL";        // Ex: price_1P...


const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async (planId: string, planName: string) => {
      if (!supabase) {
          setError("Erro de configuração do cliente Supabase.");
          return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
          setError("Por favor, faça login para assinar um plano.");
          return;
      }

      setIsLoading(true);
      setLoadingPlan(planName);
      setError(null);

      try {
          const functionUrl = `${SUPABASE_URL}/functions/v1/create-checkout-session`;
          
          const response = await fetch(functionUrl, {
              method: 'POST',
              mode: 'cors',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`,
                  'apikey': SUPABASE_ANON_KEY
              },
              body: JSON.stringify({ planId })
          });

          if (!response.ok) {
              const errText = await response.text();
              throw new Error(`Erro do Servidor (${response.status}): ${errText}`);
          }

          const data = await response.json();

          if (data.url) {
              window.location.href = data.url; // Redireciona para o checkout do Stripe
          } else {
              throw new Error("URL de checkout não foi recebida do servidor.");
          }

      } catch (err) {
          if (err instanceof Error) {
            setError(`Falha ao iniciar pagamento: ${err.message}`);
          } else {
            setError("Ocorreu um erro desconhecido.");
          }
          setIsLoading(false);
          setLoadingPlan(null);
      }
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

        {error && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-300 text-sm border border-red-700 rounded-lg">
                {error}
            </div>
        )}

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
            <button disabled={isLoading} onClick={() => handleSubscribe(CREDIT_PACK_PRICE_ID, 'credits')} className="w-full bg-brand-light text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50">
              {isLoading && loadingPlan === 'credits' ? 'Aguarde...' : 'Comprar Créditos'}
            </button>
          </div>

          {/* Plan 2: Monthly PRO */}
          <div className="relative bg-brand-gray/40 border-2 border-brand-primary rounded-xl p-6 flex flex-col shadow-[0_0_30px_rgba(217,164,14,0.15)] lg:scale-105">
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
            <button disabled={isLoading} onClick={() => handleSubscribe(PRO_MONTHLY_PRICE_ID, 'monthly')} className="w-full bg-brand-primary text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary transition-colors shadow-lg disabled:opacity-50">
              {isLoading && loadingPlan === 'monthly' ? 'Aguarde...' : 'Assinar Mensal'}
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
            <button disabled={isLoading} onClick={() => handleSubscribe(PRO_ANNUAL_PRICE_ID, 'annual')} className="w-full bg-brand-light text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50">
              {isLoading && loadingPlan === 'annual' ? 'Aguarde...' : 'Assinar Anual'}
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