import React, { useEffect, useState } from "react";
import { BackendApi } from "../api/backendApi";
import { Modal } from "../ui/components";

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
      await BackendApi.cancel(confirmCancel);
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
        <div className="p">Consulte l’historique et annule une réservation si tu veux.</div>

        {msg && (
          <div
            className="badge"
            style={{
              marginTop: 10,
              borderColor: "rgba(193,39,45,.35)",
              background: "rgba(193,39,45,.10)",
            }}
          >
            {msg}
          </div>
        )}
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
                  <th>Quantité</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="badge">{r.ticketCode || "—"}</span>
                    </td>

                    <td>
                      <b>{r.fanZoneName}</b>
                      <div className="small">📍 {r.city}</div>
                    </td>

                    <td>{r.matchName}</td>
                    <td>{fmt(r.startTime)}</td>
                    <td>{r.qty}</td>

                    <td>
                      <span
                        className="badge"
                        style={{
                          borderColor:
                            r.status === "CANCELED"
                              ? "rgba(193,39,45,.35)"
                              : "rgba(0,98,51,.35)",
                          background:
                            r.status === "CANCELED"
                              ? "rgba(193,39,45,.08)"
                              : "rgba(0,98,51,.08)",
                        }}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td>
                      {r.status === "CONFIRMED" ? (
                        <button className="btn btnDanger" onClick={() => setConfirmCancel(r.id)}>
                          Annuler
                        </button>
                      ) : (
                        <span className="small">—</span>
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
          title="Annuler la réservation ?"
          onClose={() => setConfirmCancel(null)}
          footer={
            <>
              <button className="btn" onClick={() => setConfirmCancel(null)}>
                Retour
              </button>
              <button className="btn btnDanger" onClick={cancelNow}>
                Confirmer annulation
              </button>
            </>
          }
        >
          <div className="p">L’annulation peut être limitée par une fenêtre (ex: 2h avant).</div>
        </Modal>
      )}
    </div>
  );
}
