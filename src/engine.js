// Lógica pura del juego: constantes, tiradas, reloj, economía, ranking y prompts
export const DIFF = {
  facil: { label: 'Fácil', mod: 3, hunger: 5, fat: 8 },
  medio: { label: 'Medio', mod: 0, hunger: 10, fat: 12 },
  dificil: { label: 'Difícil', mod: -3, hunger: 18, fat: 20 },
  leyenda: { label: 'Leyenda', mod: -5, hunger: 25, fat: 28 },
};
export const MOMENTS = ['madrugada', 'mañana', 'mediodía', 'tarde', 'anochecer', 'noche'];
// factor = intensidad de hambre/cansancio; days = días que pasan (para la economía)
export const SCALES = {
  momento: { label: 'Momento del día', factor: 1, days: 1 / 6 },
  dia: { label: 'Día', factor: 4, days: 1 },
  semana: { label: 'Semana', factor: 7, days: 7 },
  mes: { label: 'Mes', factor: 9, days: 30 },
  trimestre: { label: 'Trimestre', factor: 10, days: 90 },
};
export const ATTRS = { fue: 'Fuerza', des: 'Destreza', con: 'Constitución', int: 'Inteligencia', sab: 'Sabiduría', car: 'Carisma' };
export const DCS = { bajo: 8, medio: 10, alto: 13, extremo: 15 };
export const MODELS = [
  { id: 'claude-haiku', label: 'Claude Haiku (barato)' },
  { id: 'gpt-4o', label: 'GPT-4o (mejor)' },
  { id: 'gpt-4o-mini', label: 'GPT-4o mini (barato)' },
];
export const WORLDS = {
  historico: 'Histórico (realista)',
  fantasia: 'Fantasía',
  futurista: 'Futurista / ciencia ficción',
};
// y < 0 = antes de Cristo
export const ERAS = [
  { id: 'prehistoria', n: 'Prehistoria', y: -10000, r: ['Península Ibérica', 'Valle del Rin', 'Sabana africana'] },
  { id: 'mesopotamia', n: 'Mesopotamia', y: -1800, r: ['Babilonia', 'Ur', 'Nínive'] },
  { id: 'egipto', n: 'Antiguo Egipto', y: -1300, r: ['Tebas', 'Menfis', 'Delta del Nilo'] },
  { id: 'grecia', n: 'Grecia clásica', y: -430, r: ['Atenas', 'Esparta', 'Corinto'] },
  { id: 'roma', n: 'Roma', y: 117, r: ['Roma', 'Tarraco', 'Hispania', 'Galia'] },
  { id: 'china', n: 'China imperial', y: 750, r: ["Chang'an", 'Luoyang', 'Cantón'] },
  { id: 'medieval', n: 'Edad Media', y: 1200, r: ['Barcelona', 'Castilla', 'París', 'Toledo'] },
  { id: 'alandalus', n: 'Al-Ándalus', y: 950, r: ['Córdoba', 'Sevilla', 'Granada'] },
  { id: 'japon', n: 'Japón feudal', y: 1600, r: ['Kioto', 'Edo', 'Osaka'] },
  { id: 'renacimiento', n: 'Renacimiento', y: 1500, r: ['Florencia', 'Venecia', 'Valencia'] },
  { id: 'descubrimientos', n: 'Era de los descubrimientos', y: 1520, r: ['Sevilla', 'Lisboa', 'Nueva España'] },
  { id: 'moderna', n: 'Edad Moderna', y: 1650, r: ['Madrid', 'Ámsterdam', 'Londres', 'Caribe'] },
  { id: 'ilustracion', n: 'Ilustración', y: 1770, r: ['París', 'Barcelona', 'Boston'] },
  { id: 'industrial', n: 'Revolución Industrial', y: 1840, r: ['Manchester', 'Londres', 'Barcelona', 'Sabadell'] },
  { id: 'belleepoque', n: 'Belle Époque', y: 1900, r: ['París', 'Viena', 'Barcelona'] },
  { id: 'gm1', n: 'Primera Guerra Mundial', y: 1916, r: ['Verdún', 'Londres', 'Berlín'] },
  { id: 'entreguerras', n: 'Entreguerras', y: 1929, r: ['Nueva York', 'Berlín', 'Madrid'] },
  { id: 'gcivil', n: 'Guerra Civil española', y: 1937, r: ['Madrid', 'Barcelona', 'Frente de Aragón'] },
  { id: 'gm2', n: 'Segunda Guerra Mundial', y: 1942, r: ['Londres', 'París ocupado', 'Stalingrado'] },
  { id: 'guerrafria', n: 'Guerra Fría', y: 1965, r: ['Berlín', 'Madrid', 'Nueva York'] },
  { id: 'actual', n: 'Actualidad', y: 2024, r: ['Barcelona', 'Madrid', 'Costa Brava', 'Nueva York'] },
];
const A = (fue, des, con, int, sab, car) => ({ fue, des, con, int, sab, car });
// money en cobres (1 plata = 1000 cobres, 1 oro = 1000 platas)
// eco: [concepto, cobres/día] (+ ingreso, - gasto)
export const ARCHETYPES = [
  { id: 'nada', name: 'Sin nada (muy pobre)', desc: 'Empiezas de cero: unos cobres, harapos y hambre.', attrs: A(10, 10, 10, 10, 10, 10), skills: { Supervivencia: 1 }, money: 3,
    inv: [['Ropa raída', 1], ['Mendrugo de pan', 1]], eco: [['Comida (mendigando)', -6]], hunger: 45, fatigue: 30 },
  { id: 'campesino', name: 'Campesino', desc: 'Curtido, trabajador, apenas unos cobres.', attrs: A(12, 10, 13, 9, 11, 9), skills: { Agricultura: 2, Supervivencia: 1 }, money: 60,
    inv: [['Ropa de trabajo', 1], ['Azada', 1], ['Pan', 3], ['Cuchillo', 1], ['Odre de agua', 1]], eco: [['Jornal en el campo', 40], ['Comida', -15], ['Choza / techo', -5]] },
  { id: 'artesano', name: 'Artesano', desc: 'Manos hábiles y un oficio.', attrs: A(10, 13, 11, 11, 10, 10), skills: { Artesanía: 2, Comercio: 1 }, money: 900,
    inv: [['Ropa sencilla', 1], ['Herramientas de oficio', 1], ['Materiales', 5], ['Pan', 2], ['Bolsa', 1]], eco: [['Trabajo del oficio', 110], ['Comida', -25], ['Alquiler de taller', -30]] },
  { id: 'soldado', name: 'Soldado', desc: 'Entrenado para pelear.', attrs: A(13, 12, 13, 9, 10, 9), skills: { Combate: 2, Disciplina: 1 }, money: 400,
    inv: [['Uniforme / armadura ligera', 1], ['Arma básica', 1], ['Ración', 3], ['Manta', 1]], eco: [['Soldada', 70], ['Comida y equipo', -25]] },
  { id: 'mercader', name: 'Mercader', desc: 'Labia y olfato para el negocio.', attrs: A(9, 10, 10, 12, 11, 13), skills: { Comercio: 2, Persuasión: 1 }, money: 25000,
    inv: [['Ropa de calidad', 1], ['Mercancías variadas', 10], ['Libro de cuentas', 1], ['Balanza', 1]], eco: [['Beneficio del comercio', 500], ['Vivienda y almacén', -150], ['Comida', -40]] },
  { id: 'erudito', name: 'Erudito', desc: 'Libros, ideas y poca fuerza.', attrs: A(8, 9, 10, 14, 12, 10), skills: { Conocimiento: 2, Medicina: 1 }, money: 3000,
    inv: [['Ropa sobria', 1], ['Libros', 3], ['Útiles de escritura', 1], ['Pan', 2]], eco: [['Clases y encargos', 150], ['Comida', -30], ['Alquiler', -40]] },
  { id: 'noble', name: 'Hijo de familia acomodada', desc: 'Dinero y contactos, pero expectativas.', attrs: A(9, 10, 9, 11, 10, 13), skills: { Etiqueta: 2, Persuasión: 1 }, money: 1500000,
    inv: [['Ropa fina', 3], ['Joyas', 2], ['Arma de calidad', 1], ['Caballo', 1]], eco: [['Rentas familiares', 8000], ['Servicio y casa', -3000], ['Vida social', -1500]] },
  { id: 'libre', name: 'Personaje libre (lo describo yo)', desc: 'Describe quién eres; la IA ajusta inventario y economía.', attrs: A(10, 10, 10, 10, 10, 10), skills: {}, money: 100,
    inv: [['Ropa', 1]], eco: [['Comida', -15]], free: true },
];
export const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, Math.round(Number(v) || 0)));
const d = (o) => JSON.parse(JSON.stringify(o));

// --- Moneda ---
export function fmtMoney(c) {
  c = Math.round(Number(c) || 0);
  const neg = c < 0; c = Math.abs(c);
  const o = Math.floor(c / 1e6), p = Math.floor(c / 1000) % 1000, k = c % 1000;
  const parts = [];
  if (o) parts.push(o + ' oro' + (o > 1 ? 's' : ''));
  if (p) parts.push(p + ' plata' + (p > 1 ? 's' : ''));
  if (k || !parts.length) parts.push(k + ' cobre' + (k !== 1 ? 's' : ''));
  return (neg ? '−' : '') + parts.join(', ');
}
export const yearText = (y) => (y < 0 ? `${-y} a.C.` : `${y} d.C.`);
const addYears = (y, n) => { let r = y + n; if (y < 0 && r >= 0) r += 1; if (y > 0 && r <= 0) r -= 1; return r; };

// --- Ranking ---
const SURNAMES = ['Montcada', 'Cardona', 'Medici', 'Fugger', 'Borgia', 'Osorio', 'Mendoza', 'Requesens', 'Despuig', 'Centelles', 'Guzmán', 'Pimentel', 'Velasco', 'Sforza', 'Doria', 'Spinola', 'Grimaldi', 'Welser', 'Rothschild', 'Fontcuberta', 'Rocabertí', 'Pinós', 'Erill', 'Castro', 'Lara', 'Haro', 'Zúñiga', 'Ponce', 'Enríquez', 'Manrique'];
export function rankWealth(i) { return Math.round(2000 * 1e6 * Math.pow(5 / 2000, (i - 1) / 99)); } // #1 = 2000 oros, #100 = 5 oros
export function buildRanking(richest, surnames) {
  const top = (richest || []).filter((r) => r && r.name).slice(0, 15);
  const sn = (surnames && surnames.length ? surnames : SURNAMES).filter(Boolean);
  const out = [];
  for (let i = 1; i <= 100; i++) {
    const t = top[i - 1];
    const jitter = 1 + (((i * 7919) % 13) - 6) / 100;
    out.push({ name: t ? t.name : `${i % 3 === 0 ? 'Casa' : 'Familia'} ${sn[(i * 31) % sn.length]}`, title: t ? t.title || '' : '', wealth: Math.round(rankWealth(i) * jitter) });
  }
  out.sort((a, b) => b.wealth - a.wealth);
  return out;
}
export function playerRank(g) {
  const list = g.ranking || [];
  const w = g.wealth.amount + (g.properties || []).reduce((s, p) => s + (Number(p.value) || 0), 0);
  const pos = list.filter((r) => r.wealth > w).length + 1;
  return { pos, worth: w, inTop: pos <= 100, need: list.length ? list[list.length - 1].wealth - w : 0 };
}

// --- Partida nueva ---
export function newGame(f) {
  const ar = ARCHETYPES.find((x) => x.id === f.archetype) || ARCHETYPES[0];
  const age = clamp(f.age || 25, 8, 90);
  const skills = {};
  Object.entries(ar.skills).forEach(([k, v]) => (skills[k] = { lvl: v, xp: 0 }));
  const year = (Math.abs(Number(f.year)) || 1) * (f.era === 'ac' ? -1 : 1);
  const eraObj = ERAS.find((e) => e.id === f.stage);
  return {
    v: 3, title: f.title || f.name || 'Partida', name: f.name || 'Sin nombre', lang: f.lang, model: f.model,
    diff: f.diff, scale: f.scale, worldType: f.worldType, stage: f.worldType === 'historico' && eraObj ? eraObj.n : '',
    region: f.region, backstory: f.backstory || '', freeform: f.freeform || '', archetype: ar.id, archetypeName: ar.name, free: !!ar.free,
    birthYear: addYears(year, -age), clock: { year, month: 1, day: 1, moment: 1 },
    attrs: d(ar.attrs), physical: { health: 100, hunger: ar.hunger ?? 10, fatigue: ar.fatigue ?? 5 },
    skills, wealth: { amount: ar.money },
    inventory: ar.inv.map(([name, qty]) => ({ name, qty, note: '' })),
    properties: [],
    economy: ar.eco.map(([concept, v]) => ({ type: v >= 0 ? 'income' : 'expense', concept, perDay: Math.abs(v) })),
    npcs: [], zones: [], factions: [], worldEvents: [], location: f.region, ranking: buildRanking(),
    summary: '', diary: [], log: [], turns: 0, dead: false, deathMessage: '', actions: [], lineage: [],
  };
}
export const ageOf = (g) => g.clock.year - g.birthYear - (g.birthYear < 0 && g.clock.year > 0 ? 1 : 0);
export function clockText(g) {
  const c = g.clock;
  return `${yearText(c.year)}, mes ${c.month}, día ${c.day} · ${MOMENTS[c.moment]}`;
}
export function advanceClock(g, scale) {
  const c = g.clock;
  if (scale === 'momento') { c.moment++; if (c.moment > 5) { c.moment = 0; c.day++; } }
  else if (scale === 'dia') c.day++;
  else if (scale === 'semana') c.day += 7;
  else if (scale === 'mes') c.month++;
  else if (scale === 'trimestre') c.month += 3;
  while (c.day > 30) { c.day -= 30; c.month++; }
  while (c.month > 12) { c.month -= 12; c.year = addYears(c.year, 1); }
}
export function driftNeeds(g, scale) {
  const df = DIFF[g.diff], f = SCALES[scale].factor, p = g.physical;
  p.hunger = clamp(p.hunger + (df.hunger * f) / 10);
  p.fatigue = clamp(p.fatigue + (df.fat * f) / 10);
  if (p.hunger > 80) p.health = clamp(p.health - Math.ceil((p.hunger - 80) / 4));
  if (p.fatigue > 90) p.health = clamp(p.health - 2);
  if (p.health <= 0) { g.dead = true; g.deathMessage = g.deathMessage || 'Tu cuerpo no resistió más.'; }
}
// --- Economía ---
export function economyRows(g) {
  const inc = [], exp = [];
  (g.economy || []).forEach((e) => (e.type === 'income' ? inc : exp).push({ concept: e.concept, perDay: Number(e.perDay) || 0 }));
  (g.properties || []).forEach((p) => {
    if (Number(p.incomePerDay)) inc.push({ concept: 'Propiedad: ' + p.name, perDay: Number(p.incomePerDay) });
    if (Number(p.upkeepPerDay)) exp.push({ concept: 'Mantenimiento: ' + p.name, perDay: Number(p.upkeepPerDay) });
  });
  const ti = inc.reduce((s, x) => s + x.perDay, 0), te = exp.reduce((s, x) => s + x.perDay, 0);
  return { inc, exp, ti, te, net: ti - te };
}
export function applyEconomy(g, scale) {
  const { net } = economyRows(g);
  const delta = Math.round(net * SCALES[scale].days);
  const before = g.wealth.amount;
  g.wealth.amount = Math.max(0, before + delta);
  if (before + delta < 0) { g.physical.hunger = clamp(g.physical.hunger + 15); return `No llegas a cubrir gastos (faltan ${fmtMoney(-(before + delta))}).`; }
  return delta ? `Balance del periodo: ${delta > 0 ? '+' : ''}${fmtMoney(delta)}` : null;
}

export function rollCheck(g, act) {
  const attr = ATTRS[act.attr] ? act.attr : 'des';
  const sk = (g.skills[act.skill] || {}).lvl || 0;
  const mod = Math.floor((g.attrs[attr] - 10) / 2);
  const age = ageOf(g);
  const agePen = age > 55 ? Math.floor((age - 55) / 10) + 1 : age < 14 ? 2 : 0;
  const p = g.physical;
  const hp = p.health < 30 ? 3 : p.health < 60 ? 1 : 0;
  const fp = p.fatigue > 70 ? 2 : p.fatigue > 40 ? 1 : 0;
  const hu = p.hunger > 70 ? 2 : p.hunger > 40 ? 1 : 0;
  const dm = DIFF[g.diff].mod;
  const bonus = mod + Math.min(4, sk) - agePen - hp - fp - hu + dm;
  const dc = DCS[act.risk] || 10;
  const d20 = 1 + Math.floor(Math.random() * 20);
  const total = d20 + bonus;
  const crit = d20 === 20, fumble = d20 === 1;
  const success = crit || (!fumble && total >= dc);
  const parts = `${ATTRS[attr]} ${mod >= 0 ? '+' : ''}${mod}` + (sk ? `, ${act.skill} +${Math.min(4, sk)}` : '') +
    (agePen ? `, edad −${agePen}` : '') + (hp ? `, salud −${hp}` : '') + (fp ? `, cansancio −${fp}` : '') +
    (hu ? `, hambre −${hu}` : '') + (dm ? `, dificultad ${dm > 0 ? '+' : ''}${dm}` : '');
  return { d20, bonus, total, dc, success, crit, fumble, parts, text: act.text };
}
const GUESS = [
  [/pele|golpe|atac|luch|empuj|carg|levant|derrib/i, 'fue', 'Combate'],
  [/rob|escond|escap|huir|corr|trep|sigil|esquiv/i, 'des', 'Sigilo'],
  [/vend|compr|negoci|regate|comerci|precio/i, 'car', 'Comercio'],
  [/convenc|habl|persuad|pedir|mendig|seduc|amenaz|mentir|engañ/i, 'car', 'Persuasión'],
  [/estudi|leer|investig|calcul|escrib|aprend/i, 'int', 'Conocimiento'],
  [/cur|sanar|vend[ae]r herida|medic/i, 'int', 'Medicina'],
  [/mir[ao]|observ|escuch|vigil|busc|rastre|rez/i, 'sab', 'Percepción'],
  [/trabaj|aguant|resist|cultiv|carg/i, 'con', 'Trabajo'],
];
export function guessCheck(text, g) {
  for (const [re, attr, skill] of GUESS) if (re.test(text)) {
    const own = Object.keys(g.skills).find((k) => k.toLowerCase() === skill.toLowerCase());
    return { text, attr, skill: own || skill, risk: 'medio' };
  }
  return { text, attr: 'des', risk: 'medio' };
}
export function addXp(g, name) {
  if (!name) return null;
  const s = g.skills[name] || (g.skills[name] = { lvl: 0, xp: 0 });
  s.xp++;
  if (s.lvl < 10 && s.xp >= s.lvl * 2 + 3) { s.lvl++; s.xp = 0; return `${name} sube a nivel ${s.lvl}`; }
  return null;
}
const find = (arr, name) => arr.find((x) => String(x.name || x.concept).toLowerCase() === String(name).toLowerCase());
export function applyChanges(g, r) {
  const c = r.changes || {};
  const p = c.physical || {};
  ['health', 'hunger', 'fatigue'].forEach((k) => { if (typeof p[k] === 'number') g.physical[k] = clamp(g.physical[k] + p[k]); });
  if (typeof c.wealthDelta === 'number') g.wealth.amount = Math.max(0, Math.round(g.wealth.amount + c.wealthDelta));
  (c.inventoryAdd || []).forEach((i) => {
    if (!i || !i.name) return;
    const e = find(g.inventory, i.name);
    if (e) e.qty += Number(i.qty) || 1; else g.inventory.push({ name: i.name, qty: Number(i.qty) || 1, note: i.note || '' });
  });
  (c.inventoryConsume || []).forEach((i) => {
    const e = i && i.name && find(g.inventory, i.name);
    if (e) { e.qty -= Number(i.qty) || 1; if (e.qty <= 0) g.inventory = g.inventory.filter((x) => x !== e); }
  });
  g.properties = g.properties || [];
  (c.propertiesAdd || []).forEach((q) => {
    if (!q || !q.name) return;
    const e = find(g.properties, q.name);
    const v = { name: q.name, value: Number(q.value) || 0, incomePerDay: Number(q.incomePerDay) || 0, upkeepPerDay: Number(q.upkeepPerDay) || 0, note: q.note || '' };
    if (e) Object.assign(e, v); else g.properties.push(v);
  });
  (c.propertiesRemove || []).forEach((n) => { if (n) g.properties = g.properties.filter((x) => String(x.name).toLowerCase() !== String(n).toLowerCase()); });
  g.economy = g.economy || [];
  (c.economyUpdates || []).forEach((u) => {
    if (!u || !u.concept) return;
    const e = g.economy.find((x) => x.concept.toLowerCase() === String(u.concept).toLowerCase());
    const v = Math.abs(Number(u.perDay) || 0);
    if (!v) { g.economy = g.economy.filter((x) => x !== e); return; }
    const type = u.type === 'income' ? 'income' : 'expense';
    if (e) Object.assign(e, { type, perDay: v }); else g.economy.push({ type, concept: u.concept, perDay: v });
  });
  (c.npcUpdates || []).forEach((n) => {
    if (!n || !n.name) return;
    const e = find(g.npcs, n.name);
    if (e) Object.assign(e, { role: n.role || e.role, attitude: n.attitude || e.attitude, notes: n.notes || e.notes });
    else g.npcs.push({ name: n.name, role: n.role || '', attitude: n.attitude || '', notes: n.notes || '' });
  });
  (c.zonesAdd || []).forEach((z) => { if (z && z.name && !find(g.zones, z.name)) g.zones.push({ name: z.name, desc: z.desc || '' }); });
  (c.factionChanges || []).forEach((f) => {
    if (!f || !f.name) return;
    const e = find(g.factions, f.name);
    if (e) { e.rep = clamp(e.rep + (Number(f.delta) || 0), -100, 100); if (f.desc) e.desc = f.desc; }
    else g.factions.push({ name: f.name, rep: clamp(Number(f.delta) || 0, -100, 100), desc: f.desc || '' });
  });
  (c.newSkills || []).forEach((s) => { if (s && !g.skills[s]) g.skills[s] = { lvl: 1, xp: 0 }; });
  (c.worldEvents || []).forEach((w) => w && g.worldEvents.push(w));
  g.worldEvents = g.worldEvents.slice(-20);
  if (r.richest || r.surnames) g.ranking = buildRanking(r.richest, r.surnames);
  if (r.keyEvent) g.diary.push(`${clockText(g)}: ${r.keyEvent}`);
  if (r.currentLocation) g.location = r.currentLocation;
  if (r.isDead) { g.dead = true; g.deathMessage = r.deathMessage || ''; }
}

const L = { es: 'castellano', ca: 'català' };
export function buildSystem(g) {
  const where = g.worldType === 'historico' ? `Etapa histórica: ${g.stage}. Lugar: ${g.region}. Año: ${yearText(g.clock.year)}.` : `Mundo: ${WORLDS[g.worldType]}. Región: ${g.region}.`;
  return `Eres el narrador/máster de un RPG persistente y REALISTA. Idioma de toda la respuesta: ${L[g.lang] || 'castellano'}.
${where} Dificultad: ${DIFF[g.diff].label}.
REGLAS:
- Narración BREVE: máximo 70 palabras. Directa, sin relleno. Resultados realistas: nada de golpes de suerte imposibles; la sociedad, los precios, la ley y la gente reaccionan como lo harían de verdad en esa época y lugar.
- Coherencia total con el ESTADO (inventario, dinero, propiedades, economía, salud, hambre, cansancio, edad, habilidades, PNJ, facciones, memoria). Nunca uses objetos o dinero que no tiene.
- Respeta el RESULTADO DE LA TIRADA: si falla, algo sale mal; si es crítico, algo extra bueno.
- MONEDA ÚNICA en cobres: 1 plata = 1000 cobres; 1 oro = 1000 platas. Los más pobres viven con unos pocos cobres; la clase media llega a tener algunas platas; los ricos acumulan algunos oros; reyes y grandes familias cientos o miles de oros. Guía orientativa: pan 2 cobres, comida diaria humilde 10-15 cobres, jornal de peón 30-60 cobres/día, artesano 80-150 cobres/día, caballo 10-30 platas, casa modesta 50-200 platas. Ajusta a la época.
- Si hay comercio, da números explícitos (precio ofrecido, lo que ganas o pierdes) y una mini tabla con "|" si ayuda.
- "changes" usa DELTAS: physical en puntos; wealthDelta = gasto o ingreso PUNTUAL en cobres (negativo si pagas). Lo RECURRENTE (salario, alquiler, comida diaria, rentas) va en economyUpdates con perDay en cobres/día (perDay 0 = eliminar concepto); el juego lo cobra/paga solo cada turno, no lo dupliques en wealthDelta.
- Propiedades (casas, tierras, talleres, barcos, negocios, animales de valor): propertiesAdd con value, incomePerDay y upkeepPerDay en cobres; propertiesRemove con nombres al venderlas o perderlas.
- Inventario: inventoryAdd al conseguir objetos; inventoryConsume al comer, gastar, vender o romper.
- PNJ: añade SIEMPRE en npcUpdates a toda persona con nombre o relevante que aparezca, con papel y actitud hacia el jugador.
- Facciones: las propias del contexto (época, lugar, clase social). factionChanges con delta de reputación y desc breve.
- Zonas nuevas visitadas en zonesAdd. Historias pasadas y trasfondo condicionan la trama. La muerte es posible: isDead true solo si es coherente.
- Ofrece 4 acciones sugeridas distintas y realistas; cada una con attr (fue|des|con|int|sab|car), skill (habilidad principal) y risk (bajo|medio|alto|extremo).
RESPONDE SOLO CON JSON: {"narrative":"","suggestedActions":[{"text":"","attr":"des","skill":"","risk":"medio"}],"currentLocation":"","changes":{"physical":{"health":0,"hunger":0,"fatigue":0},"wealthDelta":0,"inventoryAdd":[{"name":"","qty":1,"note":""}],"inventoryConsume":[{"name":"","qty":1}],"propertiesAdd":[{"name":"","value":0,"incomePerDay":0,"upkeepPerDay":0,"note":""}],"propertiesRemove":[""],"economyUpdates":[{"type":"income|expense","concept":"","perDay":0}],"npcUpdates":[{"name":"","role":"","attitude":"","notes":""}],"zonesAdd":[{"name":"","desc":""}],"factionChanges":[{"name":"","delta":0,"desc":""}],"worldEvents":[""],"newSkills":[""]},"keyEvent":"","isDead":false,"deathMessage":""}`;
}
export function buildState(g) {
  const eco = economyRows(g);
  return `PERSONAJE: ${g.name}, ${ageOf(g)} años, ${g.archetypeName || ''}. ${g.backstory ? 'Trasfondo: ' + g.backstory : ''} ${g.freeform ? 'Descripción: ' + g.freeform : ''}
FECHA: ${clockText(g)}. LUGAR: ${g.location}. Este turno avanza: ${SCALES[g.scale].label}.
FÍSICO: salud ${g.physical.health}/100, hambre ${g.physical.hunger}/100, cansancio ${g.physical.fatigue}/100.
ATRIBUTOS: ${Object.entries(g.attrs).map(([k, v]) => k + ' ' + v).join(', ')}.
HABILIDADES: ${Object.entries(g.skills).map(([k, v]) => k + ' ' + v.lvl).join(', ') || 'ninguna'}.
DINERO: ${g.wealth.amount} cobres (${fmtMoney(g.wealth.amount)}).
PROPIEDADES: ${(g.properties || []).map((p) => `${p.name} (valor ${p.value} c, +${p.incomePerDay}/día, −${p.upkeepPerDay}/día)`).join('; ') || 'ninguna'}.
ECONOMÍA DIARIA: ingresos ${eco.inc.map((x) => x.concept + ' ' + x.perDay).join(', ') || '-'}; gastos ${eco.exp.map((x) => x.concept + ' ' + x.perDay).join(', ') || '-'}; neto ${eco.net} c/día.
INVENTARIO: ${g.inventory.map((i) => i.qty + 'x ' + i.name).join(', ') || 'vacío'}.
PNJ: ${g.npcs.map((n) => `${n.name} (${n.role}, ${n.attitude})`).join('; ') || 'ninguno'}.
FACCIONES: ${g.factions.map((f) => f.name + ' ' + f.rep).join('; ') || 'ninguna'}.
ZONAS: ${g.zones.map((z) => z.name).join(', ') || 'ninguna'}.
MUNDO: ${g.worldEvents.slice(-5).join('; ') || '-'}.
RESUMEN ACUMULADO: ${g.summary || '(aún no hay)'}
DIARIO: ${g.diary.slice(-8).join(' | ') || '-'}
ÚLTIMAS ACCIONES: ${g.log.slice(-10).map((l) => `[${l.action}] → ${l.narr}`).join('\n') || '-'}`;
}
export function buildUser(g, act, roll) {
  if (act.start) return `${buildState(g)}

INICIO DE LA AVENTURA: presenta la escena inicial coherente con el personaje, su clase y su situación económica.
Además, en este primer turno:
- Ajusta inventario y economyUpdates a lo típico de su clase en esta época y lugar (sin exagerar).
- Crea entre 3 y 6 facciones reales o verosímiles de este contexto con factionChanges (delta inicial según su clase) y desc.
- Añade "richest": las 12 personas o familias más ricas del contexto (reyes, nobles, banqueros…) como [{"name":"","title":""}] ordenadas de más a menos rica, y "surnames": 30 apellidos o nombres de casas típicos del lugar y época.${g.free ? '\n- El personaje es libre: adapta inventario y economía a su descripción.' : ''}`;
  return `${buildState(g)}

ACCIÓN DEL JUGADOR: "${act.text}"
TIRADA: d20=${roll.d20}, bonus ${roll.bonus}, total ${roll.total} vs DC ${roll.dc} → ${roll.crit ? 'CRÍTICO' : roll.fumble ? 'PIFIA' : roll.success ? 'ÉXITO' : 'FALLO'}.
El tiempo avanza: ${SCALES[g.scale].label}.`;
}
export function buildHeir(g, name, relation) {
  const h = d(g);
  const age = relation === 'ahijado' ? 17 : 18;
  h.name = name; h.dead = false; h.deathMessage = ''; h.turns = 0;
  h.lineage = [...(g.lineage || []), { name: g.name, died: g.clock.year }];
  h.birthYear = addYears(g.clock.year, -age); h.clock.moment = 1;
  h.physical = { health: 100, hunger: 20, fatigue: 10 };
  h.backstory = `${relation === 'hijo' ? 'Hijo/a' : 'Ahijado/a'} de ${g.name} (fallecido). ${g.backstory}`;
  h.wealth.amount = Math.floor(g.wealth.amount * 0.7);
  h.inventory = g.inventory.slice(0, 5);
  h.properties = (g.properties || []).slice();
  h.skills = {}; Object.entries(g.skills).forEach(([k, v]) => { if (v.lvl > 1) h.skills[k] = { lvl: Math.floor(v.lvl / 2), xp: 0 }; });
  h.factions = g.factions.map((f) => ({ ...f, rep: Math.round(f.rep / 2) }));
  h.log = []; h.actions = [];
  h.summary = `${g.summary}\nMuere ${g.name}: ${g.deathMessage}. Continúa su ${relation}, ${name}.`;
  h.diary = [...g.diary, `${clockText(g)}: Muere ${g.name}.`];
  return h;
}
