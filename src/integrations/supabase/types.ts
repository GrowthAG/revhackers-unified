export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          author_role: string | null
          author_id: string | null
          category: string
          content: string | null
          created_at: string
          date: string | null
          excerpt: string | null
          featured: boolean
          id: string
          image: string | null
          read_time: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_avatar?: string
          author_name?: string
          author_role?: string
          category: string
          content?: string | null
          created_at?: string | null
          date?: string
          excerpt: string
          featured?: boolean | null
          id?: number
          image: string
          read_time?: string
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_avatar?: string
          author_name?: string
          author_role?: string
          category?: string
          content?: string | null
          created_at?: string | null
          date?: string
          excerpt?: string
          featured?: boolean | null
          id?: number
          image?: string
          read_time?: string
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      },
      materials: {
        Row: {
          id: string
          title: string
          slug: string
          type: string
          material_type: string
          category: string | null
          description: string | null
          cover_image: string | null
          material_url: string | null
          link_material: string | null
          published: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          type: string
          material_type?: string
          category?: string | null
          description?: string | null
          cover_image?: string | null
          material_url?: string | null
          link_material?: string | null
          published?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          type?: string
          material_type?: string
          category?: string | null
          description?: string | null
          cover_image?: string | null
          material_url?: string | null
          link_material?: string | null
          published?: boolean
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      },
      cases: {
        Row: {
          id: string
          title: string
          slug: string
          client_name: string
          client_logo: string | null
          description: string | null
          challenge: string | null
          solution: string | null
          results: string | null
          image_url: string | null
          video_url: string | null
          industry: string | null
          testimonial: string | null
          testimonial_author: string | null
          testimonial_role: string | null
          testimonial_avatar: string | null
          metrics: Json | null
          preview_description: string | null
          primary_metric: string | null
          case_category: string | null
          published: boolean
          featured: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          client_name: string
          client_logo?: string | null
          description?: string | null
          challenge?: string | null
          solution?: string | null
          results?: string | null
          image_url?: string | null
          video_url?: string | null
          industry?: string | null
          testimonial?: string | null
          testimonial_author?: string | null
          testimonial_role?: string | null
          testimonial_avatar?: string | null
          metrics?: Json | null
          preview_description?: string | null
          primary_metric?: string | null
          case_category?: string | null
          published?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          client_name?: string
          client_logo?: string | null
          description?: string | null
          challenge?: string | null
          solution?: string | null
          results?: string | null
          image_url?: string | null
          video_url?: string | null
          industry?: string | null
          testimonial?: string | null
          testimonial_author?: string | null
          testimonial_role?: string | null
          testimonial_avatar?: string | null
          metrics?: Json | null
          preview_description?: string | null
          primary_metric?: string | null
          case_category?: string | null
          published?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      },
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'super_admin'
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'super_admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'super_admin'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      rei_projects: {
        Row: {
          id: string
          type: 'consulting' | 'dev' | 'founder'
          client_name: string
          client_email: string
          client_company: string | null
          analyst_email: string
          last_rei_date: string
          next_rei_date: string
          quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
          year: number
          status: 'active' | 'pending' | 'overdue'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'consulting' | 'dev' | 'founder'
          client_name: string
          client_email: string
          client_company?: string | null
          analyst_email: string
          last_rei_date?: string
          next_rei_date: string
          quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
          year: number
          status?: 'active' | 'pending' | 'overdue'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'consulting' | 'dev' | 'founder'
          client_name?: string
          client_email?: string
          client_company?: string | null
          analyst_email?: string
          last_rei_date?: string
          next_rei_date?: string
          quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4'
          year?: number
          status?: 'active' | 'pending' | 'overdue'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rei_responses: {
        Row: {
          id: string
          project_id: string
          context: 'internal' | 'lead_gen' | 'public'
          source: 'rei' | 'diagnostic' | 'quiz'
          responses: Json
          total_score: number
          maturity_level: string
          maturity_percentage: number
          score_version: string | null
          calculated_at: string | null
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          context?: 'internal' | 'lead_gen' | 'public'
          source?: 'rei' | 'diagnostic' | 'quiz'
          responses: Json
          total_score: number
          maturity_level: string
          maturity_percentage: number
          score_version?: string | null
          calculated_at?: string | null
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          context?: 'internal' | 'lead_gen' | 'public'
          source?: 'rei' | 'diagnostic' | 'quiz'
          responses?: Json
          total_score?: number
          maturity_level?: string
          maturity_percentage?: number
          score_version?: string | null
          calculated_at?: string | null
          completed_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rei_responses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
