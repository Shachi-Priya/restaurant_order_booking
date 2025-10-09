import useSWR from "swr";
const fetcher = (u) => fetch(u).then(r => r.json());

export default function SupportList() {
  const { data } = useSWR("/api/orderHandler", fetcher, { refreshInterval: 4000 });
  const orders = data?.orders || [];

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o._id} className="bg-white border rounded-2xl p-4 shadow-soft">
          <div className="flex justify-between">
            <div className="font-semibold">Table #{o.tableNo}</div>
            <div className="text-sm opacity-70">{new Date(o.createdAt).toLocaleString()}</div>
          </div>
          <ul className="text-sm mt-2">
            {o.items.map((it, i) => (
              <li key={i} className="flex justify-between">
                <span>{it.name} × {it.qty}</span>
                <span>₹{(it.price || 0) * it.qty}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 font-semibold">Total: ₹{o.total} | Payable: ₹{o.payable}</div>
          <div className="text-xs opacity-70">Status: {o.status}</div>
        </div>
      ))}
      {orders.length === 0 && <div className="opacity-70">No orders yet.</div>}
    </div>
  );
}
