import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Minus, Plus, Sparkles } from "lucide-react";
import { ProductMedia } from "@/components/ProductMedia";
import { categoryLabel, isAvailable, stockStatus, taka, unitsLeft, type Product } from "@/lib/store";

export function ProductCard({
  product,
  onAdd,
  quantity,
  onSetQuantity,
  priority = false,
}: {
  product: Product;
  onAdd: (sku: string) => void;
  quantity: number;
  onSetQuantity: (sku: string, quantity: number) => void;
  priority?: boolean;
}) {
  const status = stockStatus(product);
  const available = isAvailable(product);
  return (
    <article data-stock-status={status} className="product-card rise flex min-w-0 flex-col overflow-hidden bg-card">
      <Link
        to="/product/$sku"
        params={{ sku: product.sku }}
        className="group relative block aspect-square overflow-hidden border-b-4 border-ink bg-muted"
      >
        <ProductMedia
          src={product.images[0]}
          alt={product.title}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
        />
        {status === "out" && (
          <span className="absolute left-2 top-2 border-2 border-ink bg-card px-2 py-1 text-[10px] font-bold uppercase">
            Stock out
          </span>
        )}
        {status === "low" && (
          <span className="absolute left-2 top-2 border-2 border-ink bg-tangerine px-2 py-1 text-[10px] font-bold uppercase">
            Only {unitsLeft(product)} left
          </span>
        )}
        {quantity > 0 && (
          <span className="quantity-badge absolute right-2 top-2 grid min-h-11 min-w-11 place-items-center border-2 border-ink bg-brand px-2 text-base font-bold" aria-label={`${quantity} in cart`}>
            ×{quantity}
          </span>
        )}
        <span className="absolute bottom-2 left-2 border-2 border-ink bg-mint px-2 py-1 text-[10px] font-bold uppercase">
          {categoryLabel(product.category)}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link to="/product/$sku" params={{ sku: product.sku }} className="line-clamp-2 min-h-10 text-sm font-bold leading-snug sm:text-base">
          {product.title}
        </Link>
        <div className="mt-2 flex items-center justify-end gap-2">
          <p className="font-display text-lg font-bold">{taka(product.price)}</p>
        </div>

        <div className="mt-3 grid grid-cols-[44px_1fr_44px] items-center border-2 border-ink bg-background" aria-label="Quantity selector">
          <button
            type="button"
            aria-label={`Decrease ${product.title}`}
            disabled={!available || quantity === 0}
            onClick={() => onSetQuantity(product.sku, quantity - 1)}
            className="grid h-11 place-items-center border-r-2 border-ink transition-colors hover:bg-ink hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Minus size={17} strokeWidth={3} />
          </button>
          <span className="text-center text-sm font-bold">{quantity || 0} selected</span>
          <button
            type="button"
            aria-label={`Increase ${product.title}`}
            disabled={!available || quantity >= unitsLeft(product)}
            onClick={() => onSetQuantity(product.sku, quantity + 1)}
            className="grid h-11 place-items-center border-l-2 border-ink transition-colors hover:bg-ink hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus size={17} strokeWidth={3} />
          </button>
        </div>
        <button
          disabled={!available || quantity >= unitsLeft(product)}
          onClick={() => onAdd(product.sku)}
          className="cart-cta press mt-3 flex min-h-12 items-center justify-between gap-2 border-2 border-ink bg-brand px-3 text-sm font-bold uppercase disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          <span className="flex items-center gap-2"><Sparkles size={17} aria-hidden />{available ? "Add to Cart" : "Stock out"}</span>
          {available && <ArrowUpRight size={21} strokeWidth={3} aria-hidden />}
        </button>
      </div>
    </article>
  );
}
