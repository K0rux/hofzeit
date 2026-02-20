export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: 'admin' | 'employee'
  is_active: boolean
  created_at: string
  updated_at: string
}
