/**
 * SIMPLIFICAME · Database Types
 * Tipado completo del schema Supabase
 * Genera con: npx supabase gen types typescript --local > lib/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          afse_score: number;
          industry: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['companies']['Insert']>;
      };
      afse_cycles: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          status: 'active' | 'completed' | 'paused';
          started_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['afse_cycles']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['afse_cycles']['Insert']>;
      };
      layer_progress: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          cycle_id: string;
          phase: number;
          layer_code: string;
          data: Json;
          completion_pct: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['layer_progress']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['layer_progress']['Insert']>;
      };
      auron_messages: {
        Row: {
          id: string;
          company_id: string;
          cycle_id: string;
          user_id: string;
          phase: number;
          role: 'user' | 'auron';
          content: string;
          tokens_used: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['auron_messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['auron_messages']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      cycle_status: 'active' | 'completed' | 'paused';
      message_role: 'user' | 'auron';
    };
  };
}

// ── Derived helpers ──────────────────────────────────────────────────────────
export type DBCompany      = Database['public']['Tables']['companies']['Row'];
export type DBCycle        = Database['public']['Tables']['afse_cycles']['Row'];
export type DBLayerProgress = Database['public']['Tables']['layer_progress']['Row'];
export type DBAuronMessage = Database['public']['Tables']['auron_messages']['Row'];