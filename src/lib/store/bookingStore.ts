import { create } from 'zustand';
import { providerApi, BookingOut } from '../api/providerApi';

export interface Doctor {
  id: string;
  name: string;
  nameAr: string;
  specialty: string;
  title?: string;
  titleAr?: string;
  city: string;
  address?: string;
  addressAr?: string;
  rating: number;
  reviewCount: number;
  price: number;
  avatar: string;
  bio: string;
  bioAr: string;
  experience: number;
  nextAvailable: string;
  waitingTime?: number;
  type?: 'doctor' | 'clinic';
}

export interface Slot {
  id: string;
  time: string;
  period: 'AM' | 'PM';
  available: boolean;
}

export interface Booking {
  id: string;
  doctor: Doctor;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface FilterState {
  specialty: string;
  city: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
  sortBy: string;
}

interface BookingState {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  selectedDate: string | null;
  selectedSlot: Slot | null;
  filters: FilterState;
  bookings: Booking[];
  setDoctor: (d: Doctor | null) => void;
  setDate: (d: string | null) => void;
  setSlot: (s: Slot | null) => void;
  updateFilters: (f: Partial<FilterState>) => void;
  clearFilters: () => void;
  addBooking: (b: Booking) => void;
  cancelBooking: (id: string) => void;
  notes: string;
  setNotes: (n: string) => void;
  confirmedBooking: any;
  setConfirmedBooking: (b: any) => void;
  selectedClinicId: string | null;
  setClinicId: (id: string | null) => void;
  resetBooking: () => void;
  fetchBookings: () => Promise<void>;
  isLoading: boolean;
}

const mockDoctors: Doctor[] = [
{
  id: 'd1',
  name: 'Dr. Sarah Jenkins',
  nameAr: 'د. سارة جينكينز',
  specialty: 'Cardiology',
  city: 'Riyadh',
  rating: 4.9,
  reviewCount: 124,
  price: 300,
  avatar:
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
  bio: 'Dr. Jenkins is a board-certified cardiologist with over 15 years of experience in treating complex heart conditions.',
  bioAr:
  'د. جينكينز طبيبة قلب معتمدة بخبرة تزيد عن 15 عاماً في علاج أمراض القلب المعقدة.',
  experience: 15,
  nextAvailable: new Date(Date.now() + 86400000).toISOString()
},
{
  id: 'd2',
  name: 'Dr. Ahmed Al-Farsi',
  nameAr: 'د. أحمد الفارسي',
  specialty: 'Neurology',
  city: 'Jeddah',
  rating: 4.7,
  reviewCount: 89,
  price: 250,
  avatar:
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300',
  bio: 'Specializing in neurological disorders, Dr. Al-Farsi provides comprehensive care for patients with migraines, epilepsy, and more.',
  bioAr:
  'متخصص في الاضطرابات العصبية، يقدم د. الفارسي رعاية شاملة للمرضى الذين يعانون من الصداع النصفي والصرع وغيرها.',
  experience: 12,
  nextAvailable: new Date(Date.now() + 172800000).toISOString()
},
{
  id: 'd3',
  name: 'Dr. Emily Chen',
  nameAr: 'د. إميلي تشين',
  specialty: 'Dermatology',
  city: 'Riyadh',
  rating: 4.8,
  reviewCount: 210,
  price: 200,
  avatar:
  'https://images.unsplash.com/photo-1594824436951-7f1267da428f?auto=format&fit=crop&q=80&w=300&h=300',
  bio: 'Dr. Chen focuses on medical and cosmetic dermatology, helping patients achieve healthy and glowing skin.',
  bioAr:
  'تركز د. تشين على الأمراض الجلدية الطبية والتجميلية، وتساعد المرضى على الحصول على بشرة صحية ومشرقة.',
  experience: 8,
  nextAvailable: new Date(Date.now() + 259200000).toISOString()
},
{
  id: 'd4',
  name: 'Dr. Omar Hassan',
  nameAr: 'د. عمر حسن',
  specialty: 'Orthopedics',
  city: 'Dammam',
  rating: 4.6,
  reviewCount: 156,
  price: 280,
  avatar:
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300',
  bio: 'An expert in sports injuries and joint replacements, Dr. Hassan is dedicated to restoring mobility and reducing pain.',
  bioAr:
  'خبير في الإصابات الرياضية واستبدال المفاصل، يكرس د. حسن جهوده لاستعادة الحركة وتقليل الألم.',
  experience: 20,
  nextAvailable: new Date(Date.now() + 86400000 * 4).toISOString()
}];


const initialFilters: FilterState = {
  specialty: '',
  city: '',
  minPrice: 0,
  maxPrice: 1000,
  rating: 0,
  sortBy: 'relevance'
};

export const useBookingStore = create<BookingState>((set) => ({
  doctors: mockDoctors,
  selectedDoctor: null,
  selectedDate: null,
  selectedSlot: null,
  filters: initialFilters,
  bookings: [
  {
    id: 'b1',
    doctor: mockDoctors[0],
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '10:00 AM',
    status: 'upcoming',
    createdAt: new Date().toISOString()
  },
  {
    id: 'b2',
    doctor: mockDoctors[2],
    date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    time: '02:30 PM',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  }],

  setDoctor: (d) => set({ selectedDoctor: d }),
  setDate: (d) => set({ selectedDate: d, selectedSlot: null }),
  setSlot: (s) => set({ selectedSlot: s }),
  updateFilters: (f) =>
  set((state) => ({ filters: { ...state.filters, ...f } })),
  clearFilters: () => set({ filters: initialFilters }),
  addBooking: (b) => set((state) => ({ bookings: [...state.bookings, b] })),
  cancelBooking: (id) =>
  set((state) => ({
    bookings: state.bookings.map((b) =>
    b.id === id ? { ...b, status: 'cancelled' } : b
    )
  })),
  notes: '',
  setNotes: (n) => set({ notes: n }),
  confirmedBooking: null,
  setConfirmedBooking: (b: any) => set({ confirmedBooking: b }),
  selectedClinicId: null,
  setClinicId: (id) => set({ selectedClinicId: id }),
  resetBooking: () => set({ selectedDoctor: null, selectedDate: null, selectedSlot: null, notes: '', confirmedBooking: null, selectedClinicId: null }),
  isLoading: false,
  fetchBookings: async () => {
    set({ isLoading: true });
    try {
      const data = await providerApi.getMyBookings();
      const mappedBookings: Booking[] = data.map((b: BookingOut) => ({
        id: b.id,
        doctor: {
          id: b.doctor.id,
          name: b.doctor.full_name,
          nameAr: b.doctor.full_name, // Fallback
          specialty: b.clinic?.name || 'Medical Center', // Fallback
          city: '',
          rating: 5,
          reviewCount: 0,
          price: 0,
          avatar: '',
          bio: '',
          bioAr: '',
          experience: 0,
          nextAvailable: '',
        },
        date: b.slot.slot_date,
        time: b.slot.slot_start_time,
        status: b.booking_status === 'pending' || b.booking_status === 'confirmed' ? 'upcoming' : b.booking_status as any,
        createdAt: b.created_at,
        notes: b.cancellation_reason || ''
      }));
      set({ bookings: mappedBookings });
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));