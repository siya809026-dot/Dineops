
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  IndianRupee,
  RefreshCw,
  Search,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Store,
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
  green: "#34D399",
  blue: "#60A5FA",
};

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

function getBranchName(sale) {
  return sale?.branchId?.name || "Assigned branch";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

export default function SalesHistoryPage() {
  const user = getUser();
  const isOwner = user?.role === "OWNER";

  const [branches, setBranches] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(
    user?.branchId?._id || user?.branchId || ""
  );

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedSale, setExpandedSale] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBranches = useCallback(async () => {
    if (!isOwner) return;

    try {
      const response = await api.get("/branches");
      setBranches(getArray(response, ["branches"]));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load branches.");
    }
  }, [isOwner]);

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/sales");
      setSales(getArray(response, ["sales"]));
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load sales history."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranches();
    loadSales();
  }, [loadBranches, loadSales]);

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sales.filter((sale) => {
      const branchId =
        typeof sale.branchId === "object"
          ? sale.branchId?._id
          : sale.branchId;

      if (selectedBranch && branchId !== selectedBranch) return false;

      const saleDate = sale.saleDate
        ? new Date(sale.saleDate)
        : sale.createdAt
          ? new Date(sale.createdAt)
          : null;

      if (startDate && saleDate) {
        const start = new Date(`${startDate}T00:00:00`);
        if (saleDate < start) return false;
      }

      if (endDate && saleDate) {
        const end = new Date(`${endDate}T23:59:59.999`);
        if (saleDate > end) return false;
      }

      if (query) {
        const productNames = (sale.items || [])
          .map((item) => item.productName || item.productId?.name || "")
          .join(" ")
          .toLowerCase();

        const searchableText = [
          sale.invoiceNumber,
          sale.paymentMethod,
          getBranchName(sale),
          productNames,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }, [sales, selectedBranch, search, startDate, endDate]);

  const totalRevenue = filteredSales.reduce(
    (sum, sale) => sum + (Number(sale.totalAmount) || 0),
    0
  );

  const totalOrders = filteredSales.length;

  const averageOrderValue =
    totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const totalItems = filteredSales.reduce(
    (sum, sale) =>
      sum +
      (sale.items || []).reduce(
        (itemSum, item) => itemSum + (Number(item.quantity) || 0),
        0
      ),
    0
  );

  return (
    <div
      style={{
        color: COLORS.text,
        padding: "8px 4px 30px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
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
              <ClipboardList size={23} />
            </div>
            <h1 style={{ margin: 0, fontSize: "26px" }}>
              Sales History
            </h1>
          </div>

          <p
            style={{
              color: COLORS.muted,
              margin: "12px 0 0",
              fontSize: "14px",
            }}
          >
            Monitor completed orders, revenue and branch-wise sales.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSales}
          disabled={loading}
          style={{
            padding: "11px 15px",
            borderRadius: "9px",
            border: `1px solid ${COLORS.border}`,
            background: COLORS.panel,
            color: COLORS.text,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <RefreshCw size={16} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "15px",
          marginBottom: "22px",
        }}
      >
        <StatCard
          title="Total Revenue"
          value={money(totalRevenue)}
          subtitle="Based on filtered sales"
          icon={IndianRupee}
          color="#34D399"
        />

        <StatCard
          title="Total Orders"
          value={totalOrders}
          subtitle="Completed sales"
          icon={ShoppingBag}
          color="#60A5FA"
        />

        <StatCard
          title="Average Order Value"
          value={money(averageOrderValue)}
          subtitle="Revenue per order"
          icon={Activity}
          color="#A78BFA"
        />

        <StatCard
          title="Items Sold"
          value={totalItems}
          subtitle="Total item quantities"
          icon={ClipboardList}
          color="#F59E0B"
        />
      </div>

      <div
        style={{
          background: COLORS.panel,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "14px",
          padding: "18px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            marginBottom: "16px",
          }}
        >
          <Store size={18} color={COLORS.accent} />
          <h2 style={{ fontSize: "16px", margin: 0 }}>Filter Sales</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "14px",
          }}
        >
          {isOwner && (
            <div>
              <label style={labelStyle}>Branch</label>
              <select
                value={selectedBranch}
                onChange={(event) => setSelectedBranch(event.target.value)}
                style={inputStyle}
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>Search</label>
            <div style={{ position: "relative" }}>
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
                placeholder="Invoice, product or payment..."
                style={{ ...inputStyle, paddingLeft: "38px" }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>To Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

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
            gap: "12px",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", margin: 0 }}>
              Transaction History
            </h2>
            <p
              style={{
                color: COLORS.muted,
                fontSize: "12px",
                margin: "6px 0 0",
              }}
            >
              {filteredSales.length} transaction(s) found
            </p>
          </div>

          <div
            style={{
              color: COLORS.green,
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {money(totalRevenue)}
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
            Loading sales history...
          </div>
        ) : filteredSales.length === 0 ? (
          <div
            style={{
              padding: "55px 20px",
              textAlign: "center",
              color: COLORS.muted,
            }}
          >
            <ShoppingBag size={35} style={{ marginBottom: "12px" }} />
            <h3 style={{ color: COLORS.text, margin: "0 0 8px" }}>
              No sales found
            </h3>
            <p style={{ fontSize: "13px", margin: 0 }}>
              Completed POS transactions will appear here.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "900px",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: COLORS.panelLight }}>
                  {[
                    "Invoice",
                    "Date",
                    "Branch",
                    "Items",
                    "Payment",
                    "Total",
                    "Details",
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
                {filteredSales.map((sale) => {
                  const isExpanded = expandedSale === sale._id;
                  const itemCount = (sale.items || []).reduce(
                    (sum, item) => sum + (Number(item.quantity) || 0),
                    0
                  );

                  return (
                    <>
                      <tr
                        key={sale._id}
                        style={{
                          borderTop: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <td style={{ padding: "15px 14px" }}>
                          <span
                            style={{
                              color: COLORS.accent,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {sale.invoiceNumber || "—"}
                          </span>
                        </td>

                        <td style={{ padding: "15px 14px", whiteSpace: "nowrap" }}>
                          {formatDate(sale.saleDate || sale.createdAt)}
                        </td>

                        <td style={{ padding: "15px 14px", whiteSpace: "nowrap" }}>
                          {getBranchName(sale)}
                        </td>

                        <td style={{ padding: "15px 14px" }}>
                          {itemCount}
                        </td>

                        <td style={{ padding: "15px 14px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 9px",
                              borderRadius: "20px",
                              background: "#2563EB25",
                              color: "#93C5FD",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <CreditCard size={13} />
                            {sale.paymentMethod || "—"}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: "15px 14px",
                            color: COLORS.green,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {money(sale.totalAmount)}
                        </td>

                        <td style={{ padding: "15px 14px" }}>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSale(isExpanded ? "" : sale._id)
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              border: `1px solid ${COLORS.border}`,
                              borderRadius: "7px",
                              padding: "7px 10px",
                              background: COLORS.panelLight,
                              color: COLORS.text,
                              cursor: "pointer",
                            }}
                          >
                            {isExpanded ? "Hide" : "View"}
                            {isExpanded ? (
                              <ChevronUp size={15} />
                            ) : (
                              <ChevronDown size={15} />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${sale._id}-details`}>
                          <td
                            colSpan={7}
                            style={{
                              padding: "18px",
                              background: COLORS.background,
                              borderTop: `1px solid ${COLORS.border}`,
                            }}
                          >
                            <h3
                              style={{
                                fontSize: "14px",
                                margin: "0 0 12px",
                                color: COLORS.accent,
                              }}
                            >
                              Order Details — {sale.invoiceNumber}
                            </h3>

                            <div style={{ overflowX: "auto" }}>
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                  minWidth: "500px",
                                }}
                              >
                                <thead>
                                  <tr>
                                    {["Product", "Quantity", "Unit Price", "Amount"].map(
                                      (heading) => (
                                        <th
                                          key={heading}
                                          style={{
                                            textAlign: "left",
                                            padding: "10px",
                                            color: COLORS.muted,
                                            borderBottom: `1px solid ${COLORS.border}`,
                                          }}
                                        >
                                          {heading}
                                        </th>
                                      )
                                    )}
                                  </tr>
                                </thead>

                                <tbody>
                                  {(sale.items || []).map((item, index) => (
                                    <tr key={item._id || index}>
                                      <td style={{ padding: "11px 10px" }}>
                                        {item.productName ||
                                          item.productId?.name ||
                                          "Unknown product"}
                                      </td>
                                      <td style={{ padding: "11px 10px" }}>
                                        {item.quantity}
                                      </td>
                                      <td style={{ padding: "11px 10px" }}>
                                        {money(item.unitPrice)}
                                      </td>
                                      <td
                                        style={{
                                          padding: "11px 10px",
                                          color: COLORS.green,
                                        }}
                                      >
                                        {money(item.lineTotal)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {sale.notes && (
                              <p
                                style={{
                                  color: COLORS.muted,
                                  fontSize: "12px",
                                  margin: "12px 0 0",
                                }}
                              >
                                Notes: {sale.notes}
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
