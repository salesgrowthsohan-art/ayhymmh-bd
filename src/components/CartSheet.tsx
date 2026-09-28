import { useState } from "react";
import { ProductMedia } from "@/components/ProductMedia";
import { taka, useStore } from "@/lib/store";

type Form = { name: string; phone: string; address: string };

export function CartSheet({ onClose }: { onClose: () => void }) {
  const { cart, products, settings, subtotal, total, setQty, removeFromCart, waLink } = useStore();
  const [form, setForm] = useState<Form>({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Partial<Form>>({});

  const lines = cart.flatMap((l) => {
    const p = products.find((x) => x.sku === l.sku);
    return p ? [{ ...l, product: p }] : [];
  });

  const validate = () => {
    const e: Partial<Form> = {};
    if (!form.name.trim()) e.name = "নাম লিখুন";
    if (!/^0\d{9,10}$/.test(form.phone.trim().replace(/\s|-/g, "")))
      e.phone = "সঠিক মোবাইল নম্বর দিন (যেমন 01712345678)";
    if (form.address.trim().length < 8) e.address = "সম্পূর্ণ ঠিকানা লিখুন";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const confirm = () => {
    if (!lines.length || !validate()) return;
    const msg = [
      "🛍️ New Order from Website",
      "",
      ...lines.map(
        (l, i) =>
          `${i + 1}. ${l.product.title} (${l.product.sku}) × ${l.qty} — ${taka(l.product.price * l.qty)}`,
      ),
      "",
      `Subtotal: ${taka(subtotal)}`,
      `Delivery: ${taka(settings.deliveryCharge)}`,
      `Grand Total: ${taka(total)}`,
      "",
      `👤 Name: ${form.name.trim()}`,
      `📞 Phone: ${form.phone.trim()}`,
      `📍 Address: ${form.address.trim()}`,
      "",
      "Payment: bKash / Cash on Delivery",
    ].join("\n");
    window.open(waLink(msg), "_blank", "noopener");
  };

  const field =
    "mt-1 w-full rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_0_var(--brand)]";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div className="sheet-in relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border-2 border-ink bg-background sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-center justify-between border-b-2 border-ink bg-brand-soft px-4 py-3">
          <h2 className="font-display text-lg font-bold">আপনার কার্ট</h2>
          <button onClick={onClose} className="brutal-sm press rounded-full bg-white px-3 py-1 text-sm font-bold">
            ✕
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
          {!lines.length ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              কার্ট খালি — একটা keychain যোগ করুন 🩷
            </p>
          ) : (
            <ul className="space-y-3">
              {lines.map((l) => (
                <li key={l.sku} className="brutal-sm flex gap-3 rounded-2xl bg-white p-2">
                  <ProductMedia
                    src={l.product.images[0]}
                    alt={l.product.title}
                    className="h-16 w-16 rounded-xl border-2 border-ink object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{l.product.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.product.sku} · {taka(l.product.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        aria-label="কমান"
                        onClick={() => setQty(l.sku, l.qty - 1)}
                        className="brutal-sm press h-7 w-7 rounded-lg bg-brand-wash font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{l.qty}</span>
                      <button
                        aria-label="বাড়ান"
                        onClick={() => setQty(l.sku, l.qty + 1)}
                        className="brutal-sm press h-7 w-7 rounded-lg bg-brand-soft font-bold"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(l.sku)}
                        className="ml-auto text-xs font-semibold text-destructive underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {lines.length > 0 && (
            <>
              <dl className="mt-5 space-y-1 border-t-2 border-dashed border-ink/30 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold">{taka(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Delivery Charge</dt>
                  <dd className="font-semibold">{taka(settings.deliveryCharge)}</dd>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <dt>Grand Total</dt>
                  <dd>{taka(total)}</dd>
                </div>
              </dl>

              <div className="mt-5 space-y-3">
                <label className="block text-sm font-semibold">
                  নাম *
                  <input
                    className={field}
                    value={form.name}
                    maxLength={80}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
                </label>
                <label className="block text-sm font-semibold">
                  মোবাইল নম্বর *
                  <input
                    className={field}
                    inputMode="tel"
                    value={form.phone}
                    maxLength={15}
                    placeholder="01XXXXXXXXX"
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  {errors.phone && <span className="text-xs text-destructive">{errors.phone}</span>}
                </label>
                <label className="block text-sm font-semibold">
                  ডেলিভারি ঠিকানা *
                  <textarea
                    className={field}
                    rows={3}
                    maxLength={300}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                  {errors.address && (
                    <span className="text-xs text-destructive">{errors.address}</span>
                  )}
                </label>
              </div>
            </>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t-2 border-ink bg-brand-wash p-4">
            <button
              onClick={confirm}
              className="brutal press w-full rounded-2xl bg-brand px-4 py-3 font-display text-base font-bold"
            >
              Confirm Order via WhatsApp
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              bKash বা Cash on Delivery · Dhaka-তে ১–২ দিনে delivery
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
