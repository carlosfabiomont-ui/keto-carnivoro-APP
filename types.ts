export type DietType = 'carnivore' | 'ketogenic';

export type ProteinType = 'carne' | 'frango' | 'porco' | 'peixe';

export type CarnivoreStrictness = 'strict' | 'permissive';
export type KetogenicStrictness = 'very_low' | 'moderate';
export type StrictnessLevel = CarnivoreStrictness | KetogenicStrictness;

export interface DetectedItem {
  item: string;
  compativel: boolean;
}

export interface Macros {
  proteina: number;
  gordura: number;
  gordura_saturada: number;
  carboidratos: number;
}

export interface AnalysisResult {
  compatibilidade: 'sim' | 'não' | 'parcial';
  macros_estimados: Macros;
  itens_detectados: DetectedItem[];
  ajustes_recomendados: string[];
  explicacao: string;
}