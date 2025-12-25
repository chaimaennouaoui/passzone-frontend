const KEY_ZONES = "PZ_ADMIN_ZONES";
const KEY_SLOTS = "PZ_ADMIN_SLOTS";

function uid(prefix = "id") {
  return prefix + "_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function read(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}
function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export const AdminMockApi = {
  seed() {
    const zones = read(KEY_ZONES, null);
    const slots = read(KEY_SLOTS, null);
    if (zones && slots) return;

    const z1 = { id: uid("zone"), name: "Fan Zone Rabat", city: "Rabat", capacity: 500, rules: "Pas d'objets dangereux. Respect des consignes." };
    const z2 = { id: uid("zone"), name: "Fan Zone Casablanca", city: "Casablanca", capacity: 800, rules: "Interdiction fumigènes. Respect file d'attente." };

    const s1 = { id: uid("slot"), zoneId: z1.id, match: "Match A", start: new Date(Date.now()+86400000).toISOString(), capacity: 500, booked: 0 };
    const s2 = { id: uid("slot"), zoneId: z1.id, match: "Match B", start: new Date(Date.now()+2*86400000).toISOString(), capacity: 500, booked: 0 };
    const s3 = { id: uid("slot"), zoneId: z2.id, match: "Match A", start: new Date(Date.now()+86400000).toISOString(), capacity: 800, booked: 0 };

    write(KEY_ZONES, [z1, z2]);
    write(KEY_SLOTS, [s1, s2, s3]);
  },

  listZones() {
    this.seed();
    return read(KEY_ZONES, []);
  },

  listSlots() {
    this.seed();
    return read(KEY_SLOTS, []);
  },

  listSlotsByZone(zoneId) {
    this.seed();
    return read(KEY_SLOTS, []).filter(s => s.zoneId === zoneId);
  },

  createZone({ name, city, capacity, rules }) {
    const zones = read(KEY_ZONES, []);
    const z = { id: uid("zone"), name, city, capacity: Number(capacity), rules };
    zones.push(z);
    write(KEY_ZONES, zones);
    return z;
  },

  updateZone(zoneId, patch) {
    const zones = read(KEY_ZONES, []);
    const idx = zones.findIndex(z => z.id === zoneId);
    if (idx === -1) throw new Error("Zone introuvable");
    zones[idx] = { ...zones[idx], ...patch };
    write(KEY_ZONES, zones);
    return zones[idx];
  },

  deleteZone(zoneId) {
    const zones = read(KEY_ZONES, []);
    const slots = read(KEY_SLOTS, []);
    write(KEY_ZONES, zones.filter(z => z.id !== zoneId));
    write(KEY_SLOTS, slots.filter(s => s.zoneId !== zoneId));
  },

  createSlot({ zoneId, match, start, capacity }) {
    const slots = read(KEY_SLOTS, []);
    const s = {
      id: uid("slot"),
      zoneId,
      match,
      start: new Date(start).toISOString(),
      capacity: Number(capacity),
      booked: 0
    };
    slots.push(s);
    write(KEY_SLOTS, slots);
    return s;
  },

  deleteSlot(slotId) {
    const slots = read(KEY_SLOTS, []);
    write(KEY_SLOTS, slots.filter(s => s.id !== slotId));
  }
};
