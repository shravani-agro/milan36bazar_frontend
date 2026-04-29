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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          balance: number
          created_at: string
          id: string
          name: string
          phone: string
          status: Database["public"]["Enums"]["user_status"]
          total_bonus: number
          total_game_amount: number
          total_withdraw: number
          total_won: number
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          name: string
          phone: string
          status?: Database["public"]["Enums"]["user_status"]
          total_bonus?: number
          total_game_amount?: number
          total_withdraw?: number
          total_won?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          name?: string
          phone?: string
          status?: Database["public"]["Enums"]["user_status"]
          total_bonus?: number
          total_game_amount?: number
          total_withdraw?: number
          total_won?: number
          updated_at?: string
        }
        Relationships: []
      }
      balance_transactions: {
        Row: {
          amount: number
          app_user_id: string
          balance_after: number
          balance_before: number
          created_at: string
          created_by: string | null
          id: string
          reason: string | null
          transaction_type: Database["public"]["Enums"]["balance_transaction_type"]
        }
        Insert: {
          amount: number
          app_user_id: string
          balance_after: number
          balance_before: number
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
          transaction_type: Database["public"]["Enums"]["balance_transaction_type"]
        }
        Update: {
          amount?: number
          app_user_id?: string
          balance_after?: number
          balance_before?: number
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
          transaction_type?: Database["public"]["Enums"]["balance_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "balance_transactions_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          app_user_id: string
          bid_date: string
          bid_type: Database["public"]["Enums"]["bid_type"]
          created_at: string
          id: string
          market_id: string
          number_played: string
          status: Database["public"]["Enums"]["bid_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          app_user_id: string
          bid_date?: string
          bid_type: Database["public"]["Enums"]["bid_type"]
          created_at?: string
          id?: string
          market_id: string
          number_played: string
          status?: Database["public"]["Enums"]["bid_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          app_user_id?: string
          bid_date?: string
          bid_type?: Database["public"]["Enums"]["bid_type"]
          created_at?: string
          id?: string
          market_id?: string
          number_played?: string
          status?: Database["public"]["Enums"]["bid_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "market_bid_records"
            referencedColumns: ["market_id"]
          },
          {
            foreignKeyName: "bids_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          created_at: string
          id: string
          market_name: string
          open_time: string
          status: Database["public"]["Enums"]["market_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_name: string
          open_time: string
          status?: Database["public"]["Enums"]["market_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          market_name?: string
          open_time?: string
          status?: Database["public"]["Enums"]["market_status"]
          updated_at?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          created_at: string
          id: string
          market_id: string
          open_digit: number
          open_pana: string
          result_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_id: string
          open_digit: number
          open_pana: string
          result_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          market_id?: string
          open_digit?: number
          open_pana?: string
          result_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "market_bid_records"
            referencedColumns: ["market_id"]
          },
          {
            foreignKeyName: "results_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
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
      win_history: {
        Row: {
          amount: number
          app_user_id: string | null
          created_at: string
          id: string
          market_id: string | null
          market_name: string
          number_played: string
          win_amount: number
          winner_name: string
          winner_phone: string
        }
        Insert: {
          amount: number
          app_user_id?: string | null
          created_at?: string
          id?: string
          market_id?: string | null
          market_name: string
          number_played: string
          win_amount: number
          winner_name: string
          winner_phone: string
        }
        Update: {
          amount?: number
          app_user_id?: string | null
          created_at?: string
          id?: string
          market_id?: string | null
          market_name?: string
          number_played?: string
          win_amount?: number
          winner_name?: string
          winner_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "win_history_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "win_history_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "market_bid_records"
            referencedColumns: ["market_id"]
          },
          {
            foreignKeyName: "win_history_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      withdraw_details: {
        Row: {
          account_holder_name: string
          account_number: string
          app_user_id: string | null
          created_at: string
          id: string
          ifsc_code: string
          updated_at: string
          upi_id: string | null
          upi_name: string | null
          user_name: string
        }
        Insert: {
          account_holder_name: string
          account_number: string
          app_user_id?: string | null
          created_at?: string
          id?: string
          ifsc_code: string
          updated_at?: string
          upi_id?: string | null
          upi_name?: string | null
          user_name: string
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          app_user_id?: string | null
          created_at?: string
          id?: string
          ifsc_code?: string
          updated_at?: string
          upi_id?: string | null
          upi_name?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdraw_details_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      market_bid_records: {
        Row: {
          date: string | null
          double_pana: number | null
          market_id: string | null
          market_name: string | null
          single_digit_0: number | null
          single_digit_1: number | null
          single_digit_2: number | null
          single_digit_3: number | null
          single_digit_4: number | null
          single_digit_5: number | null
          single_digit_6: number | null
          single_digit_7: number | null
          single_digit_8: number | null
          single_digit_9: number | null
          single_pana: number | null
          total_bid_amount: number | null
          total_bids: number | null
          triple_pana: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      adjust_app_user_balance: {
        Args: {
          _amount: number
          _app_user_id: string
          _reason?: string
          _transaction_type: Database["public"]["Enums"]["balance_transaction_type"]
        }
        Returns: {
          balance: number
          created_at: string
          id: string
          name: string
          phone: string
          status: Database["public"]["Enums"]["user_status"]
          total_bonus: number
          total_game_amount: number
          total_withdraw: number
          total_won: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "app_users"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_any_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      balance_transaction_type:
        | "add"
        | "deduct"
        | "deposit"
        | "withdraw"
        | "bonus"
        | "win"
        | "bid"
      bid_status: "pending" | "won" | "lost" | "cancelled"
      bid_type: "single_digit" | "single_pana" | "double_pana" | "triple_pana"
      market_status: "open" | "closed"
      user_status: "blocked" | "unblocked"
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
      app_role: ["admin"],
      balance_transaction_type: [
        "add",
        "deduct",
        "deposit",
        "withdraw",
        "bonus",
        "win",
        "bid",
      ],
      bid_status: ["pending", "won", "lost", "cancelled"],
      bid_type: ["single_digit", "single_pana", "double_pana", "triple_pana"],
      market_status: ["open", "closed"],
      user_status: ["blocked", "unblocked"],
    },
  },
} as const
