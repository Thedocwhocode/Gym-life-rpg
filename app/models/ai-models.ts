import { SessionBlueprint } from '@/models/blueprint-models';

/** Plano transcrito de uma ficha em PDF (leitor local, `services/sheet-parser.ts`). */
export interface AiWorkoutPlan {
  name: string;
  description: string;
  sessions: SessionBlueprint[];
}
