import axios from 'axios';
import { tokenStorage } from './tokenStorage';

const API_URL = 'http://localhost:3000';

// Main instance
export const api = axios.create({
	baseURL: API_URL,
	withCredentials: true, // mandatory for sending and receiving HttpOnly cookie
});

// Separate instance for refreshing token (not to get into endless loop of interceptor)
export const refreshApi = axios.create({
	baseURL: API_URL,
	withCredentials: true,
});

// 1. Put Access Token to every request
api.interceptors.request.use(config => {
	const token = tokenStorage.get();
	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// 2. Catch 401 and refresh tokens
api.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config;

		// IF 401 but it's not retry
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// Asking for new token pair (Refresh Token is in the HttpOnly)
				const { data } = await refreshApi.post<{ accessToken: string }>(
					'/auth/refresh'
				);

				// put new Access Token to memory
				tokenStorage.set(data.accessToken);

				// update headers and repeat original
				originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
				return api(originalRequest);
			} catch (refreshError) {
				// if Refresh Token expired or invalid  clear token storage and redirect to login
				tokenStorage.clear();
				window.location.href = '/login';
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);
