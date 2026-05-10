import { create } from 'zustand';

export interface Doctor {
  id: string;
  name: string;
  nameAr: string;
  title: string;
  titleAr: string;
  specialty: string;
  city: string;
  address: string;
  addressAr: string;
  rating: number;
  reviewCount: number;
  price: number;
  avatar: string;
  bio: string;
  bioAr: string;
  experience: number;
  nextAvailable: string;
  waitingTime: number;
  type: 'doctor' | 'clinic';
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
}

const mockDoctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Sarah Jenkins',
    nameAr: 'د. سارة جينكينز',
    title: 'Consultant Cardiologist',
    titleAr: 'استشاري أمراض القلب',
    specialty: 'Cardiology',
    city: 'Riyadh',
    address: 'Olaya Medical Tower, Olaya St, Riyadh',
    addressAr: 'برج عليا الطبي، شارع العليا، الرياض',
    rating: 4.9,
    reviewCount: 124,
    price: 300,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'Board-certified cardiologist with 15+ years treating complex heart conditions.',
    bioAr: 'طبيبة قلب معتمدة بخبرة تزيد عن 15 عاماً في علاج أمراض القلب المعقدة.',
    experience: 15,
    nextAvailable: new Date(Date.now() + 86400000).toISOString(),
    waitingTime: 10,
    type: 'doctor',
  },
  {
    id: 'd2',
    name: 'Dr. Ahmed Al-Farsi',
    nameAr: 'د. أحمد الفارسي',
    title: 'Specialist Neurologist',
    titleAr: 'أخصائي أمراض المخ والأعصاب',
    specialty: 'Neurology',
    city: 'Jeddah',
    address: 'Tahlia Medical Hub, Tahlia St, Jeddah',
    addressAr: 'مجمع التحلية الطبي، شارع التحلية، جدة',
    rating: 4.7,
    reviewCount: 89,
    price: 250,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'Specializing in neurological disorders including migraines, epilepsy, and stroke rehabilitation.',
    bioAr: 'متخصص في الاضطرابات العصبية بما في ذلك الصداع النصفي والصرع وإعادة التأهيل من السكتة الدماغية.',
    experience: 12,
    nextAvailable: new Date(Date.now() + 172800000).toISOString(),
    waitingTime: 20,
    type: 'doctor',
  },
  {
    id: 'd3',
    name: 'Dr. Emily Chen',
    nameAr: 'د. إميلي تشين',
    title: 'Dermatology Consultant',
    titleAr: 'استشاري الأمراض الجلدية',
    specialty: 'Dermatology',
    city: 'Riyadh',
    address: 'King Abdullah Medical City, Riyadh',
    addressAr: 'مدينة الملك عبدالله الطبية، الرياض',
    rating: 4.8,
    reviewCount: 210,
    price: 200,
    avatar: 'https://images.unsplash.com/photo-1594824436951-7f1267da428f?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'Focuses on medical and cosmetic dermatology for radiant, healthy skin.',
    bioAr: 'تركز على الأمراض الجلدية الطبية والتجميلية للحصول على بشرة صحية ومشرقة.',
    experience: 8,
    nextAvailable: new Date(Date.now() + 259200000).toISOString(),
    waitingTime: 30,
    type: 'doctor',
  },
  {
    id: 'd4',
    name: 'Dr. Omar Hassan',
    nameAr: 'د. عمر حسن',
    title: 'Orthopedic Surgeon',
    titleAr: 'جراح العظام والمفاصل',
    specialty: 'Orthopedics',
    city: 'Dammam',
    address: 'Saudi German Hospital, Dammam',
    addressAr: 'المستشفى السعودي الألماني، الدمام',
    rating: 4.6,
    reviewCount: 156,
    price: 280,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'Expert in sports injuries and joint replacements, restoring mobility and reducing pain.',
    bioAr: 'خبير في الإصابات الرياضية واستبدال المفاصل، يعمل على استعادة الحركة وتقليل الألم.',
    experience: 20,
    nextAvailable: new Date(Date.now() + 86400000 * 4).toISOString(),
    waitingTime: 15,
    type: 'doctor',
  },
  {
    id: 'd5',
    name: 'Dr. Layla Mansour',
    nameAr: 'د. ليلى منصور',
    title: 'Pediatrics Specialist',
    titleAr: 'أخصائية طب الأطفال',
    specialty: 'Pediatrics',
    city: 'Mecca',
    address: 'Al Noor Specialist Hospital, Mecca',
    addressAr: 'مستشفى النور التخصصي، مكة المكرمة',
    rating: 4.9,
    reviewCount: 180,
    price: 220,
    avatar: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'Dedicated pediatrician specializing in adolescent medicine and childhood development.',
    bioAr: 'طبيبة أطفال متخصصة في طب المراهقين وتنمية الطفولة.',
    experience: 12,
    nextAvailable: new Date(Date.now() + 86400000).toISOString(),
    waitingTime: 5,
    type: 'doctor',
  },
  // --- Clinics ---
  {
    id: 'c1',
    name: 'City Care Medical Center',
    nameAr: 'مركز سيتي كير الطبي',
    title: 'Multi-Specialty Medical Center',
    titleAr: 'مركز طبي متعدد التخصصات',
    specialty: 'General Practice',
    city: 'Riyadh',
    address: 'King Fahd Rd, Al Olaya, Riyadh',
    addressAr: 'طريق الملك فهد، العليا، الرياض',
    rating: 4.5,
    reviewCount: 450,
    price: 150,
    avatar: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'A leading multi-specialty medical center offering premium outpatient services.',
    bioAr: 'مركز طبي رائد متعدد التخصصات يقدم خدمات العيادات الخارجية المتميزة.',
    experience: 25,
    nextAvailable: new Date(Date.now() + 86400000).toISOString(),
    waitingTime: 10,
    type: 'clinic',
  },
  {
    id: 'c2',
    name: 'Al-Amal Pediatric Clinic',
    nameAr: 'عيادة الأمل لطب الأطفال',
    title: 'Pediatric Excellence Center',
    titleAr: 'مركز تميز طب الأطفال',
    specialty: 'Pediatrics',
    city: 'Jeddah',
    address: 'Prince Sultan St, Al Zahra, Jeddah',
    addressAr: 'شارع الأمير سلطان، الزهراء، جدة',
    rating: 4.8,
    reviewCount: 320,
    price: 200,
    avatar: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'Specialized clinic delivering world-class care for children from newborn to 18 years.',
    bioAr: 'عيادة متخصصة تقدم رعاية عالمية المستوى للأطفال من المواليد حتى 18 عاماً.',
    experience: 10,
    nextAvailable: new Date(Date.now() + 172800000).toISOString(),
    waitingTime: 5,
    type: 'clinic',
  },
  {
    id: 'c3',
    name: 'Riyadh Heart & Vascular Center',
    nameAr: 'مركز الرياض للقلب والأوعية الدموية',
    title: 'Cardiology & Vascular Surgery Center',
    titleAr: 'مركز أمراض القلب وجراحة الأوعية الدموية',
    specialty: 'Cardiology',
    city: 'Riyadh',
    address: 'Takhasusi St, Al Malaz, Riyadh',
    addressAr: 'شارع التخصصي، الملاز، الرياض',
    rating: 4.7,
    reviewCount: 280,
    price: 350,
    avatar: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'Premier cardiac care facility with state-of-the-art diagnostic and interventional services.',
    bioAr: 'منشأة رائدة لرعاية القلب مع خدمات تشخيصية وتدخلية متطورة.',
    experience: 15,
    nextAvailable: new Date(Date.now() + 86400000 * 2).toISOString(),
    waitingTime: 20,
    type: 'clinic',
  },
  {
    id: 'c4',
    name: 'Derma Glow Clinic',
    nameAr: 'عيادة ديرما جلو',
    title: 'Dermatology & Aesthetic Clinic',
    titleAr: 'عيادة الأمراض الجلدية والتجميل',
    specialty: 'Dermatology',
    city: 'Dammam',
    address: 'Prince Mohammed Bin Fahd Rd, Dammam',
    addressAr: 'طريق الأمير محمد بن فهد، الدمام',
    rating: 4.6,
    reviewCount: 190,
    price: 180,
    avatar: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'A boutique dermatology clinic offering advanced skin treatments and aesthetic procedures.',
    bioAr: 'عيادة جلدية متخصصة تقدم علاجات جلدية متقدمة وإجراءات تجميلية.',
    experience: 8,
    nextAvailable: new Date(Date.now() + 86400000 * 3).toISOString(),
    waitingTime: 15,
    type: 'clinic',
  },
];

const initialFilters: FilterState = {
  specialty: '',
  city: '',
  minPrice: 0,
  maxPrice: 1000,
  rating: 0,
  sortBy: 'relevance',
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
      createdAt: new Date().toISOString(),
    },
  ],

  setDoctor: (d) => set({ selectedDoctor: d }),
  setDate: (d) => set({ selectedDate: d, selectedSlot: null }),
  setSlot: (s) => set({ selectedSlot: s }),
  updateFilters: (f) => set((state) => ({ filters: { ...state.filters, ...f } })),
  clearFilters: () => set({ filters: initialFilters }),
  addBooking: (b) => set((state) => ({ bookings: [...state.bookings, b] })),
  cancelBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' } : b
      ),
    })),
}));