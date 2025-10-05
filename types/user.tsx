export interface User {
  maritalStatus: string;
  id: number;
  name: string;
  address: string;
  age: number | null;
  nationalId: string;
  status: string;
  gender: string;
  email: string;
}

export interface CreateUserData {
  name?: string;
  address?: string;
  age?: number | null;
  nationalId?: string;
  maritalStatus?: string;
  gender?: string;
  email?: string;
  role?: string;
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  id_number: string;
  national_id?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}
