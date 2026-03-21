import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, Search, TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

export const CMIDashboard: React.FC = () => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;

    const [filterPers, setFilterPers] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterResp, setFilterResp] = useState('all');

    const indicadoresBase = [
        { id: 1, p: "Financiera", p_en: "Financial", t: "Eficacia", t_en: "Efficacy", n: "Margen Neto por Viaje", n_en: "Net Margin per Trip", f: "(Ingreso - Gasto) / Ingreso", r: "Administracion", r_en: "Admin", o: ">", m: "25", u: "%", trend: "up" },
        { id: 2, p: "Financiera", p_en: "Financial", t: "Eficiencia", t_en: "Efficiency", n: "Costo Diesel vs Flete", n_en: "Fuel Cost vs Freight", f: "Gasto Diesel / Facturación", r: "Control Vehicular", r_en: "Fleet Control", o: "<", m: "32", u: "%", trend: "down" },
        { id: 3, p: "Cliente", p_en: "Customer", t: "Eficacia", t_en: "Efficacy", n: "On-Time Delivery (OTD)", n_en: "On-Time Delivery (OTD)", f: "A tiempo / Total Viajes", r: "Servicio al cliente", r_en: "Customer Service", o: ">", m: "95", u: "%", trend: "up" },
        { id: 4, p: "Procesos", p_en: "Processes", t: "Eficiencia", t_en: "Efficiency", n: "Rendimiento Diesel (KMPL)", n_en: "Fuel Performance (KMPL)", f: "KM / Litros Consumidos", r: "Control Vehicular", r_en: "Fleet Control", o: ">", m: "2.4", u: "KM/L", trend: "steady" },
        { id: 5, p: "Procesos", p_en: "Processes", t: "Eficiencia", t_en: "Efficiency", n: "Disponibilidad de Flota", n_en: "Fleet Availability", f: "Unidades Disp / Total", r: "Taller", r_en: "Workshop", o: ">", m: "92", u: "%", trend: "up" },
        { id: 6, p: "Aprendizaje", p_en: "Learning", t: "Efectividad", t_en: "Effectiveness", n: "Rotación Operadores", n_en: "Driver Turnover", f: "Bajas / Promedio", r: "Recursos Humanos", r_en: "HR", o: "<", m: "3", u: "%", trend: "down" },
        { id: 7, p: "Procesos", p_en: "Processes", t: "Eficacia", t_en: "Efficacy", n: "Cruces Exitosos/Día", n_en: "Successful Crossings/Day", f: "Cruces / Capacidad", r: "Op. Internacional", r_en: "Intl. Ops", o: ">", m: "25", u: "Cruces", trend: "up" },
        // Duplicates for visual mass as standard mock
        { id: 8, p: "Financiera", p_en: "Financial", t: "Eficacia", t_en: "Efficacy", n: "ROI Capacitación", n_en: "Training ROI", f: "Beneficio / Inversión", r: "Recursos Humanos", r_en: "HR", o: ">", m: "15", u: "%", trend: "steady" },
        { id: 9, p: "Cliente", p_en: "Customer", t: "Efectividad", t_en: "Effectiveness", n: "NPS Semestral", n_en: "Biannual NPS", f: "Promotores - Detractores", r: "Servicio al cliente", r_en: "Customer Service", o: ">", m: "80", u: "Pts", trend: "up" }
    ];

    const filteredIndicadores = indicadoresBase.filter(k => {
        const matchPers = filterPers === 'all' || k.p === filterPers;
        const matchType = filterType === 'all' || k.t === filterType;
        const matchResp = filterResp === 'all' || k.r === filterResp;
        return matchPers && matchType && matchResp;
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Eficacia': case 'Efficacy': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Eficiencia': case 'Efficiency': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Efectividad': case 'Effectiveness': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch(trend) {
            case 'up': return <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm shadow-emerald-500/30"><TrendingUp size={16} strokeWidth={3} /></div>;
            case 'down': return <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto shadow-sm shadow-rose-500/30"><TrendingDown size={16} strokeWidth={3} /></div>;
            default: return <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-800 flex items-center justify-center mx-auto shadow-sm shadow-amber-400/30"><Minus size={16} strokeWidth={3} /></div>;
        }
    };

    return (
        <div className="w-full bg-transparent flex flex-col gap-6">
            
            {/* Header / Config Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-hub-border p-5 flex flex-wrap gap-4 items-end">
                
                <div className="flex flex-col gap-1.5 w-full md:w-auto">
                    <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Filter size={12} /> Perspectiva
                    </label>
                    <select 
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-36 transition-shadow"
                        value={filterPers}
                        onChange={(e) => setFilterPers(e.target.value)}
                    >
                        <option value="all">-- Todas --</option>
                        <option value="Financiera">Financiera</option>
                        <option value="Cliente">Cliente</option>
                        <option value="Procesos">Procesos</option>
                        <option value="Aprendizaje">Aprendizaje</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5 w-full md:w-auto">
                    <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Target size={12} /> Tipo
                    </label>
                    <select 
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-36 transition-shadow"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">-- Todos --</option>
                        <option value="Eficacia">Eficacia</option>
                        <option value="Eficiencia">Eficiencia</option>
                        <option value="Efectividad">Efectividad</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5 w-full md:w-auto">
                    <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Responsable
                    </label>
                    <select 
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-44 transition-shadow"
                        value={filterResp}
                        onChange={(e) => setFilterResp(e.target.value)}
                    >
                        <option value="all">-- Todos --</option>
                        <option value="Administracion">Administración</option>
                        <option value="Control Vehicular">Control Vehicular</option>
                        <option value="Servicio al cliente">Servicio al Cliente</option>
                        <option value="Taller">Taller</option>
                        <option value="Recursos Humanos">Recursos Humanos</option>
                        <option value="Op. Internacional">Op. Internacional</option>
                    </select>
                </div>

                <div className="md:ml-auto">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded-lg shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2">
                        <Search size={16} /> Buscar
                    </button>
                </div>
            </div>

            {/* Dashboard Table */}
            <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-xl border border-hub-border overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-200 dark:border-slate-700">
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Perspectiva</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-28">Tipo</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Indicador / <span className="text-emerald-500 font-bold">Fórmula</span></th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-44">Responsable</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-20 text-center">Op.</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24 text-center">Meta</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24 text-center">U.M.</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-28 text-center">Tendencia</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredIndicadores.map((k) => {
                            const pText = currentLang === 'es' || !k.p_en ? k.p : k.p_en;
                            const tText = currentLang === 'es' || !k.t_en ? k.t : k.t_en;
                            const nText = currentLang === 'es' || !k.n_en ? k.n : k.n_en;
                            const rText = currentLang === 'es' || !k.r_en ? k.r : k.r_en;

                            return (
                                <tr key={k.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-4">
                                        <span className={`font-semibold text-sm ${
                                            k.p === 'Financiera' ? 'text-amber-600 dark:text-amber-500' :
                                            k.p === 'Cliente' ? 'text-blue-600 dark:text-blue-500' :
                                            k.p === 'Procesos' ? 'text-emerald-600 dark:text-emerald-500' :
                                            'text-purple-600 dark:text-purple-500'
                                        }`}>
                                            {pText}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${getTypeColor(tText)}`}>
                                            {tText}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-0.5">{nText}</div>
                                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono italic max-w-sm truncate" title={k.f}>{k.f}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase overflow-hidden">
                                                {rText.substring(0, 2)}
                                            </div>
                                            {rText}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="font-mono text-lg font-black text-slate-400 select-none">{k.o}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="bg-slate-100 dark:bg-slate-800 font-mono text-sm px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold shadow-inner inline-block">
                                            {k.m}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                                        {k.u}
                                    </td>
                                    <td className="p-4">
                                        {getTrendIcon(k.trend)}
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredIndicadores.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-slate-500">
                                    No se encontraron indicadores para este filtrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
        </div>
    );
};
