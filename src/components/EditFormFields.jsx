import React, { useEffect, useState } from "react";
import "../css/EditForm.css";
import { getData } from "../services/generalService";

const EditFormFields = ({
  selectedFormType,
  formFieldsConfig,
  editFormData,
  isUpdating,
  isDeleting,
  handleEditInputChange,
  shouldDisplayField,
}) => {
  const [apiOptions, setApiOptions] = useState({});
  const [isLoadingOptions, setIsLoadingOptions] = useState({});

  // Load API data for select_api fields
  useEffect(() => {
    if (!selectedFormType || !formFieldsConfig[selectedFormType]) return;

    const fields = formFieldsConfig[selectedFormType];
    const apiFields = fields.filter(
      (field) =>
        field.type === "select_api" &&
        field.apiSource &&
        shouldDisplayField(field)
    );

    apiFields.forEach(async (field) => {
      if (!apiOptions[field.apiSource]) {
        setIsLoadingOptions((prev) => ({ ...prev, [field.apiSource]: true }));
        try {
          const data = await getData(field.apiSource);
          setApiOptions((prev) => ({ ...prev, [field.apiSource]: data || [] }));
        } catch (error) {
          console.error(
            `Erro ao carregar opções para ${field.apiSource}:`,
            error
          );
        } finally {
          setIsLoadingOptions((prev) => ({
            ...prev,
            [field.apiSource]: false,
          }));
        }
      }
    });
  }, [selectedFormType, formFieldsConfig, shouldDisplayField]);

  if (!selectedFormType || !formFieldsConfig[selectedFormType]) return null;

  // For animal forms, handle tutor relationship with adoption status
  useEffect(() => {
    if (selectedFormType === "animais" && editFormData) {
      // If there's a tutor, ensure adotado is set to "yes"
      if (editFormData.tutor && !editFormData.adotado) {
        handleEditInputChange(
          {
            target: {
              name: "adotado",
              value: "yes",
              getAttribute: () => "false",
            },
          },
          null
        );
      }
      // If adotado is explicitly set to "no", ensure tutor is null
      else if (editFormData.adotado === "no" && editFormData.tutor) {
        handleEditInputChange(
          {
            target: { name: "tutor", value: null, getAttribute: () => "false" },
          },
          null
        );
      }
    }
  }, [editFormData, selectedFormType]);

  const getNestedValue = (obj, path) => {
    if (!path) return "";
    const parts = path.split(".");
    let value = obj;

    for (const part of parts) {
      if (value === null || value === undefined) return "";
      value = value[part];
    }

    return value || "";
  };

  return formFieldsConfig[selectedFormType].map((field) => {
    // Special handling for animal adoption fields
    if (
      selectedFormType === "animais" &&
      field.condition?.field === "adotado"
    ) {
      // Show tutor fields only if adotado is "yes" or if there's already a tutor
      const isAdopted =
        editFormData.adotado === "yes" ||
        (editFormData.tutor && Object.keys(editFormData.tutor).length > 0);

      if (!isAdopted && field.condition.value === "yes") {
        return null;
      }
    }

    if (!shouldDisplayField(field)) return null;

    // Special handling for tutor_id field
    let fieldValue;
    if (field.name === "tutor_id" && editFormData.tutor) {
      fieldValue = editFormData.tutor.id || "";
    } else {
      fieldValue = field.nested
        ? getNestedValue(editFormData, field.path)
        : editFormData[field.name] || "";
    }

    return (
      <div className="edit-form-field" key={field.id}>
        <label>{field.label}</label>

        {field.type === "select" ? (
          <select
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleEditInputChange(e, field.path)}
            disabled={isUpdating || isDeleting}
            required={field.required}
            data-nested={field.nested ? "true" : "false"}
            data-path={field.path}
          >
            <option value="">Selecione...</option>

            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === "select_api" ? (
          <select
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleEditInputChange(e, field.path)}
            disabled={
              isUpdating || isDeleting || isLoadingOptions[field.apiSource]
            }
            required={field.required}
            data-nested={field.nested ? "true" : "false"}
            data-path={field.path}
          >
            <option value="">
              {isLoadingOptions[field.apiSource]
                ? "Carregando..."
                : "Selecione..."}
            </option>
            {apiOptions[field.apiSource]?.map((option) => (
              <option
                key={option[field.valueField]}
                value={option[field.valueField]}
              >
                {option[field.labelField] || `ID: ${option[field.valueField]}`}
              </option>
            ))}
          </select>
        ) : field.type === "file" ? (
          <div className="file-input-container">
            {editFormData[`${field.name}_url`] && (
              <div className="current-file">
                Arquivo atual:{" "}
                {editFormData[`${field.name}_url`].split("/").pop()}
              </div>
            )}
            <input
              type="file"
              name={field.name}
              onChange={(e) => handleEditInputChange(e, field.path)}
              disabled={isUpdating || isDeleting}
              data-nested={field.nested ? "true" : "false"}
              data-path={field.path}
            />
          </div>
        ) : field.type === "text" && field.multiline ? (
          <textarea
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleEditInputChange(e, field.path)}
            disabled={isUpdating || isDeleting}
            required={field.required}
            rows="3"
            data-nested={field.nested ? "true" : "false"}
            data-path={field.path}
          ></textarea>
        ) : field.nested ? (
          <input
            type={field.type}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleEditInputChange(e, field.path)}
            disabled={isUpdating || isDeleting}
            required={field.required}
            data-nested="true"
            data-path={field.path}
          />
        ) : (
          <input
            type={field.type}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleEditInputChange(e, field.path)}
            disabled={isUpdating || isDeleting}
            required={field.required}
            data-nested="false"
          />
        )}
      </div>
    );
  });
};

export default EditFormFields;
