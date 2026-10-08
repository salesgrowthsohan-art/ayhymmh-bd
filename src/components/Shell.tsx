import { Link } from "@tanstack/react-router";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { CartSheet } from "./CartSheet";
import { ShoppingBag } from "lucide-react";
import { BdFlag, WhatsAppIcon } from "./BdFlag";

const UiContext = createContext<{ openCart: () => void }>({ openCart: () => {} });
export const useUi = () => useContext(UiContext);

function Header({ onCart }: { onCart: () => void }) {
  const { cartCount } = useStore();
  return (
    <header className="sticky top-0 z-40 glass border-b-2 border-ink">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="font-display text-xl font-bold tracking-tight sm:text-2xl">
          ayhymmh
        </Link>
        <BdFlag className="h-4 w-auto border border-ink" />
        <button
          onClick={onCart}
          aria-label={`Cart, ${cartCount} items`}
          className="brutal-sm press relative ml-auto rounded-full bg-brand px-3 py-2 text-sm font-bold text-ink"
        >
          <ShoppingBag className="inline-block" size={17} aria-hidden /> Cart
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full border-2 border-ink bg-pop px-1 text-xs font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t-2 border-ink bg-brand-wash">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm">
        <p className="flex items-center gap-2 font-display text-lg font-bold">
          ayhymmh <BdFlag className="h-3.5 w-auto border border-ink" />
        </p>
        <p className="mt-1 text-muted-foreground">
          1–2 day delivery in Dhaka · Payment: bKash or Cash on Delivery
        </p>
        <p className="mt-1 text-muted-foreground">Instagram · soon</p>
        <div className="mt-5 flex items-center gap-3">
          <Link
            to="/admin"
            className="rounded-full border-2 border-ink/20 px-3 py-1 text-xs text-muted-foreground hover:border-ink hover:text-ink"
          >
            Admin Login
          </Link>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppFab() {
  const { waLink } = useStore();
  return (
    <a
      href={waLink("Hi ayhymmh! I want to know about a product.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="brutal press fixed bottom-5 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-success text-success-foreground"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <UiContext.Provider value={{ openCart: () => setCartOpen(true) }}>
      <div className="flex min-h-screen flex-col">
        <Header onCart={() => setCartOpen(true)} />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFab />
        {cartOpen && <CartSheet onClose={() => setCartOpen(false)} />}
      </div>
    </UiContext.Provider>
  );
}
