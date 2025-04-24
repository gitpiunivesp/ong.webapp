export const animalReportTypes = [
  { id: "animais_da_ong", label: "Animais da ONG (Para Adoção)" },
  { id: "animais_adotados", label: "Animais adotados" },
  { id: "animais_vacinados", label: "Animais vacinados" },
  { id: "animais_castrados", label: "Animais castrados" },
];

export const reportColumns = {
  animais_da_ong: [
    { key: "id", title: "ID", type: "number" },
    { key: "especie", title: "Tipo", type: "text" },
    { key: "apelido", title: "Apelido", type: "text" },
    { key: "data_entrada", title: "Data de Entrada", type: "date" },
  ],
  animais_adotados: [
    { key: "id", title: "ID", type: "number" },
    { key: "apelido", title: "Apelido", type: "text" },
    { key: "especie", title: "Tipo", type: "text" },
    { key: "data_entrada", title: "Data de Entrada", type: "date" },
    { key: "data_adocao", title: "Data de Adoção", type: "date" },
  ],
  animais_vacinados: [
    { key: "id", title: "ID", type: "number" },
    { key: "especie", title: "Tipo", type: "text" },
    {
      key: "data",
      title: "Data da Vacinação",
      type: "date",
    },
  ],
  animais_castrados: [
    { key: "id", title: "ID", type: "number" },
    { key: "especie", title: "Tipo", type: "text" },
    { key: "data", title: "Data da Castração", type: "date" },
  ],
};

export const getColumnsForReportType = (reportType) => {
  return reportColumns[reportType];
};
