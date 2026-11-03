/**
 * Recomendador ligero Edge AI para sugerencias de confitería basadas en el género de la película según PLAN-18.
 */
export interface RecommendationInput {
  genre: string;
  isImax: boolean;
  timeOfDay: 'afternoon' | 'evening' | 'night';
}

export class EdgeAiRecommender {
  static getRecommendedCombo(input: RecommendationInput): { comboId: string; reason: string } {
    if (input.isImax || input.genre.toLowerCase().includes('sci-fi')) {
      return {
        comboId: 'cnd-02',
        reason: 'El formato IMAX y películas de Sci-Fi se disfrutan mejor con el Combo Mega Familiar.',
      };
    }
    return {
      comboId: 'cnd-01',
      reason: 'Combo Dúo Clásico recomendado para funciones de tarde.',
    };
  }
}
