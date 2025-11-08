import { AuthRedirect } from "@/components/auth/auth-redirect";

const highlights = [
  { value: "4.8/5", label: "Customer satisfaction" },
  { value: "120K+", label: "Insights shipped" },
  { value: "45%", label: "Faster decision cycles" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-background)] px-4 py-16 sm:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(14,116,144,0.14),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-1/2 top-16 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.22),_transparent_65%)] blur-3xl" />

      <AuthRedirect>
        <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] shadow-xl shadow-[rgba(15,23,42,0.15)] backdrop-blur">
          <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
            <aside className="relative hidden flex-col justify-between bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-sidebar)_86%,transparent)_0%,rgba(59,130,246,0.92)_100%)] p-8 text-[var(--color-sidebar-foreground)] md:flex">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_60%)]" />
              <div className="absolute inset-0 opacity-50" aria-hidden>
                <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.24),transparent_45%)]" />
              </div>
              <div className="relative z-[1] space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em]">
                  InsightIQ
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold leading-tight text-white">
                    Intelligence for modern operators
                  </h1>
                  <p className="text-sm text-white/80">
                    Synthesise metrics, decisions, and context in a single collaborative workspace designed for high-performing teams.
                  </p>
                </div>
              </div>
              <dl className="relative z-[1] grid grid-cols-3 gap-4 text-left text-sm">
                {highlights.map((item) => (
                  <div key={item.label} className="rounded-[var(--radius-md)] border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <dt className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                      {item.label}
                    </dt>
                    <dd className="mt-2 text-xl font-semibold text-white">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
            <section className="relative bg-[var(--color-surface)] px-6 py-10 sm:px-12">
              <div className="absolute inset-y-0 right-0 w-px bg-[color-mix(in_srgb,var(--color-border)_45%,transparent)] md:hidden" />
              <div className="mx-auto w-full max-w-md space-y-8">{children}</div>
            </section>
          </div>
        </div>
      </AuthRedirect>
    </div>
  );
}
