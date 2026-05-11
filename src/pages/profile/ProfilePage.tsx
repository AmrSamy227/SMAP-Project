import React, { useState, useEffect, useRef } from 'react';
import {
  Edit2,
  User,
  Phone,
  Mail,
  Droplets,
  Ruler,
  Weight,
  ShieldCheck,
  HeartPulse,
  MapPin,
  Building2,
  Stethoscope,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Settings,
  Activity,
  XCircle,
  ChevronDown,
  Check,
  AlertCircleIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useAuthStore } from '../../lib/store/authStore';
import { fetchApi } from '../../lib/api/apiClient';
import { profileApi } from '../../lib/api/profileApi';
import { doctorApi, AvailabilityRule, Slot } from '../../lib/api/doctorApi';

export function ProfilePage() {
  const { isRTL } = useLanguage();
  const { user, setUser } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(user?.role === 'clinic' ? 'clinic-info' : 'general');
  const [specializations, setSpecializations] = useState<{ id: string; name_en: string; name_ar: string }[]>([]);
  const [clinicDoctors, setClinicDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    date_of_birth: user?.profile?.date_of_birth || '',
    gender: user?.profile?.gender || 'male',
    blood_type: user?.profile?.blood_type || 'A+',
    height_cm: user?.profile?.height_cm?.toString() || '180',
    weight_kg: user?.profile?.weight_kg?.toString() || '75',
    known_allergies: user?.profile?.known_allergies || '',
    chronic_conditions: user?.profile?.chronic_conditions || '',
    emergency_contact_name: user?.profile?.emergency_contact_name || '',
    emergency_contact_phone: user?.profile?.emergency_contact_phone || '',
    clinic_name: user?.clinic_account?.name || '',
    clinic_address: user?.clinic_account?.address || '',
    clinic_phone: user?.clinic_account?.phone || '',
    clinic_email: user?.clinic_account?.email || '',
    clinic_location: user?.clinic_account?.location || '',
    specialization_id: user?.doctor_account?.specialization_id || '',
    language_spoken: user?.doctor_account?.language_spoken || 'both',
    bio_en: user?.doctor_account?.bio_en || '',
    bio_ar: user?.doctor_account?.bio_ar || '',
    consultation_price_egp: user?.doctor_account?.consultation_price_egp?.toString() || '',
    years_of_experience: user?.doctor_account?.years_of_experience?.toString() || '',
    license_number: user?.doctor_account?.license_number || '',
  });

  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        const response = await fetchApi('/specializations/');
        const data = await response.json();
        setSpecializations(Array.isArray(data) ? data : []);
      } catch (err) {}
    };
    if (user?.role === 'doctor') fetchSpecs();
  }, [user?.role]);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const latestData = await profileApi.getCurrentUserWithProfile();
        if (latestData) {
          // If doctor, get full doctor profile with specialization details
          if (latestData.role === 'doctor') {
            try {
              const doctorData = await profileApi.getDoctorProfile();
              latestData.doctor_account = doctorData;
            } catch (err) {
              console.error('Failed to fetch detailed doctor profile:', err);
            }
          } else if (latestData.role === 'clinic' && latestData.clinic_account?.id) {
            try {
              const docs = await doctorApi.getClinicDoctors(latestData.clinic_account.id);
              setClinicDoctors(docs);
            } catch (err) {
              console.error('Failed to fetch clinic doctors:', err);
            }
          }
          
          setUser(latestData);
          setFormData({
            full_name: latestData.full_name || '',
            email: latestData.email || '',
            phone: latestData.phone || '',
            date_of_birth: latestData.profile?.date_of_birth || '',
            gender: latestData.profile?.gender || 'male',
            blood_type: latestData.profile?.blood_type || 'A+',
            height_cm: latestData.profile?.height_cm?.toString() || '180',
            weight_kg: latestData.profile?.weight_kg?.toString() || '75',
            known_allergies: latestData.profile?.known_allergies || '',
            chronic_conditions: latestData.profile?.chronic_conditions || '',
            emergency_contact_name: latestData.profile?.emergency_contact_name || '',
            emergency_contact_phone: latestData.profile?.emergency_contact_phone || '',
            clinic_name: latestData.clinic_account?.name || '',
            clinic_address: latestData.clinic_account?.address || '',
            clinic_phone: latestData.clinic_account?.phone || '',
            clinic_email: latestData.clinic_account?.email || '',
            clinic_location: latestData.clinic_account?.location || '',
            specialization_id: latestData.doctor_account?.specialization_id || '',
            language_spoken: latestData.doctor_account?.language_spoken || 'both',
            bio_en: latestData.doctor_account?.bio_en || '',
            bio_ar: latestData.doctor_account?.bio_ar || '',
            consultation_price_egp: latestData.doctor_account?.consultation_price_egp?.toString() || '',
            years_of_experience: latestData.doctor_account?.years_of_experience?.toString() || '',
            license_number: latestData.doctor_account?.license_number || '',
          });
        }
      } catch (error) {}
    };
    if (user?.uuid) fetchLatestProfile();
  }, [user?.uuid, setUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await profileApi.updateUserInfo({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
      });

      if (user?.role === 'user') {
        await profileApi.updateUserProfile(user.uuid, {
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          blood_type: formData.blood_type,
          height_cm: parseFloat(formData.height_cm),
          weight_kg: parseFloat(formData.weight_kg),
          known_allergies: formData.known_allergies,
          chronic_conditions: formData.chronic_conditions,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
        });
      } else if (user?.role === 'clinic') {
        await profileApi.updateClinicProfile(user.uuid, {
          name: formData.clinic_name,
          address: formData.clinic_address,
          phone: formData.clinic_phone,
          email: formData.clinic_email,
          location: formData.clinic_location,
        });
      } else if (user?.role === 'doctor') {
        await profileApi.updateDoctorProfile(user.uuid, {
          specialization_id: formData.specialization_id,
          language_spoken: formData.language_spoken,
          bio_en: formData.bio_en,
          bio_ar: formData.bio_ar,
          consultation_price_egp: parseFloat(formData.consultation_price_egp),
          years_of_experience: parseInt(formData.years_of_experience),
          license_number: formData.license_number,
        });
      }

      const latest = await profileApi.getCurrentUserWithProfile();
      if (latest) setUser(latest);
      setIsEditing(false);
    } catch (error) {} finally { setIsSaving(false); }
  };

  const isUserProfile = user?.role === 'user';
  const isClinicProfile = user?.role === 'clinic';
  const isDoctorProfile = user?.role === 'doctor';

  const labelClass = "block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 transition-colors";
  const inputClass = "w-full border-2 border-gray-100 dark:border-slate-800 rounded-xl py-3 px-4 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm transition-all bg-gray-50/30 dark:bg-slate-800 dark:text-white";

  return (
    <div className={`min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-32 transition-colors ${isRTL ? 'rtl' : 'ltr'}`}>
      <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={`text-center ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-center md:justify-end' : 'justify-center md:justify-start'} mb-1`}>
                <div className="w-2 h-6 bg-primary rounded-full" />
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {isUserProfile ? (isRTL ? 'ملف المريض' : 'Patient Profile') : isClinicProfile ? (isRTL ? 'سجل المنشأة' : 'Clinic Registry') : (isRTL ? 'ملف الطبيب' : 'Doctor Profile')}
                </h1>
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-sm font-medium hidden md:block">
                {isRTL ? 'إدارة بياناتك وهويتك الطبية في مكان واحد' : 'Manage your data and medical identity in one place.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-6 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center gap-2 ${isEditing ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105'}`}
              >
                {isEditing ? <CheckCircle2 className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isEditing ? (isRTL ? 'إلغاء' : 'CANCEL') : (isRTL ? 'تحرير' : 'EDIT')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-4">
        <nav className="flex p-1 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-50 dark:border-slate-800 gap-1 overflow-x-auto transition-colors">
          {isUserProfile && ['general', 'medical', 'emergency'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-max py-2 text-xs font-black rounded-lg transition-all duration-300 ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
              {tab === 'general' && (isRTL ? 'شخصي' : 'PERSONAL')}
              {tab === 'medical' && (isRTL ? 'طبي' : 'MEDICAL')}
              {tab === 'emergency' && (isRTL ? 'طوارئ' : 'EMERGENCY')}
            </button>
          ))}
          {isClinicProfile && ['clinic-info', 'clinic-hours'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-max py-2 text-xs font-black rounded-lg transition-all duration-300 ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
              {tab === 'clinic-info' && (isRTL ? 'معلومات العيادة والتواصل' : 'CLINIC INFO & CONTACT')}
              {tab === 'clinic-hours' && (isRTL ? 'مواعيد العمل' : 'WORKING HOURS')}
            </button>
          ))}
          {isDoctorProfile && ['general', 'schedule'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-max py-2 text-xs font-black rounded-lg transition-all duration-300 ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
              {tab === 'general' && (isRTL ? 'شخصي' : 'PERSONAL')}
              {tab === 'schedule' && (isRTL ? 'الجدول' : 'SCHEDULE')}
            </button>
          ))}
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none p-8 text-center border border-gray-50 dark:border-slate-800 relative overflow-hidden transition-colors">
               <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-br from-primary/5 to-cyan-50/30 dark:from-primary/10 dark:to-cyan-900/10" />
               <div className="relative z-10">
                  <div className="w-32 h-32 mx-auto bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-8 border-gray-50 dark:border-slate-800 shadow-lg mb-4 overflow-hidden transition-colors">
                    <span className="text-5xl font-black text-primary/30 dark:text-primary/10">{user?.full_name?.charAt(0)}</span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{isClinicProfile ? formData.clinic_name : formData.full_name}</h2>
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" />
                    {isUserProfile ? (isRTL ? 'مريض معتمد' : 'Verified Patient') : isClinicProfile ? (isRTL ? 'منشأة طبية' : 'Medical Facility') : (isRTL ? 'طبيب ممارس' : 'Practicing Physician')}
                  </div>
               </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/5 dark:bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Mail className="w-5 h-5" /></div>
                  <div className="overflow-hidden"><p className={labelClass}>{isRTL ? 'البريد' : 'Email'}</p><p className="font-bold text-gray-800 dark:text-slate-200 text-sm truncate">{user?.email}</p></div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/5 dark:bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Phone className="w-5 h-5" /></div>
                  <div><p className={labelClass}>{isRTL ? 'الهاتف' : 'Phone'}</p><p className="font-bold text-gray-800 dark:text-slate-200 text-sm">{user?.phone}</p></div>
               </div>
            </div>

            {isUserProfile && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 text-center shadow-sm transition-all hover:border-primary/20">
                    <Droplets className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-tighter">{isRTL ? 'فصيلة الدم' : 'Blood'}</p>
                    <p className="font-black text-gray-900 dark:text-white">{formData.blood_type}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 text-center shadow-sm transition-all hover:border-primary/20">
                    <Activity className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-tighter">BMI</p>
                    <p className="font-black text-gray-900 dark:text-white">
                      {(parseFloat(formData.weight_kg) / Math.pow(parseFloat(formData.height_cm) / 100, 2)).toFixed(1)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 text-center shadow-sm transition-all hover:border-primary/20">
                    <Ruler className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-tighter">{isRTL ? 'الطول' : 'Height'}</p>
                    <p className="font-black text-gray-900 dark:text-white text-xs">{formData.height_cm} cm</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 text-center shadow-sm transition-all hover:border-primary/20">
                    <Weight className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-tighter">{isRTL ? 'الوزن' : 'Weight'}</p>
                    <p className="font-black text-gray-900 dark:text-white text-xs">{formData.weight_kg} kg</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none p-8 border border-gray-50 dark:border-slate-800 min-h-[500px] transition-colors">
               {isClinicProfile && activeTab === 'clinic-info' && (
                 <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">{isRTL ? 'بيانات المنشأة' : 'Facility Details'}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors">
                          <label className={labelClass}>{isRTL ? 'اسم العيادة' : 'Clinic Name'}</label>
                          {isEditing ? (
                            <input name="clinic_name" value={formData.clinic_name} onChange={handleChange} className={inputClass} />
                          ) : (
                            <p className="font-black text-lg text-gray-900 dark:text-white">{formData.clinic_name}</p>
                          )}
                        </div>
                        <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors">
                          <label className={labelClass}>{isRTL ? 'المسؤول' : 'Admin Name'}</label>
                          {isEditing ? (
                            <input name="full_name" value={formData.full_name} onChange={handleChange} className={inputClass} />
                          ) : (
                            <p className="font-bold text-gray-700 dark:text-slate-300">{formData.full_name}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors">
                        <label className={labelClass}>{isRTL ? 'وصف العيادة' : 'Clinic Bio'}</label>
                        {isEditing ? (
                          <textarea name="clinic_location" value={formData.clinic_location} onChange={handleChange} className={`${inputClass} min-h-[100px]`} />
                        ) : (
                          <p className="font-bold text-gray-600 dark:text-slate-400 leading-relaxed text-sm">
                            {formData.clinic_location || (isRTL ? 'لا يوجد وصف متاح.' : 'No description available.')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800 w-full transition-colors" />

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/20 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 transition-colors">
                          <Phone className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">{isRTL ? 'معلومات التواصل والموقع' : 'Contact & Location'}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors">
                          <label className={labelClass}>{isRTL ? 'بريد العيادة' : 'Clinic Email'}</label>
                          {isEditing ? (
                            <input name="clinic_email" value={formData.clinic_email} onChange={handleChange} className={inputClass} />
                          ) : (
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-primary" />
                              <p className="font-bold text-sm text-gray-800 dark:text-slate-300">{formData.clinic_email}</p>
                            </div>
                          )}
                        </div>
                        <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors">
                          <label className={labelClass}>{isRTL ? 'هاتف العيادة' : 'Clinic Phone'}</label>
                          {isEditing ? (
                            <input name="clinic_phone" value={formData.clinic_phone} onChange={handleChange} className={inputClass} />
                          ) : (
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-primary" />
                              <p className="font-bold text-sm text-gray-800 dark:text-slate-300">{formData.clinic_phone}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors">
                        <label className={labelClass}>{isRTL ? 'العنوان بالكامل' : 'Full Address'}</label>
                        {isEditing ? (
                          <input name="clinic_address" value={formData.clinic_address} onChange={handleChange} className={inputClass} />
                        ) : (
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="font-bold text-gray-700 dark:text-slate-300 text-sm leading-relaxed">{formData.clinic_address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                 </div>
               )}

               {isClinicProfile && activeTab === 'clinic-hours' && (
                 <div className="space-y-6 animate-in fade-in">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Stethoscope className="w-6 h-6" /></div>
                      <h3 className="text-xl font-black text-gray-900">{isRTL ? 'أطباء العيادة' : 'Clinic Doctors'}</h3>
                    </div>
                    {clinicDoctors.length === 0 ? (
                      <div className="text-center py-12">
                        <Stethoscope className="w-12 h-12 text-gray-200 dark:text-slate-800 mx-auto mb-3" />
                        <p className="text-gray-400 dark:text-slate-600 font-bold">{isRTL ? 'لا يوجد أطباء مرتبطون حالياً.' : 'No doctors linked currently.'}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {clinicDoctors.map(doc => (
                          <div key={doc.id} className="p-6 border border-gray-100 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-gray-200/40 dark:hover:shadow-none hover:border-primary/20 dark:hover:border-primary/40 group">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex flex-shrink-0 items-center justify-center font-black text-2xl text-primary border border-gray-100 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform">
                                {doc.full_name.charAt(0)}
                              </div>
                              <div className="space-y-1">
                                <p className="font-black text-gray-900 dark:text-white text-lg leading-tight">{doc.full_name}</p>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{isRTL ? doc.specialization?.name_ar : doc.specialization?.name_en}</p>
                                <div className="flex items-center gap-3 pt-2">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-slate-500">
                                    <Activity className="w-3 h-3" />
                                    {doc.years_of_experience} {isRTL ? 'سنوات خبرة' : 'Years exp.'}
                                  </div>
                                  <div className="w-1 h-1 bg-gray-200 dark:bg-slate-700 rounded-full" />
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-slate-500">
                                    <Droplets className="w-3 h-3 text-red-400" />
                                    {doc.consultation_price_egp} EGP
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center gap-2">
                              <button onClick={() => setSelectedDoctorId(doc.id)} className="w-full md:w-auto text-xs font-black text-white bg-primary px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
                                {isRTL ? 'إدارة الجدول' : 'Manage Schedule'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
               )}

               {isDoctorProfile && activeTab !== 'schedule' && (
                 <div className="space-y-12">
                    <div className="space-y-6">
                       <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><User className="w-6 h-6" /></div>
                         <h3 className="text-xl font-black text-gray-900">{isRTL ? 'البيانات الشخصية' : 'Personal Data'}</h3>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <h3 className="text-xl font-black text-gray-900 dark:text-white">{isRTL ? 'البيانات الشخصية' : 'Personal Data'}</h3>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div><label className={labelClass}>{isRTL ? 'الاسم الكامل' : 'Full Name'}</label>{isEditing ? <input name="full_name" value={formData.full_name} onChange={handleChange} className={inputClass} /> : <p className="font-bold text-gray-900 dark:text-white">{formData.full_name}</p>}</div>
                          <div><label className={labelClass}>{isRTL ? 'لغات التحدث' : 'Languages'}</label>{isEditing ? <select name="language_spoken" value={formData.language_spoken} onChange={handleChange} className={inputClass}><option value="en">English</option><option value="ar">Arabic</option><option value="both">Both</option></select> : <p className="font-bold uppercase text-gray-900 dark:text-white">{formData.language_spoken}</p>}</div>
                       </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 dark:bg-slate-800 transition-colors" />

                    <div className="space-y-6">
                       <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400"><Stethoscope className="w-6 h-6" /></div>
                         <h3 className="text-xl font-black text-gray-900 dark:text-white">{isRTL ? 'التفاصيل الطبية' : 'Medical Details'}</h3>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className={labelClass}>{isRTL ? 'التخصص' : 'Specialization'}</label>
                            {isEditing ? (
                              <select name="specialization_id" value={formData.specialization_id} onChange={handleChange} className={inputClass}>
                                {specializations.map(s => <option key={s.id} value={s.id}>{isRTL ? s.name_ar : s.name_en}</option>)}
                              </select>
                            ) : <p className="font-bold text-gray-900 dark:text-white">{user?.doctor_account?.specialization?.[isRTL ? 'name_ar' : 'name_en']}</p>}
                          </div>
                          <div><label className={labelClass}>{isRTL ? 'رقم الترخيص' : 'License No'}</label>{isEditing ? <input name="license_number" value={formData.license_number} onChange={handleChange} className={inputClass} /> : <p className="font-bold text-gray-900 dark:text-white">{formData.license_number}</p>}</div>
                          <div><label className={labelClass}>{isRTL ? 'سنوات الخبرة' : 'Years of Experience'}</label>{isEditing ? <input name="years_of_experience" value={formData.years_of_experience} onChange={handleChange} className={inputClass} /> : <p className="font-bold text-gray-900 dark:text-white">{formData.years_of_experience}</p>}</div>
                          <div><label className={labelClass}>{isRTL ? 'سعر الكشف' : 'Consultation Price'}</label>{isEditing ? <input name="consultation_price_egp" value={formData.consultation_price_egp} onChange={handleChange} className={inputClass} /> : <p className="font-bold text-primary">{formData.consultation_price_egp} {isRTL ? 'ج.م' : 'EGP'}</p>}</div>
                       </div>
                       <div><label className={labelClass}>{isRTL ? 'نبذة طبية' : 'Medical Bio'}</label>{isEditing ? <textarea name={isRTL ? 'bio_ar' : 'bio_en'} value={isRTL ? formData.bio_ar : formData.bio_en} onChange={handleChange} className={`${inputClass} min-h-[120px]`} /> : <p className="font-bold text-gray-600 dark:text-slate-400 leading-relaxed">{isRTL ? formData.bio_ar : formData.bio_en || (isRTL ? 'لا توجد نبذة.' : 'No bio available.')}</p>}</div>
                    </div>
                 </div>
               )}

               {isUserProfile && activeTab === 'general' && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{isRTL ? 'الهوية الشخصية' : 'Personal Identity'}</h3>
                          <p className="text-xs text-gray-400 dark:text-slate-500 font-bold">{isRTL ? 'بياناتك الأساسية المسجلة' : 'Your basic registered information'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-gray-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-gray-100/50 dark:border-slate-800 transition-colors">
                            <label className={labelClass}>{isRTL ? 'الاسم الكامل' : 'Full Name'}</label>
                            {isEditing ? (
                              <input name="full_name" value={formData.full_name} onChange={handleChange} className={inputClass} />
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="font-black text-gray-900 dark:text-white">{formData.full_name}</p>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              </div>
                            )}
                         </div>
                         <div className="bg-gray-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-gray-100/50 dark:border-slate-800 transition-colors">
                            <label className={labelClass}>{isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}</label>
                            {isEditing ? (
                              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className={inputClass} />
                            ) : (
                              <p className="font-black text-gray-900 dark:text-white">{formData.date_of_birth || (isRTL ? 'غير محدد' : 'Not set')}</p>
                            )}
                         </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-gray-100/50 dark:border-slate-800 transition-colors">
                          <label className={labelClass}>{isRTL ? 'الجنس' : 'Gender'}</label>
                          {isEditing ? (
                            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                              <option value="male">{isRTL ? 'ذكر' : 'Male'}</option>
                              <option value="female">{isRTL ? 'أنثى' : 'Female'}</option>
                            </select>
                          ) : (
                            <p className="font-black capitalize text-gray-900 dark:text-white">
                              {isRTL ? (formData.gender === 'male' ? 'ذكر' : formData.gender === 'female' ? 'أنثى' : formData.gender) : formData.gender}
                            </p>
                          )}
                        </div>
                        <div className="bg-gray-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-gray-100/50 dark:border-slate-800 transition-colors">
                           <label className={labelClass}>{isRTL ? 'رقم الهاتف' : 'Phone Number'}</label>
                           <p className="font-black text-gray-900 dark:text-white" dir="ltr">{user?.phone}</p>
                        </div>
                      </div>
                    </div>
                 </div>
               )}

               {isUserProfile && activeTab === 'medical' && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                        <HeartPulse className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{isRTL ? 'السجل الطبي' : 'Medical Record'}</h3>
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-bold">{isRTL ? 'تتبع حالتك الصحية وحساسياتك' : 'Track your health conditions and allergies'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border-2 border-gray-50 dark:border-slate-800 shadow-sm transition-colors">
                          <div className="flex items-center gap-2 mb-4">
                            <Droplets className="w-4 h-4 text-red-500" />
                            <label className={labelClass + " mb-0"}>{isRTL ? 'فصيلة الدم' : 'Blood Type'}</label>
                          </div>
                          {isEditing ? (
                            <select name="blood_type" value={formData.blood_type} onChange={handleChange} className={inputClass}>
                              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          ) : (
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{formData.blood_type}</p>
                          )}
                       </div>
                       <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border-2 border-gray-50 dark:border-slate-800 shadow-sm transition-colors">
                          <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-4 h-4 text-primary" />
                            <label className={labelClass + " mb-0"}>{isRTL ? 'القياسات البدنية' : 'Physical Metrics'}</label>
                          </div>
                          <div className="flex gap-8">
                             <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">{isRTL ? 'الطول' : 'Height'}</p>
                                {isEditing ? (
                                  <input type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} className="w-20 bg-transparent font-black text-lg outline-none border-b-2 border-primary/20" />
                                ) : (
                                  <p className="font-black text-lg text-gray-900 dark:text-white">{formData.height_cm} <span className="text-xs text-gray-400">cm</span></p>
                                )}
                             </div>
                             <div className="w-px h-10 bg-gray-100 dark:bg-slate-800" />
                             <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">{isRTL ? 'الوزن' : 'Weight'}</p>
                                {isEditing ? (
                                  <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} className="w-20 bg-transparent font-black text-lg outline-none border-b-2 border-primary/20" />
                                ) : (
                                  <p className="font-black text-lg text-gray-900 dark:text-white">{formData.weight_kg} <span className="text-xs text-gray-400">kg</span></p>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="bg-orange-50/50 dark:bg-orange-900/10 p-6 rounded-3xl border border-orange-100 dark:border-orange-900/20 transition-colors">
                          <div className="flex items-center gap-3 mb-3 text-orange-600 dark:text-orange-400">
                             <XCircle className="w-5 h-5" />
                             <label className="text-xs font-black uppercase tracking-widest">{isRTL ? 'الحساسية المعروفة' : 'Known Allergies'}</label>
                          </div>
                          {isEditing ? (
                            <textarea name="known_allergies" value={formData.known_allergies} onChange={handleChange} className={`${inputClass} bg-white dark:bg-slate-800 min-h-[100px] border-orange-200/50`} />
                          ) : (
                            <p className="font-bold text-gray-800 dark:text-slate-200 leading-relaxed">
                              {formData.known_allergies || (isRTL ? 'لا يوجد حساسيات مسجلة' : 'No recorded allergies')}
                            </p>
                          )}
                       </div>

                       <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/20 transition-colors">
                          <div className="flex items-center gap-3 mb-3 text-blue-600 dark:text-blue-400">
                             <Activity className="w-5 h-5" />
                             <label className="text-xs font-black uppercase tracking-widest">{isRTL ? 'الأمراض المزمنة' : 'Chronic Conditions'}</label>
                          </div>
                          {isEditing ? (
                            <textarea name="chronic_conditions" value={formData.chronic_conditions} onChange={handleChange} className={`${inputClass} bg-white dark:bg-slate-800 min-h-[100px] border-blue-200/50`} />
                          ) : (
                            <p className="font-bold text-gray-800 dark:text-slate-200 leading-relaxed">
                              {formData.chronic_conditions || (isRTL ? 'لا يوجد أمراض مزمنة مسجلة' : 'No recorded chronic conditions')}
                            </p>
                          )}
                       </div>
                    </div>
                 </div>
               )}

               {isUserProfile && activeTab === 'emergency' && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{isRTL ? 'اتصال الطوارئ' : 'Emergency Contact'}</h3>
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-bold">{isRTL ? 'الشخص الذي يتم الاتصال به في الحالات الحرجة' : 'The person to contact in critical situations'}</p>
                      </div>
                    </div>

                    <div className="bg-rose-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-rose-200 dark:shadow-none">
                       <Phone className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 -rotate-12" />
                       <div className="relative z-10 space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{isRTL ? 'الاسم' : 'CONTACT NAME'}</p>
                                {isEditing ? (
                                  <input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className="w-full bg-white/20 border-2 border-white/20 rounded-xl py-3 px-4 font-black outline-none focus:bg-white/30 placeholder:text-white/40" placeholder="Jane Doe" />
                                ) : (
                                  <p className="text-2xl font-black">{formData.emergency_contact_name || (isRTL ? 'غير محدد' : 'Not Set')}</p>
                                )}
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{isRTL ? 'رقم الهاتف' : 'CONTACT PHONE'}</p>
                                {isEditing ? (
                                  <input name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} className="w-full bg-white/20 border-2 border-white/20 rounded-xl py-3 px-4 font-black outline-none focus:bg-white/30 placeholder:text-white/40" placeholder="01012345678" />
                                ) : (
                                  <div className="flex items-center gap-4">
                                     <p className="text-2xl font-black" dir="ltr">{formData.emergency_contact_phone || (isRTL ? 'غير محدد' : 'Not Set')}</p>
                                     {formData.emergency_contact_phone && (
                                       <a href={`tel:${formData.emergency_contact_phone}`} className="w-10 h-10 bg-white text-rose-500 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg">
                                          <Phone className="w-5 h-5 fill-current" />
                                       </a>
                                     )}
                                  </div>
                                )}
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/10">
                             <AlertCircleIcon className="w-5 h-5 text-rose-200" />
                             <p className="text-xs font-bold leading-relaxed text-rose-50">
                               {isRTL ? 'سيتم عرض هذه المعلومات للطواقم الطبية في الحالات الطارئة فقط.' : 'This information will be displayed to medical staff in emergency cases only.'}
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

                {isDoctorProfile && activeTab === 'schedule' && (
                <DoctorScheduleManager 
                  doctorId={user?.doctor_account?.id || ''} 
                  initialClinicId={null}
                />
                )}

                {isEditing && (
                 <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 transition-colors">
                    <button onClick={() => setIsEditing(false)} className="px-8 py-3 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all">{isRTL ? 'إلغاء' : 'Discard'}</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-10 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
                       {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                       {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                    </button>
                 </div>
               )}
            </div>
          </section>
        </div>
      </main>

      {/* Availability Modal */}
      <AnimatePresence>
        {selectedDoctorId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
            onClick={() => setSelectedDoctorId(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative transition-colors"
            >
              <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-20 transition-colors">
                <h3 className="font-black text-xl text-gray-900 dark:text-white">{isRTL ? 'إدارة مواعيد الطبيب' : 'Doctor Schedule Management'}</h3>
                <button onClick={() => setSelectedDoctorId(null)} className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <DoctorScheduleManager 
                  doctorId={selectedDoctorId} 
                  initialClinicId={user?.clinic_account?.id}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DoctorScheduleManager({ doctorId, initialClinicId }: { doctorId: string; initialClinicId?: string | null }) {
  const { isRTL } = useLanguage();
  const [availability, setAvailability] = useState<AvailabilityRule[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeClinics, setActiveClinics] = useState<any[]>([]);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [newRule, setNewRule] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    slot_duration_minutes: 30,
    clinic_id: initialClinicId || null as string | null
  });

  const [genDates, setGenDates] = useState({
    from_date: new Date().toISOString().split('T')[0],
    to_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [availData, profileData, slotsData] = await Promise.all([
          doctorApi.getAvailability(doctorId),
          profileApi.getDoctorProfile(doctorId),
          doctorApi.getSlots({ 
            doctor_id: doctorId, 
            clinic_id: initialClinicId || undefined,
            date: new Date().toISOString().split('T')[0] 
          })
        ]);
        
        // Filter availability by clinic if in clinic view
        const filteredAvail = initialClinicId 
          ? availData.filter(r => r.clinic_id === initialClinicId)
          : availData;
        setAvailability(filteredAvail);

        // Extract clinics from profile response
        const clinicsData = profileData.doctor_clinics?.map(dc => dc.clinic) || [];
        setActiveClinics(clinicsData);
        
        // Filter slots by clinic if in clinic view (though getSlots should already do it)
        const filteredSlots = initialClinicId
          ? slotsData.filter(s => s.clinic_id === initialClinicId)
          : slotsData;
        setSlots(filteredSlots);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (doctorId) loadData();
  }, [doctorId, initialClinicId]);

  const handleAddRule = async () => {
    try {
      const created = await doctorApi.createAvailability(doctorId, newRule);
      setAvailability([...availability, created]);
    } catch (err) {
      alert(isRTL ? 'فشل إضافة القاعدة' : 'Failed to add rule');
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await doctorApi.deleteAvailability(doctorId, id);
      setAvailability(availability.filter(r => r.id !== id));
    } catch (err) {
      alert(isRTL ? 'فشل حذف القاعدة' : 'Failed to delete rule');
    }
  };

  const handleUpdateRule = async (id: string, data: Partial<AvailabilityRule>) => {
    try {
      const updated = await doctorApi.updateAvailability(doctorId, id, data);
      setAvailability(availability.map(r => r.id === id ? updated : r));
      setEditingRuleId(null);
    } catch (err) {
      alert(isRTL ? 'فشل تحديث القاعدة' : 'Failed to update rule');
    }
  };

  const handleGenerateSlots = async () => {
    setIsGenerating(true);
    try {
      if (initialClinicId) {
        // Clinic view: only generate for this clinic
        await doctorApi.generateSlots({
          doctor_id: doctorId,
          clinic_id: initialClinicId,
          from_date: genDates.from_date,
          to_date: genDates.to_date
        });
      } else {
        // Doctor view: generate for independent and ALL clinics
        // 1. Generate independent slots
        await doctorApi.generateSlots({
          doctor_id: doctorId,
          clinic_id: null,
          from_date: genDates.from_date,
          to_date: genDates.to_date
        });

        // 2. Then generate for each clinic
        for (const clinic of activeClinics) {
          await doctorApi.generateSlots({
            doctor_id: doctorId,
            clinic_id: clinic.id,
            from_date: genDates.from_date,
            to_date: genDates.to_date
          });
        }
      }

      alert(isRTL ? 'تم توليد جميع المواعيد بنجاح!' : 'All slots generated successfully!');
      // Refresh slots
      const updated = await doctorApi.getSlots({ 
        doctor_id: doctorId, 
        clinic_id: initialClinicId || undefined,
        date: genDates.from_date 
      });
      setSlots(initialClinicId ? updated.filter(s => s.clinic_id === initialClinicId) : updated);
    } catch (err) {
      console.error(err);
      alert(isRTL ? 'فشل توليد بعض أو كل المواعيد' : 'Failed to generate slots');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await doctorApi.deleteSlot(id);
      setSlots(slots.filter(s => s.id !== id));
    } catch (err) {
      alert(isRTL ? 'فشل حذف الموعد' : 'Failed to delete slot');
    }
  };

  const handleUpdateSlot = async (id: string, data: Partial<Slot>) => {
    try {
      const updated = await doctorApi.updateSlot(id, data);
      setSlots(slots.map(s => s.id === id ? updated : s));
      setEditingSlotId(null);
    } catch (err) {
      alert(isRTL ? 'فشل تحديث الموعد' : 'Failed to update slot');
    }
  };

  const days = [
    { id: 0, name: isRTL ? 'الإثنين' : 'Monday' },
    { id: 1, name: isRTL ? 'الثلاثاء' : 'Tuesday' },
    { id: 2, name: isRTL ? 'الأربعاء' : 'Wednesday' },
    { id: 3, name: isRTL ? 'الخميس' : 'Thursday' },
    { id: 4, name: isRTL ? 'الجمعة' : 'Friday' },
    { id: 5, name: isRTL ? 'السبت' : 'Saturday' },
    { id: 6, name: isRTL ? 'الأحد' : 'Sunday' },
  ];

  if (isLoading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Availability Rules Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary transition-colors"><Clock className="w-6 h-6" /></div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white transition-colors">{isRTL ? 'قواعد التوافر الأسبوعية' : 'Weekly Availability Rules'}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
           {availability.map(rule => (
             <div key={rule.id} className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center justify-between group transition-colors">
                {editingRuleId === rule.id ? (
                  <div className="grid grid-cols-2 gap-2 w-full pr-4">
                     <input type="time" defaultValue={rule.start_time.slice(0,5)} onBlur={e => handleUpdateRule(rule.id, { start_time: e.target.value })} className="bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-lg p-1 font-bold text-xs dark:text-white" />
                     <input type="time" defaultValue={rule.end_time.slice(0,5)} onBlur={e => handleUpdateRule(rule.id, { end_time: e.target.value })} className="bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-lg p-1 font-bold text-xs dark:text-white" />
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-black text-primary uppercase tracking-widest">{days.find(d => d.id === rule.day_of_week)?.name}</p>
                    <p className="font-bold text-gray-700 dark:text-slate-300">{rule.start_time.slice(0,5)} - {rule.end_time.slice(0,5)}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold">{rule.slot_duration_minutes} {isRTL ? 'دقيقة لكل موعد' : 'min slots'}</p>
                    {rule.clinic_id && <p className="text-[10px] text-primary font-black uppercase mt-1">@ {activeClinics.find(c => c.id === rule.clinic_id)?.name}</p>}
                  </div>
                )}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setEditingRuleId(editingRuleId === rule.id ? null : rule.id)} className="p-2 text-gray-300 dark:text-slate-600 hover:text-primary dark:hover:text-primary hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all">
                      <Edit2 className="w-4 h-4" />
                   </button>
                   <button onClick={() => handleDeleteRule(rule.id)} className="p-2 text-red-300 dark:text-red-900/40 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </div>
           ))}
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-100/20 dark:shadow-none relative transition-colors">
            <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 dark:bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            </div>
           
            <div className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2 transition-colors">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              {isRTL ? 'إضافة قاعدة دوام جديدة' : 'Add New Work Rule'}
            </div>

            {/* Type Selector (Segmented Control) - Only show if not in clinic view */}
            {!initialClinicId && (
              <div className="flex bg-gray-50 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-8 w-fit border border-gray-100 dark:border-slate-800 transition-colors">
                <button 
                  type="button"
                  onClick={() => setNewRule({...newRule, clinic_id: null})}
                  className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${!newRule.clinic_id ? 'bg-white dark:bg-slate-900 text-primary shadow-lg shadow-gray-200/50 dark:shadow-none' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
                >
                  <User className="w-3.5 h-3.5" />
                  {isRTL ? 'مستقل' : 'Independent'}
                </button>
                <button 
                  type="button"
                  onClick={() => activeClinics.length > 0 ? setNewRule({...newRule, clinic_id: activeClinics[0].id}) : alert(isRTL ? 'لا توجد عيادات نشطة' : 'No active clinics found')}
                  className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${newRule.clinic_id ? 'bg-white dark:bg-slate-900 text-primary shadow-lg shadow-gray-200/50 dark:shadow-none' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {isRTL ? 'عيادة' : 'Clinic'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" ref={dropdownRef}>
               {/* Day Selector */}
               <div className="space-y-2 relative">
                 <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">{isRTL ? 'اليوم' : 'Day'}</label>
                 <div className="relative">
                   <button
                     type="button"
                     onClick={() => setOpenDropdown(openDropdown === 'day' ? null : 'day')}
                     className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 px-4 font-bold text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-slate-700 transition-all outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                   >
                     <span>{days.find(d => d.id === newRule.day_of_week)?.name}</span>
                     <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform duration-300 ${openDropdown === 'day' ? 'rotate-180' : ''}`} />
                   </button>
                   
                   <AnimatePresence>
                     {openDropdown === 'day' && (
                       <motion.div
                         initial={{ opacity: 0, y: 10, scale: 0.95 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, y: 10, scale: 0.95 }}
                         className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl dark:shadow-none py-2 overflow-y-auto max-h-60 scrollbar-hide transition-colors"
                       >
                         {days.map(d => (
                           <button
                             key={d.id}
                             onClick={() => {
                               setNewRule({...newRule, day_of_week: d.id});
                               setOpenDropdown(null);
                             }}
                             className={`w-full px-4 py-2.5 text-sm font-bold flex items-center justify-between transition-colors ${newRule.day_of_week === d.id ? 'bg-primary/5 dark:bg-primary/10 text-primary' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                           >
                             {d.name}
                             {newRule.day_of_week === d.id && <Check className="w-3.5 h-3.5" />}
                           </button>
                         ))}
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">{isRTL ? 'من' : 'From'}</label>
                 <input type="time" value={newRule.start_time} onChange={e => setNewRule({...newRule, start_time: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white" />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">{isRTL ? 'إلى' : 'To'}</label>
                 <input type="time" value={newRule.end_time} onChange={e => setNewRule({...newRule, end_time: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white" />
               </div>

               {/* Clinic Selector */}
               {newRule.clinic_id && (
                 <div className="space-y-2 animate-in slide-in-from-left duration-300 relative">
                   <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">{isRTL ? 'العيادة المختارة' : 'Selected Clinic'}</label>
                   <div className="relative">
                     <button
                       type="button"
                       onClick={() => setOpenDropdown(openDropdown === 'clinic' ? null : 'clinic')}
                       className="w-full bg-primary/5 dark:bg-primary/10 border-2 border-primary/10 dark:border-primary/20 rounded-2xl py-3.5 px-4 font-bold text-sm flex items-center justify-between text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-all outline-none focus:border-primary"
                     >
                       <div className="flex items-center gap-2">
                         <Building2 className="w-4 h-4 opacity-60" />
                         <span className="truncate max-w-[120px]">{activeClinics.find(c => c.id === newRule.clinic_id)?.name || (isRTL ? 'اختر العيادة' : 'Select Clinic')}</span>
                       </div>
                       <ChevronDown className={`w-4 h-4 opacity-40 transition-transform duration-300 ${openDropdown === 'clinic' ? 'rotate-180' : ''}`} />
                     </button>
                     
                     <AnimatePresence>
                       {openDropdown === 'clinic' && (
                         <motion.div
                           initial={{ opacity: 0, y: 10, scale: 0.95 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           exit={{ opacity: 0, y: 10, scale: 0.95 }}
                           className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl dark:shadow-none py-2 overflow-y-auto max-h-60 scrollbar-hide transition-colors"
                         >
                           {activeClinics.map(c => (
                             <button
                               key={c.id}
                               onClick={() => {
                                 setNewRule({...newRule, clinic_id: c.id});
                                 setOpenDropdown(null);
                               }}
                               className={`w-full px-4 py-2.5 text-sm font-bold flex items-center justify-between transition-colors ${newRule.clinic_id === c.id ? 'bg-primary/5 dark:bg-primary/10 text-primary' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                             >
                               <div className="flex items-center gap-2">
                                 <Building2 className="w-3.5 h-3.5 opacity-40" />
                                 <span className="truncate">{c.name}</span>
                               </div>
                               {newRule.clinic_id === c.id && <Check className="w-3.5 h-3.5" />}
                             </button>
                           ))}
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                 </div>
               )}
            </div>

            <button onClick={handleAddRule} className="mt-8 w-full py-4 bg-primary text-white font-black rounded-[1.25rem] text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-dark hover:shadow-2xl hover:shadow-primary/40 active:scale-[0.98] transition-all shadow-xl shadow-primary/20">
               <Plus className="w-5 h-5" />
               {isRTL ? 'إضافة القاعدة' : 'Add Rule'}
            </button>
        </div>
      </section>

      {/* Slots Generation Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark p-8 rounded-[40px] text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
        <Activity className="absolute -right-8 -top-8 w-48 h-48 opacity-10 rotate-12" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Settings className="w-6 h-6 text-white" /></div>
            <h3 className="text-xl font-black">{isRTL ? 'توليد المواعيد' : 'Generate Slots'}</h3>
          </div>
          <p className="text-sm font-medium text-white/80 mb-8 max-w-lg">
            {isRTL ? 'قم بتوليد مواعيد ملموسة بناءً على القواعد الأسبوعية التي قمت بتعيينها.' : 'Generate concrete appointment slots based on the weekly rules you have set.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
             <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-60">{isRTL ? 'من تاريخ' : 'From Date'}</label>
                <input type="date" value={genDates.from_date} onChange={e => setGenDates({...genDates, from_date: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 px-4 font-bold text-sm outline-none focus:bg-white/20 transition-all text-white" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-60">{isRTL ? 'إلى تاريخ' : 'To Date'}</label>
                <input type="date" value={genDates.to_date} onChange={e => setGenDates({...genDates, to_date: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 px-4 font-bold text-sm outline-none focus:bg-white/20 transition-all text-white" />
             </div>
          </div>
          <button 
            onClick={handleGenerateSlots}
            disabled={isGenerating}
            className="w-full py-4 bg-white text-primary font-black rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all shadow-xl disabled:opacity-50"
          >
            {isGenerating ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Settings className="w-5 h-5" />}
            {isRTL ? 'توليد المواعيد الآن' : 'Generate Slots Now'}
          </button>
        </div>
      </section>

      {/* Active Slots Preview */}
      <section>
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-xl font-black text-gray-900 dark:text-white transition-colors">{isRTL ? 'المواعيد النشطة (اليوم)' : 'Active Slots (Today)'}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
           {slots.map(slot => (
             <div key={slot.id} className={`p-3 rounded-2xl border text-center relative group transition-all ${slot.is_booked ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/50 transition-colors'}`}>
                {editingSlotId === slot.id ? (
                  <input 
                    type="time" 
                    defaultValue={slot.slot_start_time.slice(0,5)} 
                    onBlur={e => handleUpdateSlot(slot.id, { slot_start_time: e.target.value })}
                    className="w-full bg-primary/5 dark:bg-primary/10 border-none font-black text-[10px] text-center rounded-md p-1 dark:text-white"
                    autoFocus
                  />
                ) : (
                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 mb-1 cursor-pointer hover:text-primary transition-colors" onClick={() => !slot.is_booked && setEditingSlotId(slot.id)}>
                    {slot.slot_start_time.slice(0,5)}
                  </p>
                )}
                <p className={`text-xs font-black ${slot.is_booked ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'} transition-colors`}>{slot.is_booked ? (isRTL ? 'محجوز' : 'BOOKED') : (isRTL ? 'متاح' : 'OPEN')}</p>
                {!slot.is_booked && (
                  <button onClick={() => handleDeleteSlot(slot.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}