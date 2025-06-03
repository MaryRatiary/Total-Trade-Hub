import { apiService, fetchWithRetry } from './api';
import { API_BASE_URL } from './config';

export const likeArticle = async (articleId) => {
  return apiService.makeRequest('likeArticle', async () => {
    const response = await fetchWithRetry(`${API_BASE_URL}/articles/${articleId}/like`, {
      method: 'POST',
      headers: apiService.getAuthHeaders()
    });
    return apiService.handleResponse(response);
  });
};

export const addComment = async (articleId, content) => {
  return apiService.makeRequest('addComment', async () => {
    const response = await fetchWithRetry(`${API_BASE_URL}/articles/${articleId}/comments`, {
      method: 'POST',
      headers: apiService.getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return apiService.handleResponse(response);
  });
};

export const deleteComment = async (articleId, commentId) => {
  return apiService.makeRequest('deleteComment', async () => {
    const response = await fetchWithRetry(`${API_BASE_URL}/articles/${articleId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: apiService.getAuthHeaders()
    });
    return apiService.handleResponse(response);
  });
};

export const shareArticle = async (articleId) => {
  return apiService.makeRequest('shareArticle', async () => {
    const response = await fetchWithRetry(`${API_BASE_URL}/articles/${articleId}/share`, {
      method: 'POST',
      headers: apiService.getAuthHeaders()
    });
    return apiService.handleResponse(response);
  });
};

export const incrementViews = async (articleId) => {
  return apiService.makeRequest('incrementViews', async () => {
    const response = await fetchWithRetry(`${API_BASE_URL}/articles/${articleId}/views`, {
      method: 'POST',
      headers: apiService.getAuthHeaders()
    });
    return apiService.handleResponse(response);
  });
};

export const getViews = async (articleId) => {
  return apiService.makeRequest('getViews', async () => {
    const response = await fetchWithRetry(`${API_BASE_URL}/articles/${articleId}/views`, {
      headers: apiService.getAuthHeaders()
    });
    return apiService.handleResponse(response);
  });
};
