import React, { useEffect, useMemo, useState } from "react";
import { BackendApi } from "../api/backendApi";
import { Modal } from "../ui/components";
import Barcode from "../ui/Barcode";
import emailjs from '@emailjs/browser';

function fmt(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function FanZones() {
  const [zones, setZones] = useState([]);
  const [slotsByZone, setSlotsByZone] = useState({});
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [openReserve, setOpenReserve] = useState(false);
  const [openTicket, setOpenTicket] = useState(false);

  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [qty, setQty] = useState(1);

  const [ticket, setTicket] = useState(null);
  const [msg, setMsg] = useState("");

  async function refresh() {
    try {
      setLoading(true);
      const z = await BackendApi.listZones();
      setZones(z);
      const map = {};
      for (const zone of z) {
        map[zone.id] = await BackendApi.listSlotsByZone(zone.id);
      }
      setSlotsByZone(map);
    } catch (e) {
      setMsg(e.response?.data?.message || e.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return zones;
    return zones.filter((z) => {
      const city = (z.city || "").toLowerCase();
      const name = (z.name || "").toLowerCase();
      const matches = (slotsByZone[z.id] || [])
        .map((s) => (s.matchName || "").toLowerCase())
        .join(" ");
      return city.includes(term) || name.includes(term) || matches.includes(term);
    });
  }, [q, zones, slotsByZone]);

  function openReserveModal(zone) {
    setMsg("");
    setTicket(null);
    setSelectedZone(zone);
    const slots = slotsByZone[zone.id] || [];
    setSelectedSlotId(slots[0]?.id || "");
    setQty(1);
    setOpenReserve(true);
  }

  async function confirmReserve() {
    try {
      setMsg("");
      const slots = slotsByZone[selectedZone.id] || [];
      const slot = slots.find((s) => s.id === selectedSlotId);
      if (!slot) return setMsg("Choisis un créneau");

      const remaining = slot.capacity - slot.booked;
      if (qty <= 0) return setMsg("Quantité invalide");
      if (qty > remaining) return setMsg("Capacité insuffisante");

      const resp = await BackendApi.reserve({
        slotId: selectedSlotId,
        qty: Number(qty),
      });

      // ✅ Envoi Email via Variables d'Environnement
      const templateParams = {
        to_name: "Utilisateur PassZone",
        ticket_code: resp.ticketCode,
        zone_name: selectedZone.name,
        match_name: slot.matchName,
        quantity: qty,
        start_time: fmt(slot.startTime)
      };

      emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_CONFIRM,
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      ).then(() => console.log("Email de confirmation envoyé !"))
       .catch((err) => console.error("Erreur EmailJS:", err));

      setTicket(resp);
      setOpenReserve(false);
      setOpenTicket(true);

      const newSlots = await BackendApi.listSlotsByZone(selectedZone.id);
      setSlotsByZone((prev) => ({ ...prev, [selectedZone.id]: newSlots }));
    } catch (e) {
      setMsg(e.response?.data?.message || e.message || "Erreur serveur");
    }
  }

  const currentSlots = selectedZone ? slotsByZone[selectedZone.id] || [] : [];
  const selectedSlot = currentSlots.find((s) => s.id === selectedSlotId);
  const remainingSlots = selectedSlot ? selectedSlot.capacity - selectedSlot.booked : 0;

  return (
    <div className="container">
      <div className="card">
        <div className="h1">Accueil</div>
        <div style={{ height: 12 }} />
        <input
          className="input"
          placeholder="🔎 Rechercher "
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {msg && <div className="badge" style={{ marginTop: 12, borderColor: "rgba(193,39,45,.35)", background: "rgba(193,39,45,.10)" }}>{msg}</div>}
      </div>

      <div style={{ height: 12 }} />

      {loading ? (
        <div className="card">Chargement...</div>
      ) : (
        <div className="stack">
          {filtered.map((z) => (
            <div key={z.id} className="card zoneItem">
              <div className="zoneLeft">
                <div className="h2">{z.name}</div>
                <div className="small">
                  <span className="chip">📍 {z.city}</span>{" "}
                  <span className="chip">👥 Capacité: {z.capacity}</span>
                </div>
                <div className="small">Règles: {z.rules}</div>
                <div className="small" style={{ marginTop: 6 }}>
                  {(slotsByZone[z.id] || []).slice(0, 3).map((s) => (
                    <span key={s.id} className="chip">⚽ {s.matchName} • {fmt(s.startTime)}</span>
                  ))}
                </div>
              </div>
              <div className="row">
                <button className="btn btnGreen" onClick={() => openReserveModal(z)}>Réserver</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {openReserve && selectedZone && (
        <Modal
          title={`Réserver — ${selectedZone.name}`}
          onClose={() => setOpenReserve(false)}
          footer={
            <>
              <button className="btn" onClick={() => setOpenReserve(false)}>Annuler</button>
              <button className="btn btnGreen" onClick={confirmReserve}>Confirmer</button>
            </>
          }
        >
          <div className="small">Créneau</div>
          <select className="input" value={selectedSlotId} onChange={(e) => setSelectedSlotId(e.target.value)}>
            {currentSlots.map((s) => (
              <option key={s.id} value={s.id}>{s.matchName} — {fmt(s.startTime)} (restant: {s.capacity - s.booked})</option>
            ))}
          </select>
          <div style={{ height: 12 }} />
          <div className="small">Nombre de places</div>
          <input className="input" type="number" min="1" max={remainingSlots || 1} value={qty} onChange={(e) => setQty(e.target.value)} />
        </Modal>
      )}

      {openTicket && ticket && (
        <Modal
          title="Réservation confirmée ✅"
          onClose={() => setOpenTicket(false)}
          footer={<button className="btn btnRed" onClick={() => setOpenTicket(false)}>Fermer</button>}
        >
          <div className="p">Présente ce <b>barcode</b> à l’entrée.</div>
          <div className="card" style={{ borderColor: "rgba(0,98,51,.25)" }}>
            <div className="small">Ticket code</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{ticket.ticketCode}</div>
            <Barcode value={ticket.ticketCode} />
          </div>
          {ticket.qrPngBase64 && (
            <img alt="QR code" src={`data:image/png;base64,${ticket.qrPngBase64}`} style={{ width: 200, marginTop: 10, borderRadius: 12 }} />
          )}
        </Modal>
      )}
    </div>
  );
}