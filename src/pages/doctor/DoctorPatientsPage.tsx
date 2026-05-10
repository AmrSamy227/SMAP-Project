import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Calendar, 
  FileText,
  Activity,
  Heart,
  DownloadIcon,
  X,
  Loader2
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { bookingApi } from '../../lib/api/doctorApi';
import { recordApi } from '../../lib/api/recordApi';

export function DoctorPatientsPage() {
  const { isRTL } = useLanguage();
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isExportingId, setIsExportingId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handleOpenPdf = async (patient: any) => {
    setIsExportingId(patient.id);
    try {
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
      const url = await recordApi.getUserMedicalRecordPdfUrl(patient.id);
      setPdfUrl(url);
      setIsPdfModalOpen(true);
    } catch (err) {
      alert(isRTL ? 'حدث خطأ أثناء تحميل السجل الطبي' : 'Failed to load medical record');
    } finally {
      setIsExportingId(null);
    }
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
  };

  const handleDownloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `medical_record_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const bookings = await bookingApi.getDoctorBookings();
        const uniquePatientsMap = new Map();
        bookings.forEach((b: any) => {
          const patientId = b.user_id;
          const patientName = b.patient_name || b.patient?.full_name || (isRTL ? 'مريض مجهول' : 'Unknown Patient');
          
          if (!uniquePatientsMap.has(patientId)) {
            uniquePatientsMap.set(patientId, {
              id: patientId,
              name: patientName,
              email: b.patient?.email || 'N/A',
              lastVisit: b.slot.slot_date,
              totalVisits: bookings.filter((x: any) => x.user_id === patientId).length,
              status: bookings.some((x: any) => x.user_id === patientId && x.booking_status === 'completed') 
                ? (isRTL ? 'متابعة' : 'Follow-up') 
                : (isRTL ? 'نشط' : 'Active')
            });
          } else {
            const existing = uniquePatientsMap.get(patientId);
            if (new Date(b.slot.slot_date) > new Date(existing.lastVisit)) {
              existing.lastVisit = b.slot.slot_date;
            }
          }
        });
        setPatients(Array.from(uniquePatientsMap.values()));
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, [isRTL]); // Refetch if language changes, but we'll also add a manual refresh

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const bookings = await bookingApi.getDoctorBookings();
      const uniquePatientsMap = new Map();
      bookings.forEach((b: any) => {
        const patientId = b.user_id;
        const patientName = b.patient_name || b.patient?.full_name || (isRTL ? 'مريض مجهول' : 'Unknown Patient');
        
        if (!uniquePatientsMap.has(patientId)) {
          uniquePatientsMap.set(patientId, {
            id: patientId,
            name: patientName,
            email: b.patient?.email || 'N/A',
            lastVisit: b.slot.slot_date,
            totalVisits: bookings.filter((x: any) => x.user_id === patientId).length,
            status: bookings.some((x: any) => x.user_id === patientId && x.booking_status === 'completed') 
              ? (isRTL ? 'متابعة' : 'Follow-up') 
              : (isRTL ? 'نشط' : 'Active')
          });
        } else {
          const existing = uniquePatientsMap.get(patientId);
          if (new Date(b.slot.slot_date) > new Date(existing.lastVisit)) {
            existing.lastVisit = b.slot.slot_date;
          }
        }
      });
      setPatients(Array.from(uniquePatientsMap.values()));
    } catch (error) {
      console.error('Failed to refresh patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            {isRTL ? 'المرضى' : 'Patients'}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            {isRTL ? 'سجل المرضى الذين قمت بعلاجهم' : 'Registry of patients you have treated.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={handleRefresh}
             disabled={isLoading}
             className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm active:scale-95 disabled:opacity-50"
             title={isRTL ? 'تحديث البيانات' : 'Refresh Data'}
           >
             <Activity className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
           </button>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isRTL ? 'بحث عن مريض...' : 'Search patients...'} 
                className="pl-10 pr-4 py-2 border border-gray-100 rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64"
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-3xl" />
          ))
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all group overflow-hidden relative">
               <Activity className="absolute -right-4 -top-4 w-24 h-24 text-primary/5 rotate-12 group-hover:scale-110 transition-transform" />
               
               <div className="flex justify-between items-start mb-6 relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                    {patient.name?.charAt(0)}
                  </div>

               </div>
               
               <h3 className="text-xl font-black text-gray-900 mb-1">{patient.name}</h3>
               <p className="text-xs font-bold text-gray-400 mb-6">{patient.email}</p>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{isRTL ? 'الزيارات' : 'Visits'}</p>
                     <p className="text-sm font-black text-gray-900">{patient.totalVisits}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{isRTL ? 'حالة المريض' : 'Status'}</p>
                     <p className="text-sm font-black text-primary">{patient.status}</p>
                  </div>
               </div>

               <div className="space-y-3 pt-6 border-t border-gray-50">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {isRTL ? 'آخر زيارة' : 'Last Visit'}
                     </div>
                     <span className="text-xs font-black text-gray-700">{new Date(patient.lastVisit).toLocaleDateString()}</span>
                  </div>
               </div>

               <button 
                onClick={() => handleOpenPdf(patient)}
                disabled={isExportingId === patient.id}
                className="w-full mt-6 py-3 bg-gray-900 text-white font-black text-xs rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200 disabled:opacity-50"
               >
                  {isExportingId === patient.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {isRTL ? 'فتح السجل الطبي' : 'Open Medical Record'}
               </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center">
             <Heart className="w-16 h-16 text-gray-100 mx-auto mb-4" />
             <h3 className="text-xl font-black text-gray-300 uppercase tracking-widest">{isRTL ? 'لا يوجد مرضى' : 'No patients found'}</h3>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {isPdfModalOpen && pdfUrl && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) handleClosePdfModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
              style={{ height: '90vh' }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm">
                      {isRTL ? 'السجل الطبي' : 'Medical Record'}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {isRTL ? 'معاينة ملف PDF' : 'PDF Preview'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    {isRTL ? 'تحميل' : 'Download'}
                  </button>
                  <button
                    onClick={handleClosePdfModal}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* PDF Canvas */}
              <div className="flex-1 overflow-hidden bg-gray-100">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title={isRTL ? 'السجل الطبي' : 'Medical Record PDF'}
                />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
