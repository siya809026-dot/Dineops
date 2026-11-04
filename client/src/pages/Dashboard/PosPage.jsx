
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Utensils,
  Plus,
  ShoppingCart,
  Trash2,
  ReceiptText,
  Search,
  DollarSign,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Package
} from "lucide-react";
import api from "../../api/client";

const getList = (data, key) => {
  if (Array.isArray(data)) return data;
  return data?.[key] || [];
};

const getBranchId = (value) => {
  if (!value) return "";
  return typeof value === "object" ? value._id || "" : value;
};

const createInvoiceNumber = () => {
  return `DIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export default function PosPage() {
  const user = JSON.parse(
    sessionStorage.getItem("dineops_user") || "null"
  );

  const isOwner = user?.role === "OWNER";

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(
    getBranchId(user?.branchId) ||
    getBranchId(user?.branch?._id)
  );

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastInvoice, setLastInvoice] = useState("");

  const loadBranches = useCallback(async () => {
    try {
      const { data } = await api.get("/branches");
      const list = getList(data, "branches");

      setBranches(list);

      if (!selectedBranch && list.length > 0) {
        setSelectedBranch(
          getBranchId(list[0]._id)
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load branches."
      );
    }
  }, [selectedBranch]);

  const loadProducts = useCallback(async () => {
    if (!selectedBranch) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/products", {
        params: {
          branchId: selectedBranch
        }
      });

      setProducts(getList(data, "products"));
    } catch (err) {
      setProducts([]);
      setError(
        err.response?.data?.message ||
        "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedBranch]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const name = product.name || "";
      const sku = product.sku || "";
      const category = product.category || "";

      return (
        name.toLowerCase().includes(term) ||
        sku.toLowerCase().includes(term) ||
        category.toLowerCase().includes(term)
      );
    });
  }, [products, search]);

  const addToCart = (product) => {
    setError("");
    setSuccess("");

    const stock = Number(product.stock || 0);
    const existing = cart.find(
      (item) => item._id === product._id
    );

    const currentQuantity = existing?.qty || 0;

    if (currentQuantity >= stock) {
      setError(`Only ${stock} units of ${product.name} are available.`);
      return;
    }

    if (existing) {
      setCart((current) =>
        current.map((item) =>
          item._id === product._id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      setCart((current) => [
        ...current,
        {
          ...product,
          price: Number(product.sellingPrice),
          qty: 1
        }
      ]);
    }
  };

  const removeFromCart = (productId) => {
    setCart((current) =>
      current.filter((item) => item._id !== productId)
    );
    setError("");
  };

  const updateQty = (productId, delta) => {
    setError("");

    setCart((current) =>
      current.map((item) => {
        if (item._id !== productId) return item;

        const nextQuantity = item.qty + delta;

        if (nextQuantity <= 0) return item;

        if (nextQuantity > Number(item.stock || 0)) {
          setError(
            `Only ${item.stock} units of ${item.name} are available.`
          );
          return item;
        }

        return {
          ...item,
          qty: nextQuantity
        };
      })
    );
  };

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const total = subtotal;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Please add products to the order first.");
      return;
    }

    if (!selectedBranch) {
      setError("Please select a branch.");
      return;
    }

    const invalidItem = cart.find(
      (item) =>
        !item._id ||
        !Number.isFinite(item.qty) ||
        item.qty <= 0
    );

    if (invalidItem) {
      setError("One or more cart items are invalid.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const invoiceNumber = createInvoiceNumber();

    const payload = {
      invoiceNumber,
      branchId: selectedBranch,
      items: cart.map((item) => ({
        productId: item._id,
        quantity: item.qty
      })),
      paymentMethod
    };

    try {
      const { data } = await api.post("/sales", payload);

      const savedTotal = Number(
        data.totalAmount ?? total
      );

      setSuccess(
        `Sale saved successfully. Total: Rs. ${savedTotal.toFixed(2)}`
      );
      setLastInvoice(invoiceNumber);
      setCart([]);

      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Checkout failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedBranchName =
    branches.find(
      (branch) => branch._id === selectedBranch
    )?.name || "Selected Branch";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-amber-400">
            <Utensils size={21} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Restaurant Operations
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white">
            POS Terminal & Billing
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Create customer orders and record sales directly in DineOps.
          </p>
        </div>

        <div className="w-full md:w-72">
          <label className="mb-2 block text-xs font-semibold text-slate-400">
            Select Branch
          </label>

          <select
            value={selectedBranch}
            onChange={(event) => {
              setSelectedBranch(event.target.value);
              setCart([]);
              setError("");
              setSuccess("");
            }}
            disabled={!isOwner}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <option value="">Select branch</option>

            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>

          {!isOwner && (
            <p className="mt-1 text-xs text-slate-500">
              Your assigned branch is selected automatically.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{success}</p>
            <p className="mt-1 text-xs text-emerald-400">
              Invoice: {lastInvoice}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                Menu Catalog
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {selectedBranchName} · {products.length} products
              </p>
            </div>

            <button
              onClick={loadProducts}
              disabled={loading || !selectedBranch}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-slate-500"
              size={18}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product name, SKU or category..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-amber-500"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 py-16 text-slate-400">
              <Loader2 size={21} className="animate-spin" />
              Loading branch products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 py-16 text-center">
              <Package
                className="mx-auto mb-3 text-slate-600"
                size={38}
              />
              <p className="font-semibold text-white">
                No products found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add products to this branch or try another search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {filteredProducts.map((product) => {
                const stock = Number(product.stock || 0);
                const price = Number(product.sellingPrice || 0);
                const outOfStock = stock <= 0;

                return (
                  <button
                    key={product._id}
                    onClick={() => addToCart(product)}
                    disabled={outOfStock || saving}
                    className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-4 text-left shadow-lg transition hover:border-amber-500/50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div>
                      <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                        {product.category || "Menu Item"}
                      </span>

                      <h4 className="mt-3 font-bold text-white transition group-hover:text-amber-400">
                        {product.name}
                      </h4>

                      <p className="mt-1 font-mono text-xs text-slate-500">
                        SKU: {product.sku}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-slate-800/80 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-emerald-400">
                          Rs. {price.toFixed(2)}
                        </span>

                        <span
                          className={`text-xs font-semibold ${
                            outOfStock
                              ? "text-rose-400"
                              : stock <= Number(product.minStock || 0)
                                ? "text-amber-400"
                                : "text-slate-400"
                          }`}
                        >
                          Stock: {stock}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-amber-500 py-2 text-sm font-bold text-slate-950 transition group-hover:bg-amber-400">
                        <Plus size={16} />
                        {outOfStock ? "Out of Stock" : "Add to Order"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex h-fit flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart
                  className="text-amber-400"
                  size={20}
                />
                <h3 className="font-bold text-white">
                  Current Order
                </h3>
              </div>

              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                {cart.reduce((sum, item) => sum + item.qty, 0)} items
              </span>
            </div>

            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3"
                  >
                    <div className="min-w-0">
                      <h5 className="truncate text-sm font-bold text-white">
                        {item.name}
                      </h5>

                      <p className="mt-1 text-xs text-slate-400">
                        Rs. {item.price.toFixed(2)} × {item.qty}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-emerald-400">
                        Rs. {(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900">
                        <button
                          onClick={() => updateQty(item._id, -1)}
                          disabled={item.qty <= 1}
                          className="px-2 py-1 font-bold text-slate-400 hover:text-white disabled:opacity-30"
                        >
                          -
                        </button>

                        <span className="px-2 text-xs font-bold text-white">
                          {item.qty}
                        </span>

                        <button
                          onClick={() => updateQty(item._id, 1)}
                          disabled={item.qty >= Number(item.stock || 0)}
                          className="px-2 py-1 font-bold text-slate-400 hover:text-white disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        title="Remove item"
                        className="rounded-lg p-1 text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  <ShoppingCart
                    className="mx-auto mb-3 text-slate-700"
                    size={34}
                  />
                  No items added to this order yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-800 pt-4">
            <label className="block space-y-2 text-xs font-semibold text-slate-400">
              Payment Method

              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-amber-500"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Online">Online</option>
              </select>
            </label>

            <div className="flex justify-between text-sm text-slate-400">
              <span>Subtotal</span>
              <span className="font-semibold text-white">
                Rs. {subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between border-t border-slate-800 pt-3 text-base font-bold text-white">
              <span>Total Payable</span>
              <span className="text-lg text-amber-400">
                Rs. {total.toFixed(2)}
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Tax is not added separately in this POS version.
            </p>

            <button
              onClick={handleCheckout}
              disabled={
                cart.length === 0 ||
                saving ||
                loading ||
                !selectedBranch
              }
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold text-slate-950 shadow-lg transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving Sale...
                </>
              ) : (
                <>
                  <ReceiptText size={18} />
                  Complete Sale
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
