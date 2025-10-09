export default function Shell({ title, subtitle, right, children }) {
  return (
    <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#FFF6D6_0%,#FFF_35%,#FFF_100%)]">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-black/5">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-neutral-500">{subtitle}</p>}
          </div>
          {right ?? (
            <div className="px-3 py-1 rounded-xl bg-[#FFD84D] text-black font-semibold shadow">
              Black & Yellow
            </div>
          )}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-4">{children}</main>
    </div>
  );
}
