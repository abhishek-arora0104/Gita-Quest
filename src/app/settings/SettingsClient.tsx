"use client";

import { useState } from "react";
import { saveGeminiApiKey, deleteGeminiApiKey } from "@/actions/geminiKey";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary";

type Props = {
  locale: Locale;
  t: Dictionary;
  isAuthenticated: boolean;
  existingKey: boolean;
};

export function SettingsClient({ locale, t, isAuthenticated, existingKey }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(existingKey);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!isAuthenticated) {
    return (
      <Card>
        <div className="p-6 text-center">
          <p className="text-ink-soft">{t.settings.notAuthenticated}</p>
          <div className="mt-4">
            <Button href={`/${locale}/auth/login`} variant="primary" size="md">
              {t.settings.loginCta}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  async function handleSave() {
    if (!apiKey.trim()) return;
    setSaving(true);
    setStatus(null);
    const result = await saveGeminiApiKey(apiKey);
    setSaving(false);
    if (result.ok) {
      setHasKey(true);
      setApiKey("");
      setStatus({ type: "success", message: t.settings.saved });
    } else {
      setStatus({ type: "error", message: result.error ?? t.settings.errorSaving });
    }
  }

  async function handleRemove() {
    setSaving(true);
    setStatus(null);
    const result = await deleteGeminiApiKey();
    setSaving(false);
    setConfirmRemove(false);
    if (result.ok) {
      setHasKey(false);
      setStatus({ type: "success", message: t.settings.removed });
    } else {
      setStatus({ type: "error", message: result.error ?? t.settings.errorRemoving });
    }
  }

  const guideSteps = [
    { title: t.settings.guideStep1Title, body: t.settings.guideStep1Body },
    { title: t.settings.guideStep2Title, body: t.settings.guideStep2Body },
    { title: t.settings.guideStep3Title, body: t.settings.guideStep3Body },
    { title: t.settings.guideStep4Title, body: t.settings.guideStep4Body },
    { title: t.settings.guideStep5Title, body: t.settings.guideStep5Body },
  ];

  return (
    <div className="space-y-8">
      {/* ── API Key Card ── */}
      <Card>
        <CardHeader>
          <h2 className="font-serif text-xl font-bold text-maroon">
            {t.settings.apiKeyTitle}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {t.settings.apiKeySubtitle}
          </p>
          {hasKey && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-leaf/10 px-4 py-2.5 text-sm text-leaf">
              <span className="text-lg">✓</span>
              {t.chatbot.unlimited}
            </div>
          )}
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {status && (
              <div
                className={`rounded-xl px-4 py-2.5 text-sm ${
                  status.type === "success"
                    ? "bg-leaf/10 text-leaf"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {status.message}
              </div>
            )}

            {hasKey ? (
              <div className="space-y-3">
                <Input
                  value="••••••••••••••••••••••••••••••"
                  disabled
                  label={t.settings.apiKeyLabel}
                />
                {confirmRemove ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">
                      {t.settings.removeConfirm}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => void handleRemove()}
                        disabled={saving}
                      >
                        {saving ? t.settings.saving : t.settings.removeKey}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmRemove(false)}
                      >
                        {t.settings.cancel}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmRemove(true)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    {t.settings.removeKey}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  label={t.settings.apiKeyLabel}
                  placeholder={t.settings.apiKeyPlaceholder}
                  type="password"
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => void handleSave()}
                  disabled={saving || !apiKey.trim()}
                >
                  {saving ? t.settings.saving : t.settings.saveKey}
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── Beginner Guide Card ── */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron/15 text-xl">
              📖
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-maroon">
                {t.settings.guideTitle}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                {t.settings.guideSubtitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {guideSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex shrink-0 flex-col items-center">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-saffron text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  {index < guideSteps.length - 1 && (
                    <span className="mt-1 block w-px flex-1 bg-gold/30" />
                  )}
                </div>
                <div className="pb-2">
                  <h3 className="font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-gold/20 bg-cream/50 p-4">
            <p className="text-sm text-ink-soft">🔒 {t.settings.guideNote}</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
