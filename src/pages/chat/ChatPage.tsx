import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareIcon,
  SendIcon,
  PlusIcon,
  CalendarIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  UserIcon,
  BotIcon
} from
  'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useChatStore, Message } from '../../lib/store/chatStore';
import { useAuthStore } from '../../lib/store/authStore';
import { DisclaimerBanner } from '../../components/shared/DisclaimerBanner';
export function ChatPage() {
  const { t, locale, isRTL, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    sessions,
    activeSessionId,
    messages,
    isTyping,
    addMessage,
    setTyping,
    setActiveSession
  } = useChatStore();
  const { user } = useAuthStore();
  const [inputValue, setInputValue] = useState('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const userText = inputValue.trim();
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };
    addMessage(newUserMsg);
    setInputValue('');
    setTyping(true);

    try {
      const response = await fetch("https://joelolo.app.n8n.cloud/webhook/f91bbaec-770a-4977-a774-85a1efd864dddd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          chat_id: activeSessionId || user?.uuid || "default_user_id",
          locale: locale
        })
      });

      const data = await response.json();
      const botResponseText = data.Response || data.response || (locale === 'ar' ? "لم أتمكن من فهم ذلك." : "Sorry, I couldn't understand that.");

      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botResponseText,
        timestamp: new Date().toISOString(),
      };
      addMessage(newBotMsg);
    } catch (error) {
      console.error("Chat API Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: locale === 'ar' ? "عذراً، حدث خطأ في الاتصال بالخادم." : "Sorry, there was an error connecting to the server.",
        timestamp: new Date().toISOString()
      };
      addMessage(errorMsg);
    } finally {
      setTyping(false);
    }
  };
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString(
      locale === 'ar' ? 'ar-SA' : 'en-US',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };
  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] flex flex-col overflow-hidden bg-gray-50 dark:bg-slate-950 -m-4 md:-m-6 lg:-m-8 transition-colors duration-300">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 relative">
        {/* Header */}
        <div className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 p-2 rounded-lg">
              <MessageSquareIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('chat.title')}</h2>
          </div>

          {/* Language Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {locale === 'en' ? '🌐 EN' : '🌐 AR'}
            </button>
            {showLanguageMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden"
              >
                <button
                  onClick={() => {
                    const newPath = location.pathname.replace(/^\/(en|ar)/, '/en');
                    navigate(newPath);
                    setShowLanguageMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${locale === 'en' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                    }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    const newPath = location.pathname.replace(/^\/(en|ar)/, '/ar');
                    navigate(newPath);
                    setShowLanguageMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-t border-gray-200 dark:border-slate-700 ${locale === 'ar' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                    }`}
                >
                  العربية
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <DisclaimerBanner />

            {messages.length === 0 ?
              <div className="h-full flex flex-col items-center justify-center text-center mt-20">
                <div className="bg-blue-50 dark:bg-blue-900/20 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                  <BotIcon className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('chat.emptyState')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  {t('chat.emptyStateDesc')}
                </p>
              </div> :

              <div className="space-y-6 pb-4">
                {messages.map((msg) =>
                  <motion.div
                    key={msg.id}
                    initial={{
                      opacity: 0,
                      y: 10
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    className={`flex ${msg.role === 'user' ? isRTL ? 'justify-start' : 'justify-end' : isRTL ? 'justify-end' : 'justify-start'}`}>

                    <div
                      className={`flex max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? isRTL ? 'flex-row-reverse' : 'flex-row' : isRTL ? 'flex-row-reverse' : 'flex-row'}`}>

                      {/* Avatar */}
                      <div
                        className={`flex-shrink-0 ${msg.role === 'user' ? isRTL ? 'me-3' : 'ms-3' : isRTL ? 'ms-3' : 'me-3'} mt-1`}>

                        {msg.role === 'user' ?
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-500" />
                          </div> :

                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <BotIcon className="h-5 w-5 text-blue-600" />
                          </div>
                        }
                      </div>

                      {/* Bubble */}
                      <div className="max-w-xs">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-4 rounded-2xl transition-all ${msg.role === 'user'
                              ? 'bg-gradient-to-br from-primary to-primary/90 text-white rounded-tr-sm rtl:rounded-tr-2xl rtl:rounded-tl-sm shadow-md'
                              : 'bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 rounded-tl-sm rtl:rounded-tl-2xl rtl:rounded-tr-sm'
                            }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed text-sm">
                            {msg.content}
                          </p>
                        </motion.div>
                        <div
                          className={`text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-1 ${msg.role === 'user' ? (isRTL ? 'justify-start' : 'justify-end') : isRTL ? 'justify-end' : 'justify-start'
                            }`}
                        >
                          {msg.role === 'bot' && (
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          )}
                          {formatTime(msg.timestamp)}
                          {msg.role === 'user' && (
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          )}
                        </div>
                        {/* Specialist Suggestion Card */}
                        {msg.specialistSuggestion && (
                          <div className="mt-3 bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-900/50 rounded-xl p-4 shadow-sm max-w-sm">
                            <div className="flex items-start gap-3">
                              <div className="bg-teal-50 dark:bg-teal-900/20 p-2 rounded-lg text-teal-600 dark:text-teal-400">
                                <CalendarIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {t('chat.specialist.title')}
                                </h4>
                                <p className="text-teal-700 dark:text-teal-400 font-medium mt-1">
                                  {msg.specialistSuggestion.specialty}
                                </p>
                                <Link
                                  to={`/${locale}/booking`}
                                  className="inline-flex items-center mt-3 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 py-1.5 px-3 rounded-md transition-colors"
                                >
                                  {t('chat.specialist.bookNow')}
                                  {isRTL ? (
                                    <ChevronLeftIcon className="h-4 w-4 ms-1" />
                                  ) : (
                                    <ChevronRightIcon className="h-4 w-4 ms-1" />
                                  )}
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Typing Indicator */}
                {isTyping &&
                  <motion.div
                    initial={{
                      opacity: 0
                    }}
                    animate={{
                      opacity: 1
                    }}
                    className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>

                    <div
                      className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>

                      <div
                        className={`flex-shrink-0 ${isRTL ? 'ms-3' : 'me-3'} mt-1`}>

                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <BotIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 rounded-2xl rounded-tl-sm rtl:rounded-tl-2xl rtl:rounded-tr-sm shadow-sm flex items-center gap-1.5">
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{
                            y: [0, -5, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6,
                            delay: 0
                          }} />

                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{
                            y: [0, -5, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6,
                            delay: 0.2
                          }} />

                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{
                            y: [0, -5, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6,
                            delay: 0.4
                          }} />

                      </div>
                    </div>
                  </motion.div>
                }
              </div>
            }
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 transition-colors">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSend} className="relative">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('chat.placeholder')}
                  className="flex-1 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-full py-3 px-6 focus:outline-none focus:ring-0 focus:border-primary dark:focus:border-primary/50 focus:bg-white dark:focus:bg-slate-700 text-gray-900 dark:text-white transition-all"
                  disabled={isTyping}
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                >
                  <SendIcon className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
