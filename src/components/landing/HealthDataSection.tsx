import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export function HealthDataSection() {
  const { t } = useLanguage();

  const data = [
    { name: 'Mon', activity: 40, recovery: 60 },
    { name: 'Tue', activity: 45, recovery: 55 },
    { name: 'Wed', activity: 55, recovery: 70 },
    { name: 'Thu', activity: 50, recovery: 65 },
    { name: 'Fri', activity: 65, recovery: 80 },
    { name: 'Sat', activity: 60, recovery: 75 },
    { name: 'Sun', activity: 70, recovery: 85 }
  ];

  const benefits = [
    t('landing.healthData.benefit1'),
    t('landing.healthData.benefit2'),
    t('landing.healthData.benefit3')
  ];

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text */}
          <motion.div
            initial={{
              opacity: 0,
              x: -20
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
            className="max-w-lg"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
              {t('landing.healthData.title')}
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              {t('landing.healthData.subtitle')}
            </p>

            <ul className="space-y-4">
              {benefits.map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="bg-cyan-100 rounded-full p-1">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Column - Dashboard Mockup */}
          <motion.div
            initial={{
              opacity: 0,
              y: 40
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            className="relative"
          >
            {/* Background decorative elements */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-100 to-blue-50 rounded-[2.5rem] transform rotate-3 opacity-50"></div>

            <div className="relative bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
              {/* Patient Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <img
                    src="https://i.pravatar.cc/150?img=5"
                    alt="Sarah Jenkins"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900">Sarah Jenkins</h3>
                    <p className="text-xs text-slate-500">Patient ID: #88294</p>
                  </div>
                </div>
                <div className="bg-cyan-50 text-cyan-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Stable
                </div>
              </div>

              {/* Vitals Cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Heart Rate</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">72</span>
                    <span className="text-xs text-slate-500">bpm</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Blood Pressure</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">
                      118/76
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Sleep Score</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900">92</span>
                    <span className="text-xs text-green-500 font-medium flex items-center">
                      ↑ 4%
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart Area */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {t('landing.healthData.activityRecovery')}
                  </h4>
                  <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900">
                    This Week <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data}
                      margin={{
                        top: 5,
                        right: 5,
                        left: -20,
                        bottom: 0
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: '#94a3b8'
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: '#94a3b8'
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        labelStyle={{
                          color: '#64748b',
                          fontSize: '12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="activity"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="recovery"
                        stroke="#818cf8"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
