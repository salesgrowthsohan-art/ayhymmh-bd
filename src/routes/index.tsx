import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useUi } from "@/components/Shell";
import { useStore, type Category } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "চাবির গোছা — Cute Keychain Store in Bangladesh" },
      {
        name: "description",
        content:
          "Flag keychain আর cute keychain stuff, ৳100 থেকে। Free delivery badge, bKash বা Cash on Delivery, Dhaka-তে ১–২ দিনে delivery।",
      },
      { property: "og:title", content: "চাবির গোছা — Cute Keychain Store" },
      {
        property: "og:description",
        content: "Flag ও keychain stuff — WhatsApp এ অর্ডার করুন, Dhaka-তে ১–২ দিনে delivery।",
      },
    ],
  }),
  component: Home,
});

const TABS: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "সব" },
  { key: "flag", label: "Flag" },
  { key: "keychain", label: "Keychain stuff" },
];

function Home() {
  const { products, addToCart, waLink } = useStore();
  const { openCart } = useUi();
  const [tab, setTab] = useState<Category | "all">("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (tab === "all" || p.category === tab) &&
        (!needle ||
          p.title.toLowerCase().includes(needle) ||
          p.sku.toLowerCase().includes(needle)),
    );
  }, [products, tab, q]);

  const add = (sku: string) => {
    addToCart(sku);
    openCart();
  };

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="rise brutal-pink mt-5 rounded-3xl bg-brand-wash p-5 sm:p-8">
        <p className="inline-block rounded-full border-2 border-ink bg-white px-2.5 py-0.5 text-[11px] font-bold">
          Free delivery on select items 🩷
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">
          চাবির গোছা — ছোট্ট জিনিস,
          <br />
          বড় vibe.
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          Flag keychain আর cute keychain stuff — ৳100 থেকে শুরু। Dhaka-তে ১–২ দিনের delivery,
          bKash বা Cash on Delivery।
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="#collection"
            className="brutal press rounded-2xl bg-brand px-4 py-2.5 text-sm font-bold"
          >
            Collection দেখুন
          </a>
          <a
            href={waLink(
              "🔎 Follow up on my order\n\n👤 Name: \n📞 Phone: \n🧾 Order details: \n\n(উপরের তথ্যগুলো পূরণ করে পাঠান — আমরা status জানিয়ে দিচ্ছি।)",
            )}
            target="_blank"
            rel="noreferrer"
            className="brutal-sm press rounded-2xl bg-white px-4 py-2.5 text-sm font-bold"
          >
            Follow up on my order
          </a>
        </div>
      </section>

      {/* Search + categories */}
      <section id="collection" className="mt-8 scroll-mt-20">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={60}
          placeholder="Search keychain বা SKU…"
          aria-label="Search products"
          className="brutal-sm w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none focus:shadow-[3px_3px_0_0_var(--brand)]"
        />
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`brutal-sm press shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                tab === t.key ? "bg-brand" : "bg-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={add} />
        ))}
      </section>
      {!list.length && (
        <p className="py-14 text-center text-sm text-muted-foreground">কিছু পাওয়া যায়নি 🥲</p>
      )}
    </div>
  );
}
