"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { DATA_DETAILS } from "@/data/seed";
import Icon from "@/components/Icon";

/** Digits with at most one decimal point, e.g. "8" or "4.5". */
const NUMERIC_INPUT = /^\d*\.?\d*$/;
const isValidNumber = (s: string) => /^\d+(\.\d+)?$/.test(s.trim());

/**
 * Standalone Vibrancy Portal data form, opened in its own browser tab from the
 * "Share your context" step of the collect and report flows. On submit - or
 * when the tab is closed after entering anything - it writes the values into
 * the store (persisted to localStorage); the tab that opened it picks the
 * change up via the cross-tab storage listener in StoreHydrator and flips its
 * "Open form" control to "View summary".
 */
export default function DataFormPage() {
  const { dataKey = "" } = useParams<{ dataKey: string }>();
  const detail = DATA_DETAILS[dataKey];
  const dataForms = useAppStore((s) => s.dataForms);
  const submitDataForm = useAppStore((s) => s.submitDataForm);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Persist-on-close: if the user fills anything in and closes the tab without
  // hitting Submit, still mark the form completed with what they entered. A ref
  // holds the latest values/submitted (kept in sync via an effect) so the
  // pagehide handler, registered once, always sees current data.
  const latest = useRef({ values, submitted });
  useEffect(() => {
    latest.current = { values, submitted };
  }, [values, submitted]);
  useEffect(() => {
    const flush = () => {
      const { values: v, submitted: done } = latest.current;
      if (done) return;
      const hasAny = Object.values(v).some((x) => x.trim() !== "");
      if (hasAny) submitDataForm(dataKey, v);
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [dataKey, submitDataForm]);

  if (!detail) {
    return (
      <div className="mx-auto max-w-xl animate-nc-rise px-8 pt-10">
        <p className="text-sm leading-relaxed">This form could not be found.</p>
      </div>
    );
  }

  const savedValues = dataForms[dataKey];
  const fields = detail.formFields ?? [];
  const allFilled = fields.every((f) => (values[f.label] ?? "").trim() !== "");
  // A number field is only valid once it holds an actual number. Typing is
  // filtered to digits, so this catches an empty or half-typed value ("4.").
  const invalidField = fields.find(
    (f) =>
      f.kind === "number" &&
      (values[f.label] ?? "").trim() !== "" &&
      !isValidNumber(values[f.label] ?? ""),
  );
  const canSubmit = allFilled && !invalidField;

  const submit = () => {
    if (!canSubmit) return;
    submitDataForm(dataKey, values);
    setSubmitted(true);
  };

  // Already done (either seeded complete, or submitted earlier / just now).
  const done = detail.completed || !!savedValues || submitted;

  if (done) {
    const summary =
      detail.summary ??
      (savedValues
        ? Object.entries(savedValues).map(([question, answer]) => ({
            question,
            answer,
          }))
        : fields.map((f) => ({
            question: f.label,
            answer: values[f.label] ?? "",
          })));
    return (
      <div className="mx-auto max-w-xl animate-nc-rise px-8 pt-10 pb-20">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-success-bg text-xl text-success-ink">
            <Icon name="check" size={20} />
          </div>
          <div>
            <h1 className="font-serif text-xl leading-tight font-bold">
              {detail.label}
            </h1>
            <p className="text-sm text-ink-muted">
              {submitted ? "Submitted - this form is now complete." : "Completed"}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6">
          {summary.map((row) => (
            <div key={row.question}>
              <div className="mb-0.5 text-xs text-ink-muted">{row.question}</div>
              <div className="text-sm font-semibold">{row.answer || "-"}</div>
            </div>
          ))}
        </div>

        <p className="mb-4 text-sm leading-relaxed text-ink-muted">
          You can close this tab and return to your grant - it now shows this
          form as filled out.
        </p>
        <button
          onClick={() => window.close()}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold text-ink transition duration-150 enabled:hover:border-accent"
        >
          Close this tab
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl animate-nc-rise px-8 pt-10 pb-20">
      <h1 className="mb-1 font-serif text-xl leading-tight font-bold">
        {detail.label}
      </h1>
      <p className="mb-6 text-sm leading-relaxed text-ink-muted">
        Fill this out to add it to your Vibrancy Portal data. Your answers are
        saved back to your grant automatically.
      </p>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
        {fields.map((f) => {
          const isNumber = f.kind === "number";
          return (
            <div key={f.label}>
              <label
                className="mb-1 block text-sm font-semibold"
                htmlFor={f.label}
              >
                {f.label}
                {isNumber && (
                  <span className="ml-1.5 font-medium text-ink-muted">
                    numbers only
                  </span>
                )}
              </label>
              <input
                id={f.label}
                value={values[f.label] ?? ""}
                // Number fields reject non-numeric keystrokes outright rather
                // than letting the user type something they'd have to undo.
                inputMode={isNumber ? "decimal" : undefined}
                onChange={(e) => {
                  const next = e.target.value;
                  if (isNumber && !NUMERIC_INPUT.test(next)) return;
                  setValues((v) => ({ ...v, [f.label]: next }));
                }}
                placeholder={f.placeholder}
                className="w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit form
      </button>
      {invalidField ? (
        <p className="mt-2.5 text-xs text-warning-ink">
          {invalidField.label} needs to be a number.
        </p>
      ) : (
        !allFilled && (
          <p className="mt-2.5 text-xs text-ink-muted">
            Fill in every field to submit.
          </p>
        )
      )}
    </div>
  );
}
