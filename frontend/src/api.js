const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081")
  .trim()
  .replace(/\/+$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      `Could not connect to the API at ${apiBaseUrl}. Check that the backend is running.`,
    );
  }

  const responseText = await response.text();
  let result = responseText;
  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = responseText;
    }
  }

  if (!response.ok) {
    const message =
      typeof result === "string"
        ? result
        : result?.message || result?.error || "";
    throw new Error(
      message || `The API request failed with status ${response.status}.`,
    );
  }

  return result;
}

export const medicalCampApi = {
  getAll: () => request("/DisplayAll"),
  getById: (id) => request(`/Display/${encodeURIComponent(id)}`),
  create: (camp) =>
    request("/Add", { method: "POST", body: JSON.stringify(camp) }),
  update: (id, camp) =>
    request(`/Update/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(camp),
    }),
  remove: (id) =>
    request(`/Delete/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
