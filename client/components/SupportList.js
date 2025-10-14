// import useSWR from "swr";
// const fetcher = (u) => fetch(u).then(r => r.json());

// export default function SupportList() {
//   const { data } = useSWR("/api/orderHandler", fetcher, { refreshInterval: 4000 });
//   const orders = data?.orders || [];

//   return (
//     <div className="space-y-4">
//       {orders.map((o) => (
//         <div key={o._id} className="bg-white border rounded-2xl p-4 shadow-soft">
//           <div className="flex justify-between">
//             <div className="font-semibold">Table #{o.tableNo}</div>
//             <div className="text-sm opacity-70">{new Date(o.createdAt).toLocaleString()}</div>
//           </div>
//           <ul className="text-sm mt-2">
//             {o.items.map((it, i) => (
//               <li key={i} className="flex justify-between">
//                 <span>{it.name} × {it.qty}</span>
//                 <span>₹{(it.price || 0) * it.qty}</span>
//               </li>
//             ))}
//           </ul>
//           <div className="mt-2 font-semibold">Total: ₹{o.total} | Payable: ₹{o.payable}</div>
//           <div className="text-xs opacity-70">Status: {o.status}</div>
//         </div>
//       ))}
//       {orders.length === 0 && <div className="opacity-70">No orders yet.</div>}
//     </div>
//   );
// }


/////////////////

// components/SupportList.jsx
// import { useEffect, useState } from 'react';
// import OrderSlideSwitch from './OrderSlideSwitch';

// export default function SupportList() {
//   const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     (async () => {
//       const res = await fetch('/api/orderHandler?list=true'); // your existing endpoint
//       const data = await res.json();
//       setOrders(Array.isArray(data?.orders) ? data.orders : []);
//     })();
//   }, []);

//   return (
//     <div className="space-y-4">
//       {orders.map((o) => (
//         <article
//           key={o._id}
//           className="rounded-2xl bg-white/8 border border-white/20 text-white p-4 md:p-5"
//         >
//           <div className="flex items-start justify-between gap-3 mb-2">
//             <h3 className="text-lg font-extrabold">Table #{o.tableNo}</h3>

//             {/* ✅ Slide switch per order */}
//             <OrderSlideSwitch orderId={o._id} />
//           </div>

//           <ul className="text-white/90 mb-3 leading-6">
//             {(o.items || []).map((it, i) => (
//               <li key={i}>
//                 {it.name} × {it.qty}
//               </li>
//             ))}
//           </ul>

//           <div className="text-white/70 text-sm">
//             Status: {o.status || 'placed'}
//           </div>
//         </article>
//       ))}
//     </div>
//   );
// }


///////////////
// import { useEffect, useState } from 'react';
// import OrderSlideSwitch from './OrderSlideSwitch';

// export default function SupportList() {
//   const [orders, setOrders] = useState([]);
//   const [loadingList, setLoadingList] = useState(true);

//   const fetchOrders = async () => {
//     setLoadingList(true);
//     try {
//       const res = await fetch('/api/orderHandler?list=true');
//       const data = await res.json();
//       setOrders(Array.isArray(data?.orders) ? data.orders : []);
//     } finally {
//       setLoadingList(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const updateLocalStatus = (id, nextStatus) => {
//     setOrders(prev => prev.map(o => (o._id === id ? { ...o, status: nextStatus } : o)));
//   };

//   if (loadingList) {
//     return (
//       <div className="space-y-4">
//         {[...Array(3)].map((_, i) => (
//           <div key={i} className="h-24 rounded-2xl bg-white/10 border border-white/15 animate-pulse" />
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {orders.map((o) => {
//         const adult = o?.adult ?? 0;
//         const barn1 = o?.Barn1 ?? 0;
//         const barn2 = o?.Barn2 ?? 0;
//         const totalPeople = adult + barn1 + barn2;
//         const status = o.status || 'placed';
//         const isComplete = status === 'completed';

//         return (
//           <article key={o._id} className="rounded-2xl bg-white/8 border border-white/20 text-white p-4 md:p-5">
//             <div className="flex items-start justify-between gap-3 mb-2">
//               <h3 className="text-lg font-extrabold">Table #{o.tableNo}</h3>

//               <OrderSlideSwitch
//                 orderId={o._id}
//                 tableNo={o.tableNo}
//                 status={status}
//                 onStatusChange={(nextStatus) => updateLocalStatus(o._id, nextStatus)}
//               />
//             </div>

//             {/* People chips */}
//             <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
//               <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
//                 <span className="opacity-80 mr-1">Adult:</span>
//                 <span className="font-semibold">{adult}</span>
//               </span>
//               <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
//                 <span className="opacity-80 mr-1">Barn 7–12 ÅR:</span>
//                 <span className="font-semibold">{barn1}</span>
//               </span>
//               <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
//                 <span className="opacity-80 mr-1">Barn 4–6 ÅR:</span>
//                 <span className="font-semibold">{barn2}</span>
//               </span>
//             </div>

//             {Array.isArray(o.items) && o.items.length > 0 ? (
//               <ul className="text-white/90 mb-3 leading-6">
//                 {o.items.map((it, i) => (
//                   <li key={i}>{it.name} × {it.qty}</li>
//                 ))}
//               </ul>
//             ) : (
//               <div className="text-white/70 mb-3 text-sm">No items.</div>
//             )}

//             <div className="text-white/70 text-sm">
//               Status:{' '}
//               {isComplete ? (
//                 <span className="text-green-300 font-semibold">Completed</span>
//               ) : (
//                 <span className="text-red-300 font-semibold">Not completed</span>
//               )}
//             </div>
//           </article>
//         );
//       })}

//       {orders.length === 0 && (
//         <div className="rounded-xl bg-white/5 border border-white/15 p-4 text-white/80">
//           No orders yet.
//         </div>
//       )}
//     </div>
//   );
// }



//////////////////////
import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import OrderSlideSwitch from './OrderSlideSwitch';

export default function SupportList() {
  const [orders, setOrders] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(10);

  const isFetchingRef = useRef(false);
  const reloadIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const RELOAD_INTERVAL = 10; // seconds

  const fetchOrders = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoadingList(true);
    try {
      const res = await fetch('/api/orderHandler?list=true', { cache: 'no-store' });
      const data = await res.json();
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
      setLastUpdated(new Date());
      setSecondsLeft(RELOAD_INTERVAL); // reset countdown
    } finally {
      isFetchingRef.current = false;
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchOrders(); // initial load

    // countdown timer
    countdownIntervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          fetchOrders(); // trigger reload when 0
          return RELOAD_INTERVAL;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const updateLocalStatus = (id, nextStatus) => {
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: nextStatus } : o)));
  };

  return (
    <div className="space-y-4">
      {/* Header with reload button and countdown */}
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">Support Orders</h2>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-white/60">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          <span className="text-xs text-white/60">
            Reloading in <span className="font-semibold text-white">{secondsLeft}s</span>
          </span>

          <button
            onClick={fetchOrders}
            disabled={loadingList}
            title="Reload now"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <RotateCcw
              className={`w-4 h-4 ${
                loadingList ? 'animate-spin text-blue-300' : 'text-white'
              }`}
            />
            <span className="hidden sm:inline">{loadingList ? 'Reloading...' : 'Reload'}</span>
          </button>
        </div>
      </div>

      {/* Skeleton */}
      {loadingList && orders.length === 0 && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-white/10 border border-white/15 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Orders */}
      <div className="space-y-4">
        {orders.map((o) => {
          const adult = o?.adult ?? 0;
          const barn1 = o?.Barn1 ?? 0;
          const barn2 = o?.Barn2 ?? 0;
          const status = o.status || 'placed';
          const isComplete = status === 'completed';

          return (
            <article
              key={o._id}
              className="rounded-2xl bg-white/8 border border-white/20 text-white p-4 md:p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-extrabold">Table #{o.tableNo}</h3>

                <OrderSlideSwitch
                  orderId={o._id}
                  tableNo={o.tableNo}
                  status={status}
                  onStatusChange={(nextStatus) => updateLocalStatus(o._id, nextStatus)}
                />
              </div>

              {/* People chips */}
              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
                  <span className="opacity-80 mr-1">Adult:</span>
                  <span className="font-semibold">{adult}</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
                  <span className="opacity-80 mr-1">Barn 7–12 ÅR:</span>
                  <span className="font-semibold">{barn1}</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
                  <span className="opacity-80 mr-1">Barn 4–6 ÅR:</span>
                  <span className="font-semibold">{barn2}</span>
                </span>
              </div>

              {Array.isArray(o.items) && o.items.length > 0 ? (
                <ul className="text-white/90 mb-3 leading-6">
                  {o.items.map((it, i) => (
                    <li key={i}>
                      {it.name} × {it.qty}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-white/70 mb-3 text-sm">No items.</div>
              )}

              <div className="text-white/70 text-sm">
                Status:{' '}
                {isComplete ? (
                  <span className="text-green-300 font-semibold">Completed</span>
                ) : (
                  <span className="text-red-300 font-semibold">Not completed</span>
                )}
              </div>
            </article>
          );
        })}

        {orders.length === 0 && !loadingList && (
          <div className="rounded-xl bg-white/5 border border-white/15 p-4 text-white/80">
            No orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
