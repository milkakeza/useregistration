export interface User {
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
  status?: string;
  gender?: string;
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}
