import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Sparkles } from 'lucide-react';
import { Navbar } from '../../components/landing/LandingNavbar';
import { Footer } from '../../components/landing/Footer';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export function ContactPage() {
  const { locale } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const contactMethods = [
    {
      icon: Mail,
      title: locale === 'ar' ? 'البريد الإلكتروني' : 'Email Us',
      value: 'support@medassist.ai',
      desc: locale === 'ar' ? 'رد سريع في غضون 24 ساعة' : 'Fast response within 24 hours',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Phone,
      title: locale === 'ar' ? 'اتصل بنا' : 'Call Support',
      value: '+20 123 456 7890',
      desc: locale === 'ar' ? 'من الأحد إلى الخميس، 9ص - 6م' : 'Sun - Thu, 9am - 6pm',
      color: 'bg-cyan-50 text-cyan-600'
    },
    {
      icon: MapPin,
      title: locale === 'ar' ? 'المقر الرئيسي' : 'Main Office',
      value: locale === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
      desc: locale === 'ar' ? 'مبنى التكنولوجيا، القرية الذكية' : 'Tech Building, Smart Village',
      color: 'bg-emerald-50 text-emerald-600'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for form submission would go here
    alert(locale === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Message sent successfully!');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-sm font-bold mb-6 transition-colors">
                <Sparkles className="w-4 h-4" />
                {locale === 'ar' ? 'تواصل معنا' : 'Get in Touch'}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6">
                {locale === 'ar' ? 'كيف يمكننا مساعدتك؟' : 'How Can We Help You?'}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {locale === 'ar' 
                  ? 'سواء كان لديك سؤال حول ميزاتنا، أو تريد الانضمام كطبيب، أو تحتاج إلى مساعدة تقنية، فريقنا هنا من أجلك.'
                  : 'Whether you have a question about our features, want to join as a doctor, or need technical support, our team is here for you.'}
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {contactMethods.map((method, i) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:shadow-lg"
                >
                  <div className={`w-12 h-12 ${method.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{method.title}</h3>
                  <p className="text-cyan-600 dark:text-cyan-400 font-bold mb-2">{method.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{method.desc}</p>
                </motion.div>
              ))}

              {/* FAQ Preview */}
              <div className="bg-cyan-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <MessageCircle className="w-10 h-10 mb-6 opacity-80" />
                  <h4 className="text-xl font-bold mb-2">{locale === 'ar' ? 'تحتاج رد فوري؟' : 'Need Instant Help?'}</h4>
                  <p className="text-cyan-100 text-sm mb-6">
                    {locale === 'ar' ? 'تحقق من مركز المساعدة الخاص بنا للحصول على إجابات سريعة.' : 'Check our Help Center for quick answers to common questions.'}
                  </p>
                  <button className="bg-white text-cyan-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-cyan-50 transition-colors">
                    {locale === 'ar' ? 'عرض الأسئلة الشائعة' : 'View FAQ'}
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform" />
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-cyan-500 outline-none transition-all dark:text-white"
                        placeholder={locale === 'ar' ? 'أدخل اسمك' : 'Your Name'}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-cyan-500 outline-none transition-all dark:text-white"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      {locale === 'ar' ? 'الموضوع' : 'Subject'}
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-cyan-500 outline-none transition-all dark:text-white"
                      placeholder={locale === 'ar' ? 'كيف يمكننا المساعدة؟' : 'How can we help?'}
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      {locale === 'ar' ? 'الرسالة' : 'Message'}
                    </label>
                    <textarea
                      required
                      rows={6}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-cyan-500 outline-none transition-all dark:text-white resize-none"
                      placeholder={locale === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-700 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                    {locale === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
