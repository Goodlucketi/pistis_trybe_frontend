import api from "../api/api";

export const getNotes = async () => {
  const response = await api.get("/notes");
  return response.data.data;
};

export const createNote = async (data) => {
  const response = await api.post("/notes", data);
  return response.data.data;
};

export const deleteNote = async (noteId) => {
  const response = await api.delete(`/notes/${noteId}`);
  return response.data.data;
};

export const shareNoteToFeed = async (noteId) => {
  const response = await api.post(`/notes/${noteId}/share`);
  return response.data.data;
};