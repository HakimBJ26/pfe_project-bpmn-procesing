export default function authHeader() {
  // Vérifier si le token est stocké directement dans localStorage
  const token = localStorage.getItem('token');

  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    // Vérification de l'ancienne méthode (pour la compatibilité)
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      return { Authorization: `Bearer ${user.token}` };
    }
    return {};
  }
} 