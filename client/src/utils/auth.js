// client/src/utils/auth.js

export const getToken = () => localStorage.getItem("token");

/**
 * Decode JWT payload (base64url safe)
 */
export const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];

    // base64url -> base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    // decode
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
};

export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

export const getUserId = () => {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded?.id || decoded?._id || null;
};
