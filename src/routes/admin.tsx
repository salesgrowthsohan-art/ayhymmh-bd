import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Home, ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { ProductMedia } from "@/components/ProductMedia";
import { taka, useStore, type Category, type Product } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — ayhymmh" },
      { name: "description", content: "ayhymmh স্টোরের প্রোডাক্ট ও সেটিংস ম্যানেজমেন্ট।" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — ayhymmh" },
      { property: "og:description", content: "Store admin panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
        <Link
          to="/"
          className="brutal-sm press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 font-bold"
        >
          <Home size={18} aria-hidden /> হোমে ফিরে যান
        </Link>
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
  const { products, saveProduct, deleteProduct, moveProduct } = useStore();
  const [draft, setDraft] = useState<Product | null>(null);
  const [imgText, setImgText] = useState("");
  const [mediaError, setMediaError] = useState("");
  const mediaInput = useRef<HTMLInputElement>(null);

  const edit = (p: Product) => {
    setDraft({ ...p });
    setImgText(p.images.join("\n"));
  };
  const startNew = () => {
    setDraft(blank());
    setImgText("");
  };

  const addMediaFiles = async (files: FileList | null) => {
    if (!files) return;
    setMediaError("");
    const selected = Array.from(files).slice(0, 4);
    const totalSize = selected.reduce((sum, file) => sum + file.size, 0);
    if (selected.some((file) => file.size > 800_000) || totalSize > 1_800_000) {
      setMediaError("প্রতি file 800KB এবং সব মিলিয়ে 1.8MB-এর মধ্যে রাখুন, তাহলে স্টোর দ্রুত থাকবে।");
      return;
    }
    const encoded = await Promise.all(
      selected.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result ?? ""));
            reader.onerror = () => reject(new Error("Media read failed"));
            reader.readAsDataURL(file);
          }),
      ),
    );
    setImgText((current) => [current.trim(), ...encoded].filter(Boolean).join("\n"));
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
                <option value="keychain">Keychain</option>
                <option value="flag">Flag</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Product ছবি / ভিডিও *
            <textarea
              className={field}
              rows={3}
              value={imgText}
              onChange={(e) => setImgText(e.target.value)}
              placeholder="Media URL দিন, অথবা নিচ থেকে upload করুন"
            />
          </label>
          <input
            ref={mediaInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            multiple
            className="sr-only"
            onChange={(event) => void addMediaFiles(event.target.files)}
          />
          <button
            type="button"
            onClick={() => mediaInput.current?.click()}
            className="brutal-sm press flex min-h-11 items-center gap-2 bg-card px-3 py-2 text-sm font-bold"
          >
            <ImagePlus size={18} aria-hidden /> ছবি / ভিডিও Upload
          </button>
          <p className="text-xs text-muted-foreground">সর্বোচ্চ ৪টি, সব মিলিয়ে 1.8MB। প্রথম media-টি product cover হবে।</p>
          {mediaError && <p className="text-xs font-semibold text-destructive">{mediaError}</p>}
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
        {products.map((p, index) => (
          <li key={p.id} className="brutal-sm flex items-center gap-3 rounded-2xl bg-brand-wash p-2">
            <ProductMedia src={p.images[0]} alt={p.title} className="h-12 w-12 rounded-xl border-2 border-ink object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{p.title}</p>
              <p className="text-xs text-muted-foreground">
                {p.sku} · {taka(p.price)} · {p.category} · {p.inStock ? "in stock" : "stock out"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button type="button" disabled={index === 0} aria-label={`${p.title} উপরে নিন`} onClick={() => moveProduct(p.id, -1)} className="grid h-7 w-7 place-items-center border-2 border-ink bg-card disabled:opacity-25">
                <ChevronUp size={15} />
              </button>
              <button type="button" disabled={index === products.length - 1} aria-label={`${p.title} নিচে নিন`} onClick={() => moveProduct(p.id, 1)} className="grid h-7 w-7 place-items-center border-2 border-ink bg-card disabled:opacity-25">
                <ChevronDown size={15} />
              </button>
            </div>
            <button onClick={() => edit(p)} className="text-xs font-bold underline">
              Edit
            </button>
            <button
              onClick={() => deleteProduct(p.id)}
              aria-label={`${p.title} delete করুন`}
              className="grid h-9 w-9 place-items-center text-destructive"
            >
              <Trash2 size={18} />
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
  const [freeDelivery, setFreeDelivery] = useState(settings.deliveryCharge === 0);
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
            disabled={freeDelivery}
            onChange={(e) => setFee(e.target.value)}
          />
        </label>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={freeDelivery}
          onChange={(e) => setFreeDelivery(e.target.checked)}
        />
        Free home delivery চালু করুন (delivery charge ৳0 হবে)
      </label>
      <button
        onClick={() => {
          saveSettings({
            whatsapp: wa.trim() || settings.whatsapp,
            deliveryCharge: freeDelivery ? 0 : Math.max(0, Number(fee) || 0),
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
