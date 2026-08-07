/* Dados reais da Barbearia Garcia & Tatuagem.
   Extraídos do perfil público em noona.pt/barbeariagarcia.
   Preços em euros, durações em minutos. */

export const CASA = {
  nome: "Barbearia Garcia",
  nomeCompleto: "Barbearia Garcia & Tatuagem",
  desde: 1997,
  lema: "Tradição e Qualidade",
  morada: "Alameda Padre Alcino Azevedo Barbosa 6",
  codigoPostal: "4470-580",
  localidade: "Moreira, Maia",
  telefone: "+351 914 230 669",
  telefoneRaw: "+351914230669",
  avaliacoes: 59,
  mapa: "https://www.google.com/maps/search/?api=1&query=Alameda+Padre+Alcino+Azevedo+Barbosa+6,+4470-580+Moreira",
  // 0 = Domingo ... 6 = Sábado
  horario: [
    { dia: "Domingo",  aberto: false, abre: null,    fecha: null },
    { dia: "Segunda",  aberto: true,  abre: "10:00", fecha: "20:00" },
    { dia: "Terça",    aberto: true,  abre: "10:00", fecha: "20:00" },
    { dia: "Quarta",   aberto: true,  abre: "10:00", fecha: "20:00" },
    { dia: "Quinta",   aberto: true,  abre: "10:00", fecha: "20:00" },
    { dia: "Sexta",    aberto: true,  abre: "10:00", fecha: "20:00" },
    { dia: "Sábado",   aberto: true,  abre: "10:00", fecha: "20:00" }
  ]
};

export const BARBEIROS = [
  { id: "ary",     nome: "Ary Garcia",    papel: "Mestre barbeiro · Fundador", foto: "assets/img/barbeiro-ary-garcia.jpg",
    bio: "Abriu as portas em 1997. Corte à tesoura e navalha, da escola antiga." },
  { id: "jonatas", nome: "Jónatas Garcia", papel: "Barbeiro · Degradés",        foto: "assets/img/barbeiro-jonatas-garcia.jpg",
    bio: "Especialista em degradés e desenhos. Mão firme, linha limpa." },
  { id: "miguel",  nome: "Miguel Farias",  papel: "Barbeiro · Barba a vapor",   foto: "assets/img/barbeiro-miguel-farias.jpg",
    bio: "Toalha quente, vapor e navalha. O ritual completo da barba." }
];

export const SERVICOS = [
  {
    "id": "corte-classico-maquina-e-tesoura",
    "destaque": true,
    "nome": "Corte Clássico (Máquina e Tesoura)",
    "grupo": "Barbearia",
    "minutos": 30,
    "preco": 13
  },
  {
    "id": "corte-classico-c-tesoura",
    "nome": "Corte Clássico c/ Tesoura",
    "grupo": "Barbearia",
    "minutos": 30,
    "preco": 14
  },
  {
    "id": "corte-so-maquina",
    "nome": "Corte só Máquina",
    "grupo": "Barbearia",
    "minutos": 30,
    "preco": 11
  },
  {
    "id": "corte-degrade",
    "destaque": true,
    "nome": "Corte Degradé",
    "grupo": "Barbearia",
    "minutos": 45,
    "preco": 15
  },
  {
    "id": "corte-de-crianca",
    "nome": "Corte de Criança",
    "grupo": "Barbearia",
    "minutos": 30,
    "preco": 12
  },
  {
    "id": "corte-crianca-degrade",
    "nome": "Corte Criança Degradé",
    "grupo": "Barbearia",
    "minutos": 45,
    "preco": 13
  },
  {
    "id": "barba-so-maquina",
    "nome": "Barba só Máquina",
    "grupo": "Barbearia",
    "minutos": 30,
    "preco": 7
  },
  {
    "id": "barba-a-vapor",
    "destaque": true,
    "nome": "Barba a Vapor",
    "grupo": "Barbearia",
    "minutos": 30,
    "preco": 10
  },
  {
    "id": "corte-classico-maquina-tesoura-barba-vapor",
    "nome": "Corte Clássico (Máquina + Tesoura) + Barba Vapor",
    "grupo": "Barbearia",
    "minutos": 60,
    "preco": 21
  },
  {
    "id": "corte-degrade-barba-vapor",
    "destaque": true,
    "nome": "Corte Degradé + Barba Vapor",
    "grupo": "Barbearia",
    "minutos": 60,
    "preco": 23
  },
  {
    "id": "corte-a-tesoura-barba-maquina",
    "nome": "Corte a Tesoura + Barba Máquina",
    "grupo": "Barbearia",
    "minutos": 45,
    "preco": 20
  },
  {
    "id": "corte-degrade-barba-maquina",
    "nome": "Corte Degradé + Barba Máquina",
    "grupo": "Barbearia",
    "minutos": 60,
    "preco": 21
  },
  {
    "id": "corte-maquina-barba-vapor",
    "nome": "Corte Máquina + Barba Vapor",
    "grupo": "Barbearia",
    "minutos": 45,
    "preco": 19
  },
  {
    "id": "coloracao",
    "nome": "Coloração",
    "grupo": "Barbearia",
    "minutos": 30,
    "preco": 30
  },
  {
    "id": "alisamento",
    "nome": "Alisamento",
    "grupo": "Barbearia",
    "minutos": 45,
    "preco": 30
  },
  {
    "id": "sobrancelhas",
    "nome": "Sobrancelhas",
    "grupo": "Barbearia",
    "minutos": 15,
    "preco": 4
  },
  {
    "id": "lavagem",
    "nome": "Lavagem",
    "grupo": "Barbearia",
    "minutos": 15,
    "preco": 6
  },
  {
    "id": "madeixas",
    "nome": "Madeixas",
    "grupo": "Barbearia",
    "minutos": 165,
    "preco": 30
  },
  {
    "id": "reuniao-de-orcamento",
    "nome": "Reunião de Orçamento",
    "grupo": "Tatuagem",
    "minutos": 60,
    "preco": 0
  }
];

export const GALERIA = [
  { src: "assets/img/cover-1.jpg", alt: "Salão da Barbearia Garcia com cadeiras de barbeiro vintage" },
  { src: "assets/img/cover-5.jpg", alt: "Cadeiras de barbeiro em ferro e pele, ao fundo a bancada de trabalho" },
  { src: "assets/img/cover-3.jpg", alt: "Corte degradé com barba desenhada, trabalho da casa" },
  { src: "assets/img/cover-2.jpg", alt: "Pormenor da bancada e dos espelhos do salão" },
  { src: "assets/img/cover-4.jpg", alt: "Interior da barbearia visto da entrada" }
];
