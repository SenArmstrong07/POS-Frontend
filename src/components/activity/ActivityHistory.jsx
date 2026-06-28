import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COLORS } from "../../constants/colors";
import { apiCalls } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiErrors";
import { showErrorToast } from "../../utils/toast";

const ACTION_OPTIONS = [
  "LOGIN",
  "LOGOUT",
  "PASSWORD_CHANGE",
  "USER_CREATE",
  "PRODUCT_CREATE",
  "PRODUCT_BATCH_CREATE",
  "PRODUCT_UPDATE",
  "PRODUCT_DELETE",
  "CATEGORY_CREATE",
  "CATEGORY_UPDATE",
  "CATEGORY_DELETE",
  "STOCK_ADJUSTMENT",
  "STOCKIN_CREATE",
  "STOCKIN_POST",
  "SALE_DRAFT_CREATE",
  "SALE_COMPLETE",
  "SALE_VOID",
  "SALE_ITEM_VOID_REQUEST",
  "SALE_ITEM_VOID_APPROVE",
  "SALE_ITEM_VOID_DENY",
  "SUPPLIER_CREATE",
  "SUPPLIER_UPDATE",
  "SUPPLIER_DELETE",
];

const ENTITY_OPTIONS = [
  "Product",
  "Sale",
  "StockIn",
  "SaleItemVoidRequest",
  "User",
  "Category",
  "Supplier",
];

const activityHistoryCache = {
  search: "",
  entity: "",
  action: "",
  userId: "",
  logs: [],
  total: 0,
  hasLoaded: false,
};

const inputStyle = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "9px 11px",
  fontSize: 13,
  color: COLORS.text,
  background: COLORS.card,
  fontFamily: "inherit",
  outline: "none",
};

const thStyle = {
  padding: "11px 12px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  color: COLORS.muted,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  background: COLORS.faint,
  borderBottom: `1px solid ${COLORS.border}`,
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "12px",
  borderBottom: `1px solid ${COLORS.border}`,
  fontSize: 13,
  color: COLORS.text,
  verticalAlign: "top",
};

function normalizePage(data) {
  if (Array.isArray(data)) {
    return {
      records: data,
      total: data.length,
      hasPagination: false,
    };
  }

  const records = Array.isArray(data?.results) ? data.results : [];
  return {
    records,
    total: Number.isFinite(Number(data?.count)) ? Number(data.count) : records.length,
    hasPagination: Boolean(data && "results" in data),
  };
}

function formatAction(action) {
  if (!action) return "Activity";
  return String(action)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-PH");
}

function formatDetail(detail) {
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) return "";
  return Object.entries(detail)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => {
      const label = formatAction(key);
      const display = typeof value === "object" ? JSON.stringify(value) : String(value);
      return `${label}: ${display}`;
    })
    .join(" · ");
}

function SkeletonRow({ index }) {
  return (
    <tr>
      {[120, 90, 130, 90, 80, 220, 110].map((width, cellIndex) => (
        <td key={`${index}-${cellIndex}`} style={tdStyle}>
          <div
            style={{
              width,
              maxWidth: "100%",
              height: 14,
              borderRadius: 6,
              background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
              backgroundSize: "600px 100%",
              animation: "activity-shimmer 1.4s infinite linear",
            }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function ActivityHistory() {
  const [search, setSearch] = useState(activityHistoryCache.search);
  const [debouncedSearch, setDebouncedSearch] = useState(activityHistoryCache.search);
  const [entity, setEntity] = useState(activityHistoryCache.entity);
  const [action, setAction] = useState(activityHistoryCache.action);
  const [userId, setUserId] = useState(activityHistoryCache.userId);
  const [logs, setLogs] = useState(activityHistoryCache.logs);
  const [total, setTotal] = useState(activityHistoryCache.total);
  const [status, setStatus] = useState(activityHistoryCache.hasLoaded ? "ready" : "loading");
  const [error, setError] = useState("");
  const requestId = useRef(0);

  useEffect(() => {
    activityHistoryCache.search = search;
    activityHistoryCache.entity = entity;
    activityHistoryCache.action = action;
    activityHistoryCache.userId = userId;
  }, [action, entity, search, userId]);

  useEffect(() => {
    activityHistoryCache.logs = logs;
    activityHistoryCache.total = total;
    activityHistoryCache.hasLoaded = status === "ready" || activityHistoryCache.hasLoaded;
  }, [logs, status, total]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const params = useMemo(() => {
    const next = {
      ordering: "-created_at",
      page: 1,
      page_size: 200,
    };

    if (debouncedSearch) next.search = debouncedSearch;
    if (entity) next.entity = entity;
    if (action) next.action = action;
    if (userId.trim() && /^\d+$/.test(userId.trim())) next.user = userId.trim();

    return next;
  }, [action, debouncedSearch, entity, userId]);

  const loadActivity = useCallback(async () => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setStatus("loading");
    setError("");

    try {
      const firstResponse = await apiCalls.getActivityLogs(params);
      const firstPage = normalizePage(firstResponse.data);
      let records = firstPage.records;
      let recordTotal = firstPage.total;

      if (firstPage.hasPagination && recordTotal > records.length) {
        const pageSize = Number(params.page_size) || 200;
        const pageCount = Math.ceil(recordTotal / pageSize);
        const pages = Array.from({ length: pageCount - 1 }, (_, index) => index + 2);
        const pageResponses = await Promise.all(
          pages.map((page) =>
            apiCalls.getActivityLogs({
              ...params,
              page,
            })
          )
        );

        pageResponses.forEach((response) => {
          const page = normalizePage(response.data);
          records = records.concat(page.records);
          recordTotal = Math.max(recordTotal, page.total);
        });
      }

      if (currentRequest !== requestId.current) return;
      setLogs(records);
      setTotal(recordTotal);
      setStatus("ready");
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      const message = getApiErrorMessage(err, "Unable to load activity history.");
      setError(message);
      setLogs([]);
      setTotal(0);
      setStatus("error");
      showErrorToast(message);
    }
  }, [params]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const hasFilters = Boolean(search || entity || action || userId);

  return (
    <div>
      <style>{`
        @keyframes activity-shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .activity-row:hover { background: ${COLORS.faint}; }
      `}</style>

      <div
        style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(15,23,42,.07)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: COLORS.text, fontSize: 18, fontWeight: 700 }}>
              Activity History
            </h2>
            <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 13 }}>
              {status === "ready" ? `${total} recorded system ${total === 1 ? "event" : "events"}` : "Loading recorded system events"}
            </p>
          </div>
          <button
            type="button"
            onClick={loadActivity}
            disabled={status === "loading"}
            style={{
              padding: "9px 14px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              background: status === "loading" ? COLORS.faint : COLORS.card,
              color: COLORS.text,
              cursor: status === "loading" ? "not-allowed" : "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {status === "loading" ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div
          style={{
            padding: "1rem 1.5rem",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "grid",
            gridTemplateColumns: "minmax(220px, 1.5fr) minmax(140px, .8fr) minmax(180px, 1fr) minmax(120px, .6fr)",
            gap: 10,
          }}
          className="activity-filters"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, entity, or ID..."
            style={inputStyle}
          />
          <select value={entity} onChange={(e) => setEntity(e.target.value)} style={inputStyle}>
            <option value="">All entities</option>
            {ENTITY_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select value={action} onChange={(e) => setAction(e.target.value)} style={inputStyle}>
            <option value="">All actions</option>
            {ACTION_OPTIONS.map((option) => (
              <option key={option} value={option}>{formatAction(option)}</option>
            ))}
          </select>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID"
            inputMode="numeric"
            style={inputStyle}
          />
        </div>

        {status === "error" && (
          <div style={{ padding: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "14px 16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 12,
                color: COLORS.danger,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <span>{error || "Unable to load activity history."}</span>
              <button
                type="button"
                onClick={loadActivity}
                style={{
                  padding: "7px 12px",
                  border: "none",
                  borderRadius: 8,
                  background: COLORS.danger,
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {status !== "error" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Action</th>
                  <th style={thStyle}>Entity</th>
                  <th style={thStyle}>Entity ID</th>
                  <th style={thStyle}>Details</th>
                  <th style={thStyle}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {status === "loading" && [0, 1, 2, 3, 4, 5].map((index) => (
                  <SkeletonRow key={index} index={index} />
                ))}

                {status === "ready" && logs.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ ...tdStyle, borderBottom: "none" }}>
                      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            background: COLORS.faint,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1rem",
                            color: COLORS.muted,
                            fontWeight: 700,
                          }}
                        >
                          0
                        </div>
                        <p style={{ margin: 0, color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
                          No activity found
                        </p>
                        <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 13 }}>
                          {hasFilters ? "Try adjusting the search or filters." : "System activity will appear here once actions are recorded."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {status === "ready" && logs.map((log) => {
                  const details = formatDetail(log.detail);
                  return (
                    <tr key={log.id} className="activity-row">
                      <td style={{ ...tdStyle, whiteSpace: "nowrap", color: COLORS.muted }}>
                        {formatDate(log.created_at)}
                      </td>
                      <td style={tdStyle}>{log.user || "System"}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "3px 8px",
                            borderRadius: 999,
                            background: COLORS.primaryLight,
                            color: COLORS.primaryDark,
                            fontSize: 12,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td style={tdStyle}>{log.entity || "N/A"}</td>
                      <td style={{ ...tdStyle, color: COLORS.muted }}>{log.entity_id || "N/A"}</td>
                      <td style={{ ...tdStyle, color: details ? COLORS.text : COLORS.muted, maxWidth: 320 }}>
                        {details || "No details"}
                      </td>
                      <td style={{ ...tdStyle, color: COLORS.muted, whiteSpace: "nowrap" }}>
                        {log.ip_address || "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:900px){
          .activity-filters{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
