// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";
// import Header from "../components/Header";

// export default function Placed() {
//   const router = useRouter();
//   const { id } = router.query;
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!id) return;
//     (async () => {
//       setLoading(true);
//       const res = await fetch(`/api/orderHandler?orderId=${id}`);
//       const data = await res.json();
//       setOrder(data?.order || null);
//       setLoading(false);
//     })();
//   }, [id]);

//   if (loading) {
//     return (
//       <>
//         <Header title="Order Placed" />
//         <main className="max-w-3xl mx-auto px-4 pb-24">
//           <div className="bg-white border rounded-2xl p-4">Loading…</div>
//         </main>
//       </>
//     );
//   }

//   if (!order) {
//     return (
//       <>
//         <Header title="Order Placed" />
//         <main className="max-w-3xl mx-auto px-4 pb-24">
//           <div className="bg-white border rounded-2xl p-4">Order not found.</div>
//         </main>
//       </>
//     );
//   }

//   return (
//     <>
//       <Header title="Order Placed ✅" subtitle={`Table #${order.tableNo}`} />
//       <main className="max-w-3xl mx-auto px-4 pb-24">
//         <div className="bg-white border rounded-2xl p-4 shadow-soft">
//           <ul className="text-sm">
//             {order.items.map((it, i) => (
//               <li key={i} className="flex justify-between py-1">
//                 <span>{it.name} × {it.qty}</span>
//                 <span>₹{(it.price || 0) * it.qty}</span>
//               </li>
//             ))}
//           </ul>
//           <div className="mt-3 border-t pt-3">
//             <div className="flex justify-between"><span>Subtotal</span><span>₹{order.total}</span></div>
//             <div className="flex justify-between"><span>Service Tax</span><span>₹{order.serviceTax}</span></div>
//             <div className="flex justify-between"><span>GST</span><span>₹{order.GST}</span></div>
//             <div className="flex justify-between font-semibold text-lg mt-1"><span>Payable</span><span>₹{order.payable}</span></div>
//           </div>
//         </div>

//         <a href={`/?tableNo=${order.tableNo}`} className="inline-block mt-4 underline">
//           Back to Menu
//         </a>
//       </main>
//     </>
//   );
// }

//////////////////
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Placed() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/orderHandler?orderId=${id}`);
      const data = await res.json();
      setOrder(data?.order || null);
    })();
  }, [id]);

  return (
    <div className="min-h-[100dvh] bg-[#3D846C] text-white">
      {/* Header (same theme as main) */}
      <header className="app-header">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-extrabold">Order Placed</h1>
          <Image
            src="/menu/saigo.png" // ensure this exists in /public/menu/
            alt="Saigo Logo"
            width={56}
            height={56}
            className="rounded-full"
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {!order ? (
          <div className="ui-glass p-4 rounded-2xl border border-white/10">
            Loading…
          </div>
        ) : (
          <div className="ui-glass p-4 rounded-2xl border border-white/10 shadow-md">
            {/* Table + logo row */}
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">
                Table #{order.tableNo}
              </div>
            </div>

            {/* Items list WITHOUT any prices */}
            <ul className="divide-y divide-white/10">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center justify-between py-3">
                  <span className="font-medium">{it.name}</span>
                  <span className="inline-flex items-center gap-2">
                    <span className="opacity-80">Qty</span>
                    <span className="font-semibold">{it.qty}</span>
                  </span>
                </li>
              ))}
            </ul>

            {/* Back to menu */}
            <a
              className="inline-block mt-5 px-4 py-2 rounded-xl bg-white text-[#3D846C] font-semibold"
              href={`/?tableNo=${order.tableNo}`}
            >
              Back to Menu
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
