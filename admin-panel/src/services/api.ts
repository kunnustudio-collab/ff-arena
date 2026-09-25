const API_BASE = '/api/v1';

export class AdminApi {
  private static token: string | null = localStorage.getItem('tx_admin_token') || 'mock_admin_token';

  static setToken(token: string) {
    this.token = token;
    localStorage.setItem('tx_admin_token', token);
  }

  static clearToken() {
    this.token = null;
    localStorage.removeItem('tx_admin_token');
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(options.headers as any),
    };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.message || 'API Request failed');
      }
      return data;
    } catch (err: any) {
      console.warn(`Admin API Error (${endpoint}):`, err.message);
      throw err;
    }
  }

  static async login(email: string, password: string, otp2Fa?: string) {
    const res = await this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, otp2Fa }),
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  static async getDashboard() {
    return this.request('/admin/dashboard');
  }

  static async getUsers() {
    return this.request('/admin/users');
  }

  static async updateUserStatus(userId: string, status: string, reason?: string) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  }

  static async toggleWalletFreeze(userId: string, isFrozen: boolean, reason?: string) {
    return this.request(`/admin/users/${userId}/wallet-freeze`, {
      method: 'PUT',
      body: JSON.stringify({ isFrozen, reason }),
    });
  }

  static async adjustBalance(userId: string, data: { amount: number; balanceType: string; reason: string; type: 'CREDIT' | 'DEBIT' }) {
    return this.request(`/admin/users/${userId}/adjust-balance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getKycQueue() {
    return this.request('/admin/kyc/queue');
  }

  static async reviewKyc(kycId: string, status: 'VERIFIED' | 'REJECTED' | 'RETRY_REQUIRED', rejectionReason?: string) {
    return this.request('/kyc/review', {
      method: 'POST',
      body: JSON.stringify({ kycId, status, rejectionReason }),
    });
  }

  static async getTournaments() {
    return this.request('/tournaments');
  }

  static async createTournament(data: any) {
    return this.request('/tournaments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateRoomCredentials(tournamentId: string, data: { roomId: string; roomPassword: string; status?: string }) {
    return this.request(`/tournaments/${tournamentId}/room`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async disbursePrizes(tournamentId: string, approvedResults: any[]) {
    return this.request(`/tournaments/${tournamentId}/disburse`, {
      method: 'POST',
      body: JSON.stringify({ approvedResults }),
    });
  }

  static async cancelTournament(tournamentId: string, reason: string) {
    return this.request(`/tournaments/${tournamentId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  static async getWithdrawals() {
    return this.request('/admin/withdrawals');
  }

  static async processWithdrawal(id: string, status: 'PAID' | 'REJECTED' | 'PROCESSING', adminNotes?: string) {
    return this.request(`/admin/withdrawals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  static async getRiskEvents() {
    return this.request('/admin/antifraud/events');
  }

  static async reviewRiskEvent(id: string, actionTaken: string) {
    return this.request(`/admin/antifraud/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ actionTaken }),
    });
  }

  static async getDisputes() {
    return this.request('/admin/disputes');
  }

  static async resolveDispute(id: string, status: 'RESOLVED' | 'DISMISSED', resolutionNotes: string) {
    return this.request(`/admin/disputes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, resolutionNotes }),
    });
  }

  static async getAuditLogs() {
    return this.request('/admin/audit-logs');
  }

  static async getSettings() {
    return this.request('/settings/public');
  }

  static async updateSettings(settings: any) {
    return this.request('/settings/public', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  static downloadReportUrl(type: string): string {
    return `${API_BASE}/admin/reports/${type}`;
  }
}
