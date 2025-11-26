import { GoogleGenAI, Type } from '@google/genai';
import type { DietType, StrictnessLevel, AnalysisResult, ProteinType } from '../types';

/**
 * ARQUITETURA SAAS (FUTURO):
 * 
 * Atualmente, este arquivo chama a API do Google diretamente do navegador (Client-Side).
 * Isso exige que a chave API esteja exposta ou inserida pelo usuário.
 * 
 * PARA MIGRAR PARA PRODUÇÃO (SUPABASE + STRIPE):
 * 
 * 1. Você criará uma 'Edge Function' no Supabase.
 * 2. Moverá a lógica de 'generatePrompt' e a chamada 'genAI.models.generateContent' para lá.
 * 3. Esta função 'analyzeMeal' abaixo deixará de usar 'GoogleGenAI' diretamente e passará a fazer:
 * 
 *    const { data, error } = await supabase.functions.invoke('analisar-refeicao', {
 *       body: { image: imageBase64, diet, strictness }
 *    })
 * 
 * Isso protege sua chave API e garante o controle de cotas de uso.
 */

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

function getGoogleGenAI() {
    if (ai) {
        return ai;
    }

    // Prioritize user-provided key, fallback to env var
    let apiKey = getStoredApiKey();
    
    if (!apiKey) {
        // Try getting from env, handle if process is undefined (browser check)
        try {
            apiKey = process.env.API_KEY;
        } catch (e) {
            // process is not defined in some browser environments
        }
    }

    if (!apiKey) {
        console.warn("Chave da API não encontrada.");
        throw new Error("API_KEY_MISSING");
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

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});

export async function analyzeMeal(
  imageFile: File,
  diet: DietType,
  strictness: StrictnessLevel
): Promise<AnalysisResult> {
  try {
    const genAI = getGoogleGenAI();
    const imageBase64 = await toBase64(imageFile);
    const prompt = generatePrompt(diet, strictness);
    
    const imagePart = {
        inlineData: {
            mimeType: imageFile.type,
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
    
    if (!resultText) {
      throw new Error("A API não retornou uma resposta de texto válida.");
    }
    
    try {
        const resultJson = JSON.parse(resultText);
        return resultJson as AnalysisResult;
    } catch (parseError) {
        console.error("Falha ao analisar JSON da API. Resposta recebida:", resultText);
        throw new Error("A resposta da IA não está no formato esperado (JSON inválido). Por favor, tente novamente com outra imagem ou aguarde um momento.");
    }
    
  } catch (error) {
    console.error("Erro ao chamar a API do Google Gemini:", error);
    if (error instanceof Error) {
         if (error.message.includes("API_KEY_MISSING")) {
            throw new Error("API_KEY_MISSING");
         }
        throw new Error(`Falha ao analisar a refeição: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido durante a análise da refeição.");
  }
}

export async function generateMenuSuggestion(
    protein: ProteinType,
    diet: DietType,
    strictness: StrictnessLevel
): Promise<string> {
    try {
        const genAI = getGoogleGenAI();
        const prompt = generateMenuPrompt(protein, diet, strictness);

        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const resultText = response.text;

        if (!resultText) {
            throw new Error("A API não retornou uma resposta de texto válida.");
        }

        return resultText.trim();

    } catch (error) {
        console.error("Erro ao chamar a API do Google Gemini:", error);
         if (error instanceof Error) {
             if (error.message.includes("API_KEY_MISSING")) {
                throw new Error("API_KEY_MISSING");
             }
            throw new Error(`Falha ao gerar sugestão de menu: ${error.message}`);
        }
        throw new Error("Ocorreu um erro desconhecido ao gerar a sugestão de menu.");
    }
}
