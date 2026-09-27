import { createFileRoute, Link } from "@tanstack/react-router";
import { useUi } from "@/components/Shell";
import { taka, useStore } from "@/lib/store";

export const Route = createFileRoute("/product/$sku")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.sku} — চাবির গোছা Keychain` },
      {
        name: "description",
        content: `Keychain ${params.sku} — দাম, stock status আর delivery তথ্য। WhatsApp এ সরাসরি অর্ডার করুন।`,
      },
      { property: "og:title", content: `${params.sku} — চাবির গোছা` },
      {
        property: "og:description",
        content: "Cute keychain, Dhaka-তে ১–২ দিনে delivery, bKash বা Cash on Delivery।",
      },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { sku } = Route.useParams();
  const { products, addToCart, waLink, hydrated } = useStore();
  const { openCart } = useUi();
  const product = products.find((p) => p.sku === sku);

  if (!product) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="font-display text-xl font-bold">
          {hydrated ? "প্রোডাক্টটি পাওয়া যায়নি" : "লোড হচ্ছে…"}
        </p>
        <Link to="/" className="brutal-sm press mt-5 inline-block rounded-2xl bg-brand px-4 py-2 font-bold">
          সব keychain দেখুন
        </Link>
      </div>
    );
  }

  const orderNow = () => {
    const msg = [
      "🛍️ New Order from Website",
      "",
      `1. ${product.title} (${product.sku}) × 1 — ${taka(product.price)}`,
      "",
      "👤 Name: ",
      "📞 Phone: ",
      "📍 Address: ",
      "",
      "Payment: bKash / Cash on Delivery",
    ].join("\n");
    window.open(waLink(msg), "_blank", "noopener");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-5">
      <Link to="/" className="text-sm font-semibold underline">
        ← সব keychain
      </Link>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <div className="no-scrollbar brutal flex snap-x snap-mandatory gap-0 overflow-x-auto rounded-3xl bg-white">
            {product.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${product.title} — ছবি ${i + 1}`}
                className="aspect-square w-full shrink-0 snap-center object-cover"
              />
            ))}
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-muted-foreground">
            👉 Swipe the pics
          </p>
        </div>

        <div className="rise">
          <span className="rounded-full border-2 border-ink bg-brand-soft px-2 py-0.5 text-[11px] font-bold capitalize">
            {product.category}
          </span>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{product.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.sku}</p>
          <p className="mt-3 font-display text-3xl font-bold">{taka(product.price)}</p>
          <p className={`mt-1 text-sm font-bold ${product.inStock ? "text-[oklch(0.55_0.15_150)]" : "text-destructive"}`}>
            {product.inStock ? "✅ In stock" : "❌ Stock out"}
          </p>

          <p className="mt-4 text-sm leading-relaxed">{product.description}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            <span className="brutal-sm rounded-full bg-brand-wash px-3 py-1">🚚 Free delivery</span>
            <span className="brutal-sm rounded-full bg-white px-3 py-1">bKash / Cash on Delivery</span>
            <span className="brutal-sm rounded-full bg-white px-3 py-1">Dhaka-তে ১–২ দিন</span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={orderNow}
              disabled={!product.inStock}
              className="brutal press flex-1 rounded-2xl bg-brand px-4 py-3 font-display font-bold disabled:bg-muted disabled:text-muted-foreground"
            >
              Order Now (WhatsApp)
            </button>
            <button
              onClick={() => {
                addToCart(product.sku);
                openCart();
              }}
              disabled={!product.inStock}
              className="brutal-sm press flex-1 rounded-2xl bg-white px-4 py-3 font-bold disabled:text-muted-foreground"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
