import React, { useState, useEffect } from "react";
import "../css/ReportsPage.css";
import {
  animalReportTypes,
  getColumnsForReportType,
} from "../variables/reports";
import ExportCSVButton from "../components/ExportCSVButton";
import { getData } from "../services/reports";

const ReportsPage = () => {
  const [selectedReportType, setSelectedReportType] =
    useState("animais_da_ong");
  const [tableData, setTableData] = useState({ columns: [], rows: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTableData();
  }, [selectedReportType]);

  const handleReportTypeChange = (typeId) => {
    setSelectedReportType(typeId);
  };

  const loadTableData = async () => {
    setIsLoading(true);
    setError(null);

    const columns = getColumnsForReportType(selectedReportType);

    try {
      const params = {};

      const rows = await getData(selectedReportType, params);

      if (!rows) {
        throw new Error("Dados inválidos recebidos do servidor");
      }

      setTableData({ columns, rows });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError(
        `Erro ao carregar relatório: ${error.message || "Erro desconhecido"}`
      );
      setTableData({ columns, rows: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCellValue = (value, type) => {
    if (value === undefined || value === null) return "-";

    switch (type) {
      case "date":
        try {
          return new Date(value).toLocaleDateString();
        } catch (e) {
          console.error(e);
          return value;
        }
      case "boolean":
        return value ? "Sim" : "Não";
      default:
        return String(value);
    }
  };

  const getReportTitle = () => {
    const reportType = animalReportTypes.find(
      (t) => t.id === selectedReportType
    );
    return reportType ? reportType.label : "Relatório";
  };

  return (
    <div className="page-container">
      <div className="reports-container">
        <div className="table-tabs">
          {animalReportTypes.map((type) => (
            <button
              key={type.id}
              className={`table-tab ${
                selectedReportType === type.id ? "active" : ""
              }`}
              onClick={() => handleReportTypeChange(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-container">
          {isLoading ? (
            <div className="loading-indicator">Carregando dados...</div>
          ) : !tableData.rows || tableData.rows.length === 0 ? (
            <div className="no-results">
              Nenhum dado encontrado para este relatório
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  {tableData.columns.map((column) => (
                    <th key={column.key}>{column.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, index) => (
                  <tr key={row.id || `row-${index}`}>
                    {tableData.columns.map((column) => (
                      <td key={`${row.id || index}-${column.key}`}>
                        {formatCellValue(row[column.key], column.type)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <ExportCSVButton
          className="export-button"
          tableData={tableData}
          reportName={getReportTitle()}
          disabled={isLoading || !tableData.rows || tableData.rows.length === 0}
        />
      </div>
    </div>
  );
};

export default ReportsPage;
