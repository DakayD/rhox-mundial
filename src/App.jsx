import { useState, useEffect, useCallback } from "react";
import { getData, setData } from './supabase.js';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ─── DATOS ───────────────────────────────────────────────────────────────────

const JUGADORES = ["Gorka", "Zigor", "Mikel", "Imanol", "Andoni", "Dani"];
const COLORES = ["#E63946","#F4A261","#2A9D8F","#457B9D","#C77DFF","#E9C46A"];

// 48 clasificados Mundial 2026 ordenados por ranking FIFA real
const EQUIPOS_RAW = [
  // TIER 1 — Top 12 clasificados
  { n: "Francia",       f: "🇫🇷", r: 1,  t: 1 },
  { n: "España",        f: "🇪🇸", r: 2,  t: 1 },
  { n: "Argentina",     f: "🇦🇷", r: 3,  t: 1 },
  { n: "Inglaterra",    f: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", r: 4,  t: 1 },
  { n: "Portugal",      f: "🇵🇹", r: 5,  t: 1 },
  { n: "Brasil",        f: "🇧🇷", r: 6,  t: 1 },
  { n: "Países Bajos",  f: "🇳🇱", r: 7,  t: 1 },
  { n: "Marruecos",     f: "🇲🇦", r: 8,  t: 1 },
  { n: "Bélgica",       f: "🇧🇪", r: 9,  t: 1 },
  { n: "Alemania",      f: "🇩🇪", r: 10, t: 1 },
  { n: "Croacia",       f: "🇭🇷", r: 11, t: 1 },
  { n: "Colombia",      f: "🇨🇴", r: 13, t: 1 },
  // TIER 2 — Clasificados 13 a 24
  { n: "Senegal",       f: "🇸🇳", r: 14, t: 2 },
  { n: "México",        f: "🇲🇽", r: 15, t: 2 },
  { n: "Estados Unidos",f: "🇺🇸", r: 16, t: 2 },
  { n: "Uruguay",       f: "🇺🇾", r: 17, t: 2 },
  { n: "Japón",         f: "🇯🇵", r: 18, t: 2 },
  { n: "Suiza",         f: "🇨🇭", r: 19, t: 2 },
  { n: "Irán",          f: "🇮🇷", r: 21, t: 2 },
  { n: "Turquía",       f: "🇹🇷", r: 22, t: 2 },
  { n: "Ecuador",       f: "🇪🇨", r: 23, t: 2 },
  { n: "Austria",       f: "🇦🇹", r: 24, t: 2 },
  { n: "Corea del Sur", f: "🇰🇷", r: 25, t: 2 },
  { n: "Australia",     f: "🇦🇺", r: 27, t: 2 },
  // TIER 3 — Clasificados 25 a 48
  { n: "Argelia",       f: "🇩🇿", r: 28, t: 3 },
  { n: "Egipto",        f: "🇪🇬", r: 29, t: 3 },
  { n: "Canadá",        f: "🇨🇦", r: 30, t: 3 },
  { n: "Noruega",       f: "🇳🇴", r: 31, t: 3 },
  { n: "Panamá",        f: "🇵🇦", r: 33, t: 3 },
  { n: "Costa de Marfil",f:"🇨🇮", r: 34, t: 3 },
  { n: "Suecia",        f: "🇸🇪", r: 38, t: 3 },
  { n: "Paraguay",      f: "🇵🇾", r: 40, t: 3 },
  { n: "Rep. Checa",    f: "🇨🇿", r: 41, t: 3 },
  { n: "Escocia",       f: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", r: 43, t: 3 },
  { n: "Túnez",         f: "🇹🇳", r: 44, t: 3 },
  { n: "RD del Congo",  f: "🇨🇩", r: 46, t: 3 },
  { n: "Uzbekistán",    f: "🇺🇿", r: 50, t: 3 },
  { n: "Catar",         f: "🇶🇦", r: 55, t: 3 },
  { n: "Irak",          f: "🇮🇶", r: 57, t: 3 },
  { n: "Sudáfrica",     f: "🇿🇦", r: 60, t: 3 },
  { n: "Arabia Saudita",f: "🇸🇦", r: 61, t: 3 },
  { n: "Jordania",      f: "🇯🇴", r: 63, t: 3 },
  { n: "Bosnia y Herz.",f: "🇧🇦", r: 65, t: 3 },
  { n: "Cabo Verde",    f: "🇨🇻", r: 69, t: 3 },
  { n: "Ghana",         f: "🇬🇭", r: 74, t: 3 },
  { n: "Curazao",       f: "🇨🇼", r: 82, t: 3 },
  { n: "Haití",         f: "🇭🇹", r: 83, t: 3 },
  { n: "Nueva Zelanda", f: "🇳🇿", r: 85, t: 3 },
];

const PARTIDOS_GRUPOS = [
  // GRUPO A: México, Corea del Sur, Sudáfrica, Rep. Checa
  { id:"gA1", grupo:"A", eq1:"México",        eq2:"Sudáfrica",    fecha:"11 Jun", hora:"21:00" },
  { id:"gA2", grupo:"A", eq1:"Corea del Sur", eq2:"Rep. Checa",   fecha:"12 Jun", hora:"04:00" },
  { id:"gA3", grupo:"A", eq1:"Rep. Checa",    eq2:"Sudáfrica",    fecha:"18 Jun", hora:"18:00" },
  { id:"gA4", grupo:"A", eq1:"México",        eq2:"Corea del Sur",fecha:"19 Jun", hora:"03:00" },
  { id:"gA5", grupo:"A", eq1:"Rep. Checa",    eq2:"México",       fecha:"25 Jun", hora:"03:00" },
  { id:"gA6", grupo:"A", eq1:"Sudáfrica",     eq2:"Corea del Sur",fecha:"25 Jun", hora:"03:00" },
  // GRUPO B: Canadá, Bosnia y Herz., Catar, Suiza
  { id:"gB1", grupo:"B", eq1:"Canadá",        eq2:"Bosnia y Herz.",fecha:"12 Jun", hora:"21:00" },
  { id:"gB2", grupo:"B", eq1:"Catar",         eq2:"Suiza",        fecha:"13 Jun", hora:"21:00" },
  { id:"gB3", grupo:"B", eq1:"Suiza",         eq2:"Bosnia y Herz.",fecha:"18 Jun", hora:"21:00" },
  { id:"gB4", grupo:"B", eq1:"Canadá",        eq2:"Catar",        fecha:"19 Jun", hora:"00:00" },
  { id:"gB5", grupo:"B", eq1:"Suiza",         eq2:"Canadá",       fecha:"24 Jun", hora:"21:00" },
  { id:"gB6", grupo:"B", eq1:"Bosnia y Herz.",eq2:"Catar",        fecha:"24 Jun", hora:"21:00" },
  // GRUPO C: Brasil, Marruecos, Haití, Escocia
  { id:"gC1", grupo:"C", eq1:"Brasil",        eq2:"Marruecos",    fecha:"14 Jun", hora:"00:00" },
  { id:"gC2", grupo:"C", eq1:"Haití",         eq2:"Escocia",      fecha:"14 Jun", hora:"03:00" },
  { id:"gC3", grupo:"C", eq1:"Brasil",        eq2:"Haití",        fecha:"20 Jun", hora:"00:00" },
  { id:"gC4", grupo:"C", eq1:"Escocia",       eq2:"Marruecos",    fecha:"20 Jun", hora:"03:00" },
  { id:"gC5", grupo:"C", eq1:"Escocia",       eq2:"Brasil",       fecha:"25 Jun", hora:"00:00" },
  { id:"gC6", grupo:"C", eq1:"Marruecos",     eq2:"Haití",        fecha:"25 Jun", hora:"00:00" },
  // GRUPO D: Estados Unidos, Paraguay, Australia, Turquía
  { id:"gD1", grupo:"D", eq1:"Estados Unidos",eq2:"Paraguay",     fecha:"13 Jun", hora:"03:00" },
  { id:"gD2", grupo:"D", eq1:"Australia",     eq2:"Turquía",      fecha:"13 Jun", hora:"06:00" },
  { id:"gD3", grupo:"D", eq1:"Turquía",       eq2:"Paraguay",     fecha:"19 Jun", hora:"06:00" },
  { id:"gD4", grupo:"D", eq1:"Estados Unidos",eq2:"Australia",    fecha:"19 Jun", hora:"21:00" },
  { id:"gD5", grupo:"D", eq1:"Turquía",       eq2:"Estados Unidos",fecha:"26 Jun", hora:"04:00" },
  { id:"gD6", grupo:"D", eq1:"Paraguay",      eq2:"Australia",    fecha:"26 Jun", hora:"04:00" },
  // GRUPO E: Alemania, Curazao, Costa de Marfil, Ecuador
  { id:"gE1", grupo:"E", eq1:"Alemania",      eq2:"Curazao",      fecha:"14 Jun", hora:"19:00" },
  { id:"gE2", grupo:"E", eq1:"Costa de Marfil",eq2:"Ecuador",     fecha:"15 Jun", hora:"01:00" },
  { id:"gE3", grupo:"E", eq1:"Alemania",      eq2:"Costa de Marfil",fecha:"21 Jun",hora:"00:00" },
  { id:"gE4", grupo:"E", eq1:"Ecuador",       eq2:"Curazao",      fecha:"21 Jun", hora:"02:00" },
  { id:"gE5", grupo:"E", eq1:"Ecuador",       eq2:"Alemania",     fecha:"26 Jun", hora:"00:00" },
  { id:"gE6", grupo:"E", eq1:"Curazao",       eq2:"Costa de Marfil",fecha:"26 Jun",hora:"00:00" },
  // GRUPO F: Países Bajos, Japón, Suecia, Túnez
  { id:"gF1", grupo:"F", eq1:"Países Bajos",  eq2:"Japón",        fecha:"15 Jun", hora:"00:00" },
  { id:"gF2", grupo:"F", eq1:"Suecia",        eq2:"Túnez",        fecha:"15 Jun", hora:"04:00" },
  { id:"gF3", grupo:"F", eq1:"Países Bajos",  eq2:"Suecia",       fecha:"20 Jun", hora:"19:00" },
  { id:"gF4", grupo:"F", eq1:"Túnez",         eq2:"Japón",        fecha:"20 Jun", hora:"06:00" },
  { id:"gF5", grupo:"F", eq1:"Túnez",         eq2:"Países Bajos", fecha:"26 Jun", hora:"01:00" },
  { id:"gF6", grupo:"F", eq1:"Japón",         eq2:"Suecia",       fecha:"26 Jun", hora:"01:00" },
  // GRUPO G: Bélgica, Egipto, Irán, Nueva Zelanda
  { id:"gG1", grupo:"G", eq1:"Bélgica",       eq2:"Egipto",       fecha:"15 Jun", hora:"21:00" },
  { id:"gG2", grupo:"G", eq1:"Irán",          eq2:"Nueva Zelanda",fecha:"16 Jun", hora:"03:00" },
  { id:"gG3", grupo:"G", eq1:"Bélgica",       eq2:"Irán",         fecha:"22 Jun", hora:"01:00" },
  { id:"gG4", grupo:"G", eq1:"Nueva Zelanda", eq2:"Egipto",       fecha:"22 Jun", hora:"03:00" },
  { id:"gG5", grupo:"G", eq1:"Nueva Zelanda", eq2:"Bélgica",      fecha:"27 Jun", hora:"05:00" },
  { id:"gG6", grupo:"G", eq1:"Egipto",        eq2:"Irán",         fecha:"27 Jun", hora:"05:00" },
  // GRUPO H: España, Uruguay, Arabia Saudita, Cabo Verde
  { id:"gH1", grupo:"H", eq1:"España",        eq2:"Cabo Verde",   fecha:"15 Jun", hora:"18:00" },
  { id:"gH2", grupo:"H", eq1:"Arabia Saudita",eq2:"Uruguay",      fecha:"16 Jun", hora:"00:00" },
  { id:"gH3", grupo:"H", eq1:"España",        eq2:"Arabia Saudita",fecha:"21 Jun", hora:"18:00" },
  { id:"gH4", grupo:"H", eq1:"Uruguay",       eq2:"Cabo Verde",   fecha:"22 Jun", hora:"00:00" },
  { id:"gH5", grupo:"H", eq1:"Uruguay",       eq2:"España",       fecha:"27 Jun", hora:"02:00" },
  { id:"gH6", grupo:"H", eq1:"Cabo Verde",    eq2:"Arabia Saudita",fecha:"27 Jun", hora:"02:00" },
  // GRUPO I: Francia, Senegal, Noruega, Irak
  { id:"gI1", grupo:"I", eq1:"Francia",       eq2:"Senegal",      fecha:"16 Jun", hora:"21:00" },
  { id:"gI2", grupo:"I", eq1:"Irak",          eq2:"Noruega",      fecha:"17 Jun", hora:"00:00" },
  { id:"gI3", grupo:"I", eq1:"Francia",       eq2:"Irak",         fecha:"22 Jun", hora:"23:00" },
  { id:"gI4", grupo:"I", eq1:"Noruega",       eq2:"Senegal",      fecha:"23 Jun", hora:"02:00" },
  { id:"gI5", grupo:"I", eq1:"Noruega",       eq2:"Francia",      fecha:"26 Jun", hora:"21:00" },
  { id:"gI6", grupo:"I", eq1:"Senegal",       eq2:"Irak",         fecha:"26 Jun", hora:"21:00" },
  // GRUPO J: Argentina, Argelia, Austria, Jordania
  { id:"gJ1", grupo:"J", eq1:"Argentina",     eq2:"Argelia",      fecha:"17 Jun", hora:"03:00" },
  { id:"gJ2", grupo:"J", eq1:"Austria",       eq2:"Jordania",     fecha:"17 Jun", hora:"06:00" },
  { id:"gJ3", grupo:"J", eq1:"Argentina",     eq2:"Austria",      fecha:"22 Jun", hora:"19:00" },
  { id:"gJ4", grupo:"J", eq1:"Jordania",      eq2:"Argelia",      fecha:"23 Jun", hora:"05:00" },
  { id:"gJ5", grupo:"J", eq1:"Jordania",      eq2:"Argentina",    fecha:"28 Jun", hora:"04:00" },
  { id:"gJ6", grupo:"J", eq1:"Argelia",       eq2:"Austria",      fecha:"28 Jun", hora:"04:00" },
  // GRUPO K: Portugal, RD del Congo, Uzbekistán, Colombia
  { id:"gK1", grupo:"K", eq1:"Portugal",      eq2:"RD del Congo", fecha:"17 Jun", hora:"19:00" },
  { id:"gK2", grupo:"K", eq1:"Uzbekistán",    eq2:"Colombia",     fecha:"18 Jun", hora:"04:00" },
  { id:"gK3", grupo:"K", eq1:"Portugal",      eq2:"Uzbekistán",   fecha:"23 Jun", hora:"19:00" },
  { id:"gK4", grupo:"K", eq1:"Colombia",      eq2:"RD del Congo", fecha:"24 Jun", hora:"04:00" },
  { id:"gK5", grupo:"K", eq1:"Colombia",      eq2:"Portugal",     fecha:"28 Jun", hora:"01:30" },
  { id:"gK6", grupo:"K", eq1:"RD del Congo",  eq2:"Uzbekistán",   fecha:"28 Jun", hora:"01:30" },
  // GRUPO L: Inglaterra, Croacia, Ghana, Panamá
  { id:"gL1", grupo:"L", eq1:"Inglaterra",    eq2:"Croacia",      fecha:"17 Jun", hora:"22:00" },
  { id:"gL2", grupo:"L", eq1:"Ghana",         eq2:"Panamá",       fecha:"18 Jun", hora:"01:00" },
  { id:"gL3", grupo:"L", eq1:"Inglaterra",    eq2:"Ghana",        fecha:"23 Jun", hora:"22:00" },
  { id:"gL4", grupo:"L", eq1:"Panamá",        eq2:"Croacia",      fecha:"24 Jun", hora:"01:00" },
  { id:"gL5", grupo:"L", eq1:"Panamá",        eq2:"Inglaterra",   fecha:"27 Jun", hora:"23:00" },
  { id:"gL6", grupo:"L", eq1:"Croacia",       eq2:"Ghana",        fecha:"27 Jun", hora:"23:00" },
];

const RONDAS_ELIM = [
  { id:"r16", label:"16avos de final",   pts:5,  partidos:16 },
  { id:"r8",  label:"Octavos de final",  pts:8,  partidos:8  },
  { id:"r4",  label:"Cuartos de final",  pts:13, partidos:4  },
  { id:"r2",  label:"Semifinales",       pts:21, partidos:2  },
  { id:"r3",  label:"3er y 4to puesto",  pts:15, partidos:1  },
  { id:"r1",  label:"Final",             pts:34, partidos:1  },
];

const PUNTOS = {
  grupos_victoria:3, grupos_empate:1, grupos_clasificar:3,
  r16:5, r8:8, r4:13, r2:21, r3:15, r1:34,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function sorteoEquilibrado() {
  // Tier 1 dividido en dos mitades ANTES de shufflear
  const top6    = shuffle(EQUIPOS_RAW.filter(e=>e.t===1).slice(0,6));  // puestos 1-6
  const mid6    = shuffle(EQUIPOS_RAW.filter(e=>e.t===1).slice(6,12)); // puestos 7-12
  const t2      = shuffle(EQUIPOS_RAW.filter(e=>e.t===2)); // 12 equipos
  const t3      = shuffle(EQUIPOS_RAW.filter(e=>e.t===3)); // 24 equipos
  const asig = {};
  JUGADORES.forEach((j,i) => {
    const equipos = [
      top6[i],     // 1 de los 6 primeros — garantizado
      mid6[i],     // 1 de los puestos 7-12 — garantizado
      t2[i*2],     // tier 2
      t2[i*2+1],   // tier 2
      t3[i*4],     // tier 3
      t3[i*4+1],   // tier 3
      t3[i*4+2],   // tier 3
      t3[i*4+3],   // tier 3
    ].filter(e => e !== undefined && e !== null && e.t !== undefined);
    asig[j] = equipos;
  });
  return asig;
}

function duenoEquipo(nombre, asignacion) {
  for (const j of JUGADORES) {
    if ((asignacion[j]||[]).some(e => e && e.n === nombre)) return j;
  }
  return null;
}

function equiposVivos(jugador, asignacion, resultadosElim, clasificados) {
  if (!asignacion || !asignacion[jugador]) return { vivos:0, total:0 };
  const equipos = asignacion[jugador];
  const total = equipos.length;
  // Eliminado = perdió en alguna ronda eliminatoria
  const eliminados = new Set();
  for (const res of Object.values(resultadosElim)) {
    if (res.eq1 && res.eq2 && res.ganador) {
      const perdedor = res.ganador === res.eq1 ? res.eq2 : res.eq1;
      eliminados.add(perdedor);
    }
  }
  // También eliminados los que no clasificaron de grupos
  // (los que están en grupos pero clasificados[eq] !== true después de que el grupo acabó)
  const vivos = equipos.filter(e => e && !eliminados.has(e.n)).length;
  return { vivos, total };
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function RhoxPorra() {
  const [tab, setTab] = useState("inicio");
  const [asignacion, setAsignacion] = useState(null);
  const [sorteoHecho, setSorteoHecho] = useState(false);
  const [resultadosGrupos, setResultadosGrupos] = useState({});
  const [resultadosElim, setResultadosElim] = useState({});
  const [clasificados, setClasificados] = useState({});
  const [historialPuntos, setHistorialPuntos] = useState({}); // {id: {label, fechaOrden, jugador:pts}}
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabGrupo, setTabGrupo] = useState("A");
  const [tabRonda, setTabRonda] = useState("grupos");
  const [elimLocal, setElimLocal] = useState({});
  const [confirmandoResorteo, setConfirmandoResorteo] = useState(false);
  const [confirmTexto, setConfirmTexto] = useState("");

  // ── LOAD ────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function cargar() {
      setLoading(true);
      try {
        const d = await getData("rhox-sorteo");
        if (d) {
          const asigR = {};
          if (d.asignacionNombres) {
            JUGADORES.forEach(j => {
              asigR[j] = (d.asignacionNombres[j]||[])
                .map(n => EQUIPOS_RAW.find(e=>e.n===n))
                .filter(Boolean);
            });
          }
          setAsignacion(asigR);
          setSorteoHecho(true);
        }
      } catch(e){}
      try { const d = await getData("rhox-rgrupos");   if(d) setResultadosGrupos(d);    } catch(e){}
      try { const d = await getData("rhox-relim");     if(d) setResultadosElim(d);      } catch(e){}
      try { const d = await getData("rhox-clasif");    if(d) setClasificados(d);        } catch(e){}
      try { const d = await getData("rhox-historial"); if(d) setHistorialPuntos(d);     } catch(e){}
      setLoading(false);
    }
    cargar();
  }, []);

  // ── SAVE HELPERS ────────────────────────────────────────────────────────
  const save = async (key, data) => {
    setSaving(true);
    try { await setData(key, data); } catch(e){}
    setSaving(false);
  };

  // ── SORTEO ──────────────────────────────────────────────────────────────
  const hacerSorteo = async () => {
    const asig = sorteoEquilibrado();
    setAsignacion(asig);
    setSorteoHecho(true);
    const nombres = {};
    JUGADORES.forEach(j => { nombres[j] = asig[j].map(e=>e.n); });
    await save("rhox-sorteo", { asignacionNombres: nombres });

  };

  // ── PUNTOS ──────────────────────────────────────────────────────────────
  const calcularPuntos = useCallback((rGrupos, rElim, clasif, asig) => {
    if (!asig) return {};
    const pts = {};
    JUGADORES.forEach(j => { pts[j] = 0; });
    for (const [id, res] of Object.entries(rGrupos)) {
      if (res.g1===""||res.g2===""||res.g1===undefined) continue;
      const p = PARTIDOS_GRUPOS.find(x=>x.id===id); if(!p) continue;
      const g1=parseInt(res.g1), g2=parseInt(res.g2);
      if(isNaN(g1)||isNaN(g2)) continue;
      const d1=duenoEquipo(p.eq1,asig), d2=duenoEquipo(p.eq2,asig);
      if(g1>g2){ if(d1) pts[d1]+=PUNTOS.grupos_victoria; }
      else if(g2>g1){ if(d2) pts[d2]+=PUNTOS.grupos_victoria; }
      else { if(d1) pts[d1]+=PUNTOS.grupos_empate; if(d2) pts[d2]+=PUNTOS.grupos_empate; }
    }
    for (const [eq, val] of Object.entries(clasif)) {
      if(val===true){ const d=duenoEquipo(eq,asig); if(d) pts[d]+=PUNTOS.grupos_clasificar; }
    }
    for (const [id, res] of Object.entries(rElim)) {
      if(!res.ganador) continue;
      const ronda=id.split("-")[0];
      const d=duenoEquipo(res.ganador,asig);
      if(d) pts[d]+=(PUNTOS[ronda]||0);
    }
    return pts;
  }, []);

  const puntos = calcularPuntos(resultadosGrupos, resultadosElim, clasificados, asignacion);
  const ranking = [...JUGADORES].sort((a,b)=>(puntos[b]||0)-(puntos[a]||0));

  // ── HISTORIAL para gráfico ───────────────────────────────────────────────
  // Genera datos del gráfico a partir del historialPuntos guardado
  // Cada entrada: { label: "Grupo Jornada 1", Gorka: 3, Zigor: 0, ... }
  const datosGrafico = Object.keys(historialPuntos).length > 0
    ? (() => {
        const grupos = Object.entries(historialPuntos)
          .filter(([k]) => k.startsWith("g"))
          .map(([, v]) => v)
          .sort((a, b) => (a.fechaOrden || "").localeCompare(b.fechaOrden || ""));
        const ORDEN_RONDAS = ["r16", "r8", "r4", "r2", "r3", "r1"];
        const elim = Object.entries(historialPuntos)
          .filter(([k]) => !k.startsWith("g") && !k.startsWith("clasif"))
          .sort(([ka], [kb]) => {
            const ra = ORDEN_RONDAS.findIndex(r => ka.startsWith(r));
            const rb = ORDEN_RONDAS.findIndex(r => kb.startsWith(r));
            if (ra !== rb) return ra - rb;
            const na = parseInt(ka.split("-")[1] || "0");
            const nb = parseInt(kb.split("-")[1] || "0");
            return na - nb;
          })
          .map(([, v]) => v);
        return [...grupos, ...elim];
      })()
    : [{ label: "Inicio", ...Object.fromEntries(JUGADORES.map(j=>[j,0])) }];

  // Añadir snapshot al historial cuando se guarda un resultado
  const addSnapshot = async (label, ptsActuales, snapshotId, fechaOrden) => {
    const nuevo = { ...historialPuntos, [snapshotId]: { label, fechaOrden: fechaOrden || "99 Jun 99:99", ...ptsActuales } };
    setHistorialPuntos(nuevo);
    await save("rhox-historial", nuevo);
  };

  // ── RESULTADOS GRUPOS ───────────────────────────────────────────────────
  const setResGrupo = async (id, campo, val) => {
    const nuevo = {...resultadosGrupos, [id]:{...(resultadosGrupos[id]||{}),[campo]:val}};
    setResultadosGrupos(nuevo);
    await save("rhox-rgrupos", nuevo);
    // snapshot si ambos goles están
    const res = nuevo[id];
    if(res.g1!==""&&res.g2!==""&&res.g1!==undefined&&res.g2!==undefined&&asignacion){
      const p = PARTIDOS_GRUPOS.find(x=>x.id===id);
      if(p){
        const pts = calcularPuntos(nuevo, resultadosElim, clasificados, asignacion);
        await addSnapshot(`${p.eq1} vs ${p.eq2}`, pts, p.id, `${p.fecha} ${p.hora}`);
      }
    }
  };

  // ── RESULTADOS ELIM ─────────────────────────────────────────────────────
  const confirmarElim = async (key, data) => {
    const nuevo = {...resultadosElim, [key]:data};
    setResultadosElim(nuevo);
    await save("rhox-relim", nuevo);
    const nl={...elimLocal}; delete nl[key]; setElimLocal(nl);
    if(asignacion){
      const pts = calcularPuntos(resultadosGrupos, nuevo, clasificados, asignacion);
      const ronda = RONDAS_ELIM.find(r=>key.startsWith(r.id));
      const ordenElim = { r16:"28 Jun", r8:"01 Jul", r4:"04 Jul", r2:"08 Jul", r3:"11 Jul", r1:"18 Jul" };
      const rondaId = key.split("-")[0];
      await addSnapshot(ronda ? ronda.label : key, pts, key, `${ordenElim[rondaId]||"30 Jun"} ${key}`);
    }
  };

  const colorJ = (j) => COLORES[JUGADORES.indexOf(j)] || "#888";

  // ── RECONSTRUIR HISTORIAL desde resultados guardados ────────────────────
  const reconstruirHistorial = async () => {
    if (!asignacion) return;
    const nuevoHistorial = {};
    // Fase de grupos: ordenar por fecha y reconstruir acumulando
    const partidosConRes = PARTIDOS_GRUPOS.filter(p => {
      const res = resultadosGrupos[p.id];
      return res && res.g1 !== "" && res.g2 !== "" &&
             res.g1 !== undefined && res.g2 !== undefined &&
             !isNaN(parseInt(res.g1)) && !isNaN(parseInt(res.g2));
    }).sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
    let rGruposAcum = {};
    for (const p of partidosConRes) {
      rGruposAcum = { ...rGruposAcum, [p.id]: resultadosGrupos[p.id] };
      const pts = calcularPuntos(rGruposAcum, {}, clasificados, asignacion);
      nuevoHistorial[p.id] = { label: `${p.eq1} vs ${p.eq2}`, fechaOrden: `${p.fecha} ${p.hora}`, ...pts };
    }
    // Clasificados de grupos
    for (const [eq, val] of Object.entries(clasificados)) {
      if (val === true) {
        const pts = calcularPuntos(resultadosGrupos, {}, clasificados, asignacion);
        nuevoHistorial[`clasif-${eq}`] = { label: `Clasif. ${eq}`, fechaOrden: `27 Jun clasif-${eq}`, ...pts };
      }
    }
    // Eliminatorias: en orden de ronda y número de partido
    const ORDEN_RONDAS = ["r16", "r8", "r4", "r2", "r3", "r1"];
    const elimOrdenados = Object.entries(resultadosElim)
      .filter(([, res]) => res.ganador)
      .sort(([ka], [kb]) => {
        const ra = ORDEN_RONDAS.findIndex(r => ka.startsWith(r));
        const rb = ORDEN_RONDAS.findIndex(r => kb.startsWith(r));
        if (ra !== rb) return ra - rb;
        return parseInt(ka.split("-")[1]||"0") - parseInt(kb.split("-")[1]||"0");
      });
    for (const [key, res] of elimOrdenados) {
      const ronda = RONDAS_ELIM.find(r => key.startsWith(r.id));
      const pts = calcularPuntos(resultadosGrupos, resultadosElim, clasificados, asignacion);
      nuevoHistorial[key] = { label: `${res.eq1} vs ${res.eq2}`, fechaOrden: key, ...pts };
    }
    setHistorialPuntos(nuevoHistorial);
    await save("rhox-historial", nuevoHistorial);
  };

  // ── EQUIPOS VIVOS ───────────────────────────────────────────────────────
  // Equipos vivos: todos los clasificados marcados + los que aún no han jugado grupo
  // Si hay al menos 1 clasificado en un grupo → los no marcados están eliminados
  const getEliminados = () => {
    const eliminados = new Set();
    // Eliminados en rondas eliminatorias (perdedores)
    for (const res of Object.values(resultadosElim)) {
      if (res.eq1 && res.eq2 && res.ganador) {
        eliminados.add(res.ganador === res.eq1 ? res.eq2 : res.eq1);
      }
    }
    // Eliminados en fase de grupos: equipos cuyo grupo tiene clasificados marcados pero ellos no están
    const gruposConClasificados = {};
    for (const eq of Object.keys(clasificados)) {
      if (clasificados[eq] === true) {
        // Find which group this team belongs to
        const partido = PARTIDOS_GRUPOS.find(p => p.eq1 === eq || p.eq2 === eq);
        if (partido) {
          if (!gruposConClasificados[partido.grupo]) gruposConClasificados[partido.grupo] = [];
          gruposConClasificados[partido.grupo].push(eq);
        }
      }
    }
    // Any team in a group that has classified teams but is not classified → eliminated
    for (const [grupo, clasifs] of Object.entries(gruposConClasificados)) {
      const equiposGrupo = [...new Set(
        PARTIDOS_GRUPOS.filter(p => p.grupo === grupo).flatMap(p => [p.eq1, p.eq2])
      )];
      for (const eq of equiposGrupo) {
        if (!clasifs.includes(eq)) eliminados.add(eq);
      }
    }
    return eliminados;
  };

  const getVivos = (j) => {
    if (!asignacion || !asignacion[j]) return null;
    const eliminados = getEliminados();
    const equipos = asignacion[j];
    const total = equipos.length;
    const vivos = equipos.filter(e => e && !eliminados.has(e.n)).length;
    return { vivos, total };
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#060d1f",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{fontSize:48}}>⚽</div>
      <div style={{color:"#FFD700",fontFamily:"Georgia,serif",letterSpacing:4,fontSize:14}}>CARGANDO RHOX...</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#060d1f 0%,#0d1b3e 60%,#0a1020 100%)",fontFamily:"'Georgia',serif",color:"#e8e0d0",paddingBottom:80}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(180deg,rgba(255,215,0,0.12) 0%,transparent 100%)",borderBottom:"1px solid rgba(255,215,0,0.25)",padding:"18px 16px 12px",textAlign:"center",position:"sticky",top:0,zIndex:200,backdropFilter:"blur(12px)"}}>
        <div style={{fontSize:9,letterSpacing:5,color:"#FFD700",textTransform:"uppercase",marginBottom:2}}>La porra de los</div>
        <h1 style={{margin:0,fontSize:32,fontWeight:"bold",background:"linear-gradient(90deg,#FFD700,#FFF8DC,#FFD700)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:6}}>RHOX</h1>
        <div style={{fontSize:10,color:"#888",letterSpacing:2,marginTop:2}}>MUNDIAL 2026 · USA · MÉX · CAN</div>
        {saving && <div style={{fontSize:9,color:"#4CAF50",marginTop:4}}>● guardando...</div>}
      </div>

      {/* NAV */}
      <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.08)",background:"rgba(0,0,0,0.4)",position:"sticky",top:78,zIndex:100}}>
        {[{id:"inicio",icon:"⚽",label:"Inicio"},{id:"sorteo",icon:"🎲",label:"Sorteo"},{id:"partidos",icon:"📅",label:"Partidos"},{id:"ranking",icon:"🏅",label:"Ranking"},{id:"reglas",icon:"📊",label:"Puntos"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 2px",background:tab===t.id?"rgba(255,215,0,0.12)":"transparent",border:"none",borderBottom:tab===t.id?"2px solid #FFD700":"2px solid transparent",color:tab===t.id?"#FFD700":"#666",cursor:"pointer",fontSize:10,letterSpacing:0.5,transition:"all 0.2s"}}>
            <div style={{fontSize:16,marginBottom:2}}>{t.icon}</div>{t.label}
          </button>
        ))}
      </div>

      <div style={{padding:"16px",maxWidth:640,margin:"0 auto"}}>

        {/* ══════════════ INICIO ══════════════ */}
        {tab==="inicio" && (
          <div>
            <div style={{background:"rgba(255,215,0,0.07)",border:"1px solid rgba(255,215,0,0.2)",borderRadius:12,padding:16,marginBottom:20,textAlign:"center"}}>
              <div style={{fontSize:13,color:"#ccc"}}>48 equipos · 12 grupos · 6 participantes</div>
              <div style={{fontSize:11,color:"#888",marginTop:4}}>11 Jun – 19 Jul 2026</div>
            </div>
            <div style={{fontSize:11,letterSpacing:3,color:"#FFD700",textTransform:"uppercase",marginBottom:10}}>👥 Participantes</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
              {JUGADORES.map((j,i)=>(
                <div key={j} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:colorJ(j),display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:"bold",color:"#000",flexShrink:0}}>{j[0]}</div>
                  <span style={{fontSize:14}}>{j}</span>
                  {sorteoHecho && <span style={{marginLeft:"auto",fontWeight:"bold",color:"#FFD700",fontSize:13}}>{puntos[j]||0}</span>}
                </div>
              ))}
            </div>

            {!sorteoHecho ? (
              <button onClick={hacerSorteo} style={{width:"100%",padding:16,background:"linear-gradient(135deg,#FFD700,#FFA500)",border:"none",borderRadius:12,color:"#000",fontSize:15,fontWeight:"bold",cursor:"pointer",letterSpacing:1}}>
                🎲 Hacer el sorteo
              </button>
            ) : (
              <div>
                <div style={{textAlign:"center",fontSize:11,color:"#4CAF50",marginBottom:10}}>✓ Sorteo realizado y sincronizado</div>
                {!confirmandoResorteo ? (
                  <button onClick={()=>setConfirmandoResorteo(true)} style={{width:"100%",padding:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"#555",fontSize:12,cursor:"pointer"}}>
                    🔄 Repetir sorteo
                  </button>
                ) : (
                  <div style={{background:"rgba(220,50,50,0.1)",border:"1px solid rgba(220,50,50,0.4)",borderRadius:10,padding:14}}>
                    <div style={{fontSize:13,color:"#ff6b6b",fontWeight:"bold",marginBottom:6}}>⚠️ ¡ATENCIÓN!</div>
                    <div style={{fontSize:12,color:"#ccc",marginBottom:12,lineHeight:1.6}}>Si repites el sorteo se borrarán todos los equipos asignados. Los resultados y puntos guardados se mantendrán pero quedarán descuadrados.</div>
                    <div style={{fontSize:12,color:"#aaa",marginBottom:8}}>Escribe <strong style={{color:"#FFD700"}}>RHOX</strong> para confirmar:</div>
                    <input value={confirmTexto} onChange={e=>setConfirmTexto(e.target.value)} placeholder="Escribe RHOX..."
                      style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,color:"#fff",fontSize:14,marginBottom:10}}/>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>{setConfirmandoResorteo(false);setConfirmTexto("");}} style={{flex:1,padding:10,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#ccc",cursor:"pointer",fontSize:13}}>Cancelar</button>
                      <button disabled={confirmTexto!=="RHOX"} onClick={()=>{hacerSorteo();setConfirmandoResorteo(false);setConfirmTexto("");}}
                        style={{flex:1,padding:10,background:confirmTexto==="RHOX"?"linear-gradient(135deg,#e63946,#c1121f)":"rgba(255,255,255,0.05)",border:"none",borderRadius:8,color:confirmTexto==="RHOX"?"#fff":"#555",cursor:confirmTexto==="RHOX"?"pointer":"not-allowed",fontSize:13,fontWeight:"bold"}}>
                        Repetir sorteo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════ SORTEO ══════════════ */}
        {tab==="sorteo" && (
          <div>
            {!sorteoHecho ? (
              <div style={{textAlign:"center",padding:40,color:"#555"}}>
                <div style={{fontSize:48,marginBottom:12}}>🎲</div>
                <p>Ve a Inicio y haz el sorteo primero</p>
              </div>
            ) : (
              <>
                <div style={{fontSize:11,color:"#888",marginBottom:16,textAlign:"center"}}>2 top · 2 medios · 4 bajos por jugador</div>
                {JUGADORES.map((j,idx)=>(
                  <div key={j} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,marginBottom:10,overflow:"hidden"}}>
                    <div style={{padding:"10px 14px",background:`linear-gradient(90deg,${colorJ(j)}22,transparent)`,borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:26,height:26,borderRadius:"50%",background:colorJ(j),display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:"bold",color:"#000"}}>{j[0]}</div>
                      <span style={{fontWeight:"bold",fontSize:14}}>{j}</span>
                      <span style={{marginLeft:"auto",fontSize:12,color:"#FFD700",fontWeight:"bold"}}>{puntos[j]||0} pts</span>
                    </div>
                    <div style={{padding:"10px 12px"}}>
                      {[1,2,3].map(tier=>{
                        const eq=(asignacion[j]||[]).filter(e=>e&&e.t!==undefined&&e.t===tier);
                        if(!eq.length) return null;
                        return (
                          <div key={tier} style={{marginBottom:6}}>
                            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:tier===1?"#FFD700":tier===2?"#90CAF9":"#A5D6A7",marginBottom:4}}>
                              {tier===1?"★ Top":tier===2?"◆ Medio":"◇ Bajo"}
                            </div>
                            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                              {eq.map(e=>(
                                <span key={e.n} style={{background:"rgba(255,255,255,0.06)",borderRadius:6,padding:"3px 8px",fontSize:12,border:"1px solid rgba(255,255,255,0.08)"}}>
                                  {e.f} {e.n}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ══════════════ PARTIDOS ══════════════ */}
        {tab==="partidos" && (
          <div>
            <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
              <button onClick={()=>setTabRonda("grupos")} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,background:tabRonda==="grupos"?"#FFD700":"rgba(255,255,255,0.08)",color:tabRonda==="grupos"?"#000":"#ccc",fontWeight:tabRonda==="grupos"?"bold":"normal"}}>Grupos</button>
              {RONDAS_ELIM.map(r=>(
                <button key={r.id} onClick={()=>setTabRonda(r.id)} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,background:tabRonda===r.id?"#FFD700":"rgba(255,255,255,0.08)",color:tabRonda===r.id?"#000":"#ccc",fontWeight:tabRonda===r.id?"bold":"normal"}}>
                  {r.label.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* GRUPOS */}
            {tabRonda==="grupos" && (
              <div>
                <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>
                  {"ABCDEFGHIJKL".split("").map(g=>(
                    <button key={g} onClick={()=>setTabGrupo(g)} style={{width:32,height:32,borderRadius:"50%",border:"none",cursor:"pointer",fontSize:12,fontWeight:"bold",background:tabGrupo===g?"#FFD700":"rgba(255,255,255,0.08)",color:tabGrupo===g?"#000":"#ccc"}}>{g}</button>
                  ))}
                </div>
                {PARTIDOS_GRUPOS.filter(p=>p.grupo===tabGrupo).map(p=>{
                  const res=resultadosGrupos[p.id]||{};
                  const g1=res.g1??"", g2=res.g2??"";
                  const terminado=g1!==""&&g2!==""&&!isNaN(parseInt(g1))&&!isNaN(parseInt(g2));
                  const d1=sorteoHecho?duenoEquipo(p.eq1,asignacion):null;
                  const d2=sorteoHecho?duenoEquipo(p.eq2,asignacion):null;
                  return (
                    <div key={p.id} style={{background:terminado?"rgba(76,175,80,0.07)":"rgba(255,255,255,0.03)",border:`1px solid ${terminado?"rgba(76,175,80,0.25)":"rgba(255,255,255,0.07)"}`,borderRadius:10,marginBottom:8,padding:"10px 12px"}}>
                      <div style={{fontSize:10,color:"#666",marginBottom:6}}>{p.fecha} · {p.hora}h</div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,textAlign:"right"}}>
                          <div style={{fontSize:13}}>{EQUIPOS_RAW.find(e=>e.n===p.eq1)?.f} {p.eq1}</div>
                          {d1&&<div style={{fontSize:10,color:colorJ(d1),marginTop:2}}>{d1}</div>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          <input value={g1} onChange={e=>setResGrupo(p.id,"g1",e.target.value)} type="number" min="0" max="20"
                            style={{width:36,height:36,textAlign:"center",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,color:"#fff",fontSize:16,fontWeight:"bold"}}/>
                          <span style={{color:"#555",fontSize:14}}>:</span>
                          <input value={g2} onChange={e=>setResGrupo(p.id,"g2",e.target.value)} type="number" min="0" max="20"
                            style={{width:36,height:36,textAlign:"center",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,color:"#fff",fontSize:16,fontWeight:"bold"}}/>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13}}>{EQUIPOS_RAW.find(e=>e.n===p.eq2)?.f} {p.eq2}</div>
                          {d2&&<div style={{fontSize:10,color:colorJ(d2),marginTop:2}}>{d2}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Clasificados */}
                <div style={{marginTop:16,padding:"12px 14px",background:"rgba(255,215,0,0.05)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:10}}>
                  <div style={{fontSize:11,letterSpacing:2,color:"#FFD700",marginBottom:10,textTransform:"uppercase"}}>✓ Clasificados del Grupo {tabGrupo}</div>
                  {PARTIDOS_GRUPOS.filter(p=>p.grupo===tabGrupo).reduce((eq,p)=>{
                    if(!eq.includes(p.eq1)) eq.push(p.eq1);
                    if(!eq.includes(p.eq2)) eq.push(p.eq2);
                    return eq;
                  },[]).map(eq=>{
                    const d=sorteoHecho?duenoEquipo(eq,asignacion):null;
                    const marcado=clasificados[eq]===true;
                    return (
                      <div key={eq} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{fontSize:13}}>
                          {EQUIPOS_RAW.find(e=>e.n===eq)?.f} {eq}
                          {d&&<span style={{fontSize:10,color:colorJ(d),marginLeft:8}}>{d}</span>}
                        </div>
                        <button onClick={async()=>{
                          const nuevo={...clasificados,[eq]:!marcado};
                          setClasificados(nuevo);
                          await save("rhox-clasif",nuevo);
                          if(asignacion){
                            const pts=calcularPuntos(resultadosGrupos,resultadosElim,nuevo,asignacion);
                            await addSnapshot(`Clasif. ${eq}`, pts, `clasif-${eq}`, `27 Jun clasif-${eq}`);
                          }
                        }} style={{padding:"4px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:"bold",background:marcado?"rgba(76,175,80,0.3)":"rgba(255,255,255,0.08)",color:marcado?"#4CAF50":"#888"}}>
                          {marcado?"✓ Clasifica":"Clasifica?"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ELIMINATORIAS */}
            {RONDAS_ELIM.map(ronda=>tabRonda===ronda.id&&(
              <div key={ronda.id}>
                <div style={{fontSize:11,color:"#888",marginBottom:14}}>{ronda.label} · <span style={{color:"#FFD700"}}>+{ronda.pts} pts por avanzar</span></div>
                {Array.from({length:ronda.partidos}).map((_,i)=>{
                  const key=`${ronda.id}-${i}`;
                  const guardado=resultadosElim[key];
                  const local=elimLocal[key]||{};
                  const eq1=local.eq1||guardado?.eq1||"";
                  const eq2=local.eq2||guardado?.eq2||"";
                  const g1=local.g1!==undefined?local.g1:(guardado?.g1??"");
                  const g2=local.g2!==undefined?local.g2:(guardado?.g2??"");
                  const esEmpate=g1!==""&&g2!==""&&!isNaN(parseInt(g1))&&!isNaN(parseInt(g2))&&parseInt(g1)===parseInt(g2);
                  const ganadorAuto=!esEmpate&&g1!==""&&g2!==""&&eq1&&eq2?(parseInt(g1)>parseInt(g2)?eq1:eq2):null;
                  const ganador=guardado?.ganador||ganadorAuto||local.ganador||"";
                  const d=sorteoHecho&&ganador?duenoEquipo(ganador,asignacion):null;
                  const confirmado=!!guardado?.ganador;
                  const setLocal=(campo,val)=>setElimLocal(prev=>({...prev,[key]:{...(prev[key]||{}),[campo]:val}}));
                  const eliminadosElim = getEliminados();
                  const opcionesEq = EQUIPOS_RAW
                    .map(e => e.n)
                    .filter(n => !eliminadosElim.has(n))
                    .sort((a, b) => a.localeCompare(b, 'es'));
                  return (
                    <div key={key} style={{background:confirmado?"rgba(76,175,80,0.07)":"rgba(255,255,255,0.03)",border:`1px solid ${confirmado?"rgba(76,175,80,0.3)":"rgba(255,255,255,0.07)"}`,borderRadius:10,marginBottom:10,padding:"12px"}}>
                      <div style={{fontSize:10,color:"#666",marginBottom:8}}>Partido {i+1}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <select value={eq1} onChange={e=>setLocal("eq1",e.target.value)} disabled={confirmado}
                          style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,color:"#fff",padding:"6px 4px",fontSize:12}}>
                          <option value="">-- Equipo --</option>
                          {opcionesEq.map(n=><option key={n} value={n} style={{background:"#1a1a2e"}}>{n}</option>)}
                        </select>
                        <div style={{display:"flex",gap:4}}>
                          <input value={g1} onChange={e=>setLocal("g1",e.target.value)} type="number" min="0" disabled={confirmado}
                            style={{width:34,height:34,textAlign:"center",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,color:"#fff",fontSize:15,fontWeight:"bold"}}/>
                          <span style={{color:"#555",alignSelf:"center"}}>:</span>
                          <input value={g2} onChange={e=>setLocal("g2",e.target.value)} type="number" min="0" disabled={confirmado}
                            style={{width:34,height:34,textAlign:"center",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,color:"#fff",fontSize:15,fontWeight:"bold"}}/>
                        </div>
                        <select value={eq2} onChange={e=>setLocal("eq2",e.target.value)} disabled={confirmado}
                          style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,color:"#fff",padding:"6px 4px",fontSize:12}}>
                          <option value="">-- Equipo --</option>
                          {opcionesEq.map(n=><option key={n} value={n} style={{background:"#1a1a2e"}}>{n}</option>)}
                        </select>
                      </div>
                      {esEmpate&&!confirmado&&eq1&&eq2&&(
                        <div style={{background:"rgba(255,165,0,0.1)",border:"1px solid rgba(255,165,0,0.3)",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                          <div style={{fontSize:10,color:"#FFA500",marginBottom:6}}>⚠️ Empate — ¿Quién pasa? (penaltis)</div>
                          <div style={{display:"flex",gap:6}}>
                            {[eq1,eq2].map(eq=>(
                              <button key={eq} onClick={()=>setLocal("ganador",eq)} style={{flex:1,padding:"6px 8px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,background:local.ganador===eq?"rgba(255,215,0,0.3)":"rgba(255,255,255,0.08)",color:local.ganador===eq?"#FFD700":"#ccc",fontWeight:local.ganador===eq?"bold":"normal"}}>
                                {EQUIPOS_RAW.find(e=>e.n===eq)?.f} {eq}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {(ganador||ganadorAuto)&&(
                        <div style={{fontSize:11,color:"#4CAF50",marginBottom:8}}>
                          Pasa: <strong>{ganador||ganadorAuto}</strong>
                          {d&&<span style={{color:colorJ(d),marginLeft:6}}>→ {d}</span>}
                        </div>
                      )}
                      {!confirmado&&eq1&&eq2&&g1!==""&&g2!==""&&(ganador||ganadorAuto)&&(
                        <button onClick={()=>confirmarElim(key,{eq1,eq2,g1,g2,ganador:ganador||ganadorAuto})} style={{width:"100%",padding:"8px",background:"linear-gradient(90deg,#4CAF50,#2E7D32)",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:"bold",cursor:"pointer"}}>
                          ✓ Confirmar resultado
                        </button>
                      )}
                      {confirmado&&(
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontSize:11,color:"#4CAF50"}}>✓ Confirmado</span>
                          <button onClick={()=>{const n={...resultadosElim};delete n[key];setResultadosElim(n);save("rhox-relim",n);}} style={{fontSize:10,color:"#888",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:4,padding:"3px 8px",cursor:"pointer"}}>Editar</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ══════════════ RANKING ══════════════ */}
        {tab==="ranking" && (
          <div>
            <div style={{fontSize:11,color:"#888",marginBottom:16,textAlign:"center"}}>Actualizado en tiempo real</div>

            {/* TABLA */}
            {ranking.map((j,idx)=>{
              const medal=["🥇","🥈","🥉"];
              const pj=puntos[j]||0;
              const vivos=getVivos(j);
              return (
                <div key={j} style={{display:"flex",alignItems:"center",gap:14,background:idx===0?"linear-gradient(90deg,rgba(255,215,0,0.12),rgba(255,215,0,0.04))":"rgba(255,255,255,0.03)",border:`1px solid ${idx<3?colorJ(j)+"40":"rgba(255,255,255,0.06)"}`,borderRadius:12,padding:"14px 16px",marginBottom:8}}>
                  <div style={{fontSize:idx<3?26:16,minWidth:32,textAlign:"center",color:idx<3?"inherit":"#555",fontWeight:"bold"}}>
                    {idx<3?medal[idx]:`${idx+1}°`}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:16,fontWeight:idx===0?"bold":"normal",color:idx===0?"#FFD700":"#e8e0d0"}}>{j}</div>
                    {/* Equipos vivos */}
                    {vivos && (
                      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}}>
                        {Array.from({length:vivos.total}).map((_,k)=>(
                          <div key={k} style={{width:8,height:8,borderRadius:"50%",background:k<vivos.vivos?colorJ(j):"rgba(255,255,255,0.15)"}}/>
                        ))}
                        <span style={{fontSize:10,color:"#666",marginLeft:2}}>{vivos.vivos}/{vivos.total} vivos</span>
                      </div>
                    )}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:idx===0?26:20,fontWeight:"bold",color:idx<3?colorJ(j):"#ccc"}}>{pj}</div>
                    <div style={{fontSize:10,color:"#555"}}>pts</div>
                  </div>
                </div>
              );
            })}

            {ranking.every(j=>(puntos[j]||0)===0)&&(
              <div style={{textAlign:"center",padding:30,color:"#444"}}>
                <div style={{fontSize:40,marginBottom:8}}>⚽</div>
                <div style={{fontSize:13}}>El Mundial empieza el 11 de junio</div>
              </div>
            )}

            {/* BOTÓN RECONSTRUIR */}
            <button onClick={reconstruirHistorial} style={{
              width:"100%", marginTop:16, padding:"10px",
              background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.2)",
              borderRadius:10, color:"#FFD700", fontSize:12, cursor:"pointer"
            }}>🔄 Reconstruir gráfico</button>

            {/* GRÁFICO EVOLUCIÓN */}
            {datosGrafico.length > 1 && (
              <div style={{marginTop:24,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"16px 8px"}}>
                <div style={{fontSize:11,letterSpacing:2,color:"#FFD700",textTransform:"uppercase",marginBottom:16,paddingLeft:8}}>
                  📈 Evolución del ranking
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={datosGrafico} margin={{top:5,right:10,left:-10,bottom:5}}>
                    <XAxis dataKey="label" tick={{fontSize:8,fill:"#555"}} interval="preserveStartEnd"/>
                    <YAxis tick={{fontSize:9,fill:"#555"}}/>
                    <Tooltip
                      contentStyle={{background:"#0d1b3e",border:"1px solid rgba(255,215,0,0.3)",borderRadius:8,fontSize:11}}
                      labelStyle={{color:"#FFD700",marginBottom:4}}
                      itemStyle={{color:"#ccc"}}
                    />
                    <Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>
                    {JUGADORES.map(j=>(
                      <Line key={j} type="monotone" dataKey={j} stroke={colorJ(j)} strokeWidth={2} dot={false} activeDot={{r:4}}/>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {Object.keys(historialPuntos).length === 0 && (
              <div style={{marginTop:24,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:20,textAlign:"center"}}>
                <div style={{fontSize:24,marginBottom:8}}>📈</div>
                <div style={{fontSize:12,color:"#555"}}>El gráfico de evolución aparecerá aquí cuando se anoten los primeros resultados</div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ REGLAS ══════════════ */}
        {tab==="reglas" && (
          <div>
            <div style={{fontSize:11,letterSpacing:3,color:"#FFD700",textTransform:"uppercase",marginBottom:16}}>Sistema de puntuación</div>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,overflow:"hidden",marginBottom:12}}>
              <div style={{padding:"10px 14px",background:"rgba(255,215,0,0.1)",borderBottom:"1px solid rgba(255,215,0,0.15)",fontSize:12,fontWeight:"bold",color:"#FFD700",letterSpacing:1}}>FASE DE GRUPOS</div>
              {[["Victoria","+3 pts"],["Empate","+1 pt"],["Clasificar entre los 2 primeros","+3 pts"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:13}}>
                  <span style={{color:"#ccc"}}>{k}</span><span style={{color:"#4CAF50",fontWeight:"bold"}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,overflow:"hidden",marginBottom:16}}>
              <div style={{padding:"10px 14px",background:"rgba(255,215,0,0.1)",borderBottom:"1px solid rgba(255,215,0,0.15)",fontSize:12,fontWeight:"bold",color:"#FFD700",letterSpacing:1}}>RONDAS ELIMINATORIAS</div>
              {[["Pasar 16avos","+5 pts"],["Pasar Octavos","+8 pts"],["Pasar Cuartos","+13 pts"],["Pasar Semifinal","+21 pts"],["Ganar 3er puesto","+15 pts"],["Campeón del Mundial","+34 pts"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:13}}>
                  <span style={{color:"#ccc"}}>{k}</span><span style={{color:"#FFD700",fontWeight:"bold"}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(255,165,0,0.08)",border:"1px solid rgba(255,165,0,0.25)",borderRadius:10,padding:"12px 14px",fontSize:12,color:"#aaa",lineHeight:1.7,marginBottom:12}}>
              <div style={{color:"#FFA500",fontWeight:"bold",marginBottom:6}}>⚽ Nota sobre penaltis</div>
              En rondas eliminatorias el resultado anotado es siempre el del 90'/prórroga. Si hay empate, se indica manualmente quién pasa. El equipo que avanza se lleva los puntos de esa ronda independientemente de si fue por penaltis.
            </div>
            <div style={{padding:"12px 14px",background:"rgba(255,215,0,0.05)",border:"1px solid rgba(255,215,0,0.1)",borderRadius:10}}>
              <div style={{fontSize:11,color:"#888",marginBottom:6}}>PUNTUACIÓN MÁXIMA POSIBLE (equipo campeón)</div>
              <div style={{fontSize:12,color:"#ccc",lineHeight:1.8}}>
                3 victorias grupos (9) + clasificar (3) + 16avos (5) + octavos (8) + cuartos (13) + semifinal (21) + campeón (34) = <span style={{color:"#FFD700",fontWeight:"bold",fontSize:15}}>93 pts</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
