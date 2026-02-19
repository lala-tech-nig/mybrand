const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = {
    get: async (url, config = {}) => request('GET', url, null, config),
    post: async (url, body, config = {}) => request('POST', url, body, config),
    put: async (url, body, config = {}) => request('PUT', url, body, config),
    delete: async (url, config = {}) => request('DELETE', url, null, config),
};

async function request(method, url, body, config = {}) {
    const headers = { ...config.headers };

    // Auth token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        headers['x-auth-token'] = token;
    }

    let requestBody = body;

    // Content-Type handling
    if (body instanceof FormData) {
        // Browser sets Content-Type for FormData (multipart/form-data)
        // Ensure we don't accidentally set application/json
        if (headers['Content-Type']) delete headers['Content-Type'];
    } else if (body && typeof body === 'object') {
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(body);
    }

    // Construct full URL if it's relative
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    try {
        const res = await fetch(fullUrl, {
            method,
            headers,
            body: method === 'GET' ? null : requestBody,
            ...config
        });

        // Try to parse JSON, but handle non-JSON responses (like 204 No Content)
        let data = {};
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await res.json().catch(() => ({}));
        }

        if (!res.ok) {
            // Mimic Axios error structure
            const error = new Error(data.message || data.msg || 'Request failed');
            error.response = {
                data: data,
                status: res.status,
                statusText: res.statusText,
                headers: res.headers
            };
            throw error;
        }

        return { data };
    } catch (err) {
        // If it's already our structured error, rethrow
        if (err.response) throw err;

        // Network errors or other issues
        console.error("API Request Error:", err);
        const error = new Error(err.message || 'Network Error');
        error.response = {
            data: { message: err.message || 'Network Error' }
        };
        throw error;
    }
}

export default api;
