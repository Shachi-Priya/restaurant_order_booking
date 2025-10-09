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

import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Shell from "../components/Shell";
import CategoryAccordion from "../components/CategoryAccordion";
import PeopleStrip from "../components/PeopleStrip";
import PlaceBar from "../components/PlaceBar";
import tablesData from "../data/tables.json";
import menuData from "../data/menu.json";

const SupportList = dynamic(() => import("../components/SupportList"), { ssr: false });

export default function Home() {
  const router = useRouter();
  const { support, tableNo: tableNoParam } = router.query;

  const tableSet = useMemo(()=>new Set(tablesData), []);
  const [cart, setCart] = useState({});
  const [adult, setAdult] = useState(0);
  const [barn1, setBarn1] = useState(0);
  const [barn2, setBarn2] = useState(0);
  const categories = useMemo(()=>menuData, []);

  const lines = useMemo(()=>{
    const out = [];
    for (const sec of categories) {
      for (const it of sec.items) {
        const q = cart[it.id] || 0;
        if (q>0) out.push({ id: it.id, name: it.name, price: it.price||0, qty: q, lineTotal: (it.price||0)*q });
      }
    }
    return out;
  }, [cart, categories]);

  const total = useMemo(()=> lines.reduce((s,l)=>s+l.lineTotal,0), [lines]);

  const add = (it)=> setCart(c=>({ ...c, [it.id]: (c[it.id]||0)+1 }));
  const remove = (it)=> setCart(c=>({ ...c, [it.id]: Math.max(0,(c[it.id]||0)-1) }));

  // support page
  if (support === "true") {
    return (
      <Shell title="Support — All Orders" subtitle="Newest first">
        <div className="space-y-4">
          <SupportList />
        </div>
      </Shell>
    );
  }

  // customer page
  const tableNo = tableNoParam ? Number(tableNoParam) : undefined;
  const valid = tableNo && tableSet.has(tableNo);
  if (!valid) {
    return (
      <Shell title="Welcome" subtitle="Scan your table QR to begin">
        <div className="rounded-2xl bg-white border border-black/10 p-4">Invalid or missing table number.</div>
      </Shell>
    );
  }

  const placeOrder = async () => {
    const payload = {
      tableNo,
      items: lines.map(l=>({ id: l.id, qty: l.qty })),
      adult, Barn1: barn1, Barn2: barn2
    };
    const res = await fetch("/api/orderHandler", {
      method: "POST", headers: { "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data?.order?._id) router.push(`/placed?id=${data.order._id}`);
    else alert(data?.message || "Failed to place order");
  };

  return (
    <Shell title={`Table #${tableNo}`} subtitle="Choose your items">
      <div className="mb-4">
        <PeopleStrip
          adult={adult} barn1={barn1} barn2={barn2}
          setAdult={setAdult} setBarn1={setBarn1} setBarn2={setBarn2}
        />
      </div>

      <div className="space-y-4 pb-28">
        {categories.map((sec, i)=>(
          <CategoryAccordion
            key={i}
            title={sec.category}
            items={sec.items}
            cart={cart}
            onAdd={add}
            onRemove={remove}
          />
        ))}
      </div>

      <PlaceBar total={total} onPlace={placeOrder} disabled={lines.length===0} />
    </Shell>
  );
}
