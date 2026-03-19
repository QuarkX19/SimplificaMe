export enum MEModule {
  SIMPLIFICAME = 'simplificame',
  GESTIONAME = 'gestioname',
  CAPACITAME = 'capacitame',
  EVALUAME = 'evaluame',
  CONSULTAME = 'consultame'
}

export enum MERole {
  ESTRATEGICO = 'Estratégico',
  TACTICO = 'Táctico',
  OPERATIVO = 'Operativo'
}

export enum LayerStatus {
  OK = 'OK',
  ALERT = 'ALERT',
  DANGER = 'DANGER'
}

export interface LayerNodeProps {
  title: string;
  status: LayerStatus;
  value: string;
}

export interface AuditoriaData {
  cumplimiento: number;
  proyeccion: string;
  alertas: string[];
}

export interface InsightMessage {
  role: 'auron' | 'user';
  text: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: MERole;
  company_id: string;
  contribution_score: number;
  streak_days: number;
  preferred_lang: string;
}
