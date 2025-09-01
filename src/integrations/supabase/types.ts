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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      catalogue_items: {
        Row: {
          catalogue_id: string
          created_at: string
          id: string
          item_tags: string[] | null
          item_text: string
          item_type: string
          original_item_id: string
          original_retro_id: string
          saved_from_user_id: string
          saved_from_user_name: string
          user_id: string
        }
        Insert: {
          catalogue_id: string
          created_at?: string
          id?: string
          item_tags?: string[] | null
          item_text: string
          item_type: string
          original_item_id: string
          original_retro_id: string
          saved_from_user_id: string
          saved_from_user_name: string
          user_id: string
        }
        Update: {
          catalogue_id?: string
          created_at?: string
          id?: string
          item_tags?: string[] | null
          item_text?: string
          item_type?: string
          original_item_id?: string
          original_retro_id?: string
          saved_from_user_id?: string
          saved_from_user_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogue_items_catalogue_id_fkey"
            columns: ["catalogue_id"]
            isOneToOne: false
            referencedRelation: "catalogues"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogue_members: {
        Row: {
          catalogue_id: string
          created_at: string
          id: string
          invited_by_user_id: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          catalogue_id: string
          created_at?: string
          id?: string
          invited_by_user_id: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          catalogue_id?: string
          created_at?: string
          id?: string
          invited_by_user_id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogue_members_catalogue_id_fkey"
            columns: ["catalogue_id"]
            isOneToOne: false
            referencedRelation: "catalogues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalogue_members_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalogue_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogues: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogues_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_spaces: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          owner_id: string
          state: string | null
          title: string
          unique_code: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          owner_id: string
          state?: string | null
          title: string
          unique_code: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          owner_id?: string
          state?: string | null
          title?: string
          unique_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      friend_invitations: {
        Row: {
          created_at: string | null
          from_user_id: string | null
          id: string
          normalized_to_email: string | null
          status: string | null
          to_email: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          normalized_to_email?: string | null
          status?: string | null
          to_email: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          normalized_to_email?: string | null
          status?: string | null
          to_email?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friend_invitations_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string | null
          friend_id: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      node_attachments: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          node_id: string
          storage_path: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          node_id: string
          storage_path: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          node_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "node_attachments_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "retro_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      node_tags: {
        Row: {
          created_at: string
          id: string
          node_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          node_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          node_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "node_tags_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "retro_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_item_id: string | null
          related_retro_id: string | null
          related_user_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_item_id?: string | null
          related_retro_id?: string | null
          related_user_id?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_item_id?: string | null
          related_retro_id?: string | null
          related_user_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notifications_related_retro_id"
            columns: ["related_retro_id"]
            isOneToOne: false
            referencedRelation: "retrospectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notifications_related_user_id"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notifications_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Profiles: {
        Row: {
          bio: number | null
          created_at: string
          id: number
          "Unique ID": string | null
          usernam: string | null
        }
        Insert: {
          bio?: number | null
          created_at?: string
          id?: number
          "Unique ID"?: string | null
          usernam?: string | null
        }
        Update: {
          bio?: number | null
          created_at?: string
          id?: number
          "Unique ID"?: string | null
          usernam?: string | null
        }
        Relationships: []
      }
      rbt_entries: {
        Row: {
          author_id: string
          bud: string | null
          created_at: string
          id: string
          is_current: boolean | null
          node_id: string
          rose: string | null
          thorn: string | null
          visibility: Database["public"]["Enums"]["visibility_type"] | null
        }
        Insert: {
          author_id: string
          bud?: string | null
          created_at?: string
          id?: string
          is_current?: boolean | null
          node_id: string
          rose?: string | null
          thorn?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Update: {
          author_id?: string
          bud?: string | null
          created_at?: string
          id?: string
          is_current?: boolean | null
          node_id?: string
          rose?: string | null
          thorn?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "rbt_entries_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "retro_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string | null
          due_date: string | null
          id: string
          message: string
          source: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          message: string
          source?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          message?: string
          source?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      retro_attendees: {
        Row: {
          created_at: string
          id: string
          retro_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          retro_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          retro_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_retro_attendees_retro_id"
            columns: ["retro_id"]
            isOneToOne: false
            referencedRelation: "retrospectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_retro_attendees_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      retro_nodes: {
        Row: {
          created_at: string
          created_by: string
          end_date: string | null
          id: string
          metadata: Json | null
          order_index: number | null
          parent_id: string | null
          path: string | null
          start_date: string | null
          subtitle: string | null
          title: string
          type: Database["public"]["Enums"]["node_type"]
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_type"] | null
        }
        Insert: {
          created_at?: string
          created_by: string
          end_date?: string | null
          id?: string
          metadata?: Json | null
          order_index?: number | null
          parent_id?: string | null
          path?: string | null
          start_date?: string | null
          subtitle?: string | null
          title: string
          type: Database["public"]["Enums"]["node_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Update: {
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          metadata?: Json | null
          order_index?: number | null
          parent_id?: string | null
          path?: string | null
          start_date?: string | null
          subtitle?: string | null
          title?: string
          type?: Database["public"]["Enums"]["node_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "retro_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "retro_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      retros: {
        Row: {
          bud: string[] | null
          context_type: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_public: boolean | null
          location_name: string | null
          rose: string[] | null
          start_date: string | null
          tags: string[] | null
          thorn: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bud?: string[] | null
          context_type?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_public?: boolean | null
          location_name?: string | null
          rose?: string[] | null
          start_date?: string | null
          tags?: string[] | null
          thorn?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bud?: string[] | null
          context_type?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_public?: boolean | null
          location_name?: string | null
          rose?: string[] | null
          start_date?: string | null
          tags?: string[] | null
          thorn?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      retrospectives: {
        Row: {
          attendees: string[] | null
          buds: Json | null
          city: string | null
          country: string | null
          created_at: string | null
          date: string
          event_type: string
          feedback_space_id: string | null
          id: string
          is_private: boolean
          latitude: number | null
          location_name: string | null
          longitude: number | null
          photos: Json | null
          primary_photo_url: string | null
          roses: Json | null
          state: string | null
          thorns: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attendees?: string[] | null
          buds?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date: string
          event_type: string
          feedback_space_id?: string | null
          id?: string
          is_private?: boolean
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          photos?: Json | null
          primary_photo_url?: string | null
          roses?: Json | null
          state?: string | null
          thorns?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attendees?: string[] | null
          buds?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date?: string
          event_type?: string
          feedback_space_id?: string | null
          id?: string
          is_private?: boolean
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          photos?: Json | null
          primary_photo_url?: string | null
          roses?: Json | null
          state?: string | null
          thorns?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retrospectives_feedback_space_id_fkey"
            columns: ["feedback_space_id"]
            isOneToOne: false
            referencedRelation: "feedback_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospectives_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name: string
          email: string
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite_txn: {
        Args: { p_from_user: string; p_invite_id: string; p_to_user: string }
        Returns: undefined
      }
      generate_unique_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_catalogue_member: {
        Args: { catalogue_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_retro_attendee: {
        Args: { retro_uuid: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      node_type: "TRIP" | "CATEGORY" | "CITY" | "VENUE" | "EVENT" | "NOTEBOOK"
      visibility_type: "PUBLIC" | "FRIENDS" | "PRIVATE"
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
      node_type: ["TRIP", "CATEGORY", "CITY", "VENUE", "EVENT", "NOTEBOOK"],
      visibility_type: ["PUBLIC", "FRIENDS", "PRIVATE"],
    },
  },
} as const
