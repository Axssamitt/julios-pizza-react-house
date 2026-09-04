
const API_URL = './api';

type ApiRecord = Record<string, unknown>;

interface ApiResponse extends ApiRecord {
  error?: string;
}

interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthStateChangeCallback {
  (event: string, session: unknown): void;
}

interface FunctionOptions {
  body?: unknown;
  headers?: Record<string, string>;
}

class SupabaseEmulator {
  private table: string = '';
  private filters: { key: string, value: unknown, operator?: 'eq' | 'gte' }[] = [];
  private orderField: string = '';
  private limitCount: number | null = null;
  private singleMode: boolean = false;
  private maybeSingleMode: boolean = false;
  private mutation: { method: 'PUT' | 'DELETE'; data?: unknown } | null = null;

  private getHeaders() {
    const sessionStr = localStorage.getItem('sb-session');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    }
    return headers;
  }

  from(table: string) {
    const query = new SupabaseEmulator();
    query.table = table;
    return query;
  }

  select(columns: string = '*') {
    return this;
  }

  eq(key: string, value: unknown) {
    this.filters.push({ key, value, operator: 'eq' });
    return this;
  }

  gte(key: string, value: unknown) {
    this.filters.push({ key, value, operator: 'gte' });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field + (options?.ascending === false ? ' DESC' : ' ASC');
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleMode = true;
    this.maybeSingleMode = false;
    return this;
  }

  maybeSingle() {
    this.singleMode = false;
    this.maybeSingleMode = true;
    return this;
  }

  async then(resolve: (value: unknown) => void, _reject?: (reason: unknown) => void) {
    try {
      if (this.mutation) {
        const idFilter = this.filters.find(f => f.key === 'id');
        const id = idFilter ? idFilter.value : '';
        const response = await fetch(`${API_URL}/rest.php?table=${this.table}&id=${id}`, {
          method: this.mutation.method,
          headers: this.getHeaders(),
          ...(this.mutation.data === undefined ? {} : { body: JSON.stringify(this.mutation.data) })
        });
        const result = await response.json() as ApiResponse;
        resolve({ data: result, error: response.ok ? null : result.error });
        return;
      }

      const queryParams = new URLSearchParams();
      queryParams.append('table', this.table);
      this.filters.forEach(f => {
        const queryKey = f.operator === 'gte' ? `gte_${f.key}` : f.key;
        queryParams.append(queryKey, String(f.value));
      });
      if (this.orderField) queryParams.append('order', this.orderField);
      if (this.limitCount) queryParams.append('limit', this.limitCount.toString());

      const response = await fetch(`${API_URL}/rest.php?${queryParams.toString()}`, {
        headers: this.getHeaders()
      });
      const data = await response.json() as ApiResponse | unknown[];

      if (response.ok) {
        let normalizedData: ApiResponse | unknown[] | null = data;

        if (Array.isArray(normalizedData)) {
          if (this.singleMode) {
            normalizedData = normalizedData[0] ?? null;
          } else if (this.maybeSingleMode) {
            normalizedData = normalizedData.length > 0 ? normalizedData[0] : null;
          }
        }

        resolve({ data: normalizedData, error: null });
      } else {
        resolve({ data: null, error: data.error || 'Unknown error' });
      }
    } catch (err) {
      resolve({ data: null, error: err });
    }
  }

  async insert(data: unknown) {
    try {
      const payload = Array.isArray(data) ? data[0] : data;
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return { data: null, error: 'Invalid insert payload' };
      }

      const response = await fetch(`${API_URL}/rest.php?table=${this.table}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      const result = await response.json() as ApiResponse;
      return { data: result, error: response.ok ? null : result.error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  update(data: unknown) {
    this.mutation = { method: 'PUT', data };
    return this;
  }

  delete() {
    this.mutation = { method: 'DELETE' };
    return this;
  }

  auth = {
    signInWithPassword: async ({ email, password }: AuthCredentials) => {
      try {
        const response = await fetch(`${API_URL}/auth.php?action=login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json() as ApiResponse;
        if (response.ok) {
          localStorage.setItem('sb-session', JSON.stringify(data.session));
          localStorage.setItem('sb-user', JSON.stringify(data.user));
          return { data, error: null };
        } else {
          return { data: null, error: data.error };
        }
      } catch (err) {
        return { data: null, error: err };
      }
    },
    signOut: async () => {
      localStorage.removeItem('sb-session');
      localStorage.removeItem('sb-user');
      return { error: null };
    },
    getSession: async () => {
      const session = localStorage.getItem('sb-session');
      return { data: { session: session ? JSON.parse(session) : null }, error: null };
    },
    getUser: async () => {
      const user = localStorage.getItem('sb-user');
      return { data: { user: user ? JSON.parse(user) : null }, error: null };
    },
    onAuthStateChange: (_callback: AuthStateChangeCallback) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };

  functions = {
    invoke: async (functionName: string, options?: FunctionOptions) => {
      const baseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

      if (!baseUrl || !anonKey) {
        return {
          data: { success: true, skipped: true, message: 'Supabase function disabled in local mode' },
          error: null
        };
      }

      try {
        const response = await fetch(`${baseUrl}/functions/v1/${functionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
            ...(options?.headers || {})
          },
          body: JSON.stringify(options?.body ?? {})
        });

        const text = await response.text();
        const data = (text ? JSON.parse(text) : {}) as ApiResponse;

        if (!response.ok) {
          throw new Error(data.error || 'Supabase function failed');
        }

        return { data, error: null };
      } catch (err) {
        console.error(`Erro ao invocar função ${functionName}:`, err);
        return { data: null, error: err };
      }
    }
  };

  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('bucket', bucket);
          const headers = this.getHeaders();
          delete headers['Content-Type']; // Let the browser set it for FormData
          const response = await fetch(`${API_URL}/upload.php`, {
            method: 'POST',
            headers: headers,
            body: formData
          });
          const data = await response.json();
          return { data, error: response.ok ? null : data.error };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      getPublicUrl: (path: string) => {
        const normalizedPath = String(path || '').replace(/^\/+/, '');
        const publicUrl = typeof window !== 'undefined' && window.location?.origin
          ? new URL(`/uploads/${normalizedPath}`, window.location.origin).toString()
          : `/uploads/${normalizedPath}`;

        return { data: { publicUrl } };
      }
    })
  };
}

export const supabase = new SupabaseEmulator();
