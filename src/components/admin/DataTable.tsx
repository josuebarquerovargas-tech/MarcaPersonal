import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty = "Sin registros.",
  minWidth = 640,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: string;
  minWidth?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-line bg-surface">
      <table className="w-full text-sm" style={{ minWidth }}>
        <thead className="text-left text-xs uppercase tracking-wide text-muted">
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-3 font-medium ${c.align === "right" ? "text-right" : ""}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-b border-line last:border-0">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 align-middle ${c.align === "right" ? "text-right tabular-nums" : ""}`}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="px-4 py-10 text-center text-muted">{empty}</p>}
    </div>
  );
}
