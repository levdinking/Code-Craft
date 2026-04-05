import { useCallback } from 'react';
import { useAdmin } from './useAdmin';

export function useAdminApi() {
  const { getToken, logout } = useAdmin();

  const request = useCallback(async <T>(url: string, options?: RequestInit): Promise<T> => {
    const token = getToken();
    const headers: Record<string, string> = {
      ...Object.fromEntries(Object.entries(options?.headers || {})),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Не устанавливать Content-Type для FormData — браузер сам добавит boundary
    if (options?.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      logout();
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    return res.json();
  }, [getToken, logout]);

  const get = useCallback(<T>(url: string) => request<T>(url), [request]);

  const post = useCallback(<T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }), [request]);

  const put = useCallback(<T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }), [request]);

  const del = useCallback(<T>(url: string) =>
    request<T>(url, { method: 'DELETE' }), [request]);

  const upload = useCallback(<T>(url: string, formData: FormData) =>
    request<T>(url, {
      method: 'POST',
      body: formData,
    }), [request]);

  return { get, post, put, del, upload, request };
}
