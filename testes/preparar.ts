/* O motor guarda em localStorage, que não existe em Node. Um substituto em
   memória chega — o que se testa é a lógica, não o armazenamento do browser. */
import { beforeEach } from "vitest";

class ArmazenamentoMemoria implements Storage {
  private dados = new Map<string, string>();
  get length() { return this.dados.size; }
  key(i: number) { return [...this.dados.keys()][i] ?? null; }
  getItem(k: string) { return this.dados.get(k) ?? null; }
  setItem(k: string, v: string) { this.dados.set(k, String(v)); }
  removeItem(k: string) { this.dados.delete(k); }
  clear() { this.dados.clear(); }
}

globalThis.localStorage = new ArmazenamentoMemoria();

beforeEach(() => {
  localStorage.clear();
});
