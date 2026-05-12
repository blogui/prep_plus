import React, { useState, useEffect } from "react";
import { Download, Search, RotateCcw, Eye, TrendingUp } from "lucide-react";
import api from "../services/api";
import getPageName from "../utils/pageNameMap";
import UserListModal from "./UserListModal";

const PAGE_SIZES = [10, 20, 50];

const AdminUserAccessTab = () => {
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [pageName, setPageName] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZES[0]);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingCountry, setPendingCountry] = useState("");
  const [pendingPageName, setPendingPageName] = useState("");
  const [userList, setUserList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await api.getUserAccessLogs({
        search,
        country,
        pageName,
        limit,
        page,
      });
      setLogs(result.data || []);
      setAnalytics(result.analytics || {});
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, country, pageName, limit, page]);

  const applyFilters = () => {
    setSearch(pendingSearch.trim());
    setCountry(pendingCountry.trim());
    setPageName(pendingPageName.trim());
    setPage(1);
  };

  const resetFilters = () => {
    setPendingSearch("");
    setPendingCountry("");
    setPendingPageName("");
    setSearch("");
    setCountry("");
    setPageName("");
    setPage(1);
    setShowUserModal(false);
  };

  const fetchUserList = async () => {
    setUsersLoading(true);
    try {
      const users = await api.getUserAccessUsers({ search, country, pageName });
      setUserList(users);
      setShowUserModal(true);
    } catch (err) {
      setError(err.message || "Failed to load user list");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleExport = () => {
    if (!logs.length) return;

    const headers = [
      "User",
      "Email",
      "Page",
      "Country",
      "IP",
      "Browser",
      "OS",
      "Device",
      "Timestamp",
    ];
    const rows = logs.map((log) => [
      log.userName || "Unknown",
      log.userEmail || "Unknown",
      getPageName(log.page),
      log.country || "Unknown",
      log.ip || "Unknown",
      [log.browserName, log.browserVersion]
        .filter(Boolean)
        .join(" ") || "Unknown",
      [log.osName, log.osVersion].filter(Boolean).join(" ") || "Unknown",
      [log.deviceType, log.deviceModel]
        .filter(Boolean)
        .join(" ") || "Unknown",
      new Date(log.timestamp).toLocaleString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `access-analytics-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Access Analytics</h1>
          <p className="mt-2 text-lg text-gray-600">
            Track user activity, engagement patterns, and system usage across your platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:from-purple-700 hover:to-blue-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-widest text-gray-500">
            Total page views
          </div>
          <div className="mt-4 text-4xl font-bold text-gray-900">
            {analytics.totalLogs ?? 0}
          </div>
          <div className="mt-3 text-xs text-gray-500">All recorded interactions</div>
        </div>

        <button
          onClick={fetchUserList}
          className="group rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 text-left shadow-sm transition hover:border-purple-400 hover:shadow-md"
        >
          <div className="text-xs uppercase tracking-widest text-purple-600">
            Unique users
          </div>
          <div className="mt-4 text-4xl font-bold text-purple-900">
            {analytics.uniqueUsers ?? 0}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-purple-700">
            <Eye className="w-4 h-4" />
            Click to view user list
          </div>
        </button>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-widest text-gray-500">
            Unique pages
          </div>
          <div className="mt-4 text-4xl font-bold text-gray-900">
            {analytics.uniquePages ?? 0}
          </div>
          <div className="mt-3 text-xs text-gray-500">Pages accessed</div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-widest text-gray-500">
            Top country
          </div>
          <div className="mt-4 text-2xl font-bold text-gray-900">
            {(analytics.topCountries?.[0]?.name || "—").substring(0, 3)}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            {analytics.topCountries?.[0]?.count ? `${analytics.topCountries[0].count} views` : "No data"}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-widest text-gray-500">
            Top browser
          </div>
          <div className="mt-4 text-xl font-bold text-gray-900 truncate">
            {analytics.topBrowsers?.[0]?.name || "—"}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            {analytics.topBrowsers?.[0]?.count ? `${analytics.topBrowsers[0].count} views` : "No data"}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Top Pages</h3>
          <div className="mt-4 space-y-3">
            {(analytics.topPages || []).slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {getPageName(item.name)}
                  </p>
                  <p className="truncate text-xs text-gray-500">{item.name}</p>
                </div>
                <span className="ml-2 inline-block whitespace-nowrap rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">
                  {item.count}
                </span>
              </div>
            ))}
            {(!analytics.topPages || analytics.topPages.length === 0) && (
              <p className="text-sm text-gray-500">No data available</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Top Devices</h3>
          <div className="mt-4 space-y-3">
            {(analytics.topDevices || []).slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <span className="text-sm font-medium text-gray-900">
                  {item.name || "Unknown"}
                </span>
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-900">
                  {item.count}
                </span>
              </div>
            ))}
            {(!analytics.topDevices || analytics.topDevices.length === 0) && (
              <p className="text-sm text-gray-500">No data available</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Top OS</h3>
          <div className="mt-4 space-y-3">
            {(analytics.topOS || []).slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <span className="text-sm font-medium text-gray-900">
                  {item.name || "Unknown"}
                </span>
                <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900">
                  {item.count}
                </span>
              </div>
            ))}
            {(!analytics.topOS || analytics.topOS.length === 0) && (
              <p className="text-sm text-gray-500">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters & Search</h3>
        <div className="grid gap-4 lg:grid-cols-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
                placeholder="Name, email, IP, browser…"
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              value={pendingCountry}
              onChange={(e) => setPendingCountry(e.target.value)}
              placeholder="e.g. US, IN, GB"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page / Route
            </label>
            <input
              value={pendingPageName}
              onChange={(e) => setPendingPageName(e.target.value)}
              placeholder="e.g. /dashboard, /test"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={applyFilters}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Clear All
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-purple-500"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-16">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-r-purple-600" />
            <p className="text-gray-600">Loading access logs…</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      User
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Page
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Country
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Browser
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Device
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log._id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {log.userName || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {log.userEmail || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {getPageName(log.page)}
                          </span>
                          <span className="truncate text-xs text-gray-500">
                            {log.page}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {log.country || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900">
                            {log.browserName || "Unknown"}
                          </span>
                          {log.browserVersion && (
                            <span className="text-xs text-gray-500">
                              v{log.browserVersion}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex flex-col">
                          <span className="capitalize text-gray-900">
                            {log.deviceType || "Unknown"}
                          </span>
                          {log.osName && (
                            <span className="text-xs text-gray-500">
                              {log.osName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(log.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:flex-row">
            <div className="text-sm text-gray-600">
              <strong>Page {page} of {totalPages}</strong> · Showing {logs.length} of{" "}
              {analytics.totalLogs || 0} records
            </div>
            <div className="flex gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage(Math.max(page - 1, 1))}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(Math.min(page + 1, totalPages))}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* User List Modal */}
      <UserListModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        users={userList}
        loading={usersLoading}
      />
    </div>
  );
};

export default AdminUserAccessTab;
