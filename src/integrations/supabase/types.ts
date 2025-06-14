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
      carousel_images: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          ordem: number | null
          titulo: string
          updated_at: string
          url_imagem: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          ordem?: number | null
          titulo: string
          updated_at?: string
          url_imagem: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          ordem?: number | null
          titulo?: string
          updated_at?: string
          url_imagem?: string
        }
        Relationships: []
      }
      configuracao_email: {
        Row: {
          ativo: boolean
          atualizado_em: string | null
          criado_em: string | null
          descricao: string
          email_remetente: string
          id: string
          smtp_host: string
          smtp_pass: string
          smtp_port: number
          smtp_user: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string | null
          criado_em?: string | null
          descricao: string
          email_remetente: string
          id?: string
          smtp_host: string
          smtp_pass: string
          smtp_port: number
          smtp_user: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string | null
          criado_em?: string | null
          descricao?: string
          email_remetente?: string
          id?: string
          smtp_host?: string
          smtp_pass?: string
          smtp_port?: number
          smtp_user?: string
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          ativo: boolean
          chave: string
          created_at: string
          descricao: string | null
          id: string
          updated_at: string
          valor: string
        }
        Insert: {
          ativo?: boolean
          chave: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor: string
        }
        Update: {
          ativo?: boolean
          chave?: string
          created_at?: string
          descricao?: string | null
          id?: string
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
          status: string
          telefone: string
          updated_at: string
          valor_entrada: number | null
          valor_total: number | null
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
          status?: string
          telefone: string
          updated_at?: string
          valor_entrada?: number | null
          valor_total?: number | null
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
          status?: string
          telefone?: string
          updated_at?: string
          valor_entrada?: number | null
          valor_total?: number | null
        }
        Relationships: []
      }
      home_config: {
        Row: {
          align_subtitulo_hero: string | null
          align_titulo_hero: string | null
          atualizado_por: string | null
          endereco: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          nome_empresa: string | null
          subtitulo_hero: string
          telefone: string | null
          texto_sobre: string | null
          titulo_hero: string
          updated_at: string
          visivel_endereco: boolean | null
          visivel_facebook: boolean | null
          visivel_instagram: boolean | null
          visivel_nome_empresa: boolean | null
          visivel_sobre: boolean | null
          visivel_telefone: boolean | null
        }
        Insert: {
          align_subtitulo_hero?: string | null
          align_titulo_hero?: string | null
          atualizado_por?: string | null
          endereco?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          nome_empresa?: string | null
          subtitulo_hero?: string
          telefone?: string | null
          texto_sobre?: string | null
          titulo_hero?: string
          updated_at?: string
          visivel_endereco?: boolean | null
          visivel_facebook?: boolean | null
          visivel_instagram?: boolean | null
          visivel_nome_empresa?: boolean | null
          visivel_sobre?: boolean | null
          visivel_telefone?: boolean | null
        }
        Update: {
          align_subtitulo_hero?: string | null
          align_titulo_hero?: string | null
          atualizado_por?: string | null
          endereco?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          nome_empresa?: string | null
          subtitulo_hero?: string
          telefone?: string | null
          texto_sobre?: string | null
          titulo_hero?: string
          updated_at?: string
          visivel_endereco?: boolean | null
          visivel_facebook?: boolean | null
          visivel_instagram?: boolean | null
          visivel_nome_empresa?: boolean | null
          visivel_sobre?: boolean | null
          visivel_telefone?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "home_config_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_posts: {
        Row: {
          ativo: boolean | null
          comentarios: number | null
          created_at: string
          curtidas: number | null
          descricao: string | null
          id: string
          ordem: number | null
          titulo: string
          updated_at: string
          url_imagem: string
          url_post: string
        }
        Insert: {
          ativo?: boolean | null
          comentarios?: number | null
          created_at?: string
          curtidas?: number | null
          descricao?: string | null
          id?: string
          ordem?: number | null
          titulo: string
          updated_at?: string
          url_imagem: string
          url_post: string
        }
        Update: {
          ativo?: boolean | null
          comentarios?: number | null
          created_at?: string
          curtidas?: number | null
          descricao?: string | null
          id?: string
          ordem?: number | null
          titulo?: string
          updated_at?: string
          url_imagem?: string
          url_post?: string
        }
        Relationships: []
      }
      page_analytics: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          pagina: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          pagina: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          pagina?: string
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
          tipo: string | null
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
          tipo?: string | null
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
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
          senha: string
          tipo: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          nome: string
          senha: string
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          senha?: string
          tipo?: string | null
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
