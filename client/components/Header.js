export default function Header({ title, subtitle }) {
  return (
    <header className="py-4 mb-4">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm opacity-70">{subtitle}</p>}
        </div>
        <div className="px-3 py-1 rounded-xl bg-brand.yellow text-brand.black font-semibold shadow-soft">
          Black & Yellow
        </div>
      </div>
    </header>
  );
}
