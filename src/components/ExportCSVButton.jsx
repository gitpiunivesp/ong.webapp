import React, { useState } from "react";

const ExportCSVButton = ({ tableData, reportName, disabled = false }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    if (!tableData?.rows || tableData.rows.length == 0) return;

    setIsExporting(true);

    try {
      const columns = tableData.columns;
      const headers = columns.map((col) => col.title);

      let csvContent = headers.join(",") + "\n";

      tableData.rows.forEach((row) => {
        const rowData = columns.map((col) => {
          let value = row[col.key];

          if (col.type == "date" && value) {
            value = new Date(value).toLocaleDateString();
          }

          if (value == null || value == undefined) {
            return "";
          }

          const stringValue = String(value);
          if (
            stringValue.includes(",") ||
            stringValue.includes('"') ||
            stringValue.includes("\n")
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }

          return stringValue;
        });

        csvContent += rowData.join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);

      link.setAttribute("href", url);
      link.setAttribute("download", `${reportName}_${date}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="export-button"
      onClick={exportToCSV}
      disabled={disabled || isExporting}
    >
      {isExporting ? "Exportando..." : "Exportar para CSV"}
    </button>
  );
};

export default ExportCSVButton;
