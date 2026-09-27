import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/PublicNav";

/**
 * @typedef {object} AuthLayoutProps
 * @property {any} [icon]
 * @property {string} title
 * @property {string} [subtitle]
 * @property {any} [footer]
 * @property {any} [children]
 */

/** @param {AuthLayoutProps} props */
export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dots px-4 py-12">
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link to="/" className="mb-6 rounded-lg" aria-label="8xNanoo home">
            <Logo />
          </Link>
          {Icon && (
            <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
              <Icon aria-hidden="true" className="h-7 w-7" />
            </span>
          )}
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-7 shadow-card sm:p-8">
          {children}
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        )}
      </div>
    </div>
  );
}
