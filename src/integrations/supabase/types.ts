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
          last_edited_by: string | null
          library_id: string | null
          metadata: Json | null
          source_type: string
          title: string | null
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          embedding?: string | null
          filename: string
          id?: string
          last_edited_by?: string | null
          library_id?: string | null
          metadata?: Json | null
          source_type?: string
          title?: string | null
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          embedding?: string | null
          filename?: string
          id?: string
          last_edited_by?: string | null
          library_id?: string | null
          metadata?: Json | null
          source_type?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_documents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_documents_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "knowledge_libraries"
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
      ai_generation_jobs: {
        Row: {
          completed_at: string | null
          context_data: Json | null
          created_at: string | null
          error_log: string | null
          hash_signature: string | null
          id: string
          project_id: string
          result_data: Json | null
          started_at: string | null
          status: string
          type: string
        }
        Insert: {
          completed_at?: string | null
          context_data?: Json | null
          created_at?: string | null
          error_log?: string | null
          hash_signature?: string | null
          id?: string
          project_id: string
          result_data?: Json | null
          started_at?: string | null
          status?: string
          type: string
        }
        Update: {
          completed_at?: string | null
          context_data?: Json | null
          created_at?: string | null
          error_log?: string | null
          hash_signature?: string | null
          id?: string
          project_id?: string
          result_data?: Json | null
          started_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generation_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          organization_id: string | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          organization_id?: string | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          organization_id?: string | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string | null
          id: string
          name: string
          role: string | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          name: string
          role?: string | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          name?: string
          role?: string | null
        }
        Relationships: []
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          {
            foreignKeyName: "blog_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      call_recordings: {
        Row: {
          action_items: Json | null
          audio_url: string | null
          created_at: string | null
          duration_seconds: number | null
          error_message: string | null
          id: string
          meeting_url: string | null
          organization_id: string | null
          participants: string[] | null
          project_id: string | null
          recorded_at: string | null
          status: string
          summary: string | null
          title: string
          transcript: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          action_items?: Json | null
          audio_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          meeting_url?: string | null
          organization_id?: string | null
          participants?: string[] | null
          project_id?: string | null
          recorded_at?: string | null
          status?: string
          summary?: string | null
          title?: string
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_items?: Json | null
          audio_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          meeting_url?: string | null
          organization_id?: string | null
          participants?: string[] | null
          project_id?: string | null
          recorded_at?: string | null
          status?: string
          summary?: string | null
          title?: string
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_recordings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_recordings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      client_meetings: {
        Row: {
          attendees: Json | null
          calendar_link: string | null
          client_contact_name: string | null
          client_email: string | null
          client_name: string | null
          created_at: string | null
          description: string | null
          drive_file_id: string | null
          duration_minutes: number | null
          event_notes: string | null
          google_event_id: string
          has_recording: boolean | null
          id: string
          meet_link: string | null
          meeting_date: string
          meeting_type: string
          organizer_email: string | null
          recording_size_bytes: number | null
          status: string | null
          synced_at: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          attendees?: Json | null
          calendar_link?: string | null
          client_contact_name?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          drive_file_id?: string | null
          duration_minutes?: number | null
          event_notes?: string | null
          google_event_id: string
          has_recording?: boolean | null
          id?: string
          meet_link?: string | null
          meeting_date: string
          meeting_type?: string
          organizer_email?: string | null
          recording_size_bytes?: number | null
          status?: string | null
          synced_at?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          attendees?: Json | null
          calendar_link?: string | null
          client_contact_name?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          drive_file_id?: string | null
          duration_minutes?: number | null
          event_notes?: string | null
          google_event_id?: string
          has_recording?: boolean | null
          id?: string
          meet_link?: string | null
          meeting_date?: string
          meeting_type?: string
          organizer_email?: string | null
          recording_size_bytes?: number | null
          status?: string | null
          synced_at?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
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
          linkedin_data: Json | null
          linkedin_scraped_at: string | null
          linkedin_url: string | null
          logo_url: string | null
          name: string
          neighborhood: string | null
          number: string | null
          organization_id: string | null
          phone: string | null
          segment: string | null
          state: string | null
          status: string | null
          trade_name: string | null
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
          linkedin_data?: Json | null
          linkedin_scraped_at?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          name: string
          neighborhood?: string | null
          number?: string | null
          organization_id?: string | null
          phone?: string | null
          segment?: string | null
          state?: string | null
          status?: string | null
          trade_name?: string | null
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
          linkedin_data?: Json | null
          linkedin_scraped_at?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          name?: string
          neighborhood?: string | null
          number?: string | null
          organization_id?: string | null
          phone?: string | null
          segment?: string | null
          state?: string | null
          status?: string | null
          trade_name?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      document_signatures: {
        Row: {
          certificate_url: string | null
          created_at: string
          document_hash: string
          id: string
          project_id: string | null
          reference_id: string
          reference_type: string
          signed_at: string
          signer_cpf_cnpj: string
          signer_email: string
          signer_ip: string | null
          signer_name: string
          signer_role: string | null
          user_agent: string | null
        }
        Insert: {
          certificate_url?: string | null
          created_at?: string
          document_hash: string
          id?: string
          project_id?: string | null
          reference_id: string
          reference_type: string
          signed_at?: string
          signer_cpf_cnpj: string
          signer_email: string
          signer_ip?: string | null
          signer_name: string
          signer_role?: string | null
          user_agent?: string | null
        }
        Update: {
          certificate_url?: string | null
          created_at?: string
          document_hash?: string
          id?: string
          project_id?: string | null
          reference_id?: string
          reference_type?: string
          signed_at?: string
          signer_cpf_cnpj?: string
          signer_email?: string
          signer_ip?: string | null
          signer_name?: string
          signer_role?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_signatures_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
        ]
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
      knowledge_libraries: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          is_global: boolean | null
          name: string
          project_id: string | null
          type: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_global?: boolean | null
          name: string
          project_id?: string | null
          type?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_global?: boolean | null
          name?: string
          project_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_libraries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_libraries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
        ]
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
          is_template: boolean | null
          link_material: string | null
          material_name: string
          material_type: string
          material_url: string
          organization_id: string | null
          origin_template_id: string | null
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
          is_template?: boolean | null
          link_material?: string | null
          material_name: string
          material_type: string
          material_url: string
          organization_id?: string | null
          origin_template_id?: string | null
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
          is_template?: boolean | null
          link_material?: string | null
          material_name?: string
          material_type?: string
          material_url?: string
          organization_id?: string | null
          origin_template_id?: string | null
          published?: boolean | null
          slug?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_origin_template_id_fkey"
            columns: ["origin_template_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_recordings: {
        Row: {
          ai_insights: Json | null
          ai_summary: string | null
          client_id: string | null
          created_at: string | null
          drive_file_id: string | null
          happened_at: string | null
          id: string
          rei_project_id: string | null
          scheduled_meeting_id: string | null
          title: string | null
          transcript: string | null
          transcript_status: string | null
          video_url: string | null
        }
        Insert: {
          ai_insights?: Json | null
          ai_summary?: string | null
          client_id?: string | null
          created_at?: string | null
          drive_file_id?: string | null
          happened_at?: string | null
          id?: string
          rei_project_id?: string | null
          scheduled_meeting_id?: string | null
          title?: string | null
          transcript?: string | null
          transcript_status?: string | null
          video_url?: string | null
        }
        Update: {
          ai_insights?: Json | null
          ai_summary?: string | null
          client_id?: string | null
          created_at?: string | null
          drive_file_id?: string | null
          happened_at?: string | null
          id?: string
          rei_project_id?: string | null
          scheduled_meeting_id?: string | null
          title?: string | null
          transcript?: string | null
          transcript_status?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_recordings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_recordings_rei_project_id_fkey"
            columns: ["rei_project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_recordings_scheduled_meeting_id_fkey"
            columns: ["scheduled_meeting_id"]
            isOneToOne: false
            referencedRelation: "scheduled_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      methodologies: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "methodologies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      methodology_questions: {
        Row: {
          description: string | null
          field_type: string | null
          id: string
          options: Json | null
          order_index: number | null
          required: boolean | null
          section_id: string
          text: string
          weight: number | null
        }
        Insert: {
          description?: string | null
          field_type?: string | null
          id?: string
          options?: Json | null
          order_index?: number | null
          required?: boolean | null
          section_id: string
          text: string
          weight?: number | null
        }
        Update: {
          description?: string | null
          field_type?: string | null
          id?: string
          options?: Json | null
          order_index?: number | null
          required?: boolean | null
          section_id?: string
          text?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "methodology_questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "methodology_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      methodology_responses: {
        Row: {
          answers: Json | null
          calculated_level: string | null
          created_at: string | null
          id: string
          methodology_id: string
          project_id: string | null
          respondent_email: string | null
          total_score: number | null
        }
        Insert: {
          answers?: Json | null
          calculated_level?: string | null
          created_at?: string | null
          id?: string
          methodology_id: string
          project_id?: string | null
          respondent_email?: string | null
          total_score?: number | null
        }
        Update: {
          answers?: Json | null
          calculated_level?: string | null
          created_at?: string | null
          id?: string
          methodology_id?: string
          project_id?: string | null
          respondent_email?: string | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "methodology_responses_methodology_id_fkey"
            columns: ["methodology_id"]
            isOneToOne: false
            referencedRelation: "methodologies"
            referencedColumns: ["id"]
          },
        ]
      }
      methodology_sections: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          methodology_id: string
          order_index: number | null
          title: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          methodology_id: string
          order_index?: number | null
          title: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          methodology_id?: string
          order_index?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "methodology_sections_methodology_id_fkey"
            columns: ["methodology_id"]
            isOneToOne: false
            referencedRelation: "methodologies"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_agendas: {
        Row: {
          calendar_provider: string
          created_at: string | null
          id: string
          organization_id: string
          provider_refresh_token: string | null
          provider_slug: string | null
          provider_token: string | null
          provider_token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          calendar_provider: string
          created_at?: string | null
          id?: string
          organization_id: string
          provider_refresh_token?: string | null
          provider_slug?: string | null
          provider_token?: string | null
          provider_token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          calendar_provider?: string
          created_at?: string | null
          id?: string
          organization_id?: string
          provider_refresh_token?: string | null
          provider_slug?: string | null
          provider_token?: string | null
          provider_token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_agendas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_integrations: {
        Row: {
          access_token: string | null
          api_key: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          organization_id: string
          provider: string
          refresh_token: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          api_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          organization_id: string
          provider: string
          refresh_token?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          api_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          organization_id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: string | null
          role_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role?: string | null
          role_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: string | null
          role_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_status: string | null
          created_at: string | null
          custom_domain: string | null
          deleted_at: string | null
          deletion_reason: string | null
          deletion_requested_by: string | null
          id: string
          is_master: boolean | null
          last_billed_at: string | null
          mrr: number | null
          name: string
          parent_id: string | null
          plan: string | null
          scheduled_deletion_at: string | null
          settings: Json | null
          slug: string
          status: string | null
          suspended_at: string | null
          trial_ends_at: string | null
        }
        Insert: {
          billing_status?: string | null
          created_at?: string | null
          custom_domain?: string | null
          deleted_at?: string | null
          deletion_reason?: string | null
          deletion_requested_by?: string | null
          id?: string
          is_master?: boolean | null
          last_billed_at?: string | null
          mrr?: number | null
          name: string
          parent_id?: string | null
          plan?: string | null
          scheduled_deletion_at?: string | null
          settings?: Json | null
          slug: string
          status?: string | null
          suspended_at?: string | null
          trial_ends_at?: string | null
        }
        Update: {
          billing_status?: string | null
          created_at?: string | null
          custom_domain?: string | null
          deleted_at?: string | null
          deletion_reason?: string | null
          deletion_requested_by?: string | null
          id?: string
          is_master?: boolean | null
          last_billed_at?: string | null
          mrr?: number | null
          name?: string
          parent_id?: string | null
          plan?: string | null
          scheduled_deletion_at?: string | null
          settings?: Json | null
          slug?: string
          status?: string | null
          suspended_at?: string | null
          trial_ends_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      orqflow_custom_fields: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_private: boolean | null
          name: string
          project_id: string | null
          type: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          project_id?: string | null
          type: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          project_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "orqflow_custom_fields_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      orqflow_magic_links: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          status: string | null
          task_id: string
          token: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          task_id: string
          token?: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          task_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "orqflow_magic_links_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "orqflow_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      orqflow_sprints: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          name: string
          project_id: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          name: string
          project_id: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          name?: string
          project_id?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orqflow_sprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      orqflow_task_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          storage_path: string
          task_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          storage_path: string
          task_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          storage_path?: string
          task_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orqflow_task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "orqflow_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      orqflow_task_comments: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orqflow_task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "orqflow_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      orqflow_task_custom_values: {
        Row: {
          field_id: string
          task_id: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          field_id: string
          task_id: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          field_id?: string
          task_id?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "orqflow_task_custom_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "orqflow_custom_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orqflow_task_custom_values_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "orqflow_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      orqflow_task_dependencies: {
        Row: {
          created_at: string | null
          depends_on_task_id: string
          id: string
          task_id: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          depends_on_task_id: string
          id?: string
          task_id: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          depends_on_task_id?: string
          id?: string
          task_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orqflow_task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "orqflow_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orqflow_task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "orqflow_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      orqflow_tasks: {
        Row: {
          assignee_id: string | null
          content: Json | null
          created_at: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          position_order: number | null
          priority: string | null
          project_id: string
          sprint_id: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          content?: Json | null
          created_at?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          position_order?: number | null
          priority?: string | null
          project_id: string
          sprint_id?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          content?: Json | null
          created_at?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          position_order?: number | null
          priority?: string | null
          project_id?: string
          sprint_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orqflow_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orqflow_tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "orqflow_sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      orqflow_time_logs: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          end_time: string | null
          id: string
          start_time: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          start_time: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orqflow_time_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "orqflow_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stage_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          from_stage: string | null
          id: string
          notes: string | null
          rei_project_id: string
          to_stage: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          from_stage?: string | null
          id?: string
          notes?: string | null
          rei_project_id: string
          to_stage: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          from_stage?: string | null
          id?: string
          notes?: string | null
          rei_project_id?: string
          to_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stage_history_rei_project_id_fkey"
            columns: ["rei_project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          date: string | null
          excerpt: string | null
          id: string
          image: string | null
          is_template: boolean | null
          organization_id: string | null
          published: boolean | null
          read_time: string | null
          slug: string
          title: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          date?: string | null
          excerpt?: string | null
          id?: string
          image?: string | null
          is_template?: boolean | null
          organization_id?: string | null
          published?: boolean | null
          read_time?: string | null
          slug: string
          title: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          date?: string | null
          excerpt?: string | null
          id?: string
          image?: string | null
          is_template?: boolean | null
          organization_id?: string | null
          published?: boolean | null
          read_time?: string | null
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar: string | null
          avatar_url: string | null
          bio: string | null
          business_context: Json | null
          cpf: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          job_title: string | null
          name: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          personal_email: string | null
          role: string
          status: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_context?: Json | null
          cpf?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          personal_email?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_context?: Json | null
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          personal_email?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      project_sprints: {
        Row: {
          created_at: string
          end_date: string | null
          goals: string[] | null
          id: string
          project_id: string
          start_date: string | null
          status: string | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          goals?: string[] | null
          id?: string
          project_id: string
          start_date?: string | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          goals?: string[] | null
          id?: string
          project_id?: string
          start_date?: string | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_sprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assignee_id: string | null
          audited_by: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          magic_link_token: string | null
          position: number | null
          priority: string | null
          project_id: string
          sprint_id: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          visible_to_client: boolean | null
        }
        Insert: {
          assignee_id?: string | null
          audited_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          magic_link_token?: string | null
          position?: number | null
          priority?: string | null
          project_id: string
          sprint_id: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          visible_to_client?: boolean | null
        }
        Update: {
          assignee_id?: string | null
          audited_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          magic_link_token?: string | null
          position?: number | null
          priority?: string | null
          project_id?: string
          sprint_id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          visible_to_client?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_audited_by_fkey"
            columns: ["audited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "project_sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          access_token: string | null
          agenda_link: string | null
          bid_document_url: string | null
          brief_explanation: string | null
          call_detail_summary: string | null
          category: string | null
          client_contact_name: string | null
          client_email: string | null
          client_logo: string | null
          client_name: string | null
          created_at: string
          crm_data: Json | null
          detailed_scope: string | null
          headline: string | null
          id: string
          installment_count: number | null
          installment_value: string | null
          investment_total: string | null
          is_template: boolean | null
          loom_url: string | null
          manual_transcript: string | null
          mindmap_code: string | null
          mindmap_embed: string | null
          mindmap_url: string | null
          organization_id: string | null
          origin_template_id: string | null
          payment_terms: string | null
          proposal_source: string | null
          recording_url: string | null
          rei_project_id: string | null
          setup_fee: string | null
          slug: string
          status: string | null
          subheadline: string | null
          summary: string | null
          title: string
          transcript: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          agenda_link?: string | null
          bid_document_url?: string | null
          brief_explanation?: string | null
          call_detail_summary?: string | null
          category?: string | null
          client_contact_name?: string | null
          client_email?: string | null
          client_logo?: string | null
          client_name?: string | null
          created_at?: string
          crm_data?: Json | null
          detailed_scope?: string | null
          headline?: string | null
          id?: string
          installment_count?: number | null
          installment_value?: string | null
          investment_total?: string | null
          is_template?: boolean | null
          loom_url?: string | null
          manual_transcript?: string | null
          mindmap_code?: string | null
          mindmap_embed?: string | null
          mindmap_url?: string | null
          organization_id?: string | null
          origin_template_id?: string | null
          payment_terms?: string | null
          proposal_source?: string | null
          recording_url?: string | null
          rei_project_id?: string | null
          setup_fee?: string | null
          slug: string
          status?: string | null
          subheadline?: string | null
          summary?: string | null
          title: string
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          agenda_link?: string | null
          bid_document_url?: string | null
          brief_explanation?: string | null
          call_detail_summary?: string | null
          category?: string | null
          client_contact_name?: string | null
          client_email?: string | null
          client_logo?: string | null
          client_name?: string | null
          created_at?: string
          crm_data?: Json | null
          detailed_scope?: string | null
          headline?: string | null
          id?: string
          installment_count?: number | null
          installment_value?: string | null
          investment_total?: string | null
          is_template?: boolean | null
          loom_url?: string | null
          manual_transcript?: string | null
          mindmap_code?: string | null
          mindmap_embed?: string | null
          mindmap_url?: string | null
          organization_id?: string | null
          origin_template_id?: string | null
          payment_terms?: string | null
          proposal_source?: string | null
          recording_url?: string | null
          rei_project_id?: string | null
          setup_fee?: string | null
          slug?: string
          status?: string | null
          subheadline?: string | null
          summary?: string | null
          title?: string
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_origin_template_id_fkey"
            columns: ["origin_template_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_rei_project_id_fkey"
            columns: ["rei_project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rei_materials: {
        Row: {
          created_at: string | null
          description: string | null
          extracted_text: string | null
          file_url: string | null
          id: string
          material_type: string
          original_name: string | null
          project_id: string
          source_type: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          extracted_text?: string | null
          file_url?: string | null
          id?: string
          material_type?: string
          original_name?: string | null
          project_id: string
          source_type?: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          extracted_text?: string | null
          file_url?: string | null
          id?: string
          material_type?: string
          original_name?: string | null
          project_id?: string
          source_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rei_materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "rei_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rei_projects: {
        Row: {
          analyst_email: string
          client_company: string | null
          client_email: string
          client_id: string | null
          client_name: string
          client_site: string | null
          created_at: string | null
          diagnostico_id: string | null
          enrichment_data: Json | null
          id: string
          last_rei_date: string | null
          lead_source: string | null
          market_data: Json | null
          market_data_updated_at: string | null
          next_rei_date: string
          notion_sprint_id: string | null
          opportunity_data: Json | null
          organization_id: string | null
          pipeline_stage: string | null
          project_duration: string | null
          quarter: string
          scheduling_completed: boolean | null
          site_analysis: Json | null
          source: string | null
          status: string
          technical_evidences: Json | null
          trade_name: string | null
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
          client_site?: string | null
          created_at?: string | null
          diagnostico_id?: string | null
          enrichment_data?: Json | null
          id?: string
          last_rei_date?: string | null
          lead_source?: string | null
          market_data?: Json | null
          market_data_updated_at?: string | null
          next_rei_date: string
          notion_sprint_id?: string | null
          opportunity_data?: Json | null
          organization_id?: string | null
          pipeline_stage?: string | null
          project_duration?: string | null
          quarter: string
          scheduling_completed?: boolean | null
          site_analysis?: Json | null
          source?: string | null
          status?: string
          technical_evidences?: Json | null
          trade_name?: string | null
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
          client_site?: string | null
          created_at?: string | null
          diagnostico_id?: string | null
          enrichment_data?: Json | null
          id?: string
          last_rei_date?: string | null
          lead_source?: string | null
          market_data?: Json | null
          market_data_updated_at?: string | null
          next_rei_date?: string
          notion_sprint_id?: string | null
          opportunity_data?: Json | null
          organization_id?: string | null
          pipeline_stage?: string | null
          project_duration?: string | null
          quarter?: string
          scheduling_completed?: boolean | null
          site_analysis?: Json | null
          source?: string | null
          status?: string
          technical_evidences?: Json | null
          trade_name?: string | null
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
          {
            foreignKeyName: "rei_projects_diagnostico_id_fkey"
            columns: ["diagnostico_id"]
            isOneToOne: false
            referencedRelation: "diagnosticos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rei_projects_diagnostico_id_fkey"
            columns: ["diagnostico_id"]
            isOneToOne: false
            referencedRelation: "diagnosticos_resumo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rei_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      roles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          permissions: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          permissions: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          permissions?: Json
        }
        Relationships: []
      }
      scheduled_meetings: {
        Row: {
          attendees: Json | null
          created_at: string | null
          end_time: string | null
          google_event_id: string | null
          id: string
          meet_url: string
          organizer_email: string | null
          recording_found: boolean | null
          reminder_sent: boolean | null
          start_time: string
          title: string | null
        }
        Insert: {
          attendees?: Json | null
          created_at?: string | null
          end_time?: string | null
          google_event_id?: string | null
          id?: string
          meet_url: string
          organizer_email?: string | null
          recording_found?: boolean | null
          reminder_sent?: boolean | null
          start_time: string
          title?: string | null
        }
        Update: {
          attendees?: Json | null
          created_at?: string | null
          end_time?: string | null
          google_event_id?: string | null
          id?: string
          meet_url?: string
          organizer_email?: string | null
          recording_found?: boolean | null
          reminder_sent?: boolean | null
          start_time?: string
          title?: string | null
        }
        Relationships: []
      }
      strategic_plans: {
        Row: {
          access_token: string | null
          approved_at: string | null
          budget_data: Json | null
          client_id: string | null
          cover_data: Json | null
          created_at: string | null
          created_by: string | null
          diagnostic_data: Json | null
          financial_projections: Json | null
          goals_data: Json | null
          id: string
          methodology_data: Json | null
          next_steps_data: Json | null
          onboarding_data: Json | null
          persona_data: Json | null
          premises_data: Json | null
          rei_project_id: string | null
          rejected_at: string | null
          roadmap_data: Json | null
          sent_at: string | null
          sla_data: Json | null
          status: string | null
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          access_token?: string | null
          approved_at?: string | null
          budget_data?: Json | null
          client_id?: string | null
          cover_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          diagnostic_data?: Json | null
          financial_projections?: Json | null
          goals_data?: Json | null
          id?: string
          methodology_data?: Json | null
          next_steps_data?: Json | null
          onboarding_data?: Json | null
          persona_data?: Json | null
          premises_data?: Json | null
          rei_project_id?: string | null
          rejected_at?: string | null
          roadmap_data?: Json | null
          sent_at?: string | null
          sla_data?: Json | null
          status?: string | null
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          access_token?: string | null
          approved_at?: string | null
          budget_data?: Json | null
          client_id?: string | null
          cover_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          diagnostic_data?: Json | null
          financial_projections?: Json | null
          goals_data?: Json | null
          id?: string
          methodology_data?: Json | null
          next_steps_data?: Json | null
          onboarding_data?: Json | null
          persona_data?: Json | null
          premises_data?: Json | null
          rei_project_id?: string | null
          rejected_at?: string | null
          roadmap_data?: Json | null
          sent_at?: string | null
          sla_data?: Json | null
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
      user_preferences: {
        Row: {
          active_organization_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_organization_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_organization_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_active_organization_id_fkey"
            columns: ["active_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      audit_logs_enriched: {
        Row: {
          action: string | null
          changed_fields: string[] | null
          created_at: string | null
          id: string | null
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          organization_id: string | null
          organization_name: string | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      calculate_next_quarter: {
        Args: { p_ref_date: string }
        Returns: {
          quarter: string
          start_date: string
          year: number
        }[]
      }
      cancel_organization_deletion: {
        Args: { p_org_id: string }
        Returns: undefined
      }
      clone_proposal_template: {
        Args: {
          p_new_title: string
          p_target_org_id: string
          p_template_id: string
        }
        Returns: string
      }
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
      encrypt_token: { Args: { t: string }; Returns: string }
      execute_scheduled_deletions: { Args: never; Returns: number }
      generate_strategic_plan: {
        Args: { p_rei_project_id: string }
        Returns: string
      }
      get_active_organization: { Args: never; Returns: string }
      get_my_organizations: { Args: never; Returns: string[] }
      get_proposal_by_slug: { Args: { slug_input: string }; Returns: Json }
      get_user_org_ids: { Args: never; Returns: string[] }
      is_admin_of: { Args: { org_id: string }; Returns: boolean }
      is_member_of: { Args: { org_id: string }; Returns: boolean }
      is_org_admin: { Args: { org_id: string }; Returns: boolean }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
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
      reactivate_organization: {
        Args: { p_org_id: string }
        Returns: undefined
      }
      schedule_organization_deletion: {
        Args: { p_org_id: string; p_reason?: string }
        Returns: string
      }
      set_active_organization: { Args: { org_id: string }; Returns: undefined }
      suspend_organization: { Args: { p_org_id: string }; Returns: undefined }
      update_rei_status: { Args: never; Returns: undefined }
      user_has_permission: {
        Args: {
          p_action: string
          p_org_id: string
          p_resource: string
          p_user_id: string
        }
        Returns: boolean
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
