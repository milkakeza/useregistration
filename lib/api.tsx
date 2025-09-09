import type { User, CreateUserData, ApiResponse } from "../types/user"

const API_BASE_URL = "http://localhost:8080/api/users"

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "API request failed")
    }

    return data
  } catch (error) {
    console.error("API Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    alert("Error: " + errorMessage)
    throw error
  }
}


export const userApi = {
  async createUser(userData: CreateUserData): Promise<ApiResponse<User>> {
    return await apiRequest<User>(API_BASE_URL, {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return await apiRequest<User[]>(API_BASE_URL)
  },

  async getUserById(id: number): Promise<ApiResponse<User>> {
    return await apiRequest<User>(`${API_BASE_URL}/${id}`)
  },

  async updateUser(id: number, userData: CreateUserData): Promise<ApiResponse<User>> {
    return await apiRequest<User>(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  },

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return await apiRequest<void>(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    })
  },
}
