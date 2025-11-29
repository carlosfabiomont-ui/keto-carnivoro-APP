

import React, { useState, useCallback, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import DietSelector from './components/DietSelector';
import ResultsDashboard from './components/ResultsDashboard';
import { SparklesIcon, Cog6ToothIcon, UserCircleIcon } from './components/Icons';
import { analyzeMeal, getStoredApiKey } from './services/geminiService';
import type { DietType, StrictnessLevel, AnalysisResult } from './types';
import Footer from './components/Footer';
import { Logo } from './components/Logo';
import UpgradeModal from './components/UpgradeModal';
import MenuAssistant from './components/MenuAssistant';
import SettingsModal from './components/SettingsModal';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

const DAILY_LIMIT_GUEST = 3; // Limite maior para visitantes para incentivar o cadastro

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [diet, setDiet] = useState<DietType>('carnivore');
  const [strictness, setStrictness] = useState<StrictnessLevel>('strict');
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [credits, setCredits] = useState<number | null>(null); // Null = carregando ou não checado
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Auth State
  const [session, setSession] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // 1. Gerenciar Sessão e Carregar Perfil
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
        // Verificar sessão atual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) fetchUserProfile(session.user.id);
        });

        // Ouvir mudanças de auth (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setUserProfile(null);
                setCredits(loadGuestCredits()); // Volta para créditos de visitante
            }
        });

        return () => subscription.unsubscribe();
    } else {
        // Fallback para modo sem Supabase (apenas local)
        setCredits(loadGuestCredits());
    }
  }, []);

  // Função auxiliar para carregar créditos de visitante do LocalStorage
  const loadGuestCredits = () => {
      try {
        const storedUsage = localStorage.getItem('ketoCarnivoraUsage');
        const today = getTodayDateString();
        if (storedUsage) {
            const usage = JSON.parse(storedUsage);
            // Se for outro dia, reseta. Se for hoje, calcula restantes.
            if (usage.date !== today) {
                 localStorage.setItem('ketoCarnivoraUsage', JSON.stringify({ count: 0, date: today }));
                 return DAILY_LIMIT_GUEST;
            }
            return Math.max(0, DAILY_LIMIT_GUEST - usage.count);
        }
        localStorage.setItem('ketoCarnivoraUsage', JSON.stringify({ count: 0, date: today }));
        return DAILY_LIMIT_GUEST;
      } catch {
          return DAILY_LIMIT_GUEST;
      }
  };

  const fetchUserProfile = async (userId: string) => {
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
          console.error("Erro ao buscar perfil:", error);
      } else {
          setUserProfile(data);
          // Se for PRO, créditos são infinitos (ex: 9999). Se não, usa o do banco.
          setCredits(data.is_pro ? 9999 : (data.credits || 0));
      }
  };

  const handleLogin = async () => {
      if (!isSupabaseConfigured() || !supabase) {
          alert("Erro de configuração do Supabase.");
          return;
      }

      setIsLoggingIn(true);
      try {
          // Login com Google
          const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                  redirectTo: window.location.origin
              }
          });
          if (error) throw error;
      } catch (err) {
          alert("Erro ao abrir login do Google. Verifique se o Google Provider está ativado no Supabase.");
          console.error(err);
          setIsLoggingIn(false);
      }
  };

  const handleLogout = async () => {
      if (supabase) {
          await supabase.auth.signOut();
          setSession(null);
          setUserProfile(null);
          setCredits(loadGuestCredits());
      }
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setAnalysisResult(null);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
        if (e.target?.result) {
            setImageUrl(e.target.result as string);
        }
    };
    reader.readAsDataURL(file);
  };

  const decrementCredits = async () => {
      // 1. Se for Visitante
      if (!session) {
          const storedUsage = localStorage.getItem('ketoCarnivoraUsage');
          const currentUsage = storedUsage ? JSON.parse(storedUsage).count : 0;
          const newUsage = currentUsage + 1;
          localStorage.setItem('ketoCarnivoraUsage', JSON.stringify({ count: newUsage, date: getTodayDateString() }));
          setCredits(prev => (prev ? prev - 1 : 0));
          return;
      }

      // 2. Se for Usuário Logado (e não for PRO ilimitado)
      if (session && userProfile && !userProfile.is_pro && supabase) {
          const newCredits = (credits || 0) - 1;
          setCredits(newCredits); // Atualiza UI otimista

          // Atualiza no Banco
          const { error } = await supabase
            .from('profiles')
            .update({ credits: newCredits })
            .eq('id', session.user.id);
            
          if (error) console.error("Erro ao descontar crédito:", error);
      }
  };

  const handleAnalyze = useCallback(async () => {
    // 1. Verifica se está logado OU tem chave local
    const hasLocalKey = !!getStoredApiKey();
    if (!session && !hasLocalKey) {
        setError("🔒 Login Necessário\n\nPara usar nossa IA avançada via servidor, por favor faça login com o Google (botão no topo). É grátis e seguro.");
        return;
    }

    // 2. Verifica se tem créditos
    if (credits !== null && credits <= 0) {
        setShowUpgradeModal(true);
        return;
    }

    if (!imageFile) {
      setError("Por favor, carregue uma imagem primeiro.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeMeal(imageFile, diet, strictness);
      
      // Sucesso! Descontar crédito
      await decrementCredits();

      setAnalysisResult(result);

    } catch (err) {
        if (err instanceof Error) {
            // Se ainda assim der erro de chave (muito raro agora), abre configurações
            if (err.message === "API_KEY_MISSING") {
                setError(null);
                setShowSettingsModal(true);
                return;
            }
            // Exibe mensagem de erro limpa vinda do servidor ou local
            setError(err.message);
        } else {
            setError("Ocorreu um erro desconhecido.");
        }
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, diet, strictness, credits, session, userProfile]);
  
  const handleReset = useCallback(() => {
    setImageFile(null);
    setImageUrl(null);
    setAnalysisResult(null);
    setError(null);
  }, []);

  const LoadingSkeleton = () => (
    <div className="w-full bg-brand-gray/50 rounded-lg p-6 space-y-6 animate-pulse">
        <div className="flex justify-between items-start">
            <div className="h-8 bg-brand-gray-light/30 rounded w-1/3"></div>
            <div className="h-8 bg-brand-gray-light/30 rounded-full w-32"></div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <div className="h-40 bg-brand-gray-light/30 rounded-lg"></div>
                <div className="h-24 bg-brand-gray-light/30 rounded-lg"></div>
            </div>
            <div className="space-y-6">
                <div className="h-24 bg-brand-gray-light/30 rounded-lg"></div>
                <div className="h-40 bg-brand-gray-light/30 rounded-lg"></div>
            </div>
        </div>
    </div>
);

  return (
    <div className="min-h-screen bg-brand-dark font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 relative">
      
      {/* Header Controls */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10 flex items-center gap-3">
          {session ? (
            <div className="hidden sm:flex flex-col items-end mr-2">
                 <span className="text-xs text-brand-gray-light">Olá, {session.user.user_metadata.name || session.user.email}</span>
                 {userProfile?.is_pro ? (
                     <span className="text-xs font-bold text-brand-primary flex items-center gap-1"><span className="text-[10px]">👑</span> MEMBRO PRO</span>
                 ) : (
                     <span className="text-xs font-bold text-brand-light">Créditos: {credits}</span>
                 )}
            </div>
          ) : (
            <div className="hidden sm:flex px-3 py-1 bg-brand-gray border border-brand-gray-light/20 rounded-full text-xs font-semibold text-brand-gray-light">
                Visitante (Limite: {credits})
            </div>
          )}
          
          {session ? (
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-2 bg-brand-gray py-2 px-3 rounded-full text-brand-gray-light hover:text-white hover:bg-brand-gray/80 transition-all border border-brand-primary/30"
                aria-label="Minha Conta"
              >
                <img 
                    src={session.user.user_metadata.avatar_url || "https://cdn-icons-png.flaticon.com/512/847/847969.png"} 
                    alt="User" 
                    className="w-6 h-6 rounded-full"
                />
              </button>
          ) : (
            <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/50 py-2 px-3 rounded-full text-brand-primary hover:bg-brand-primary hover:text-brand-dark transition-all"
                aria-label="Login"
            >
                {isLoggingIn ? (
                     <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <UserCircleIcon className="w-6 h-6" />
                )}
                <span className="hidden sm:inline text-sm font-bold">Entrar com Google</span>
            </button>
          )}

          <button 
            onClick={() => setShowSettingsModal(true)}
            className="bg-brand-gray p-2 rounded-full text-brand-gray-light hover:text-white hover:bg-brand-gray/80 transition-all"
            aria-label="Configurações"
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </button>
      </div>

      <main className="w-full max-w-6xl mx-auto space-y-8 flex-grow">
        <header className="text-center flex flex-col items-center pt-4">
            <Logo className="w-16 h-auto text-brand-primary mb-2" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-light">
                Keto Carnivora AI
            </h1>
            <p className="mt-2 text-lg text-brand-gray-light max-w-2xl mx-auto">
                Fotografe sua refeição, escolha sua dieta e receba uma análise nutricional instantânea.
            </p>
        </header>

        <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 bg-brand-gray/50 p-6 rounded-xl shadow-lg border border-brand-gray">
                <div className="space-y-6">
                    <ImageUploader onImageSelect={handleImageSelect} imageUrl={imageUrl} />
                    <DietSelector 
                        diet={diet}
                        setDiet={setDiet}
                        strictness={strictness}
                        setStrictness={setStrictness}
                    />
                    <div className="space-y-3">
                         <div className="text-center text-sm text-brand-gray-light">
                            {userProfile?.is_pro ? (
                                <span className="text-brand-primary font-bold">Análises ILIMITADAS</span>
                            ) : (
                                <>Análises restantes: <span className="font-bold text-white">{credits !== null ? credits : '...'}</span></>
                            )}
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={!imageFile || isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-brand-primary text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary transition-colors duration-300 disabled:bg-brand-gray disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analisando...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5"/>
                                    Analisar Refeição
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="lg:col-span-3">
                 {isLoading && <LoadingSkeleton />}
                 
                 {/* Mensagem de Erro mais visível */}
                 {error && (
                    <div className="bg-brand-gray/50 text-white p-6 rounded-xl border border-brand-gray-light/20 flex flex-col items-center text-center animate-fade-in">
                        <span className="text-3xl mb-2">🤔</span>
                        <div className="whitespace-pre-wrap font-medium">{error}</div>
                    </div>
                 )}
                 
                 {analysisResult && <ResultsDashboard result={analysisResult} onReset={handleReset} />}
                 
                 {!isLoading && !analysisResult && !error && (
                    <MenuAssistant 
                        diet={diet} 
                        strictness={strictness}
                        userProfile={userProfile}
                        onUpgrade={() => setShowUpgradeModal(true)}
                    />
                 )}
            </div>
        </div>
      </main>
      <Footer />
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)}
        session={session}
        userProfile={userProfile}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default App;