const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'https://midzobackend.vercel.app/api';

// interface ApiResponse<T> {
//   success: boolean;
//   data?: T;
//   error?: string;
//   [key: string]: any;
// }

class ApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('midzo_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Auth methods
  async login(username: string, password: string) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.success && response.token) {
      localStorage.setItem('midzo_token', response.token);
      localStorage.setItem('midzo_user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) {
    const response = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.token) {
      localStorage.setItem('midzo_token', response.token);
      localStorage.setItem('midzo_user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  async updateProfile(userData: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  logout() {
    localStorage.removeItem('midzo_token');
    localStorage.removeItem('midzo_user');
  }

  // Categories methods
  async getCategories() {
    return this.request<any>('/categories');
  }

  async getCategory(id: string) {
    return this.request<any>(`/categories/${id}`);
  }

  async getCategoryServices(id: string) {
    return this.request<any>(`/categories/${id}/services`);
  }

  async getAllServices() {
    return this.request<any>('/categories/services/all');
  }

  // Countries methods
  async getCountries() {
    return this.request<any>('/countries');
  }

  async getCountryDetails(name: string) {
    return this.request<any>(`/countries/${encodeURIComponent(name)}`);
  }

  async getCountryById(id: number) {
    return this.request<any>(`/countries/id/${id}`);
  }

  // Universities methods
  async getUniversities(filters?: {
    country?: string;
    city?: string;
    program?: string;
    level?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const queryString = params.toString();
    return this.request<any>(`/universities${queryString ? `?${queryString}` : ''}`);
  }

  async searchUniversities(filters: {
    country?: string;
    city?: string;
    program?: string;
    level?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return this.request<any>(`/universities/search?${params.toString()}`);
  }

  async getUniversityById(id: number) {
    return this.request<any>(`/universities/${id}`);
  }

  async getUniversityCountries() {
    return this.request<any>('/universities/countries');
  }

  async getUniversityCities(country: string) {
    return this.request<any>(`/universities/cities/${encodeURIComponent(country)}`);
  }

  async getUniversityPrograms() {
    return this.request<any>('/universities/programs');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('midzo_token');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('midzo_user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const apiService = new ApiService();
export default apiService;