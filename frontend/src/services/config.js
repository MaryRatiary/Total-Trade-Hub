// Récupérer l'IP du serveur en fonction de l'environnement
const getApiBaseUrl = () => {
    // Utiliser l'IP actuelle de la machine pour le développement
    if (process.env.NODE_ENV === 'development') {
        return 'http://192.168.88.160:5131/api';
    }
    return process.env.VITE_API_URL || 'http://192.168.88.160:5131/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Détecter si l'utilisateur est sur mobile
export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getConfig = () => {
    return {
        retryAttempts: 3,
        retryDelay: 2000,
    };
};

export const getAuthHeaders = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return {
        'Content-Type': 'application/json',
        'Authorization': currentUser?.token ? `Bearer ${currentUser.token}` : '',
        'Accept': 'application/json'
    };
};

export const handleApiError = (error) => {
    if (error.status === 401) {
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
        return 'Session expirée. Veuillez vous reconnecter.';
    }
    return error.message || 'Une erreur est survenue';
};