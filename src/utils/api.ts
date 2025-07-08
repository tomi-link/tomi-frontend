const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  token?: string;
  params?: Record<string, any>;
}

function buildQueryParams(params: Record<string, any>): string {
  const esc = encodeURIComponent;
  return (
    '?' +
    Object.entries(params)
      .map(([k, v]) => `${esc(k)}=${esc(v)}`)
      .join('&')
  );
}

export async function fetchAPI<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, params, ...fetchOptions } = options;

  const queryString = params ? buildQueryParams(params) : '';
  const url = `${API_BASE}${endpoint}${queryString}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers || {}),
    },
    credentials: 'include',
    ...fetchOptions,
  });

  if (!res.ok) {
    let errorMessage = 'Something went wrong';
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  try {
    return await res.json();
  } catch (_) {
    return {} as T;
  }
}
