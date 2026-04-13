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
      campaign_entries: {
        Row: {
          id: string
          campaign_id: string
          store_id: string
          data: Json
          receipt_image_url: string | null
          receipt_amount: number | null
          registered_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          store_id: string
          data?: Json
          receipt_image_url?: string | null
          receipt_amount?: number | null
          registered_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          store_id?: string
          data?: Json
          receipt_image_url?: string | null
          receipt_amount?: number | null
          registered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_entries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_entries_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_stores: {
        Row: {
          id: string
          campaign_id: string
          store_id: string
        }
        Insert: {
          id?: string
          campaign_id: string
          store_id: string
        }
        Update: {
          id?: string
          campaign_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_stores_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_stores_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          id: string
          title: string
          description: string | null
          min_amount: number | null
          form_fields: Json
          status: string
          start_date: string | null
          end_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          min_amount?: number | null
          form_fields?: Json
          status?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          min_amount?: number | null
          form_fields?: Json
          status?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          current_attendees: number
          date: string
          description: string | null
          form_fields: Json
          id: string
          image_position: Json | null
          image_url: string | null
          location: string
          max_attendees: number
          show_booked_seats: boolean
          status: string
          time: string
          title: string
        }
        Insert: {
          created_at?: string
          current_attendees?: number
          date: string
          description?: string | null
          form_fields?: Json
          id?: string
          image_position?: Json | null
          image_url?: string | null
          location: string
          max_attendees?: number
          show_booked_seats?: boolean
          status?: string
          time: string
          title: string
        }
        Update: {
          created_at?: string
          current_attendees?: number
          date?: string
          description?: string | null
          form_fields?: Json
          id?: string
          image_position?: Json | null
          image_url?: string | null
          location?: string
          max_attendees?: number
          show_booked_seats?: boolean
          status?: string
          time?: string
          title?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          data: Json
          event_id: string
          id: string
          registered_at: string
        }
        Insert: {
          data?: Json
          event_id: string
          id?: string
          registered_at?: string
        }
        Update: {
          data?: Json
          event_id?: string
          id?: string
          registered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          time: string | null
          location: string | null
          staff_needed: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          time?: string | null
          location?: string | null
          staff_needed?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          time?: string | null
          location?: string | null
          staff_needed?: number
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      staff_signups: {
        Row: {
          id: string
          event_id: string
          name: string
          email: string | null
          phone: string | null
          signed_up_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          email?: string | null
          phone?: string | null
          signed_up_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          signed_up_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_signups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "staff_events"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          id: string
          name: string
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          created_at?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
