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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          merchant_id: string
          name: string | null
          revoked: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          merchant_id: string
          name?: string | null
          revoked?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          merchant_id?: string
          name?: string | null
          revoked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_user_id: string
          status: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_user_id: string
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          color: string | null
          created_at: string
          id: string
          price: number
          product_id: string | null
          product_image: string | null
          product_name: string | null
          quantity: number
          size: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          price: number
          product_id?: string | null
          product_image?: string | null
          product_name?: string | null
          quantity?: number
          size?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          price?: number
          product_id?: string | null
          product_image?: string | null
          product_name?: string | null
          quantity?: number
          size?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string
          colors: string[] | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          in_stock: boolean
          is_trending: boolean
          name: string
          original_price: number | null
          price: number
          rating: number | null
          reviews_count: number | null
          sizes: string[] | null
          stock_count: number | null
          tags: string[] | null
          try_on_image_url: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string
          colors?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          is_trending?: boolean
          name: string
          original_price?: number | null
          price?: number
          rating?: number | null
          reviews_count?: number | null
          sizes?: string[] | null
          stock_count?: number | null
          tags?: string[] | null
          try_on_image_url?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          colors?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          is_trending?: boolean
          name?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          reviews_count?: number | null
          sizes?: string[] | null
          stock_count?: number | null
          tags?: string[] | null
          try_on_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          body_height_cm: number | null
          body_weight_kg: number | null
          created_at: string
          display_name: string | null
          gender: string | null
          id: string
          is_blocked: boolean
          phone: string | null
          preferred_fit: string | null
          skin_tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          body_height_cm?: number | null
          body_weight_kg?: number | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          is_blocked?: boolean
          phone?: string | null
          preferred_fit?: string | null
          skin_tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          body_height_cm?: number | null
          body_weight_kg?: number | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          is_blocked?: boolean
          phone?: string | null
          preferred_fit?: string | null
          skin_tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      try_on_sessions: {
        Row: {
          ai_analysis: Json | null
          ai_suggestions: string[] | null
          created_at: string
          id: string
          product_id: string | null
          result_photo_url: string | null
          status: string
          updated_at: string
          user_id: string
          user_photo_url: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          ai_suggestions?: string[] | null
          created_at?: string
          id?: string
          product_id?: string | null
          result_photo_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          user_photo_url?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          ai_suggestions?: string[] | null
          created_at?: string
          id?: string
          product_id?: string | null
          result_photo_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          user_photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "try_on_sessions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      tryon_requests: {
        Row: {
          created_at: string
          error_code: string | null
          id: string
          latency_ms: number | null
          merchant_id: string
          product_id: string | null
          product_name: string | null
          request_id: string
          status: string
        }
        Insert: {
          created_at?: string
          error_code?: string | null
          id?: string
          latency_ms?: number | null
          merchant_id: string
          product_id?: string | null
          product_name?: string | null
          request_id: string
          status: string
        }
        Update: {
          created_at?: string
          error_code?: string | null
          id?: string
          latency_ms?: number | null
          merchant_id?: string
          product_id?: string | null
          product_name?: string | null
          request_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tryon_requests_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
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
      app_role: "super_admin" | "admin" | "user"
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
    Enums: {
      app_role: ["super_admin", "admin", "user"],
    },
  },
} as const
