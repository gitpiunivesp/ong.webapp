export const formatData = (formType, data) => {
  switch (formType) {
    case "empresas":
      return {
        id: data.id,
        title: data.nome_fantasia || data.razao_social || "Empresa sem nome",
        subtitle: data.cnpj || "CNPJ não informado",
        details: `${data.email || "Email não informado"} | ${
          data.telefone || "Tel não informado"
        }`,
        ...data,
      };

    case "usuarios":
      return {
        id: data.id,
        title: data.nome || "Usuário sem nome",
        subtitle: data.usuario || "Nome de usuário não informado",
        details: data.email || "Email não informado",
        ...data,
      };

    case "colaboradores":
      return {
        id: data.id,
        title: data.nome || "Colaborador sem nome",
        subtitle: data.cpf || "CPF não informado",
        details: `${data.email || ""} ${
          data.telefone ? `| ${data.telefone}` : ""
        }`,
        ...data,
      };

    case "animais":
      return {
        id: data.id,
        title: data.apelido,
        subtitle: data.especie || "Tipo não informado",
        details: `Entrada: ${data.data_entrada || "N/I"} | Adotado: ${
          data.adopted == "yes" ? "Sim" : "Não"
        }`,
        ...data,
      };

    case "interessados":
      return {
        id: data.id,
        title: data.nome || "Interessado sem nome",
        subtitle: data.email || "Email não informado",
        details: data.telefone || "Telefone não informado",
        ...data,
      };

    case "tutores":
      return {
        id: data.id,
        title: data.nome || "Tutor sem nome",
        subtitle: data.cpf || "CPF não informado",
        details: data.telefone || "Telefone não informado",
        ...data,
      };

    case "agendamentos":
      return {
        id: data.id,
        title: `${data.procedimento} - ${data.animal.nome}`,
        subtitle: data.data || "Data não informada",
        details: `Tutor : ${data.tutor.nome}`,
        ...data,
      };

    default:
      return {
        id: data.id,
        title: data.name || data.nome || data.title || `ID: ${data.id}`,
        subtitle: data.description || data.email || "",
        details: "",
        ...data,
      };
  }
};
