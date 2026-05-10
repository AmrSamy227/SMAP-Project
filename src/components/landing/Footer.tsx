import { HeartPulse, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export function Footer() {
  const navigate = useNavigate();
  const { locale, t } = useLanguage();

  const handleNavigation = (path: string) => {
    navigate(`/${locale}${path}`);
  };

  return (
    <footer className="bg-[#0f1629] text-slate-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-cyan-500 p-1.5 rounded-lg">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                SMAP
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {t('landing.footer.description')}
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white font-semibold mb-6">
              {t('landing.footer.platform')}
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <button
                  onClick={() => handleNavigation('/diagnose')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  {t('landing.footer.aiDiagnosis')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/chat')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  {t('landing.footer.smartChatbot')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/booking')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  {t('landing.footer.findDoctor')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/records')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  {t('landing.footer.patientPortal')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">
              {t('landing.footer.company')}
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <button
                  onClick={() => handleNavigation('/about')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  {t('landing.footer.aboutUs')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/contact')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  {t('landing.footer.contactUs') || 'Contact Us'}
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  {t('landing.footer.careers')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  {t('landing.footer.privacyPolicy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  {t('landing.footer.termsOfService')}
                </a>
              </li>
            </ul>
          </div>

          {/* Social Column */}
          <div>
            <h4 className="text-white font-semibold mb-6">
              {t('landing.footer.connect')}
            </h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>{t('landing.footer.copyright')}</p>
          <div className="flex gap-6">
            <span>HIPAA Compliant</span>
            <span>ISO 27001 Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
