/* =========================================================
   MediNexo · Datos ficticios del prototipo
   Las caducidades se expresan en "días desde hoy" para que
   las alertas sean siempre coherentes.
   ========================================================= */
const DAY = 864e5;
const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const addDays = n => new Date(TODAY.getTime() + n * DAY);
const FEE = 0.025; // comisión por transacción (fuente de ingresos)

const INST = {
  santalucia: { name: 'Clínica Santa Lucía', city: 'Guayaquil', type: 'Clínica de especialidades', ruc: '0992345678001' },
  pacifico:   { name: 'Hospital del Pacífico', city: 'Guayaquil', type: 'Hospital privado', ruc: '0991122334001' },
  bioandes:   { name: 'Laboratorio BioAndes', city: 'Cuenca', type: 'Laboratorio clínico', ruc: '0190456789001' },
  vidaplena:  { name: 'Centro Médico Vida Plena', city: 'Guayaquil', type: 'Centro médico', ruc: '0993344556001' },
  diagnosur:  { name: 'DiagnoSur Laboratorios', city: 'Loja', type: 'Laboratorio clínico', ruc: '1190987654001' },
  imagenorte: { name: 'ImagenNorte Diagnóstico', city: 'Ibarra', type: 'Centro de imagen', ruc: '1091239876001' },
  oncovida:   { name: 'Instituto OncoVida', city: 'Quito', type: 'Centro oncológico', ruc: '1792233445001' },
  manabi:     { name: 'Clínica Manabí Salud', city: 'Portoviejo', type: 'Clínica privada', ruc: '1391122998001' }
};

const TYPES = {
  Reactivo:    { c: '#2B6F77', icon: 'flask' },
  Medicamento: { c: '#2F5D8C', icon: 'pill' },
  Repuesto:    { c: '#8A6A3B', icon: 'wrench' },
  Insumo:      { c: '#5B5683', icon: 'box' }
};

const NAV = {
  dashboard:    { label: 'Panel', icon: 'grid' },
  reports:      { label: 'Reportes de ahorro', icon: 'chart' },
  inventory:    { label: 'Inventario', icon: 'box' },
  catalog:      { label: 'Catálogo B2B', icon: 'search' },
  negotiations: { label: 'Negociaciones', icon: 'swap' },
  trace:        { label: 'Trazabilidad', icon: 'activity' },
  verification: { label: 'Verificación', icon: 'shield' }
};

/* Tres perfiles generales, alineados con los segmentos de clientes del modelo de negocio */
const ROLES = {
  admin: {
    name: 'Patricia Morán', title: 'Gerente Administrativa y Financiera', persona: 'Administrador de institución', inst: 'santalucia', ini: 'PM',
    blurb: 'Controla el capital en riesgo por caducidad y revisa los reportes de ahorro.',
    nav: ['dashboard', 'reports', 'inventory', 'negotiations'], labels: {}
  },
  gestor: {
    name: 'Diego Cevallos', title: 'Jefe de Compras y Abastecimiento', persona: 'Gestor de abastecimiento', inst: 'santalucia', ini: 'DC',
    blurb: 'Publica excedentes, busca insumos y repuestos, y da seguimiento a cada pedido.',
    nav: ['dashboard', 'inventory', 'catalog', 'negotiations', 'trace'], labels: {}
  },
  plat: {
    name: 'Equipo MediNexo', title: 'Administración de la plataforma', persona: 'Administrador de plataforma', inst: null, ini: 'MN',
    blurb: 'Verifica instituciones y supervisa las transacciones de la red.',
    nav: ['dashboard', 'verification', 'negotiations'], labels: { negotiations: 'Transacciones' }
  }
};

/* ---------- Publicaciones / inventario ---------- */
const ITEMS = [
  { id: 1,  name: 'Troponina I de alta sensibilidad (kit 100 tests)', type: 'Reactivo', brand: 'Cardiolab Dx', lot: 'TR24-0887', reg: 'ARCSA-RS-2231-IVD', qty: 12, unit: 'kits', price: 310, exp: 24, inst: 'bioandes', cold: '2–8 °C', mode: 'Venta / Intercambio', pub: true, critical: false },
  { id: 2,  name: 'Hemoglobina glicosilada HbA1c (kit 200 determinaciones)', type: 'Reactivo', brand: 'Cardiolab Dx', lot: 'HB-5521', reg: 'ARCSA-RS-1984-IVD', qty: 6, unit: 'kits', price: 185, exp: 41, inst: 'diagnosur', cold: '2–8 °C', mode: 'Venta', pub: true },
  { id: 3,  name: 'Bevacizumab 100 mg / 4 mL (vial)', type: 'Medicamento', brand: 'Laboratorio Helvia', lot: 'BV-9087', reg: 'ARCSA-RS-7710-MED', qty: 8, unit: 'viales', price: 142, exp: 120, inst: 'oncovida', cold: '2–8 °C', mode: 'Venta', pub: true, critical: true },
  { id: 4,  name: 'Inmunoglobulina humana IV 5 g (vial)', type: 'Medicamento', brand: 'Laboratorio Helvia', lot: 'IG-3310', reg: 'ARCSA-RS-6602-MED', qty: 10, unit: 'viales', price: 420, exp: 210, inst: 'manabi', cold: '2–8 °C', mode: 'Venta / Intercambio', pub: true, critical: true },
  { id: 5,  name: 'Tubo de rayos X rotatorio 150 kHU', type: 'Repuesto', brand: 'RadioParts', lot: '—', pn: 'RX-T150-A', qty: 1, unit: 'unidad', price: 6800, exp: null, inst: 'imagenorte', cold: null, mode: 'Venta', pub: true, critical: true },
  { id: 6,  name: 'Kit de rodillos para bomba peristáltica de hemodiálisis', type: 'Repuesto', brand: 'NefroTech', lot: '—', pn: 'HD-PP-22', qty: 3, unit: 'kits', price: 210, exp: null, inst: 'santalucia', cold: null, mode: 'Venta / Intercambio', pub: true },
  { id: 7,  name: 'Sensor SpO₂ reutilizable adulto', type: 'Repuesto', brand: 'Oxisense', lot: '—', pn: 'SP-A-118', qty: 15, unit: 'unidades', price: 38, exp: null, inst: 'pacifico', cold: null, mode: 'Venta', pub: true },
  { id: 8,  name: 'Cabezal de lámpara cialítica LED', type: 'Repuesto', brand: 'LumiSurg', lot: '—', pn: 'OT-L-70', qty: 2, unit: 'unidades', price: 1450, exp: null, inst: 'manabi', cold: null, mode: 'Venta', pub: true },
  { id: 9,  name: 'Solución calibradora de electrolitos ISE', type: 'Reactivo', brand: 'ChemCal', lot: 'CAL-7720', reg: 'ARCSA-RS-3015-IVD', qty: 20, unit: 'kits', price: 64, exp: 18, inst: 'santalucia', cold: null, mode: 'Venta / Intercambio', pub: false },
  { id: 10, name: 'Control de coagulación niveles 1 y 2', type: 'Reactivo', brand: 'CoagControl', lot: 'CC-4410', reg: 'ARCSA-RS-2784-IVD', qty: 8, unit: 'kits', price: 52, exp: 9, inst: 'bioandes', cold: '2–8 °C', mode: 'Venta', pub: false },
  { id: 11, name: 'Stent coronario liberador de fármaco 3.0 × 18 mm', type: 'Insumo', brand: 'CardioFlow', lot: 'ST-3018', reg: 'ARCSA-RS-5521-DM', qty: 4, unit: 'unidades', price: 780, exp: 365, inst: 'pacifico', cold: null, mode: 'Venta', pub: true, critical: true },
  { id: 12, name: 'Oxigenador de membrana pediátrico', type: 'Insumo', brand: 'PerfuLife', lot: 'OX-P2', reg: 'ARCSA-RS-4478-DM', qty: 3, unit: 'unidades', price: 950, exp: 160, inst: 'manabi', cold: null, mode: 'Venta', pub: true, critical: true },
  { id: 13, name: 'Albúmina humana 20 % (50 mL)', type: 'Medicamento', brand: 'BioPlasma', lot: 'AL-2060', reg: 'ARCSA-RS-6120-MED', qty: 30, unit: 'frascos', price: 88, exp: 60, inst: 'santalucia', cold: '2–8 °C', mode: 'Venta', pub: false },
  { id: 14, name: 'Dímero-D (kit 100 pruebas)', type: 'Reactivo', brand: 'Cardiolab Dx', lot: 'DD-1180', reg: 'ARCSA-RS-2290-IVD', qty: 10, unit: 'kits', price: 98, exp: 27, inst: 'bioandes', cold: '2–8 °C', mode: 'Venta / Intercambio', pub: false },
  { id: 15, name: 'Placa electrónica para monitor multiparamétrico', type: 'Repuesto', brand: 'MonitorParts', lot: '—', pn: 'MN-PCB-5', qty: 2, unit: 'unidades', price: 540, exp: null, inst: 'diagnosur', cold: null, mode: 'Venta', pub: true },
  { id: 16, name: 'Batería de ion-litio para ventilador mecánico', type: 'Repuesto', brand: 'VentaPower', lot: '—', pn: 'VT-BAT-12', qty: 6, unit: 'unidades', price: 175, exp: null, inst: 'santalucia', cold: null, mode: 'Venta', pub: false },
  { id: 17, name: 'Heparina sódica 5000 UI/mL (vial 5 mL)', type: 'Medicamento', brand: 'FarmaVida', lot: 'HP-5000', reg: 'ARCSA-RS-3340-MED', qty: 120, unit: 'viales', price: 6.8, exp: 26, inst: 'santalucia', cold: null, mode: 'Venta', pub: false },
  { id: 18, name: 'Catéter venoso central triple lumen 7 Fr', type: 'Insumo', brand: 'VascuCath', lot: 'CV-7731', reg: 'ARCSA-RS-4012-DM', qty: 40, unit: 'unidades', price: 36, exp: 25, inst: 'pacifico', cold: null, mode: 'Venta', pub: false },
  { id: 19, name: 'Cable troncal ECG de 5 vías', type: 'Repuesto', brand: 'MonitorParts', lot: '—', pn: 'ECG-CT-5', qty: 12, unit: 'unidades', price: 45, exp: null, inst: 'vidaplena', cold: null, mode: 'Venta', pub: true }
];

/* ---------- Negociaciones ----------
   status: 0 Solicitud enviada · 1 Aceptada · 2 En tránsito · 3 Recibida y verificada */
const REQS = [
  { id: 'R-1042', item: 1,  qty: 4, buyer: 'santalucia', seller: 'bioandes',   status: 0, ago: 0, mode: 'Compra' },
  { id: 'R-1043', item: 6,  qty: 1, buyer: 'vidaplena',  seller: 'santalucia', status: 0, ago: 0, mode: 'Compra' },
  { id: 'R-1044', item: 3,  qty: 2, buyer: 'santalucia', seller: 'oncovida',   status: 2, ago: 3, mode: 'Compra' },
  { id: 'R-1045', item: 5,  qty: 1, buyer: 'vidaplena',  seller: 'imagenorte', status: 1, ago: 1, mode: 'Compra' },
  { id: 'R-1047', item: 1,  qty: 3, buyer: 'diagnosur',  seller: 'bioandes',   status: 0, ago: 0, mode: 'Intercambio' },
  { id: 'R-1049', item: 16, qty: 2, buyer: 'pacifico',   seller: 'santalucia', status: 3, ago: 9, mode: 'Compra' }
];

/* ---------- Verificación de instituciones (actividad clave) ---------- */
const PENDING_INST = [
  { id: 'V-1', name: 'Clínica San Gabriel', city: 'Riobamba', type: 'Clínica privada', ruc: '0691234567001', resp: 'Dr. Hugo Almeida', docs: { ruc: true, permiso: true, resp: false } },
  { id: 'V-2', name: 'Laboratorio Clínico Altamira', city: 'Machala', type: 'Laboratorio clínico', ruc: '0792345678001', resp: 'Q.F. Daniela Vera', docs: { ruc: true, permiso: true, resp: true } },
  { id: 'V-3', name: 'Centro Médico Santa Rita', city: 'Esmeraldas', type: 'Centro médico', ruc: '0891122334001', resp: 'Dr. Marcos Ortiz', docs: { ruc: true, permiso: false, resp: true } },
  { id: 'V-4', name: 'Hospital Alfa Salud', city: 'Santo Domingo', type: 'Hospital privado', ruc: '2390011223001', resp: 'Dra. Karen Loor', docs: { ruc: true, permiso: true, resp: true } }
];
const PLAT = { verified: 148, volume: 184300 };
