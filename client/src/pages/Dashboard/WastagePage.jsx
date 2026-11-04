
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ClipboardList,
  IndianRupee,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import api from "../../api/client";

const COLORS = {
  background: "#0B1120",
  panel: "#111C30",
  panelLight: "#17243A",
  border: "rgba(255,255,255,0.09)",
  text: "#F1F5F9",
  muted: "#94A3B8",
  accent: "#F59E0B",
  red: "#F87171",
  green: "#34D399",
};

const REASONS = [
  "Expired",
  "Spoiled",
  "Overproduction",
  "Preparation Error",
  "Damaged",
  "Other",
];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function getArray(response, keys) {
  const data = response?.data;

  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("dineops_user") || "null");
  } catch {
    return null;
  }
}

function getItemName(item) {
  return (
    item?.productName ||
    item?.productId?.name ||
    item?.rawMaterialId?.name ||
    "Unknown item"
  );
}

function getBranchName(record) {
  return record?.branchId?.name || "Assigned branch";
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: "9px",
  border: `1px solid ${COLORS.border}`,
  background: COLORS.background,
  color: COLORS.text,
  outline: "none",
  fontSize: "14px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: COLORS.muted,
  fontSize: "13px",
  fontWeight: 600,
};

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "14px",
        padding: "20px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div>
          <p style={{ color: COLORS.muted, fontSize: "13px", margin: 0 }}>
            {title}
          </p>
          <h2
            style={{
              color: COLORS.text,
              fontSize: "25px",
              margin: "10px 0 5px",
              fontWeight: 700,
            }}
          >
            {value}
          </h2>
          <p style={{ color: COLORS.muted, fontSize: "12px", margin: 0 }}>
            {subtitle}
          </p>
        </div>

        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: `${color}18`,
            display: "grid",
            placeItems: "center",
            color,
            flexShrink: 0,
          }}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function WastagePage() {
  const user = getUser();
  const isOwner = user?.role === "OWNER";

  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [wastages, setWastages] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState(
    user?.branchId?._id || user?.branchId || ""
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    itemType: "PRODUCT",
    itemId: "",
    quantity: "",
    reason: "Damaged",
    notes: "",
  });

  const loadBranches = useCallback(async () => {
    try {
      const response = await api.get("/branches");
      const list = getArray(response, ["branches", "data"]);
      setBranches(list);

      if (!selectedBranch && !isOwner && list.length > 0) {
        setSelectedBranch(list[0]._id);
      }

      if (!selectedBranch && isOwner && list.length > 0) {
        setSelectedBranch(list[0]._id);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load branches."
      );
    }
  }, [isOwner, selectedBranch]);

  const loadWastages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (isOwner && selectedBranch) {
        params.branchId = selectedBranch;
      }

      const response = await api.get("/wastage", { params });
      setWastages(getArray(response, ["wastages"]));
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load wastage records."
      );
    } finally {
      setLoading(false);
    }
  }, [isOwner, selectedBranch]);

  const loadItems = useCallback(async () => {
    if (!selectedBranch) {
      setProducts([]);
      setRawMaterials([]);
      return;
    }

    try {
      const [productResponse, rawMaterialResponse] = await Promise.all([
        api.get("/products", {
          params: { branchId: selectedBranch },
        }),
        api.get("/raw-materials", {
          params: { branchId: selectedBranch },
        }),
      ]);

      setProducts(getArray(productResponse, ["products"]));
      setRawMaterials(
        getArray(rawMaterialResponse, ["rawMaterials", "materials"])
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load inventory items."
      );
    }
  }, [selectedBranch]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadWastages();
    loadItems();
  }, [loadWastages, loadItems]);

  const currentItems =
    form.itemType === "PRODUCT" ? products : rawMaterials;

  const selectedItem = currentItems.find(
    (item) => item._id === form.itemId
  );

  const itemCost = selectedItem
    ? Number(
        form.itemType === "PRODUCT"
          ? selectedItem.cost
          : selectedItem.purchasePrice
      ) || 0
    : 0;

  const estimatedLoss = itemCost * (Number(form.quantity) || 0);

  const filteredWastages = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return wastages;

    return wastages.filter((record) => {
      const itemNames = record.items
        ?.map(getItemName)
        .join(" ")
        .toLowerCase();

      return (
        record.wastageNumber?.toLowerCase().includes(query) ||
        itemNames?.includes(query) ||
        record.items?.some((item) =>
          item.reason?.toLowerCase().includes(query)
        ) ||
        getBranchName(record).toLowerCase().includes(query)
      );
    });
  }, [wastages, search]);

  const totalLoss = wastages.reduce(
    (total, record) => total + (Number(record.totalLoss) || 0),
    0
  );

  const productLoss = wastages.reduce(
    (total, record) =>
      total +
      (record.items || [])
        .filter((item) => item.itemType === "PRODUCT")
        .reduce((sum, item) => sum + (Number(item.totalLoss) || 0), 0),
    0
  );

  const rawMaterialLoss = wastages.reduce(
    (total, record) =>
      total +
      (record.items || [])
        .filter((item) => item.itemType === "RAW_MATERIAL")
        .reduce((sum, item) => sum + (Number(item.totalLoss) || 0), 0),
    0
  );

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function openModal() {
    setError("");
    setSuccess("");
    setForm({
      itemType: "PRODUCT",
      itemId: "",
      quantity: "",
      reason: "Damaged",
      notes: "",
    });
    setShowModal(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedBranch) {
      setError("Please select a branch first.");
      return;
    }

    if (!form.itemId || !form.quantity || Number(form.quantity) <= 0) {
      setError("Please select an item and enter a valid quantity.");
      return;
    }

    if (!selectedItem) {
      setError("Selected inventory item could not be found.");
      return;
    }

    const payload = {
      wastageNumber: `WST-${Date.now()}`,
      branchId: selectedBranch,
      items: [
        {
          itemType: form.itemType,
          ...(form.itemType === "PRODUCT"
            ? { productId: form.itemId }
            : { rawMaterialId: form.itemId }),
          quantity: Number(form.quantity),
          reason: form.reason,
        },
      ],
      notes: form.notes.trim(),
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.post("/wastage", payload);

      setSuccess(
        response.data?.message ||
          "Wastage recorded successfully. Inventory has been updated."
      );

      setShowModal(false);

      await Promise.all([loadWastages(), loadItems()]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to record wastage."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        color: COLORS.text,
        padding: "8px 4px 30px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "25px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                background: "#F59E0B20",
                color: COLORS.accent,
                padding: "10px",
                borderRadius: "11px",
              }}
            >
              <Trash2 size={23} />
            </div>
            <h1 style={{ margin: 0, fontSize: "26px" }}>
              Wastage Management
            </h1>
          </div>

          <p
            style={{
              color: COLORS.muted,
              margin: "12px 0 0",
              fontSize: "14px",
            }}
          >
            Track wasted products, raw materials and financial losses.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              loadWastages();
              loadItems();
            }}
            style={{
              padding: "11px 15px",
              borderRadius: "9px",
              border: `1px solid ${COLORS.border}`,
              background: COLORS.panel,
              color: COLORS.text,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openModal}
            style={{
              padding: "11px 16px",
              borderRadius: "9px",
              border: "none",
              background: COLORS.accent,
              color: "#111827",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Plus size={17} />
            Record Wastage
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div
          style={{
            padding: "13px 15px",
            borderRadius: "9px",
            background: "#7F1D1D30",
            border: "1px solid #F8717150",
            color: "#FCA5A5",
            marginBottom: "18px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "13px 15px",
            borderRadius: "9px",
            background: "#064E3B40",
            border: "1px solid #34D39950",
            color: "#6EE7B7",
            marginBottom: "18px",
            fontSize: "14px",
          }}
        >
          {success}
        </div>
      )}

      {/* Branch Filter */}
      <div
        style={{
          background: COLORS.panel,
          border: `1px solid ${COLORS.border}`,
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "20px",
          maxWidth: "400px",
        }}
      >
        <label style={labelStyle}>Select Branch</label>
        <select
          value={selectedBranch}
          onChange={(event) => setSelectedBranch(event.target.value)}
          style={inputStyle}
        >
          <option value="">Select a branch</option>
          {branches.map((branch) => (
            <option key={branch._id} value={branch._id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <StatCard
          title="Total Wastage Records"
          value={wastages.length}
          subtitle="Recorded entries"
          icon={ClipboardList}
          color="#F59E0B"
        />

        <StatCard
          title="Total Financial Loss"
          value={money(totalLoss)}
          subtitle="Across loaded records"
          icon={IndianRupee}
          color="#F87171"
        />

        <StatCard
          title="Product Loss"
          value={money(productLoss)}
          subtitle="Finished products"
          icon={Package}
          color="#60A5FA"
        />

        <StatCard
          title="Raw Material Loss"
          value={money(rawMaterialLoss)}
          subtitle="Kitchen ingredients"
          icon={AlertTriangle}
          color="#A78BFA"
        />
      </div>

      {/* History */}
      <div
        style={{
          background: COLORS.panel,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", margin: 0 }}>
              Wastage History
            </h2>
            <p
              style={{
                color: COLORS.muted,
                fontSize: "12px",
                margin: "6px 0 0",
              }}
            >
              View and search recorded wastage entries.
            </p>
          </div>

          <div style={{ position: "relative", width: "min(100%, 280px)" }}>
            <Search
              size={17}
              color={COLORS.muted}
              style={{
                position: "absolute",
                left: "12px",
                top: "12px",
              }}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search item, reason or ID..."
              style={{ ...inputStyle, paddingLeft: "38px" }}
            />
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              color: COLORS.muted,
            }}
          >
            Loading wastage records...
          </div>
        ) : filteredWastages.length === 0 ? (
          <div
            style={{
              padding: "55px 20px",
              textAlign: "center",
              color: COLORS.muted,
            }}
          >
            <Trash2 size={35} style={{ marginBottom: "12px" }} />
            <h3 style={{ color: COLORS.text, margin: "0 0 8px" }}>
              No wastage records found
            </h3>
            <p style={{ fontSize: "13px", margin: 0 }}>
              Record wastage to see entries here.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "850px",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: COLORS.panelLight }}>
                  {[
                    "Wastage ID",
                    "Date",
                    "Item",
                    "Type",
                    "Quantity",
                    "Reason",
                    "Financial Loss",
                    "Branch",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "15px 14px",
                        textAlign: "left",
                        color: COLORS.muted,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredWastages.map((record) =>
                  (record.items || []).map((item, index) => (
                    <tr
                      key={`${record._id}-${item._id || index}`}
                      style={{
                        borderTop: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <td style={{ padding: "15px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ color: COLORS.accent, fontWeight: 700 }}>
                          {record.wastageNumber}
                        </span>
                      </td>

                      <td style={{ padding: "15px 14px", whiteSpace: "nowrap" }}>
                        {record.wastageDate
                          ? new Date(record.wastageDate).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                      </td>

                      <td style={{ padding: "15px 14px", fontWeight: 600 }}>
                        {getItemName(item)}
                      </td>

                      <td style={{ padding: "15px 14px" }}>
                        <span
                          style={{
                            padding: "5px 9px",
                            borderRadius: "20px",
                            background:
                              item.itemType === "PRODUCT"
                                ? "#2563EB25"
                                : "#A78BFA25",
                            color:
                              item.itemType === "PRODUCT"
                                ? "#93C5FD"
                                : "#C4B5FD",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.itemType === "PRODUCT"
                            ? "Product"
                            : "Raw Material"}
                        </span>
                      </td>

                      <td style={{ padding: "15px 14px" }}>
                        {item.quantity}{" "}
                        {item.itemType === "PRODUCT"
                          ? item.productId?.unit || ""
                          : item.rawMaterialId?.unit || ""}
                      </td>

                      <td style={{ padding: "15px 14px" }}>
                        {item.reason}
                      </td>

                      <td
                        style={{
                          padding: "15px 14px",
                          color: COLORS.red,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {money(item.totalLoss)}
                      </td>

                      <td style={{ padding: "15px 14px", whiteSpace: "nowrap" }}>
                        {getBranchName(record)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Wastage Modal */}
      {showModal && (
        <div
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.72)",
            display: "grid",
            placeItems: "center",
            padding: "15px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "16px",
              padding: "24px",
              boxSizing: "border-box",
              margin: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "22px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "21px" }}>
                  Record Wastage
                </h2>
                <p
                  style={{
                    color: COLORS.muted,
                    fontSize: "12px",
                    margin: "6px 0 0",
                  }}
                >
                  Inventory will update after successful submission.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  border: "none",
                  background: COLORS.panelLight,
                  color: COLORS.text,
                  borderRadius: "8px",
                  padding: "8px",
                  cursor: "pointer",
                }}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "17px" }}>
                <label style={labelStyle}>Branch</label>
                <select
                  value={selectedBranch}
                  onChange={(event) => setSelectedBranch(event.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "17px" }}>
                <label style={labelStyle}>Wastage Type</label>
                <select
                  value={form.itemType}
                  onChange={(event) => {
                    updateForm("itemType", event.target.value);
                    updateForm("itemId", "");
                  }}
                  style={inputStyle}
                >
                  <option value="PRODUCT">Finished Product</option>
                  <option value="RAW_MATERIAL">Raw Material</option>
                </select>
              </div>

              <div style={{ marginBottom: "17px" }}>
                <label style={labelStyle}>
                  Select {form.itemType === "PRODUCT" ? "Product" : "Raw Material"}
                </label>
                <select
                  value={form.itemId}
                  onChange={(event) => updateForm("itemId", event.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="">Choose an inventory item</option>
                  {currentItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} — Available:{" "}
                      {form.itemType === "PRODUCT"
                        ? item.stock
                        : item.currentStock}{" "}
                      {item.unit}
                    </option>
                  ))}
                </select>
                {currentItems.length === 0 && (
                  <p
                    style={{
                      color: COLORS.muted,
                      fontSize: "12px",
                      margin: "7px 0 0",
                    }}
                  >
                    No items available for this branch and type.
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "17px" }}>
                <label style={labelStyle}>Wasted Quantity</label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={form.quantity}
                  onChange={(event) => updateForm("quantity", event.target.value)}
                  placeholder="Enter quantity"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "17px" }}>
                <label style={labelStyle}>Reason</label>
                <select
                  value={form.reason}
                  onChange={(event) => updateForm("reason", event.target.value)}
                  style={inputStyle}
                >
                  {REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Notes (Optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                  placeholder="Add details about this wastage..."
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div
                style={{
                  padding: "15px",
                  background: COLORS.background,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "10px",
                  marginBottom: "20px",
                }}
              >
                <p
                  style={{
                    color: COLORS.muted,
                    fontSize: "12px",
                    margin: "0 0 6px",
                  }}
                >
                  Estimated Financial Loss
                </p>
                <h2
                  style={{
                    color: COLORS.red,
                    margin: 0,
                    fontSize: "24px",
                  }}
                >
                  {money(estimatedLoss)}
                </h2>
                <p
                  style={{
                    color: COLORS.muted,
                    fontSize: "11px",
                    margin: "7px 0 0",
                  }}
                >
                  Based on the selected item's recorded cost.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "9px",
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.panelLight,
                    color: COLORS.text,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "9px",
                    border: "none",
                    background: COLORS.accent,
                    color: "#111827",
                    fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Saving..." : "Save Wastage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
