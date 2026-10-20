"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getDictionary, type Dictionary } from "@/i18n";
import { parseImportedJson } from "@/lib/export";
import { createProject, duplicateProject, touch } from "@/lib/project";
import {
  clearAllLocalData,
  clearAllProjects,
  DEFAULT_SETTINGS,
  deleteProject,
  listProjects,
  loadSettings,
  saveProject,
  saveSettings,
} from "@/lib/storage";
import type { AppSettings, Language, MediaKitProject, ThemePreference } from "@/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ToastItem {
  id: string;
  text: string;
}

interface AppContextValue {
  ready: boolean;
  settings: AppSettings;
  language: Language;
  t: Dictionary;
  projects: MediaKitProject[];
  active: MediaKitProject | null;
  saveStatus: SaveStatus;
  storageAvailable: boolean;
  toasts: ToastItem[];
  setSettings: (patch: Partial<AppSettings>) => void;
  setActiveId: (id: string | null) => void;
  updateActive: (updater: (project: MediaKitProject) => MediaKitProject) => void;
  createKit: (name?: string, templateId?: MediaKitProject["appearance"]["templateId"]) => Promise<MediaKitProject>;
  saveNow: () => Promise<void>;
  duplicate: (id: string) => Promise<MediaKitProject | null>;
  remove: (id: string) => Promise<void>;
  importJsonText: (text: string, replaceExisting: boolean) => Promise<{ imported: number; needsConfirm?: string[] }>;
  wipeAll: () => Promise<void>;
  notify: (text: string) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function applyTheme(theme: ThemePreference) {
  const root = document.documentElement;
  const dark =
    theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [projects, setProjects] = useState<MediaKitProject[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timer = useRef<number | null>(null);
  const projectsRef = useRef(projects);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  const notify = useCallback((text: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { id, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const loaded = loadSettings();
      applyTheme(loaded.theme);
      setSettingsState(loaded);
      document.documentElement.lang = loaded.language;
      try {
        const rows = await listProjects();
        if (cancelled) return;
        setProjects(rows);
        const preferred = loaded.lastProjectId && rows.some((p) => p.id === loaded.lastProjectId)
          ? loaded.lastProjectId
          : rows[0]?.id ?? null;
        setActiveId(preferred);
        setStorageAvailable(true);
      } catch {
        if (!cancelled) setStorageAvailable(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(settings.theme);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [settings.theme]);

  const persistSettings = useCallback((next: AppSettings) => {
    setSettingsState(next);
    saveSettings(next);
    applyTheme(next.theme);
    document.documentElement.lang = next.language;
  }, []);

  const setSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      persistSettings({ ...settings, ...patch });
    },
    [persistSettings, settings],
  );

  const persistProject = useCallback(
    async (project: MediaKitProject) => {
      setSaveStatus("saving");
      try {
        await saveProject(project);
        setSaveStatus("saved");
      } catch (error) {
        setSaveStatus("error");
        const message = error instanceof Error && error.message === "quota" ? "quota" : "save";
        if (message === "quota") {
          notify(settings.language === "fr"
            ? "Le stockage du navigateur est plein. Exportez une sauvegarde, puis supprimez des kits inutilisés."
            : "Browser storage is full. Export a backup, then delete unused kits.");
        }
        throw error;
      }
    },
    [notify, settings.language],
  );

  const scheduleSave = useCallback(
    (project: MediaKitProject) => {
      if (!settings.autosave) return;
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        void persistProject(project);
      }, 700);
    },
    [persistProject, settings.autosave],
  );

  const updateActive = useCallback(
    (updater: (project: MediaKitProject) => MediaKitProject) => {
      setProjects((prev) => {
        const current = prev.find((p) => p.id === activeId);
        if (!current) return prev;
        const next = touch(updater(current));
        scheduleSave(next);
        return prev.map((p) => (p.id === next.id ? next : p)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      });
    },
    [activeId, scheduleSave],
  );

  const createKit = useCallback(
    async (name?: string, templateId?: MediaKitProject["appearance"]["templateId"]) => {
      const project = createProject(name, settings.defaultCurrency);
      if (templateId) project.appearance.templateId = templateId;
      await persistProject(project);
      setProjects((prev) => [project, ...prev]);
      setActiveId(project.id);
      persistSettings({ ...settings, lastProjectId: project.id });
      return project;
    },
    [persistProject, persistSettings, settings],
  );

  const saveNow = useCallback(async () => {
    const current = projectsRef.current.find((p) => p.id === activeId);
    if (!current) return;
    await persistProject(current);
    notify(
      settings.language === "fr"
        ? "Votre projet a été enregistré localement."
        : "Your project has been saved locally.",
    );
  }, [activeId, notify, persistProject, settings.language]);

  const duplicate = useCallback(
    async (id: string) => {
      const source = projectsRef.current.find((p) => p.id === id);
      if (!source) return null;
      const suffix = settings.language === "fr" ? "(copie)" : "(copy)";
      const copy = duplicateProject(source, suffix);
      await persistProject(copy);
      setProjects((prev) => [copy, ...prev]);
      return copy;
    },
    [persistProject, settings.language],
  );

  const remove = useCallback(async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setActiveId((current) => (current === id ? null : current));
  }, []);

  const importJsonText = useCallback(
    async (text: string, replaceExisting: boolean) => {
      const parsed = parseImportedJson(text);
      if (!parsed.ok) {
        throw new Error("invalid");
      }
      const existingIds = new Set(projectsRef.current.map((p) => p.id));
      const conflicts = parsed.projects.filter((p) => existingIds.has(p.id)).map((p) => p.id);
      if (conflicts.length && !replaceExisting) {
        return { imported: 0, needsConfirm: conflicts };
      }
      for (const project of parsed.projects) {
        await persistProject(project);
      }
      const rows = await listProjects();
      setProjects(rows);
      if (parsed.projects[0]) setActiveId(parsed.projects[0].id);
      return { imported: parsed.projects.length };
    },
    [persistProject],
  );

  const wipeAll = useCallback(async () => {
    await clearAllProjects();
    clearAllLocalData();
    setProjects([]);
    setActiveId(null);
    persistSettings({ ...DEFAULT_SETTINGS, language: settings.language, theme: settings.theme });
  }, [persistSettings, settings.language, settings.theme]);

  const active = useMemo(
    () => projects.find((p) => p.id === activeId) ?? null,
    [projects, activeId],
  );

  const t = getDictionary(settings.language);

  const value: AppContextValue = {
    ready,
    settings,
    language: settings.language,
    t,
    projects,
    active,
    saveStatus,
    storageAvailable,
    toasts,
    setSettings,
    setActiveId: (id) => {
      setActiveId(id);
      if (id) persistSettings({ ...settings, lastProjectId: id });
    },
    updateActive,
    createKit,
    saveNow,
    duplicate,
    remove,
    importJsonText,
    wipeAll,
    notify,
    dismissToast: (id) => setToasts((prev) => prev.filter((item) => item.id !== id)),
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div className="toast" key={toast.id}>
            {toast.text}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProviders");
  return ctx;
}
