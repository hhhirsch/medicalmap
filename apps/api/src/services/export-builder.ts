import ExcelJS from "exceljs";

const CSV_COLUMNS = [
  "name",
  "indication",
  "tier",
  "region",
  "scope",
  "country",
  "city",
  "start_date",
  "end_date",
  "typical_month",
  "website_url",
  "tags",
  "organizer",
  "indication_detail",
  "location_text",
  "deadlines_text",
  "rationale",
  "score",
];

export async function buildExportAsync(
  rows: Record<string, unknown>[],
  exportType: "csv" | "xlsx"
): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
  if (exportType === "csv") {
    return buildCsv(rows);
  }
  return buildXlsx(rows);
}

function buildCsv(rows: Record<string, unknown>[]): {
  buffer: Buffer;
  contentType: string;
  filename: string;
} {
  const header = CSV_COLUMNS.join(",");
  const lines = rows.map((row) =>
    CSV_COLUMNS.map((col) => {
      const val = row[col];
      if (val === null || val === undefined) return "";
      if (Array.isArray(val)) return `"${val.join("; ")}"`;
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(",")
  );

  const csv = [header, ...lines].join("\n");
  return {
    buffer: Buffer.from(csv, "utf-8"),
    contentType: "text/csv",
    filename: `congresses-export-${Date.now()}.csv`,
  };
}

async function buildXlsx(rows: Record<string, unknown>[]): Promise<{
  buffer: Buffer;
  contentType: string;
  filename: string;
}> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Congresses");

  sheet.columns = CSV_COLUMNS.map((col) => ({
    header: col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    key: col,
    width: 20,
  }));

  for (const row of rows) {
    const data: Record<string, unknown> = {};
    for (const col of CSV_COLUMNS) {
      const val = row[col];
      data[col] = Array.isArray(val) ? val.join("; ") : val ?? "";
    }
    sheet.addRow(data);
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename: `congresses-export-${Date.now()}.xlsx`,
  };
}
