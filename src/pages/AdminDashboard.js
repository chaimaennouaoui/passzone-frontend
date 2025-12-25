import React, { useEffect, useMemo, useState } from "react";
import { BackendApi } from "../api/backendApi";
import { Modal } from "../ui/components";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function fmt(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function AdminDashboard() {
  const [zones, setZones] = useState([]);
  const [slots, setSlots] = useState([]);
  const [q, setQ] = useState("");

  const [openNewZone, setOpenNewZone] = useState(false);
  const [openNewSlot, setOpenNewSlot] = useState(false);

  const [zoneForm, setZoneForm] = useState({
    name: "",
    city: "",
    capacity: 200,
    rules: "",
  });

  const [slotForm, setSlotForm] = useState({
    zoneId: "",
    matchName: "",
    startTime: "",
    capacity: 100,
  });

  const [ticketCode, setTicketCode] = useState("");
  const [checkMsg, setCheckMsg] = useState("");

  const [msg, setMsg] = useState("");

  async function refresh() {
    const z = await BackendApi.adminListZones();
    const s = await BackendApi.adminListSlots();
    setZones(z);
    setSlots(s);
  }

  useEffect(() => {
    refresh();
  }, []);

  const filteredZones = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return zones;

    return zones.filter((z) => {
      const city = (z.city || "").toLowerCase();
      const name = (z.name || "").toLowerCase();
      const zoneMatches = slots
        .filter((s) => s.zoneId === z.id)
        .map((s) => (s.matchName || "").toLowerCase())
        .join(" ");

      return name.includes(term) || city.includes(term) || zoneMatches.includes(term);
    });
  }, [q, zones, slots]);

  function openCreateZone() {
    setMsg("");
    setZoneForm({ name: "", city: "", capacity: 200, rules: "" });
    setOpenNewZone(true);
  }

  function openCreateSlot() {
    setMsg("");
    const firstZoneId = zones[0]?.id || "";
    setSlotForm({
      zoneId: firstZoneId,
      matchName: "",
      startTime: "",
      capacity: 100,
    });
    setOpenNewSlot(true);
  }

  async function submitZone() {
    try {
      setMsg("");
      await BackendApi.adminCreateZone(zoneForm);
      setOpenNewZone(false);
      await refresh();
    } catch (e) {
      setMsg(e.response?.data?.message || e.message || "Erreur");
    }
  }

  async function submitSlot() {
    try {
      setMsg("");
      await BackendApi.adminCreateSlot(slotForm.zoneId, {
        matchName: slotForm.matchName,
        startTime: new Date(slotForm.startTime).toISOString(),
        capacity: Number(slotForm.capacity),
      });

      setOpenNewSlot(false);
      await refresh();
    } catch (e) {
      setMsg(e.response?.data?.message || e.message || "Erreur");
    }
  }

  async function checkin() {
    try {
      setCheckMsg("");
      const resp = await BackendApi.adminCheckin(ticketCode.trim());
      setCheckMsg(resp.message);
    } catch (e) {
      setCheckMsg(e.response?.data?.message || e.message || "Erreur");
    }
  }

  // ✅ Logout button
  async function logout() {
    await signOut(auth);
    window.location.href = "/";
  }

  // ✅ Delete Match
  async function deleteSlot(slotId) {
    if (!window.confirm("⚠️ Supprimer ce match ?")) return;
    try {
      await BackendApi.adminDeleteSlot(slotId);
      await refresh();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  }

  return (
    <div className="container">
      <div className="card">

        {/* ✅ HEADER avec Logout */}
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="h1">Dashboard Admin</div>
            <div className="p">
              Crée des fan zones et attribue des matches
            </div>
          </div>

          {/* ✅ Logout en haut à droite */}
          <button className="btn btnRed" onClick={logout}>
            Déconnexion
          </button>
        </div>

        <div style={{ height: 12 }} />

        <input
          className="input"
          placeholder="🔎 Rechercher"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div style={{ height: 12 }} />

        <div className="row">
          <button className="btn btnGreen" onClick={openCreateZone}>
            + Nouvelle Fan Zone
          </button>
          <button className="btn btnRed" onClick={openCreateSlot}>
            + Nouveau Match
          </button>
        </div>

        <div style={{ height: 12 }} />

        <input
          className="input"
          placeholder="Ticket code pour check-in"
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
        />

        <div style={{ height: 12 }} />

        <button className="btn btnGreen" onClick={checkin}>
          Check-in
        </button>

        {checkMsg && (
          <div className="badge" style={{ marginTop: 10 }}>
            Résultat check-in : <b>{checkMsg}</b>
          </div>
        )}

        {msg && (
          <div
            className="badge"
            style={{
              marginTop: 12,
              borderColor: "rgba(193,39,45,.35)",
              background: "rgba(193,39,45,.10)",
            }}
          >
            {msg}
          </div>
        )}
      </div>

      <div style={{ height: 12 }} />

      <div className="stack">
        {filteredZones.map((z) => {
          const zSlots = slots
            .filter((s) => s.zoneId === z.id)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

          return (
            <div key={z.id} className="card">
              <div className="h2">{z.name}</div>
              <div className="small">
                📍 {z.city} — 👥 Capacité globale: {z.capacity}
              </div>
              <div className="small">Règles: {z.rules}</div>

              <div style={{ height: 10 }} />

              {zSlots.length === 0 ? (
                <div className="badge">Aucun match pour cette fan zone</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Match</th>
                      <th>Date / Heure</th>
                      <th>Capacité</th>
                      <th>Réservé</th>
                      <th>Restant</th>

                      {/* ✅ Nouvelle colonne Action */}
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {zSlots.map((s) => (
                      <tr key={s.id}>
                        <td>{s.matchName}</td>
                        <td>{fmt(s.startTime)}</td>
                        <td>{s.capacity}</td>
                        <td>{s.booked}</td>
                        <td>{s.capacity - s.booked}</td>

                        {/* ✅ bouton Supprimer */}
                        <td>
                          <button
                            className="btn btnDanger"
                            onClick={() => deleteSlot(s.id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal création zone */}
      {openNewZone && (
        <Modal
          title="Créer une Fan Zone"
          onClose={() => setOpenNewZone(false)}
          footer={
            <>
              <button className="btn" onClick={() => setOpenNewZone(false)}>
                Annuler
              </button>
              <button className="btn btnGreen" onClick={submitZone}>
                Créer
              </button>
            </>
          }
        >
          <div className="small">Nom</div>
          <input
            className="input"
            value={zoneForm.name}
            onChange={(e) => setZoneForm((p) => ({ ...p, name: e.target.value }))}
          />

          <div style={{ height: 10 }} />
          <div className="small">Ville</div>
          <input
            className="input"
            value={zoneForm.city}
            onChange={(e) => setZoneForm((p) => ({ ...p, city: e.target.value }))}
          />

          <div style={{ height: 10 }} />
          <div className="small">Capacité globale</div>
          <input
            className="input"
            type="number"
            value={zoneForm.capacity}
            onChange={(e) => setZoneForm((p) => ({ ...p, capacity: e.target.value }))}
          />

          <div style={{ height: 10 }} />
          <div className="small">Règles</div>
          <textarea
            className="input"
            rows={4}
            value={zoneForm.rules}
            onChange={(e) => setZoneForm((p) => ({ ...p, rules: e.target.value }))}
          />
        </Modal>
      )}

      {/* Modal création slot */}
      {openNewSlot && (
        <Modal
          title="Créer un Match (Créneau)"
          onClose={() => setOpenNewSlot(false)}
          footer={
            <>
              <button className="btn" onClick={() => setOpenNewSlot(false)}>
                Annuler
              </button>
              <button className="btn btnGreen" onClick={submitSlot}>
                Créer
              </button>
            </>
          }
        >
          <div className="small">Fan Zone</div>
          <select
            className="input"
            value={slotForm.zoneId}
            onChange={(e) => setSlotForm((p) => ({ ...p, zoneId: e.target.value }))}
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} — {z.city}
              </option>
            ))}
          </select>

          <div style={{ height: 10 }} />
          <div className="small">Match</div>
          <input
            className="input"
            value={slotForm.matchName}
            onChange={(e) => setSlotForm((p) => ({ ...p, matchName: e.target.value }))}
          />

          <div style={{ height: 10 }} />
          <div className="small">Date / Heure</div>
          <input
            className="input"
            type="datetime-local"
            value={slotForm.startTime}
            onChange={(e) => setSlotForm((p) => ({ ...p, startTime: e.target.value }))}
          />

          <div style={{ height: 10 }} />
          <div className="small">Capacité</div>
          <input
            className="input"
            type="number"
            value={slotForm.capacity}
            onChange={(e) => setSlotForm((p) => ({ ...p, capacity: e.target.value }))}
          />
        </Modal>
      )}
    </div>
  );
}
