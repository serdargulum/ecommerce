const CUSTOMER_TOKEN_KEY = "tb_customer_token";
const ADMIN_TOKEN_KEY = "tb_admin_token";
export const AUTH_EVENT = "tb-auth-change";

function read(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function remove(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(key);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export const customerAuth = {
  token: () => read(CUSTOMER_TOKEN_KEY),
  save: (token: string) => write(CUSTOMER_TOKEN_KEY, token),
  clear: () => remove(CUSTOMER_TOKEN_KEY),
};

export const adminAuth = {
  token: () => read(ADMIN_TOKEN_KEY),
  save: (token: string) => write(ADMIN_TOKEN_KEY, token),
  clear: () => remove(ADMIN_TOKEN_KEY),
};
