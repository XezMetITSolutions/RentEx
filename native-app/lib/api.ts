import { Config } from '@/constants/Config';
import { Storage, StorageKeys } from './storage';
import type {
  AdminActivityLog,
  AdminCar,
  AdminCustomer,
  AdminDashboard,
  AdminRental,
  AdminRentalDetail,
  AuthSession,
  Booking,
  Car,
  Customer,
  Location,
  Staff,
  StaffSession,
} from './types';

export class ApiError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string>;
  constructor(message: string, status: number, code?: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = false, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = await Storage.get(StorageKeys.authToken);
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${Config.apiBase}${path}`, { ...rest, headers: finalHeaders });
  } catch (err: any) {
    throw new ApiError(
      err?.message || 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.',
      0,
      'NETWORK'
    );
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const message =
      (isJson && (body?.error || body?.message)) ||
      (typeof body === 'string' && body) ||
      `Fehler ${res.status}`;
    throw new ApiError(message, res.status, body?.code, body?.fields);
  }

  return body as T;
}

export const api = {
  // ── Customer Auth ──
  async login(email: string, password: string): Promise<AuthSession> {
    return request<AuthSession>('/api/mobile/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthSession> {
    return request<AuthSession>('/api/mobile/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async me(): Promise<Customer> {
    return request<Customer>('/api/mobile/auth/me', { auth: true });
  },
  async logout(): Promise<void> {
    try {
      await request('/api/mobile/auth/logout', { method: 'POST', auth: true });
    } catch {}
  },
  async updateProfile(data: Partial<Customer>): Promise<Customer> {
    return request<Customer>('/api/mobile/auth/me', {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(data),
    });
  },
  async changePassword(currentPassword: string, newPassword: string) {
    return request<{ success: true }>('/api/mobile/auth/password', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // ── Cars ──
  async listCars(params?: { category?: string; search?: string; from?: string; to?: string }) {
    const qs = new URLSearchParams();
    if (params?.category && params.category !== 'Alle') qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<Car[]>(`/api/cars${suffix}`);
  },
  async getCar(id: number): Promise<Car> {
    return request<Car>(`/api/cars/${id}`);
  },
  async listLocations(): Promise<Location[]> {
    return request<Location[]>('/api/locations');
  },

  // ── Bookings (customer) ──
  async listMyBookings(): Promise<Booking[]> {
    return request<Booking[]>('/api/mobile/bookings', { auth: true });
  },
  async getBooking(id: number): Promise<Booking> {
    return request<Booking>(`/api/mobile/bookings/${id}`, { auth: true });
  },
  async createBooking(data: {
    carId: number;
    startDate: string;
    endDate: string;
    pickupLocation?: string;
    returnLocation?: string;
  }): Promise<Booking> {
    return request<Booking>('/api/mobile/bookings', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(data),
    });
  },
  async cancelBooking(id: number): Promise<Booking> {
    return request<Booking>(`/api/mobile/bookings/${id}/cancel`, {
      method: 'POST',
      auth: true,
    });
  },
  async startCheckout(id: number): Promise<{ url: string; sessionId: string }> {
    return request<{ url: string; sessionId: string }>(
      `/api/mobile/bookings/${id}/checkout`,
      { method: 'POST', auth: true }
    );
  },

  // ── Admin ──
  async adminLogin(email: string, password: string): Promise<StaffSession> {
    return request<StaffSession>('/api/mobile/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  async adminMe(): Promise<Staff> {
    return request<Staff>('/api/mobile/admin/auth/me', { auth: true });
  },
  async adminDashboard(): Promise<AdminDashboard> {
    return request<AdminDashboard>('/api/mobile/admin/dashboard', { auth: true });
  },
  async adminRentals(params?: { status?: string; search?: string }): Promise<AdminRental[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<AdminRental[]>(`/api/mobile/admin/rentals${suffix}`, { auth: true });
  },
  async adminRental(id: number): Promise<AdminRentalDetail> {
    return request<AdminRentalDetail>(`/api/mobile/admin/rentals/${id}`, { auth: true });
  },
  async adminCheckIn(
    id: number,
    data: { pickupMileage?: number; fuelLevelPickup?: string; notes?: string }
  ) {
    return request<{ success: true }>(`/api/mobile/admin/rentals/${id}/checkin`, {
      method: 'POST',
      auth: true,
      body: JSON.stringify(data),
    });
  },
  async adminCheckOut(
    id: number,
    data: {
      returnMileage?: number;
      fuelLevelReturn?: string;
      damageReport?: string;
      extraCharges?: number;
    }
  ) {
    return request<{ success: true }>(`/api/mobile/admin/rentals/${id}/checkout`, {
      method: 'POST',
      auth: true,
      body: JSON.stringify(data),
    });
  },
  async adminCars(params?: { status?: string; search?: string }): Promise<AdminCar[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<AdminCar[]>(`/api/mobile/admin/cars${suffix}`, { auth: true });
  },
  async adminCustomers(params?: { search?: string }): Promise<AdminCustomer[]> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<AdminCustomer[]>(`/api/mobile/admin/customers${suffix}`, { auth: true });
  },
  async adminActivity(): Promise<AdminActivityLog[]> {
    return request<AdminActivityLog[]>('/api/mobile/admin/activity', { auth: true });
  },

  // ── Push ──
  async registerPushToken(token: string, platform: string) {
    return request<{ success: true }>('/api/mobile/push-token', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ token, platform }),
    });
  },
};
