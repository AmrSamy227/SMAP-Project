// App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams } from
'react-router-dom';
import { LanguageProvider } from './lib/i18n/LanguageContext';
import { LandingPage } from './pages/landing/LandingPage';
import { AuthLayout } from './pages/auth/AuthLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { JoinPage } from './pages/auth/JoinPage';
import { AboutPage } from './pages/landing/AboutPage';
import { ContactPage } from './pages/landing/ContactPage';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { DiagnoseHubPage } from './pages/diagnose/DiagnoseHubPage';
import { DiabetesPage } from './pages/diagnose/DiabetesPage';
import { XrayPage } from './pages/diagnose/XrayPage';
import { ChatPage } from './pages/chat/ChatPage';
import { DoctorListingPage } from './pages/booking/DoctorListingPage';
import { DoctorProfilePage } from './pages/booking/DoctorProfilePage';
import { BookingConfirmPage } from './pages/booking/BookingConfirmPage';
import { PaymentPage } from './pages/booking/PaymentPage';
import { MyBookingsPage } from './pages/booking/MyBookingsPage';
import { ClinicProfilePage } from './pages/booking/ClinicProfilePage1';
import { RecordsTimelinePage } from './pages/records/RecordsTimelinePage';
import { RecordDetailPage } from './pages/records/RecordDetailPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ClinicDoctorsPage } from './pages/clinic/ClinicDoctorsPage';
import { ClinicAppointmentsPage } from './pages/clinic/ClinicAppointmentsPage';
import { ClinicPatientsPage } from './pages/clinic/ClinicPatientsPage';
import { DoctorAppointmentsPage } from './pages/doctor/DoctorAppointmentsPage';
import { DoctorPatientsPage } from './pages/doctor/DoctorPatientsPage';
import { DoctorInvitationsPage } from './pages/doctor/DoctorInvitationsPage';
import { useAuthInit } from './hooks/useAuthInit';
// A wrapper to inject the locale from the URL into the LanguageProvider
function LocaleWrapper() {
  const { locale } = useParams<{
    locale: string;
  }>();
  // Default to 'en' if invalid locale
  const validLocale = locale === 'en' || locale === 'ar' ? locale : 'en';
  
  // Initialize authentication on app load
  useAuthInit();

  return (
    <LanguageProvider initialLocale={validLocale as 'en' | 'ar'}>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="join" element={<JoinPage />} />
        </Route>
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />

        {/* Main App Routes - Protected */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="admin-dashboard" element={<AdminDashboardPage />} />

          {/* Phase 2 Routes */}
          <Route path="diagnose" element={<DiagnoseHubPage />} />
          <Route path="diagnose/diabetes" element={<DiabetesPage />} />
          <Route path="diagnose/xray" element={<XrayPage />} />
          <Route path="chat" element={<ChatPage />} />

          {/* Phase 3 Routes */}
          <Route path="booking" element={<DoctorListingPage />} />
          <Route path="booking/confirm" element={<BookingConfirmPage />} />
          <Route path="booking/payment" element={<PaymentPage />} />
          <Route path="booking/my" element={<MyBookingsPage />} />
          <Route path="booking/clinic/:clinicId" element={<ClinicProfilePage />} />
          <Route path="booking/:doctorId" element={<DoctorProfilePage />} />
          <Route path="records" element={<RecordsTimelinePage />} />
          <Route path="records/:recordId" element={<RecordDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Clinic Management Routes */}
          <Route path="clinic/doctors" element={<ClinicDoctorsPage />} />
          <Route path="clinic/appointments" element={<ClinicAppointmentsPage />} />
          <Route path="clinic/patients" element={<ClinicPatientsPage />} />

          {/* Doctor Management Routes */}
          <Route path="doctor/appointments" element={<DoctorAppointmentsPage />} />
          <Route path="doctor/patients" element={<DoctorPatientsPage />} />
          <Route path="doctor/invitations" element={<DoctorInvitationsPage />} />

          {/* Catch-all for unknown routes within a locale */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </LanguageProvider>);

}
export function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/en" replace />} />

        {/* Locale-prefixed routes */}
        <Route path="/:locale/*" element={<LocaleWrapper />} />

        {/* Catch-all for completely unknown routes */}
        <Route path="*" element={<Navigate to="/en" replace />} />
      </Routes>
    </BrowserRouter>);

}
