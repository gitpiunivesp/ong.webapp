import React, { useState, useEffect, useRef } from "react";
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

  // ACESSIBILIDADE: Refs para gerenciar o foco do teclado nos modais
  const triggerButtonRef = useRef(null);
  const editModalRef = useRef(null);
  const confirmModalRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [selectedFormType]);

  useEffect(() => {
    filterData();
  }, [searchTerm, allData]);

  // ACESSIBILIDADE: Efeito para mover o foco para o modal de edição quando ele abre
  useEffect(() => {
    if (selectedRecord && editModalRef.current) {
      editModalRef.current.focus();
    }
  }, [selectedRecord]);

  // ACESSIBILIDADE: Efeito para mover o foco para o modal de exclusão quando ele abre
  useEffect(() => {
    if (confirmDelete !== null && confirmModalRef.current) {
      confirmModalRef.current.focus();
    }
  }, [confirmDelete]);

  const fetchData = async () => {
    // ... (Sua lógica de fetchData permanece a mesma, ela já é ótima)
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
            processedData = data.map((animal) => ({ ...animal, adotado: animal.tutor ? "Sim" : "Não" }));
        }
        if (selectedFormType === "agendamentos" && Array.isArray(data)) {
          processedData = await Promise.all(
            data.map(async (item) => {
              const enrichedItem = { ...item };
              if (item.animal_id && !item.animal) {
                try {
                  const animalData = await getDataById("animais", item.animal_id);
                  enrichedItem.animal = animalData;
                } catch (e) { console.error("Error fetching animal data:", e); }
              }
              if (item.colaborador_id && !item.colaborador) {
                  try {
                      const colaboradorData = await getDataById("colaboradores", item.colaborador_id);
                      enrichedItem.colaborador = colaboradorData;
                  } catch (e) { console.error("Error fetching colaborador data:", e); }
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
    // ... (Sua lógica de filterData permanece a mesma)
    if (!searchTerm.trim()) {
        setFilteredData(allData);
        return;
    }
    const filteredResults = allData.filter((item) => {
        return Object.values(item).some(
            (value) => value !== null && value !== undefined && String(value).toLowerCase().includes(searchTerm.toLowerCase())
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

  const openEditModal = async (record, triggerElement) => {
    // ACESSIBILIDADE: Guarda o botão que abriu o modal
    if (triggerElement) triggerButtonRef.current = triggerElement;

    try {
      const response = await getDataById(selectedFormType, record.id);
      setSelectedRecord(record);

      if (selectedFormType === "animais" && response.tutor && response.tutor.id) {
        try {
          const tutorResponse = await getDataById("tutores", response.tutor.id);
          const enhancedResponse = { ...response, tutor: tutorResponse, adotado: "yes" };
          setEditFormData(enhancedResponse);
        } catch (tutorError) {
          console.error("Erro ao buscar dados do tutor:", tutorError);
          setEditFormData({ ...response, adotado: response.tutor ? "yes" : "no" });
        }
      } else {
        setEditFormData(response);
      }
    } catch (error) {
      console.error("Erro ao carregar registro para edição:", error);
      setError(`Erro ao carregar dados para edição: ${error.message || "Erro desconhecido"}`);
    }
  };

  const closeEditModal = () => {
    setSelectedRecord(null);
    setEditFormData({});
    // ACESSIBILIDADE: Devolve o foco para o botão original
    if (triggerButtonRef.current) {
      triggerButtonRef.current.focus();
    }
  };
  
  const handleEditInputChange = (e, path) => {
    // ... (Sua lógica de handleEditInputChange permanece a mesma)
    const { name, value, type, checked } = e.target;
    const isNested = e.target.getAttribute("data-nested") === "true";
    let fieldValue = type === "checkbox" ? checked : value;

    if (isNested && path) {
        setEditFormData((prev) => {
            const newData = JSON.parse(JSON.stringify(prev));
            const parts = path.split(".");
            let current = newData;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = fieldValue;
            return newData;
        });
    } else {
        setEditFormData((prev) => ({...prev, [name]: fieldValue }));
    }
  };

  const handleUpdateRecord = async () => {
    // ... (Sua lógica de handleUpdateRecord permanece a mesma)
    if (!selectedRecord) return;
    setIsUpdating(true);
    setError(null);
    try {
        const dataToUpdate = { ...editFormData };
        // Lógica específica para animais
        if (selectedFormType === "animais") {
            delete dataToUpdate.adotado;
            if (dataToUpdate.tutor_id && (!dataToUpdate.tutor || dataToUpdate.tutor.id != dataToUpdate.tutor_id)) {
                try {
                    const tutorData = await getDataById("tutores", dataToUpdate.tutor_id);
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
        const updatedData = allData.map((item) => item.id === selectedRecord.id ? { ...item, ...dataToUpdate } : item);
        setAllData(updatedData);
        closeEditModal();
    } catch (error) {
        console.error("Erro ao atualizar registro:", error);
        setError(`Erro ao atualizar: ${error.message || "Erro desconhecido"}`);
    } finally {
        setIsUpdating(false);
    }
  };

  const handleDeleteRequest = (itemId, triggerElement) => {
    // ACESSIBILIDADE: Guarda o botão que abriu o modal
    if (triggerElement) triggerButtonRef.current = triggerElement;
    setConfirmDelete(itemId);
  };

  const handleDeleteConfirm = async () => {
    // ... (Sua lógica de handleDeleteConfirm permanece a mesma)
    if (!confirmDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
        await deleteData(selectedFormType, confirmDelete);
        setAllData((prev) => prev.filter((item) => item.id !== confirmDelete));
        setConfirmDelete(null);
        // ACESSIBILIDADE: Devolve o foco após a ação
        if (triggerButtonRef.current) {
            triggerButtonRef.current.focus();
        }
    } catch (error) {
        console.error("Erro ao excluir registro:", error);
        setError(`Erro ao excluir: ${error.message || "Erro desconhecido"}`);
    } finally {
        setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDelete(null);
    // ACESSIBILIDADE: Devolve o foco para o botão original
    if (triggerButtonRef.current) {
      triggerButtonRef.current.focus();
    }
  };
  
  const shouldDisplayField = (field) => {
    // ... (Sua lógica de shouldDisplayField permanece a mesma)
    if (!field.condition) return true;
    const { field: conditionField, value: conditionValue } = field.condition;
    return editFormData[conditionField] === conditionValue;
  };

  const getColumns = () => {
    // ... (Sua lógica de getColumns permanece a mesma)
    const fields = formFieldsConfig[selectedFormType];
    if (!fields) return [];
    return fields
      .filter((field) => !field.condition)
      .map((field) => ({ id: field.id, header: field.label.replace(":", ""), accessor: field.name, path: field.path, nested: field.nested }));
  };
  
  const renderTableCell = (item, column) => {
    // ... (Sua lógica avançada de renderTableCell permanece a mesma)
    let value;
    if (selectedFormType === "agendamentos") {
        if (column.accessor === "animal_id" && item.animal) return item.animal.apelido || `Animal #${item.animal.id}`;
        if (column.accessor === "colaborador_id" && item.colaborador) return item.colaborador.nome || `Colaborador #${item.colaborador.id}`;
        if (column.accessor === "tutor_id" && item.tutor) return item.tutor.nome || `Tutor #${item.tutor.id}`;
    }
    if (column.nested && column.path) {
        const pathParts = column.path.split(".");
        let currentObj = item;
        for (const part of pathParts) {
            if (!currentObj || !currentObj[part]) { value = null; break; }
            currentObj = currentObj[part];
        }
        value = currentObj;
    } else {
        value = item[column.accessor];
    }
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T?.*/.test(value)) {
        try {
            const date = new Date(value);
            return isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR", { timeZone: 'UTC' });
        } catch (e) { return value; }
    }
    return String(value);
  };
  
  // O JSX abaixo agora inclui todos os atributos de acessibilidade da primeira versão
  return (
    <div className="page-container">
      <div className="search-container">
        <div className="table-tabs-wrapper">
          {/* ACESSIBILIDADE: Roles para navegação por abas */}
          <div className="table-tabs" role="tablist" aria-label="Tipos de consulta">
            {searchTypes.map((type) => (
              <button
                key={type.id}
                role="tab"
                aria-selected={selectedFormType === type.id}
                className={`table-tab ${selectedFormType === type.id ? "active" : ""}`}
                onClick={() => handleFormTypeChange(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-message" role="alert">{error}</div>}

        <div className="table-container">
          <div className="search-bar">
            {/* ACESSIBILIDADE: Label para leitores de tela */}
            <label htmlFor="searchInput" className="sr-only">
              Pesquisar em {searchTypes.find((t) => t.id === selectedFormType)?.label}
            </label>
            <input
              type="text"
              id="searchInput"
              placeholder={`Pesquisar em ${searchTypes.find((t) => t.id === selectedFormType)?.label}`}
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          {/* ACESSIBILIDADE: Status de carregamento para leitores de tela */}
          <div role="status" aria-live="polite">
            {isLoading && <div className="loading-indicator">Carregando dados...</div>}
          </div>

          {!isLoading && filteredData.length === 0 ? (
            <div className="no-results" role="status">
              {searchTerm ? "Nenhum resultado encontrado." : "Nenhum registro disponível."}
            </div>
          ) : !isLoading && (
            <div className="responsive-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col" className="column-id">ID</th>
                    {getColumns().map((column) => (
                      <th scope="col" key={column.id}>{column.header}</th>
                    ))}
                    <th scope="col" className="column-actions">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id}>
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
                            // ACESSIBILIDADE: Label descritiva para leitores de tela
                            aria-label={`Editar ${item.nome || item.apelido || `registro ${item.id}`}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(item, e.currentTarget);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            className="delete-button"
                            // ACESSIBILIDADE: Label descritiva para leitores de tela
                            aria-label={`Excluir ${item.nome || item.apelido || `registro ${item.id}`}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRequest(item.id, e.currentTarget);
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
      
      {/* Modais com Acessibilidade */}
      {selectedRecord && (
        <div className="edit-modal-overlay" onClick={closeEditModal}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="edit-modal-title" aria-modal="true">
            <div className="edit-modal-header">
              <h3 id="edit-modal-title">Editar {searchTypes.find(t => t.id === selectedFormType)?.label}</h3>
              <button className="close-modal-btn" onClick={closeEditModal} aria-label="Fechar modal de edição">&times;</button>
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
                <button
                    className="cancel-button"
                    onClick={closeEditModal}
                    disabled={isDeleting || isUpdating}
                    // ACESSIBILIDADE: Ref para foco inicial
                    ref={editModalRef} 
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
      )}

      {confirmDelete !== null && (
        <div className="edit-modal-overlay">
          <div className="confirm-modal" role="alertdialog" aria-labelledby="confirm-modal-title" aria-describedby="confirm-modal-desc" aria-modal="true">
            <div className="confirm-modal-header">
              <h3 id="confirm-modal-title">Confirmar Exclusão</h3>
            </div>
            <div className="confirm-modal-body" id="confirm-modal-desc">
              <p>Tem certeza que deseja excluir este registro?</p>
              <p>Esta ação não pode ser desfeita.</p>
            </div>
            <div className="confirm-modal-footer">
              <button
                className="cancel-button"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                // ACESSIBILIDADE: Ref para foco inicial
                ref={confirmModalRef}
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
      )}
    </div>
  );
};

export default SearchPage;
