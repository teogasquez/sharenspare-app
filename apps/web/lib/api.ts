const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5180";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // On 401, clear expired token and redirect to login
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return undefined as T;
    }
    throw new ApiError(res.status, body.message || `Error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// ── Auth ──
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; firstName: string; lastName: string; phone?: string; invitationToken?: string; organisationName?: string; }
export interface LoginResponse { token: string; expiresAt: string; user: UserDto; }

export const auth = {
  login: (data: LoginRequest) => request<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data: RegisterRequest) => request<LoginResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  me: () => request<UserDto>("/me"),
};

// ── Categories ──
export interface CategoryDto { id: string; name: string; slug: string; description?: string; icon?: string; sortOrder: number; }

export const categories = {
  list: () => request<CategoryDto[]>("/categories"),
};

// ── Equipment ──
export interface EquipmentListDto { id: string; name: string; description?: string; dailyPrice: number; quantity: number; condition: string; isAvailable: boolean; categoryName: string; categorySlug: string; organisationName: string; city?: string; canton?: string; latitude?: number; longitude?: number; primaryPhotoUrl?: string; }
export interface EquipmentPhotoDto { id: string; url: string; isPrimary: boolean; sortOrder: number; }
export interface EquipmentDto extends Omit<EquipmentListDto, "categoryName" | "categorySlug" | "organisationName" | "primaryPhotoUrl"> { address?: string; category: CategoryDto; organisation: OrganisationDto; photos: EquipmentPhotoDto[]; createdAt: string; }
export interface CreateEquipmentRequest { name: string; description?: string; dailyPrice: number; quantity: number; condition: string; categoryId: string; address?: string; city?: string; canton?: string; latitude?: number; longitude?: number; isAvailable?: boolean; priceTiersJson?: string; }
export interface UpdateEquipmentRequest { name?: string; description?: string; dailyPrice?: number; quantity?: number; condition?: string; categoryId?: string; isAvailable?: boolean; address?: string; city?: string; canton?: string; latitude?: number; longitude?: number; }

export const equipments = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<EquipmentListDto[]>(`/equipments${qs}`);
  },
  get: (id: string) => request<EquipmentDto>(`/equipments/${id}`),
  mine: () => request<EquipmentListDto[]>("/equipments/mine"),
  create: (data: CreateEquipmentRequest) => request<EquipmentDto>("/equipments", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UpdateEquipmentRequest) => request<EquipmentDto>(`/equipments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/equipments/${id}`, { method: "DELETE" }),
};

// ── Reservations ──
export interface ReservationDto { id: string; equipment: EquipmentListDto; quantity: number; requesterOrganisation: OrganisationDto; ownerOrganisation: OrganisationDto; startDate: string; endDate: string; unitPrice: number; totalPrice: number; status: string; message?: string; ownerNote?: string; createdAt: string; }
export interface CreateReservationRequest { equipmentId: string; quantity: number; startDate: string; endDate: string; message?: string; }

export const reservations = {
  list: (role?: string) => request<ReservationDto[]>(`/reservations${role ? `?role=${role}` : ""}`),
  get: (id: string) => request<ReservationDto>(`/reservations/${id}`),
  create: (data: CreateReservationRequest) => request<ReservationDto>("/reservations", { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string, note?: string) => request<ReservationDto>(`/reservations/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) }),
};

// ── Admin ──
export interface InvitationDto { id: string; email: string; organisationName: string; role: string; token: string; expiresAt: string; usedAt?: string; createdAt: string; }

export interface AdminStatsDto { totalUsers: number; totalOrgs: number; totalEquipments: number; totalReservations: number; reservationsToday: number; activeReservations: number; platformRevenue: number; totalRevenue: number; }

export const admin = {
  stats: () => request<AdminStatsDto>("/admin/stats"),
  invitations: () => request<InvitationDto[]>("/admin/invitations"),
  createInvitation: (data: { email: string; organisationName: string; role: string }) => request<InvitationDto>("/admin/invitations", { method: "POST", body: JSON.stringify(data) }),
  users: () => request<UserDto[]>("/admin/users"),
  toggleUserActive: (id: string, isActive: boolean) => request<void>(`/admin/users/${id}/active`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
  organisations: () => request<OrganisationDto[]>("/admin/organisations"),
  verifyOrganisation: (id: string) => request<void>(`/admin/organisations/${id}/verify`, { method: "PATCH" }),
};

// ── Payments ──
export const payments = {
  createCheckout: (reservationId: string) => request<{ url: string }>(`/payments/${reservationId}/checkout`, { method: "POST" }),
  confirm: (reservationId: string, sessionId: string) => request<{ message: string; paymentId?: string }>(`/payments/${reservationId}/confirm`, { method: "POST", body: JSON.stringify({ sessionId }) }),
};

// ── Photos ──
export const photos = {
  upload: async (equipmentId: string, file: File): Promise<EquipmentPhotoDto> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/equipments/${equipmentId}/photos`, {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.message || `Error ${res.status}`);
    }
    return res.json();
  },
  delete: (equipmentId: string, photoId: string) => request<void>(`/equipments/${equipmentId}/photos/${photoId}`, { method: "DELETE" }),
  setPrimary: (equipmentId: string, photoId: string) => request<void>(`/equipments/${equipmentId}/photos/${photoId}/primary`, { method: "PATCH" }),
};

// ── Equipment Blackouts ──
export interface EquipmentBlackoutDto { id: string; startDate: string; endDate: string; reason?: string; }
export interface ReservedPeriodDto { startDate: string; endDate: string; status: string; }
export interface EquipmentAvailabilityDto { blackouts: EquipmentBlackoutDto[]; reservedPeriods: ReservedPeriodDto[]; }
export interface CreateBlackoutRequest { startDate: string; endDate: string; reason?: string; }

export const blackouts = {
  getAvailability: (equipmentId: string) => request<EquipmentAvailabilityDto>(`/equipments/${equipmentId}/availability`),
  create: (equipmentId: string, data: CreateBlackoutRequest) => request<EquipmentBlackoutDto>(`/equipments/${equipmentId}/blackouts`, { method: "POST", body: JSON.stringify(data) }),
  delete: (equipmentId: string, blackoutId: string) => request<void>(`/equipments/${equipmentId}/blackouts/${blackoutId}`, { method: "DELETE" }),
};

// ── Shared DTOs ──
export interface UserDto { id: string; email: string; firstName: string; lastName: string; phone?: string; role: string; isActive: boolean; organisation: OrganisationDto; lastLoginAt?: string; }
export interface OrganisationDto { id: string; name: string; type: string; description?: string; logoUrl?: string; phone?: string; website?: string; address?: string; city?: string; canton?: string; isVerified: boolean; }
