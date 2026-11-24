// Lógica pura del juego: constantes, tiradas, reloj, estado, prompts
export const DIFF = {
  facil: { label: 'Fácil', mod: 3, hunger: 5, fat: 8 },
  medio: { label: 'Medio', mod: 0, hunger: 10, fat: 12 },
  dificil: { label: 'Difícil', mod: -3, hunger: 18, fat: 20 },
  leyenda: { label: 'Leyenda', mod: -5, hunger: 25, fat: 28 },
};
export const MOMENTS = ['madrugada', 'mañana', 'mediodía', 'tarde', 'anochecer', 'noche'];
export const SCALES = {
  momento: { label: 'Momento del día', factor: 1 },
  dia: { label: 'Día', factor: 4 },
  semana: { label: 'Semana', factor: 10 },
  mes: { label: 'Mes', factor: 20 },
  año: { label: 'Año', factor: 40 },
};
export const ATTRS = { fue: 'Fuerza', des: 'Destreza', con: 'Constitución', int: 'Inteligencia', sab: 'Sabiduría', car: 'Carisma' };
export const DCS = { bajo: 8, medio: 10, alto: 13, extremo: 15 };
export const MODELS = [
  { id: 'claude-haiku', label: 'Claude Haiku (barato)' },
  { id: 'gpt-4o', label: 'GPT-4o (mejor)' },
  { id: 'gpt-4o-mini', label: 'GPT-4o mini (barato)' },
];
export const WORLDS = {
  realista: 'Realista (historia real)',
  pasado: 'Pasado histórico',
  fantasia: 'Fantasía',
  futurista: 'Futurista / ciencia ficción',
};
export const REGIONS = [
  { n: 'España, 2024', y: 2024, c: '€' },
  { n: 'España, Guerra Civil (1937)', y: 1937, c: 'pesetas' },
  { n: 'Barcelona, 1714', y: 1714, c: 'reales' },
  { n: 'Cataluña, Edad Media (1200)', y: 1200, c: 'sueldos' },
  { n: 'Roma imperial (117 d.C.)', y: 117, c: 'denarios' },
  { n: 'Londres victoriano (1860)', y: 1860, c: 'libras' },
  { n: 'Nueva York (1929)', y: 1929, c: 'dólares' },
  { n: 'Japón Edo (1700)', y: 1700, c: 'mon' },
  { n: 'Caribe, era de la piratería (1715)', y: 1715, c: 'reales de a ocho' },
];
const A = (fue, des, con, int, sab, car) => ({ fue, des, con, int, sab, car });
export const ARCHETYPES = [
  { id: 'nada', name: 'Sin nada (muy pobre)', desc: 'Empiezas de cero: sin dinero, sin objetos, con hambre.', attrs: A(10, 10, 10, 10, 10, 10), skills: { Supervivencia: 1 }, money: 0, inv: [], hunger: 45, fatigue: 30 },
  { id: 'campesino', name: 'Campesino', desc: 'Curtido, trabajador, poco dinero.', attrs: A(12, 10, 13, 9, 11, 9), skills: { Agricultura: 2, Supervivencia: 1 }, money: 15, inv: [['Azada', 1], ['Pan', 2]] },
  { id: 'artesano', name: 'Artesano', desc: 'Manos hábiles y un oficio.', attrs: A(10, 13, 11, 11, 10, 10), skills: { Artesanía: 2, Comercio: 1 }, money: 40, inv: [['Herramientas de oficio', 1]] },
  { id: 'soldado', name: 'Soldado', desc: 'Entrenado para pelear.', attrs: A(13, 12, 13, 9, 10, 9), skills: { Combate: 2, Disciplina: 1 }, money: 25, inv: [['Arma básica', 1], ['Ración', 3]] },
  { id: 'mercader', name: 'Mercader', desc: 'Labia y olfato para el negocio.', attrs: A(9, 10, 10, 12, 11, 13), skills: { Comercio: 2, Persuasión: 1 }, money: 120, inv: [['Mercancías variadas', 1]] },
  { id: 'erudito', name: 'Erudito', desc: 'Libros, ideas y poca fuerza.', attrs: A(8, 9, 10, 14, 12, 10), skills: { Conocimiento: 2, Medicina: 1 }, money: 60, inv: [['Libro', 2]] },
  { id: 'noble', name: 'Hijo de familia acomodada', desc: 'Dinero y contactos, pero expectativas.', attrs: A(9, 10, 9, 11, 10, 13), skills: { Etiqueta: 2, Persuasión: 1 }, money: 400, inv: [['Ropa fina', 1]] },
  { id: 'libre', name: 'Personaje libre (lo describo yo)', desc: 'Describe quién eres y la IA lo traduce a estadísticas.', attrs: A(10, 10, 10, 10, 10, 10), skills: {}, money: 20, inv: [], free: true },
];
export const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, Math.round(Number(v) || 0)));
const d = (o) => JSON.parse(JSON.stringify(o));

export function newGame(f) {
  const ar = ARCHETYPES.find((x) => x.id === f.archetype) || ARCHETYPES[0];
  const age = clamp(f.age || 25, 8, 90);
  const skills = {};
  Object.entries(ar.skills).forEach(([k, v]) => (skills[k] = { lvl: v, xp: 0 }));
  return {
    v: 2, title: f.title || f.name || 'Partida', name: f.name || 'Sin nombre', lang: f.lang, model: f.model,
    diff: f.diff, scale: f.scale, worldType: f.worldType, region: f.region, backstory: f.backstory || '',
    freeform: f.freeform || '', archetype: ar.id, free: !!ar.free,
    birthYear: Number(f.year) - age, clock: { year: Number(f.year), month: 1, day: 1, moment: 1 },
    attrs: d(ar.attrs), physical: { health: 100, hunger: ar.hunger ?? 10, fatigue: ar.fatigue ?? 5 },
    skills, wealth: { amount: ar.money, currency: f.currency || '€' },
    inventory: ar.inv.map(([name, qty]) => ({ name, qty, note: '' })),
    npcs: [], zones: [], factions: [], worldEvents: [], location: f.region,
    summary: '', diary: [], log: [], turns: 0, dead: false, deathMessage: '', actions: [], lineage: [],
  };
}
export const ageOf = (g) => g.clock.year - g.birthYear;
export function clockText(g) {
  const c = g.clock;
  return `Año ${c.year}, mes ${c.month}, día ${c.day} · ${MOMENTS[c.moment]}`;
}
export function advanceClock(g, scale) {
  const c = g.clock;
  if (scale === 'momento') { c.moment++; if (c.moment > 5) { c.moment = 0; c.day++; } }
  else if (scale === 'dia') c.day++;
  else if (scale === 'semana') c.day += 7;
  else if (scale === 'mes') c.month++;
  else if (scale === 'año') c.year++;
  while (c.day > 30) { c.day -= 30; c.month++; }
  while (c.month > 12) { c.month -= 12; c.year++; }
}
export function driftNeeds(g, scale) {
  const df = DIFF[g.diff], f = SCALES[scale].factor, p = g.physical;
  p.hunger = clamp(p.hunger + (df.hunger * f) / 10);
  p.fatigue = clamp(p.fatigue + (df.fat * f) / 10);
  if (p.hunger > 80) p.health = clamp(p.health - Math.ceil(((p.hunger - 80) / 4) * Math.max(1, f / 4)));
  if (p.fatigue > 90) p.health = clamp(p.health - 2 * Math.max(1, f / 4));
  if (p.health <= 0) { g.dead = true; g.deathMessage = g.deathMessage || 'Tu cuerpo no resistió más.'; }
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
export function addXp(g, name) {
  if (!name) return null;
  const s = g.skills[name] || (g.skills[name] = { lvl: 0, xp: 0 });
  s.xp++;
  if (s.lvl < 10 && s.xp >= s.lvl * 2 + 3) { s.lvl++; s.xp = 0; return `${name} sube a nivel ${s.lvl}`; }
  return null;
}
const find = (arr, name) => arr.find((x) => String(x.name).toLowerCase() === String(name).toLowerCase());
export function applyChanges(g, r) {
  const c = r.changes || {};
  const p = c.physical || {};
  ['health', 'hunger', 'fatigue'].forEach((k) => { if (typeof p[k] === 'number') g.physical[k] = clamp(g.physical[k] + p[k]); });
  if (typeof c.wealthDelta === 'number') g.wealth.amount = Math.max(0, Math.round((g.wealth.amount + c.wealthDelta) * 100) / 100);
  (c.inventoryAdd || []).forEach((i) => {
    if (!i || !i.name) return;
    const e = find(g.inventory, i.name);
    if (e) e.qty += Number(i.qty) || 1; else g.inventory.push({ name: i.name, qty: Number(i.qty) || 1, note: i.note || '' });
  });
  (c.inventoryConsume || []).forEach((i) => {
    const e = i && find(g.inventory, i.name);
    if (e) { e.qty -= Number(i.qty) || 1; if (e.qty <= 0) g.inventory = g.inventory.filter((x) => x !== e); }
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
    if (e) e.rep = clamp(e.rep + (Number(f.delta) || 0), -100, 100); else g.factions.push({ name: f.name, rep: clamp(Number(f.delta) || 0, -100, 100) });
  });
  (c.newSkills || []).forEach((s) => { if (s && !g.skills[s]) g.skills[s] = { lvl: 1, xp: 0 }; });
  (c.worldEvents || []).forEach((w) => w && g.worldEvents.push(w));
  g.worldEvents = g.worldEvents.slice(-20);
  if (r.keyEvent) g.diary.push(`${clockText(g)}: ${r.keyEvent}`);
  if (r.currentLocation) g.location = r.currentLocation;
  if (r.isDead) { g.dead = true; g.deathMessage = r.deathMessage || ''; }
}

const L = { es: 'castellano', ca: 'català' };
export function buildSystem(g) {
  return `Eres el narrador/máster de un RPG persistente. Idioma de toda la respuesta: ${L[g.lang] || 'castellano'}.
Mundo: ${WORLDS[g.worldType]}. Región/época: ${g.region}. Dificultad: ${DIFF[g.diff].label}.
REGLAS:
- Narración BREVE: máximo 70 palabras. Directa, sin relleno.
- Sé coherente con el ESTADO (inventario, dinero, salud, hambre, cansancio, edad, habilidades, PNJ, facciones, memoria). Nunca uses objetos que no tiene. Las condiciones físicas deben notarse en la narración.
- Respeta el RESULTADO DE LA TIRADA: si falla, algo sale mal; si es crítico, algo extra bueno.
- Contexto socioeconómico y político realista de la época y lugar (si es real). En fantasía/futurista, escala dureza y peligro según la dificultad.
- Si hay comercio, da números explícitos (precio ofrecido, cuánto ganas/pierdes, cambio) y una mini tabla con "|" si ayuda.
- Refleja los cambios en "changes" con valores DELTA (health/hunger/fatigue en puntos, wealthDelta en moneda). Comer baja hambre (hunger negativo) y consume el objeto; descansar baja fatiga. Usa inventoryConsume al gastar/vender/romper.
- Facciones: factionChanges con delta de reputación cuando corresponda. Zonas nuevas visitadas en zonesAdd.
- Historias pasadas y trasfondo condicionan la trama (consecuencias reales). La muerte es posible: isDead true solo si es coherente.
- Ofrece 4 acciones sugeridas distintas; cada una con attr (fue|des|con|int|sab|car), skill (habilidad principal, en español/idioma) y risk (bajo|medio|alto|extremo).
RESPONDE SOLO CON JSON: {"narrative":"","suggestedActions":[{"text":"","attr":"des","skill":"","risk":"medio"}],"currentLocation":"","changes":{"physical":{"health":0,"hunger":0,"fatigue":0},"wealthDelta":0,"inventoryAdd":[{"name":"","qty":1,"note":""}],"inventoryConsume":[{"name":"","qty":1}],"npcUpdates":[{"name":"","role":"","attitude":"","notes":""}],"zonesAdd":[{"name":"","desc":""}],"factionChanges":[{"name":"","delta":0}],"worldEvents":[""],"newSkills":[""]},"keyEvent":"","isDead":false,"deathMessage":""}`;
}
export function buildState(g) {
  return `PERSONAJE: ${g.name}, ${ageOf(g)} años. ${g.backstory ? 'Trasfondo: ' + g.backstory : ''} ${g.freeform ? 'Descripción: ' + g.freeform : ''}
FECHA: ${clockText(g)}. LUGAR: ${g.location}. Escala de turno: ${SCALES[g.scale].label}.
FÍSICO: salud ${g.physical.health}/100, hambre ${g.physical.hunger}/100, cansancio ${g.physical.fatigue}/100.
ATRIBUTOS: ${Object.entries(g.attrs).map(([k, v]) => k + ' ' + v).join(', ')}.
HABILIDADES: ${Object.entries(g.skills).map(([k, v]) => k + ' ' + v.lvl).join(', ') || 'ninguna'}.
DINERO: ${g.wealth.amount} ${g.wealth.currency}.
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
  if (act.start) return `${buildState(g)}\n\nINICIO DE LA AVENTURA: presenta la escena inicial coherente con el personaje y su situación.${g.free ? ' El personaje es libre: ajusta sus atributos razonablemente según la descripción usando changes (no hace falta).' : ''}`;
  return `${buildState(g)}\n\nACCIÓN DEL JUGADOR: "${act.text}"\nTIRADA: d20=${roll.d20}, bonus ${roll.bonus}, total ${roll.total} vs DC ${roll.dc} → ${roll.crit ? 'CRÍTICO' : roll.fumble ? 'PIFIA' : roll.success ? 'ÉXITO' : 'FALLO'}.\nEl tiempo avanza: ${SCALES[g.scale].label}.`;
}
export function buildHeir(g, name, relation) {
  const h = d(g);
  const age = relation === 'ahijado' ? 17 : 18;
  h.name = name; h.dead = false; h.deathMessage = ''; h.turns = 0;
  h.lineage = [...(g.lineage || []), { name: g.name, died: g.clock.year }];
  h.birthYear = g.clock.year - age; h.clock.moment = 1;
  h.physical = { health: 100, hunger: 20, fatigue: 10 };
  h.backstory = `${relation === 'hijo' ? 'Hijo/a' : 'Ahijado/a'} de ${g.name} (fallecido). ${g.backstory}`;
  h.wealth.amount = Math.floor(g.wealth.amount * 0.7);
  h.inventory = g.inventory.slice(0, 5);
  h.skills = {}; Object.entries(g.skills).forEach(([k, v]) => { if (v.lvl > 1) h.skills[k] = { lvl: Math.floor(v.lvl / 2), xp: 0 }; });
  h.factions = g.factions.map((f) => ({ ...f, rep: Math.round(f.rep / 2) }));
  h.log = []; h.actions = [];
  h.summary = `${g.summary}\nMuere ${g.name}: ${g.deathMessage}. Continúa su ${relation}, ${name}.`;
  h.diary = [...g.diary, `${clockText(g)}: Muere ${g.name}.`];
  return h;
}
