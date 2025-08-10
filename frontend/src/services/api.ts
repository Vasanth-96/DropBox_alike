import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
console.log('API Base URL:', import.meta.env.VITE_API_URL);

interface FileResponse {
  id: string;
  filename: string;
  content_type: string;
  file_path: string;
  upload_date: string;
}

interface FileList {
  files: FileResponse[];
  total: number;
}

export type { FileResponse, FileList };

export const uploadFile = async (file: File): Promise<FileResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_BASE_URL}/files`, formData);
  return response.data;
};

export const listFiles = async (skip = 0, limit = 100): Promise<FileList> => {
  const response = await axios.get(`${API_BASE_URL}/files`, {
    params: { skip, limit }
  });
  return response.data;
};

export const getFileDetails = async (fileId: string): Promise<FileResponse> => {
  const response = await axios.get(`${API_BASE_URL}/files/${fileId}`);
  return response.data;
};

export const downloadFile = async (fileId: string): Promise<void> => {
  window.open(`${API_BASE_URL}/files/${fileId}/download`, '_blank');
};
