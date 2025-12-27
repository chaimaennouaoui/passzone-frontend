import React, { useEffect, useState } from "react";
import { BackendApi } from "../api/backendApi";
import { Modal } from "../ui/components";
import emailjs from '@emailjs/browser';

function fmt(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export default function MyReservations() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [msg, setMsg] = useState("");

  async function refresh() {
    setLoading(true);
    const r = await BackendApi.myReservations();
    setList(r);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function cancelNow() {
    try {
      setMsg("");
      const reservationToCancel = list.find(r => r.id === confirmCancel);
      await BackendApi.cancel(confirmCancel);

      // ✅ Envoi Email d'annulation via Variables d'Environnement
      const cancelParams = {
        ticket_code: reservationToCancel?.ticketCode,
        zone_name: reservationToCancel?.fanZoneName,
        match_name: reservationToCancel?.matchName
      };

      emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_CANCEL,
        cancelParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      ).then(() => console.log("Email d'annulation envoyé !"))
       .catch((err) => console.error("Erreur EmailJS:", err));

      setConfirmCancel(null);
      await refresh();
    } catch (e) {
      setMsg(e.response?.data?.message || e.message || "Erreur");
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="h1">Mes réservations</div>
        {msg && <div className="badge" style={{ marginTop: 10, background: "rgba(193,39,45,.10)" }}>{msg}</div>}
      </div>

      <div style={{ height: 12 }} />

      {loading ? (
        <div className="card">Chargement...</div>
      ) : (
        <div className="card">
          {list.length === 0 ? (
            <div className="badge">Aucune réservation</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Fan Zone</th>
                  <th>Match</th>
                  <th>Date</th>
                  <th>Qté</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id}>
                    <td><span className="badge">{r.ticketCode}</span></td>
                    <td><b>{r.fanZoneName}</b></td>
                    <td>{r.matchName}</td>
                    <td>{fmt(r.startTime)}</td>
                    <td>{r.qty}</td>
                    <td>{r.status}</td>
                    <td>
                      {r.status === "CONFIRMED" && (
                        <button className="btn btnDanger" onClick={() => setConfirmCancel(r.id)}>Annuler</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {confirmCancel && (
        <Modal
          title="Annuler ?"
          onClose={() => setConfirmCancel(null)}
          footer={
            <>
              <button className="btn" onClick={() => setConfirmCancel(null)}>Retour</button>
              <button className="btn btnDanger" onClick={cancelNow}>Confirmer</button>
            </>
          }
        >
          <div className="p">Voulez-vous vraiment annuler cette réservation ?</div>
        </Modal>
      )}
    </div>
  );
}