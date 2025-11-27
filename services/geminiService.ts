
import { GoogleGenAI, Type } from '@google/genai';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabaseClient';
import type { DietType, StrictnessLevel, AnalysisResult, ProteinType } from '../types';

const DIET_CONFIG = {
  carnivore: {
    name: 'Carnívora',
    strictness: {
      strict: {
        name: 'Estrita',
        description: 'Apenas alimentos de origem animal são permitidos. Qualquer vegetal, grão ou açúcar torna a refeição incompatível.',
      },
      permissive: {
        name: 'Permissiva',
        description: 'Principalmente alimentos de origem animal. Pequenas quantidades de temperos, ervas ou café são aceitáveis, mas carboidratos significativos não são.',
      },
    },
  },
  ketogenic: {
    name: 'Cetogênica',
    strictness: {
      very_low: {
        name: 'Muito Baixa em Carboidratos',
        description: 'O objetivo é manter os carboidratos líquidos extremamente baixos, idealmente abaixo de 10-20g por refeição. Alimentos como batatas, arroz, pão e frutas açucaradas são incompatíveis.',
      },
      moderate: {
        name: 'Moderada em Carboidratos',
        description: 'Permite um pouco mais de flexibilidade, com um limite de carboidratos líquidos de até 20-50g por refeição. Ainda assim, grãos, açúcares e tubérculos devem ser evitados.',
      },
    },
  },
};

let ai: GoogleGenAI | null = null;
const API_KEY_STORAGE_KEY = 'keto_carnivora_api_key';

export function getStoredApiKey(): string | null {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setStoredApiKey(key: string) {
    if (!key) {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
    } else {
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
    }
    ai = null; // Force re-initialization
}

function getGoogleGenAI(apiKey: string) {
    if (ai) {
        return ai;
    }
    ai = new GoogleGenAI({ apiKey });
    return ai;
}

const responseSchema = {
    type: Type.OBJECT,
    properties: {
      compatibilidade: { type: Type.STRING, description: "Avaliação da compatibilidade. Deve ser 'sim', 'não', ou 'parcial'." },
      macros_estimados: {
        type: Type.OBJECT,
        properties: {
          proteina: { type: Type.NUMBER, description: 'Quantidade de proteína em gramas.' },
          gordura: { type: Type.NUMBER, description: 'Quantidade de gordura total em gramas.' },
          gordura_saturada: { type: Type.NUMBER, description: 'Quantidade de gordura saturada em gramas.' },
          carboidratos: { type: Type.NUMBER, description: 'Quantidade de carboidratos em gramas.' },
        },
        required: ['proteina', 'gordura', 'gordura_saturada', 'carboidratos'],
      },
      itens_detectados: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING, description: 'O nome do item alimentar detectado.' },
            compativel: { type: Type.BOOLEAN, description: 'Se o item é compatível com a dieta.' },
          },
          required: ['item', 'compativel'],
        },
      },
      ajustes_recomendados: {
        type: Type.ARRAY,
        items: { type: Type.STRING, description: 'Uma recomendação para ajustar a refeição.' },
      },
      explicacao: { type: Type.STRING, description: 'Uma explicação geral da análise, incluindo o aviso legal.' },
    },
    required: ['compatibilidade', 'macros_estimados', 'itens_detectados', 'ajustes_recomendados', 'explicacao'],
  };


function generatePrompt(diet: DietType, strictness: StrictnessLevel): string {
    const dietConfig = DIET_CONFIG[diet];
    const strictnessConfig = (dietConfig.strictness as any)[strictness];

    return `
      Você é um assistente nutricional especialista em dietas Cetogênica e Carnívora. Sua tarefa é analisar a imagem de uma refeição e fornecer uma avaliação detalhada.

      **Contexto da Análise:**
      - **Dieta Selecionada:** ${dietConfig.name}
      - **Nível de Rigor:** ${strictnessConfig.name}
      - **Regras:** ${strictnessConfig.description}

      **Suas Tarefas:**
      1.  **Identificar Alimentos:** Detecte todos os itens alimentares na imagem.
      2.  **Estimar Macronutrientes:** Forneça uma estimativa aproximada em gramas para proteína, gordura total, gordura saturada e carboidratos para a refeição inteira.
      3.  **Avaliar Compatibilidade:** Com base nas regras fornecidas, avalie se a refeição é compatível. O valor para a compatibilidade deve ser estritamente 'sim', 'não' ou 'parcial'.
      4.  **Gerar Recomendações:** Ofereça 1 a 3 sugestões práticas para melhorar a refeição ou alinhá-la melhor à dieta.
      5.  **Fornecer Explicação:** Escreva um texto conciso e amigável, como um nutricionista faria, explicando sua análise.

      **Diretrizes Adicionais:**
      - **Tom:** Profissional, amigável e técnico. Evite julgamentos e use uma linguagem positiva e incentivadora.
      - **Foco:** Proteína adequada, gorduras saudáveis e carboidratos mínimos (conforme a dieta).
      - **Segurança:** No final da sua explicação, inclua SEMPRE o seguinte aviso: "Aviso: Estas informações são para fins educacionais e não substituem o aconselhamento médico. Consulte um profissional de saúde para orientações clínicas."
      
      **Formato de Saída:**
      Sua resposta DEVE ser um objeto JSON que adere estritamente ao schema fornecido. Não inclua nenhum texto explicativo, saudações ou markdown (como \`\`\`json) em torno do JSON.
    `;
}

function generateMenuPrompt(protein: ProteinType, diet: DietType, strictness: StrictnessLevel): string {
    const dietConfig = DIET_CONFIG[diet];
    const strictnessConfig = (dietConfig.strictness as any)[strictness];
    
    const proteinMap = {
        'carne': 'Carne bovina',
        'frango': 'Frango',
        'porco': 'Porco',
        'peixe': 'Peixe'
    };

    return `
      Você é um assistente culinário especialista em dietas Cetogênica e Carnívora. Sua tarefa é criar uma sugestão de refeição criativa e deliciosa.

      **Contexto da Sugestão:**
      - **Dieta Selecionada:** ${dietConfig.name}
      - **Nível de Rigor:** ${strictnessConfig.name}
      - **Regras da Dieta:** ${strictnessConfig.description}
      - **Proteína Principal:** ${proteinMap[protein]}

      **Sua Tarefa:**
      Crie uma sugestão de refeição completa (prato principal e, se aplicável, acompanhamentos) que seja estritamente compatível com a dieta e o nível de rigor especificados.
      
      **Diretrizes:**
      - Forneça um nome criativo para o prato.
      - Liste os ingredientes de forma clara.
      - Descreva o modo de preparo em passos simples.
      - O resultado deve ser apenas o texto da sugestão, sem JSON ou formatação extra.
      - Seja direto e conciso. O texto deve ser útil para alguém que procura o que cozinhar.

      Responda apenas com o texto da sugestão. Não inclua saudações, observações ou qualquer texto introdutório.
    `;
}

// Helper: Converte Arquivo para Base64 (Sem resize - Plano B)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove prefixo data:image/xxx;base64,
        resolve(base64String.split(',')[1]);
    };
    reader.onerror = () => reject(new Error("Falha na leitura direta do arquivo."));
    reader.readAsDataURL(file);
  });
};

// Nova função ROBUSTA para redimensionar e comprimir imagem (Mobile-First)
// Reduzida para 350px e qualidade 0.5 para garantir upload em redes instáveis (Payload < 50kb)
const resizeAndCompressImage = (file: File, maxWidth = 350, quality = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        
        img.src = objectUrl;

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            try {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensiona mantendo proporção
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl.split(',')[1]);
                } else {
                    reject(new Error("Falha ao inicializar processador de imagem."));
                }
            } catch (e) {
                reject(new Error("Erro ao processar imagem no canvas."));
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("O navegador não conseguiu ler esta imagem. O arquivo pode estar corrompido."));
        };
    });
};

export async function analyzeMeal(
  imageFile: File,
  diet: DietType,
  strictness: StrictnessLevel
): Promise<AnalysisResult> {
  try {
    let imageBase64: string;

    try {
        // Tenta o método otimizado (resize super comprimido)
        imageBase64 = await resizeAndCompressImage(imageFile);
    } catch (resizeError) {
        console.warn("Falha na compressão automática, tentando fallback...", resizeError);
        const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
        if (imageFile.size < MAX_SIZE_BYTES) {
            imageBase64 = await fileToBase64(imageFile);
        } else {
            throw new Error("A imagem é muito grande. Tente tirar um print da foto ou usar uma menor.");
        }
    }
    
    // 1. TENTATIVA COM CHAVE LOCAL
    const localKey = getStoredApiKey();

    if (localKey) {
        console.log("Usando chave API local...");
        const genAI = getGoogleGenAI(localKey);
        const prompt = generatePrompt(diet, strictness);
        
        const imagePart = {
            inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
            },
        };
        const textPart = { text: prompt };

        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const resultText = response.text;
        if (!resultText) throw new Error("A API não retornou uma resposta válida.");
        return JSON.parse(resultText) as AnalysisResult;
    }

    // 2. TENTATIVA VIA SUPABASE EDGE FUNCTION (Modo SaaS) - RAW FETCH
    if (supabase) {
        console.log("Chamando Supabase Edge Function via Fetch Direto...");
        
        // Obter Sessão para Token de Autorização
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
             throw new Error("Sessão expirada. Faça login novamente.");
        }

        const functionUrl = `${SUPABASE_URL}/functions/v1/analyze-meal`;
        
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ 
                image: imageBase64, 
                diet, 
                strictness 
            })
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error(`Erro HTTP ${response.status}:`, responseText);
            
            // Tratamento de erros comuns
            if (response.status === 504) {
                 throw new Error("Timeout: O servidor demorou muito para responder (504). A análise pode ter ocorrido, mas não recebemos a resposta.");
            }
            if (response.status === 500) {
                 throw new Error(`Erro Interno do Servidor (500). Detalhes: ${responseText.slice(0, 100)}`);
            }
            if (response.status === 404) {
                 throw new Error("Função não encontrada (404). Verifique se o deploy 'analyze-meal' foi feito no Supabase.");
            }
             if (response.status === 401) {
                 throw new Error("Não autorizado (401). Tente sair e entrar novamente.");
            }

            throw new Error(`Erro do Servidor (${response.status}): ${responseText}`);
        }

        // Se deu sucesso, tenta parsear o JSON
        try {
            return JSON.parse(responseText) as AnalysisResult;
        } catch (e) {
            throw new Error("O servidor respondeu, mas não foi um JSON válido. Resposta: " + responseText.slice(0, 50));
        }
    }

    throw new Error("API_KEY_MISSING");

  } catch (error) {
    console.error("Erro geral na análise:", error);
    
    if (error instanceof Error && error.message.includes("API_KEY_MISSING")) {
        throw new Error("API_KEY_MISSING");
    }

    let finalErrorMessage = "Ocorreu um erro desconhecido.";

    if (error instanceof Error) {
        finalErrorMessage = error.message;
    } else if (typeof error === 'string') {
        finalErrorMessage = error;
    } else if (typeof error === 'object' && error !== null) {
        try {
            finalErrorMessage = JSON.stringify(error);
        } catch {
            finalErrorMessage = "Erro de sistema não identificado.";
        }
    }

    throw new Error(finalErrorMessage);
  }
}

export async function generateMenuSuggestion(
    protein: ProteinType,
    diet: DietType,
    strictness: StrictnessLevel
): Promise<string> {
    try {
        const localKey = getStoredApiKey();

        if (localKey) {
            const genAI = getGoogleGenAI(localKey);
            const prompt = generateMenuPrompt(protein, diet, strictness);
            const response = await genAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text || "Sem resposta.";
        }

        return `⚠️ Recurso em Migração\n\nO Assistente de Cardápio está sendo movido para nossos servidores seguros e estará disponível na próxima atualização.\n\nPor favor, utilize a função principal de "Analisar Refeição" (acima), que já está 100% operacional no seu plano!`;

    } catch (error) {
        console.error("Erro ao gerar menu:", error);
         if (error instanceof Error) {
            return "Não foi possível gerar sugestão no momento. Tente novamente mais tarde.";
        }
        return "Erro desconhecido.";
    }
}
