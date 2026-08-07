/* Contraste WCAG 2.1 da paleta — texto normal 4.5:1, texto grande 3:1.
   Correr com:  node testes/contraste.test.mjs                          */
const lum = (hex) => {
  const c = hex.replace("#","").match(/../g).map(h => {
    const v = parseInt(h,16)/255;
    return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
  });
  return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
};
const ratio = (a,b) => { const l1=lum(a), l2=lum(b); const [hi,lo]=l1>l2?[l1,l2]:[l2,l1]; return (hi+0.05)/(lo+0.05); };

const P = {
  fundo:"#0d2a1f", fundo2:"#123726", fundo3:"#1a4632",
  acento:"#f2b705", acento2:"#ffd24a",
  texto:"#f0ece2", texto2:"#a8b5ac"
};

const pares = [
  ["texto sobre fundo", P.texto, P.fundo, 4.5],
  ["texto sobre fundo-2", P.texto, P.fundo2, 4.5],
  ["texto sobre fundo-3", P.texto, P.fundo3, 4.5],
  ["texto-2 sobre fundo", P.texto2, P.fundo, 4.5],
  ["texto-2 sobre fundo-2", P.texto2, P.fundo2, 4.5],
  ["acento sobre fundo", P.acento, P.fundo, 4.5],
  ["acento sobre fundo-2", P.acento, P.fundo2, 4.5],
  ["acento sobre fundo-3", P.acento, P.fundo3, 4.5],
  ["fundo sobre acento (botão)", P.fundo, P.acento, 4.5],
  ["fundo sobre acento-2 (hover)", P.fundo, P.acento2, 4.5],
  ["texto grande sobre fundo-3", P.texto, P.fundo3, 3.0],
  ["botão desactivado", P.texto2, P.fundo3, 4.5],
];

let mau = 0;
for (const [nome, fg, bg, min] of pares) {
  const r = ratio(fg,bg);
  const ok = r >= min;
  if (!ok) mau++;
  console.log(`${ok?"✓":"✗"} ${nome.padEnd(32)} ${r.toFixed(2)}:1  (mín ${min})`);
}
console.log(mau ? `\n${mau} combinações abaixo do mínimo` : "\nTodas passam");
process.exit(mau ? 1 : 0);
