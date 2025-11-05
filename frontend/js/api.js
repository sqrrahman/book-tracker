// frontend/js/api.js
// all frontend → backend calls live here

export const API_BASE = "https://book-tracker-a70i.onrender.com";

// --- read ---
export async function getBooks() {
  const res = await fetch(`${API_BASE}/books`);
  if (!res.ok) throw new Error("Error loading books");
  return res.json();
}

// --- ratings ---
export async function updateRating(index, user, rating) {
  const res = await fetch(`${API_BASE}/books/${index}/rating`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, rating }),
  });
  if (!res.ok) throw new Error("Error saving rating");
}

// --- quotes/words ---
export async function updateQw(index, user, quotes, words) {
  const res = await fetch(`${API_BASE}/books/${index}/qw`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, quotes, words }),
  });
  if (!res.ok) throw new Error("Error saving Q/W");
}

// --- texts (notes/comments) ---
export async function updateTx(index, user, notes, comments) {
  const res = await fetch(`${API_BASE}/books/${index}/tx`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, notes, comments }),
  });
  if (!res.ok) throw new Error("Error saving texts");
}

// --- librarian: add ---
export async function bulkAdd(titles) {
  const res = await fetch(`${API_BASE}/books/bulk-add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titles }),
  });
  if (!res.ok) throw new Error("Error bulk adding");
}

// --- librarian: remove ---
export async function bulkRemove(indexes) {
  const res = await fetch(`${API_BASE}/books/bulk-remove`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ indexes }),
  });
  if (!res.ok) throw new Error("Error bulk removing");
}

// --- librarian: rename ---
export async function renameBook(index, newTitle) {
  const res = await fetch(`${API_BASE}/books/rename`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index, newTitle }),
  });
  if (!res.ok) throw new Error("Error renaming");
}
