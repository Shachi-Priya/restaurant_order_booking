import Image from 'next/image';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import Shell from '../components/Shell';
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
  const adultRef = useRef(null);
  const [placing, setPlacing] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const { support, tableNo: tableNoParam } = router.query;

  const [routerReady, setRouterReady] = useState(false);
  useEffect(() => {
    if (router.isReady) setRouterReady(true);
  }, [router.isReady]);

  const [showPeopleError, setShowPeopleError] = useState(false);

  // NEW: success modal state
  const [showPlacedModal, setShowPlacedModal] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null); // { id, items, payable }

  // ---------- Hooks (unconditional) ----------
  const tableSet = useMemo(() => new Set(tablesData), []);
  const [cart, setCart] = useState({});

  // People counters start as EMPTY strings (no "0" shown initially)
  const [adult, setAdult] = useState('');
  const [barn1, setBarn1] = useState('');
  const [barn2, setBarn2] = useState('');

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

  // --- Robust tableNo read: router first, window fallback ---
  const rawTableNoParam = useMemo(() => {
    if (typeof tableNoParam !== 'undefined') return tableNoParam;
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('tableNo') ?? undefined;
    }
    return undefined;
  }, [tableNoParam]);

  const tableNo = useMemo(() => {
    const n = Number(rawTableNoParam);
    return Number.isFinite(n) ? n : undefined;
  }, [rawTableNoParam]);

  // Only mark invalid if URL actually had a tableNo AND it’s not allowed
  const urlHasTableNo =
    typeof rawTableNoParam !== 'undefined' && rawTableNoParam !== null;
  const valid = !!tableNo && tableSet.has(tableNo);

  // Convert people inputs to non-negative integers; empty -> 0
  const adultNum = adult === '' ? 0 : Math.max(0, parseInt(adult, 10) || 0);
  const barn1Num = barn1 === '' ? 0 : Math.max(0, parseInt(barn1, 10) || 0);
  const barn2Num = barn2 === '' ? 0 : Math.max(0, parseInt(barn2, 10) || 0);
  const peopleTotal = adultNum + barn1Num + barn2Num;

  useEffect(() => {
    if (showPeopleError && peopleTotal > 0) {
      setShowPeopleError(false);
    }
  }, [peopleTotal, showPeopleError]);

  const ensurePeopleOrFocus = () => {
    if (peopleTotal === 0) {
      adultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      adultRef.current?.focus({ preventScroll: true });
      setShowPeopleError(true);
      return false;
    }
    setShowPeopleError(false);
    return true;
  };

  // Upsert into ongoing "placed" order (same order id reused)
  const placeOrder = async () => {
    if (placing) return; // prevent double click
    if (!ensurePeopleOrFocus()) return;

    setPlacing(true);
    const controller = new AbortController();
    // optional: auto-timeout after 20s so UI never hangs
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const payload = {
        tableNo,
        items: lines.map((l) => ({ id: l.id, qty: l.qty })),
        adult: adultNum,
        Barn1: barn1Num,
        Barn2: barn2Num,
      };

      const res = await fetch('/api/orderHandler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data = await res.json();

      if (res.ok && data?.order?._id) {
        setPlacedOrder({
          id: data.order._id,
          items: data.order.items || [],
          payable: data.order.payable,
        });
        setShowPlacedModal(true);
        setCart({});
      } else {
        alert(data?.message || 'Failed to place order');
      }
    } catch (err) {
      alert(
        err?.name === 'AbortError'
          ? 'Request timed out, please try again.'
          : 'Network error. Please try again.'
      );
    } finally {
      clearTimeout(timeout);
      setPlacing(false);
    }
  };

  // Complete even with zero items/people
  const completeOrder = async () => {
    const res = await fetch('/api/orderHandler?action=completed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableNo,
        adult: adultNum,
        Barn1: barn1Num,
        Barn2: barn2Num,
      }),
    });
    const data = await res.json();
    if (res.ok && data?.order?._id) {
      router.push(`/placed?id=${data.order._id}`);
    } else {
      alert(data?.message || 'Failed to complete order');
    }
  };

  const sectionCount = (sec) =>
    sec.items.reduce((n, it) => n + (cart[it.id] || 0), 0);

  // ---------- Support page ----------
  if (isSupport) {
    return (
      <Shell title="Support — All Orders" subtitle="Newest first">
        <div className="space-y-4">
          <SupportList />
        </div>
      </Shell>
    );
  }

  // ---------- Lazy loading while router/query not ready ----------
  if (!routerReady) {
    return (
      <div className="min-h-screen bg-[#244a38] text-white">
        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-40 rounded-2xl bg-white/10" />
            <div className="h-8 w-40 rounded-full bg-white/10" />
            <div className="h-24 rounded-xl bg-white/10" />
          </div>
        </main>
      </div>
    );
  }

  // ---------- If URL HAS tableNo but it's invalid, then show invalid ----------
  if (urlHasTableNo && !valid) {
    return (
      <Shell title="Welcome" subtitle="Scan your table QR to begin">
        <div className="ui-surface p-4">Invalid table number.</div>
      </Shell>
    );
  }

  // ---------- If URL DOES NOT have tableNo, show welcome (no invalid flash) ----------
  if (!urlHasTableNo) {
    return (
      <Shell title="Welcome" subtitle="Scan your table QR to begin">
        <div className="ui-surface p-4">
          Please scan your table QR to begin.
        </div>
      </Shell>
    );
  }

  // ---------- Main page ----------
  return (
    <div className="min-h-screen bg-[#244a38] text-white">
      <main className="max-w-5xl mx-auto px-4 py-4">
        {/* HERO IMAGE */}
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <div className="w-full h-full sm:h-56 md:h-64 lg:h-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/menu/saigo.jpg"
              alt="Restaurant ambiance"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Table # and hint (compact, under hero) */}
        <div className="mt-3 flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
            <span className="font-semibold">Table #{tableNo}</span>
          </div>
          <span className="text-white/85 text-sm">Choose your items</span>
        </div>

        {/* People counters */}
        <div className="mt-4 bg-[#244a38]/50 border border-white/10 rounded-xl p-4 backdrop-blur-md">
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
            {/* Adult Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-white/90">
                ADULT
              </label>

              <select
                ref={adultRef}
                className="w-full bg-transparent border border-white/30 text-white rounded-lg p-2 focus:border-white focus:ring-1 focus:ring-white/40 outline-none transition"
                value={adult}
                onChange={(e) => setAdult(Number(e.target.value))}
              >
                <option value={0}>Select</option>
                {[...Array(10)].map((_, i) => (
                  <option
                    key={i + 1}
                    value={i + 1}
                    className="bg-[#244a38] text-white "
                  >
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Barn 7–12 ÅR Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-white/90">
                BARN 7–12 ÅR
              </label>
              <select
                className="w-full bg-transparent border border-white/30 text-white rounded-lg p-2 focus:border-white focus:ring-1 focus:ring-white/40 outline-none transition"
                value={barn1}
                onChange={(e) => setBarn1(Number(e.target.value))}
              >
                <option value={0}>Select</option>
                {[...Array(10)].map((_, i) => (
                  <option
                    key={i + 1}
                    value={i + 1}
                    className="bg-[#244a38] text-white"
                  >
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Barn 4–6 ÅR Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-white/90">
                BARN 4–6 ÅR
              </label>
              <select
                className="w-full bg-transparent border border-white/30 text-white rounded-lg p-2 focus:border-white focus:ring-1 focus:ring-white/40 outline-none transition"
                value={barn2}
                onChange={(e) => setBarn2(Number(e.target.value))}
              >
                <option value={0}>Select</option>
                {[...Array(10)].map((_, i) => (
                  <option
                    key={i + 1}
                    value={i + 1}
                    className="bg-[#244a38] text-white"
                  >
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showPeopleError && (
            <p className="text-red-300 text-sm text-center mt-3 animate-fadeIn">
              Please select at least one person (Adult or Barn) to continue.
            </p>
          )}
        </div>

        {/* Category chips (NORMAL, non-sticky) */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((sec, i) => {
            const id = slugify(sec.category);
            const count = sectionCount(sec);
            return (
              <button
                key={id}
                className={`px-5 py-2 rounded-full whitespace-nowrap transition-colors ${
                  i === 0
                    ? 'bg-white text-[#244a38] font-semibold'
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
        <div className="mt-4 space-y-10 pb-28">
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

                {/* Horizontal row of cards */}
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {sec.items.map((it) => {
                    const qty = cart[it.id] || 0;
                    const img = it.image || `/menu/${it.id}.jpg`;
                    return (
                      <div
                        key={it.id}
                        className="min-w-[280px] bg-white/8 border border-white/10 rounded-2xl overflow-hidden flex-shrink-0"
                      >
                        {/* Consistent image box */}
                        {/* Image area (clickable) */}
                        <div
                          className="relative w-full aspect-[4/3] cursor-pointer"
                          onClick={() => setSelectedItem(it)} // 👈 new click handler
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={it.name}
                            className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Footer */}
                        <div className="px-3 h-16 flex items-center justify-between rounded-b-2xl border-t border-white/10 bg-white/6 backdrop-blur-md">
                          <div className="font-semibold truncate pr-3">
                            {it.name}
                          </div>

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
          <div className="bg-white text-[#244a38] rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="font-semibold">Items: {lines.length}</div>
            <div className="flex gap-3">
              <button
                className="px-5 py-2 rounded-2xl bg-[#102f29] text-white font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
                onClick={placeOrder}
                disabled={lines.length === 0 || placing}
              >
                {placing ? (
                  <>
                    <span className="spinner h-4 w-4" aria-hidden />
                    Placing…
                  </>
                ) : (
                  'Place Order'
                )}
              </button>

              <button
                className="btn1 liquid"
                onClick={completeOrder}
                style={{ fontWeight: 600, fontSize: '1rem' }}
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* === Image Preview Modal === */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-[90%] max-w-lg h-[75vh] flex flex-col animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[65%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedItem.image || `/menu/${selectedItem.id}.jpg`}
                alt={selectedItem.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-4 text-[#244a38] text-center flex flex-col justify-center">
              <h3 className="text-xl font-semibold mb-1">
                {selectedItem.name}
              </h3>
              {selectedItem.desc && (
                <p className="text-gray-600 text-sm mb-2">
                  {selectedItem.desc}
                </p>
              )}
              {typeof selectedItem.price === 'number' && (
                <p className="font-bold text-lg text-[#1d3f32]">
                  ₹{selectedItem.price}
                </p>
              )}
            </div>
          </div>

          <style jsx>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}

      {/* ===== Success Modal (after Place Order) ===== */}
      {showPlacedModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-[#244a38] rounded-2xl w-full max-w-md mx-4 p-5 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Order placed!</h3>
              <button
                aria-label="Close"
                onClick={() => setShowPlacedModal(false)}
                className="w-8 h-8 -mr-2 rounded-full text-[#244a38]/70 hover:bg-black/5"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-700 mt-1">
              We’ve added these items to your order for{' '}
              <span className="font-semibold">Table #{tableNo}</span>.
            </p>

            <ul className="mt-3 max-h-48 overflow-auto divide-y divide-gray-200/70">
              {(placedOrder?.items || []).map((it) => (
                <li
                  key={it.id}
                  className="py-2 flex items-center justify-between text-sm"
                >
                  <span className="truncate pr-2">{it.name}</span>
                  <span className="font-semibold">× {it.qty}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setShowPlacedModal(false)}
                className="px-4 py-2 rounded-xl bg-[#244a38] text-white font-semibold hover:bg-[#1d3f32] transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
