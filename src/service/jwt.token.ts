import jwt_decode from "jwt-decode";

export function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // If there's an error decoding, consider it expired
  }
}
