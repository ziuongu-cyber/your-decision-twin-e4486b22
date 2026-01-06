// Internationalization (i18n) system
// Currently supports English with structure ready for additional languages

export type Language = "en" | "es" | "fr" | "de" | "pt";

export const SUPPORTED_LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
];

export const translations = {
  en: {
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      back: "Back",
      next: "Next",
      submit: "Submit",
      search: "Search",
      filter: "Filter",
      clear: "Clear",
      confirm: "Confirm",
      success: "Success",
      error: "Error",
      warning: "Warning",
      info: "Information",
      yes: "Yes",
      no: "No",
      or: "or",
      and: "and",
      of: "of",
      to: "to",
      from: "from",
    },
    navigation: {
      dashboard: "Dashboard",
      logDecision: "Log Decision",
      history: "History",
      insights: "Insights",
      settings: "Settings",
      askTwin: "Ask Your Twin",
      guidedDecision: "Guided Decision",
      weeklyReview: "Weekly Review",
      skipToMainContent: "Skip to main content",
    },
    dashboard: {
      welcome: "Welcome back",
      explorer: "Explorer",
      twinScore: "Twin Score",
      totalDecisions: "Total Decisions",
      activeDays: "Active Days",
      successRate: "Success Rate",
      recentDecisions: "Recent Decisions",
      noDecisions: "No decisions yet",
      startJourney: "Your journey starts with a single decision. Log your first one and watch your digital twin come to life!",
      logFirst: "Log Your First Decision",
      helpMeDecide: "Help Me Decide",
      thisWeeksReview: "This Week's Review",
      continueLogging: "Continue Logging",
      unlockInsights: "Log {count} more decision(s) to unlock pattern insights!",
    },
    decisions: {
      title: "Decision Title",
      titlePlaceholder: "What decision did you make?",
      choice: "Your Choice",
      choicePlaceholder: "What did you decide?",
      category: "Category",
      confidence: "Confidence",
      alternatives: "Alternatives Considered",
      alternativesPlaceholder: "Add an alternative option",
      context: "Context",
      contextPlaceholder: "What led to this decision?",
      tags: "Tags",
      tagsPlaceholder: "Add tags",
      outcome: "Outcome",
      rating: "Rating",
      reflection: "Reflection",
      wouldChooseDifferently: "Would you choose differently?",
      logDecision: "Log Decision",
      updateDecision: "Update Decision",
      deleteDecision: "Delete Decision",
      viewDetails: "View Details",
      addOutcome: "Add Outcome",
    },
    categories: {
      career: "Career",
      finance: "Finance",
      health: "Health",
      relationships: "Relationships",
      personal: "Personal",
      education: "Education",
      other: "Other",
    },
    insights: {
      title: "Insights",
      description: "Analyze your decision patterns",
      biasDetector: "Bias Detector",
      decisionReplay: "Decision Replay",
      patterns: "Patterns",
      recommendations: "Recommendations",
    },
    weeklyReview: {
      title: "Weekly Review",
      weekSummary: "Week Summary",
      decisionsMade: "Decisions Made",
      mostActiveDay: "Most Active Day",
      primaryFocus: "Primary Focus",
      avgConfidence: "Avg Confidence",
      winsLearnings: "Wins & Learnings",
      reflectionQuestions: "Questions for Reflection",
      generateQuestions: "Generate Questions",
      lookingAhead: "Looking Ahead",
      upcomingFollowups: "Upcoming Follow-ups",
      thisWeekIll: "This week I'll...",
      rateYourWeek: "Rate Your Week",
      saveReview: "Save Review",
      pastReviews: "Past Reviews",
      currentWeek: "Current Week",
      goToCurrentWeek: "Go to Current Week",
    },
    settings: {
      title: "Settings",
      description: "Customize your Digital Twin experience",
      twinPersonality: "Twin Personality",
      tone: "Tone",
      adviceStyle: "Advice Style",
      showConfidenceScores: "Show Confidence Scores",
      privacy: "Privacy & Data",
      notifications: "Notifications",
      display: "Display",
      theme: "Theme",
      themeLight: "Light",
      themeDark: "Dark",
      themeAuto: "System",
      language: "Language",
      advancedAI: "Advanced AI Features",
      integrations: "Integrations",
      about: "About",
    },
    accessibility: {
      mainNavigation: "Main navigation",
      closeModal: "Close modal",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      expandSection: "Expand section",
      collapseSection: "Collapse section",
      moreOptions: "More options",
      requiredField: "Required field",
      optional: "Optional",
      loading: "Loading, please wait",
      saved: "Changes saved",
      error: "An error occurred",
      announcement: "Announcement",
    },
    shortcuts: {
      title: "Keyboard Shortcuts",
      description: "Navigate faster with these shortcuts",
      general: "General",
      navigation: "Navigation",
      actions: "Actions",
      newDecision: "New decision",
      search: "Search",
      closeModal: "Close modal",
      showShortcuts: "Show shortcuts",
      quickSearch: "Quick search",
      goToDashboard: "Go to dashboard",
      goToHistory: "Go to history",
      goToInsights: "Go to insights",
      goToSettings: "Go to settings",
    },
    errors: {
      required: "This field is required",
      invalidEmail: "Invalid email address",
      tooShort: "Too short",
      tooLong: "Too long",
      networkError: "Network error. Please try again.",
      unknownError: "An unknown error occurred",
    },
    dates: {
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This week",
      lastWeek: "Last week",
      thisMonth: "This month",
      lastMonth: "Last month",
    },
  },
  // Placeholder translations for other languages
  // These would be filled in by translators
  es: {
    common: {
      loading: "Cargando...",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      close: "Cerrar",
      back: "Atrás",
      next: "Siguiente",
      submit: "Enviar",
      search: "Buscar",
      filter: "Filtrar",
      clear: "Limpiar",
      confirm: "Confirmar",
      success: "Éxito",
      error: "Error",
      warning: "Advertencia",
      info: "Información",
      yes: "Sí",
      no: "No",
      or: "o",
      and: "y",
      of: "de",
      to: "a",
      from: "desde",
    },
    navigation: {
      dashboard: "Panel",
      logDecision: "Registrar Decisión",
      history: "Historial",
      insights: "Perspectivas",
      settings: "Configuración",
      askTwin: "Preguntar a Tu Gemelo",
      guidedDecision: "Decisión Guiada",
      weeklyReview: "Revisión Semanal",
      skipToMainContent: "Ir al contenido principal",
    },
    dashboard: {
      welcome: "Bienvenido de nuevo",
      explorer: "Explorador",
      twinScore: "Puntuación del Gemelo",
      totalDecisions: "Total de Decisiones",
      activeDays: "Días Activos",
      successRate: "Tasa de Éxito",
      recentDecisions: "Decisiones Recientes",
      noDecisions: "Sin decisiones aún",
      startJourney: "Tu viaje comienza con una sola decisión. ¡Registra la primera y observa cómo cobra vida tu gemelo digital!",
      logFirst: "Registra Tu Primera Decisión",
      helpMeDecide: "Ayúdame a Decidir",
      thisWeeksReview: "Revisión de Esta Semana",
      continueLogging: "Continuar Registrando",
      unlockInsights: "¡Registra {count} decisión(es) más para desbloquear patrones!",
    },
    decisions: {
      title: "Título de la Decisión",
      titlePlaceholder: "¿Qué decisión tomaste?",
      choice: "Tu Elección",
      choicePlaceholder: "¿Qué decidiste?",
      category: "Categoría",
      confidence: "Confianza",
      alternatives: "Alternativas Consideradas",
      alternativesPlaceholder: "Agregar una opción alternativa",
      context: "Contexto",
      contextPlaceholder: "¿Qué llevó a esta decisión?",
      tags: "Etiquetas",
      tagsPlaceholder: "Agregar etiquetas",
      outcome: "Resultado",
      rating: "Calificación",
      reflection: "Reflexión",
      wouldChooseDifferently: "¿Elegirías diferente?",
      logDecision: "Registrar Decisión",
      updateDecision: "Actualizar Decisión",
      deleteDecision: "Eliminar Decisión",
      viewDetails: "Ver Detalles",
      addOutcome: "Agregar Resultado",
    },
    categories: {
      career: "Carrera",
      finance: "Finanzas",
      health: "Salud",
      relationships: "Relaciones",
      personal: "Personal",
      education: "Educación",
      other: "Otro",
    },
    insights: {
      title: "Perspectivas",
      description: "Analiza tus patrones de decisión",
      biasDetector: "Detector de Sesgos",
      decisionReplay: "Reproducción de Decisiones",
      patterns: "Patrones",
      recommendations: "Recomendaciones",
    },
    weeklyReview: {
      title: "Revisión Semanal",
      weekSummary: "Resumen de la Semana",
      decisionsMade: "Decisiones Tomadas",
      mostActiveDay: "Día Más Activo",
      primaryFocus: "Enfoque Principal",
      avgConfidence: "Confianza Promedio",
      winsLearnings: "Logros y Aprendizajes",
      reflectionQuestions: "Preguntas de Reflexión",
      generateQuestions: "Generar Preguntas",
      lookingAhead: "Mirando Adelante",
      upcomingFollowups: "Próximos Seguimientos",
      thisWeekIll: "Esta semana voy a...",
      rateYourWeek: "Califica Tu Semana",
      saveReview: "Guardar Revisión",
      pastReviews: "Revisiones Anteriores",
      currentWeek: "Semana Actual",
      goToCurrentWeek: "Ir a la Semana Actual",
    },
    settings: {
      title: "Configuración",
      description: "Personaliza tu experiencia de Gemelo Digital",
      twinPersonality: "Personalidad del Gemelo",
      tone: "Tono",
      adviceStyle: "Estilo de Consejos",
      showConfidenceScores: "Mostrar Puntuaciones de Confianza",
      privacy: "Privacidad y Datos",
      notifications: "Notificaciones",
      display: "Pantalla",
      theme: "Tema",
      themeLight: "Claro",
      themeDark: "Oscuro",
      themeAuto: "Sistema",
      language: "Idioma",
      advancedAI: "Funciones Avanzadas de IA",
      integrations: "Integraciones",
      about: "Acerca de",
    },
    accessibility: {
      mainNavigation: "Navegación principal",
      closeModal: "Cerrar modal",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      expandSection: "Expandir sección",
      collapseSection: "Contraer sección",
      moreOptions: "Más opciones",
      requiredField: "Campo requerido",
      optional: "Opcional",
      loading: "Cargando, por favor espera",
      saved: "Cambios guardados",
      error: "Ocurrió un error",
      announcement: "Anuncio",
    },
    shortcuts: {
      title: "Atajos de Teclado",
      description: "Navega más rápido con estos atajos",
      general: "General",
      navigation: "Navegación",
      actions: "Acciones",
      newDecision: "Nueva decisión",
      search: "Buscar",
      closeModal: "Cerrar modal",
      showShortcuts: "Mostrar atajos",
      quickSearch: "Búsqueda rápida",
      goToDashboard: "Ir al panel",
      goToHistory: "Ir al historial",
      goToInsights: "Ir a perspectivas",
      goToSettings: "Ir a configuración",
    },
    errors: {
      required: "Este campo es requerido",
      invalidEmail: "Correo electrónico inválido",
      tooShort: "Muy corto",
      tooLong: "Muy largo",
      networkError: "Error de red. Por favor intenta de nuevo.",
      unknownError: "Ocurrió un error desconocido",
    },
    dates: {
      today: "Hoy",
      yesterday: "Ayer",
      thisWeek: "Esta semana",
      lastWeek: "La semana pasada",
      thisMonth: "Este mes",
      lastMonth: "El mes pasado",
    },
  },
} as const;

// Type for translation keys
export type TranslationKeys = typeof translations.en;

// Current language state
let currentLanguage: Language = "en";

const LANGUAGE_KEY = "app_language";

export function getLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
    return stored as Language;
  }
  // Try to detect from browser
  const browserLang = navigator.language.split("-")[0] as Language;
  if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
    return browserLang;
  }
  return "en";
}

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
  localStorage.setItem(LANGUAGE_KEY, lang);
  document.documentElement.lang = lang;
}

export function t(path: string): string {
  const lang = currentLanguage;
  const keys = path.split(".");
  
  // Try current language first
  let result: unknown = translations[lang];
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      result = undefined;
      break;
    }
  }
  
  // Fallback to English
  if (result === undefined) {
    result = translations.en;
    for (const key of keys) {
      if (result && typeof result === "object" && key in result) {
        result = (result as Record<string, unknown>)[key];
      } else {
        return path; // Return path if not found
      }
    }
  }
  
  return typeof result === "string" ? result : path;
}

// Initialize language
if (typeof window !== "undefined") {
  currentLanguage = getLanguage();
  document.documentElement.lang = currentLanguage;
}

// Date formatting with locale support
export function formatDateLocale(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const lang = currentLanguage;
  const locale = lang === "en" ? "en-US" : lang;
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return t("dates.today");
  if (diffDays === 1) return t("dates.yesterday");
  if (diffDays < 7) return t("dates.thisWeek");
  if (diffDays < 14) return t("dates.lastWeek");
  if (diffDays < 30) return t("dates.thisMonth");
  if (diffDays < 60) return t("dates.lastMonth");
  
  return formatDateLocale(date, { month: "short", day: "numeric", year: "numeric" });
}
