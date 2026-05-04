// Local Docker Compose config - backend runs locally, auth uses public Keycloak.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  keycloakUrl: 'https://keycloak-production-4c61.up.railway.app'
};
