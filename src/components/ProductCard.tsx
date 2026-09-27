import { Link } from "@tanstack/react-router";
import { taka, type Product } from "@/lib/store";

export function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (sku: string) => void;
}) {
  return (
    <article className="brutal press flex flex-col overflow-hidden rounded-2xl bg-white">
      <Link
        to="/product/$sku"
        params={{ sku: product.sku }}
        className="relative block aspect-square overflow-hidden border-b-2 border-ink"
      >
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {!product.inStock && (
          <span className="absolute left-2 top-2 rounded-full border-2 border-ink bg-white px-2 py-0.5 text-[10px] font-bold">
            Stock out
          </span>
        )}
        <span className="absolute right-2 top-2 rounded-full border-2 border-ink bg-brand-soft px-2 py-0.5 text-[10px] font-bold capitalize">
          {product.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <Link to="/product/$sku" params={{ sku: product.sku }} className="text-sm font-bold leading-snug">
          {product.title}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">{product.sku}</p>
        <p className="mt-2 font-display text-lg font-bold">{taka(product.price)}</p>
        <button
          disabled={!product.inStock}
          onClick={() => onAdd(product.sku)}
          className="brutal-sm press mt-3 rounded-xl bg-brand px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {product.inStock ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </article>
  );
}
