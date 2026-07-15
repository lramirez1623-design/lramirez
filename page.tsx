"use client";

import { useEffect, useMemo, useState } from "react";

type Entry = { id: string; date: string; category: string; description: string; amount: number; type: "Ingreso" | "Gasto" };
type Debt = { id: string; name: string; balance: number; payment: number; rate: number; priority: number };
type Vehicle = { id: string; name: string; value: number; payment: number; monthlyIncome: number; operatingCost: number; note: string };

const fmt = new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 });
const money = (n: number) => fmt.format(Number.isFinite(n) ? n : 0);
const uid = () => Math.random().toString(36).slice(2, 9);

const defaultDebts: Debt[] = [
  { id: "bcr", name: "Tarjeta BCR", balance: 1223826, payment: 55000, rate: 35, priority: 1 },
  { id: "bac", name: "Tarjeta BAC", balance: 1005458, payment: 56000, rate: 35, priority: 2 },
  { id: "credi", name: "Credix", balance: 306774, payment: 38000, rate: 30, priority: 3 },
  { id: "insta", name: "Instacredit", balance: 1125897, payment: 54200, rate: 32.65, priority: 4 },
  { id: "bncr", name: "BNCR — Elantra", balance: 6978874, payment: 169000, rate: 18, priority: 5 },
  { id: "bcrp", name: "Préstamo BCR", balance: 1912605, payment: 37000, rate: 18, priority: 6 },
];

const defaultEntries: Entry[] = [
  { id: "1", date: "2026-07-01", category: "Salario", description: "Salario neto", amount: 434000, type: "Ingreso" },
  { id: "2", date: "2026-07-05", category: "Uber / DiDi", description: "Meta mensual", amount: 354807, type: "Ingreso" },
  { id: "3", date: "2026-07-10", category: "Otros ingresos", description: "Dani / CEFI", amount: 155000, type: "Ingreso" },
  { id: "4", date: "2026-07-03", category: "Vivienda", description: "Alquiler", amount: 140000, type: "Gasto" },
  { id: "5", date: "2026-07-08", category: "Gastos variables", description: "Alimentación, servicios y varios", amount: 175000, type: "Gasto" },
];

const defaultVehicles: Vehicle[] = [
  { id: "elantra", name: "Hyundai Elantra — Uber", value: 4400000, payment: 169000, monthlyIncome: 354807, operatingCost: 126000, note: "Activo productivo. Venta estimada en agencia: ₡4,400,000." },
  { id: "creta", name: "Creta Grand — escenario", value: 22470000, payment: 363000, monthlyIncome: 354807, operatingCost: 145000, note: "No firmado. Recompra a 24 meses debe validarse por contrato." },
];

function Card({ label, value, hint, tone = "" }: { label: string; value: string; hint?: string; tone?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[.035] p-4 ${tone}`}><p className="text-xs uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p>{hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}</div>;
}

export default function Home() {
  const [tab, setTab] = useState("Panel");
  const [entries, setEntries] = useState<Entry[]>(defaultEntries);
  const [debts, setDebts] = useState<Debt[]>(defaultDebts);
  const [vehicles, setVehicles] = useState<Vehicle[]>(defaultVehicles);
  const [receivable, setReceivable] = useState(3944050);
  const [savings, setSavings] = useState(1364615);
  const [emergencyGoal, setEmergencyGoal] = useState(300000);
  const [cash, setCash] = useState(50000);
  const [scenario, setScenario] = useState({ creta: false, rentElantra: false, neftali: 0, bonus: 900000, extraPayment: 0 });
  const [entryForm, setEntryForm] = useState({ date: "2026-07-15", category: "Uber / DiDi", description: "", amount: "", type: "Ingreso" as Entry["type"] });

  useEffect(() => {
    const raw = localStorage.getItem("financehub-luis-v1");
    if (raw) { try { const s = JSON.parse(raw); setEntries(s.entries ?? defaultEntries); setDebts(s.debts ?? defaultDebts); setVehicles(s.vehicles ?? defaultVehicles); setReceivable(s.receivable ?? 3944050); setSavings(s.savings ?? 1364615); setCash(s.cash ?? 50000); } catch {} }
  }, []);
  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined); }, []);
  useEffect(() => { localStorage.setItem("financehub-luis-v1", JSON.stringify({ entries, debts, vehicles, receivable, savings, cash })); }, [entries, debts, vehicles, receivable, savings, cash]);

  const income = entries.filter(e => e.type === "Ingreso").reduce((a, e) => a + e.amount, 0);
  const expenses = entries.filter(e => e.type === "Gasto").reduce((a, e) => a + e.amount, 0);
  const debtPayments = debts.reduce((a, d) => a + d.payment, 0);
  const debtBalance = debts.reduce((a, d) => a + d.balance, 0);
  const vehicleValue = vehicles.filter(v => !v.name.includes("escenario")).reduce((a, v) => a + v.value, 0);
  const cashFlow = income - expenses - debtPayments;
  const netWorth = cash + savings + receivable + vehicleValue - debtBalance;
  const currentMonth = "Julio 2026";
  const simulateFlow = cashFlow + (scenario.rentElantra ? 260000 : 0) + scenario.neftali - (scenario.creta ? 363000 + 145000 - 354807 : 0);
  const projection = useMemo(() => {
    let balance = debtBalance; const rows = [];
    for (let m = 1; m <= 12; m++) { const extra = scenario.extraPayment + scenario.neftali + (scenario.rentElantra ? 260000 : 0) + (m === 6 ? scenario.bonus : 0); balance = Math.max(0, balance * 1.015 - debtPayments - extra); rows.push({ m, balance }); }
    return rows;
  }, [debtBalance, debtPayments, scenario]);

  function addEntry(e: React.FormEvent) { e.preventDefault(); const amount = Number(entryForm.amount); if (!amount || !entryForm.description) return; setEntries(x => [...x, { id: uid(), ...entryForm, amount }]); setEntryForm({ ...entryForm, description: "", amount: "" }); }
  function downloadExcel() { const header = "Fecha,Tipo,Categoría,Descripción,Monto\n"; const csv = header + entries.map(e => `${e.date},${e.type},${e.category},"${e.description}",${e.amount}`).join("\n"); const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "financehub-luis-registros.csv"; a.click(); URL.revokeObjectURL(url); }
  const nav = ["Panel", "Registros", "Deudas", "Uber y vehículos", "Cuentas por cobrar", "Proyecciones", "Reportes"];

  return <main className="min-h-screen bg-[#07151a] text-slate-100">
    <header className="no-print border-b border-white/10 bg-[#0a1e24] px-5 py-4 lg:px-10"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div><h1 className="text-xl font-semibold">FinanceHub <span className="text-emerald-400">Luis</span></h1><p className="text-xs text-slate-400">Sistema financiero personal · {currentMonth}</p></div><div className="flex gap-2"><button onClick={downloadExcel} className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10">Exportar Excel</button><button onClick={() => window.print()} className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-medium text-slate-950">Reporte PDF</button></div></div></header>
    <div className="mx-auto grid max-w-7xl lg:grid-cols-[220px_1fr]">
      <aside className="no-print border-b border-white/10 bg-[#0a1e24] p-3 lg:min-h-[calc(100vh-73px)] lg:border-b-0 lg:border-r"><nav className="flex gap-2 overflow-x-auto lg:flex-col">{nav.map(n => <button key={n} onClick={() => setTab(n)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm ${tab === n ? "bg-emerald-400 font-medium text-slate-950" : "text-slate-300 hover:bg-white/10"}`}>{n}</button>)}</nav></aside>
      <section className="p-5 lg:p-8">
        {tab === "Panel" && <>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-slate-400">Vista ejecutiva</p><h2 className="text-3xl font-semibold">Control de hoy</h2></div><p className="text-sm text-slate-400">Todo valor es editable desde sus módulos.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card label="Patrimonio neto" value={money(netWorth)} hint="Activos menos pasivos" /><Card label="Liquidez disponible" value={money(cash)} hint="Efectivo registrado" /><Card label="Flujo del mes" value={money(cashFlow)} hint="Ingresos − gastos − cuotas" tone={cashFlow < 0 ? "border-red-400/40" : "border-emerald-400/30"} /><Card label="Deuda total" value={money(debtBalance)} hint={`${debts.length} obligaciones activas`} /></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]"><section className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><h3 className="font-medium">Flujo de caja mensual</h3><div className="mt-5 space-y-4">{[["Ingresos", income, "bg-emerald-400"], ["Gastos variables", expenses, "bg-amber-400"], ["Cuotas de deuda", debtPayments, "bg-red-400"]].map(([l, v, c]) => <div key={String(l)}><div className="mb-1 flex justify-between text-sm"><span>{String(l)}</span><span>{money(Number(v))}</span></div><div className="h-2 rounded bg-white/10"><div className={`h-2 rounded ${String(c)}`} style={{ width: `${Math.min(100, Number(v) / Math.max(income, 1) * 100)}%` }} /></div></div>)}</div><p className="mt-6 border-t border-white/10 pt-4 text-lg">Margen actual: <strong className={cashFlow >= 0 ? "text-emerald-400" : "text-red-400"}>{money(cashFlow)}</strong></p></section><section className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><h3 className="font-medium">Metas y alertas</h3><div className="mt-4 space-y-4"><Progress label="Fondo de emergencia" value={cash} goal={emergencyGoal} /><Progress label="Cobro Neftalí" value={0} goal={receivable} /><p className="rounded-lg bg-amber-400/10 p-3 text-sm text-amber-200">Prioridad actual: no usar las tarjetas y aplicar cualquier excedente a la deuda con mayor tasa.</p></div></section></div>
        </>}

        {tab === "Registros" && <><Title title="Registro semanal y mensual" text="Registre cada entrada o salida; el panel y los reportes se actualizan de inmediato." /><div className="grid gap-5 lg:grid-cols-[360px_1fr]"><form onSubmit={addEntry} className="rounded-2xl border border-white/10 bg-white/[.035] p-5 space-y-3"><label className="block text-sm">Fecha<input value={entryForm.date} onChange={e => setEntryForm({...entryForm,date:e.target.value})} type="date" className="mt-1 w-full rounded bg-slate-950 p-2" /></label><label className="block text-sm">Tipo<select value={entryForm.type} onChange={e => setEntryForm({...entryForm,type:e.target.value as Entry["type"]})} className="mt-1 w-full rounded bg-slate-950 p-2"><option>Ingreso</option><option>Gasto</option></select></label><label className="block text-sm">Categoría<input value={entryForm.category} onChange={e => setEntryForm({...entryForm,category:e.target.value})} className="mt-1 w-full rounded bg-slate-950 p-2" /></label><label className="block text-sm">Detalle<input value={entryForm.description} onChange={e => setEntryForm({...entryForm,description:e.target.value})} className="mt-1 w-full rounded bg-slate-950 p-2" /></label><label className="block text-sm">Monto<input value={entryForm.amount} onChange={e => setEntryForm({...entryForm,amount:e.target.value})} type="number" className="mt-1 w-full rounded bg-slate-950 p-2" /></label><button className="w-full rounded bg-emerald-400 p-2 font-medium text-slate-950">Agregar registro</button></form><Table entries={entries} remove={id => setEntries(x => x.filter(e => e.id !== id))} /></div></>}

        {tab === "Deudas" && <><Title title="Mapa de deudas" text="Ordenado por prioridad de pago. Edite saldos, cuotas y tasas con sus estados de cuenta." /><div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[700px] text-sm"><thead className="bg-white/[.05] text-left text-slate-400"><tr><th className="p-3">Prioridad</th><th>Obligación</th><th>Saldo</th><th>Cuota</th><th>Tasa anual</th><th></th></tr></thead><tbody>{[...debts].sort((a,b)=>a.priority-b.priority).map(d => <tr key={d.id} className="border-t border-white/10"><td className="p-3">#{d.priority}</td><td>{d.name}</td><td><EditNumber value={d.balance} onChange={v=>setDebts(x=>x.map(i=>i.id===d.id?{...i,balance:v}:i))} /></td><td><EditNumber value={d.payment} onChange={v=>setDebts(x=>x.map(i=>i.id===d.id?{...i,payment:v}:i))} /></td><td><EditNumber value={d.rate} onChange={v=>setDebts(x=>x.map(i=>i.id===d.id?{...i,rate:v}:i))} /></td><td><button onClick={()=>setDebts(x=>x.filter(i=>i.id!==d.id))} className="p-3 text-red-300">Eliminar</button></td></tr>)}</tbody></table></div><button onClick={()=>setDebts(x=>[...x,{id:uid(),name:"Nueva deuda",balance:0,payment:0,rate:0,priority:x.length+1}])} className="mt-4 rounded border border-white/20 px-3 py-2 text-sm">+ Agregar deuda</button></>}

        {tab === "Uber y vehículos" && <><Title title="Centro de utilidades de transporte" text="Mida si cada vehículo produce efectivo después de cuota y costos operativos." /><div className="grid gap-5 md:grid-cols-2">{vehicles.map(v => <article key={v.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><div className="flex items-start justify-between"><h3 className="font-semibold">{v.name}</h3><button onClick={()=>setVehicles(x=>x.filter(i=>i.id!==v.id))} className="text-xs text-red-300">Eliminar</button></div><p className="mt-1 text-sm text-slate-400">{v.note}</p><div className="mt-5 grid grid-cols-2 gap-3"><Field label="Valor estimado" value={v.value} onChange={n=>setVehicles(x=>x.map(i=>i.id===v.id?{...i,value:n}:i))}/><Field label="Cuota mensual" value={v.payment} onChange={n=>setVehicles(x=>x.map(i=>i.id===v.id?{...i,payment:n}:i))}/><Field label="Ingreso mensual" value={v.monthlyIncome} onChange={n=>setVehicles(x=>x.map(i=>i.id===v.id?{...i,monthlyIncome:n}:i))}/><Field label="Costos operativos" value={v.operatingCost} onChange={n=>setVehicles(x=>x.map(i=>i.id===v.id?{...i,operatingCost:n}:i))}/></div><p className={`mt-5 text-lg font-semibold ${v.monthlyIncome-v.payment-v.operatingCost>=0?"text-emerald-400":"text-red-400"}`}>Resultado mensual: {money(v.monthlyIncome-v.payment-v.operatingCost)}</p></article>)}</div></>}

        {tab === "Cuentas por cobrar" && <><Title title="Cuentas por cobrar" text="Este activo se separa de la liquidez hasta que exista cobro efectivo." /><div className="max-w-xl rounded-2xl border border-white/10 bg-white/[.035] p-5"><h3 className="font-semibold">Neftalí</h3><p className="mt-1 text-sm text-slate-400">Saldo pendiente consolidado. Registre abonos como ingreso en el módulo de Registros.</p><div className="mt-5"><Field label="Saldo pendiente" value={receivable} onChange={setReceivable}/></div><p className="mt-5 rounded-lg bg-red-400/10 p-3 text-sm text-red-200">Riesgo alto: no planifique pagos obligatorios usando este dinero hasta recibirlo.</p></div></>}

        {tab === "Proyecciones" && <><Title title="Simulador de decisiones" text="Pruebe escenarios sin cambiar sus datos reales. La proyección usa una reserva conservadora de 1.5% mensual sobre el saldo de deudas." /><div className="grid gap-5 lg:grid-cols-[360px_1fr]"><div className="rounded-2xl border border-white/10 bg-white/[.035] p-5 space-y-4"><Switch label="Comprar Creta Grand" checked={scenario.creta} set={v=>setScenario({...scenario,creta:v})}/><Switch label="Alquilar Elantra (neto ₡260k)" checked={scenario.rentElantra} set={v=>setScenario({...scenario,rentElantra:v})}/><Field label="Abono mensual de Neftalí" value={scenario.neftali} onChange={n=>setScenario({...scenario,neftali:n})}/><Field label="Pago extra mensual a deuda" value={scenario.extraPayment} onChange={n=>setScenario({...scenario,extraPayment:n})}/><Field label="Aguinaldo + bono (mes 6)" value={scenario.bonus} onChange={n=>setScenario({...scenario,bonus:n})}/><div className="rounded-lg bg-emerald-400/10 p-3 text-sm">Flujo estimado bajo este escenario: <strong className="text-emerald-300">{money(simulateFlow)}</strong></div></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><h3 className="font-medium">Deuda proyectada a 12 meses</h3><div className="mt-6 flex h-56 items-end gap-2 border-b border-l border-white/10 px-3 pb-1">{projection.map((p,i)=> <div key={p.m} className="group flex h-full flex-1 flex-col justify-end" title={`Mes ${p.m}: ${money(p.balance)}`}><div className="min-h-[2px] rounded-t bg-emerald-400/80 transition-all group-hover:bg-emerald-300" style={{height:`${Math.max(2,p.balance/Math.max(debtBalance,1)*100)}%`}}/><span className="mt-2 text-center text-[10px] text-slate-400">{i+1}</span></div>)}</div><div className="mt-5 flex justify-between text-sm"><span>Hoy: <strong>{money(debtBalance)}</strong></span><span>Mes 12: <strong className="text-emerald-400">{money(projection[11].balance)}</strong></span></div></div></div></>}

        {tab === "Reportes" && <><Title title="Reportes ejecutivos" text="Prepare un resumen para su asesor contable, banco o revisión personal." /><div className="grid gap-4 md:grid-cols-3"><Card label="Ingresos registrados" value={money(income)} /><Card label="Gastos registrados" value={money(expenses)} /><Card label="Servicio mensual de deuda" value={money(debtPayments)} /></div><section className="mt-6 rounded-2xl border border-white/10 bg-white/[.035] p-5"><h3 className="font-semibold">Resumen para asesoría</h3><dl className="mt-4 grid gap-3 text-sm md:grid-cols-2"><div><dt className="text-slate-400">Patrimonio neto estimado</dt><dd className="text-lg">{money(netWorth)}</dd></div><div><dt className="text-slate-400">Cuentas por cobrar (Neftalí)</dt><dd className="text-lg">{money(receivable)}</dd></div><div><dt className="text-slate-400">Ahorro asociación</dt><dd><EditNumber value={savings} onChange={setSavings}/></dd></div><div><dt className="text-slate-400">Fondo de emergencia meta</dt><dd><EditNumber value={emergencyGoal} onChange={setEmergencyGoal}/></dd></div></dl><div className="no-print mt-6 flex gap-3"><button onClick={downloadExcel} className="rounded bg-white/10 px-4 py-2 text-sm">Descargar registros (Excel)</button><button onClick={()=>window.print()} className="rounded bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950">Imprimir / Guardar PDF</button></div></section></>}
      </section>
    </div>
  </main>;
}

function Title({title,text}:{title:string;text:string}) { return <div className="mb-6"><p className="text-sm text-slate-400">FinanceHub Luis</p><h2 className="text-3xl font-semibold">{title}</h2><p className="mt-2 max-w-3xl text-sm text-slate-400">{text}</p></div>; }
function EditNumber({value,onChange}:{value:number;onChange:(v:number)=>void}) { return <input aria-label="Valor editable" type="number" value={value} onChange={e=>onChange(Number(e.target.value))} className="w-28 rounded bg-slate-950 px-2 py-1.5 text-sm" />; }
function Field({label,value,onChange}:{label:string;value:number;onChange:(n:number)=>void}) { return <label className="block text-xs text-slate-400">{label}<input aria-label={label} type="number" value={value} onChange={e=>onChange(Number(e.target.value))} className="mt-1 w-full rounded bg-slate-950 p-2 text-sm text-slate-100" /></label>; }
function Switch({label,checked,set}:{label:string;checked:boolean;set:(v:boolean)=>void}) { return <label className="flex cursor-pointer items-center justify-between gap-4 text-sm"><span>{label}</span><input aria-label={label} checked={checked} onChange={e=>set(e.target.checked)} type="checkbox" className="h-4 w-4 accent-emerald-400" /></label>; }
function Progress({label,value,goal}:{label:string;value:number;goal:number}) { const p=Math.min(100, value/Math.max(goal,1)*100); return <div><div className="flex justify-between text-sm"><span>{label}</span><span>{money(value)} / {money(goal)}</span></div><div className="mt-1 h-2 rounded bg-white/10"><div className="h-2 rounded bg-emerald-400" style={{width:`${p}%`}} /></div></div>; }
function Table({entries,remove}:{entries:Entry[];remove:(id:string)=>void}) { return <div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[620px] text-sm"><thead className="bg-white/[.05] text-left text-slate-400"><tr><th className="p-3">Fecha</th><th>Tipo</th><th>Categoría</th><th>Detalle</th><th>Monto</th><th></th></tr></thead><tbody>{[...entries].reverse().map(e=><tr key={e.id} className="border-t border-white/10"><td className="p-3">{e.date}</td><td className={e.type==="Ingreso"?"text-emerald-400":"text-amber-300"}>{e.type}</td><td>{e.category}</td><td>{e.description}</td><td>{money(e.amount)}</td><td><button onClick={()=>remove(e.id)} className="p-3 text-red-300">×</button></td></tr>)}</tbody></table></div>; }
