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
      customers: {
        Row: {
          id: string
          stripe_customer_id: string | null
          stripe_customer_id_test: string | null
        }
        Insert: {
          id: string
          stripe_customer_id?: string | null
          stripe_customer_id_test?: string | null
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
          stripe_customer_id_test?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          customer_to_email: string | null
          id: string
          name: string | null
          owner: string | null
          paid: boolean | null
          processed: boolean | null
          slack_notified: boolean | null
          storage_path: string | null
          total_leads: number | null
          type: string | null
        }
        Insert: {
          created_at?: string
          customer_to_email?: string | null
          id?: string
          name?: string | null
          owner?: string | null
          paid?: boolean | null
          processed?: boolean | null
          slack_notified?: boolean | null
          storage_path?: string | null
          total_leads?: number | null
          type?: string | null
        }
        Update: {
          created_at?: string
          customer_to_email?: string | null
          id?: string
          name?: string | null
          owner?: string | null
          paid?: boolean | null
          processed?: boolean | null
          slack_notified?: boolean | null
          storage_path?: string | null
          total_leads?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_documents_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          company_description: string | null
          company_name: string | null
          company_website: string | null
          created_at: string
          document_id: string
          domain: string
          id: string
          person_email: string | null
          person_full_name: string | null
          person_linkedin_url: string | null
          person_telegram_url: string | null
          person_twitter_url: string | null
          processed: boolean
        }
        Insert: {
          company_description?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          document_id: string
          domain: string
          id?: string
          person_email?: string | null
          person_full_name?: string | null
          person_linkedin_url?: string | null
          person_telegram_url?: string | null
          person_twitter_url?: string | null
          processed?: boolean
        }
        Update: {
          company_description?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          document_id?: string
          domain?: string
          id?: string
          person_email?: string | null
          person_full_name?: string | null
          person_linkedin_url?: string | null
          person_telegram_url?: string | null
          person_twitter_url?: string | null
          processed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "public_domains_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      domains_duplicate: {
        Row: {
          company_description: string | null
          company_name: string | null
          company_website: string | null
          created_at: string
          document_id: string
          domain: string
          person_email: string | null
          person_full_name: string | null
          person_linkedin_url: string | null
          person_telegram_url: string | null
          person_twitter_url: string | null
          processed: boolean
        }
        Insert: {
          company_description?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          document_id: string
          domain: string
          person_email?: string | null
          person_full_name?: string | null
          person_linkedin_url?: string | null
          person_telegram_url?: string | null
          person_twitter_url?: string | null
          processed?: boolean
        }
        Update: {
          company_description?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          document_id?: string
          domain?: string
          person_email?: string | null
          person_full_name?: string | null
          person_linkedin_url?: string | null
          person_telegram_url?: string | null
          person_twitter_url?: string | null
          processed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "public_domains_duplicate_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          document_id: string
          email: string
          processed: boolean
        }
        Insert: {
          document_id: string
          email: string
          processed?: boolean
        }
        Update: {
          document_id?: string
          email?: string
          processed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "document_leads_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: string | null
          company_address: string | null
          company_description: string | null
          company_industry: string | null
          company_linkedin_url: string | null
          company_metrics_annual_revenue: string | null
          company_money_raised: string | null
          company_name: string | null
          company_num_employees: string | null
          company_tech_stack: string | null
          company_twitter_url: string | null
          company_website: string | null
          created_at: string
          email: string
          last_updated: string
          lead_id: string
          person_age: string | null
          person_bio: string | null
          person_education_summary: string | null
          person_employment_title: string | null
          person_estimated_salary: string | null
          person_full_name: string | null
          person_gender: string | null
          person_linkedin_url: string | null
          person_location: string | null
          person_twitter_url: string | null
          person_website: string | null
          processed: boolean | null
          relevant_info: string | null
          workflow_run_id: string | null
        }
        Insert: {
          about?: string | null
          company_address?: string | null
          company_description?: string | null
          company_industry?: string | null
          company_linkedin_url?: string | null
          company_metrics_annual_revenue?: string | null
          company_money_raised?: string | null
          company_name?: string | null
          company_num_employees?: string | null
          company_tech_stack?: string | null
          company_twitter_url?: string | null
          company_website?: string | null
          created_at?: string
          email: string
          last_updated?: string
          lead_id?: string
          person_age?: string | null
          person_bio?: string | null
          person_education_summary?: string | null
          person_employment_title?: string | null
          person_estimated_salary?: string | null
          person_full_name?: string | null
          person_gender?: string | null
          person_linkedin_url?: string | null
          person_location?: string | null
          person_twitter_url?: string | null
          person_website?: string | null
          processed?: boolean | null
          relevant_info?: string | null
          workflow_run_id?: string | null
        }
        Update: {
          about?: string | null
          company_address?: string | null
          company_description?: string | null
          company_industry?: string | null
          company_linkedin_url?: string | null
          company_metrics_annual_revenue?: string | null
          company_money_raised?: string | null
          company_name?: string | null
          company_num_employees?: string | null
          company_tech_stack?: string | null
          company_twitter_url?: string | null
          company_website?: string | null
          created_at?: string
          email?: string
          last_updated?: string
          lead_id?: string
          person_age?: string | null
          person_bio?: string | null
          person_education_summary?: string | null
          person_employment_title?: string | null
          person_estimated_salary?: string | null
          person_full_name?: string | null
          person_gender?: string | null
          person_linkedin_url?: string | null
          person_location?: string | null
          person_twitter_url?: string | null
          person_website?: string | null
          processed?: boolean | null
          relevant_info?: string | null
          workflow_run_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          full_name: string | null
          id: string
          payment_method: Json | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id: string
          payment_method?: Json | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id?: string
          payment_method?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "public_users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
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
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
