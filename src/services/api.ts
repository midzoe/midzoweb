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
        const error: any = new Error(data.error || `HTTP error! status: ${response.status}`);
        // Le code HTTP permet aux appelants de distinguer un 404 (ressource absente) d'une panne.
        error.status = response.status;
        throw error;
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

  /** Complétude du profil premium (story 2.3) : { complete, missing } — source de vérité du gate 3.9. */
  async getProfileCompleteness() {
    return this.request<any>('/auth/profile/completeness');
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

  // Packages methods (premium)
  async getPackages() {
    return this.request<any>('/packages');
  }

  /** Devis en direct. Le calcul est 100% backend (story 3.2) — l'UI n'affiche que la réponse. */
  async quotePackage(categories: string[], subcategoryIds: number[] = []) {
    return this.request<any>('/packages/quote', {
      method: 'POST',
      body: JSON.stringify({ categories, subcategory_ids: subcategoryIds }),
    });
  }

  /** Recommandation (story 3.3) : renvoie { quote, upsell }. Le prix reste 100% backend. */
  async recommendPackage(categories: string[], subcategoryIds: number[] = []) {
    return this.request<any>('/packages/recommend', {
      method: 'POST',
      body: JSON.stringify({ categories, subcategory_ids: subcategoryIds }),
    });
  }

  /**
   * Ouverture d'une session Stripe Checkout (story 3.4). On n'envoie qu'une SÉLECTION,
   * jamais un montant : le total est recalculé côté serveur. Réponse : { checkout_url, ... }.
   */
  async createPremiumCheckout(categories: string[], subcategoryIds: number[] = []) {
    return this.request<any>('/premium/checkout', {
      method: 'POST',
      body: JSON.stringify({ categories, subcategory_ids: subcategoryIds }),
    });
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

  // News methods (public)
  async getNews(params?: { scope?: string; subcategory?: string }) {
    const query = new URLSearchParams();
    if (params?.scope) query.set('scope', params.scope);
    if (params?.subcategory) query.set('subcategory', params.subcategory);
    const qs = query.toString();
    return this.request<any>(`/news${qs ? `?${qs}` : ''}`);
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

  // Newsletter (Epic 8)
  async subscribeNewsletter(type: 'study' | 'tourism', email: string) {
    return this.request<any>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ type, email }),
    });
  }

  async unsubscribeNewsletter(type: 'study' | 'tourism', email: string) {
    return this.request<any>('/newsletter/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ type, email }),
    });
  }

  async getNewsletterStatus(email: string) {
    return this.request<any>(`/newsletter/status?email=${encodeURIComponent(email)}`);
  }

  // Contact (Epic 8 — story 8.1/8.2/8.6)
  async getContactSubjects() {
    return this.request<any>('/contact/subjects');
  }

  async sendContact(data: {
    name: string;
    email: string;
    subject?: string;
    category?: string;
    subcategory?: string;
    message: string;
  }) {
    return this.request<any>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Travel check (premium) — story 4.3 : `lang` (fr|en) porte la langue du message généré.
  async checkTravelRequirements(nationality: string, destination: string, lang?: string) {
    const params = new URLSearchParams({ nationality, destination });
    if (lang) params.set('lang', lang);
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
  async adminGetUsers(page = 1, limit = 20, search = '', segment = '') {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    if (segment) params.append('segment', segment);
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

  // Admin: Embassies (story 4.1)
  async adminGetEmbassies(page = 1, limit = 50) {
    return this.request<any>(`/admin/embassies?page=${page}&limit=${limit}`);
  }

  async adminCreateEmbassy(data: object) {
    return this.request<any>('/admin/embassies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdateEmbassy(id: number, data: object) {
    return this.request<any>(`/admin/embassies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async adminDeleteEmbassy(id: number) {
    return this.request<any>(`/admin/embassies/${id}`, { method: 'DELETE' });
  }

  // Admin: Universities (story 5.1)
  async adminGetUniversities(page = 1, limit = 50) {
    return this.request<any>(`/admin/universities?page=${page}&limit=${limit}`);
  }

  async adminCreateUniversity(data: object) {
    return this.request<any>('/admin/universities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdateUniversity(id: number, data: object) {
    return this.request<any>(`/admin/universities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async adminDeleteUniversity(id: number) {
    return this.request<any>(`/admin/universities/${id}`, { method: 'DELETE' });
  }

  // Story 5.3 : comparaison de l'exigence de langue d'une université au profil (auth requise).
  async checkUniversityLanguage(id: number) {
    return this.request<any>(`/universities/${id}/language-check`);
  }

  // Story 5.4 : centres de langue (public + admin).
  async getLanguageCenters(params?: { language?: string; country?: string }) {
    const qs = new URLSearchParams();
    if (params?.language) qs.set('language', params.language);
    if (params?.country) qs.set('country', params.country);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return this.request<any>(`/language-centers${suffix}`);
  }

  async adminGetLanguageCenters(page = 1, limit = 50) {
    return this.request<any>(`/admin/language-centers?page=${page}&limit=${limit}`);
  }

  async adminCreateLanguageCenter(data: object) {
    return this.request<any>('/admin/language-centers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdateLanguageCenter(id: number, data: object) {
    return this.request<any>(`/admin/language-centers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async adminDeleteLanguageCenter(id: number) {
    return this.request<any>(`/admin/language-centers/${id}`, { method: 'DELETE' });
  }

  // Story 5.6/5.9 : logements étudiants filtrables (pays/ville/type).
  async getAccommodations(params?: { country?: string; city?: string; type?: string; max_price?: number }) {
    const qs = new URLSearchParams();
    if (params?.country) qs.set('country', params.country);
    if (params?.city) qs.set('city', params.city);
    if (params?.type) qs.set('type', params.type);
    if (params?.max_price != null) qs.set('max_price', String(params.max_price));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return this.request<any>(`/accommodations${suffix}`);
  }

  // Story 5.5 : enrichissement IA d'un pays d'étude (brouillon isValidated=false).
  async adminEnrichStudyCountry(name: string) {
    return this.request<any>('/admin/study-countries/enrich', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // ─── Epic 6 — Tourisme (public) ─────────────────────────────
  async getTourismPrograms(subcategory?: string) {
    const qs = subcategory ? `?subcategory=${encodeURIComponent(subcategory)}` : '';
    return this.request<any>(`/tourism/programs${qs}`);
  }
  async getTourismEvents() {
    return this.request<any>('/tourism/events');
  }
  async getTourismPartners(category?: string) {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<any>(`/tourism/partners${qs}`);
  }
  // Redirection trackée : incrémente le compteur puis renvoie l'URL.
  async trackPartnerClick(id: number) {
    return this.request<any>(`/tourism/partners/${id}/click`, { method: 'POST' });
  }

  // ─── Epic 6 — Tourisme (admin CRUD) ─────────────────────────
  async adminGetTourismPrograms(page = 1, limit = 50) {
    return this.request<any>(`/admin/tourism-programs?page=${page}&limit=${limit}`);
  }
  async adminCreateTourismProgram(data: object) {
    return this.request<any>('/admin/tourism-programs', { method: 'POST', body: JSON.stringify(data) });
  }
  async adminUpdateTourismProgram(id: number, data: object) {
    return this.request<any>(`/admin/tourism-programs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async adminDeleteTourismProgram(id: number) {
    return this.request<any>(`/admin/tourism-programs/${id}`, { method: 'DELETE' });
  }

  async adminGetTourismEvents(page = 1, limit = 50) {
    return this.request<any>(`/admin/tourism-events?page=${page}&limit=${limit}`);
  }
  async adminCreateTourismEvent(data: object) {
    return this.request<any>('/admin/tourism-events', { method: 'POST', body: JSON.stringify(data) });
  }
  async adminUpdateTourismEvent(id: number, data: object) {
    return this.request<any>(`/admin/tourism-events/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async adminDeleteTourismEvent(id: number) {
    return this.request<any>(`/admin/tourism-events/${id}`, { method: 'DELETE' });
  }

  async adminGetPartners(page = 1, limit = 50) {
    return this.request<any>(`/admin/partners?page=${page}&limit=${limit}`);
  }
  async adminCreatePartner(data: object) {
    return this.request<any>('/admin/partners', { method: 'POST', body: JSON.stringify(data) });
  }
  async adminUpdatePartner(id: number, data: object) {
    return this.request<any>(`/admin/partners/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async adminDeletePartner(id: number) {
    return this.request<any>(`/admin/partners/${id}`, { method: 'DELETE' });
  }

  // ─── Epic 7 — Espace voyage / trips ─────────────────────────
  async getTrips() {
    return this.request<any>('/trips');
  }
  async getTrip(id: number) {
    return this.request<any>(`/trips/${id}`);
  }
  async createTrip(data: object) {
    return this.request<any>('/trips', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateTrip(id: number, data: object) {
    return this.request<any>(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteTrip(id: number) {
    return this.request<any>(`/trips/${id}`, { method: 'DELETE' });
  }
  async addTripService(tripId: number, data: object) {
    return this.request<any>(`/trips/${tripId}/services`, { method: 'POST', body: JSON.stringify(data) });
  }
  async updateTripService(serviceId: number, data: object) {
    return this.request<any>(`/trips/services/${serviceId}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async getTripChecklist(tripId: number) {
    return this.request<any>(`/trips/${tripId}/checklist`);
  }
  async addChecklistItem(tripId: number, data: object) {
    return this.request<any>(`/trips/${tripId}/checklist`, { method: 'POST', body: JSON.stringify(data) });
  }
  async updateChecklistItem(itemId: number, data: object) {
    return this.request<any>(`/trips/checklist/${itemId}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async getTripHistory() {
    return this.request<any>('/trips/history');
  }
  async getTripActivities() {
    return this.request<any>('/trips/activities');
  }
  async getNextDeparture() {
    return this.request<any>('/trips/next');
  }

  // Public: embassies by country
  async getEmbassies(country?: string) {
    const qs = country ? `?country=${encodeURIComponent(country)}` : '';
    return this.request<any>(`/embassies${qs}`);
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

  // Admin: Contact & Newsletter (Epic 8 — story 8.3/8.5)
  async adminGetContactInsights() {
    return this.request<any>('/admin/contact/insights');
  }

  async adminGetContactMessages(params?: { status?: string; category?: string }) {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.category) qs.set('category', params.category);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return this.request<any>(`/admin/contact/messages${suffix}`);
  }

  async adminSetContactMessageStatus(id: number, status: 'new' | 'read' | 'archived') {
    return this.request<any>(`/admin/contact/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async adminDeleteContactMessage(id: number) {
    return this.request<any>(`/admin/contact/messages/${id}`, { method: 'DELETE' });
  }

  async adminSendNewsletter(data: { type: 'study' | 'tourism'; subject: string; body: string }) {
    return this.request<any>('/admin/newsletter/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ─── Epic 9 — Admin CRUD manquants + validation + premium ───
  // Study countries (admin voit les brouillons)
  async adminGetStudyCountries() {
    return this.request<any>('/admin/study-countries');
  }
  async adminCreateStudyCountry(data: object) {
    return this.request<any>('/admin/study-countries', { method: 'POST', body: JSON.stringify(data) });
  }
  async adminUpdateStudyCountry(id: number, data: object) {
    return this.request<any>(`/admin/study-countries/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async adminDeleteStudyCountry(id: number) {
    return this.request<any>(`/admin/study-countries/${id}`, { method: 'DELETE' });
  }

  // Tourism countries
  async adminGetTourismCountries() {
    return this.request<any>('/admin/tourism-countries');
  }
  async adminCreateTourismCountry(data: object) {
    return this.request<any>('/admin/tourism-countries', { method: 'POST', body: JSON.stringify(data) });
  }
  async adminUpdateTourismCountry(id: number, data: object) {
    return this.request<any>(`/admin/tourism-countries/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async adminDeleteTourismCountry(id: number) {
    return this.request<any>(`/admin/tourism-countries/${id}`, { method: 'DELETE' });
  }

  // Accommodations
  async adminGetAccommodations() {
    return this.request<any>('/admin/accommodations');
  }
  async adminCreateAccommodation(data: object) {
    return this.request<any>('/admin/accommodations', { method: 'POST', body: JSON.stringify(data) });
  }
  async adminUpdateAccommodation(id: number, data: object) {
    return this.request<any>(`/admin/accommodations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async adminDeleteAccommodation(id: number) {
    return this.request<any>(`/admin/accommodations/${id}`, { method: 'DELETE' });
  }

  // Packages
  async adminGetPackages() {
    return this.request<any>('/admin/packages');
  }
  async adminCreatePackage(data: object) {
    return this.request<any>('/admin/packages', { method: 'POST', body: JSON.stringify(data) });
  }
  async adminUpdatePackage(id: number, data: object) {
    return this.request<any>(`/admin/packages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async adminDeletePackage(id: number) {
    return this.request<any>(`/admin/packages/${id}`, { method: 'DELETE' });
  }

  // Story 9.2/9.7 — file de validation + validation
  async adminGetValidationQueue() {
    return this.request<any>('/admin/validation-queue');
  }
  async adminValidate(entity: string, id: number, isValidated = true) {
    return this.request<any>('/admin/validate', {
      method: 'POST',
      body: JSON.stringify({ entity, id, isValidated }),
    });
  }

  // Story 9.3 — dossier premium
  async adminGetPremiumCase(userId: number) {
    return this.request<any>(`/admin/premium-cases/${userId}`);
  }
  async adminUpdatePremiumCase(userId: number, data: { status?: string; notes?: string; assignedTo?: string }) {
    return this.request<any>(`/admin/premium-cases/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Story 9.5 — self-service compte
  async changePassword(oldPassword: string, newPassword: string) {
    return this.request<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
  }
  async changeEmail(email: string, password: string) {
    return this.request<any>('/auth/change-email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // ─── Epic 10 — Orientation ──────────────────────────────────
  async getOrientation(params?: { type?: string; category?: string }) {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.category) qs.set('category', params.category);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return this.request<any>(`/orientation${suffix}`);
  }
  async adminGetOrientation() {
    return this.request<any>('/admin/orientation');
  }
  async adminCreateOrientation(data: object) {
    return this.request<any>('/admin/orientation', { method: 'POST', body: JSON.stringify(data) });
  }
  async adminUpdateOrientation(id: number, data: object) {
    return this.request<any>(`/admin/orientation/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async adminDeleteOrientation(id: number) {
    return this.request<any>(`/admin/orientation/${id}`, { method: 'DELETE' });
  }

  // ─── Epic 11 — Scraping actus immigration ───────────────────
  async adminScrapeImmigrationNews() {
    return this.request<any>('/admin/scrape-immigration-news', { method: 'POST' });
  }
  async adminGetScrapedDrafts() {
    return this.request<any>('/admin/scrape-immigration-news');
  }
  // Validation d'un brouillon (scrappé) = publication via la route news.
  async adminPublishNews(id: number, isPublished = true) {
    return this.request<any>(`/admin/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_published: isPublished }),
    });
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