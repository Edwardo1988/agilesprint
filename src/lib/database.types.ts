export type Database = {
  public: {
    Tables: {
      parents: {
        Row: {
          id: string;
          access_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          access_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          access_code?: string;
          created_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          parent_id: string;
          name: string;
          access_code: string;
          avatar_color: string;
          avatar_emoji: string | null;
          total_points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          name: string;
          access_code: string;
          avatar_color?: string;
          avatar_emoji?: string | null;
          total_points?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          name?: string;
          access_code?: string;
          avatar_color?: string;
          avatar_emoji?: string | null;
          total_points?: number;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          child_id: string;
          sprint_id: string | null;
          title: string;
          description: string;
          points: number;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          sprint_id?: string | null;
          title: string;
          description?: string;
          points?: number;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          sprint_id?: string | null;
          title?: string;
          description?: string;
          points?: number;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      sprints: {
        Row: {
          id: string;
          child_id: string;
          name: string;
          start_date: string;
          end_date: string;
          goal: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          name: string;
          start_date: string;
          end_date: string;
          goal?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          goal?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
  };
};
