import type { ReactNode } from "react";

export function Pill({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3.5 inline-block rounded-full border-[1.5px] border-ink bg-paper px-2.5 py-0.5 text-xs font-bold">
      {children}
    </p>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-[28px] font-bold leading-[1.08] tracking-[-0.03em]">{children}</h2>;
}

export function Body({ children }: { children: ReactNode }) {
  return <p className="mb-3.5 text-[15px] leading-relaxed text-muted">{children}</p>;
}

export function FinePrint({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[12px] italic text-muted">{children}</p>;
}

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "default";
} & ({ href: string; external?: boolean; onClick?: never } | { onClick: () => void; href?: never; external?: never });

export function Button({ children, variant = "default", ...rest }: ButtonProps) {
  const cls =
    "inline-block rounded-[7px] border-[1.5px] border-ink px-3.5 py-2 text-sm font-bold shadow-hard transition-transform " +
    "active:translate-x-px active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo " +
    (variant === "primary" ? "bg-vermilion text-white" : "bg-surface text-ink hover:bg-paper");
  if ("href" in rest && rest.href) {
    const ext = rest.external ?? /^https?:/.test(rest.href);
    return (
      <a href={rest.href} className={cls} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={rest.onClick}>
      {children}
    </button>
  );
}

export function ButtonRow({ children }: { children: ReactNode }) {
  return <div className="mt-2 flex flex-wrap items-center gap-2.5">{children}</div>;
}

/** Folder view with a mono "N items" header; renders children when empty. */
export function EmptyFolder({ count, children }: { count: number; children: ReactNode }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-b-[1.5px] border-dashed border-ink/40 pb-2 font-mono text-xs text-muted">
        <span>{count} items</span>
        <span>~/kaizen-atelier/work</span>
      </div>
      {children}
    </div>
  );
}
