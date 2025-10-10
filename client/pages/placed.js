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
    <div className="min-h-[100dvh] bg-[#FFFBEB] text-[#111827]">
      <header className="border-b bg-[#FFFBEB]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-extrabold">Order Placed</h1>
          <div>
            <Image
              src="/menu/saigo.png" // ✅ make sure this file exists under /public/menu/
              alt="Saigo Logo"
              width={92}
              height={92}
              className="rounded-full"
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {!order ? (
          <div className="bg-white border rounded-2xl p-4">Loading…</div>
        ) : (
          <div className="bg-white border rounded-2xl p-4 shadow-md">
            <div className="font-semibold mb-2">Table #{order.tableNo}</div>
            <ul className="text-sm divide-y">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between py-2">
                  <span>
                    {it.name} × {it.qty}
                  </span>
                  <span>₹{(it.price || 0) * it.qty}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t pt-3 space-y-1">
              <Row k="Subtotal" v={order.total} />
              <Row k="Service Tax" v={order.serviceTax} />
              <Row k="GST" v={order.GST} />
              <Row k="Payable" v={order.payable} bold />
            </div>
            <a
              className="inline-block mt-4 underline"
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

function Row({ k, v, bold }) {
  return (
    <div
      className={`flex justify-between ${bold ? 'font-semibold text-lg' : ''}`}
    >
      <span>{k}</span>
      <span>₹{v}</span>
    </div>
  );
}
