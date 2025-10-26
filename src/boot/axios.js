import axios from "axios";

export const api = axios.create({
  baseURL: "https://monophonic-dean-unhoodwinked.ngrok-free.dev",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
});
