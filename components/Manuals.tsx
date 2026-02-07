
import React, { useState, useRef, useEffect } from 'react';
import { 
  Book, HelpCircle, Building2, Map as MapIcon, ClipboardList, ShieldCheck, 
  Search, ChevronRight, FileText, Smartphone, Laptop, Edit3, Save, X, 
  ArrowLeft, Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, ExternalLink, Link, Download, FileDown, Type
} from 'lucide-react';
import { User, ManualEntry } from '../types';

interface Props {
  currentUser: User | null;
  manualContents: Record<string, ManualEntry>;
  onSaveManual: (id: string, entry: ManualEntry) => void;
}

const Manuals: React.FC<Props> = ({ currentUser, manualContents, onSaveManual }) => {
  const [selectedGuide, setSelectedGuide] = useState<{id: string, title: string} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'admin';

  const categories = [
    {
      title: "Gestione Patrimonio",
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
      items: [
        { id: "censimento-immobile", label: "Come censire un nuovo immobile istituzionale" },
        { id: "associazione-plessi", label: "Associazione di Plessi e Unità Locali" },
        { id: "storico-nomi", label: "Gestione dello storico delle denominazioni" },
        { id: "dati-tecnici", label: "Inserimento dati tecnici e planimetrie" }
      ]
    },
    {
      title: "Manutenzione e CIG",
      icon: ClipboardList,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      items: [
        { id: "man-1", label: "Registrazione di un nuovo intervento manutentivo" },
        { id: "man-2", label: "Monitoraggio cronoprogramma e scadenze" },
        { id: "man-3", label: "Gestione proroghe e sospensioni lavori" },
        { id: "man-4", label: "Verifica budget e rendicontazione economica" }
      ]
    },
    {
      title: "Viabilità e Mappe",
      icon: MapIcon,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      items: [
        { id: "map-1", label: "Utilizzo della mappa interattiva per la localizzazione" },
        { id: "map-2", label: "Geocodifica automatica tramite indirizzo" },
        { id: "map-3", label: "Consultazione del registro tecnico stradale" },
        { id: "map-4", label: "Filtri avanzati per la rete viaria" }
      ]
    },
    {
      title: "Amministrazione",
      icon: ShieldCheck,
      color: "text-red-600",
      bg: "bg-red-50",
      items: [
        { id: "admin-1", label: "Configurazione permessi granulari per utenti" },
        { id: "admin-2", label: "Audit Log: monitoraggio delle attività di sistema" },
        { id: "admin-3", label: "Esportazione massiva dati in formato CSV" },
        { id: "admin-4", label: "Politiche di sicurezza e restrizione domini" }
      ]
    }
  ];

  const handleOpenGuide = (id: string, title: string) => {
    const entry = manualContents[id];
    setSelectedGuide({ id, title: entry?.title || title });
    setEditContent(entry?.content || "<div>Nuova guida in fase di redazione...</div>");
    setEditTitle(entry?.title || title);
    setEditUrl(entry?.externalUrl || '');
    setIsEditing(false);
  };

  const handleCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setEditContent(editorRef.current.innerHTML);
    }
  };

  const handleSave = () => {
    if (selectedGuide) {
      const finalContent = editorRef.current ? editorRef.current.innerHTML : editContent;
      onSaveManual(selectedGuide.id, { 
        content: finalContent, 
        externalUrl: editUrl,
        title: editTitle
      });
      setSelectedGuide(prev => prev ? { ...prev, title: editTitle } : null);
      setIsEditing(false);
    }
  };

  const downloadAsPDF = () => {
    window.print();
  };

  const downloadAsDoc = () => {
    if (!selectedGuide) return;
    const entry = manualContents[selectedGuide.id];
    const content = entry?.content || "";
    const titleToUse = entry?.title || selectedGuide.title;
    
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${titleToUse}</title>
        <style>
          body { font-family: 'Arial Narrow', Arial, sans-serif; }
          h1, h2, h3 { color: #006600; }
        </style>
      </head>
      <body>
        <h1>${titleToUse}</h1>
        <p><i>Documento generato da EdilGest Pro</i></p>
        <hr>
        ${content}
      </body>
    </html>`;

    const blob = new Blob(['\ufeff', header], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${titleToUse.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (selectedGuide) {
    const entry = manualContents[selectedGuide.id];
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto">
        <div className="flex items-center justify-between no-print">
          <button 
            onClick={() => setSelectedGuide(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-institutional-700 font-black text-xs uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={18} /> Torna all'indice
          </button>
          
          <div className="flex gap-3">
             {isAdmin && !isEditing && (
               <>
                <button 
                  onClick={downloadAsDoc}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                  title="Scarica in formato Word"
                >
                  <FileDown size={16} /> Word
                </button>
                <button 
                  onClick={downloadAsPDF}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                  title="Esporta in PDF"
                >
                  <FileText size={16} /> PDF
                </button>
               </>
             )}

             {entry?.externalUrl && !isEditing && (
               <a 
                 href={entry.externalUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
               >
                 <ExternalLink size={16} /> Link Risorsa Esterna
               </a>
             )}
             {isAdmin && !isEditing && (
               <button 
                 onClick={() => setIsEditing(true)}
                 className="flex items-center gap-2 bg-institutional-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-institutional-800 transition-all"
               >
                 <Edit3 size={16} /> Modifica Guida
               </button>
             )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col min-h-[600px] print:shadow-none print:border-none print:rounded-none">
          <div className="bg-slate-900 p-10 text-white relative shrink-0 print:bg-white print:text-slate-900 print:border-b-2 print:border-institutional-700 print:p-0 print:mb-8">
            <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-12 translate-x-10 no-print"></div>
            {isEditing ? (
              <div className="relative z-10 space-y-2 max-w-2xl">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titolo della Guida</label>
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-1 border border-white/10 focus-within:border-institutional-400 transition-all">
                  <Type size={20} className="text-slate-400 ml-3" />
                  <input 
                    className="flex-1 bg-transparent border-none text-2xl font-black tracking-tight uppercase outline-none p-2 placeholder:text-white/20"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Inserisci titolo..."
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-3xl font-black tracking-tight uppercase relative z-10 print:text-2xl">{entry?.title || selectedGuide.title}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2 relative z-10 print:text-slate-500">Manuale Operativo Certificato - EdilGest Pro</p>
              </>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {isEditing ? (
              <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-wrap items-center gap-2 sticky top-0 z-20">
                  <button onClick={() => handleCommand('bold')} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Grassetto"><Bold size={18} /></button>
                  <button onClick={() => handleCommand('italic')} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Corsivo"><Italic size={18} /></button>
                  <button onClick={() => handleCommand('underline')} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Sottolineato"><Underline size={18} /></button>
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  <button onClick={() => handleCommand('insertUnorderedList')} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Elenco puntato"><List size={18} /></button>
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  <button onClick={() => handleCommand('justifyLeft')} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Allinea a sinistra"><AlignLeft size={18} /></button>
                  <button onClick={() => handleCommand('justifyCenter')} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Allinea al centro"><AlignCenter size={18} /></button>
                  <button onClick={() => handleCommand('justifyRight')} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Allinea a destra"><AlignRight size={18} /></button>
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm ml-auto">
                    <Link size={14} className="text-slate-400" />
                    <input 
                      type="url" 
                      placeholder="Link esterno (opzionale)..." 
                      className="text-[10px] font-bold text-slate-600 outline-none w-48 bg-transparent"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div 
                  ref={editorRef}
                  contentEditable
                  className="flex-1 p-10 outline-none overflow-y-auto"
                  style={{ 
                    fontFamily: '"Arial Narrow", Arial, sans-serif', 
                    fontSize: '18px', 
                    lineHeight: '1.6',
                    color: '#1e293b'
                  }}
                  onInput={(e) => setEditContent(e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: editContent }}
                />

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-institutional-700 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-institutional-800 transition-all"
                  >
                    <Save size={18} /> Salva Documento
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-10 bg-white border border-slate-200 text-slate-500 font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-10 flex-1 print:p-0">
                <article 
                  className="prose prose-slate max-w-none"
                  style={{ 
                    fontFamily: '"Arial Narrow", Arial, sans-serif', 
                    fontSize: '18px', 
                    lineHeight: '1.6',
                    color: '#334155'
                  }}
                  dangerouslySetInnerHTML={{ __html: entry?.content || "<i>Guida in fase di caricamento...</i>" }}
                />
                
                <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest print:mt-10">
                  <div className="flex items-center gap-4">
                    <span>DOC_ID: {selectedGuide.id}</span>
                    {entry?.externalUrl && <span className="text-institutional-400 no-print">● DISPONIBILE LINK ESTERNO</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-institutional-400" />
                    Versione Digitale 1.6.4
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl no-print">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-institutional-700 rounded-2xl"><Book size={32} /></div>
              <h2 className="text-4xl font-black tracking-tighter uppercase">Documentazione Utente</h2>
            </div>
            <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
              Il centro risorse EdilGest Pro per la formazione degli operatori. Naviga tra le categorie o consulta le risorse esterne collegate.
            </p>
          </div>
          <div className="shrink-0 flex gap-4">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 flex flex-col items-center gap-2">
              <Laptop size={24} className="text-institutional-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Rich Text v2</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 flex flex-col items-center gap-2">
              <Download size={24} className="text-institutional-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Multi-Export</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid delle Categorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 ${cat.bg} ${cat.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                <cat.icon size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{cat.title}</h3>
            </div>
            <div className="space-y-3">
              {cat.items.map((item) => {
                const manualTitle = manualContents[item.id]?.title || item.label;
                return (
                  <button 
                    key={item.id} 
                    onClick={() => handleOpenGuide(item.id, item.label)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all group/btn"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-slate-400 group-hover/btn:text-institutional-700" />
                      <span className="text-sm font-bold text-slate-600 group-hover/btn:text-slate-900 text-left">{manualTitle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {manualContents[item.id]?.externalUrl && <ExternalLink size={14} className="text-institutional-300" />}
                      <ChevronRight size={18} className="text-slate-300 group-hover/btn:text-institutional-700 transform group-hover/btn:translate-x-1 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Support */}
      <div className="bg-institutional-50 border border-institutional-100 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-6 no-print">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-institutional-700 shadow-sm border border-institutional-200">
            <HelpCircle size={32} />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Supporto Tecnico Dedicato</h4>
            <p className="text-sm text-slate-600 font-medium italic">Assistenza sistemistica per la configurazione dei moduli avanzati.</p>
          </div>
        </div>
        <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all">
          Richiedi Assistenza
        </button>
      </div>
    </div>
  );
};

export default Manuals;
