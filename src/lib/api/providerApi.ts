import { fetchApi } from './apiClient';

// ── Response shapes matching the OpenAPI spec ─────────────────────────────

export type SlotStatus = 'available' | 'blocked' | 'cancelled' | 'booked';

export interface SlotOut {
  id: string;
  doctor_id: string;
  clinic_id?: string | null;
  availability_id: string;
  slot_date: string;       // "YYYY-MM-DD"
  slot_start_time: string; // "HH:MM:SS"
  slot_end_time: string;   // "HH:MM:SS"
  slot_status: SlotStatus;
  created_at: string;
  updated_at?: string | null;
}

export interface SpecializationOut {
  id: string;
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  created_at: string;
}

export interface DoctorClinicOut {
  id: string;
  doctor_id: string;
  clinic_id: string;
  is_primary: boolean;
  is_active: boolean;
  joined_at: string;
  clinic?: { id: string; name: string; address?: string | null } | null;
}

export interface DoctorOut {
  id: string;
  user_id: string;
  full_name: string;
  bio_en?: string | null;
  bio_ar?: string | null;
  consultation_price_egp?: number | null;
  years_of_experience?: number | null;
  license_number?: string | null;
  language_spoken?: string | null;
  is_active?: boolean | null;
  is_verified: boolean;
  average_rating?: number | null;
  rating_count?: number | null;
  specialization_id?: string | null;
  specialization?: SpecializationOut | null;
  doctor_clinics: DoctorClinicOut[];
  created_at: string;
}

export interface ClinicOut {
  id: string;
  user_id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  location?: string | null;
  created_at: string;
}

export interface BookingOut {
  id: string;
  user_id: string;
  doctor_id: string;
  clinic_id?: string | null;
  booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_reference?: string | null;
  payment_status?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at?: string | null;
  slot: {
    id: string;
    slot_date: string;
    slot_start_time: string;
    slot_end_time: string;
  };
  doctor: {
    id: string;
    full_name: string;
  };
  clinic?: {
    id: string;
    name: string;
    address?: string | null;
  } | null;
}

// ── Provider API ───────────────────────────────────────────────────────────

export const providerApi = {
  /** GET /doctors/ — public, returns all active doctors */
  async getDoctors(): Promise<DoctorOut[]> {
    const res = await fetchApi('/doctors/', { method: 'GET' });
    if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
    return res.json();
  },

  /** GET /doctors/{id} — public, single doctor */
  async getDoctor(id: string): Promise<DoctorOut> {
    const res = await fetchApi(`/doctors/${id}`, { method: 'GET' });
    if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
    return res.json();
  },

  /** GET /clinics/ — public, returns all clinics */
  async getClinics(): Promise<ClinicOut[]> {
    const res = await fetchApi('/clinics/', { method: 'GET' });
    if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
    return res.json();
  },

  /** GET /clinics/{id} — public, single clinic */
  async getClinic(id: string): Promise<ClinicOut> {
    const res = await fetchApi(`/clinics/${id}`, { method: 'GET' });
    if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
    return res.json();
  },

  /** GET /clinics/{id}/doctors — public, doctors for a clinic */
  async getClinicDoctors(clinicId: string): Promise<DoctorOut[]> {
    const res = await fetchApi(`/clinics/${clinicId}/doctors`, { method: 'GET' });
    if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
    return res.json();
  },

  /** GET /specializations/ — public */
  async getSpecializations(): Promise<SpecializationOut[]> {
    const res = await fetchApi('/specializations/', { method: 'GET' });
    if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
    return res.json();
  },

  /**
   * GET /appointment-slots/?doctor_id={id}&slot_status=available
   * Returns all available slots for a specific doctor.
   */
  async getAvailableSlots(
    doctorId: string,
    fromDate?: string,
    toDate?: string,
    clinicId?: string | null
  ): Promise<SlotOut[]> {
    const params = new URLSearchParams({ doctor_id: doctorId, slot_status: 'available' });
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    if (clinicId) params.append('clinic_id', clinicId);
    else if (clinicId === null) params.append('clinic_id', 'null');
    const res = await fetchApi(`/appointment-slots/?${params.toString()}`, { method: 'GET' });
    if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
    return res.json();
  },

  /**
   * POST /bookings/
   * Create a new booking (requires auth token).
   */
   async createBooking(payload: {
    slot_id: string;
    notes?: string;
    booking_language?: string;
    clinic_id?: string | null;
  }): Promise<BookingOut> {
    const res = await fetchApi('/bookings/', {
      method: 'POST',
      body: JSON.stringify({ booking_language: 'en', ...payload }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let err: any = {};
      try { err = JSON.parse(text); } catch(e) {}
      throw new Error(err.detail ?? `Booking failed: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * GET /bookings/me
   * Returns all bookings for the currently authenticated user.
   */
  async getMyBookings(filters?: {
    booking_status?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<BookingOut[]> {
    const params = new URLSearchParams();
    if (filters?.booking_status) params.append('booking_status', filters.booking_status);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    const qs = params.toString();
    const res = await fetchApi(`/bookings/me${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail ?? `Failed to load bookings: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * PATCH /bookings/{id}/cancel
   * Cancel a booking (patient or clinic).
   */
  async cancelBooking(bookingId: string): Promise<void> {
    const res = await fetchApi(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail ?? `Cancel failed: ${res.statusText}`);
    }
  },
};
;
