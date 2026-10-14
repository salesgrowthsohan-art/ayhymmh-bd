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
  stock?: number | undefined;
  /** Allow ordering while out of stock. */
  preOrder?: boolean | undefined;
};

export type Settings = {
  whatsapp: string;
  /** Delivery fee inside Dhaka. */
  deliveryCharge: number;
  /** Delivery fee outside Dhaka. */
  outsideDeliveryCharge: number;
  categories: string[];
};

export type CartLine = { sku: string; qty: number };

const KEYS = {
  products: "cg.products.v1",
  cart: "cg.cart.v1",
  settings: "cg.settings.v1",
};

export const DEFAULT_SETTINGS: Settings = {
  whatsapp: "01630871105",
  deliveryCharge: 60,
  outsideDeliveryCharge: 120,
  categories: ["flag", "keychain", "face mask", "miniature"],
};

const U = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;

export const SEED_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Bangladesh Flag Keychain",
    sku: "KC-01",
    price: 120,
    images: [U("1588412079929-790b9f593d8e"), U("1606107557195-0e29a4b5b4aa")],
    category: "flag",
    description: "Metal base, enamel finish. A tiny red-green pride for your bag or keys.",
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
    images: [U("1591561954557-26941169b49e"), U("1591561954557-26941169b49e")],
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
    images: [U("1549298916-b41d501d3772"), U("1591561954557-26941169b49e")],
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
  apiToken: string;
  sharedCatalog: boolean;
  catalogWriteError: string;
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
  login: (password: string) => Promise<boolean>;
  changeAdminPassword: (newPassword: string) => Promise<boolean>;
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
  const [apiToken, setApiToken] = useState("");
  const [sharedCatalog, setSharedCatalog] = useState(false);
  const [catalogWriteError, setCatalogWriteError] = useState("");

  useEffect(() => {
    setProducts(read(KEYS.products, SEED_PRODUCTS));
    const savedSettings = read<Partial<Settings> & { adminPassword?: string }>(KEYS.settings, {});
    delete savedSettings.adminPassword;
    setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
    setCart(read(KEYS.cart, [] as CartLine[]));
    setHydrated(true);
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { products?: Product[] };
        if (!active || !Array.isArray(payload.products)) return;
        setSharedCatalog(true);
        if (payload.products.length) setProducts(payload.products);
      } catch {
        // Keep the current browser catalog usable when shared storage is offline or unconfigured.
      }
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (hydrated) write(KEYS.products, products);
  }, [products, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    const refreshSettings = async () => {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { settings?: Partial<Settings> };
        if (!active || !payload.settings) return;
        setSettings((current) => ({
          ...current,
          ...payload.settings,
        }));
      } catch {
        // Continue using settings saved on this device when shared storage is unavailable.
      }
    };
    void refreshSettings();
    const interval = window.setInterval(() => void refreshSettings(), 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [hydrated]);
  useEffect(() => {
    if (hydrated) write(KEYS.settings, settings);
  }, [settings, hydrated]);
  useEffect(() => {
    if (hydrated) write(KEYS.cart, cart);
  }, [cart, hydrated]);
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
      apiToken,
      sharedCatalog,
      catalogWriteError,
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
      saveProduct: (p) => {
        const next = products.some((x) => x.id === p.id)
          ? products.map((x) => (x.id === p.id ? p : x))
          : [p, ...products];
        setProducts(next);
        if (apiToken)
          void fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiToken}` },
            body: JSON.stringify({ product: p }),
          })
            .then(async (response) => {
              if (response.ok) return setCatalogWriteError("");
              const payload = (await response.json().catch(() => ({}))) as { error?: string };
              setCatalogWriteError(
                payload.error || "Product could not be synchronized to shared storage.",
              );
            })
            .catch(() =>
              setCatalogWriteError("Product could not be synchronized to shared storage."),
            );
      },
      deleteProduct: (id) => {
        setProducts(products.filter((x) => x.id !== id));
        if (apiToken)
          void fetch(`/api/products?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${apiToken}` },
          })
            .then(async (response) => {
              if (response.ok) return setCatalogWriteError("");
              const payload = (await response.json().catch(() => ({}))) as { error?: string };
              setCatalogWriteError(
                payload.error || "Product could not be synchronized to shared storage.",
              );
            })
            .catch(() =>
              setCatalogWriteError("Product could not be synchronized to shared storage."),
            );
      },
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
          if (apiToken)
            void fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiToken}` },
              body: JSON.stringify({ products: next }),
            })
              .then(async (response) => {
                if (response.ok) return setCatalogWriteError("");
                const payload = (await response.json().catch(() => ({}))) as { error?: string };
                setCatalogWriteError(payload.error || "Product order could not be synchronized.");
              })
              .catch(() => setCatalogWriteError("Product order could not be synchronized."));
          return next;
        }),
      saveSettings: (s) => {
        const next = { ...settings, ...s };
        setSettings(next);
        if (!apiToken) return;
        void fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiToken}` },
          body: JSON.stringify({
            settings: {
              whatsapp: next.whatsapp,
              deliveryCharge: next.deliveryCharge,
              outsideDeliveryCharge: next.outsideDeliveryCharge,
              categories: next.categories,
            },
          }),
        })
          .then(async (response) => {
            if (response.ok) return setCatalogWriteError("");
            const payload = (await response.json().catch(() => ({}))) as { error?: string };
            setCatalogWriteError(payload.error || "Store settings could not be synchronized.");
          })
          .catch(() => setCatalogWriteError("Store settings could not be synchronized."));
      },
      login: async (password) => {
        try {
          const response = await fetch("/api/admin-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });
          if (!response.ok) return false;
          setIsAdmin(true);
          setApiToken(password);
          return true;
        } catch {
          return false;
        }
      },
      changeAdminPassword: async (newPassword) => {
        if (!apiToken) return false;
        try {
          const response = await fetch("/api/admin-password", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({ newPassword }),
          });
          if (!response.ok) return false;
          setApiToken(newPassword);
          return true;
        } catch {
          return false;
        }
      },
      logout: () => {
        setIsAdmin(false);
        setApiToken("");
      },
      waLink: (message) => {
        const digits = settings.whatsapp.replace(/\D/g, "");
        const intl = digits.startsWith("88") ? digits : `88${digits.replace(/^0?/, "0")}`;
        return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
      },
    };
  }, [
    hydrated,
    products,
    settings,
    cart,
    isAdmin,
    apiToken,
    sharedCatalog,
    catalogWriteError,
    addToCart,
    setQty,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const taka = (n: number) => `৳${n.toLocaleString("en-US")}`;

export const categoryLabel = (c: string) => c.charAt(0).toUpperCase() + c.slice(1);

export const LOW_STOCK = 6;

/** Units available; undefined stock falls back to the inStock flag. */
export const unitsLeft = (p: Product) =>
  !p.inStock ? 0 : typeof p.stock === "number" ? Math.max(0, p.stock) : Infinity;

export const isAvailable = (p: Product) => unitsLeft(p) > 0;

/** True when the product is out of stock but accepts pre-orders. */
export const isPreOrder = (p: Product) => !isAvailable(p) && !!p.preOrder;
export const canOrder = (p: Product) => isAvailable(p) || !!p.preOrder;
/** Max units a customer may add (pre-orders are capped at 20). */
export const maxQty = (p: Product) => (isAvailable(p) ? unitsLeft(p) : p.preOrder ? 20 : 0);
export const lineTitle = (p: Product) => (isPreOrder(p) ? `${p.title} (Pre-order)` : p.title);

export type StockStatus = "out" | "low" | "ok";
export const stockStatus = (p: Product): StockStatus => {
  const n = unitsLeft(p);
  return n <= 0 ? "out" : n <= LOW_STOCK ? "low" : "ok";
};
