import { createFileRoute, Link } from "@tanstack/react-router";
import { useUi } from "@/components/Shell";
import { ProductMedia } from "@/components/ProductMedia";
import { categoryLabel, isAvailable, stockStatus, taka, unitsLeft, useStore } from "@/lib/store";

export const Route = createFileRoute("/product/$sku")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.sku} — ayhymmh Keychain & Flag` },
      {
        name: "description",
        content: `Keychain ${params.sku} — price, availability and delivery info. Order directly on WhatsApp.`,
      },
      { property: "og:title", content: `${params.sku} — ayhymmh` },
      {
        property: "og:description",
        content: "Cute keychain, 1–2 day delivery in Dhaka, bKash or Cash on Delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { sku } = Route.useParams();
  const { products, settings, addToCart, waLink, hydrated } = useStore();
  const { openCart } = useUi();
  const product = products.find((p) => p.sku === sku);

  if (!product) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="font-display text-xl font-bold">
          {hydrated ? "Product not found" : "Loading…"}
        </p>
        <Link to="/" className="brutal-sm press mt-5 inline-block rounded-2xl bg-brand px-4 py-2 font-bold">
          See all products
        </Link>
      </div>
    );
  }

  const status = stockStatus(product);
  const available = isAvailable(product);

  const orderNow = () => {
    const delivery = settings.deliveryCharge;
    const msg = [
      "🛍️ New Order from Website",
      "",
      `1. ${product.title} × 1 — ${taka(product.price)}`,
      "",
      `Subtotal: ${taka(product.price)}`,
      `Delivery: ${delivery > 0 ? taka(delivery) : "Free"}`,
      `Total (incl. delivery): ${taka(product.price + delivery)}`,
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
        ← All products
      </Link>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <div className="no-scrollbar brutal flex snap-x snap-mandatory gap-0 overflow-x-auto rounded-3xl bg-white">
            {product.images.map((src, i) => (
              <ProductMedia
                key={i}
                src={src}
                alt={`${product.title} — photo ${i + 1}`}
                className="aspect-square w-full shrink-0 snap-center object-cover"
                controls
              />
            ))}
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-muted-foreground">
            👉 Swipe the pics
          </p>
        </div>

        <div className="rise">
          <span className="rounded-full border-2 border-ink bg-brand-soft px-2 py-0.5 text-[11px] font-bold capitalize">
            {categoryLabel(product.category)}
          </span>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{product.title}</h1>
          <p className="mt-3 font-display text-3xl font-bold">{taka(product.price)}</p>
          <p className={`mt-1 text-sm font-bold ${status === "out" ? "text-destructive" : "text-success"}`}>
            {status === "out" ? "Stock out" : status === "low" ? `Hurry — only ${unitsLeft(product)} left` : "In stock"}
          </p>

          <p className="mt-4 text-sm leading-relaxed">{product.description}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            <span className="brutal-sm rounded-full bg-lilac px-3 py-1">bKash / Cash on Delivery</span>
            <span className="brutal-sm rounded-full bg-white px-3 py-1">Dhaka 1–2 days</span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={orderNow}
              disabled={!available}
              className="brutal press flex-1 rounded-2xl bg-brand px-4 py-3 font-display font-bold disabled:bg-muted disabled:text-muted-foreground"
            >
              Order Now (WhatsApp)
            </button>
            <button
              onClick={() => {
                addToCart(product.sku);
                openCart();
              }}
              disabled={!available}
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
