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
  async login(identifier: string, password: string) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: identifier, password }),
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
    // Does NOT store token — user must verify email first
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyEmail(email: string, code: string) {
    const response = await this.request<any>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });

    if (response.success && response.token) {
      localStorage.setItem('midzo_token', response.token);
      localStorage.setItem('midzo_user', JSON.stringify(response.user));
    }

    return response;
  }

  async resendVerificationCode(email: string) {
    return this.request<any>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
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

  // Extended profile update (premium fields)
  async updateExtendedProfile(data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    nationality?: string;
    country_of_residence?: string;
    languages?: { language: string; level: string }[];
    newsletter_study?: boolean;
    newsletter_tourism?: boolean;
  }) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Newsletter
  async subscribeNewsletter(type: 'study' | 'tourism', email: string) {
    return this.request<any>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ type, email }),
    });
  }

  // Travel check (premium)
  async checkTravelRequirements(nationality: string, destination: string) {
    const params = new URLSearchParams({ nationality, destination });
    return this.request<any>(`/travel/check?${params.toString()}`);
  }

  // Notifications
  async getNotifications() {
    return this.request<any>('/notifications');
  }

  async markNotificationRead(id: number) {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  // ─── Admin endpoints ───────────────────────────────────────────────────────

  // Admin: Users
  async adminGetUsers(page = 1, limit = 20, search = '') {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    return this.request<any>(`/admin/users?${params.toString()}`);
  }

  async adminUpdateUser(id: number, data: { role?: string; is_premium?: boolean; email?: string; password?: string }) {
    return this.request<any>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async adminDeleteUser(id: number) {
    return this.request<any>(`/admin/users/${id}`, { method: 'DELETE' });
  }

  // Admin: News
  async adminGetNews(page = 1, limit = 20) {
    return this.request<any>(`/admin/news?page=${page}&limit=${limit}`);
  }

  async adminCreateNews(data: object) {
    return this.request<any>('/admin/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdateNews(id: number, data: object) {
    return this.request<any>(`/admin/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async adminDeleteNews(id: number) {
    return this.request<any>(`/admin/news/${id}`, { method: 'DELETE' });
  }

  // Admin: Blog
  async adminGetBlogs(page = 1, limit = 20) {
    return this.request<any>(`/admin/blogs?page=${page}&limit=${limit}`);
  }

  async adminCreateBlog(data: object) {
    return this.request<any>('/admin/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdateBlog(id: number, data: object) {
    return this.request<any>(`/admin/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async adminDeleteBlog(id: number) {
    return this.request<any>(`/admin/blogs/${id}`, { method: 'DELETE' });
  }

  // Admin: Visa
  async adminGetVisaRules(page = 1, limit = 50) {
    return this.request<any>(`/admin/visa?page=${page}&limit=${limit}`);
  }

  async adminCreateVisaRule(data: object) {
    return this.request<any>('/admin/visa', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdateVisaRule(id: number, data: object) {
    return this.request<any>(`/admin/visa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async adminDeleteVisaRule(id: number) {
    return this.request<any>(`/admin/visa/${id}`, { method: 'DELETE' });
  }

  // Public: Visa lookup
  async getVisaInfo(fromCountry: string, toCountry: string) {
    const params = new URLSearchParams({ from: fromCountry, to: toCountry });
    return this.request<any>(`/visa?${params.toString()}`);
  }

  // Admin: Countries
  async adminGetCountries(page = 1, limit = 50) {
    return this.request<any>(`/admin/countries?page=${page}&limit=${limit}`);
  }

  async adminCreateCountry(data: object) {
    return this.request<any>('/admin/countries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdateCountry(id: number, data: object) {
    return this.request<any>(`/admin/countries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async adminDeleteCountry(id: number) {
    return this.request<any>(`/admin/countries/${id}`, { method: 'DELETE' });
  }

  // Admin: Stats dashboard
  async adminGetStats() {
    return this.request<any>('/admin/stats');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('midzo_token');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('midzo_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin' || user?.role === 'superadmin';
  }
}

export const apiService = new ApiService();
export default apiService;