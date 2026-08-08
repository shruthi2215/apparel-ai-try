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
      analytics_events: {
        Row: {
          category: string | null
          color: string | null
          country: string | null
          created_at: string
          device_type: string | null
          duration_ms: number | null
          event_type: string
          id: string
          merchant_id: string | null
          metadata: Json
          product_id: string | null
          product_name: string | null
          session_id: string | null
          size: string | null
          status: string | null
          user_id: string | null
          value_cents: number | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          event_type: string
          id?: string
          merchant_id?: string | null
          metadata?: Json
          product_id?: string | null
          product_name?: string | null
          session_id?: string | null
          size?: string | null
          status?: string | null
          user_id?: string | null
          value_cents?: number | null
        }
        Update: {
          category?: string | null
          color?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          event_type?: string
          id?: string
          merchant_id?: string | null
          metadata?: Json
          product_id?: string | null
          product_name?: string | null
          session_id?: string | null
          size?: string | null
          status?: string | null
          user_id?: string | null
          value_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          expiry_alert_sent_at: string | null
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
          expires_at?: string | null
          expiry_alert_sent_at?: string | null
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
          expires_at?: string | null
          expiry_alert_sent_at?: string | null
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
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_user_id: string | null
          created_at: string
          id: string
          ip: string | null
          merchant_id: string | null
          metadata: Json
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          merchant_id?: string | null
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          merchant_id?: string | null
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          merchant_id: string | null
          price: number | null
          product_id: string | null
          quantity: number
          size: string | null
          updated_at: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          merchant_id?: string | null
          price?: number | null
          product_id?: string | null
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          merchant_id?: string | null
          price?: number | null
          product_id?: string | null
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          description: string | null
          id: string
          issued_at: string
          merchant_id: string
          paid_at: string | null
          period_end: string | null
          period_start: string | null
          provider_invoice_id: string | null
          status: string
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          issued_at?: string
          merchant_id: string
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          provider_invoice_id?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          issued_at?: string
          merchant_id?: string
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          provider_invoice_id?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "merchant_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_members: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_at: string
          invited_by: string | null
          joined_at: string | null
          merchant_id: string
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          joined_at?: string | null
          merchant_id: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          joined_at?: string | null
          merchant_id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_members_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string
          id: string
          merchant_id: string
          plan_id: string | null
          provider: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          merchant_id: string
          plan_id?: string | null
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          merchant_id?: string
          plan_id?: string | null
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_subscriptions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          gstin: string | null
          id: string
          mobile: string | null
          monthly_quota: number
          name: string
          owner_user_id: string
          plan_id: string | null
          rate_limit_per_min: number
          status: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          gstin?: string | null
          id?: string
          mobile?: string | null
          monthly_quota?: number
          name: string
          owner_user_id: string
          plan_id?: string | null
          rate_limit_per_min?: number
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          gstin?: string | null
          id?: string
          mobile?: string | null
          monthly_quota?: number
          name?: string
          owner_user_id?: string
          plan_id?: string | null
          rate_limit_per_min?: number
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          audience: string
          body: string | null
          category: string | null
          created_at: string
          id: string
          link: string | null
          merchant_id: string | null
          read_at: string | null
          severity: string
          title: string
          user_id: string | null
        }
        Insert: {
          audience?: string
          body?: string | null
          category?: string | null
          created_at?: string
          id?: string
          link?: string | null
          merchant_id?: string | null
          read_at?: string | null
          severity?: string
          title: string
          user_id?: string | null
        }
        Update: {
          audience?: string
          body?: string | null
          category?: string | null
          created_at?: string
          id?: string
          link?: string | null
          merchant_id?: string | null
          read_at?: string | null
          severity?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          color: string | null
          created_at: string
          id: string
          merchant_id: string | null
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
          merchant_id?: string | null
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
          merchant_id?: string | null
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
            foreignKeyName: "orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string
          id: string
          image_url: string | null
          merchant_id: string | null
          price: number | null
          product_id: string
          size: string | null
          sku: string | null
          stock_count: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          merchant_id?: string | null
          price?: number | null
          product_id: string
          size?: string | null
          sku?: string | null
          stock_count?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          merchant_id?: string | null
          price?: number | null
          product_id?: string
          size?: string | null
          sku?: string | null
          stock_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
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
          merchant_id: string | null
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
          merchant_id?: string | null
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
          merchant_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "products_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
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
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          features: Json
          id: string
          interval: string
          is_active: boolean
          monthly_quota: number
          name: string
          period_days: number
          price_cents: number
          rate_limit_per_min: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          interval?: string
          is_active?: boolean
          monthly_quota?: number
          name: string
          period_days?: number
          price_cents?: number
          rate_limit_per_min?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          interval?: string
          is_active?: boolean
          monthly_quota?: number
          name?: string
          period_days?: number
          price_cents?: number
          rate_limit_per_min?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          id: string
          merchant_id: string | null
          message: string
          priority: string
          requester_email: string | null
          resolution: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          merchant_id?: string | null
          message: string
          priority?: string
          requester_email?: string | null
          resolution?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          merchant_id?: string | null
          message?: string
          priority?: string
          requester_email?: string | null
          resolution?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      try_on_sessions: {
        Row: {
          ai_analysis: Json | null
          ai_suggestions: string[] | null
          created_at: string
          id: string
          merchant_id: string | null
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
          merchant_id?: string | null
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
          merchant_id?: string | null
          product_id?: string | null
          result_photo_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          user_photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "try_on_sessions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
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
      usage_records: {
        Row: {
          cost_cents: number
          created_at: string
          id: string
          latency_ms: number | null
          merchant_id: string | null
          metadata: Json
          model: string | null
          provider: string | null
          quantity: number
          status: string
          usage_type: string
          user_id: string | null
        }
        Insert: {
          cost_cents?: number
          created_at?: string
          id?: string
          latency_ms?: number | null
          merchant_id?: string | null
          metadata?: Json
          model?: string | null
          provider?: string | null
          quantity?: number
          status?: string
          usage_type: string
          user_id?: string | null
        }
        Update: {
          cost_cents?: number
          created_at?: string
          id?: string
          latency_ms?: number | null
          merchant_id?: string | null
          metadata?: Json
          model?: string | null
          provider?: string | null
          quantity?: number
          status?: string
          usage_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_avatars: {
        Row: {
          avatar_asset_url: string | null
          body_size: string
          consent_given: boolean
          created_at: string
          face_data: Json
          face_photo_path: string | null
          gender: string
          height_cm: number | null
          id: string
          skin_tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_asset_url?: string | null
          body_size?: string
          consent_given?: boolean
          created_at?: string
          face_data?: Json
          face_photo_path?: string | null
          gender: string
          height_cm?: number | null
          id?: string
          skin_tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_asset_url?: string | null
          body_size?: string
          consent_given?: boolean
          created_at?: string
          face_data?: Json
          face_photo_path?: string | null
          gender?: string
          height_cm?: number | null
          id?: string
          skin_tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_measurements: {
        Row: {
          bust_cm: number | null
          consent_given: boolean
          created_at: string
          height_cm: number | null
          hip_cm: number | null
          id: string
          inseam_cm: number | null
          preferred_size: string | null
          shoulder_cm: number | null
          updated_at: string
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          bust_cm?: number | null
          consent_given?: boolean
          created_at?: string
          height_cm?: number | null
          hip_cm?: number | null
          id?: string
          inseam_cm?: number | null
          preferred_size?: string | null
          shoulder_cm?: number | null
          updated_at?: string
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          bust_cm?: number | null
          consent_given?: boolean
          created_at?: string
          height_cm?: number | null
          hip_cm?: number | null
          id?: string
          inseam_cm?: number | null
          preferred_size?: string | null
          shoulder_cm?: number | null
          updated_at?: string
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
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
          merchant_id: string | null
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          merchant_id?: string | null
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          merchant_id?: string | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
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
      app_role: "super_admin" | "admin" | "user" | "merchant" | "staff"
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
      app_role: ["super_admin", "admin", "user", "merchant", "staff"],
    },
  },
} as const
