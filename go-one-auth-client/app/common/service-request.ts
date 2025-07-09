export const apiRequest = async (url: string, method: string, body?: any) => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { error: data.message || "Request failed" }
  }

  return res.json();
};