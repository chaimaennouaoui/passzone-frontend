import { http } from "./http";

export const BackendApi = {
  async listZones() {
    const { data } = await http.get("/fanzones");
    return data;
  },

  async listSlotsByZone(zoneId) {
    const { data } = await http.get(`/fanzones/${zoneId}/slots`);
    return data;
  },

  async reserve(payload) {
    const { data } = await http.post("/reservations", payload);
    return data;
  },

  async myReservations() {
    const { data } = await http.get("/my/reservations");
    return data;
  },

  async cancel(reservationId) {
    await http.post(`/reservations/${reservationId}/cancel`);
    return true;
  },

  // ✅ ADMIN
  async adminListZones() {
    const { data } = await http.get("/admin/fanzones");
    return data;
  },

  async adminCreateZone(payload) {
    const { data } = await http.post("/admin/fanzones", payload);
    return data;
  },

  async adminDeleteZone(id) {
    await http.delete(`/admin/fanzones/${id}`);
    return true;
  },

  async adminListSlots() {
    const { data } = await http.get("/admin/slots");
    return data;
  },

  async adminCreateSlot(zoneId, payload) {
    const { data } = await http.post(`/admin/fanzones/${zoneId}/slots`, payload);
    return data;
  },

  async adminDeleteSlot(slotId) {
    await http.delete(`/admin/slots/${slotId}`);
    return true;
  },

  async adminCheckin(ticketCode) {
    const { data } = await http.post(`/admin/checkin/${ticketCode}`);
    return data;
  },
};
