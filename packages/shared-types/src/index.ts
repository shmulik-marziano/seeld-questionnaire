export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  status?: 'streaming' | 'complete' | 'error' | 'stopped';
  created_at?: string;
  input_tokens?: number;
  output_tokens?: number;
}

export type FactCategory =
  | 'profession'
  | 'family'
  | 'preference'
  | 'goal'
  | 'personality'
  | 'other';

export type FactSourceType = 'user_explicit' | 'inferred' | 'learning_summary';
export type FactStatus = 'active' | 'deprecated' | 'pending_confirm';

export interface MemoryFact {
  id: string;
  user_id: string;
  fact_text: string;
  category: string;
  source_conversation_id: string | null;
  source_message_id: string | null;
  source_type: FactSourceType;
  status: FactStatus;
  superseded_by: string | null;
  supersedes: string | null;
  confidence: number;
  tags: string[];
  user_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export interface BehaviorPatterns {
  user_id: string;
  preferred_response_length: 'short' | 'medium' | 'long';
  preferred_tone: string;
  uses_humor: boolean;
  prefers_examples: boolean;
  prefers_lists: boolean;
  primary_language: string;
  top_topics: string[];
}

export interface ProposedFact {
  fact_text: string;
  category: string;
  confidence: number;
  needs_clarification?: string | null;
}

export interface ClarificationQuestion {
  question: string;
  options: string[];
}

export interface LearningSummary {
  facts: ProposedFact[];
  questions: ClarificationQuestion[];
}

export type PlanId =
  | 'free'
  | 'basic'
  | 'mid'
  | 'premium'
  | 'pro_basic'
  | 'pro_mid'
  | 'pro_premium';

export interface PlanLimits {
  daily_messages: number;
  monthly_messages: number;
  max_conversation_messages: number;
  memory_facts_max: number;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    daily_messages: 20,
    monthly_messages: 200,
    max_conversation_messages: 50,
    memory_facts_max: 30,
  },
  basic: {
    daily_messages: 500,
    monthly_messages: 10000,
    max_conversation_messages: 500,
    memory_facts_max: 500,
  },
  mid: {
    daily_messages: 1500,
    monthly_messages: 30000,
    max_conversation_messages: 1000,
    memory_facts_max: 2000,
  },
  premium: {
    daily_messages: 5000,
    monthly_messages: 100000,
    max_conversation_messages: 2000,
    memory_facts_max: 10000,
  },
  pro_basic: {
    daily_messages: 1000,
    monthly_messages: 20000,
    max_conversation_messages: 1000,
    memory_facts_max: 1000,
  },
  pro_mid: {
    daily_messages: 3000,
    monthly_messages: 60000,
    max_conversation_messages: 2000,
    memory_facts_max: 5000,
  },
  pro_premium: {
    daily_messages: 10000,
    monthly_messages: 200000,
    max_conversation_messages: 5000,
    memory_facts_max: 50000,
  },
};
