
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChefHat, Plus, Search, Pencil, Trash2, X, Loader2,
  AlertCircle, BookOpen, Package, RefreshCw
} from "lucide-react";
import api from "../../api/client";

const emptyForm = {
  productId: "",
  branchId: "",
  ingredients: [{ rawMaterialId: "", quantity: "0.1" }],
  preparationNotes: "",
};

const getList = (data, key) => {
  if (Array.isArray(data)) return data;
  return data?.[key] || [];
};

export default function RecipesPage() {
  const user = JSON.parse(sessionStorage.getItem("dineops_user") || "null");
  const isOwner = user?.role === "OWNER";

  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(
    user?.branchId?._id || user?.branchId || user?.branch?._id || ""
  );

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadBranches = useCallback(async () => {
    try {
      const { data } = await api.get("/branches");
      const list = getList(data, "branches");
      setBranches(list);

      if (!selectedBranch && list.length) {
        setSelectedBranch(list[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load branches.");
    }
  }, [selectedBranch]);

  const loadBranchData = useCallback(async () => {
    if (!selectedBranch) {
      setRecipes([]);
      setProducts([]);
      setRawMaterials([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [recipeResponse, productResponse, materialResponse] =
        await Promise.all([
          api.get("/recipes", { params: { branchId: selectedBranch } }),
          api.get("/products", { params: { branchId: selectedBranch } }),
          api.get("/raw-materials", { params: { branchId: selectedBranch } }),
        ]);

      setRecipes(getList(recipeResponse.data, "recipes"));
      setProducts(getList(productResponse.data, "products"));
      setRawMaterials(getList(materialResponse.data, "rawMaterials"));
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load recipe data. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedBranch]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadBranchData();
  }, [loadBranchData]);

  const filteredRecipes = useMemo(() => {
    const term = search.toLowerCase();
    return recipes.filter((recipe) => {
      const productName = recipe.productId?.name || "";
      const sku = recipe.productId?.sku || "";
      return productName.toLowerCase().includes(term) ||
        sku.toLowerCase().includes(term);
    });
  }, [recipes, search]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, branchId: selectedBranch });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (recipe) => {
    setEditingId(recipe._id);
    setForm({
      productId: recipe.productId?._id || recipe.productId || "",
      branchId: recipe.branchId?._id || recipe.branchId || selectedBranch,
      ingredients: recipe.ingredients.map((item) => ({
        rawMaterialId: item.rawMaterialId?._id || item.rawMaterialId || "",
        quantity: String(item.quantity),
      })),
      preparationNotes: recipe.preparationNotes || "",
    });
    setError("");
    setModalOpen(true);
  };

  const updateIngredient = (index, field, value) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient
      ),
    }));
  };

  const addIngredient = () => {
    setForm((current) => ({
      ...current,
      ingredients: [
        ...current.ingredients,
        { rawMaterialId: "", quantity: "0.1" },
      ],
    }));
  };

  const removeIngredient = (index) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.productId || !form.branchId) {
      setError("Please select a product and branch.");
      return;
    }

    const ingredients = form.ingredients.map((item) => ({
      rawMaterialId: item.rawMaterialId,
      quantity: Number(item.quantity),
    }));

    if (
      ingredients.length === 0 ||
      ingredients.some(
        (item) =>
          !item.rawMaterialId ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0
      )
    ) {
      setError("Select every raw material and enter a quantity greater than zero.");
      return;
    }

    const payload = {
      productId: form.productId,
      branchId: form.branchId,
      ingredients,
      preparationNotes: form.preparationNotes,
    };

    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/recipes/${editingId}`, {
          ingredients,
          preparationNotes: form.preparationNotes,
        });
      } else {
        await api.post("/recipes", payload);
      }

      setModalOpen(false);
      setForm(emptyForm);
      await loadBranchData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save recipe.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recipe) => {
    const name = recipe.productId?.name || "this recipe";
    if (!window.confirm(`Delete the recipe for ${name}?`)) return;

    try {
      await api.delete(`/recipes/${recipe._id}`);
      await loadBranchData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete recipe.");
    }
  };

  const getBranchName = (recipe) =>
    recipe.branchId?.name ||
    branches.find((branch) =>
      branch._id === (recipe.branchId?._id || recipe.branchId)
    )?.name ||
    "Branch";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-amber-400">
            <ChefHat size={21} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Kitchen Operations
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Recipe Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage menu recipes and their raw-material requirements.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
          >
            <option value="">Select branch</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>

          {isOwner && (
            <button
              onClick={openCreateModal}
              disabled={!selectedBranch}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={18} /> Create Recipe
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total Recipes</p>
            <BookOpen className="text-amber-400" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{recipes.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Menu Products</p>
            <ChefHat className="text-sky-400" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{products.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Raw Materials</p>
            <Package className="text-emerald-400" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{rawMaterials.length}</p>
        </div>
      </div>

      {error && !modalOpen && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertCircle size={18} /> {error}
          <button onClick={() => setError("")} className="ml-auto">
            <X size={17} />
          </button>
        </div>
      )}

      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-3 text-slate-500" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name or SKU..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-amber-500"
          />
        </div>
        <button
          onClick={loadBranchData}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="font-bold text-white">Recipe Library</h2>
          <p className="mt-1 text-xs text-slate-500">
            Recipes configured for the selected branch.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
            <Loader2 className="animate-spin" size={20} /> Loading recipes...
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="py-16 text-center">
            <ChefHat className="mx-auto mb-3 text-slate-600" size={38} />
            <p className="font-semibold text-white">No recipes found</p>
            <p className="mt-1 text-sm text-slate-500">
              {search ? "Try another search term." : "Create a recipe to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">Menu Product</th>
                  <th className="p-4">Branch</th>
                  <th className="p-4">Ingredients</th>
                  <th className="p-4">Preparation Notes</th>
                  {isOwner && <th className="p-4">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredRecipes.map((recipe) => (
                  <tr key={recipe._id} className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <p className="font-semibold text-white">
                        {recipe.productId?.name || "Unknown product"}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-500">
                        {recipe.productId?.sku || "No SKU"}
                      </p>
                    </td>
                    <td className="p-4 text-slate-400">
                      {getBranchName(recipe)}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                        {recipe.ingredients?.length || 0} items
                      </span>
                      <div className="mt-2 space-y-1">
                        {recipe.ingredients?.slice(0, 3).map((item, index) => (
                          <p key={index} className="text-xs text-slate-400">
                            {item.rawMaterialId?.name || "Material"} — {item.quantity}{" "}
                            {item.rawMaterialId?.unit || ""}
                          </p>
                        ))}
                        {recipe.ingredients?.length > 3 && (
                          <p className="text-xs text-slate-500">
                            +{recipe.ingredients.length - 3} more
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="max-w-xs p-4 text-xs text-slate-400">
                      {recipe.preparationNotes || "No notes added"}
                    </td>
                    {isOwner && (
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(recipe)}
                            title="Edit recipe"
                            className="rounded-lg border border-slate-700 p-2 text-sky-400 hover:bg-sky-500/10"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(recipe)}
                            title="Delete recipe"
                            className="rounded-lg border border-slate-700 p-2 text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingId ? "Edit Recipe" : "Create New Recipe"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Add the ingredients required for one menu product.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Menu Product
                  <select
                    required
                    value={form.productId}
                    onChange={(e) =>
                      setForm({ ...form, productId: e.target.value })
                    }
                    disabled={Boolean(editingId)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-amber-500 disabled:opacity-60"
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-300">
                  Branch
                  <select
                    required
                    value={form.branchId}
                    onChange={(e) =>
                      setForm({ ...form, branchId: e.target.value })
                    }
                    disabled
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white outline-none"
                  >
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Ingredients</h3>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
                  >
                    <Plus size={15} /> Add ingredient
                  </button>
                </div>

                <div className="space-y-3">
                  {form.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 items-end gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                    >
                      <label className="col-span-7 space-y-2 text-xs text-slate-400 sm:col-span-8">
                        Raw Material
                        <select
                          required
                          value={ingredient.rawMaterialId}
                          onChange={(e) =>
                            updateIngredient(index, "rawMaterialId", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white outline-none focus:border-amber-500"
                        >
                          <option value="">Select material</option>
                          {rawMaterials.map((material) => (
                            <option key={material._id} value={material._id}>
                              {material.name} ({material.unit})
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="col-span-4 space-y-2 text-xs text-slate-400">
                        Quantity
                        <input
                          type="number"
                          min="0.001"
                          step="any"
                          required
                          value={ingredient.quantity}
                          onChange={(e) =>
                            updateIngredient(index, "quantity", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white outline-none focus:border-amber-500"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        disabled={form.ingredients.length === 1}
                        title="Remove ingredient"
                        className="col-span-1 flex h-10 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-500/10 disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {rawMaterials.length === 0 && (
                  <p className="mt-2 text-xs text-amber-400">
                    No raw materials found for this branch. Add raw materials first.
                  </p>
                )}
              </div>

              <label className="block space-y-2 text-sm text-slate-300">
                Preparation Notes
                <textarea
                  rows={3}
                  value={form.preparationNotes}
                  onChange={(e) =>
                    setForm({ ...form, preparationNotes: e.target.value })
                  }
                  placeholder="Add preparation instructions..."
                  className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-amber-500"
                />
              </label>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || products.length === 0 || rawMaterials.length === 0}
                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? "Save Changes" : "Create Recipe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
