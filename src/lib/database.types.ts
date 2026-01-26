export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      parents: {
        Row: {
          id: string
          access_code: string
          created_at: string
        }
        Insert: {
          id?: string
          access_code: string
          created_at?: string
        }
        Update: {
          id?: string
          access_code?: string
          created_at?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          id: string
          parent_id: string
          name: string
          access_code: string
          total_points: number
          avatar_emoji: string | null
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          name: string
          access_code: string
          total_points?: number
          avatar_emoji?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          name?: string
          access_code?: string
          total_points?: number
          avatar_emoji?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "parents"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          child_id: string
          title: string
          description: string | null
          points: number
          is_completed: boolean
          sprint_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          title: string
          description?: string | null
          points?: number
          is_completed?: boolean
          sprint_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          title?: string
          description?: string | null
          points?: number
          is_completed?: boolean
          sprint_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_child_id_fkey"
            columns: ["child_id"]
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          }
        ]
      }
      sprints: {
        Row: {
          id: string
          child_id: string
          name: string
          goal: string | null
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          name: string
          goal?: string | null
          start_date?: string
          end_date: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          name?: string
          goal?: string | null
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprints_child_id_fkey"
            columns: ["child_id"]
            referencedRelation: "children"
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
