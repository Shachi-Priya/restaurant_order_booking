// "use client";
// import { useMemo, useState } from "react";

// export default function CartBar({ lines, onInc, onDec, tableNumber }) {
//   const count = useMemo(() => lines.reduce((n,l)=>n+l.qty,0), [lines]);
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       <div className="fixed bottom-3 left-0 right-0 px-4 z-50">
//         <div className="mx-auto max-w-5xl bg-card border border-slate-800 rounded-2xl shadow-soft">
//           <button className="w-full flex items-center justify-between p-3" onClick={()=>setOpen(!open)}>
//             <div className="text-xs text-subtle">{tableNumber ? `Table #${tableNumber}` : "Table"}</div>
//             <div className="font-semibold">{count} item{count!==1 && "s"} in order</div>
//             <div className="text-[12px] px-3 py-1 rounded-full bg-brand text-black font-bold">View / Confirm</div>
//           </button>
//         </div>
//       </div>

//       {open && (
//         <div className="fixed inset-0 z-50">
//           <div className="absolute inset-0 bg-black/50" onClick={()=>setOpen(false)} />
//           <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-slate-800 rounded-t-2xl p-4 max-h-[75vh] overflow-y-auto">
//             <h4 className="font-bold mb-3">Your Order {tableNumber && `(Table #${tableNumber})`}</h4>

//             {lines.length === 0 ? (
//               <p className="text-subtle text-sm">No items yet — add from the menu.</p>
//             ) : (
//               <ul className="space-y-2">
//                 {lines.map(({item, qty})=>(
//                   <li key={item.id} className="flex items-center justify-between bg-ink/60 border border-slate-800 rounded-xl p-2">
//                     <span className="text-sm">{item.name}</span>
//                     <div className="flex items-center gap-2">
//                       <button className="w-8 h-8 rounded-full border border-slate-700" onClick={()=>onDec(item.id)}>-</button>
//                       <span className="w-6 text-center">{qty}</span>
//                       <button className="w-8 h-8 rounded-full border border-slate-700" onClick={()=>onInc(item.id)}>+</button>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}

//             <button
//               className="mt-4 w-full bg-mint text-black font-bold py-3 rounded-xl hover:opacity-90"
//               onClick={()=>{
//                 alert("Order placed! (front-end only)");
//                 setOpen(false);
//               }}
//             >
//               Confirm Order
//             </button>
//             <p className="mt-2 text-[11px] text-subtle">Staff will bring your order shortly.</p>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// import Image from 'next/image';

// export default function CartBar({ lines, total, onPlace }) {
//   return (
//     <div className="fixed bottom-4 left-0 right-0">
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="bg-white border shadow-soft rounded-2xl p-4 flex items-center justify-between">
//           <div className="font-semibold">
//             Items: {lines.length} • Total: ₹{total}
//           </div>
//           <button
//             className="px-5 py-2 rounded-2xl bg-brand.black text-brand.yellow font-semibold"
//             onClick={onPlace}
//             disabled={lines.length === 0}
//           >
//             Place Order
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
export default function CartBar({ lines, total, onPlace }) {
  const disabled = lines.length === 0;

  return (
    <div className="bar">
      <div className="bar-inner">
        <div>
          <div className="total">
            Items: {lines.length} • Total: ₹{total}
          </div>
          <div className="total-sub">Tax included</div>
        </div>
        <button
          className="btn btn--accent disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onPlace}
          disabled={disabled}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
