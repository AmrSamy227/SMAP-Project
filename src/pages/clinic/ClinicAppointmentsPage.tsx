import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  ClipboardList
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { bookingApi } from '../../lib/api/doctorApi';

import { useAuthStore } from '../../lib/store/authStore';

export function ClinicAppointmentsPage() {
  const { isRTL } = useLanguage();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.clinic_account?.id) return;
      try {
        const data = await bookingApi.getClinicBookings(user.clinic_account.id);
        setBookings(data);
      } catch (error) {
        console.error('Failed to fetch clinic bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, [user?.clinic_account?.id]);

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await bookingApi.updateBookingStatus(bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, booking_status: status } : b));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const filteredBookings = bookings.filter(b => filter === 'all' || b.booking_status === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-primary" />
            {isRTL ? 'إدارة المواعيد' : 'Manage Appointments'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
            {isRTL ? 'متابعة وتنظيم جداول المواعيد الطبية' : 'Track and organize medical appointment schedules.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
           <div className="flex p-1 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
             {['all', 'confirmed', 'pending', 'cancelled', 'completed'].map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${filter === f ? 'bg-primary text-white shadow-md' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
               >
                 {f === 'all' ? (isRTL ? 'الكل' : 'All') : 
                  f === 'confirmed' ? (isRTL ? 'مؤكد' : 'Confirmed') :
                  f === 'pending' ? (isRTL ? 'معلق' : 'Pending') :
                  f === 'cancelled' ? (isRTL ? 'ملغى' : 'Cancelled') :
                  f === 'completed' ? (isRTL ? 'مكتمل' : 'Completed') : f}
               </button>
             ))}
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'المريض' : 'Patient'}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'الطبيب' : 'Doctor'}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'الموعد' : 'Schedule'}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/5 dark:bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                          {(booking.patient_name || booking.patient?.full_name || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{booking.patient_name || booking.patient?.full_name || (isRTL ? 'مريض غير معروف' : 'Unknown Patient')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="font-bold text-gray-800 dark:text-slate-200 text-sm">Dr. {booking.doctor?.full_name}</p>
                       <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase">{booking.doctor?.specialization?.[isRTL ? 'name_ar' : 'name_en']}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300">
                           <Calendar className="w-3.5 h-3.5 text-primary" />
                           {new Date(booking.slot.slot_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-slate-400">
                           <Clock className="w-3.5 h-3.5 text-primary" />
                           {booking.slot.slot_start_time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        booking.booking_status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                        booking.booking_status === 'pending' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' :
                        booking.booking_status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                        'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      }`}>
                        {booking.booking_status === 'pending' ? (isRTL ? 'معلق' : 'Pending') :
                         booking.booking_status === 'confirmed' ? (isRTL ? 'مؤكد' : 'Confirmed') :
                         booking.booking_status === 'cancelled' ? (isRTL ? 'ملغى' : 'Cancelled') :
                         booking.booking_status === 'completed' ? (isRTL ? 'مكتمل' : 'Completed') :
                         booking.booking_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {booking.booking_status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusUpdate(booking.id, 'confirmed')} className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-400 font-bold">{isRTL ? 'لا يوجد مواعيد' : 'No appointments found'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
