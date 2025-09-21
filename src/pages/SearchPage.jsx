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

  // Refs para gerenciar o foco do teclado nos modais
  const triggerButtonRef = useRef(null);
  const editModalRef = useRef(null);
  const confirmModalRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [selectedFormType]);

  useEffect(() => {
    filterData();
  }, [searchTerm, allData]);

  // Efeito para mover o foco para o modal de edição quando ele abre
  useEffect(() => {
    if (selectedRecord && editModalRef.current) {
      editModalRef.current.focus();
    }
  }, [selectedRecord]);

  // Efeito para mover o foco para o modal de exclusão quando ele abre
  useEffect(() => {
    if (confirmDelete !== null && confirmModalRef.current) {
      confirmModalRef.current.focus();
    }
  }, [confirmDelete]);

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
          processedData = data.map((animal) => ({
            ...animal,
            adotado: animal.tutor ? "Sim" : "Não",
          }));
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
    if (!searchTerm.trim()) {
      setFilteredData(allData);
      return;
    }
    const filteredResults = allData.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filteredResults);
  };

  const handleFormTypeChange = (typeId) => {
    setSelectedFormType(typeId);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const openEditModal = async (record, triggerElement) => {
    triggerButtonRef.current = triggerElement; // Guarda o botão que abriu o modal
    // ... restante da sua lógica para buscar os dados ...
    setSelectedRecord(record);
    setEditFormData(record); // Simplificação, ajuste conforme sua necessidade
  };

  const closeEditModal = () => {
    setSelectedRecord(null);
    setEditFormData({});
    if (triggerButtonRef.current) {
      triggerButtonRef.current.focus(); // Devolve o foco
    }
  };
  
  const handleDeleteRequest = (itemId, triggerElement) => {
    triggerButtonRef.current = triggerElement; // Guarda o botão que abriu o modal
    setConfirmDelete(itemId);
  };

  const handleDeleteCancel = () => {
    setConfirmDelete(null);
    if (triggerButtonRef.current) {
        triggerButtonRef.current.focus(); // Devolve o foco
    }
  };

  // ... Suas outras funções (handleUpdateRecord, handleDeleteConfirm, etc.) ...
  
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
  
  const renderTableCell = (item, column) => {
    // ... Sua lógica para renderizar células ...
    // Esta função parece complexa, certifique-se de que os valores retornados são strings ou números
    let value = item[column.accessor];
     if (value === null || value === undefined) return "-";
     if (typeof value === "boolean") return value ? "Sim" : "Não";
    return String(value);
  };

  const renderEditModal = () => {
    if (!selectedRecord) return null;
    return (
      <div className="edit-modal-overlay" onClick={closeEditModal}>
        <div className="edit-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="edit-modal-title" aria-modal="true">
          <div className="edit-modal-header">
            <h3 id="edit-modal-title">Editar {selectedFormType}</h3>
            <button className="close-modal-btn" onClick={closeEditModal} aria-label="Fechar modal">&times;</button>
          </div>
          <div className="edit-modal-body">
            {/* Seu componente EditFormFields aqui */}
          </div>
          <div className="edit-modal-footer">
            <button
              ref={editModalRef} // A ref é aplicada aqui para o foco inicial
              className="cancel-button"
              onClick={closeEditModal}
              disabled={isDeleting || isUpdating}
            >
              Cancelar
            </button>
            <button
              className="save-button"
              onClick={() => { /* handleUpdateRecord */ }}
              disabled={isDeleting || isUpdating}
            >
              {isUpdating ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmDeleteModal = () => {
    if (confirmDelete === null) return null;
    return (
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
              ref={confirmModalRef} // A ref é aplicada aqui para o foco inicial
              className="cancel-button"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              className="delete-button"
              onClick={() => { /* handleDeleteConfirm */ }}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="search-container">
        <div className="table-tabs-wrapper">
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
                            aria-label={`Editar ${item.nome || item.apelido || `registro ${item.id}`}`}
                            onClick={(e) => openEditModal(item, e.currentTarget)}
                          >
                            Editar
                          </button>
                          <button
                            className="delete-button"
                            aria-label={`Excluir ${item.nome || item.apelido || `registro ${item.id}`}`}
                            onClick={(e) => handleDeleteRequest(item.id, e.currentTarget)}
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
