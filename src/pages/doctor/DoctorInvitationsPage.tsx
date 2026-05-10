import { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Bell,
  Check,
  X
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { doctorApi, Invitation } from '../../lib/api/doctorApi';
import { profileApi } from '../../lib/api/profileApi';

export function DoctorInvitationsPage() {
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchInvitations();
    } else {
      fetchClinics();
    }
  }, [activeTab]);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const data = await doctorApi.getInvitations('pending');
      setInvitations(data);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClinics = async () => {
    setIsLoading(true);
    try {
      const data = await profileApi.getDoctorProfile();
      console.log('Fetching clinics for doctor:', data.id);
      
      // In some cases, doctor_clinics might be directly on the data or nested
      const rawClinics = data.doctor_clinics || [];
      console.log('Raw doctor_clinics:', rawClinics);

      const linkedClinics = rawClinics
        .map(dc => dc.clinic)
        .filter(Boolean);
        
      console.log('Mapped clinics:', linkedClinics);
      setClinics(linkedClinics);
    } catch (error) {
      console.error('Failed to fetch clinics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (invitationId: string, accept: boolean) => {
    setActionLoading(invitationId);
    try {
      await doctorApi.respondToInvitation(invitationId, accept);
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      if (accept) {
        // Re-fetch clinics and switch to active tab
        await fetchClinics();
        setActiveTab('active');
      }
    } catch (error) {
      alert('Failed to respond to invitation');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            {isRTL ? 'إدارة المنشآت' : 'Facility Management'}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            {isRTL ? 'إدارة الدعوات والعيادات المرتبطة بك' : 'Manage your invitations and associated clinics.'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex p-1 bg-white rounded-2xl border border-gray-100 w-fit shadow-sm">
           <button 
             onClick={() => setActiveTab('pending')}
             className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-gray-50'}`}
           >
              <Bell className="w-4 h-4" />
              {isRTL ? 'دعوات بانتظار الرد' : 'Pending Invites'}
              {invitations.length > 0 && <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'pending' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>{invitations.length}</span>}
           </button>
           <button 
             onClick={() => setActiveTab('active')}
             className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-gray-50'}`}
           >
              <Building2 className="w-4 h-4" />
              {isRTL ? 'عياداتي الحالية' : 'Active Clinics'}
           </button>
        </div>
        

      </div>

      <div className="max-w-4xl space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-3xl" />
          ))
        ) : activeTab === 'pending' ? (
          invitations.length > 0 ? (
            invitations.map((inv) => (
              <div key={inv.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/30 transition-all">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                       <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                          <Building2 className="w-8 h-8" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-gray-900">{inv.clinic?.name || (isRTL ? 'اسم العيادة' : 'Clinic Name')}</h3>
                          <div className="flex items-center gap-2 text-gray-400 mt-1">
                             <MapPin className="w-3.5 h-3.5" />
                             <span className="text-xs font-bold">{inv.clinic?.address || 'Location Unknown'}</span>
                          </div>
                          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-50">
                             <p className="text-xs text-gray-600 font-medium italic">"{inv.message}"</p>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-3 min-w-[140px]">
                       <button 
                         onClick={() => handleResponse(inv.id, true)}
                         disabled={!!actionLoading}
                         className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                       >
                          {actionLoading === inv.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                          {isRTL ? 'قبول' : 'Accept'}
                       </button>
                       <button 
                         onClick={() => handleResponse(inv.id, false)}
                         disabled={!!actionLoading}
                         className="flex-1 px-4 py-3 bg-gray-50 text-red-500 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-red-50 transition-all disabled:opacity-50"
                       >
                          <X className="w-4 h-4" />
                          {isRTL ? 'رفض' : 'Decline'}
                       </button>
                    </div>
                 </div>
                 
                 <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                       <Clock className="w-3.5 h-3.5" />
                       {new Date(inv.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                       {inv.status === 'pending' ? (isRTL ? 'قيد الانتظار' : 'Pending') : inv.status}
                    </div>
                  </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center">
               <Bell className="w-16 h-16 text-gray-100 mx-auto mb-4" />
               <h3 className="text-xl font-black text-gray-300 uppercase tracking-widest">{isRTL ? 'لا توجد دعوات حالياً' : 'No Pending Invitations'}</h3>
            </div>
          )
        ) : (
          clinics.length > 0 ? (
            clinics.map((clinic) => (
              <div key={clinic.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-primary/30 transition-all group">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                       <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-gray-900">{clinic.name}</h3>
                       <p className="text-xs font-bold text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {clinic.address}
                       </p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right">
                       <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-black uppercase rounded-md tracking-widest">{isRTL ? 'علاقة نشطة' : 'Active Staff'}</span>
                       <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-tighter">{isRTL ? 'انضم في' : 'Joined'} {new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>
                    </div>

                 </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center">
               <Building2 className="w-16 h-16 text-gray-100 mx-auto mb-4" />
               <h3 className="text-xl font-black text-gray-300 uppercase tracking-widest">{isRTL ? 'لم تنضم لأي عيادة بعد' : 'Not linked to any clinics'}</h3>
               <p className="text-sm text-gray-400 mt-2 font-medium">{isRTL ? 'عند قبول دعوات العيادات ستظهر هنا' : 'Your linked clinics will appear here after you accept an invitation.'}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
