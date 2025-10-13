// import Image from "next/image";

// export default function FoodCard({ item, qty=0, onAdd, onRemove }) {
//   const imgSrc = item.image || `/menu/${item.id}.jpg`;
//   const showFallback = !item.image && !String(item.id); // always false, but we still handle error
//   return (
//     <div className="rounded-2xl bg-white shadow-[0_10px_24px_rgba(0,0,0,0.08)] border border-black/5 overflow-hidden">
//       <div className="relative h-28 w-full sm:h-32">
//         <Image
//           src={imgSrc}
//           alt={item.name}
//           fill
//           sizes="(max-width: 640px) 100vw, 33vw"
//           className="object-cover"
//           onError={(e)=>{ e.currentTarget.style.display='none'; e.currentTarget.parentElement.style.background='linear-gradient(135deg,#FFE08A,#FF9EC3)'; }}
//         />
//         {/* qty pill */}
//         {qty > 0 && (
//           <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-black/80 text-white">
//             {qty} in cart
//           </div>
//         )}
//       </div>

//       <div className="p-3">
//         <div className="flex items-start justify-between gap-2">
//           <div className="min-w-0">
//             <h3 className="font-semibold leading-snug truncate">{item.name}</h3>
//             <p className="text-sm text-neutral-500 mt-0.5">{item.price ? `₹${item.price}` : "—"}</p>
//           </div>

//           <div className="flex items-center gap-1 shrink-0">
//             <button
//               className="h-8 w-8 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
//               onClick={() => onRemove(item)}
//               disabled={qty === 0}
//               aria-label="Decrease"
//             >
//               –
//             </button>
//             <span className="min-w-[26px] text-center text-sm">{qty}</span>
//             <button
//               className="h-8 px-3 rounded-xl bg-[#FFD84D] text-black font-semibold hover:bg-[#FFC93A]"
//               onClick={() => onAdd(item)}
//               aria-label="Increase"
//             >
//               +
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import Image from 'next/image';

export default function FoodCard({ item, qty = 0, onAdd, onRemove }) {
  const imgSrc = item.image || `/menu/${item.id}.jpg`;

  return (
    <div className="by-card">
      <div className="by-card-media">
        <Image
          src={imgSrc}
          alt={item.name}
          fill
          quality={60} // start 50–70
          priority={/* only for 1 hero image */ true}
          loading="lazy"
          placeholder="blur"
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover"
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.style.background =
              'linear-gradient(135deg,#E9C46A33,#F4D35E33)';
          }}
        />
      </div>

      <div className="by-card-body">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="by-card-title truncate">{item.name}</div>
            <p className="by-card-sub truncate">{item.desc || ' '}</p>
          </div>

          <div className="by-qty">
            <button
              className="by-btn-icon"
              onClick={() => onRemove(item)}
              aria-label="decrease"
            >
              −
            </button>
            <span className="by-qty-value">{qty}</span>
            <button
              className="by-btn-icon"
              onClick={() => onAdd(item)}
              aria-label="increase"
            >
              +
            </button>
          </div>
        </div>

        {typeof item.price === 'number' && (
          <div className="mt-3">
            <span className="by-badge-gold">₹{item.price}</span>
          </div>
        )}
      </div>
    </div>
  );
}
