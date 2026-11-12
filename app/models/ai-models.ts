import { SessionBlueprint } from '@/models/blueprint-models';

/** Plano transcrito de uma ficha em PDF (`POST /ai/sheet`). */
export interface AiWorkoutPlan {
  name: string;
  description: string;
  sessions: SessionBlueprint[];
}
