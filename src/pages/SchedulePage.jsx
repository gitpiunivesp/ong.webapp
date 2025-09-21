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
  const [announcement, setAnnouncement] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    setAnnouncement("Carregando dados do formulário...");
    try {
      const [animalsData, colaboradoresData, tutoresData] = await Promise.all([
        getData("animais"),
        getData("colaboradores"),
        getData("tutores"),
      ]);

      setAnimals(animalsData || []);
      setColaboradores(colaboradoresData || []);
      setTutores(tutoresData || []);
      setAnnouncement("Dados carregados com sucesso.");
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setAnnouncement("Erro ao carregar os dados.");
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAnnouncement("Enviando agendamento...");

    try {
      const submissionData = {
        procedimento: formValues.procedimento,
        data: formValues.data,
        animal: { id: formValues.animal_id },
      };
      if (formValues.colaborador_id) {
        submissionData.colaborador = { id: formValues.colaborador_id };
      }
      if (formValues.tutor_id) {
        submissionData.tutor = { id: formValues.tutor_id };
      }
      
      await postData("agendamentos", submissionData);

      setFormValues({
        procedimento: "", data: "", animal_id: "", colaborador_id: "", tutor_id: "",
      });
      setAnnouncement("Agendamento realizado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar agendamento:", error);
      setAnnouncement("Erro ao realizar o agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="page-container" role="status" aria-live="polite">
        <div className="loading-indicator">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="form-container-wrapper">
        <form className="form-container" onSubmit={handleSubmit}>
          <h2 className="form-title">Formulário de Agendamento</h2>

          <div className="form-field">
            <label htmlFor="procedimento">Tipo de Procedimento:</label>
            <select id="procedimento" name="procedimento" required value={formValues.procedimento} onChange={handleInputChange}>
              <option value="">Selecione o procedimento...</option>
              <option value="CASTRACAO">Castração</option>
              <option value="VACINACAO">Vacinação</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="data">Data do Agendamento:</label>
            {/* CORREÇÃO: A tag <input> agora está corretamente fechada com "/>" */}
            <input type="date" id="data" name="data" required value={formValues.data} onChange={handleInputChange} />
          </div>

          <div className="form-field">
            <label htmlFor="animal_id">Animal:</label>
            <select id="animal_id" name="animal_id" required value={formValues.animal_id} onChange={handleInputChange}>
              <option value="">Selecione um animal...</option>
              {animals.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.apelido || `Animal #${animal.id}`} ({animal.especie || "Espécie não especificada"})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="colaborador_id">Colaborador (Opcional):</label>
            <select id="colaborador_id" name="colaborador_id" value={formValues.colaborador_id} onChange={handleInputChange}>
              <option value="">Selecione um colaborador...</option>
              {colaboradores.map((colaborador) => (
                <option key={colaborador.id} value={colaborador.id}>
                  {colaborador.nome || `Colaborador #${colaborador.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="tutor_id">Tutor (Opcional):</label>
            <select id="tutor_id" name="tutor_id" value={formValues.tutor_id} onChange={handleInputChange}>
              <option value="">Selecione um tutor...</option>
              {tutores.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.nome || `Tutor #${tutor.id}`}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Agendar"}
          </button>
        </form>

        <div className="sr-only" role="status" aria-live="polite">
          {announcement}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
