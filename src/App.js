import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sb } from './supabase';
import * as E from './engine';

async function callAI(model, system, user, json) {
  const { data } = await sb.auth.getSession();
  const token = data.session && data.session.access_token;
  const r = await fetch('/api/turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ model, system, user, json }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Error');
  return j.text;
}

function Auth() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [mode, setMode] = useState('in');
  const [msg, setMsg] = useState('');
  const go = async () => {
    setMsg('');
    const r = mode === 'in' ? await sb.auth.signInWithPassword({ email, password: pass }) : await sb.auth.signUp({ email, password: pass });
    if (r.error) setMsg(r.error.message);
    else if (mode === 'up' && !r.data.session) setMsg('Cuenta creada. Revisa tu correo para confirmarla y luego entra.');
  };
  const guest = async () => {
    setMsg('');
    const r = await sb.auth.signInAnonymously();
    if (r.error) setMsg(r.error.message);
  };
  return (
    <div className="wrap">
      <h1>⚔️ Motor de Rol</h1>
      <div className="card">
        <label>Correo</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        <label>Contraseña (mínimo 6 caracteres)</label>
        <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" />
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn main" onClick={go}>{mode === 'in' ? 'Entrar' : 'Crear cuenta'}</button>
          <button className="btn" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>{mode === 'in' ? 'No tengo cuenta' : 'Ya tengo cuenta'}</button>
        </div>
        {msg && <p style={{ color: '#ff9aa9' }}>{msg}</p>}
      </div>
      <div className="card">
        <button className="btn main" onClick={guest}>🎲 Jugar sin cuenta</button>
        <p style={{ fontSize: 13, color: '#9aa3b8' }}>Tus partidas se guardan en este navegador. Si cierras sesión o borras los datos del navegador, se pierden.</p>
      </div>
    </div>
  );
}

function Menu({ user, onOpen, onNew }) {
  const [list, setList] = useState(null);
  const load = useCallback(async () => {
    const { data } = await sb.from('campaigns').select('id,title,data,updated_at').order('updated_at', { ascending: false });
    setList(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);
  const del = async (id) => { if (window.confirm('¿Borrar esta partida para siempre?')) { await sb.from('campaigns').delete().eq('id', id); load(); } };
  return (
    <div className="wrap">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>⚔️ Mis partidas</h1>
        <button className="btn small" onClick={() => { if (!user.is_anonymous || window.confirm('Eres invitado: si sales, perderás tus partidas. ¿Salir?')) sb.auth.signOut(); }}>Salir ({user.is_anonymous ? 'invitado' : user.email})</button>
      </div>
      <button className="btn main" onClick={onNew}>＋ Nueva partida</button>
      {list === null && <p>Cargando…</p>}
      {list && list.length === 0 && <p>Aún no tienes partidas.</p>}
      {(list || []).map((c) => (
        <div key={c.id} className="card">
          <b>{c.title}</b> {c.data.dead && <span className="tag">💀 muerto</span>}
          <div style={{ fontSize: 13, color: '#9aa3b8' }}>
            {c.data.name} · {c.data.region} · {c.data.clock && E.clockText(c.data)} · {E.DIFF[c.data.diff]?.label}
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn" onClick={() => onOpen(c)}>Continuar</button>
            <button className="btn danger small" onClick={() => del(c.id)}>Borrar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Create({ onDone, onCancel }) {
  const [f, setF] = useState({
    title: '', name: '', worldType: 'realista', region: E.REGIONS[0].n, year: 2024, currency: '€', age: 25,
    archetype: 'nada', freeform: '', backstory: '', diff: 'medio', scale: 'dia', lang: 'es', model: 'claude-haiku',
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pickRegion = (e) => {
    const r = E.REGIONS.find((x) => x.n === e.target.value);
    setF(r ? { ...f, region: r.n, year: r.y, currency: r.c } : { ...f, region: e.target.value });
  };
  const hist = f.worldType === 'realista' || f.worldType === 'pasado';
  const ar = E.ARCHETYPES.find((a) => a.id === f.archetype);
  return (
    <div className="wrap">
      <h2>Nueva partida</h2>
      <div className="card">
        <label>Nombre de la partida</label><input value={f.title} onChange={set('title')} />
        <label>Nombre del personaje</label><input value={f.name} onChange={set('name')} />
        <label>Edad</label><input type="number" value={f.age} onChange={set('age')} />
        <label>Tipo de mundo</label>
        <select value={f.worldType} onChange={set('worldType')}>{Object.entries(E.WORLDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <label>{hist ? 'País / región / época (elige o escribe)' : 'Describe la región del mundo'}</label>
        {hist ? (
          <>
            <input list="regs" value={f.region} onChange={pickRegion} />
            <datalist id="regs">{E.REGIONS.map((r) => <option key={r.n} value={r.n} />)}</datalist>
          </>
        ) : <input value={f.region} onChange={set('region')} placeholder="p. ej. Reino de Valdoria, frontera norte" />}
        <div className="row">
          <div style={{ flex: 1 }}><label>Año de inicio</label><input type="number" value={f.year} onChange={set('year')} /></div>
          <div style={{ flex: 1 }}><label>Moneda</label><input value={f.currency} onChange={set('currency')} /></div>
        </div>
      </div>
      <div className="card">
        <label>Personaje</label>
        <select value={f.archetype} onChange={set('archetype')}>{E.ARCHETYPES.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        <div style={{ fontSize: 13, color: '#9aa3b8' }}>{ar.desc}</div>
        {ar.free && (<><label>Descríbete (la IA lo tendrá en cuenta)</label><textarea rows={3} value={f.freeform} onChange={set('freeform')} /></>)}
        <label>Trasfondo (tiene consecuencias reales en la historia)</label>
        <textarea rows={3} value={f.backstory} onChange={set('backstory')} placeholder="Familia, deudas, enemigos, secretos…" />
      </div>
      <div className="card">
        <label>Dificultad</label>
        <select value={f.diff} onChange={set('diff')}>{Object.entries(E.DIFF).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
        <label>Cada turno avanza…</label>
        <select value={f.scale} onChange={set('scale')}>{Object.entries(E.SCALES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
        <label>Idioma de la partida</label>
        <select value={f.lang} onChange={set('lang')}><option value="es">Castellano</option><option value="ca">Català</option></select>
        <label>Modelo narrador</label>
        <select value={f.model} onChange={set('model')}>{E.MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select>
      </div>
      <div className="row">
        <button className="btn main" disabled={!f.name} onClick={() => onDone(E.newGame(f))}>Empezar</button>
        <button className="btn" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

function Rows({ items, cols, onChange, blank }) {
  const upd = (i, k, v) => { const n = items.map((x, j) => (j === i ? { ...x, [k]: v } : x)); onChange(n); };
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} className="row" style={{ marginBottom: 6, flexWrap: 'nowrap' }}>
          {cols.map(([k, ph, type]) => (
            <input key={k} placeholder={ph} type={type || 'text'} value={it[k] ?? ''}
              onChange={(e) => upd(i, k, type === 'number' ? Number(e.target.value) : e.target.value)}
              style={{ flex: type === 'number' ? '0 0 70px' : 1, minWidth: 0 }} />
          ))}
          <button className="btn small danger" onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button className="btn small" onClick={() => onChange([...items, { ...blank }])}>＋ Añadir</button>
    </div>
  );
}
const Bar = ({ label, v, color }) => (
  <div style={{ margin: '6px 0' }}>
    <div style={{ fontSize: 13 }}>{label}: {v}/100</div>
    <div className="bar"><div style={{ width: v + '%', background: color }} /></div>
  </div>
);

function Panels({ g, setG, admin }) {
  const [tab, setTab] = useState('estado');
  const [json, setJson] = useState('');
  const tabs = [['estado', 'Estado'], ['inv', 'Inventario'], ['hab', 'Habilidades'], ['pnj', 'PNJ'], ['mapa', 'Mapa'], ['fac', 'Facciones'], ['mem', 'Memoria']];
  if (admin) tabs.push(['admin', 'Admin']);
  const up = (fn) => { const n = JSON.parse(JSON.stringify(g)); fn(n); setG(n); };
  return (
    <div className="card">
      <div className="tabs">{tabs.map(([k, l]) => <button key={k} className={'btn small' + (tab === k ? ' main' : '')} onClick={() => setTab(k)}>{l}</button>)}</div>
      {tab === 'estado' && (
        <div>
          <Bar label="Salud" v={g.physical.health} color="#4cc38a" />
          <Bar label="Hambre" v={g.physical.hunger} color="#e5a03a" />
          <Bar label="Cansancio" v={g.physical.fatigue} color="#6c8cff" />
          <p>💰 <b>{g.wealth.amount} {g.wealth.currency}</b> · Edad {E.ageOf(g)}</p>
          <table><tbody>{Object.entries(g.attrs).map(([k, v]) => (
            <tr key={k}><td>{E.ATTRS[k]}</td><td><input type="number" value={v} style={{ width: 70 }} onChange={(e) => up((n) => (n.attrs[k] = Number(e.target.value)))} /></td></tr>
          ))}</tbody></table>
          <label>Salud / hambre / cansancio (editable)</label>
          <div className="row">{['health', 'hunger', 'fatigue'].map((k) => <input key={k} type="number" style={{ width: 80 }} value={g.physical[k]} onChange={(e) => up((n) => (n.physical[k] = E.clamp(e.target.value)))} />)}</div>
          <label>Dinero</label>
          <div className="row"><input type="number" style={{ width: 120 }} value={g.wealth.amount} onChange={(e) => up((n) => (n.wealth.amount = Number(e.target.value)))} /><input style={{ width: 120 }} value={g.wealth.currency} onChange={(e) => up((n) => (n.wealth.currency = e.target.value))} /></div>
        </div>
      )}
      {tab === 'inv' && <Rows items={g.inventory} blank={{ name: '', qty: 1, note: '' }} cols={[['name', 'Objeto'], ['qty', 'Cant.', 'number'], ['note', 'Nota']]} onChange={(v) => up((n) => (n.inventory = v))} />}
      {tab === 'hab' && (
        <Rows items={Object.entries(g.skills).map(([name, s]) => ({ name, lvl: s.lvl, xp: s.xp }))} blank={{ name: '', lvl: 1, xp: 0 }}
          cols={[['name', 'Habilidad'], ['lvl', 'Nivel', 'number'], ['xp', 'XP', 'number']]}
          onChange={(v) => up((n) => { n.skills = {}; v.forEach((s) => s.name && (n.skills[s.name] = { lvl: s.lvl, xp: s.xp })); })} />
      )}
      {tab === 'pnj' && <Rows items={g.npcs} blank={{ name: '', role: '', attitude: '', notes: '' }} cols={[['name', 'Nombre'], ['role', 'Papel'], ['attitude', 'Actitud'], ['notes', 'Notas']]} onChange={(v) => up((n) => (n.npcs = v))} />}
      {tab === 'mapa' && (<><p>📍 Ahora: <b>{g.location}</b></p><Rows items={g.zones} blank={{ name: '', desc: '' }} cols={[['name', 'Zona'], ['desc', 'Descripción']]} onChange={(v) => up((n) => (n.zones = v))} /></>)}
      {tab === 'fac' && <Rows items={g.factions} blank={{ name: '', rep: 0 }} cols={[['name', 'Facción'], ['rep', 'Rep.', 'number']]} onChange={(v) => up((n) => (n.factions = v))} />}
      {tab === 'mem' && (
        <div>
          <label>Resumen acumulado (se actualiza cada 5 turnos; editable)</label>
          <textarea rows={6} value={g.summary} onChange={(e) => up((n) => (n.summary = e.target.value))} />
          <label>Diario de hechos clave (uno por línea)</label>
          <textarea rows={5} value={g.diary.join('\n')} onChange={(e) => up((n) => (n.diary = e.target.value.split('\n')))} />
          <label>Trasfondo</label>
          <textarea rows={3} value={g.backstory} onChange={(e) => up((n) => (n.backstory = e.target.value))} />
        </div>
      )}
      {tab === 'admin' && (
        <div>
          <p style={{ fontSize: 13 }}>Modo admin: edita el estado completo en JSON.</p>
          <textarea rows={12} value={json || JSON.stringify({ ...g, log: undefined }, null, 1)} onChange={(e) => setJson(e.target.value)} style={{ fontFamily: 'monospace', fontSize: 12 }} />
          <button className="btn main small" onClick={() => { try { setG({ ...g, ...JSON.parse(json) }); setJson(''); } catch (e) { alert('JSON no válido'); } }}>Aplicar</button>
        </div>
      )}
    </div>
  );
}

function Game({ camp, onMenu }) {
  const [g, setG] = useState(camp.data);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [admin, setAdmin] = useState(false);
  const [free, setFree] = useState('');
  const [heir, setHeir] = useState({ name: '', rel: 'hijo' });
  const gRef = useRef(g);
  gRef.current = g;
  const timer = useRef();
  const started = useRef(false);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { sb.from('campaigns').update({ data: g, title: g.title, updated_at: new Date().toISOString() }).eq('id', camp.id); }, 800);
    return () => clearTimeout(timer.current);
  }, [g, camp.id]);

  const turn = useCallback(async (act) => {
    setBusy(true); setErr('');
    try {
      const cur = JSON.parse(JSON.stringify(gRef.current));
      const rl = act.start ? null : E.rollCheck(cur, act);
      const txt = await callAI(cur.model, E.buildSystem(cur), E.buildUser(cur, act, rl), true);
      let r;
      try { r = JSON.parse(txt); } catch (e) { throw new Error('Respuesta inválida del narrador. Reintenta.'); }
      const lvl = rl && rl.success && !cur.dead ? E.addXp(cur, act.skill) : null;
      E.applyChanges(cur, r);
      if (!act.start) { E.advanceClock(cur, cur.scale); E.driftNeeds(cur, cur.scale); }
      cur.turns++;
      cur.actions = r.suggestedActions || [];
      cur.log.push({ action: act.start ? 'Inicio' : act.text, narr: r.narrative, roll: rl, lvl });
      cur.log = cur.log.slice(-30);
      if (cur.turns % 5 === 0 && !cur.dead) {
        try {
          const s = await callAI(cur.model, `Resume en ${cur.lang === 'ca' ? 'català' : 'castellano'}, en máximo 150 palabras, la historia del personaje manteniendo hechos, relaciones, deudas, promesas y enemigos. Solo texto.`, `Resumen previo: ${cur.summary}\nDiario: ${cur.diary.slice(-8).join(' | ')}\nÚltimos hechos: ${cur.log.slice(-5).map((l) => l.narr).join(' ')}`, false);
          cur.summary = s;
        } catch (e) { /* no bloquea */ }
      }
      setG(cur);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }, []);

  useEffect(() => {
    if (!started.current && g.turns === 0 && g.log.length === 0) { started.current = true; turn({ start: true }); }
  }, [g.turns, g.log.length, turn]);

  const last = g.log[g.log.length - 1];
  const rl = last && last.roll;
  const setField = (k, v) => setG({ ...g, [k]: v });

  if (g.dead) {
    return (
      <div className="wrap">
        <h1>💀 {g.name} ha muerto</h1>
        <div className="card narr">{g.deathMessage}<br /><br />{last && last.narr}</div>
        <div className="card">
          <h3>Continuar la dinastía</h3>
          <label>Nombre del heredero</label>
          <input value={heir.name} onChange={(e) => setHeir({ ...heir, name: e.target.value })} />
          <label>Relación</label>
          <select value={heir.rel} onChange={(e) => setHeir({ ...heir, rel: e.target.value })}><option value="hijo">Hijo/a</option><option value="ahijado">Ahijado/a</option></select>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn main" disabled={!heir.name} onClick={() => { started.current = false; setG(E.buildHeir(g, heir.name, heir.rel)); }}>Seguir como heredero</button>
            <button className="btn" onClick={onMenu}>Menú principal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button className="btn small" onClick={onMenu}>☰ Menú</button>
        <span style={{ fontSize: 13, color: '#9aa3b8' }}>{E.clockText(g)}</span>
        <label style={{ margin: 0 }}><input type="checkbox" style={{ width: 'auto' }} checked={admin} onChange={(e) => setAdmin(e.target.checked)} /> Admin</label>
      </div>
      <div className="row" style={{ marginTop: 6 }}>
        <span className="tag">📍 {g.location}</span>
        <span className="tag">❤️ {g.physical.health}</span><span className="tag">🍖 {g.physical.hunger}</span><span className="tag">😴 {g.physical.fatigue}</span>
        <span className="tag">💰 {g.wealth.amount} {g.wealth.currency}</span>
      </div>
      <div className="card">
        {rl && <div className={'roll ' + (rl.success ? 'ok' : 'ko')} title={rl.parts}>🎲 {rl.d20}{rl.bonus >= 0 ? '+' : ''}{rl.bonus} = {rl.total} vs {rl.dc} → {rl.crit ? 'CRÍTICO' : rl.fumble ? 'PIFIA' : rl.success ? 'ÉXITO' : 'FALLO'}</div>}
        {rl && <div style={{ fontSize: 12, color: '#9aa3b8', marginBottom: 6 }}>{rl.parts}</div>}
        {last && last.lvl && <div className="tag" style={{ marginBottom: 6 }}>⭐ {last.lvl}</div>}
        <div className="narr">{busy && !last ? 'El narrador prepara la escena…' : last && last.narr}</div>
        {busy && last && <div style={{ color: '#9aa3b8' }}>…</div>}
      </div>
      {err && <div className="card" style={{ color: '#ff9aa9' }}>{err} <button className="btn small" onClick={() => turn({ start: g.turns === 0 })}>Reintentar</button></div>}
      <div style={{ display: 'grid', gap: 8 }}>
        {(g.actions || []).map((a, i) => (
          <button key={i} className="btn" disabled={busy} onClick={() => turn(a)}>
            {a.text} <span className="tag">{E.ATTRS[a.attr] || ''}{a.skill ? ' · ' + a.skill : ''} · {a.risk}</span>
          </button>
        ))}
        <div className="row" style={{ flexWrap: 'nowrap' }}>
          <input value={free} placeholder="Otra acción…" onChange={(e) => setFree(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && free && !busy) { turn({ text: free, attr: 'des', risk: 'medio' }); setFree(''); } }} />
          <button className="btn main" disabled={busy || !free} onClick={() => { turn({ text: free, attr: 'des', risk: 'medio' }); setFree(''); }}>▶</button>
        </div>
      </div>
      <div className="card">
        <div className="row">
          <div style={{ flex: 1 }}><label>Tiempo por turno</label>
            <select value={g.scale} onChange={(e) => setField('scale', e.target.value)}>{Object.entries(E.SCALES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
          <div style={{ flex: 1 }}><label>Narrador</label>
            <select value={g.model} onChange={(e) => setField('model', e.target.value)}>{E.MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select></div>
          <div style={{ flex: 1 }}><label>Idioma</label>
            <select value={g.lang} onChange={(e) => setField('lang', e.target.value)}><option value="es">Castellano</option><option value="ca">Català</option></select></div>
        </div>
      </div>
      <Panels g={g} setG={setG} admin={admin} />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [screen, setScreen] = useState('menu');
  const [camp, setCamp] = useState(null);
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  if (session === undefined) return <div className="wrap">Cargando…</div>;
  if (!session) return <Auth />;
  if (screen === 'create')
    return <Create onCancel={() => setScreen('menu')} onDone={async (g) => {
      const { data, error } = await sb.from('campaigns').insert({ title: g.title, data: g }).select().single();
      if (error) { alert(error.message); return; }
      setCamp(data); setScreen('game');
    }} />;
  if (screen === 'game' && camp) return <Game key={camp.id} camp={camp} onMenu={() => setScreen('menu')} />;
  return <Menu user={session.user} onNew={() => setScreen('create')} onOpen={(c) => { setCamp(c); setScreen('game'); }} />;
}
