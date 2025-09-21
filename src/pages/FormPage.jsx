import React, { useState, useEffect } from "react";
import "../css/FormComponent.css";
import { formFieldsConfig, formTypes } from "../variables/form";
import { postData, getData } from "../services/generalService";

const FormPage = () => {
  const [activeFormType, setActiveFormType] = useState("empresas");
  const [activePessoaType, setActivePessoaType] = useState("colaboradores");
  const [formValues, setFormValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiOptions, setApiOptions] = useState({});
  const [isLoadingOptions, setIsLoadingOptions] = useState({});
  const [announcement, setAnnouncement] = useState("");

  const pessoaTypes = [
    { id: "colaboradores", label: "Colaborador" },
    { id: "interessados", label: "Interessado" },
    { id: "tutores", label: "Tutor" },
  ];

  useEffect(() => {
    const currentType =
      activeFormType === "pessoas" ? activePessoaType : activeFormType;
    const fields = formFieldsConfig[currentType];
    if (!fields) return;
    const apiFields = fields.filter(
      (field) => field.type === "select_api" && field.apiSource
    );
    apiFields.forEach(async (field) => {
      if (!apiOptions[field.apiSource]) {
        setIsLoadingOptions((prev) => ({ ...prev, [field.apiSource]: true }));
        try {
          const data = await getData(field.apiSource);
          setApiOptions((prev) => ({ ...prev, [field.apiSource]: data || [] }));
        } catch (error) {
          console.error(`Erro ao carregar opções para ${field.apiSource}:`, error);
        } finally {
          setIsLoadingOptions((prev) => ({ ...prev, [field.apiSource]: false }));
        }
      }
    });
  }, [activeFormType, activePessoaType, apiOptions]);

  const handleFormTypeChange = (typeId) => {
    setActiveFormType(typeId);
    setFormValues({});
    const type = formTypes.find((t) => t.id === typeId);
    if (type) {
      setAnnouncement(`Formulário de ${type.label} carregado.`);
    }
  };

  const handlePessoaTypeChange = (e) => {
    const newType = e.target.value;
    setActivePessoaType(newType);
    setFormValues({});
    const type = pessoaTypes.find((t) => t.id === newType);
    if (type) {
      setAnnouncement(`Tipo de pessoa alterado para ${type.label}.`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: fieldValue,
    }));
  };

  const shouldDisplayField = (field) => {
    if (!field.condition) return true;
    const { field: conditionField, value: conditionValue } = field.condition;
    return formValues[conditionField] === conditionValue;
  };

  const renderFormFields = () => {
    const currentType = activeFormType === "pessoas" ? activePessoaType : activeFormType;
    const fields = formFieldsConfig[currentType];
    if (!fields) return null;

    return fields.map((field) => {
      if (!shouldDisplayField(field)) return null;
      return (
        <div className="form-field" key={field.id}>
          <label htmlFor={field.id}>{field.label}</label>
          {field.type === "select" ? (
            <select id={field.id} name={field.name} required={field.required} value={formValues[field.name] || ""} onChange={handleInputChange}>
              <option value="">Selecione...</option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : field.type === "select_api" ? (
            <select id={field.id} name={field.name} required={field.required} value={formValues[field.name] || ""} onChange={handleInputChange} disabled={isLoadingOptions[field.apiSource]}>
              <option value="">{isLoadingOptions[field.apiSource] ? "Carregando..." : "Selecione..."}</option>
              {apiOptions[field.apiSource]?.map((option) => (
                <option key={option[field.valueField]} value={option[field.valueField]}>
                  {option[field.labelField] || `ID: ${option[field.valueField]}`}
                </option>
              ))}
            </select>
          ) : field.type === "file" ? (
            <input type="file" id={field.id} name={field.name} required={field.required} onChange={handleInputChange} />
          ) : (
            <input type={field.type} id={field.id} name={field.name} required={field.required} value={formValues[field.name] || ""} onChange={handleInputChange} />
          )}
        </div>
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitType = activeFormType === "pessoas" ? activePessoaType : activeFormType;
      await postData(submitType, formValues);
      setFormValues({});
      setAnnouncement("Formulário enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      setAnnouncement("Erro ao enviar o formulário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormTitle = () => {
    if (activeFormType === "pessoas") {
      const pessoaType = pessoaTypes.find((type) => type.id === activePessoaType);
      return pessoaType ? pessoaType.label : "";
    } else {
      const formType = formTypes.find((type) => type.id === activeFormType);
      return formType ? formType.label : "";
    }
  };

  return (
    <div className="page-container">
      <div className="form-container-wrapper">
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-type-carousel-container">
            <div className="form-type-carousel" role="tablist" aria-label="Tipos de formulário">
              {formTypes.map((type) => (
                <button
                  key={type.id}
                  role="tab"
                  aria-selected={activeFormType === type.id}
                  className={`carousel-item ${activeFormType === type.id ? "active" : ""}`}
                  onClick={() => handleFormTypeChange(type.id)}
                  type="button"
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {activeFormType === "pessoas" && (
            <div className="pessoa-type-selector">
              <label htmlFor="pessoa-type">Tipo de Pessoa:</label>
              <select
                id="pessoa-type"
                value={activePessoaType}
                onChange={handlePessoaTypeChange}
                className="pessoa-type-select"
              >
                {pessoaTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <h2 className="form-title">Formulário de {getFormTitle()}</h2>

          {renderFormFields()}

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Salvar"}
          </button>
        </form>

        <div className="sr-only" role="status" aria-live="polite">
          {announcement}
        </div>
      </div>
    </div>
  );
};

export default FormPage;
