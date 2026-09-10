const STORAGE_KEY = 'simrisk_datun_data';

const initialData = [];

export const getStore = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(data);
};

export const saveStore = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getAllPermohonan = () => {
  return getStore();
};

export const getPermohonanById = (id) => {
  const store = getStore();
  return store.find(item => item.id === id);
};

export const addPermohonan = (newPermohonan) => {
  const store = getStore();
  store.push(newPermohonan);
  saveStore(store);
  return newPermohonan;
};

export const updatePermohonan = (id, updatedData) => {
  const store = getStore();
  const index = store.findIndex(item => item.id === id);
  if (index !== -1) {
    store[index] = { ...store[index], ...updatedData };
    saveStore(store);
    return store[index];
  }
  return null;
};

export const deletePermohonan = (id) => {
  const store = getStore();
  const updatedStore = store.filter(item => item.id !== id);
  saveStore(updatedStore);
  return true;
};

export const generateId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
