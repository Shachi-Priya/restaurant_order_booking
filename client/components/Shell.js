// export default function Shell({ title, subtitle, right, children }) {
//   return (
//     <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#FFF6D6_0%,#FFF_35%,#FFF_100%)]">
//       <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-black/5">
//         <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
//           <div>
//             <h1 className="text-xl sm:text-2xl font-extrabold">{title}</h1>
//             {subtitle && <p className="text-xs sm:text-sm text-neutral-500">{subtitle}</p>}
//           </div>
//           {right ?? (
//             <div className="px-3 py-1 rounded-xl bg-[#FFD84D] text-black font-semibold shadow">
//               Black & Yellow
//             </div>
//           )}
//         </div>
//       </header>
//       <main className="max-w-5xl mx-auto px-4 py-4">{children}</main>
//     </div>
//   );
// }

import Image from 'next/image';

export default function Shell({ title, subtitle, right, children }) {
  return (
    <div
      className="min-h-[100dvh]"
      style={{
        background: 'linear-gradient(180deg,#0B0E13 0%,#0E141D 100%)',
        color: '#E8ECF3',
      }}
    >
      <header className="sticky top-0 z-30 by-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1
              className="text-xl sm:text-2xl font-semibold"
              style={{ color: '#E9C46A' }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-sub">{subtitle}</p>
            )}
          </div>
          {right ?? (
            <div className="">
              <Image
                src="/menu/saigo.png" // ✅ make sure this file exists under /public/menu/
                alt="Saigo Logo"
                width={92}
                height={92}
                className="rounded-full"
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4">{children}</main>
    </div>
  );
}
