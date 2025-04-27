import React, { useState, useEffect } from "react";
import "../css/SearchComponent.css";
import { searchTypes, formFieldsConfig } from "../variables/form";
import {
  deleteData,
  getData,
  getDataById,
  updateData,
} from "../services/generalService";
import EditFormFields from "../components/EditFormFields";

const SearchPage = () => {
  const [selectedFormType, setSelectedFormType] = useState("empresas");
  const [searchTerm, setSearchTerm] = useState("");
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedFormType]);

  useEffect(() => {
    filterData();
  }, [searchTerm, allData]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setSearchTerm("");

    try {
      const data = await getData(selectedFormType);
      if (!data) {
        setError("Erro ao buscar dados. Formato de resposta inválido.");
        setAllData([]);
      } else {
        let processedData = data;

        if (selectedFormType === "animais") {
          processedData = data.map((animal) => {
            if (animal.tutor == null) return { ...animal, adotado: "Não" };
            else if (animal.tutor) return { ...animal, adotado: "sim" };

            return animal;
          });
        }

        if (selectedFormType === "agendamentos" && Array.isArray(data)) {
          processedData = await Promise.all(
            data.map(async (item) => {
              const enrichedItem = { ...item };

              if (item.animal_id && !item.animal) {
                try {
                  const animalData = await getDataById(
                    "animais",
                    item.animal_id
                  );
                  enrichedItem.animal = animalData;
                } catch (error) {
                  console.error("Error fetching animal data:", error);
                }
              }

              if (item.colaborador_id && !item.colaborador) {
                try {
                  const colaboradorData = await getDataById(
                    "colaboradores",
                    item.colaborador_id
                  );
                  enrichedItem.colaborador = colaboradorData;
                } catch (error) {
                  console.error("Error fetching colaborador data:", error);
                }
              }

              return enrichedItem;
            })
          );
        }

        setAllData(processedData);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError(`Erro ao buscar dados: ${error.message || "Erro desconhecido"}`);
      setAllData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    if (!searchTerm.trim()) {
      setFilteredData(allData);
      return;
    }

    const filteredResults = allData.filter((item) => {
      return Object.values(item).some(
        (value) =>
          value !== null &&
          value !== undefined &&
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    setFilteredData(filteredResults);
  };

  const handleFormTypeChange = (typeId) => {
    setSelectedFormType(typeId);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const openEditModal = async (record) => {
    try {
      const response = await getDataById(selectedFormType, record.id);
      setSelectedRecord(record);

      if (
        selectedFormType === "animais" &&
        response.tutor &&
        response.tutor.id
      ) {
        try {
          const tutorResponse = await getDataById("tutores", response.tutor.id);

          const enhancedResponse = {
            ...response,
            tutor: tutorResponse,
            adotado: "yes",
          };

          setEditFormData(enhancedResponse);
        } catch (tutorError) {
          console.error("Erro ao buscar dados do tutor:", tutorError);
          setEditFormData({
            ...response,
            adotado: response.tutor ? "yes" : "no",
          });
        }
      } else setEditFormData(response);
    } catch (error) {
      console.error("Erro ao carregar registro para edição:", error);
      setError(
        `Erro ao carregar dados para edição: ${
          error.message || "Erro desconhecido"
        }`
      );
    }
  };

  const closeEditModal = () => {
    setSelectedRecord(null);
    setEditFormData({});
  };

  const handleEditInputChange = (e, path) => {
    const { name, value, type, checked } = e.target;
    const isNested = e.target.getAttribute("data-nested") === "true";

    let fieldValue;
    if (type === "checkbox") {
      fieldValue = checked;
    } else if (type === "date" && value) {
      fieldValue = value;
    } else {
      fieldValue = value;
    }

    if (isNested && path) {
      setEditFormData((prev) => {
        const newData = JSON.parse(JSON.stringify(prev));

        const parts = path.split(".");
        let current = newData;

        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = fieldValue;
        return newData;
      });
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));
    }
  };

  const handleUpdateRecord = async () => {
    if (!selectedRecord) return;

    setIsUpdating(true);
    setError(null);

    try {
      const dataToUpdate = { ...editFormData };

      if (selectedFormType === "animais") {
        delete dataToUpdate.adotado;

        if (
          dataToUpdate.tutor_id &&
          (!dataToUpdate.tutor ||
            dataToUpdate.tutor.id != dataToUpdate.tutor_id)
        ) {
          try {
            const tutorData = await getDataById(
              "tutores",
              dataToUpdate.tutor_id
            );
            dataToUpdate.tutor = tutorData;
          } catch (error) {
            console.error("Erro ao buscar dados completos do tutor:", error);
            dataToUpdate.tutor = { id: dataToUpdate.tutor_id };
          }
        } else if (dataToUpdate.adotado === "no" || !dataToUpdate.tutor_id) {
          dataToUpdate.tutor = null;
        }

        delete dataToUpdate.tutor_id;
      }

      await updateData(selectedFormType, selectedRecord.id, dataToUpdate);

      const updatedData = allData.map((item) => {
        if (item.id === selectedRecord.id) {
          return { ...item, ...dataToUpdate };
        }
        return item;
      });

      setAllData(updatedData);
      closeEditModal();
    } catch (error) {
      console.error("Erro ao atualizar registro:", error);
      setError(`Erro ao atualizar: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRequest = (itemId) => {
    setConfirmDelete(itemId);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteData(selectedFormType, confirmDelete);

      setAllData((prev) => prev.filter((item) => item.id !== confirmDelete));

      setConfirmDelete(null);
    } catch (error) {
      console.error("Erro ao excluir registro:", error);
      setError(`Erro ao excluir: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDelete(null);
  };

  const shouldDisplayField = (field) => {
    if (!field.condition) return true;

    const { field: conditionField, value: conditionValue } = field.condition;
    return editFormData[conditionField] === conditionValue;
  };

  const getColumns = () => {
    const fields = formFieldsConfig[selectedFormType];
    if (!fields) return [];

    return fields
      .filter((field) => !field.condition)
      .map((field) => ({
        id: field.id,
        header: field.label.replace(":", ""),
        accessor: field.name,
        path: field.path,
        nested: field.nested,
      }));
  };

  const renderEditModal = () => {
    if (!selectedRecord) return null;

    return (
      <div className="edit-modal-overlay" onClick={() => closeEditModal()}>
        <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
          <div className="edit-modal-header">
            <h3>Editar {selectedFormType}</h3>
            <button className="close-modal-btn" onClick={closeEditModal}>
              &times;
            </button>
          </div>

          <div className="edit-modal-body">
            <EditFormFields
              selectedFormType={selectedFormType}
              formFieldsConfig={formFieldsConfig}
              editFormData={editFormData}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
              handleEditInputChange={handleEditInputChange}
              shouldDisplayField={shouldDisplayField}
            />
          </div>

          <div className="edit-modal-footer">
            <div className="right-actions">
              <button
                className="cancel-button"
                onClick={closeEditModal}
                disabled={isDeleting || isUpdating}
              >
                Cancelar
              </button>
              <button
                className="save-button"
                onClick={handleUpdateRecord}
                disabled={isDeleting || isUpdating}
              >
                {isUpdating ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmDeleteModal = () => {
    if (confirmDelete === null) return null;

    return (
      <div className="edit-modal-overlay">
        <div className="confirm-modal">
          <div className="confirm-modal-header">
            <h3>Confirmar Exclusão</h3>
          </div>
          <div className="confirm-modal-body">
            <p>Tem certeza que deseja excluir este registro?</p>
            <p>Esta ação não pode ser desfeita.</p>
          </div>
          <div className="confirm-modal-footer">
            <button
              className="cancel-button"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              className="delete-button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTableCell = (item, column) => {
    let value;

    if (selectedFormType === "agendamentos") {
      if (column.accessor === "animal_id" && item.animal) {
        return item.animal.apelido || `Animal #${item.animal.id}`;
      }
      if (column.accessor === "colaborador_id" && item.colaborador) {
        return item.colaborador.nome || `Colaborador #${item.colaborador.id}`;
      }
      if (column.accessor === "tutor_id" && item.tutor) {
        return item.tutor.nome || `Tutor #${item.tutor.id}`;
      }
    }

    if (column.nested && column.path) {
      const pathParts = column.path.split(".");
      let currentObj = item;

      for (const part of pathParts) {
        if (!currentObj || !currentObj[part]) {
          value = null;
          break;
        }
        currentObj = currentObj[part];
      }
      value = currentObj;
    } else value = item[column.accessor];

    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    if (value instanceof Date) return value.toLocaleDateString("pt-BR");

    if (
      typeof value === "string" &&
      (column.accessor.includes("data") || /^\d{4}-\d{2}-\d{2}T?.*/.test(value))
    ) {
      try {
        if (value.includes("T")) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString("pt-BR");
          }
        } else {
          const [year, month, day] = value
            .split("-")
            .map((num) => parseInt(num, 10));
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString("pt-BR");
        }
      } catch (e) {
        console.error("Erro ao formatar data:", e);
      }
    }

    return String(value);
  };

  return (
    <div className="page-container">
      <div className="search-container">
        <div className="table-tabs-wrapper">
          <div className="table-tabs">
            {searchTypes.map((type) => (
              <button
                key={type.id}
                className={`table-tab ${
                  selectedFormType === type.id ? "active" : ""
                }`}
                onClick={() => handleFormTypeChange(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder={`Pesquisar em ${
                searchTypes.find((t) => t.id === selectedFormType)?.label
              }`}
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          {isLoading ? (
            <div className="loading-indicator">Carregando dados...</div>
          ) : filteredData.length === 0 ? (
            <div className="no-results">
              {searchTerm
                ? "Nenhum resultado encontrado"
                : "Nenhum registro disponível"}
            </div>
          ) : (
            <div className="responsive-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="column-id">ID</th>
                    {getColumns().map((column) => (
                      <th key={column.id}>{column.header}</th>
                    ))}
                    <th className="column-actions">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id} onClick={() => openEditModal(item)}>
                      <td className="column-id">{item.id}</td>
                      {getColumns().map((column) => (
                        <td key={`${item.id}-${column.id}`}>
                          {renderTableCell(item, column)}
                        </td>
                      ))}
                      <td className="column-actions">
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(item);
                            }}
                          >
                            Editar
                          </button>

                          <button
                            className="delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRequest(item.id);
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {renderEditModal()}
      {renderConfirmDeleteModal()}
    </div>
  );
};

export default SearchPage;
