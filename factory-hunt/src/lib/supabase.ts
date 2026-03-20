import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          report_type: 'daily' | 'incident'
          raw_input: string
          formatted_content: string | null
          photo_urls: string[] | null
          status: 'draft' | 'completed'
          report_date: string
          operator_name: string | null
          section: string | null
        }
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reports']['Insert']>
      }
    }
  }
}
