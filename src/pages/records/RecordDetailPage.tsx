import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FileTextIcon } from
'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useRecordsStore } from '../../lib/store/recordsStore';
export function RecordDetailPage() {
  const { recordId } = useParams<{
    recordId: string;
  }>();
  const { t, locale, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { records } = useRecordsStore();
  const record = records.find((r) => r.id === recordId);
  if (!record) {
    return <div className="p-8 text-center">Record not found</div>;
  }
  return (
    <div className="max-w-3xl mx-auto pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
        
        {isRTL ?
        <ArrowRightIcon className="w-4 h-4 ms-1" /> :

        <ArrowLeftIcon className="w-4 h-4 me-1" />
        }
        {t('common.back')}
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {locale === 'ar' ? record.titleAr : record.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400">
            <span className="bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-medium text-gray-700 dark:text-slate-200">
              {t(`records.types.${record.type}`)}
            </span>
            <span>
              {new Date(record.date).toLocaleDateString(
                locale === 'ar' ? 'ar-SA' : 'en-US',
                {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }
              )}
            </span>
          </div>
        </div>

      </div>

      <div className="bg-white dark:bg-slate-900 rounded-card shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 flex items-center gap-3">
          <FileTextIcon className="w-5 h-5 text-gray-400 dark:text-slate-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {t('records.detail.resultData')}
          </h2>
        </div>

        <div className="p-6">
          {record.type === 'diabetesAnalysis' &&
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.entries(record.data).map(([key, value]) =>
            <div key={key} className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">{value}</p>
                </div>
            )}
            </div>
          }

          {record.type === 'doctorVisit' &&
          <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Doctor</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {record.data.doctorName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Clinical Notes</p>
                <p className="text-gray-800 dark:text-slate-200 leading-relaxed bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
                  {record.data.notes}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Prescription</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {record.data.prescription}
                </p>
              </div>
            </div>
          }

          {record.type === 'xrayAnalysis' &&
          <div className="space-y-6">
              <div className="flex gap-6">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Finding</p>
                  <p className="font-medium text-gray-900 dark:text-white text-lg">
                    {record.data.finding}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">AI Confidence</p>
                  <p className="font-medium text-gray-900 dark:text-white text-lg">
                    {record.data.confidence}%
                  </p>
                </div>
              </div>
              {record.data.imageUrl &&
            <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Scanned Image</p>
                  <img
                src={record.data.imageUrl}
                alt="X-Ray"
                className="w-full max-w-md rounded-lg border border-gray-200 dark:border-slate-700" />
              
                </div>
            }
            </div>
          }
        </div>
      </div>
    </div>);

}