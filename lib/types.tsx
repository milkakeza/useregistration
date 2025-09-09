export interface User {
  id?: number;
  fullName: string;
  idNumber: string;
  address: string;
  age: number;
  gender: "male" | "female" | "other";
  maritalStatus: "single" | "married" | "divorced" | "widowed";
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}
