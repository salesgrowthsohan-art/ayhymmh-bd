import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { categoryLabel, useStore, type Category } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ayhymmh — Premium Keychain & Flag Store Bangladesh" },
      {
        name: "description",
        content:
          "Flag keychain আর cute keychain stuff। bKash বা Cash on Delivery, Dhaka-তে ১–২ দিনে delivery।",
      },
      { property: "og:title", content: "ayhymmh — Premium Keychain & Flag Store" },
      {
        property: "og:description",
        content: "Flag ও keychain stuff — WhatsApp এ অর্ডার করুন, Dhaka-তে ১–২ দিনে delivery।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function tabsFor(categories: string[]): { key: Category | "all"; label: string }[] {
  return [
    { key: "all", label: "সব" },
    ...categories.map((c) => ({ key: c as Category, label: categoryLabel(c) })),
  ];
}

function Home() {
  const { products, settings, cart, addToCart, setQty, waLink } = useStore();
  const [tab, setTab] = useState<Category | "all">("all");
  const [q, setQ] = useState("");
  const TABS = useMemo(() => tabsFor(settings.categories), [settings.categories]);

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
  };

  return (
    <div className="mx-auto max-w-6xl overflow-hidden px-4">
      {/* Hero */}
      <section className="hero-wave rise relative mt-4 overflow-hidden border-4 border-ink bg-brand-wash sm:mt-6">
        {/* 2D marquee ticker */}
        <div aria-hidden className="overflow-hidden border-b-4 border-ink bg-ink py-1.5">
          <div className="marquee-track flex w-max">
            <span className="whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground">
              New stock arrived · Limited drop · bKash / COD · Dhaka-তে ১–২ দিনে delivery ·&nbsp;
            </span>
            <span className="whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground">
              New stock arrived · Limited drop · bKash / COD · Dhaka-তে ১–২ দিনে delivery ·&nbsp;
            </span>
          </div>
        </div>

        {/* Floating 2D stickers */}
        <div aria-hidden className="floaty absolute right-3 top-14 z-10">
          <div className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-pop text-lg shadow-[3px_3px_0_0_var(--ink)]">
            ✨
          </div>
        </div>
        <div aria-hidden className="floaty absolute bottom-3 right-3 z-10" style={{ animationDelay: "-2s" }}>
          <div className="grid h-11 w-11 rotate-12 place-items-center rounded-xl border-2 border-ink bg-signal shadow-[3px_3px_0_0_var(--ink)]">
            <span className="block h-3 w-3 rounded-full border-[3px] border-ink bg-card" />
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="grid items-end gap-5 sm:grid-cols-[1.5fr_0.7fr]">
            <div>
              <h1 className="text-4xl font-bold uppercase leading-[0.92] sm:text-6xl">
                Pick it.<br />Clip it.<br /><span className="text-brand">Make it yours.</span>
              </h1>
            </div>
            <div className="border-3 border-ink bg-ink p-4 text-primary-foreground shadow-[6px_6px_0_0_var(--brand)]">
              <p className="text-sm font-bold leading-relaxed">welcome to ayhymmh 😔🙏🏼</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="#collection"
            className="brutal press bg-brand px-4 py-2.5 text-sm font-bold"
          >
            Shop the drop →
          </a>
          <a
            href={waLink(
              "🔎 Follow up on my order\n\n👤 Name: \n📞 Phone: \n🧾 Order details: \n\n(উপরের তথ্যগুলো পূরণ করে পাঠান — আমরা status জানিয়ে দিচ্ছি।)",
            )}
            target="_blank"
            rel="noreferrer"
            className="brutal-sm press bg-card px-4 py-2.5 text-sm font-bold"
          >
            Follow up on my order
          </a>
        </div>
      </section>

      {/* Search + categories */}
      <section id="collection" className="mt-7 scroll-mt-20">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={60}
          placeholder="Search keychain বা flag…"
          aria-label="Search products"
          className="brutal-sm w-full bg-card px-4 py-3 text-sm outline-none focus:shadow-[4px_4px_0_0_var(--brand)]"
        />
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`brutal-sm press min-h-11 shrink-0 px-4 py-2 text-sm font-bold uppercase ${
                tab === t.key ? "bg-brand" : "bg-card"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="mt-6 grid grid-cols-1 gap-5 pb-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {list.map((p, index) => (
          <ProductCard
            key={p.id}
            product={p}
            onAdd={add}
            quantity={cart.find((line) => line.sku === p.sku)?.qty ?? 0}
            onSetQuantity={setQty}
            priority={index === 0}
          />
        ))}
      </section>
      {!list.length && (
        <p className="py-14 text-center text-sm text-muted-foreground">কিছু পাওয়া যায়নি 🥲</p>
      )}
    </div>
  );
}
