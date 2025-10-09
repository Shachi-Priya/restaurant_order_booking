export default async function handler(req, res) {
  const BASE = process.env.SERVER_BASE_URL || "http://localhost:8000";

  try {
    if (req.method === "POST") {
      const response = await fetch(`${BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    if (req.method === "GET") {
      const { tableNo, orderId } = req.query;

      if (tableNo) {
        const r = await fetch(`${BASE}/api/orders/${tableNo}`);
        const data = await r.json();
        return res.status(r.status).json(data);
      }

      // Fetch all, optionally filter by orderId for the placed page
      const r = await fetch(`${BASE}/api/orders`);
      const data = await r.json();
      if (orderId && data?.orders) {
        const found = data.orders.find(o => String(o._id) === String(orderId));
        return res.status(200).json({ success: true, order: found || null });
      }
      return res.status(r.status).json(data);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("Next handler error:", err);
    return res.status(500).json({ message: "Proxy error", error: err.message });
  }
}
