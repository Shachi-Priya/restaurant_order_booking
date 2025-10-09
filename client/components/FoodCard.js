import Image from "next/image";

export default function FoodCard({ item, qty=0, onAdd, onRemove }) {
  const imgSrc = item.image || `/menu/${item.id}.jpg`;
  const showFallback = !item.image && !String(item.id); // always false, but we still handle error
  return (
    <div className="rounded-2xl bg-white shadow-[0_10px_24px_rgba(0,0,0,0.08)] border border-black/5 overflow-hidden">
      <div className="relative h-28 w-full sm:h-32">
        <Image
          src={imgSrc}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover"
          onError={(e)=>{ e.currentTarget.style.display='none'; e.currentTarget.parentElement.style.background='linear-gradient(135deg,#FFE08A,#FF9EC3)'; }}
        />
        {/* qty pill */}
        {qty > 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-black/80 text-white">
            {qty} in cart
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug truncate">{item.name}</h3>
            <p className="text-sm text-neutral-500 mt-0.5">{item.price ? `₹${item.price}` : "—"}</p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              className="h-8 w-8 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
              onClick={() => onRemove(item)}
              disabled={qty === 0}
              aria-label="Decrease"
            >
              –
            </button>
            <span className="min-w-[26px] text-center text-sm">{qty}</span>
            <button
              className="h-8 px-3 rounded-xl bg-[#FFD84D] text-black font-semibold hover:bg-[#FFC93A]"
              onClick={() => onAdd(item)}
              aria-label="Increase"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
