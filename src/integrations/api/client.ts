// ============================================================
// Adapter MySQL/PHP que IMITA a interface do supabase-js
// usada no projeto (.from().select().eq().order()..., auth, storage).
//
// Para migrar para o HostGator:
//   1. Suba a pasta /api do HostGator no seu domínio
//   2. Defina VITE_API_URL no .env (ex: https://seudominio.com.br/api)
//   3. Em src/integrations/supabase/client.ts troque:
//        export { supabase } from '@/integrations/api/client';
//      Praticamente todos os componentes continuam funcionando.
// ============================================================

const API_URL = (import.meta.env.VITE_API_URL as string) || '/api';
const TOKEN_KEY = 'app_auth_token';

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (t: string | null) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

async function http(path: string, init: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) || {}),
  };
  const tk = getToken();
  if (tk) headers['Authorization'] = `Bearer ${tk}`;
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

// ---------- Query builder estilo PostgREST ----------
type Filter = { col: string; op: string; val: any };

class Query<T = any> implements PromiseLike<{ data: T | null; error: any }> {
  private filters: Filter[] = [];
  private orderBy: string[] = [];
  private limitN?: number;
  private selectCols = '*';
  private singleRow = false;
  private maybeSingleRow = false;

  constructor(private table: string, private op: 'select'|'insert'|'update'|'delete', private payload?: any) {}

  select(cols = '*') { this.selectCols = cols; return this; }
  eq(col: string, val: any)  { this.filters.push({col, op:'eq',  val}); return this; }
  neq(col: string, val: any) { this.filters.push({col, op:'neq', val}); return this; }
  gt(col: string, val: any)  { this.filters.push({col, op:'gt',  val}); return this; }
  gte(col: string, val: any) { this.filters.push({col, op:'gte', val}); return this; }
  lt(col: string, val: any)  { this.filters.push({col, op:'lt',  val}); return this; }
  lte(col: string, val: any) { this.filters.push({col, op:'lte', val}); return this; }
  like(col: string, val: any){ this.filters.push({col, op:'like',val}); return this; }
  ilike(col: string, val: any){this.filters.push({col, op:'ilike',val});return this; }
  is(col: string, val: any)  { this.filters.push({col, op:'is',  val: val === null ? 'null' : String(val)}); return this; }
  in(col: string, arr: any[]){ this.filters.push({col, op:'in',  val: `(${arr.join(',')})`}); return this; }
  order(col: string, opts: {ascending?: boolean} = {}) {
    this.orderBy.push(`${col}.${opts.ascending === false ? 'desc' : 'asc'}`);
    return this;
  }
  limit(n: number) { this.limitN = n; return this; }
  single()      { this.singleRow = true; return this; }
  maybeSingle() { this.maybeSingleRow = true; return this; }

  private buildQS(): string {
    const params = new URLSearchParams();
    params.set('table', this.table);
    params.set('select', this.selectCols);
    for (const f of this.filters) params.append(f.col, `${f.op}.${f.val}`);
    if (this.orderBy.length) params.set('order', this.orderBy.join(','));
    if (this.limitN != null) params.set('limit', String(this.limitN));
    return params.toString();
  }

  async run(): Promise<{ data: any; error: any }> {
    try {
      let data: any;
      if (this.op === 'select') {
        data = await http(`/rest.php?${this.buildQS()}`);
        if (this.singleRow)      data = data[0] ?? null;
        else if (this.maybeSingleRow) data = data[0] ?? null;
      } else if (this.op === 'insert') {
        data = await http(`/rest.php?table=${this.table}`, {
          method: 'POST', body: JSON.stringify(this.payload),
        });
        if (this.selectCols && this.singleRow) data = Array.isArray(data) ? data[0] : data;
      } else if (this.op === 'update') {
        data = await http(`/rest.php?${this.buildQS()}`, {
          method: 'PATCH', body: JSON.stringify(this.payload),
        });
      } else if (this.op === 'delete') {
        data = await http(`/rest.php?${this.buildQS()}`, { method: 'DELETE' });
      }
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.run().then(onfulfilled as any, onrejected as any);
  }
}

class TableRef {
  constructor(private table: string) {}
  select(cols = '*') { return new Query(this.table, 'select').select(cols); }
  insert(payload: any) { return new Query(this.table, 'insert', payload); }
  update(payload: any) { return new Query(this.table, 'update', payload); }
  delete()             { return new Query(this.table, 'delete'); }
  upsert(payload: any) { return new Query(this.table, 'insert', payload); } // simplificado
}

// ---------- Auth ----------
type AuthCallback = (event: string, session: any) => void;
const authListeners: AuthCallback[] = [];

const auth = {
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const data = await http('/auth.php?action=login', {
        method: 'POST', body: JSON.stringify({ email, senha: password }),
      });
      setToken(data.token);
      const session = { access_token: data.token, user: data.user };
      authListeners.forEach(cb => cb('SIGNED_IN', session));
      return { data: { session, user: data.user }, error: null };
    } catch (e: any) {
      return { data: { session: null, user: null }, error: { message: e.message } };
    }
  },
  async signOut() {
    try { await http('/auth.php?action=logout', { method: 'POST' }); } catch {}
    setToken(null);
    authListeners.forEach(cb => cb('SIGNED_OUT', null));
    return { error: null };
  },
  async getSession() {
    const tk = getToken();
    if (!tk) return { data: { session: null }, error: null };
    try {
      const { user } = await http('/auth.php?action=me');
      if (!user) { setToken(null); return { data: { session: null }, error: null }; }
      return { data: { session: { access_token: tk, user } }, error: null };
    } catch {
      setToken(null);
      return { data: { session: null }, error: null };
    }
  },
  async getUser() {
    const s = await auth.getSession();
    return { data: { user: s.data.session?.user ?? null }, error: null };
  },
  onAuthStateChange(cb: AuthCallback) {
    authListeners.push(cb);
    return { data: { subscription: { unsubscribe: () => {
      const i = authListeners.indexOf(cb); if (i >= 0) authListeners.splice(i, 1);
    } } } };
  },
};

// ---------- Storage (uploads) ----------
const storage = {
  from(bucket: string) {
    return {
      async upload(path: string, file: File) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', bucket);
        const tk = getToken();
        const res = await fetch(`${API_URL}/upload.php`, {
          method: 'POST',
          headers: tk ? { Authorization: `Bearer ${tk}` } : {},
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data?.error || 'Upload falhou' } };
        return { data: { path: data.path, fullPath: data.url }, error: null };
      },
      getPublicUrl(path: string) {
        return { data: { publicUrl: `${API_URL}/uploads/${path}` } };
      },
      async remove(_paths: string[]) {
        return { data: null, error: { message: 'remove() não implementado nesta API' } };
      },
    };
  },
};

// ---------- Edge Functions (stub) ----------
const functions = {
  async invoke(_name: string, _opts?: any) {
    // Notificação por email já é disparada automaticamente pelo backend
    // ao inserir em formularios_contato. Stub para compatibilidade.
    return { data: { ok: true }, error: null };
  },
};

export const supabase = {
  from: (table: string) => new TableRef(table),
  auth,
  storage,
  functions,
};
