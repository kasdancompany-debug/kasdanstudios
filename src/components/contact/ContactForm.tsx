"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { submitContact } from "@/app/contact/actions";
import {
  budgets,
  contactSchema,
  fieldErrors,
  formDataToInput,
  projectTypes,
  type ContactField,
  type ContactState,
} from "@/lib/contact/schema";
import { cn } from "@/lib/cn";

const initial: ContactState = { status: "idle" };

const inputBase =
  "w-full border-0 border-b bg-transparent px-0 py-3 text-lg text-cream placeholder:text-dim transition-colors focus:outline-none focus-visible:outline-none focus:border-gold";

function Field({
  id,
  label,
  optional,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="type-label flex items-baseline justify-between text-mute">
        <span>
          {label}
          {!optional && (
            <span aria-hidden className="text-gold">
              {" "}
              *
            </span>
          )}
        </span>
        {optional && (
          <span className="text-dim">
            <span className="sr-only">, </span>Optional
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-sm text-dim">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initial);
  const [clientErrors, setClientErrors] = useState<Partial<Record<ContactField, string>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  // When the form became interactive — sent with each submission for the time trap.
  const startedAt = useRef(0);
  const statusRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const errors = { ...state.fieldErrors, ...clientErrors };
  const v = state.values ?? {};

  // Timestamp for the server-side time trap + preselect project type from ?type=
  useEffect(() => {
    startedAt.current = Date.now();
    const type = new URLSearchParams(window.location.search).get("type");
    const select = formRef.current?.elements.namedItem("projectType") as HTMLSelectElement | null;
    if (type && select && projectTypes.some((p) => p.value === type)) select.value = type;
  }, []);

  // Move focus to the outcome so screen reader and keyboard users hear it.
  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
    if (state.status === "error") {
      const first = state.fieldErrors && Object.keys(state.fieldErrors)[0];
      const el = first ? (formRef.current?.elements.namedItem(first) as HTMLElement | null) : null;
      (el ?? statusRef.current)?.focus();
    }
  }, [state]);

  const validateField = (name: ContactField) => {
    if (!formRef.current) return;
    const parsed = contactSchema.safeParse(formDataToInput(new FormData(formRef.current)));
    const all = parsed.success ? {} : fieldErrors(parsed.error);
    setClientErrors((prev) => ({ ...prev, [name]: all[name] }));
  };

  /**
   * With JS we dispatch the action ourselves rather than letting React's form
   * action run: React resets the form after an action, which would wipe the
   * visitor's selects after a server-side error. `action={formAction}` stays
   * on the form so the same server action still works without JS.
   */
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const parsed = contactSchema.safeParse(formDataToInput(data));
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setClientErrors(errs);
      const first = Object.keys(errs)[0];
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setClientErrors({});
    data.set("ks_t", String(startedAt.current));
    startTransition(() => formAction(data));
  };

  const describedBy = (name: ContactField, hint = false) =>
    errors[name] ? `${name}-error` : hint ? `${name}-hint` : undefined;

  if (state.status === "success") {
    return (
      <div className="border-t border-line pt-10" role="status">
        <p className="type-label text-gold">Message sent</p>
        <h2 ref={successRef} tabIndex={-1} className="type-headline mt-6 text-cream outline-none">
          Thank you.
        </h2>
        <p className="type-lede mt-6 max-w-[40ch] text-bone">{state.message}</p>
        <p className="mt-4 text-mute">A real person reads every enquiry — we&apos;ll be in touch soon.</p>
        {state.devDelivery && (
          <p className="type-label mt-8 border border-gold-soft p-4 text-gold">
            Development mode: the submission passed validation but was not emailed (CONTACT_DELIVERY=console).
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      aria-describedby="form-status"
      className="space-y-10"
    >
      <div
        id="form-status"
        ref={statusRef}
        tabIndex={-1}
        role={state.status === "error" ? "alert" : undefined}
        className="outline-none"
      >
        {state.status === "error" && state.message && (
          <p className="border-l border-danger pl-4 text-danger">{state.message}</p>
        )}
      </div>

      {/* Spam protection: honeypot (hidden from people and assistive tech). The time-trap
          timestamp is added at submit time in onSubmit. */}
      <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="ks_hp">Leave this field empty</label>
        <input id="ks_hp" name="ks_hp" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="grid gap-10 sm:grid-cols-2">
        <Field id="name" label="Name" error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            defaultValue={v.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            onBlur={() => errors.name && validateField("name")}
            className={cn(inputBase, errors.name ? "border-danger" : "border-line-strong")}
          />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={254}
            defaultValue={v.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            onBlur={(e) => (errors.email || e.currentTarget.value) && validateField("email")}
            className={cn(inputBase, errors.email ? "border-danger" : "border-line-strong")}
          />
        </Field>
      </div>

      <Field id="company" label="Company / organization" optional error={errors.company}>
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          maxLength={160}
          defaultValue={v.company}
          aria-invalid={Boolean(errors.company)}
          aria-describedby={describedBy("company")}
          className={cn(inputBase, errors.company ? "border-danger" : "border-line-strong")}
        />
      </Field>

      <div className="grid gap-10 sm:grid-cols-2">
        <Field id="projectType" label="Project type" error={errors.projectType}>
          <select
            id="projectType"
            name="projectType"
            required
            defaultValue={v.projectType ?? ""}
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={describedBy("projectType")}
            onChange={() => errors.projectType && validateField("projectType")}
            className={cn(
              inputBase,
              "appearance-none bg-ink",
              errors.projectType ? "border-danger" : "border-line-strong",
            )}
          >
            <option value="" disabled>
              Choose one
            </option>
            {projectTypes.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="budget" label="Estimated budget (CAD)" error={errors.budget}>
          <select
            id="budget"
            name="budget"
            required
            defaultValue={v.budget ?? ""}
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={describedBy("budget")}
            onChange={() => errors.budget && validateField("budget")}
            className={cn(inputBase, "appearance-none bg-ink", errors.budget ? "border-danger" : "border-line-strong")}
          >
            <option value="" disabled>
              Choose a range
            </option>
            {budgets.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        id="timeline"
        label="Desired timeline"
        optional
        error={errors.timeline}
        hint="E.g. “Launch in March” or “Flexible”."
      >
        <input
          id="timeline"
          name="timeline"
          type="text"
          maxLength={160}
          defaultValue={v.timeline}
          aria-invalid={Boolean(errors.timeline)}
          aria-describedby={describedBy("timeline", true)}
          className={cn(inputBase, errors.timeline ? "border-danger" : "border-line-strong")}
        />
      </Field>

      <Field
        id="message"
        label="Tell us about the project"
        error={errors.message}
        hint="What you're making, who it's for, and anything we should know."
      >
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={5000}
          defaultValue={v.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message", true)}
          onBlur={() => errors.message && validateField("message")}
          className={cn(inputBase, "resize-y leading-relaxed", errors.message ? "border-danger" : "border-line-strong")}
        />
      </Field>

      <div>
        <div className="flex items-start gap-4">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            defaultChecked={v.consent}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            onChange={() => errors.consent && validateField("consent")}
            className="mt-1 size-5 shrink-0 cursor-pointer appearance-none border border-line-strong bg-transparent checked:border-gold checked:bg-gold checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22><path d=%22M5 10.5l3 3 7-7%22 fill=%22none%22 stroke=%22%230c0b09%22 stroke-width=%221.8%22/></svg>')] focus-visible:outline-gold"
          />
          <label htmlFor="consent" className="text-bone">
            I agree that Kasdan Studios may use these details to respond to my enquiry, as described in the{" "}
            <Link
              href="/privacy"
              className="text-cream underline decoration-gold-soft underline-offset-4 hover:decoration-gold"
            >
              privacy policy
            </Link>
            .
            <span aria-hidden className="text-gold">
              {" "}
              *
            </span>
          </label>
        </div>
        {errors.consent && (
          <p id="consent-error" className="mt-2 pl-9 text-sm text-danger">
            {errors.consent}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-dim">
          <span aria-hidden className="text-gold">
            *
          </span>{" "}
          Required
        </p>
        <button
          type="submit"
          disabled={pending}
          aria-disabled={pending}
          className="group/btn type-nav inline-flex items-center justify-center gap-3 bg-cream px-7 py-[1.15rem] text-ink transition-colors duration-500 hover:bg-gold disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? (
            <>
              <LoaderCircle aria-hidden className="size-4 animate-spin" strokeWidth={1.5} />
              Sending…
            </>
          ) : (
            <>
              Send enquiry
              <ArrowRight
                aria-hidden
                strokeWidth={1.25}
                className="size-4 transition-transform duration-500 group-hover/btn:translate-x-1"
              />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
