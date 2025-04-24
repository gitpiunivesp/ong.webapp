import React, { useState, useEffect } from "react";
import "../css/FormComponent.css";
import { getData, postData } from "../services/generalService";

const SchedulePage = () => {
  const [formValues, setFormValues] = useState({
    procedimento: "",
    data: "",
    animal_id: "",
    colaborador_id: "",
    tutor_id: "",
  });

  const [animals, setAnimals] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [animalsData, colaboradoresData, tutoresData] = await Promise.all([
        getData("animais"),
        getData("colaboradores"),
        getData("tutores"),
      ]);

      setAnimals(animalsData || []);
      setColaboradores(colaboradoresData || []);
      setTutores(tutoresData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    if (name === "animal_id") {
      const animal = animals.find((a) => a.id.toString() === value);
      setSelectedAnimal(animal || null);
    } else if (name === "colaborador_id") {
      const colaborador = colaboradores.find((c) => c.id.toString() === value);
      setSelectedColaborador(colaborador || null);

      if (selectedColaborador?.telefone !== colaborador?.telefone) {
        setFormValues((prev) => ({
          ...prev,
          telefone_colaborador: colaborador?.telefone || "",
        }));
      }
    } else if (name === "tutor_id") {
      const tutor = tutores.find((t) => t.id.toString() === value);
      setSelectedTutor(tutor || null);

      if (
        selectedTutor?.telefone !== tutor?.telefone ||
        selectedTutor?.nome !== tutor?.nome
      ) {
        setFormValues((prev) => ({
          ...prev,
          telefone_tutor: tutor?.telefone || "",
          tutor_nome: tutor?.nome || "",
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submissionData = {
        procedimento: formValues.procedimento,
        data: formValues.data,
        animal: {
          id: formValues.animal_id,
        },
      };

      if (formValues.colaborador_id) {
        submissionData.colaborador = {
          id: formValues.colaborador_id,
          telefone: selectedColaborador?.telefone || "",
        };
      }

      if (formValues.tutor_id) {
        submissionData.tutor = {
          id: formValues.tutor_id,
          telefone: selectedTutor?.telefone || "",
          nome: selectedTutor?.nome || "",
        };
      }

      await postData("agendamentos", submissionData);
      setFormValues({
        procedimento: "",
        data: "",
        animal_id: "",
        colaborador_id: "",
        tutor_id: "",
      });

      setSelectedAnimal(null);
      setSelectedColaborador(null);
      setSelectedTutor(null);
    } catch (error) {
      console.error("Erro ao enviar agendamento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-indicator">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="form-container-wrapper">
        <form className="form-container" onSubmit={handleSubmit}>
          <span>Formulário de Agendamento</span>

          <div className="form-field">
            <label htmlFor="procedimento">Tipo de Procedimento:</label>
            <select
              id="procedimento"
              name="procedimento"
              required
              value={formValues.procedimento}
              onChange={handleInputChange}
            >
              <option value="">Selecione o procedimento...</option>
              <option value="CASTRACAO">Castração</option>
              <option value="VACINACAO">Vacinação</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="data">Data do Agendamento:</label>
            <input
              type="date"
              id="data"
              name="data"
              required
              value={formValues.data}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="animal_id">Animal:</label>
            <select
              id="animal_id"
              name="animal_id"
              required
              value={formValues.animal_id}
              onChange={handleInputChange}
            >
              <option value="">Selecione um animal...</option>
              {animals.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.apelido || `Animal #${animal.id}`} (
                  {animal.especie || "Espécie não especificada"})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="colaborador_id">Colaborador:</label>
            <select
              id="colaborador_id"
              name="colaborador_id"
              value={formValues.colaborador_id}
              onChange={handleInputChange}
            >
              <option value="">Selecione um colaborador (opcional)...</option>
              {colaboradores.map((colaborador) => (
                <option key={colaborador.id} value={colaborador.id}>
                  {colaborador.nome || `Colaborador #${colaborador.id}`}
                </option>
              ))}
            </select>
          </div>

          {selectedColaborador && (
            <div className="form-field form-field-readonly">
              <label>Telefone do Colaborador:</label>
              <div className="readonly-value">
                {selectedColaborador.telefone || "Não informado"}
              </div>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="tutor_id">Tutor:</label>
            <select
              id="tutor_id"
              name="tutor_id"
              value={formValues.tutor_id}
              onChange={handleInputChange}
            >
              <option value="">Selecione um tutor (opcional)...</option>
              {tutores.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.nome || `Tutor #${tutor.id}`}
                </option>
              ))}
            </select>
          </div>

          {selectedTutor && (
            <>
              <div className="form-field form-field-readonly">
                <label>Nome do Tutor:</label>
                <div className="readonly-value">
                  {selectedTutor.nome || "Não informado"}
                </div>
              </div>
              <div className="form-field form-field-readonly">
                <label>Telefone do Tutor:</label>
                <div className="readonly-value">
                  {selectedTutor.telefone || "Não informado"}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Agendar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SchedulePage;
