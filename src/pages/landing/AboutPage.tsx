import { motion } from 'framer-motion';
import { ShieldCheck, Users, Globe, Target, Award } from 'lucide-react';
import { Navbar } from '../../components/landing/LandingNavbar';
import { Footer } from '../../components/landing/Footer';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export function AboutPage() {
  const { isRTL, locale } = useLanguage();

  const stats = [
    { label: 'Active Users', value: '100K+', icon: Users },
    { label: 'Trusted Doctors', value: '500+', icon: Award },
    { label: 'Countries', value: '12+', icon: Globe },
    { label: 'Accuracy Rate', value: '99.8%', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 text-sm font-bold uppercase tracking-widest mb-6">
                {locale === 'ar' ? 'مهمتنا' : 'Our Mission'}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                {locale === 'ar' ? 'إحداث ثورة في الرعاية الصحية' : 'Revolutionizing Healthcare'} <br />
                <span className="text-cyan-500">{locale === 'ar' ? 'بذكاء اصطناعي' : 'With Intelligence'}</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                {locale === 'ar' 
                  ? 'في MedAssist AI، نؤمن بأن الرعاية الصحية الجيدة يجب أن تكون متاحة وفورية وذكية. نحن نبني مستقبل الطب من خلال دمج تكنولوجيا الذكاء الاصطناعي المتقدمة مع الخبرة البشرية.'
                  : 'At MedAssist AI, we believe that quality healthcare should be accessible, immediate, and smart. We are building the future of medicine by combining advanced AI technology with human expertise.'}
              </p>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center"
              >
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-cyan-500" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {locale === 'ar' ? (stat.label === 'Active Users' ? 'مستخدم نشط' : stat.label === 'Trusted Doctors' ? 'طبيب موثوق' : stat.label === 'Countries' ? 'دولة' : 'دقة التشخيص') : stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Content Sections */}
          <div className="space-y-32">
            {/* Vision */}
            <div className={`flex flex-col lg:flex-row items-center gap-16 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1">
                <div className="w-16 h-16 bg-cyan-50 dark:bg-cyan-900/20 rounded-[2rem] flex items-center justify-center mb-8">
                  <Target className="w-8 h-8 text-cyan-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">
                  {locale === 'ar' ? 'رؤيتنا' : 'Our Vision'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg mb-8">
                  {locale === 'ar'
                    ? 'أن نكون القائد العالمي في مساعد الرعاية الصحية المدعوم بالذكاء الاصطناعي، وتمكين الأفراد من التحكم في رحلتهم الصحية من خلال التشخيص الأولي الفوري والاتصال المهني السلس.'
                    : 'To be the global leader in AI-driven healthcare assistance, empowering individuals to take control of their health journey through instant preliminary diagnosis and seamless professional connections.'}
                </p>
                <ul className="space-y-4">
                  {[
                    locale === 'ar' ? 'رؤى صحية فورية مدعومة بالذكاء الاصطناعي' : 'Instant AI-powered health insights',
                    locale === 'ar' ? 'اتصال مباشر مع كبار المتخصصين' : 'Direct connection to top specialists',
                    locale === 'ar' ? 'إدارة آمنة وخاصة للسجلات الطبية' : 'Secure and private medical record management',
                    locale === 'ar' ? 'رعاية صحية متاحة للجميع في كل مكان' : 'Accessible healthcare for everyone, everywhere'
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                      <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3 h-3 text-white" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 relative">
                <div className="aspect-square bg-gradient-to-br from-cyan-400 to-blue-500 rounded-[3rem] overflow-hidden shadow-2xl rotate-3">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" 
                    alt="Healthcare Tech" 
                    className="w-full h-full object-cover mix-blend-overlay opacity-80"
                  />
                </div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl -z-10" />
              </div>
            </div>

            {/* Values */}
            <div className="bg-slate-900 dark:bg-slate-800 rounded-[4rem] p-12 lg:p-20 relative overflow-hidden">
               <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                 <div className={isRTL ? 'text-right' : 'text-left'}>
                    <h2 className="text-4xl font-black text-white mb-8">
                      {locale === 'ar' ? 'مبني على الثقة والابتكار' : 'Built on Trust & Innovation'}
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-10">
                      {locale === 'ar'
                        ? 'نحن لا نتهاون أبداً في السلامة. يتم التحقق بدقة من كل نموذج ذكاء اصطناعي، ويتم فحص كل طبيب على منصتنا بعناية لضمان حصولك على أفضل رعاية ممكنة.'
                        : 'We never compromise on safety. Every AI model is strictly validated, and every doctor on our platform is rigorously verified to ensure you receive the best care possible.'}
                    </p>
                    <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-50 transition-colors">
                      {locale === 'ar' ? 'انضم إلى مجتمعنا' : 'Join Our Community'}
                    </button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { title: locale === 'ar' ? 'الخصوصية أولاً' : 'Privacy First', desc: locale === 'ar' ? 'بياناتك مشفرة وآمنة تماماً.' : 'Your data is encrypted and secure.' },
                      { title: locale === 'ar' ? 'الدقة الطبية' : 'Medical Rigor', desc: locale === 'ar' ? 'خوارزميات ذكاء اصطناعي معتمدة طبياً.' : 'Clinically validated AI algorithms.' },
                      { title: locale === 'ar' ? 'الوصول العالمي' : 'Global Reach', desc: locale === 'ar' ? 'كسر الحدود في الرعاية الصحية.' : 'Breaking borders in healthcare.' },
                      { title: locale === 'ar' ? 'متاح دائماً' : 'Always On', desc: locale === 'ar' ? 'متاح 24/7 بين يديك.' : 'Available 24/7 at your fingertips.' }
                    ].map(val => (
                      <div key={val.title} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl">
                        <h4 className="text-white font-bold mb-2">{val.title}</h4>
                        <p className="text-slate-400 text-sm">{val.desc}</p>
                      </div>
                    ))}
                 </div>
               </div>
               <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
