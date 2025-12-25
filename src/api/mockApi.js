// ============================
// Mock API - Pass Zone
// ============================

const KEY_ZONES = "PZ_ZONES";
const KEY_SLOTS = "PZ_SLOTS";
const KEY_RES = "PZ_RES";
const KEY_TICKETS = "PZ_TICKETS";

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

function seedIfNeeded() {
  const zones = read(KEY_ZONES, null);
  const slots = read(KEY_SLOTS, null);
  const res = read(KEY_RES, null);
  const tickets = read(KEY_TICKETS, null);

  if (zones && slots && res && tickets) return;

  const z1 = { id: uid("zone"), name: "Fan Zone Rabat", city: "Rabat", capacity: 500, rules: "Pas d'objets dangereux. Respect des consignes." };
  const z2 = { id: uid("zone"), name: "Fan Zone Casablanca", city: "Casablanca", capacity: 800, rules: "Interdiction fumigènes. Respect file d'attente." };

  const s1 = { id: uid("slot"), zoneId: z1.id, match: "Match A", start: new Date(Date.now()+86400000).toISOString(), capacity: 500, booked: 0 };
  const s2 = { id: uid("slot"), zoneId: z1.id, match: "Match B", start: new Date(Date.now()+2*86400000).toISOString(), capacity: 500, booked: 0 };
  const s3 = { id: uid("slot"), zoneId: z2.id, match: "Match A", start: new Date(Date.now()+86400000).toISOString(), capacity: 800, booked: 0 };

  write(KEY_ZONES, [z1, z2]);
  write(KEY_SLOTS, [s1, s2, s3]);
  write(KEY_RES, []);
  write(KEY_TICKETS, []);
}

export const MockApi = {
  // ✅ Fan zones
  async listZones() {
    seedIfNeeded();
    return read(KEY_ZONES, []);
  },

  // ✅ Slots par zone
  async listSlotsByZone(zoneId) {
    seedIfNeeded();
    return read(KEY_SLOTS, []).filter(s => s.zoneId === zoneId);
  },

  // ✅ CONFIRMATION RESERVATION
  // Ici on "capture" fanZone + match + date au moment du confirm
  async reserve({ userEmail, slotId, qty }) {
    seedIfNeeded();

    const zones = read(KEY_ZONES, []);
    const slots = read(KEY_SLOTS, []);
    const reservations = read(KEY_RES, []);
    const tickets = read(KEY_TICKETS, []);

    const slot = slots.find(s => s.id === slotId);
    if (!slot) throw new Error("Créneau introuvable");

    const zone = zones.find(z => z.id === slot.zoneId);
    if (!zone) throw new Error("Fan zone introuvable");

    const remaining = slot.capacity - slot.booked;
    if (qty <= 0) throw new Error("Quantité invalide");
    if (qty > remaining) throw new Error("Capacité insuffisante");

    // update booked
    slot.booked += Number(qty);
    write(KEY_SLOTS, slots);

    // create reservation (✅ avec fanZone + match + date)
    const reservationId = uid("res");
    const reservation = {
      id: reservationId,
      userEmail,
      slotId: slot.id,
      qty: Number(qty),
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),

      // ✅ Champs importants pour MyReservations
      fanZoneName: zone.name,
      city: zone.city,
      match: slot.match,
      start: slot.start
    };

    reservations.unshift(reservation);
    write(KEY_RES, reservations);

    // create ticket
    const ticketCode = "PZ-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const ticket = {
      id: uid("t"),
      reservationId,
      ticketCode
    };

    tickets.unshift(ticket);
    write(KEY_TICKETS, tickets);

    // réponse utilisée par ton modal ticket
    return {
      reservationId,
      ticketCode
    };
  },

  // ✅ Liste "mes réservations" avec infos enrichies
  async myReservations(userEmail) {
    seedIfNeeded();

    const reservations = read(KEY_RES, []).filter(r => r.userEmail === userEmail);
    const tickets = read(KEY_TICKETS, []);

    return reservations.map(r => {
      const t = tickets.find(x => x.reservationId === r.id);
      return {
        ...r,
        ticketCode: t?.ticketCode || "—"
      };
    });
  },

  // ✅ Annulation
  async cancel({ userEmail, reservationId }) {
    seedIfNeeded();

    const reservations = read(KEY_RES, []);
    const slots = read(KEY_SLOTS, []);

    const r = reservations.find(x => x.id === reservationId);
    if (!r) throw new Error("Réservation introuvable");
    if (r.userEmail !== userEmail) throw new Error("Interdit");
    if (r.status !== "CONFIRMED") throw new Error("Déjà annulée");

    // restore capacity
    const slot = slots.find(s => s.id === r.slotId);
    if (slot) {
      slot.booked = Math.max(0, slot.booked - r.qty);
      write(KEY_SLOTS, slots);
    }

    r.status = "CANCELED";
    write(KEY_RES, reservations);

    return { ok: true };
  }
};
