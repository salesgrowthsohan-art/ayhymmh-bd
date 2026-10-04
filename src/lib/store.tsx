import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Category = "flag" | "keychain" | (string & {});

export type Product = {
  id: string;
  title: string;
  sku: string;
  price: number;
  images: string[];
  category: Category;
  description: string;
  inStock: boolean;
  /** Units in stock (admin-only, never shown as a raw number unless low). */
  stock?: number;
};

export type Settings = {
  whatsapp: string;
  deliveryCharge: number;
  adminPassword: string;
  categories: string[];
};

export type CartLine = { sku: string; qty: number };

const KEYS = {
  products: "cg.products.v1",
  cart: "cg.cart.v1",
  settings: "cg.settings.v1",
  admin: "cg.admin.v1",
};

export const DEFAULT_SETTINGS: Settings = {
  whatsapp: "01630871105",
  deliveryCharge: 60,
  adminPassword: "1240928",
  categories: ["flag", "keychain", "face mask", "miniature"],
};

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;

export const SEED_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Bangladesh Flag Keychain",
    sku: "KC-01",
    price: 120,
    images: [U("1588412079929-790b9f593d8e"), U("1606107557195-0e29a4b5b4aa")],
    category: "flag",
    description:
      "Metal base, enamel finish. A tiny red-green pride for your bag or keys.",
    inStock: true,
    stock: 12,
  },
  {
    id: "p2",
    title: "Argentina Flag Keychain",
    sku: "KC-02",
    price: 130,
    images: [U("1522778119026-d647f0596c20"), U("1526232761682-d26e03ac148e")],
    category: "flag",
    description: "Blue-white enamel flag charm with a stainless ring.",
    inStock: true,
    stock: 5,
  },
  {
    id: "p3",
    title: "Brazil Flag Keychain",
    sku: "KC-03",
    price: 130,
    images: [U("1526232761682-d26e03ac148e")],
    category: "flag",
    description: "Match day vibes. Light, durable, colours never fade.",
    inStock: false,
    stock: 0,
  },
  {
    id: "p4",
    title: "Cute Bear Charm",
    sku: "KC-04",
    price: 100,
    images: [U("1530325553146-1b0bfa00a1b4"), U("1591561954557-26941169b49e")],
    category: "keychain",
    description: "Soft plush teddy charm, perfect for bags.",
    inStock: true,
    stock: 20,
  },
  {
    id: "p5",
    title: "Minimal Leather Loop",
    sku: "KC-05",
    price: 150,
    images: [U("1511556532299-8f662fc26c06")],
    category: "keychain",
    description: "Genuine leather loop, brushed metal ring. Clean and durable.",
    inStock: true,
    stock: 3,
  },
  {
    id: "p6",
    title: "Heart Acrylic Keyring",
    sku: "KC-06",
    price: 110,
    images: [U("1549298916-b41d501d3772"), U("1530325553146-1b0bfa00a1b4")],
    category: "keychain",
    description: "Glossy acrylic heart in pink. A great gift.",
    inStock: true,
    stock: 15,
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

type StoreValue = {
  hydrated: boolean;
  products: Product[];
  settings: Settings;
  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  total: number;
  isAdmin: boolean;
  addToCart: (sku: string, qty?: number) => void;
  setQty: (sku: string, qty: number) => void;
  removeFromCart: (sku: string) => void;
  clearCart: () => void;
  saveProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  moveProduct: (id: string, direction: -1 | 1) => void;
  saveSettings: (s: Partial<Settings>) => void;
  login: (password: string) => boolean;
  logout: () => void;
  waLink: (message: string) => string;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setProducts(read(KEYS.products, SEED_PRODUCTS));
    setSettings({ ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) });
    setCart(read(KEYS.cart, [] as CartLine[]));
    setIsAdmin(read(KEYS.admin, false));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) write(KEYS.products, products);
  }, [products, hydrated]);
  useEffect(() => {
    if (hydrated) write(KEYS.settings, settings);
  }, [settings, hydrated]);
  useEffect(() => {
    if (hydrated) write(KEYS.cart, cart);
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) write(KEYS.admin, isAdmin);
  }, [isAdmin, hydrated]);

  const addToCart = useCallback((sku: string, qty = 1) => {
    setCart((c) => {
      const found = c.find((l) => l.sku === sku);
      if (found) return c.map((l) => (l.sku === sku ? { ...l, qty: l.qty + qty } : l));
      return [...c, { sku, qty }];
    });
  }, []);

  const setQty = useCallback((sku: string, qty: number) => {
    setCart((current) => {
      if (qty <= 0) return current.filter((line) => line.sku !== sku);
      if (current.some((line) => line.sku === sku)) {
        return current.map((line) => (line.sku === sku ? { ...line, qty } : line));
      }
      return [...current, { sku, qty }];
    });
  }, []);

  const value = useMemo<StoreValue>(() => {
    const priceOf = (sku: string) => products.find((p) => p.sku === sku)?.price ?? 0;
    const subtotal = cart.reduce((sum, l) => sum + priceOf(l.sku) * l.qty, 0);
    const cartCount = cart.reduce((sum, l) => sum + l.qty, 0);
    return {
      hydrated,
      products,
      settings,
      cart,
      cartCount,
      subtotal,
      total: subtotal + (cart.length ? settings.deliveryCharge : 0),
      isAdmin,
      addToCart,
      setQty,
      removeFromCart: (sku) => setCart((c) => c.filter((l) => l.sku !== sku)),
      clearCart: () => setCart([]),
      saveProduct: (p) =>
        setProducts((list) =>
          list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list],
        ),
      deleteProduct: (id) => setProducts((list) => list.filter((x) => x.id !== id)),
      moveProduct: (id, direction) =>
        setProducts((list) => {
          const from = list.findIndex((product) => product.id === id);
          const to = from + direction;
          if (from < 0 || to < 0 || to >= list.length) return list;
          const next = [...list];
          const moved = next[from];
          if (!moved) return list;
          next.splice(from, 1);
          next.splice(to, 0, moved);
          return next;
        }),
      saveSettings: (s) => setSettings((old) => ({ ...old, ...s })),
      login: (password) => {
        const ok = password === settings.adminPassword;
        if (ok) setIsAdmin(true);
        return ok;
      },
      logout: () => setIsAdmin(false),
      waLink: (message) => {
        const digits = settings.whatsapp.replace(/\D/g, "");
        const intl = digits.startsWith("88") ? digits : `88${digits.replace(/^0?/, "0")}`;
        return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
      },
    };
  }, [hydrated, products, settings, cart, isAdmin, addToCart, setQty]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const taka = (n: number) => `৳${n.toLocaleString("en-US")}`;

export const categoryLabel = (c: string) =>
  c.charAt(0).toUpperCase() + c.slice(1);


export const LOW_STOCK = 6;

/** Units available; undefined stock falls back to the inStock flag. */
export const unitsLeft = (p: Product) =>
  !p.inStock ? 0 : typeof p.stock === "number" ? Math.max(0, p.stock) : Infinity;

export const isAvailable = (p: Product) => unitsLeft(p) > 0;

export type StockStatus = "out" | "low" | "ok";
export const stockStatus = (p: Product): StockStatus => {
  const n = unitsLeft(p);
  return n <= 0 ? "out" : n <= LOW_STOCK ? "low" : "ok";
};
