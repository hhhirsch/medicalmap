"use client";

import { type CongressRow } from "@medicalmap/shared";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";

interface Props {
  items: CongressRow[];
  sort: string;
  dir: string;
  onSort: (col: string) => void;
  onRowClick: (congress: CongressRow) => void;
  loading: boolean;
}

function SortIcon({ col, sort, dir }: { col: string; sort: string; dir: string }) {
  if (sort !== col) return <span className="text-gray-300 ml-1">↕</span>;
  return <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
}

export function CongressTable({ items, sort, dir, onSort, onRowClick, loading }: Props) {
  const columns = useMemo<ColumnDef<CongressRow, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => (
          <button onClick={() => onSort("name")} className="flex items-center font-semibold">
            Name <SortIcon col="name" sort={sort} dir={dir} />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "indication",
        header: "Indication",
      },
      {
        accessorKey: "tier",
        header: () => (
          <button onClick={() => onSort("tier")} className="flex items-center font-semibold">
            Tier <SortIcon col="tier" sort={sort} dir={dir} />
          </button>
        ),
        cell: ({ row }) => {
          const t = row.original.tier;
          const colors = { 1: "bg-blue-100 text-blue-700", 2: "bg-yellow-100 text-yellow-700", 3: "bg-gray-100 text-gray-600" };
          return (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[t as keyof typeof colors] || ""}`}>
              Tier {t}
            </span>
          );
        },
      },
      {
        accessorKey: "region",
        header: "Region",
      },
      {
        accessorKey: "country",
        header: "Country",
        cell: ({ row }) => row.original.country || "—",
      },
      {
        accessorKey: "city",
        header: "City",
        cell: ({ row }) => row.original.city || "—",
      },
      {
        accessorKey: "start_date",
        header: () => (
          <button onClick={() => onSort("start_date")} className="flex items-center font-semibold">
            Start Date <SortIcon col="start_date" sort={sort} dir={dir} />
          </button>
        ),
        cell: ({ row }) => row.original.start_date || "—",
      },
    ],
    [sort, dir, onSort]
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${loading ? "opacity-60" : ""}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-gray-50 border-b border-gray-200">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  No congresses match your filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row.original)}
                  className="border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
