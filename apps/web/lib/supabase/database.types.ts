// Hand-authored Supabase types for Phase 1.
// Replace by running: pnpm --filter @shmuel/web supabase:types

export type Json = string | number | boolean | null | { [k: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          locale: string | null;
          theme: 'light' | 'dark' | 'system' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          locale?: string | null;
          theme?: 'light' | 'dark' | 'system' | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          model: string;
          message_count: number;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          model?: string;
          message_count?: number;
          archived?: boolean;
        };
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          input_tokens: number | null;
          output_tokens: number | null;
          model: string | null;
          status: 'streaming' | 'complete' | 'error' | 'stopped';
          error_message: string | null;
          parent_message_id: string | null;
          edited_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          model?: string | null;
          status?: 'streaming' | 'complete' | 'error' | 'stopped';
          error_message?: string | null;
          parent_message_id?: string | null;
          edited_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      memory_facts: {
        Row: {
          id: string;
          user_id: string;
          fact_text: string;
          category: string;
          source_conversation_id: string | null;
          source_message_id: string | null;
          source_type: 'user_explicit' | 'inferred' | 'learning_summary';
          status: 'active' | 'deprecated' | 'pending_confirm';
          superseded_by: string | null;
          supersedes: string | null;
          confidence: number | null;
          tags: string[] | null;
          embedding: number[] | null;
          user_confirmed: boolean | null;
          user_confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          fact_text: string;
          category: string;
          source_conversation_id?: string | null;
          source_message_id?: string | null;
          source_type: 'user_explicit' | 'inferred' | 'learning_summary';
          status?: 'active' | 'deprecated' | 'pending_confirm';
          superseded_by?: string | null;
          supersedes?: string | null;
          confidence?: number | null;
          tags?: string[] | null;
          user_confirmed?: boolean | null;
          user_confirmed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['memory_facts']['Insert']>;
      };
      behavior_patterns: {
        Row: {
          user_id: string;
          preferred_response_length: 'short' | 'medium' | 'long' | null;
          active_hours: number[] | null;
          active_days: number[] | null;
          preferred_tone: string | null;
          uses_humor: boolean | null;
          prefers_examples: boolean | null;
          prefers_lists: boolean | null;
          primary_language: string | null;
          uses_secondary_language: boolean | null;
          top_topics: string[] | null;
          conversations_since_last_recap: number | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          preferred_response_length?: 'short' | 'medium' | 'long' | null;
          active_hours?: number[] | null;
          active_days?: number[] | null;
          preferred_tone?: string | null;
          uses_humor?: boolean | null;
          prefers_examples?: boolean | null;
          prefers_lists?: boolean | null;
          primary_language?: string | null;
          uses_secondary_language?: boolean | null;
          top_topics?: string[] | null;
          conversations_since_last_recap?: number | null;
        };
        Update: Partial<Database['public']['Tables']['behavior_patterns']['Insert']>;
      };
      learning_sessions: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string | null;
          facts_proposed: number | null;
          facts_confirmed: number | null;
          facts_rejected: number | null;
          facts_modified: number | null;
          questions_asked: Json;
          user_answers: Json;
          status: 'in_progress' | 'completed' | 'abandoned' | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          conversation_id?: string | null;
          facts_proposed?: number | null;
          facts_confirmed?: number | null;
          facts_rejected?: number | null;
          facts_modified?: number | null;
          questions_asked?: Json;
          user_answers?: Json;
          status?: 'in_progress' | 'completed' | 'abandoned' | null;
          completed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['learning_sessions']['Insert']>;
      };
      adaptation_log: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string | null;
          what_changed: string;
          previous_behavior: string;
          new_behavior: string;
          reason: string;
          shown_to_user: boolean | null;
          user_response: 'confirmed' | 'rejected' | 'ignored' | null;
          responded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          conversation_id?: string | null;
          what_changed: string;
          previous_behavior: string;
          new_behavior: string;
          reason: string;
          shown_to_user?: boolean | null;
          user_response?: 'confirmed' | 'rejected' | 'ignored' | null;
          responded_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['adaptation_log']['Insert']>;
      };
      subscriptions: {
        Row: {
          user_id: string;
          plan: 'free' | 'basic' | 'mid' | 'premium' | 'pro_basic' | 'pro_mid' | 'pro_premium';
          status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          plan?: Database['public']['Tables']['subscriptions']['Row']['plan'];
          status?: Database['public']['Tables']['subscriptions']['Row']['status'];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean | null;
          trial_ends_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      usage_daily: {
        Row: {
          user_id: string;
          day: string;
          messages_sent: number;
          input_tokens: number;
          output_tokens: number;
        };
        Insert: {
          user_id: string;
          day?: string;
          messages_sent?: number;
          input_tokens?: number;
          output_tokens?: number;
        };
        Update: Partial<Database['public']['Tables']['usage_daily']['Insert']>;
      };
    };
    Functions: {
      bump_usage: {
        Args: { p_user_id: string; p_input_tokens: number; p_output_tokens: number };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
  };
}
