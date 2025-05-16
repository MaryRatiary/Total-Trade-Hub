import { API_BASE_URL, getAuthHeaders } from './config';

class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}

const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

class ApiService {
    async makeRequest(operationName, requestFn) {
        try {
            return await requestFn();
        } catch (error) {
            console.error(`Error in ${operationName}:`, error);
            throw error instanceof ApiError ? error : new ApiError(error.message);
        }
    }

    async login(credentials) {
        return this.makeRequest('login', async () => {
            if (!credentials.email || !credentials.password) {
                throw new ApiError('Email et mot de passe requis');
            }

            const response = await fetchWithRetry(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new ApiError(data.message || 'Erreur lors de la connexion', response.status);
            }

            if (!data.token) {
                throw new ApiError('Token manquant dans la réponse');
            }

            return data;
        });
    }

    async register(userData) {
        return this.makeRequest('register', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/Auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            return this.handleResponse(response);
        });
    }

    async completeRegistration(email) {
        return this.makeRequest('completeRegistration', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/Auth/complete-registration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Email': email
                }
            });
            return this.handleResponse(response);
        });
    }

    async getArticles() {
        return this.makeRequest('getArticles', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/articles`, {
                headers: getAuthHeaders(),
            });
            return this.handleResponse(response);
        });
    }

    async createArticle(formData) {
        return this.makeRequest('createArticle', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/articles`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData,
            });
            return this.handleResponse(response);
        });
    }

    async getUserProfile(userId = null) {
        return this.makeRequest(`getUserProfile-${userId || 'self'}`, async () => {
            const endpoint = userId ? `${API_BASE_URL}/users/${userId}` : `${API_BASE_URL}/users/profile`;
            const response = await fetchWithRetry(endpoint, {
                headers: getAuthHeaders(),
            });
            return this.handleResponse(response);
        });
    }

    async updateProfile(profileData) {
        return this.makeRequest('updateProfile', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/settings/profile`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(profileData),
            });
            return this.handleResponse(response);
        });
    }

    async sendFriendRequest(receiverId) {
        return this.makeRequest('sendFriendRequest', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/friendrequest/send`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ receiverId }),
            });
            return this.handleResponse(response);
        });
    }

    async getFriendRequests() {
        return this.makeRequest('getFriendRequests', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/friendrequest/pending`, {
                headers: getAuthHeaders(),
            });
            return this.handleResponse(response);
        });
    }

    async handleFriendRequest(requestId, action) {
        return this.makeRequest(`handleFriendRequest-${requestId}-${action}`, async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/friendrequest/${requestId}/${action}`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
            return this.handleResponse(response);
        });
    }

    async getMessages(userId) {
        return this.makeRequest(`getMessages-${userId}`, async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/message/messages/${userId}`, {
                headers: getAuthHeaders(),
            });
            return this.handleResponse(response);
        });
    }

    async sendMessage(receiverId, content) {
        return this.makeRequest('sendMessage', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/message/send`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ receiverId, content }),
            });
            return this.handleResponse(response);
        });
    }

    async uploadProfilePicture(file) {
        return this.makeRequest('uploadProfilePicture', async () => {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetchWithRetry(`${API_BASE_URL}/users/profile-picture`, {
                method: 'POST',
                headers: {
                    'Authorization': getAuthHeaders().Authorization
                },
                body: formData
            });
            return this.handleResponse(response);
        });
    }

    async updateSettings(settingsData) {
        return this.makeRequest('updateSettings', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/settings`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(settingsData)
            });
            return this.handleResponse(response);
        });
    }

    async getConversations() {
        return this.makeRequest('getConversations', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/message/conversations`, {
                headers: getAuthHeaders()
            });
            return this.handleResponse(response);
        });
    }

    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        };
    }

    async handleResponse(response) {
        const data = await response.json();
        if (!response.ok) {
            throw new ApiError(data.message || 'Une erreur est survenue', response.status);
        }
        return data;
    }
}

// Create and export a single instance of ApiService
export const apiService = new ApiService();
export { fetchWithRetry };