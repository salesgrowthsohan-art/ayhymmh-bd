import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { taka, useStore, type Category, type Product } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — চাবির গোছা" },
      { name: "description", content: "চাবির গোছা স্টোরের প্রোডাক্ট ও সেটিংস ম্যানেজমেন্ট।" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — চাবির গোছা" },
      { property: "og:description", content: "Store admin panel." },
    ],
  }),
  component: Admin,
});

const field =
  "mt-1 w-full rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_0_var(--brand)]";
const card = "brutal rounded-3xl bg-white p-4 sm:p-5";

const blank = (): Product => ({
  id: `p${Date.now()}`,
  title: "",
  sku: "",
  price: 100,
  images: [],
  category: "keychain",
  description: "",
  inStock: true,
});

function Admin() {
  const { isAdmin, login, logout } = useStore();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!login(pw)) setErr("ভুল পাসওয়ার্ড");
          }}
          className={card}
        >
          <h1 className="font-display text-xl font-bold">Admin Login</h1>
          <label className="mt-4 block text-sm font-semibold">
            পাসওয়ার্ড
            <input
              type="password"
              className={field}
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setErr("");
              }}
            />
          </label>
          {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
          <button className="brutal-sm press mt-4 w-full rounded-2xl bg-brand px-4 py-2.5 font-bold">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
        <button onClick={logout} className="brutal-sm press rounded-full bg-white px-3 py-1.5 text-sm font-bold">
          Logout
        </button>
      </div>
      <ProductManager />
      <StoreSettings />
    </div>
  );
}

function ProductManager() {
  const { products, saveProduct, deleteProduct } = useStore();
  const [draft, setDraft] = useState<Product | null>(null);
  const [imgText, setImgText] = useState("");

  const edit = (p: Product) => {
    setDraft({ ...p });
    setImgText(p.images.join("\n"));
  };
  const startNew = () => {
    setDraft(blank());
    setImgText("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const images = imgText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!draft.title.trim() || !draft.sku.trim() || !images.length) return;
    saveProduct({
      ...draft,
      title: draft.title.trim(),
      sku: draft.sku.trim().toUpperCase(),
      price: Math.max(0, Number(draft.price) || 0),
      images,
    });
    setDraft(null);
  };

  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Product Manager</h2>
        <button onClick={startNew} className="brutal-sm press rounded-full bg-brand px-3 py-1.5 text-sm font-bold">
          + Add product
        </button>
      </div>

      {draft && (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl border-2 border-dashed border-ink/40 p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Title *
              <input
                className={field}
                value={draft.title}
                maxLength={80}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label className="block text-sm font-semibold">
              SKU *
              <input
                className={field}
                value={draft.sku}
                maxLength={16}
                placeholder="KC-07"
                onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
              />
            </label>
            <label className="block text-sm font-semibold">
              Price (৳) *
              <input
                type="number"
                min={0}
                className={field}
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
              />
            </label>
            <label className="block text-sm font-semibold">
              Category *
              <select
                className={field}
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}
              >
                <option value="flag">Flag</option>
                <option value="keychain">Keychain stuff</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Image URLs * (এক লাইনে একটি)
            <textarea
              className={field}
              rows={3}
              value={imgText}
              onChange={(e) => setImgText(e.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold">
            Description
            <textarea
              className={field}
              rows={3}
              maxLength={600}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={draft.inStock}
              onChange={(e) => setDraft({ ...draft, inStock: e.target.checked })}
            />
            In stock
          </label>
          <div className="flex gap-2">
            <button className="brutal-sm press rounded-2xl bg-brand px-4 py-2 font-bold">Save</button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="brutal-sm press rounded-2xl bg-white px-4 py-2 font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="mt-4 space-y-2">
        {products.map((p) => (
          <li key={p.id} className="brutal-sm flex items-center gap-3 rounded-2xl bg-brand-wash p-2">
            <img src={p.images[0]} alt="" className="h-12 w-12 rounded-xl border-2 border-ink object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{p.title}</p>
              <p className="text-xs text-muted-foreground">
                {p.sku} · {taka(p.price)} · {p.category} · {p.inStock ? "in stock" : "stock out"}
              </p>
            </div>
            <button onClick={() => edit(p)} className="text-xs font-bold underline">
              Edit
            </button>
            <button
              onClick={() => deleteProduct(p.id)}
              className="text-xs font-bold text-destructive underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StoreSettings() {
  const { settings, saveSettings } = useStore();
  const [wa, setWa] = useState(settings.whatsapp);
  const [fee, setFee] = useState(String(settings.deliveryCharge));
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");

  return (
    <section className={card}>
      <h2 className="font-display text-lg font-bold">Store Settings</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          WhatsApp number
          <input className={field} value={wa} maxLength={15} onChange={(e) => setWa(e.target.value)} />
        </label>
        <label className="block text-sm font-semibold">
          Flat delivery charge (৳)
          <input
            type="number"
            min={0}
            className={field}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
        </label>
      </div>
      <button
        onClick={() => {
          saveSettings({
            whatsapp: wa.trim() || settings.whatsapp,
            deliveryCharge: Math.max(0, Number(fee) || 0),
          });
          setMsg("সেভ হয়েছে ✅");
        }}
        className="brutal-sm press mt-3 rounded-2xl bg-brand px-4 py-2 font-bold"
      >
        Save settings
      </button>

      <div className="mt-6 border-t-2 border-dashed border-ink/30 pt-4">
        <h3 className="text-sm font-bold">Change admin password</h3>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            নতুন পাসওয়ার্ড
            <input type="password" className={field} value={pw1} onChange={(e) => setPw1(e.target.value)} />
          </label>
          <label className="block text-sm font-semibold">
            আবার লিখুন
            <input type="password" className={field} value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </label>
        </div>
        <button
          onClick={() => {
            if (pw1.length < 4) return setMsg("পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে");
            if (pw1 !== pw2) return setMsg("দুটো পাসওয়ার্ড মেলেনি");
            saveSettings({ adminPassword: pw1 });
            setPw1("");
            setPw2("");
            setMsg("পাসওয়ার্ড বদলানো হয়েছে ✅");
          }}
          className="brutal-sm press mt-3 rounded-2xl bg-white px-4 py-2 font-bold"
        >
          Update password
        </button>
      </div>
      {msg && <p className="mt-3 text-sm font-semibold">{msg}</p>}
    </section>
  );
}
