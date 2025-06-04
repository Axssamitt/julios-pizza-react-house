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
      admins: {
        Row: {
          created_at: string
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      carousel_images: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          image_url: string
          order_index: number | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          image_url: string
          order_index?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          image_url?: string
          order_index?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          label: string
          ordem: number | null
          tipo: string
          updated_at: string
          valor: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          label: string
          ordem?: number | null
          tipo: string
          updated_at?: string
          valor: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          label?: string
          ordem?: number | null
          tipo?: string
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      formularios_contato: {
        Row: {
          cpf: string
          created_at: string
          data_evento: string
          endereco: string
          endereco_evento: string
          horario: string
          id: string
          nome_completo: string
          observacoes: string | null
          quantidade_adultos: number
          quantidade_criancas: number | null
          status: string | null
          telefone: string
        }
        Insert: {
          cpf: string
          created_at?: string
          data_evento: string
          endereco: string
          endereco_evento: string
          horario: string
          id?: string
          nome_completo: string
          observacoes?: string | null
          quantidade_adultos: number
          quantidade_criancas?: number | null
          status?: string | null
          telefone: string
        }
        Update: {
          cpf?: string
          created_at?: string
          data_evento?: string
          endereco?: string
          endereco_evento?: string
          horario?: string
          id?: string
          nome_completo?: string
          observacoes?: string | null
          quantidade_adultos?: number
          quantidade_criancas?: number | null
          status?: string | null
          telefone?: string
        }
        Relationships: []
      }
      home_config: {
        Row: {
          hero_subtitle: string
          hero_title: string
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          hero_subtitle?: string
          hero_title?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          hero_subtitle?: string
          hero_title?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      page_analytics: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          page_path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          page_path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      pizzas: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          imagem_url: string | null
          ingredientes: string
          nome: string
          ordem: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          imagem_url?: string | null
          ingredientes: string
          nome: string
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          imagem_url?: string | null
          ingredientes?: string
          nome?: string
          ordem?: number | null
          updated_at?: string
        }
        Relationships: []
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
