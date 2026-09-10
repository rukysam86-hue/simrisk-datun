import { supabase } from '../lib/supabase';

// Helper to handle Supabase responses
const handleResponse = ({ data, error }) => {
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  return data;
};

export const getAllPermohonan = async () => {
  console.log('[Supabase] Mengambil semua data permohonan...');
  const response = await supabase
    .from('permohonan')
    .select('*')
    .order('currentStep', { ascending: true }); // Or order by some date if available
  console.log('[Supabase] Hasil getAllPermohonan:', response);
  return handleResponse(response) || [];
};

export const getPermohonanById = async (id) => {
  console.log(`[Supabase] Mengambil data permohonan dengan ID: ${id}...`);
  const response = await supabase
    .from('permohonan')
    .select('*')
    .eq('id', id)
    .single();
  
  console.log(`[Supabase] Hasil getPermohonanById (${id}):`, response);
  if (response.error) {
    console.error('Error fetching permohonan:', response.error);
    return null;
  }
  return response.data;
};

export const addPermohonan = async (newPermohonan) => {
  console.log('[Supabase] Menambahkan permohonan baru:', newPermohonan);
  const response = await supabase
    .from('permohonan')
    .insert([newPermohonan])
    .select()
    .single();
  console.log('[Supabase] Hasil addPermohonan:', response);
  return handleResponse(response);
};

export const updatePermohonan = async (id, updatedData) => {
  console.log(`[Supabase] Memperbarui permohonan ID ${id} dengan data:`, updatedData);
  const response = await supabase
    .from('permohonan')
    .update(updatedData)
    .eq('id', id)
    .select()
    .single();
  console.log(`[Supabase] Hasil updatePermohonan (${id}):`, response);
  return handleResponse(response);
};

export const deletePermohonan = async (id) => {
  console.log(`[Supabase] Menghapus permohonan ID: ${id}`);
  const response = await supabase
    .from('permohonan')
    .delete()
    .eq('id', id);
  
  console.log(`[Supabase] Hasil deletePermohonan (${id}):`, response);
  if (response.error) {
    console.error('Error deleting:', response.error);
    return false;
  }
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
