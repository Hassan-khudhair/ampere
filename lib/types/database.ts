export type Role = 'super_admin' | 'generator_admin'

export interface Generator {
  id: string
  name: string
  ampere_price: number
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: Role
  generator_id: string | null
  created_at: string
}

export interface UserRoleWithGenerator extends UserRole {
  generators: Generator | null
}

export interface Subscriber {
  id: string
  generator_id: string
  full_name: string
  phone_number: string | null
  address: string | null
  ampere_count: number
  join_date: string
  notes: string | null
  active: boolean
  created_at: string
}

export interface MonthlyPayment {
  id: string
  subscriber_id: string
  generator_id: string
  year: number
  month: number
  amount: number
  ampere_price_snapshot: number
  is_paid: boolean
  paid_at: string | null
  is_prorated: boolean
  days_in_period: number | null
  total_days_in_month: number | null
  created_at: string
}

export interface MonthlyPaymentWithSubscriber extends MonthlyPayment {
  subscribers: Pick<Subscriber, 'id' | 'full_name' | 'ampere_count' | 'phone_number' | 'active'>
}

export type Database = {
  public: {
    Tables: {
      generators: {
        Row: Generator
        Insert: {
          id?: string
          name: string
          ampere_price?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          ampere_price?: number
          created_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: UserRole
        Insert: {
          id?: string
          user_id: string
          role: Role
          generator_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: Role
          generator_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_roles_generator_id_fkey'
            columns: ['generator_id']
            isOneToOne: false
            referencedRelation: 'generators'
            referencedColumns: ['id']
          },
        ]
      }
      subscribers: {
        Row: Subscriber
        Insert: {
          id?: string
          generator_id: string
          full_name: string
          phone_number?: string | null
          address?: string | null
          ampere_count: number
          join_date: string
          notes?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          generator_id?: string
          full_name?: string
          phone_number?: string | null
          address?: string | null
          ampere_count?: number
          join_date?: string
          notes?: string | null
          active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscribers_generator_id_fkey'
            columns: ['generator_id']
            isOneToOne: false
            referencedRelation: 'generators'
            referencedColumns: ['id']
          },
        ]
      }
      monthly_payments: {
        Row: MonthlyPayment
        Insert: {
          id?: string
          subscriber_id: string
          generator_id: string
          year: number
          month: number
          amount: number
          ampere_price_snapshot: number
          is_paid?: boolean
          paid_at?: string | null
          is_prorated?: boolean
          days_in_period?: number | null
          total_days_in_month?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          subscriber_id?: string
          generator_id?: string
          year?: number
          month?: number
          amount?: number
          ampere_price_snapshot?: number
          is_paid?: boolean
          paid_at?: string | null
          is_prorated?: boolean
          days_in_period?: number | null
          total_days_in_month?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'monthly_payments_subscriber_id_fkey'
            columns: ['subscriber_id']
            isOneToOne: false
            referencedRelation: 'subscribers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'monthly_payments_generator_id_fkey'
            columns: ['generator_id']
            isOneToOne: false
            referencedRelation: 'generators'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_generator_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
