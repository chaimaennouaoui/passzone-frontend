import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MockApi } from "../api/mockApi";
import { useAuth } from "../auth/AuthProvider";
import { PageTitle, Toast } from "../ui/components";

function fmt(iso){
  const d = new Date(iso);
  return d.toLocaleString();
}

// QR simple (affiche le code + "pseudo qr" image via API Google chart-like ?)
// => on évite le web. Donc on affiche code et un bloc "QR placeholder"
export default function ZoneDetails() {
  const { id } = useParams();
  const { email } = useAuth();

  const [zone, setZone] = useState(null);
  const [slots, setSlots] = useState([]);
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [msg, setMsg] = useState({type:"", text:""});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const z = await MockApi.getZone(id);
      const s = await MockApi.listSlotsByZone(id);
      setZone(z);
      setSlots(s);
      setLoading(false);
    })();
  }, [id]);

  const selectedSlot = useMemo(() => slots.find(s => s.id === selected), [slots, selected]);
  const remaining = selectedSlot ? (selectedSlot.capacity - selectedSlot.booked) : 0;

  async function reserve() {
    setMsg({type:"", text:""});
    setTicket(null);
    try{
      const resp = await MockApi.reserve({ userEmail: email, slotId: selectedSlot.id, qty: Number(qty) });
      setTicket(resp);
      setMsg({type:"ok", text:"Réservation confirmée ✅ (email simulé en local)"});
      // refresh
      const s2 = await MockApi.listSlotsByZone(id);
      setSlots(s2);
    }catch(e){
      setMsg({type:"error", text:e.message});
    }
  }

  if (loading) return <div className="card">Chargement...</div>;
  if (!zone) return <div className="card">Zone introuvable</div>;

  return (
    <div className="grid">
      <PageTitle
        title={zone.name}
        subtitle={`${zone.city} • Règles: ${zone.rules}`}
      />

      <div className="grid" style={{gridTemplateColumns:"1.1fr .9fr"}}>
        <div className="card">
          <div className="h2">Créneaux disponibles</div>
          <div className="p">Sélectionne un créneau (match/date/heure) puis réserve.</div>
          <div style={{height:12}} />

          <div className="grid">
            {slots.map(s => {
              const rem = s.capacity - s.booked;
              const active = selected === s.id;
              return (
                <button
                  key={s.id}
                  className={"btn " + (active ? "btnPrimary" : "")}
                  onClick={() => setSelected(s.id)}
                  style={{textAlign:"left"}}
                >
                  <div className="row" style={{justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontWeight:800}}>{s.match}</div>
                      <div className="small">{fmt(s.start)} → {fmt(s.end)}</div>
                    </div>
                    <span className="badge">{rem} places</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="h2">Réserver</div>
          <div className="p">Ticket QR + code de contrôle.</div>
          <div style={{height:12}} />

          {!selectedSlot ? (
            <div className="badge">Choisis un créneau à gauche</div>
          ) : (
            <>
              <div className="small">Créneau</div>
              <div style={{marginTop:6}} className="badge">
                {selectedSlot.match} • {fmt(selectedSlot.start)}
              </div>

              <div style={{height:12}} />
              <div className="label">Quantité</div>
              <input className="input" type="number" min="1" max={remaining} value={qty} onChange={e=>setQty(e.target.value)} />
              <div style={{height:8}} className="small">Restant: {remaining}</div>

              <div style={{height:12}} />
              <button className="btn btnOk" onClick={reserve}>
                Confirmer la réservation
              </button>
            </>
          )}

          <div style={{height:12}} />
          <Toast type={msg.type} text={msg.text} />

          {ticket && (
            <div style={{marginTop:12}} className="card">
              <div className="h2">Ticket</div>
              <div className="p">Code: <b>{ticket.ticketCode}</b></div>
              <div style={{height:12}} />
              <div className="row">
                <div className="qr" style={{display:"grid", placeItems:"center"}}>
                  <div style={{color:"#111", fontWeight:900}}>QR</div>
                  <div style={{color:"#111"}}>{ticket.ticketCode}</div>
                </div>
                <div className="small">
                  (Demo locale) Le QR réel sera généré côté backend plus tard.<br/>
                  Pour la démo, le check-in admin se fait avec ce <b>ticketCode</b>.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
