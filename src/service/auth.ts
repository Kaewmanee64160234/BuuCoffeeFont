import http from "./axios";
function login(userEmail: string, userPassword: string) {
  return http.post('/auth/login', { userEmail: userEmail, userPassword: userPassword });
}
export default { login }
