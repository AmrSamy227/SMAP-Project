import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Stethoscope, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Send,
  Loader2Icon
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useAuthStore } from '../../lib/store/authStore';
import { doctorApi } from '../../lib/api/doctorApi';

export function ClinicDoctorsPage() {
  const { isRTL } = useLanguage();
  const { user } = useAuthStore();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isUnlinkingId, setIsUnlinkingId] = useState<string | null>(null);

  const fetchDoctors = async () => {
    if (!user?.clinic_account?.id) return;
    try {
      const data = await doctorApi.getClinicDoctors(user.clinic_account.id);
      setDoctors(data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [user?.clinic_account?.id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(searchQuery.trim());
      
      if (isUUID) {
        try {
          const doc = await doctorApi.getDoctorById(searchQuery.trim());
          if (doc && doc.id) {
            setSearchResults([doc]);
            return;
          }
        } catch (error) {
          // If fetching by ID fails, fallback to normal search
        }
      }

      const results = await doctorApi.searchDoctors(searchQuery);
      
      // The backend might not support name filtering on this endpoint,
      // so we enforce local filtering to guarantee only matching doctors are shown.
      const filteredResults = results.filter((doc: any) => 
        doc.full_name?.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInvite = async (doctorId: string) => {
    if (!user?.clinic_account?.id) return;
    setIsInviting(true);
    setInviteMessage(null);
    try {
      await doctorApi.inviteDoctor(user.clinic_account.id, doctorId, "Join our clinic staff");
      setInviteMessage({ 
        type: 'success', 
        text: isRTL ? 'تم إرسال الدعوة بنجاح' : 'Invitation sent successfully' 
      });
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      setInviteMessage({ 
        type: 'error', 
        text: error.message || 'Failed to send invitation' 
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleUnlink = async (doctorId: string) => {
    if (!user?.clinic_account?.id) return;
    if (!window.confirm(isRTL ? 'هل أنت متأكد من إزالة هذا الطبيب من العيادة؟' : 'Are you sure you want to remove this doctor from the clinic?')) return;
    
    setIsUnlinkingId(doctorId);
    try {
      await doctorApi.unlinkDoctor(user.clinic_account.id, doctorId);
      setDoctors(prev => prev.filter(d => d.id !== doctorId));
      setOpenMenuId(null);
    } catch (error) {
      alert(isRTL ? 'حدث خطأ أثناء إزالة الطبيب' : 'Failed to unlink doctor');
    } finally {
      setIsUnlinkingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            {isRTL ? 'أطقم العمل الطبية' : 'Medical Staff'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
            {isRTL ? 'إدارة الأطباء والمتخصصين في منشأتك' : 'Manage doctors and specialists in your facility.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctors List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 flex items-center justify-between mb-4 transition-colors">
             <h3 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">{isRTL ? 'الأطباء الحاليين' : 'Current Doctors'}</h3>
             <span className="bg-primary/10 dark:bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black">{doctors.length}</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
               <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : doctors.length > 0 ? (
            doctors.map((doc) => (
              <div key={doc.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-primary/30 dark:hover:border-primary/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                    <Stethoscope className="w-6 h-6 text-primary/40 dark:text-primary/20" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{doc.full_name}</h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-tighter">
                      {isRTL ? doc.specialization?.name_ar : doc.specialization?.name_en}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 relative">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 justify-end text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase">{isRTL ? 'نشط' : 'Active'}</span>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 mt-0.5 uppercase">8 {isRTL ? 'حجز اليوم' : 'Bookings Today'}</p>
                  </div>
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg text-gray-400 dark:text-slate-500 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {openMenuId === doc.id && (
                    <div className="absolute top-12 right-0 bg-white dark:bg-slate-800 border border-red-500 dark:border-red-900/50 rounded-xl shadow-lg shadow-red-100 dark:shadow-none overflow-hidden py-1 w-48 z-10 animate-in zoom-in-95 duration-100">
                      <button 
                        onClick={() => handleUnlink(doc.id)}
                        disabled={isUnlinkingId === doc.id}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2 font-bold"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        {isUnlinkingId === doc.id ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        {isRTL ? 'إزالة الطبيب' : 'Unlink Doctor'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-slate-800 p-12 text-center transition-colors">
              <Users className="w-12 h-12 text-gray-200 dark:text-slate-800 mx-auto mb-4" />
              <h3 className="font-bold text-gray-400 dark:text-slate-500">{isRTL ? 'لا يوجد أطباء بعد' : 'No doctors yet'}</h3>
              <p className="text-sm text-gray-300 dark:text-slate-600 mt-1">{isRTL ? 'ابدأ بدعوة الأطباء للانضمام إلى عيادتك' : 'Start by inviting doctors to join your clinic.'}</p>
            </div>
          )}
        </div>

        {/* Invite Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none transition-colors">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                <UserPlus className="w-5 h-5" />
              </div>
              <h2 className="font-black text-gray-900 dark:text-white">{isRTL ? 'دعوة طبيب جديد' : 'Invite New Doctor'}</h2>
            </div>

            <form onSubmit={handleSearch} className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">{isRTL ? 'البحث عن طبيب بالاسم' : 'Search doctor by name'}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isRTL ? 'أدخل اسم الطبيب...' : 'Enter doctor name...'} 
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-50 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 text-sm font-bold focus:border-primary dark:focus:border-primary outline-none transition-all dark:text-white"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSearching}
                className="w-full py-2 bg-gray-900 dark:bg-primary text-white font-black text-xs rounded-xl hover:bg-black dark:hover:bg-primary/80 transition-all flex items-center justify-center gap-2"
              >
                {isSearching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                {isRTL ? 'بحث' : 'Search'}
              </button>
            </form>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
               {searchResults.map((doc) => (
                 <div key={doc.id} className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700 flex items-center justify-between animate-in slide-in-from-right-4 transition-colors">
                    <div>
                       <p className="text-sm font-bold text-gray-900 dark:text-white">{doc.full_name}</p>
                       <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase">{doc.specialization?.[isRTL ? 'name_ar' : 'name_en']}</p>
                    </div>
                    <button 
                      onClick={() => handleInvite(doc.id)}
                      disabled={isInviting}
                      className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50"
                    >
                       <Send className="w-4 h-4" />
                    </button>
                 </div>
               ))}
            </div>

            {inviteMessage && (
              <div className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${inviteMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400'}`}>
                {inviteMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {inviteMessage.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
