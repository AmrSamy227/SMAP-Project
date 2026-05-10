// doctorApi.ts
import { fetchApi } from './apiClient';

export interface Booking {
  id: string;
  user_id: string;
  doctor_id: string;
  clinic_id: string | null;
  booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  slot: {
    id: string;
    slot_date: string;
    slot_start_time: string;
    slot_end_time: string;
  };
  doctor: {
    id: string;
    full_name: string;
    specialization?: {
      name_en: string;
      name_ar: string;
    };
  };
  clinic: {
    id: string;
    name: string;
    address: string;
  } | null;
  patient_name?: string;
  notes?: string;
  patient?: {
    full_name: string;
    email: string;
    phone: string;
  };
  created_at: string;
}

export const bookingApi = {
  getDoctorBookings: async (): Promise<Booking[]> => {
    const response = await fetchApi('/bookings/doctor/me', {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch doctor bookings');
    const data = await response.json();
    console.log('API Response (Doctor Bookings):', data);
    return Array.isArray(data) ? data : data.bookings || [];
  },

  getClinicBookings: async (clinicId: string): Promise<Booking[]> => {
    const response = await fetchApi(`/bookings/clinic/${clinicId}`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch clinic bookings');
    return response.json();
  },

  updateBookingStatus: async (bookingId: string, status: string, notes?: string): Promise<Booking> => {
    const endpoint = status === 'confirmed' ? 'confirm' : status === 'completed' ? 'complete' : 'cancel';
    const response = await fetchApi(`/bookings/${bookingId}/${endpoint}`, {
      method: 'PATCH',
      body: notes ? JSON.stringify({ notes }) : undefined,
    });
    if (!response.ok) throw new Error(`Failed to ${status} booking`);
    return response.json();
  },

  confirmBooking: async (bookingId: string, notes?: string): Promise<Booking> => {
    const response = await fetchApi(`/bookings/${bookingId}/confirm`, {
      method: 'PATCH',
      body: notes ? JSON.stringify({ notes }) : undefined,
    });
    if (!response.ok) throw new Error('Failed to confirm booking');
    return response.json();
  },

  completeBooking: async (bookingId: string, notes?: string): Promise<Booking> => {
    const response = await fetchApi(`/bookings/${bookingId}/complete`, {
      method: 'PATCH',
      body: notes ? JSON.stringify({ notes }) : undefined,
    });
    if (!response.ok) throw new Error('Failed to complete booking');
    return response.json();
  },

  cancelBooking: async (bookingId: string, notes?: string): Promise<{ message: string }> => {
    const response = await fetchApi(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      body: notes ? JSON.stringify({ notes }) : undefined,
    });
    if (!response.ok) throw new Error('Failed to cancel booking');
    return response.json();
  },
};

export interface Invitation {
  id: string;
  clinic_id: string;
  doctor_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  message: string;
  created_at: string;
  clinic?: {
    name: string;
    address: string;
  };
}

export interface AvailabilityRule {
  id: string;
  doctor_id: string;
  clinic_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

export interface Slot {
  id: string;
  doctor_id: string;
  clinic_id: string | null;
  slot_date: string;
  slot_start_time: string;
  slot_end_time: string;
  is_booked: boolean;
  status: string;
}

export const doctorApi = {
  getInvitations: async (status?: string): Promise<Invitation[]> => {
    const url = status ? `/doctors/me/invitations?status=${status}` : '/doctors/me/invitations';
    const response = await fetchApi(url, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch invitations');
    return response.json();
  },

  respondToInvitation: async (invitationId: string, accept: boolean): Promise<{ message: string }> => {
    const response = await fetchApi(`/doctors/me/invitations/${invitationId}/respond?accept=${accept}`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to respond to invitation');
    return response.json();
  },

  getAvailability: async (doctorId: string): Promise<AvailabilityRule[]> => {
    const response = await fetchApi(`/doctors/${doctorId}/availability`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch availability');
    return response.json();
  },

  createAvailability: async (doctorId: string, data: Partial<AvailabilityRule>): Promise<AvailabilityRule> => {
    const response = await fetchApi(`/doctors/${doctorId}/availability`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create availability');
    return response.json();
  },

  updateAvailability: async (doctorId: string, availId: string, data: Partial<AvailabilityRule>): Promise<AvailabilityRule> => {
    const response = await fetchApi(`/doctors/${doctorId}/availability/${availId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update availability');
    return response.json();
  },

  deleteAvailability: async (doctorId: string, availId: string): Promise<void> => {
    const response = await fetchApi(`/doctors/${doctorId}/availability/${availId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete availability');
  },

  generateSlots: async (data: { doctor_id: string; clinic_id?: string | null; from_date: string; to_date: string }): Promise<any> => {
    const response = await fetchApi('/appointment-slots/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to generate slots');
    return response.json();
  },

  getSlots: async (params: { doctor_id?: string; clinic_id?: string; date?: string }): Promise<Slot[]> => {
    const query = new URLSearchParams();
    if (params.doctor_id) query.append('doctor_id', params.doctor_id);
    if (params.clinic_id) query.append('clinic_id', params.clinic_id);
    if (params.date) query.append('date', params.date);
    
    const response = await fetchApi(`/appointment-slots/?${query.toString()}`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch slots');
    return response.json();
  },

  updateSlot: async (slotId: string, data: Partial<Slot>): Promise<Slot> => {
    const response = await fetchApi(`/appointment-slots/${slotId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update slot');
    return response.json();
  },

  deleteSlot: async (slotId: string): Promise<void> => {
    const response = await fetchApi(`/appointment-slots/${slotId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete slot');
  },

  getClinicDoctors: async (clinicId: string): Promise<any[]> => {
    const response = await fetchApi(`/clinics/${clinicId}/doctors`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch clinic doctors');
    return response.json();
  },

  inviteDoctor: async (clinicId: string, doctorId: string, message: string): Promise<Invitation> => {
    const response = await fetchApi(`/clinics/${clinicId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ doctor_id: doctorId, message }),
    });
    if (!response.ok) throw new Error('Failed to send invitation');
    return response.json();
  },

  searchDoctors: async (query: string): Promise<any[]> => {
    const response = await fetchApi(`/clinics/search/doctors?name=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to search doctors');
    return response.json();
  },

  getAllDoctors: async (): Promise<any[]> => {
    const response = await fetchApi('/doctors/', {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch all doctors');
    return response.json();
  },

  getDoctorById: async (doctorId: string): Promise<any> => {
    const response = await fetchApi(`/doctors/${doctorId}`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch doctor');
    return response.json();
  },

  unlinkDoctor: async (clinicId: string, doctorId: string): Promise<{ message: string }> => {
    const response = await fetchApi(`/clinics/${clinicId}/doctors/${doctorId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to unlink doctor');
    return response.json();
  },
};

