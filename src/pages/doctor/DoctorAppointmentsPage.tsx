import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ClipboardList,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { bookingApi } from '../../lib/api/doctorApi';

export function DoctorAppointmentsPage() {
  const { isRTL } = useLanguage();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingApi.getDoctorBookings();
        setBookings(data);
      } catch (error) {
        console.error('Failed to fetch doctor bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      let notes = '';
      if (status === 'completed' || status === 'cancelled') {
        const promptMsg = status === 'completed' ? 
          (isRTL ? 'إضافة ملاحظات طبية (اختياري):' : 'Add medical notes (optional):') :
          (isRTL ? 'سبب الإلغاء (اختياري):' : 'Reason for cancellation (optional):');
        notes = window.prompt(promptMsg) || '';
      }
      await bookingApi.updateBookingStatus(bookingId, status, notes);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, booking_status: status, notes } : b));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const filteredBookings = bookings.filter(b => filter === 'all' || b.booking_status === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            {isRTL ? 'مواعيدي' : 'My Appointments'}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            {isRTL ? 'إدارة مواعيد المرضى والجدول الزمني' : 'Manage your patient appointments and daily schedule.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
           <div className="flex p-1 bg-white rounded-xl border border-gray-100 shadow-sm">
             {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
               >
                 {f === 'all' ? (isRTL ? 'الكل' : 'All') : 
                  f === 'confirmed' ? (isRTL ? 'مؤكد' : 'Confirmed') :
                  f === 'pending' ? (isRTL ? 'معلق' : 'Pending') :
                  f === 'completed' ? (isRTL ? 'مكتمل' : 'Completed') :
                  f === 'cancelled' ? (isRTL ? 'ملغى' : 'Cancelled') : f}
               </button>
             ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />
          ))
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary font-black text-xl shadow-inner">
                     {(booking.patient_name || 'P').charAt(0)}
                   </div>
                   <div>
                     <h3 className="font-black text-gray-900 text-lg leading-tight">{booking.patient_name || (isRTL ? 'مريض مجهول' : 'Unknown Patient')}</h3>
                     <div className="flex flex-col gap-1 mt-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md w-fit">
                          {isRTL ? 'رقم الحجز' : 'Booking ID'}: {booking.id.slice(0, 8)}
                        </span>
                        {booking.notes && (
                          <div className="bg-orange-50 border border-orange-100 p-2 rounded-lg max-w-[200px]">
                             <p className="text-[10px] text-orange-700 font-medium leading-tight line-clamp-2">
                               <span className="font-black uppercase mr-1">{isRTL ? 'ملاحظة:' : 'Note:'}</span>
                               {booking.notes}
                             </p>
                          </div>
                        )}
                     </div>
                   </div>
                </div>

               <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-1.5">
                     <div className="flex items-center gap-2 text-xs font-black text-gray-700 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {booking.slot.slot_date}
                     </div>
                     <div className="flex items-center gap-2 text-xs font-black text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {booking.slot.slot_start_time.slice(0,5)} - {booking.slot.slot_end_time.slice(0,5)}
                     </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        booking.booking_status === 'confirmed' ? 'bg-green-500 text-white' :
                        booking.booking_status === 'pending' ? 'bg-orange-500 text-white' :
                        booking.booking_status === 'cancelled' ? 'bg-red-500 text-white' :
                        'bg-gray-500 text-white'
                     }`}>
                        {booking.booking_status === 'pending' ? (isRTL ? 'قيد الانتظار' : 'Pending') :
                         booking.booking_status === 'confirmed' ? (isRTL ? 'مؤكد' : 'Confirmed') :
                         booking.booking_status === 'cancelled' ? (isRTL ? 'ملغى' : 'Cancelled') :
                         booking.booking_status}
                     </span>
                  </div>
               </div>

                <div className="flex flex-wrap items-center gap-3 border-t md:border-t-0 pt-6 md:pt-0">
                   {booking.booking_status === 'pending' && (
                     <div className="flex w-full md:w-auto gap-2">
                       <button 
                         onClick={() => handleStatusUpdate(booking.id, 'confirmed')} 
                         className="flex-1 px-5 py-2.5 bg-green-600 text-white rounded-[14px] text-[11px] font-black uppercase tracking-widest hover:bg-green-700 hover:shadow-lg hover:shadow-green-200 transition-all flex items-center justify-center gap-2"
                       >
                         <CheckCircle2 className="w-4 h-4" />
                         {isRTL ? 'تأكيد' : 'Confirm'}
                       </button>
                       <button 
                         onClick={() => handleStatusUpdate(booking.id, 'cancelled')} 
                         className="flex-1 px-5 py-2.5 bg-red-50 text-red-600 rounded-[14px] text-[11px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                       >
                         <XCircle className="w-4 h-4" />
                         {isRTL ? 'رفض' : 'Decline'}
                       </button>
                     </div>
                   )}
                   
                   {booking.booking_status === 'confirmed' && (
                     <div className="flex w-full md:w-auto gap-2">
                       <button 
                         onClick={() => handleStatusUpdate(booking.id, 'completed')} 
                         className="flex-1 px-6 py-2.5 bg-primary text-white rounded-[14px] text-[11px] font-black uppercase tracking-widest hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                       >
                         <CheckCircle2 className="w-4 h-4" />
                         {isRTL ? 'إتمام الفحص' : 'Complete Visit'}
                       </button>
                       <button 
                         onClick={() => handleStatusUpdate(booking.id, 'cancelled')} 
                         className="px-4 py-2.5 bg-gray-50 text-gray-400 rounded-[14px] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                         title={isRTL ? 'إلغاء الموعد' : 'Cancel Appointment'}
                       >
                         <XCircle className="w-4 h-4" />
                       </button>
                     </div>
                   )}

                   {(booking.booking_status === 'cancelled' || booking.booking_status === 'completed') && (
                     <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-[14px] border border-gray-100">
                        <div className={`w-2 h-2 rounded-full ${booking.booking_status === 'completed' ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {isRTL ? 'لا توجد إجراءات متاحة' : 'No further actions'}
                        </span>
                     </div>
                   )}
                </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-16 text-center">
             <ClipboardList className="w-16 h-16 text-gray-100 mx-auto mb-4" />
             <h3 className="text-xl font-black text-gray-300 uppercase tracking-widest">{isRTL ? 'لا توجد مواعيد' : 'No Appointments'}</h3>
          </div>
        )}
      </div>
    </div>
  );
}
