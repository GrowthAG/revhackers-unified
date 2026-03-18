export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_documents: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          embedding: string | null
          filename: string
          id: string
          metadata: Json | null
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          embedding?: string | null
          filename: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          embedding?: string | null
          filename?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_documents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          avatar_url: string | null
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          model: string
          name: string
          role: string
          system_prompt: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          model?: string
          name: string
          role: string
          system_prompt: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          model?: string
          name?: string
          role?: string
          system_prompt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_avatar: string | null
          author_id: string | null
          author_name: string | null
          author_role: string | null
          category: string | null
          content: string | null
          created_at: string | null
          date: string | null
          excerpt: string | null
          featured: boolean | null
          id: string
          image: string | null
          is_active: boolean | null
          published: boolean | null
          published_at: string | null
          read_time: string | null
          slug: string | null
          thumbnail: string | null
          title: string
        }
        Insert: {
          author_avatar?: string | null
          author_id?: string | null
          author_name?: string | null
          author_role?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          date?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string | null
          thumbnail?: string | null
          title: string
        }
        Update: {
          author_avatar?: string | null
          author_id?: string | null
          author_name?: string | null
          author_role?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          date?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string | null
          thumbnail?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          case_category: string | null
          case_subtitle: string | null
          case_type: string | null
          challenge: string | null
          client_logo: string | null
          client_name: string | null
          company_logo_url: string | null
          created_at: string
          date: string | null
          featured: boolean | null
          hero_description: string | null
          hero_label: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          metric_context: string | null
          metrics: Json | null
          preview_description: string | null
          primary_metric: string | null
          published: boolean | null
          published_at: string | null
          results: string | null
          segment: string | null
          slug: string
          solution: string | null
          testimonial_author: string | null
          testimonial_avatar: string | null
          testimonial_quote: string | null
          testimonial_role: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          case_category?: string | null
          case_subtitle?: string | null
          case_type?: string | null
          challenge?: string | null
          client_logo?: string | null
          client_name?: string | null
          company_logo_url?: string | null
          created_at?: string
          date?: string | null
          featured?: boolean | null
          hero_description?: string | null
          hero_label?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metric_context?: string | null
          metrics?: Json | null
          preview_description?: string | null
          primary_metric?: string | null
          published?: boolean | null
          published_at?: string | null
          results?: string | null
          segment?: string | null
          slug: string
          solution?: string | null
          testimonial_author?: string | null
          testimonial_avatar?: string | null
          testimonial_quote?: string | null
          testimonial_role?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          case_category?: string | null
          case_subtitle?: string | null
          case_type?: string | null
          challenge?: string | null
          client_logo?: string | null
          client_name?: string | null
          company_logo_url?: string | null
          created_at?: string
          date?: string | null
          featured?: boolean | null
          hero_description?: string | null
          hero_label?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metric_context?: string | null
          metrics?: Json | null
          preview_description?: string | null
          primary_metric?: string | null
          published?: boolean | null
          published_at?: string | null
          results?: string | null
          segment?: string | null
          slug?: string
          solution?: string | null
          testimonial_author?: string | null
          testimonial_avatar?: string | null
          testimonial_quote?: string | null
          testimonial_role?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          agent_id: string | null
          context_id: string | null
          context_type: string | null
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          cep: string | null
          city: string | null
          cnpj: string | null
          company: string | null
          company_size: string | null
          complement: string | null
          country: string | null
          created_at: string | null
          email: string
          id: string
          linkedin_url: string | null
          logo_url: string | null
          name: string
          neighborhood: string | null
          number: string | null
          phone: string | null
          segment: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          company?: string | null
          company_size?: string | null
          complement?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          id?: string
          linkedin_url?: string | null
          logo_url?: string | null
          name: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          segment?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          company?: string | null
          company_size?: string | null
          complement?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          id?: string
          linkedin_url?: string | null
          logo_url?: string | null
          name?: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          segment?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      diagnosticos: {
        Row: {
          created_at: string | null
          email: string
          id: string
          respostas: Json | null
          score: number | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          respostas?: Json | null
          score?: number | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          respostas?: Json | null
          score?: number | null
          tipo?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string | null
          email: string
          id: string
          invited_by: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          invited_by?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          invited_by?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          category: string | null
          cover_image: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          is_active: boolean | null
          link_material: string | null
          material_name: string
          material_type: string
          material_url: string
          published: boolean | null
          slug: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          category?: string | null
          cover_image?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          link_material?: string | null
          material_name: string
          material_type: string
          material_url: string
          published?: boolean | null
          slug?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          category?: string | null
          cover_image?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          link_material?: string | null
          material_name?: string
          material_type?: string
          material_url?: string
          published?: boolean | null
          slug?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar: string | null
          avatar_url: string | null
          bio: string | null
          cpf: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          job_title: string | null
          name: string | null
          personal_email: string | null
          role: string
          status: string | null
          username: string | null
        }
        Insert: {
          address?: string | null
          avatar?: string | null
          avatar_url?: string | null
          bio?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          name?: string | null
          personal_email?: string | null
          role?: string
          status?: string | null
          username?: string | null
        }
        Update: {
          address?: string | null
          avatar?: string | null
          avatar_url?: string | null
          bio?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          name?: string | null
          personal_email?: string | null
          role?: string
          status?: string | null
          username?: string | null
        }
        Relationships: []
      }
      rei_projects: {
        Row: {
          analyst_email: string
          client_company: string | null
          client_email: string
          client_id: string | null
          client_name: string
          created_at: string | null
          id: string
          last_rei_date: string | null
          next_rei_date: string
          quarter: string
          scheduling_completed: boolean | null
          status: string
          technical_evidences: Json | null
          type: string
          updated_at: string | null
          year: number
        }
        Insert: {
          analyst_email: string
          client_company?: string | null
          client_email: string
          client_id?: string | null
          client_name: string
          created_at?: string | null
          id?: string
          last_rei_date?: string | null
          next_rei_date: string
          quarter: string
          scheduling_completed?: boolean | null
          status?: string
          technical_evidences?: Json | null
          type?: string
          updated_at?: string | null
          year: number
        }
        Update: {
          analyst_email?: string
          client_company?: string | null
          client_email?: string
          client_id?: string | null
          client_name?: string
          created_at?: string | null
          id?: string
          last_rei_date?: string | null
          next_rei_date?: string
          quarter?: string
          scheduling_completed?: boolean | null
          status?: string
          technical_evidences?: Json | null
          type?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "rei_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      rei_responses: {
        Row: {
          calculated_at: string | null
          completed_at: string | null
          context: string
          created_at: string | null
          id: string
          maturity_level: string
          maturity_percentage: number
          project_id: string
          responses: Json
          score_version: string | null
          source: string
          total_score: number
        }
        Insert: {
          calculated_at?: string | null
          completed_at?: string | null
          context?: string
          created_at?: string | null
          id?: string
          maturity_level: string
          maturity_percentage?: number
          project_id: string
          responses: Json
          score_version?: string | null
          source?: string
          total_score?: number
        }
        Update: {
          calculated_at?: string | null
          completed_at?: string | null
          context?: string
          created_at?: string | null
          id?: string
          maturity_level?: string
          maturity_percentage?: number
          project_id?: string
          responses?: Json
          score_version?: string | null
          source?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "rei_responses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      reis: {
        Row: {
          created_at: string
          created_by: string
          data: Json
          id: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          data: Json
          id?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          data?: Json
          id?: string
        }
        Relationships: []
      }
      strategic_plans: {
        Row: {
          access_token: string | null
          approved_at: string | null
          budget_data: Json | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          diagnostic_data: Json | null
          financial_projections: Json | null
          goals_data: Json | null
          id: string
          methodology_data: Json | null
          next_steps_data: Json | null
          persona_data: Json | null
          premises_data: Json | null
          rei_project_id: string | null
          rejected_at: string | null
          roadmap_data: Json | null
          sent_at: string | null
          status: string | null
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          access_token?: string | null
          approved_at?: string | null
          budget_data?: Json | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          diagnostic_data?: Json | null
          financial_projections?: Json | null
          goals_data?: Json | null
          id?: string
          methodology_data?: Json | null
          next_steps_data?: Json | null
          persona_data?: Json | null
          premises_data?: Json | null
          rei_project_id?: string | null
          rejected_at?: string | null
          roadmap_data?: Json | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          access_token?: string | null
          approved_at?: string | null
          budget_data?: Json | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          diagnostic_data?: Json | null
          financial_projections?: Json | null
          goals_data?: Json | null
          id?: string
          methodology_data?: Json | null
          next_steps_data?: Json | null
          persona_data?: Json | null
          premises_data?: Json | null
          rei_project_id?: string | null
          rejected_at?: string | null
          roadmap_data?: Json | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategic_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_plans_rei_project_id_fkey"
            columns: ["rei_project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      diagnosticos_resumo: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          score: number | null
          status: string | null
          tipo: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          score?: number | null
          status?: never
          tipo?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          score?: number | null
          status?: never
          tipo?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_diagnostic_entry: {
        Args: {
          p_lead_company: string
          p_lead_email: string
          p_lead_name: string
          p_maturity_level: string
          p_responses: Json
          p_score: number
        }
        Returns: Json
      }
      generate_strategic_plan: {
        Args: { p_rei_project_id: string }
        Returns: string
      }
      is_super_admin: { Args: never; Returns: boolean }
      match_agent_documents: {
        Args: {
          filter_agent_id: string
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
