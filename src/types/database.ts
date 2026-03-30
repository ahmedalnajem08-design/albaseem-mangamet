// Database types for Supabase
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
      employees: {
        Row: {
          id: string
          name: string
          phone: string
          password: string
          role: 'manager' | 'employee'
          permissions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          password: string
          role?: 'manager' | 'employee'
          permissions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          password?: string
          role?: 'manager' | 'employee'
          permissions?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      cities: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string
          address: string
          location_link: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          address: string
          location_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          address?: string
          location_link?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customer_cities: {
        Row: {
          id: string
          customer_id: string
          city_id: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          city_id: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          city_id?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          customer_id: string
          title: string
          content: string
          author: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          title: string
          content: string
          author: string
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          title?: string
          content?: string
          author?: string
          date?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          employee_id: string
          title: string
          details: string
          date: string
          is_full_day: boolean
          start_time: string | null
          end_time: string | null
          status: 'active' | 'completed' | 'delayed' | 'canceled' | 'pending'
          completion_details: string | null
          delay_reason: string | null
          cancel_reason: string | null
          canceled_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          title: string
          details: string
          date: string
          is_full_day?: boolean
          start_time?: string | null
          end_time?: string | null
          status?: 'active' | 'completed' | 'delayed' | 'canceled' | 'pending'
          completion_details?: string | null
          delay_reason?: string | null
          cancel_reason?: string | null
          canceled_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          title?: string
          details?: string
          date?: string
          is_full_day?: boolean
          start_time?: string | null
          end_time?: string | null
          status?: 'active' | 'completed' | 'delayed' | 'canceled' | 'pending'
          completion_details?: string | null
          delay_reason?: string | null
          cancel_reason?: string | null
          canceled_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recurring_tasks: {
        Row: {
          id: string
          employee_id: string
          title: string
          details: string
          days_of_week: string[]
          is_full_day: boolean
          start_time: string | null
          end_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          title: string
          details: string
          days_of_week: string[]
          is_full_day?: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          title?: string
          details?: string
          days_of_week?: string[]
          is_full_day?: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          title: string
          details: string
          date: string
          is_full_day: boolean
          start_time: string | null
          end_time: string | null
          completion_type: 'single' | 'all'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          details: string
          date: string
          is_full_day?: boolean
          start_time?: string | null
          end_time?: string | null
          completion_type?: 'single' | 'all'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          details?: string
          date?: string
          is_full_day?: boolean
          start_time?: string | null
          end_time?: string | null
          completion_type?: 'single' | 'all'
          created_at?: string
        }
      }
      reminder_employees: {
        Row: {
          id: string
          reminder_id: string
          employee_id: string
          created_at: string
        }
        Insert: {
          id?: string
          reminder_id: string
          employee_id: string
          created_at?: string
        }
      }
      reminder_completions: {
        Row: {
          id: string
          reminder_id: string
          employee_id: string
          details: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          reminder_id: string
          employee_id: string
          details: string
          date?: string
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          content: string
          author: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          author: string
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          author?: string
          date?: string
          created_at?: string
        }
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
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
