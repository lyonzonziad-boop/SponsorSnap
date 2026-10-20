"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shell";
import { Button, Input, Label, Modal, Select } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { exportAllJson } from "@/lib/client-export";
import { APP_VERSION } from "@/lib/version";
import type { Language, ThemePreference } from "@/types";

export default function SettingsPage() {
  const { t, settings, setSettings, projects, wipeAll, notify } = useApp();
  const [confirm, setConfirm] = useState(false);

  return (
    <div>
      <PageHeader title={t.settings.title} />
      <div className="grid max-w-xl gap-5">
        <div className="ss-card p-5">
          <Label label={t.settings.theme}>
            <Select
              value={settings.theme}
              onChange={(e) => setSettings({ theme: e.target.value as ThemePreference })}
            >
              <option value="light">{t.settings.light}</option>
              <option value="dark">{t.settings.dark}</option>
              <option value="system">{t.settings.system}</option>
            </Select>
          </Label>
          <Label label={t.settings.language}>
            <Select value={settings.language} onChange={(e) => setSettings({ language: e.target.value as Language })}>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </Select>
          </Label>
          <Label label={t.settings.currency}>
            <Input
              value={settings.defaultCurrency}
              onChange={(e) => setSettings({ defaultCurrency: e.target.value.toUpperCase() })}
            />
          </Label>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.autosave}
              onChange={(e) => setSettings({ autosave: e.target.checked })}
            />
            {t.settings.autosave}
          </label>
        </div>
        <div className="ss-card p-5">
          <h2 className="mt-0 text-lg font-semibold">{t.settings.exportPrefs}</h2>
          <p className="text-sm text-[var(--ink-soft)]">
            {t.settings.pageSize}: A4
          </p>
          <p className="text-sm text-[var(--ink-soft)]">{t.settings.storageNote}</p>
          <p className="text-sm">
            {t.settings.localProjects}: {projects.length}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => exportAllJson(projects)}>
              {t.settings.exportAll}
            </Button>
            <Button type="button" variant="danger" onClick={() => setConfirm(true)}>
              {t.settings.deleteAll}
            </Button>
          </div>
        </div>
        <p className="text-sm text-[var(--ink-soft)]">
          {t.settings.version}: {APP_VERSION}
        </p>
      </div>
      <Modal open={confirm} title={t.settings.deleteAll} onClose={() => setConfirm(false)}>
        <p>{t.settings.deleteAllConfirm}</p>
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              await wipeAll();
              setConfirm(false);
              notify(t.toast.dataDeleted);
            }}
          >
            {t.common.confirm}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setConfirm(false)}>
            {t.kits.cancel}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
