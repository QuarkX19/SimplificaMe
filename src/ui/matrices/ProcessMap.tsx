import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CheckCircle2, FileText, Settings, ShieldAlert } from 'lucide-react';

export const ProcessMap: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'info' | 'docs' | 'kpis' | 'risks'>('info');

    return (
        <div className="w-full bg-white shadow-lg rounded-lg border border-hub-border overflow-hidden">
            {/* Header */}
            <header className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white pb-6 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-20 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Settings size={14} />
                            Mapa de Procesos / Caracterización
                        </h1>
                        <h2 className="text-2xl font-light mt-2">
                            PROCESO: <strong className="font-bold text-orange-400">GESTIÓN DOCUMENTAL</strong>
                        </h2>
                    </div>
                    <div className="text-right">
                        <span className="bg-blue-600/30 border border-blue-400 px-3 py-1 rounded text-[10px] uppercase font-bold tracking-wider">
                            Código: TSI-GD-01
                        </span>
                    </div>
                </div>
            </header>

            {/* General Description Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-hub-border">
                <div className="p-5 border-r border-hub-border bg-slate-50 dark:bg-slate-900/20 transition-colors">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Objetivo del Proceso</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        "Asegurar la integridad, disponibilidad y trazabilidad de la información institucional mediante un control holístico del ciclo vital de los documentos."
                    </p>
                </div>
                <div className="p-5 border-r border-hub-border bg-white dark:bg-transparent transition-colors">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Responsable (Dueño)</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Gerencia de Cumplimiento y Normatividad
                    </p>
                </div>
                <div className="p-5 bg-white dark:bg-transparent transition-colors">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alcance</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                        Desde la recepción/creación del dato hasta su disposición final o archivo histórico fronterizo.
                    </p>
                </div>
            </section>

            {/* Navigation Tabs */}
            <nav className="flex bg-slate-100 dark:bg-slate-800/50 border-b border-hub-border overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`px-6 py-3 text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'info' ? 'border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-slate-900' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                    Información General
                </button>
                <button 
                    onClick={() => setActiveTab('docs')}
                    className={`px-6 py-3 text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'docs' ? 'border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-slate-900' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                    Documentos de Referencia
                </button>
                <button 
                    onClick={() => setActiveTab('kpis')}
                    className={`px-6 py-3 text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'kpis' ? 'border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-slate-900' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                    Indicadores de Gestión
                </button>
                <button 
                    onClick={() => setActiveTab('risks')}
                    className={`px-6 py-3 text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'risks' ? 'border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-slate-900' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                    Riesgos Asociados
                </button>
            </nav>

            {/* Tab Content */}
            <div className="overflow-x-auto text-sm">
                {activeTab === 'info' && (
                    <table className="w-full border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 border-b border-hub-border">
                                <th className="p-3 border-r border-hub-border text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider w-32">Proveedores</th>
                                <th className="p-3 border-r border-hub-border text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider w-40">Entradas / Insumos</th>
                                <th className="p-3 border-r border-hub-border text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12">PHVA</th>
                                <th className="p-3 border-r border-hub-border text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actividades Principales</th>
                                <th className="p-3 border-r border-hub-border text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider w-40">Responsable</th>
                                <th className="p-3 border-r border-hub-border text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider w-40">Salidas (Producto)</th>
                                <th className="p-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider w-32">Clientes</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-600 dark:text-slate-300 divide-y divide-hub-border">
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="p-3 border-r border-hub-border bg-slate-50/50 dark:bg-slate-900/20 text-xs font-medium align-top">Todas las Áreas de TSI, Entidades Externas.</td>
                                <td className="p-3 border-r border-hub-border text-[11px] align-top">Normatividad legal, Tablas de Retención, Solicitudes de Servicio.</td>
                                <td className="p-3 border-r border-hub-border text-center font-bold align-top">
                                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-xs">P</span>
                                </td>
                                <td className="p-3 border-r border-hub-border align-top text-xs">
                                    <ul className="list-disc ml-4 space-y-1.5">
                                        <li><strong>Planear</strong> la estrategia de gestión documental anual.</li>
                                        <li>Definir lineamientos técnicos para el archivo físico y digital.</li>
                                    </ul>
                                </td>
                                <td className="p-3 border-r border-hub-border font-medium text-slate-500 dark:text-slate-400 text-xs align-top hidden md:table-cell">Coordinador de Archivo</td>
                                <td className="p-3 border-r border-hub-border text-xs align-top">Programa de Gestión Documental (PGD) aprobado.</td>
                                <td className="p-3 bg-slate-50/50 dark:bg-slate-900/20 text-xs align-top">Dirección General, Auditoría Interna.</td>
                            </tr>
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="p-3 border-r border-hub-border bg-slate-50/50 dark:bg-slate-900/20 text-xs font-medium align-top">Gestión Humana, Operaciones.</td>
                                <td className="p-3 border-r border-hub-border text-[11px] align-top">Expedientes de personal, Manifiestos de carga, Facturas.</td>
                                <td className="p-3 border-r border-hub-border text-center font-bold align-top">
                                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xs">H</span>
                                </td>
                                <td className="p-3 border-r border-hub-border align-top text-xs">
                                    <ul className="list-disc ml-4 space-y-1.5">
                                        <li>Recepcionar, clasificar y digitalizar documentos operativos.</li>
                                        <li>Foliar y organizar el archivo de gestión de procesos fronterizos.</li>
                                    </ul>
                                </td>
                                <td className="p-3 border-r border-hub-border font-medium text-slate-500 dark:text-slate-400 text-xs align-top hidden md:table-cell">Analista de Documentación</td>
                                <td className="p-3 border-r border-hub-border text-xs align-top">Inventario Documental Actualizado, Expedientes Digitales.</td>
                                <td className="p-3 bg-slate-50/50 dark:bg-slate-900/20 text-xs align-top">Áreas Operativas, Aduanas.</td>
                            </tr>
                        </tbody>
                    </table>
                )}

                {activeTab !== 'info' && (
                    <div className="p-8 text-center text-slate-500 min-h-[200px] flex flex-col items-center justify-center">
                        <FileText size={48} className="text-slate-300 mb-4" />
                        <p className="font-medium">Módulo en modo {activeTab}.</p>
                        <p className="text-xs mt-2">Sincronice su ERP para ver datos detallados.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-hub-border flex justify-between items-center text-xs">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                    <span className="flex items-center text-slate-500"><Calendar size={12} className="mr-1.5" /> Última Modificación: 25-Feb-2026</span>
                    <span className="flex items-center text-amber-600 dark:text-amber-500"><CheckCircle2 size={12} className="mr-1.5" /> Revisado por: Calidad TSI</span>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-hub-border rounded text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        Imprimir
                    </button>
                    <button className="px-3 py-1.5 bg-blue-600 text-white border border-blue-700 rounded hover:bg-blue-700 transition-colors">
                        PDF
                    </button>
                </div>
            </footer>
        </div>
    );
};
