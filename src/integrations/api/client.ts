
const API_URL = './api';

class SupabaseEmulator {
  private table: string = '';
  private filters: { key: string, value: any }[] = [];
  private orderField: string = '';
  private limitCount: number | null = null;

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
    this.table = table;
    this.filters = [];
    this.orderField = '';
    this.limitCount = null;
    return this;
  }

  select(columns: string = '*') {
    return this;
  }

  eq(key: string, value: any) {
    this.filters.push({ key, value });
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

  async then(resolve: any, reject: any) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('table', this.table);
      this.filters.forEach(f => queryParams.append(f.key, f.value));
      if (this.orderField) queryParams.append('order', this.orderField);
      if (this.limitCount) queryParams.append('limit', this.limitCount.toString());

      const response = await fetch(`${API_URL}/rest.php?${queryParams.toString()}`, {
        headers: this.getHeaders()
      });
      const data = await response.json();

      if (response.ok) {
        resolve({ data, error: null });
      } else {
        resolve({ data: null, error: data.error || 'Unknown error' });
      }
    } catch (err) {
      resolve({ data: null, error: err });
    }
  }

  async insert(data: any) {
    try {
      const response = await fetch(`${API_URL}/rest.php?table=${this.table}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return { data: result, error: response.ok ? null : result.error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async update(data: any) {
    try {
      const idFilter = this.filters.find(f => f.key === 'id');
      const id = idFilter ? idFilter.value : '';
      const response = await fetch(`${API_URL}/rest.php?table=${this.table}&id=${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return { data: result, error: response.ok ? null : result.error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async delete() {
    try {
      const idFilter = this.filters.find(f => f.key === 'id');
      const id = idFilter ? idFilter.value : '';
      const response = await fetch(`${API_URL}/rest.php?table=${this.table}&id=${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      const result = await response.json();
      return { data: result, error: response.ok ? null : result.error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  auth = {
    signInWithPassword: async ({ email, password }: any) => {
      try {
        const response = await fetch(`${API_URL}/auth.php?action=login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
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
    onAuthStateChange: (callback: any) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
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
        return { data: { publicUrl: `./uploads/${path}` } };
      }
    })
  };
}

export const supabase = new SupabaseEmulator() as any;
