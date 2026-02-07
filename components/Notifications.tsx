
import React, { useState, useMemo } from 'react';
import { Bell, Calendar, Info, Settings, Check } from 'lucide-react';
import { AppState, Intervento } from '../types';

interface Props {
  state: AppState;
  updateSettings: (s: any) => void;
}

const Notifications: React.FC<Props> = ({ state, updateSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const alerts = useMemo(() => {
    const today = new Date();
    const threshold = new Date();
    threshold.setDate(today.getDate() + state.notificationSettings.daysBeforeDeadline);

    const list: { id: string; msg: string; date: string; type: 'start' | 'end' | 'test' }[] = [];

    state.interventi.forEach(i => {
      if (state.notificationSettings.notifyStart && i.dateStart) {
        const d = new Date(i.dateStart);
        if (d >= today && d <= threshold) {
          list.push({ id: i.id + '-start', msg: `Inizio lavori CIG ${i.cig}`, date: i.dateStart, type: 'start' });
        }
      }
      if (state.notificationSettings.notifyEnd && i.dateEnd) {
        const d = new Date(i.dateEnd);
        if (d >= today && d <= threshold) {
          list.push({ id: i.id + '-end', msg: `Fine lavori CIG ${i.cig}`, date: i.dateEnd, type: 'end' });
        }
      }
      if (state.notificationSettings.notifyTest && i.dateTest) {
        const d = new Date(i.dateTest);
        if (d >= today && d <= threshold) {
          list.push({ id: i.id + '-test', msg: `Collaudo CIG ${i.cig}`, date: i.dateTest, type: 'test' });
        }
      }
    });

    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [state]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
      >
        <Bell size={20} />
        {alerts.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {alerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Info size={16} className="text-blue-500" /> Notifiche Scadenze
            </h3>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200"
            >
              <Settings size={16} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isSettingsOpen ? (
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Preavviso (giorni)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 text-sm border rounded-lg"
                    value={state.notificationSettings.daysBeforeDeadline}
                    onChange={(e) => updateSettings({ daysBeforeDeadline: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'notifyStart', label: 'Notifica Inizio' },
                    { key: 'notifyEnd', label: 'Notifica Fine' },
                    { key: 'notifyTest', label: 'Notifica Collaudo' }
                  ].map(s => (
                    <label key={s.key} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={(state.notificationSettings as any)[s.key]} 
                        onChange={(e) => updateSettings({ [s.key]: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600">{s.label}</span>
                    </label>
                  ))}
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg"
                >
                  Salva e Chiudi
                </button>
              </div>
            ) : (
              <>
                {alerts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    Nessuna scadenza imminente.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {alerts.map(a => (
                      <div key={a.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-3">
                        <div className={`mt-1 p-2 rounded-lg ${
                          a.type === 'start' ? 'bg-emerald-50 text-emerald-600' :
                          a.type === 'end' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                          <Calendar size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{a.msg}</p>
                          <p className="text-xs text-slate-500">Scadenza: {new Date(a.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
