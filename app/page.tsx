"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Pagination, Table } from "antd";
import api from "@/lib/api";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [activeQuery, setActiveQuery] = useState<string>("");

  const fetchData = async (p = page, limit = pageSize, q = activeQuery) => {
    setLoading(true);
    try {
      const res = await api.get("/invoice/list", {
        params: { page: p, limit, q },
      });
      const payload = res.data || {};
      setData(payload.invoices || []);
      setTotal(payload.total || 0);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, pageSize, activeQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, activeQuery]);

  // Debounce query input so search runs while typing
  useEffect(() => {
    const t = setTimeout(() => {
      setActiveQuery(query);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Invoices</h1>
            <p className="text-slate-600">Manage and track all your invoices</p>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setActiveQuery(query);
                    setPage(1);
                  }
                }}
                placeholder="Search by invoice # or client"
                className="border rounded-md px-3 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveQuery("");
                  setPage(1);
                }}
                className="bg-gray-100 text-slate-700 px-3 py-2 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </div>
          <Link
            href="/invoice/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            + Create Invoice
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            {(() => {
              const columns: any[] = [
                {
                  title: "Invoice #",
                  dataIndex: "invoiceNumber",
                  key: "invoiceNumber",
                  render: (val: any) => (
                    <span className="font-medium">{val}</span>
                  ),
                },
                {
                  title: "Client",
                  dataIndex: "clientName",
                  key: "clientName",
                },
                {
                  title: "Total",
                  dataIndex: "grandTotal",
                  key: "grandTotal",
                  render: (val: any) => (
                    <span className="font-semibold">₹{val}</span>
                  ),
                },
                {
                  title: "Date",
                  dataIndex: "invoiceDate",
                  key: "invoiceDate",
                },
                {
                  title: "Action",
                  key: "action",
                  render: (_: any, record: any) => (
                    <Link
                      href={`/invoice/preview?id=${record._id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View
                    </Link>
                  ),
                },
              ];

              return (
                <Table
                  columns={columns}
                  dataSource={data}
                  rowKey="_id"
                  pagination={false}
                  loading={loading}
                  locale={{
                    emptyText: (
                      <div className="px-6 py-12 text-center text-slate-500">
                        <p className="text-lg font-medium mb-1">
                          No invoices found
                        </p>
                        <p className="text-sm">
                          Create your first invoice to get started
                        </p>
                      </div>
                    ),
                  }}
                />
              );
            })()}
          </div>

          <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {data.length} of {total} invoices
            </div>
            <div>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                showSizeChanger
                onChange={(p: number, ps?: number) => {
                  if (ps && ps !== pageSize) {
                    setPageSize(ps);
                    setPage(1);
                  } else {
                    setPage(p);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
