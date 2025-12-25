// Liste des admins (créés par toi, pas de signup)
export const ADMIN_EMAILS = [
  "admin@gmail.com",
  "admin@passzone.ma",
  "chaimaennouaoui9@gmail.com",
  "ennouaouisana@gmail.com" // (si tu veux te tester admin)
];

// retourne true si email est admin
export function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
