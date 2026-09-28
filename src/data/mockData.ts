/**
 * MOCK DATA — NÚCLEO (Hub Personal)
 * Toda la información estática vive aquí. Sustituir por respuestas de API/DB
 * no debería requerir tocar ningún componente.
 */

export type TaskStatus = "todo" | "doing" | "done";
export type Priority = "alta" | "media" | "baja";

export interface Task {
  id: string;
  title: string;
  description: string;
  due: string; // ISO date
  tags: string[];
  priority: Priority;
  status: TaskStatus;
  estimate: string;
}

export interface CalendarEvent {
  id: string;
  day: number; // día del mes
  title: string;
  start: string; // "09:30"
  end: string;
  kind: "bloque" | "evento" | "ruta";
  place: string;
}

export interface RoutePlan {
  id: string;
  title: string;
  day: number;
  departure: string;
  arrival: string;
  distance: string;
  duration: string;
  from: string;
  to: string;
  note: string;
}

export type ResourceKind = "skill" | "file" | "video";

export interface Skill {
  kind: "skill";
  id: string;
  title: string;
  category: string;
  level: number;
  description: string;
  updated: string;
}

export interface FileRes {
  kind: "file";
  id: string;
  title: string;
  ext: "PDF" | "ZIP" | "CSV" | "FIG" | "MD";
  size: string;
  created: string;
  description: string;
}

export interface VideoRes {
  kind: "video";
  id: string;
  title: string;
  platform: string;
  duration: string;
  url: string;
  description: string;
  thumb: string;
}

export type Resource = Skill | FileRes | VideoRes;

export const profile = {
  name: "Marta Vidal",
  role: "Arquitecta frontend",
  initials: "MV",
  greeting: "Buenas tardes, Marta.",
  dateLabel: "Jueves 14 de mayo de 2026",
  focus: {
    label: "Sesión de enfoque",
    value: 68,
    elapsed: "3 h 42 min",
    goal: "5 h 30 min",
  },
  metrics: [
    { label: "Tareas activas", value: "7", hint: "de 12 en el tablero" },
    { label: "Foco de hoy", value: "3 h 42", hint: "objetivo 5 h 30" },
    { label: "Racha", value: "18", hint: "días consecutivos" },
    { label: "Próxima ruta", value: "07:30", hint: "viernes 15 · salida" },
  ],
  energy: 4, // de 5
  mode: "Profundo",
  quickLinks: [
    { label: "Notas rápidas", count: 3, icon: "note" },
    { label: "Bandeja de entrada", count: 7, icon: "inbox" },
    { label: "Atajos de teclado", count: 12, icon: "command" },
    { label: "Ajustes del hub", count: 0, icon: "settings" },
  ],
};

export const columns: { id: TaskStatus; title: string; hint: string }[] = [
  { id: "todo", title: "Sin empezar", hint: "Backlog inmediato" },
  { id: "doing", title: "En proceso", hint: "Trabajo activo" },
  { id: "done", title: "Terminado", hint: "Cerrado esta semana" },
];

export const tasks: Task[] = [
  {
    id: "t-01",
    title: "Rediseñar el panel de analíticas",
    description:
      "Nueva retícula de 12 columnas, jerarquía de métricas y estados de carga para el panel de uso.",
    due: "2026-05-18",
    tags: ["Frontend", "Diseño"],
    priority: "alta",
    status: "doing",
    estimate: "6 h",
  },
  {
    id: "t-02",
    title: "Migrar tokens a variables CSS",
    description:
      "Unificar color, radio y sombra en un único contrato consumible por React y por el correo transaccional.",
    due: "2026-05-15",
    tags: ["Design System"],
    priority: "alta",
    status: "doing",
    estimate: "4 h",
  },
  {
    id: "t-03",
    title: "Pruebas de accesibilidad en el flujo de pago",
    description:
      "Recorrido con lector de pantalla, foco visible y contraste mínimo AA en los tres pasos del checkout.",
    due: "2026-05-21",
    tags: ["Calidad", "Accesibilidad"],
    priority: "media",
    status: "doing",
    estimate: "3 h",
  },
  {
    id: "t-04",
    title: "Contrato de API para el módulo de rutas",
    description:
      "Definir esquema de respuesta, paginación y códigos de error antes de conectar el cliente.",
    due: "2026-05-26",
    tags: ["Backend", "Investigación"],
    priority: "media",
    status: "todo",
    estimate: "2 h 30",
  },
  {
    id: "t-05",
    title: "Banco de imágenes para la documentación",
    description:
      "Seleccionar y tratar 18 fotografías con la misma luz y paleta para el manual interno.",
    due: "2026-05-22",
    tags: ["Contenido"],
    priority: "baja",
    status: "todo",
    estimate: "2 h",
  },
  {
    id: "t-06",
    title: "Revisar pull request del motor de búsqueda",
    description:
      "Indexado incremental, límite de resultados y caché en memoria. Dejar comentarios por commit.",
    due: "2026-05-16",
    tags: ["Backend", "Calidad"],
    priority: "alta",
    status: "todo",
    estimate: "1 h 45",
  },
  {
    id: "t-07",
    title: "Sesión de estudio: tipografía editorial",
    description:
      "Dos horas de práctica de retícula editorial y escala tipográfica modular 1,25.",
    due: "2026-05-19",
    tags: ["Personal", "Diseño"],
    priority: "baja",
    status: "todo",
    estimate: "2 h",
  },
  {
    id: "t-08",
    title: "Presupuesto de rendimiento del bundle",
    description:
      "Fijar límites de 180 kB por ruta y añadir el chequeo en la pipeline de integración continua.",
    due: "2026-05-13",
    tags: ["Frontend", "Calidad"],
    priority: "media",
    status: "done",
    estimate: "3 h",
  },
  {
    id: "t-09",
    title: "Guía de contribución del design system",
    description:
      "Documentar convenciones de nombres, versionado semántico y proceso de revisión visual.",
    due: "2026-05-11",
    tags: ["Design System", "Contenido"],
    priority: "media",
    status: "done",
    estimate: "5 h",
  },
  {
    id: "t-10",
    title: "Automatizar respaldos del archivo",
    description:
      "Script de respaldo semanal con verificación de integridad y aviso por correo.",
    due: "2026-05-08",
    tags: ["Personal"],
    priority: "baja",
    status: "done",
    estimate: "1 h 30",
  },
  {
    id: "t-11",
    title: "Entrevistas de descubrimimiento (5 sesiones)",
    description:
      "Sintetizar hallazgos en un mapa de oportunidades de una página para el equipo de producto.",
    due: "2026-05-07",
    tags: ["Investigación"],
    priority: "alta",
    status: "done",
    estimate: "8 h",
  },
  {
    id: "t-12",
    title: "Dependencias del panel de notificaciones",
    description:
      "Extraer el componente de toast y sus estados a la librería compartida.",
    due: "2026-05-12",
    tags: ["Frontend"],
    priority: "media",
    status: "done",
    estimate: "2 h",
  },
];

export const calendar = {
  monthLabel: "Mayo 2026",
  monthIndex: 4,
  year: 2026,
  weekStartsOn: 1, // lunes
  weekdayLabels: ["L", "M", "X", "J", "V", "S", "D"],
  today: 14,
};

export const events: CalendarEvent[] = [
  {
    id: "e-01",
    day: 4,
    title: "Revisión de diseño semanal",
    start: "10:00",
    end: "11:00",
    kind: "evento",
    place: "Sala Cristal · Remoto",
  },
  {
    id: "e-02",
    day: 6,
    title: "Bloque profundo · Motor de búsqueda",
    start: "09:00",
    end: "12:30",
    kind: "bloque",
    place: "Estudio",
  },
  {
    id: "e-03",
    day: 8,
    title: "Ruta costera · grabación de campo",
    start: "07:30",
    end: "09:10",
    kind: "ruta",
    place: "Farola de Cabo Alto",
  },
  {
    id: "e-04",
    day: 11,
    title: "Entrevista de descubrimiento · 4/5",
    start: "16:00",
    end: "16:45",
    kind: "evento",
    place: "Videollamada",
  },
  {
    id: "e-05",
    day: 13,
    title: "Bloque profundo · Tokens",
    start: "08:30",
    end: "11:00",
    kind: "bloque",
    place: "Estudio",
  },
  {
    id: "e-06",
    day: 14,
    title: "Sesión de foco · Panel de analíticas",
    start: "09:30",
    end: "12:00",
    kind: "bloque",
    place: "Estudio",
  },
  {
    id: "e-07",
    day: 14,
    title: "Mesa de rendimiento",
    start: "17:00",
    end: "18:00",
    kind: "evento",
    place: "Sala Cristal",
  },
  {
    id: "e-08",
    day: 15,
    title: "Ruta norte · entrega de material",
    start: "07:30",
    end: "08:42",
    kind: "ruta",
    place: "Taller de Montjuïc",
  },
  {
    id: "e-09",
    day: 18,
    title: "Entrega · Panel de analíticas",
    start: "13:00",
    end: "13:30",
    kind: "evento",
    place: "Videollamada",
  },
  {
    id: "e-10",
    day: 20,
    title: "Bloque profundo · Accesibilidad",
    start: "09:00",
    end: "12:00",
    kind: "bloque",
    place: "Estudio",
  },
  {
    id: "e-11",
    day: 22,
    title: "Ruta de archivo · fotografía",
    start: "18:20",
    end: "20:05",
    kind: "ruta",
    place: "Depósito marítimo",
  },
  {
    id: "e-12",
    day: 26,
    title: "Cierre de contrato de API",
    start: "11:00",
    end: "12:00",
    kind: "evento",
    place: "Sala Cristal · Remoto",
  },
  {
    id: "e-13",
    day: 28,
    title: "Revisión mensual de objetivos",
    start: "15:00",
    end: "16:30",
    kind: "evento",
    place: "Estudio",
  },
];

export const routes: RoutePlan[] = [
  {
    id: "r-01",
    title: "Ruta norte · entrega de material",
    day: 15,
    departure: "07:30",
    arrival: "08:42",
    distance: "38,4 km",
    duration: "1 h 12 min",
    from: "Estudio Gràcia",
    to: "Taller de Montjuïc",
    note: "Tráfico moderado previsto en la salida. Llevar el lote de pruebas impresas.",
  },
  {
    id: "r-02",
    title: "Ruta de archivo · fotografía",
    day: 22,
    departure: "18:20",
    arrival: "20:05",
    distance: "12,7 km",
    duration: "1 h 45 min",
    from: "Estudio Gràcia",
    to: "Depósito marítimo",
    note: "Luz de atardecer entre las 19:04 y las 19:32. Trípie obligatorio.",
  },
  {
    id: "r-03",
    title: "Ruta costera · grabación de campo",
    day: 29,
    departure: "06:50",
    arrival: "08:25",
    distance: "54,2 km",
    duration: "1 h 35 min",
    from: "Estudio Gràcia",
    to: "Farola de Cabo Alto",
    note: "Registro estéreo de ambiente marino. Baterías de repuesto en la guantera.",
  },
];

export const timeline: {
  id: string;
  time: string;
  title: string;
  meta: string;
  kind: "bloque" | "evento" | "ruta" | "pausa";
}[] = [
  {
    id: "s-01",
    time: "06:50",
    title: "Ruta costera · grabación de campo",
    meta: "54,2 km · 1 h 35 min · Farola de Cabo Alto",
    kind: "ruta",
  },
  {
    id: "s-02",
    time: "09:30",
    title: "Sesión de foco · Panel de analíticas",
    meta: "2 h 30 min · Sin reuniones · Modo profundo",
    kind: "bloque",
  },
  {
    id: "s-03",
    time: "12:00",
    title: "Pausa y revisión de bandeja",
    meta: "30 min · Procesamiento rápido",
    kind: "pausa",
  },
  {
    id: "s-04",
    time: "12:30",
    title: "Revisión de pull request · motor de búsqueda",
    meta: "1 h · Comentarios por commit",
    kind: "evento",
  },
  {
    id: "s-05",
    time: "15:00",
    title: "Bloque profundo · migración de tokens",
    meta: "2 h 30 min · Estudio",
    kind: "bloque",
  },
  {
    id: "s-06",
    time: "17:00",
    title: "Mesa de rendimiento",
    meta: "1 h · Sala Cristal · 4 asistentes",
    kind: "evento",
  },
  {
    id: "s-07",
    time: "18:20",
    title: "Cierre del día y planificación",
    meta: "25 min · Revisión de la agenda de mañana",
    kind: "pausa",
  },
];

export const resources: Resource[] = [
  {
    kind: "skill",
    id: "s-1",
    title: "React & arquitectura de componentes",
    category: "Frontend",
    level: 92,
    description:
      "Composición, renderizado condicional y límites de estado con React 19 y Server Components.",
    updated: "Actualizado hace 3 días",
  },
  {
    kind: "skill",
    id: "s-2",
    title: "TypeScript avanzado",
    category: "Lenguajes",
    level: 86,
    description:
      "Tipos genéricos, discriminated unions y contratos de API inferidos desde el esquema.",
    updated: "Actualizado hace 1 semana",
  },
  {
    kind: "skill",
    id: "s-3",
    title: "Sistemas de diseño",
    category: "Diseño",
    level: 78,
    description:
      "Tokens semánticos, versionado y documentación viva consumible por producto y marketing.",
    updated: "Actualizado hace 2 semanas",
  },
  {
    kind: "skill",
    id: "s-4",
    title: "Accesibilidad (WCAG 2.2)",
    category: "Calidad",
    level: 71,
    description:
      "Navegación por teclado, gestión de foco, roles ARIA y auditoría de contraste automatizada.",
    updated: "Actualizado hace 5 días",
  },
  {
    kind: "skill",
    id: "s-5",
    title: "Rendimiento web",
    category: "Frontend",
    level: 64,
    description:
      "Presupuestos de carga, partición de código y métricas de campo en el panel de analíticas.",
    updated: "Actualizado hace 1 mes",
  },
  {
    kind: "skill",
    id: "s-6",
    title: "Dirección de arte",
    category: "Diseño",
    level: 57,
    description:
      "Luz, material y paleta aplicados a producto digital y a la fotografía de documentación.",
    updated: "Actualizado hace 6 semanas",
  },
  {
    kind: "file",
    id: "f-1",
    title: "Auditoría de accesibilidad · Q2",
    ext: "PDF",
    size: "4,8 MB",
    created: "12 may 2026",
    description: "Hallazgos, severidad y plan de remediación de los tres flujos principales.",
  },
  {
    kind: "file",
    id: "f-2",
    title: "Tokens del sistema de diseño v2",
    ext: "ZIP",
    size: "1,2 MB",
    created: "09 may 2026",
    description: "Variables CSS, JSON de tokens y guía de nombres para el contrato público.",
  },
  {
    kind: "file",
    id: "f-3",
    title: "Métricas de rendimiento · abril",
    ext: "CSV",
    size: "286 kB",
    created: "02 may 2026",
    description: "Series de tiempo de LCP, INP y CLS por ruta, muestreadas en campo.",
  },
  {
    kind: "file",
    id: "f-4",
    title: "Biblioteca de interfaz · panel",
    ext: "FIG",
    size: "32,6 MB",
    created: "28 abr 2026",
    description: "Archivos maestros con variantes, estados y documentación de uso.",
  },
  {
    kind: "file",
    id: "f-5",
    title: "Notas de investigación · descubrimiento",
    ext: "MD",
    size: "74 kB",
    created: "21 abr 2026",
    description: "Transcripciones sintetizadas y mapa de oportunidades de una página.",
  },
  {
    kind: "video",
    id: "v-1",
    title: "Arquitectura de componentes en React 19",
    platform: "Plataforma interna",
    duration: "42 min",
    url: "#",
    description: "Grabación del taller sobre composición, límites de estado y renderizado.",
    thumb: "vid-01",
  },
  {
    kind: "video",
    id: "v-2",
    title: "Rutas y logística: planificar la grabación de campo",
    platform: "Canal de vídeo",
    duration: "18 min",
    url: "#",
    description: "Cómo planificar ventanas de luz, distancias y material antes de salir.",
    thumb: "vid-02",
  },
  {
    kind: "video",
    id: "v-3",
    title: "Rendimiento web en el límite: 180 kB por ruta",
    platform: "Conferencia",
    duration: "1 h 04",
    url: "#",
    description: "Presupuestos, partición de código y medición en dispositivos modestos.",
    thumb: "vid-03",
  },
  {
    kind: "video",
    id: "v-4",
    title: "Dirección de luz para producto digital",
    platform: "Plataforma interna",
    duration: "27 min",
    url: "#",
    description: "Referencias de material, grano y paleta aplicadas a la identidad del hub.",
    thumb: "vid-02",
  },
];

export const resourceFilters = [
  { id: "all", label: "Todas" },
  { id: "skill", label: "Skills" },
  { id: "file", label: "Archivos" },
  { id: "video", label: "Videos / Links" },
] as const;
