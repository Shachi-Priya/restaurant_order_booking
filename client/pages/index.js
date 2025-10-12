// // pages/index.js
// "use client";
// import { useMemo, useState } from "react";
// import { useRouter } from "next/router";
// import MenuItemCard from "../components/MenuItemCard";
// import CartBar from "../components/CartBar";

// export default function Home({ initialMenu = [], categories = [], initialTable = null }) {
//   // table number comes from SSR (query) but we also read router for safety on client refresh
//   const router = useRouter();
//   const tableNumber = router?.query?.table || initialTable || null;

//   const [query, setQuery] = useState("");
//   const [cat, setCat] = useState("ALL");
//   const [cart, setCart] = useState([]);

//   const items = useMemo(() => {
//     let list = initialMenu;
//     if (cat !== "ALL") list = list.filter(i => i.category === cat);
//     if (query.trim()) list = list.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
//     return list;
//   }, [initialMenu, cat, query]);

//   const lines = useMemo(() => {
//     return cart.map(l => ({
//       item: initialMenu.find(i => i.id === l.id),
//       qty: l.qty,
//     }));
//   }, [cart, initialMenu]);

//   const add = (item) => {
//     setCart(prev => {
//       const f = prev.find(l => l.id === item.id);
//       if (f) return prev.map(l => l.id===item.id ? {...l, qty:l.qty+1} : l);
//       return [...prev, { id:item.id, qty:1 }];
//     });
//   };
//   const inc = id => setCart(prev => prev.map(l => l.id===id ? {...l, qty:l.qty+1} : l));
//   const dec = id => setCart(prev => prev.flatMap(l => l.id===id ? (l.qty>1?[{...l, qty:l.qty-1}]:[]) : [l]));

//   return (
//     <div className="max-w-5xl mx-auto px-4 py-5">
//       {/* header */}
//       <header className="flex items-center justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-extrabold tracking-tight">SAIGO — Menu</h1>
//           <p className="text-xs text-subtle">
//             {tableNumber ? <>Welcome, <span className="font-semibold text-white">Table #{tableNumber}</span></> : "Scan your table QR"}
//           </p>
//         </div>
//         <div className="hidden sm:block rounded-xl border border-slate-800 px-3 py-2 text-xs text-subtle">
//           Scan • Select • Enjoy
//         </div>
//       </header>

//       {/* search + categories */}
//       <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
//         <input
//           placeholder="Search items…"
//           className="flex-1 rounded-xl bg-card border border-slate-800 px-3 py-2 text-sm outline-none focus:border-mint"
//           value={query}
//           onChange={e=>setQuery(e.target.value)}
//         />
//         <select
//           value={cat}
//           onChange={e=>setCat(e.target.value)}
//           className="rounded-xl bg-card border border-slate-800 px-3 py-2 text-sm outline-none focus:border-mint"
//         >
//           <option value="ALL">All</option>
//           {categories.map(c => <option key={c} value={c}>{c}</option>)}
//         </select>
//       </div>

//       {/* grid */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
//         {items.map(item => (
//           <MenuItemCard key={item.id} item={item} onAdd={add} />
//         ))}
//       </div>

//       {/* sticky cart */}
//       <CartBar lines={lines} onInc={inc} onDec={dec} tableNumber={tableNumber} />

//       <footer className="text-center text-[11px] text-subtle mt-16 mb-6">
//         © {new Date().getFullYear()} SAIGO
//       </footer>
//     </div>
//   );
// }

// // --------- SSR: read JSON from /data/menu.json (+ table from query) ----------
// export async function getServerSideProps(ctx) {
//   const fs = await import("fs/promises");
//   const path = await import("path");

//   const menuPath = path.join(process.cwd(), "data", "menu.json");
//   const raw = await fs.readFile(menuPath, "utf8");
//   const initialMenu = JSON.parse(raw);

//   // categories derived from data (keeps your source of truth on server)
//   const categories = Array.from(
//     new Set(initialMenu.map(i => i.category))
//   );

//   const initialTable = ctx.query?.table ?? null;

//   return { props: { initialMenu, categories, initialTable } };
// }

///////////////

// import { useMemo, useState } from "react";
// import { useRouter } from "next/router";
// import Header from "../components/Header";
// import MenuGrid from "../components/MenuGrid";
// import CartBar from "../components/CartBar";
// import dynamic from "next/dynamic";
// import menuData from "../data/menu.json";
// import tablesData from "../data/tables.json";

// const SupportList = dynamic(() => import("../components/SupportList"), { ssr: false });

// export default function Home() {
//   const router = useRouter();
//   const { support, tableNo: tableNoParam } = router.query;

//   // ✅ hooks first
//   const validTables = useMemo(() => new Set(tablesData), []);
//   const [cart, setCart] = useState({});

//   const tableNo = tableNoParam ? Number(tableNoParam) : undefined;

//   // prepare menu once
//   const items = useMemo(() => {
//     const arr = [];
//     for (const section of menuData) {
//       for (const it of section.items) {
//         arr.push({ id: it.id, name: it.name, price: it.price || 0 });
//       }
//     }
//     return arr;
//   }, []);

//   // compute cart lines
//   const lines = useMemo(() => {
//     return Object.entries(cart)
//       .filter(([, q]) => q > 0)
//       .map(([id, qty]) => {
//         const item = items.find((x) => Number(x.id) === Number(id));
//         return { ...item, qty, lineTotal: (item?.price || 0) * qty };
//       });
//   }, [cart, items]);

//   const total = useMemo(() => lines.reduce((s, l) => s + l.lineTotal, 0), [lines]);

//   // handlers
//   const add = (it) => setCart((c) => ({ ...c, [it.id]: (c[it.id] || 0) + 1 }));
//   const remove = (it) =>
//     setCart((c) => ({ ...c, [it.id]: Math.max(0, (c[it.id] || 0) - 1) }));

//   const placeOrder = async () => {
//     const payload = {
//       tableNo,
//       items: lines.map((l) => ({ id: l.id, qty: l.qty })),
//     };
//     const res = await fetch("/api/orderHandler", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//     const data = await res.json();
//     if (res.ok && data?.order?._id) {
//       router.push(`/placed?id=${data.order._id}`);
//     } else {
//       alert(data?.message || "Failed to place order");
//     }
//   };

//   // ✅ now decide which UI to render
//   if (support === "true") {
//     return (
//       <>
//         <Header title="Support Dashboard" subtitle="All orders (latest first)" />
//         <main className="max-w-6xl mx-auto px-4 pb-24">
//           <SupportList />
//         </main>
//       </>
//     );
//   }

//   if (!tableNo || !validTables.has(tableNo)) {
//     return (
//       <>
//         <Header title="Welcome" subtitle="Scan your table QR to begin" />
//         <main className="max-w-6xl mx-auto px-4 pb-24">
//           <div className="bg-white border rounded-2xl p-4">
//             Invalid or missing table number.
//           </div>
//         </main>
//       </>
//     );
//   }

//   // main customer view
//   return (
//     <>
//       <Header title={`Table #${tableNo}`} subtitle="Pick your items" />
//       <main className="max-w-6xl mx-auto px-4 pb-28">
//         <MenuGrid items={items} cart={cart} onAdd={add} onRemove={remove} />
//       </main>
//       <CartBar lines={lines} total={total} onPlace={placeOrder} />
//     </>
//   );
// }

///////////////////////

// import { useMemo, useState } from "react";
// import { useRouter } from "next/router";
// import dynamic from "next/dynamic";
// import Shell from "../components/Shell";
// import CategoryAccordion from "../components/CategoryAccordion";
// import PeopleStrip from "../components/PeopleStrip";
// import PlaceBar from "../components/PlaceBar";
// import tablesData from "../data/tables.json";
// import menuData from "../data/menu.json";

// const SupportList = dynamic(() => import("../components/SupportList"), { ssr: false });

// export default function Home() {
//   const router = useRouter();
//   const { support, tableNo: tableNoParam } = router.query;

//   const tableSet = useMemo(()=>new Set(tablesData), []);
//   const [cart, setCart] = useState({});
//   const [adult, setAdult] = useState(0);
//   const [barn1, setBarn1] = useState(0);
//   const [barn2, setBarn2] = useState(0);
//   const categories = useMemo(()=>menuData, []);

//   const lines = useMemo(()=>{
//     const out = [];
//     for (const sec of categories) {
//       for (const it of sec.items) {
//         const q = cart[it.id] || 0;
//         if (q>0) out.push({ id: it.id, name: it.name, price: it.price||0, qty: q, lineTotal: (it.price||0)*q });
//       }
//     }
//     return out;
//   }, [cart, categories]);

//   const total = useMemo(()=> lines.reduce((s,l)=>s+l.lineTotal,0), [lines]);

//   const add = (it)=> setCart(c=>({ ...c, [it.id]: (c[it.id]||0)+1 }));
//   const remove = (it)=> setCart(c=>({ ...c, [it.id]: Math.max(0,(c[it.id]||0)-1) }));

//   // support page
//   if (support === "true") {
//     return (
//       <Shell title="Support — All Orders" subtitle="Newest first">
//         <div className="space-y-4">
//           <SupportList />
//         </div>
//       </Shell>
//     );
//   }

//   // customer page
//   const tableNo = tableNoParam ? Number(tableNoParam) : undefined;
//   const valid = tableNo && tableSet.has(tableNo);
//   if (!valid) {
//     return (
//       <Shell title="Welcome" subtitle="Scan your table QR to begin">
//         <div className="rounded-2xl bg-white border border-black/10 p-4">Invalid or missing table number.</div>
//       </Shell>
//     );
//   }

//   const placeOrder = async () => {
//     const payload = {
//       tableNo,
//       items: lines.map(l=>({ id: l.id, qty: l.qty })),
//       adult, Barn1: barn1, Barn2: barn2
//     };
//     const res = await fetch("/api/orderHandler", {
//       method: "POST", headers: { "Content-Type":"application/json" },
//       body: JSON.stringify(payload)
//     });
//     const data = await res.json();
//     if (res.ok && data?.order?._id) router.push(`/placed?id=${data.order._id}`);
//     else alert(data?.message || "Failed to place order");
//   };

//   return (
//     <Shell title={`Table #${tableNo}`} subtitle="Choose your items">
//       <div className="mb-4">
//         <PeopleStrip
//           adult={adult} barn1={barn1} barn2={barn2}
//           setAdult={setAdult} setBarn1={setBarn1} setBarn2={setBarn2}
//         />
//       </div>

//       <div className="space-y-4 pb-28">
//         {categories.map((sec, i)=>(
//           <CategoryAccordion
//             key={i}
//             title={sec.category}
//             items={sec.items}
//             cart={cart}
//             onAdd={add}
//             onRemove={remove}
//           />
//         ))}
//       </div>

//       <PlaceBar total={total} onPlace={placeOrder} disabled={lines.length===0} />
//     </Shell>
//   );
// }
import Image from 'next/image';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import Shell from '../components/Shell';
import CartBar from '../components/CartBar';
import tablesData from '../data/tables.json';
import menuData from '../data/menu.json';

const SupportList = dynamic(() => import('../components/SupportList'), {
  ssr: false,
});

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

export default function Home() {
  const router = useRouter();
  const { support, tableNo: tableNoParam } = router.query;

  // ---------- Hooks (must be unconditional) ----------
  const tableSet = useMemo(() => new Set(tablesData), []);
  const [cart, setCart] = useState({});
  const [adult, setAdult] = useState(0);
  const [barn1, setBarn1] = useState(0);
  const [barn2, setBarn2] = useState(0);
  const categories = useMemo(() => menuData, []);

  const lines = useMemo(() => {
    const out = [];
    for (const sec of categories) {
      for (const it of sec.items) {
        const q = cart[it.id] || 0;
        if (q > 0) {
          out.push({
            id: it.id,
            name: it.name,
            price: it.price || 0,
            qty: q,
            lineTotal: (it.price || 0) * q,
          });
        }
      }
    }
    return out;
  }, [cart, categories]);

  const total = useMemo(
    () => lines.reduce((s, l) => s + l.lineTotal, 0),
    [lines]
  );

  const add = (it) => setCart((c) => ({ ...c, [it.id]: (c[it.id] || 0) + 1 }));
  const remove = (it) =>
    setCart((c) => ({ ...c, [it.id]: Math.max(0, (c[it.id] || 0) - 1) }));

  const sectionRefs = useRef({});

  const isSupport = support === 'true';
  const tableNo = tableNoParam ? Number(tableNoParam) : undefined;
  const valid = tableNo && tableSet.has(tableNo);

  const placeOrder = async () => {
    const payload = {
      tableNo,
      items: lines.map((l) => ({ id: l.id, qty: l.qty })),
      adult,
      Barn1: barn1,
      Barn2: barn2,
    };
    const res = await fetch('/api/orderHandler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data?.order?._id) router.push(`/placed?id=${data.order._id}`);
    else alert(data?.message || 'Failed to place order');
  };

  const sectionCount = (sec) =>
    sec.items.reduce((n, it) => n + (cart[it.id] || 0), 0);

  // ---------- Conditional pages ----------
  if (isSupport) {
    return (
      <Shell title="Support — All Orders" subtitle="Newest first">
        <div className="space-y-4">
          <SupportList />
        </div>
      </Shell>
    );
  }

  if (!valid) {
    return (
      <Shell title="Welcome" subtitle="Scan your table QR to begin">
        <div className="ui-surface p-4">Invalid or missing table number.</div>
      </Shell>
    );
  }

  // ---------- Main page ----------
  return (
    <div className="min-h-screen bg-[#3D846C] text-white">
      {/* Header */}
      <header className="app-header">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-3xl">Table #{tableNo}</h1>
            <p className="opacity-80">Choose your items</p>
          </div>
          <div>
            <Image
              src="/menu/saigo.png"
              alt="Saigo Logo"
              width={92}
              height={92}
              className="rounded-full"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-4">
        {/* HERO IMAGE */}
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <div className="w-full h-40 sm:h-56 md:h-64 lg:h-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/menu/58.jpg"
              alt="Restaurant ambiance"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* People counters */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#3D846C]/50 border border-white/10 rounded-xl p-3 backdrop-blur-md">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-white/90">
              ADULT
            </label>
            <input
              className="input w-full bg-transparent border border-white/30 text-white rounded-lg p-2"
              type="number"
              min="0"
              value={adult}
              onChange={(e) =>
                setAdult(Math.max(0, parseInt(e.target.value || '0', 10)))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-white/90">
              BARN 7–12 ÅR
            </label>
            <input
              className="input w-full bg-transparent border border-white/30 text-white rounded-lg p-2"
              type="number"
              min="0"
              value={barn1}
              onChange={(e) =>
                setBarn1(Math.max(0, parseInt(e.target.value || '0', 10)))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-white/90">
              BARN 4–6 ÅR
            </label>
            <input
              className="input w-full bg-transparent border border-white/30 text-white rounded-lg p-2"
              type="number"
              min="0"
              value={barn2}
              onChange={(e) =>
                setBarn2(Math.max(0, parseInt(e.target.value || '0', 10)))
              }
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((sec, i) => {
            const id = slugify(sec.category);
            const count = sectionCount(sec);
            return (
              <button
                key={id}
                className={`px-5 py-2 rounded-full whitespace-nowrap ${
                  i === 0
                    ? 'bg-white text-[#3D846C] font-semibold'
                    : 'bg-white/10 text-white border border-white/20'
                }`}
                onClick={() => {
                  const el = sectionRefs.current[id];
                  if (el)
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {sec.category} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>

        {/* Sections (horizontal scroll cards) */}
        <div className="mt-4 space-y-8 pb-28">
          {categories.map((sec) => {
            const id = slugify(sec.category);
            return (
              <section
                key={id}
                id={id}
                ref={(el) => {
                  sectionRefs.current[id] = el;
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-xl">{sec.category}</h2>
                  <span className="text-sm opacity-80">
                    {sectionCount(sec)} selected
                  </span>
                </div>

                {/* HORIZONTAL SCROLL */}
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {sec.items.map((it) => {
                    const qty = cart[it.id] || 0;
                    const img = it.image || `/menu/${it.id}.jpg`;
                    return (
                      <div
                        key={it.id}
                        className="min-w-[280px] bg-white/8 border border-white/10 rounded-2xl overflow-hidden flex-shrink-0 card-isolate"
                      >
                        {/* Uniform image box */}
                        <div className="relative w-full aspect-[4/3]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={it.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Footer (single blur + single top border) */}
                        <div className="px-3 h-16 flex items-center justify-between rounded-b-2xl border-t border-white/10 bg-white/6 backdrop-blur-md">
                          <div className="font-semibold truncate pr-3">
                            {it.name}
                          </div>

                          {/* Qty pill (no extra blur, subtle ring) */}
                          <div className="flex items-center gap-2 rounded-full px-2 py-1 bg-white/8 ring-1 ring-white/15">
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/8 ring-1 ring-white/20 text-white"
                              onClick={() => remove(it)}
                              aria-label="decrease"
                            >
                              −
                            </button>
                            <span className="font-bold">{qty}</span>
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/8 ring-1 ring-white/20 text-white"
                              onClick={() => add(it)}
                              aria-label="increase"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Floating order bar */}
      <div className="fixed bottom-4 left-0 right-0">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white text-[#3D846C] rounded-2xl p-4 flex items-center justify-between shadow-lg">
            {/* <div className="font-semibold"> */}
            <div>
              {/* Items: {lines.length} • Total: ₹{total} */}
              <button
                className="px-5 py-2 rounded-2xl bg-[#102f29] text-white font-semibold
             cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                onClick={placeOrder}
                disabled={lines.length > 0}
              >
                Place Order
              </button>
            </div>
            <button
              className="btn1 liquid"
              onClick={placeOrder}
              disabled={lines.length === 0}
              style={{
                // borderColor: '#3D846C',
                // color: '#000',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
