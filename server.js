import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "https://sqrrahman.github.io",
  })
);

app.use(express.json());

const OWNER = "sqrrahman";
const REPO = "book-tracker";
const FILE_PATH = "books.json";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GH_API_BASE = "https://api.github.com";

// ===== Helper: read file from GitHub =====
async function getFile() {
  const res = await fetch(`${GH_API_BASE}/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("GitHub GET error:", txt);
    throw new Error("Cannot fetch file from GitHub");
  }
  return res.json();
}

// ===== Helper: write file to GitHub =====
async function putFile(newBooks, oldSha, message) {
  const newContentB64 = Buffer.from(JSON.stringify(newBooks, null, 2), "utf8").toString("base64");

  const updateRes = await fetch(`${GH_API_BASE}/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      message,
      content: newContentB64,
      sha: oldSha,
    }),
  });

  if (!updateRes.ok) {
    const txt = await updateRes.text();
    console.error("GitHub PUT error:", txt);
    throw new Error("Cannot write to GitHub");
  }
}

// ===== ROUTES =====

// --- Get all books ---
app.get("/books", async (req, res) => {
  try {
    const file = await getFile();
    const content = Buffer.from(file.content, "base64").toString("utf8");
    const books = JSON.parse(content);
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "cannot load books" });
  }
});

// --- Add single book ---
app.post("/books", async (req, res) => {
  const { title, status } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });

  try {
    const file = await getFile();
    const content = Buffer.from(file.content, "base64").toString("utf8");
    const books = JSON.parse(content);

    books.push({ title, status: status || "To Read" });

    await putFile(books, file.sha, `Add book: ${title}`);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// --- Update book status ---
app.put("/books/:index", async (req, res) => {
  const idx = parseInt(req.params.index, 10);
  const { status } = req.body;
  if (Number.isNaN(idx)) return res.status(400).json({ error: "invalid index" });
  if (!status) return res.status(400).json({ error: "status required" });

  try {
    const file = await getFile();
    const content = Buffer.from(file.content, "base64").toString("utf8");
    const books = JSON.parse(content);

    if (idx < 0 || idx >= books.length)
      return res.status(404).json({ error: "book not found" });

    books[idx].status = status;
    await putFile(books, file.sha, `Update status of book ${idx} to ${status}`);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// --- Update book rating ---
app.put("/books/:index/rating", async (req, res) => {
  const idx = parseInt(req.params.index, 10);
  const { user, rating } = req.body;
  if (Number.isNaN(idx)) return res.status(400).json({ error: "invalid index" });
  if (!user || (user !== "A" && user !== "N"))
    return res.status(400).json({ error: "user must be A or N" });
  const val = Number(rating);
  if (Number.isNaN(val) || val < 0 || val > 10)
    return res.status(400).json({ error: "rating must be 0..10" });

  try {
    const file = await getFile();
    const content = Buffer.from(file.content, "base64").toString("utf8");
    const books = JSON.parse(content);
    if (idx < 0 || idx >= books.length)
      return res.status(404).json({ error: "book not found" });

    if (!books[idx].ratings) books[idx].ratings = {};
    books[idx].ratings[user] = val;

    await putFile(books, file.sha, `Update rating of book ${idx} for ${user} to ${val}`);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// --- Update quotes/words ---
app.put("/books/:index/qw", async (req, res) => {
  const idx = parseInt(req.params.index, 10);
  const { user, quotes, words } = req.body;
  if (Number.isNaN(idx)) return res.status(400).json({ error: "invalid index" });
  if (!user || (user !== "A" && user !== "N"))
    return res.status(400).json({ error: "user must be A or N" });

  try {
    const file = await getFile();
    const content = Buffer.from(file.content, "base64").toString("utf8");
    const books = JSON.parse(content);
    if (idx < 0 || idx >= books.length)
      return res.status(404).json({ error: "book not found" });

    if (!books[idx].quotes) books[idx].quotes = { A: [], N: [] };
    if (!books[idx].words) books[idx].words = { A: [], N: [] };

    if (Array.isArray(quotes)) books[idx].quotes[user] = quotes;
    if (Array.isArray(words)) books[idx].words[user] = words;

    await putFile(books, file.sha, `Update quotes/words of book ${idx} for ${user}`);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// ===== NEW ENDPOINTS =====

// --- Bulk Add ---
app.post("/books/bulk-add", async (req, res) => {
  const { titles } = req.body;
  if (!Array.isArray(titles) || !titles.length)
    return res.status(400).json({ error: "titles required" });
  try {
    const file = await getFile();
    const content = Buffer.from(file.content, "base64").toString("utf8");
    const books = JSON.parse(content);
    titles.forEach((t) => books.push({ title: t, status: "To Read" }));
    await putFile(books, file.sha, `Bulk add ${titles.length} books`);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// --- Bulk Remove ---
app.delete("/books/bulk-remove", async (req, res) => {
  const { indexes } = req.body;
  if (!Array.isArray(indexes) || !indexes.length)
    return res.status(400).json({ error: "indexes required" });
  try {
    const file = await getFile();
    const content = Buffer.from(file.content, "base64").toString("utf8");
    let books = JSON.parse(content);
    const sorted = indexes.sort((a, b) => b - a);
    sorted.forEach((i) => {
      if (i >= 1 && i <= books.length) books.splice(i - 1, 1);
    });
    await putFile(books, file.sha, `Bulk remove ${indexes.length} books`);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// --- Rename ---
app.put("/books/rename", async (req, res) => {
  const { index, newTitle } = req.body;
  if (index == null || !newTitle)
    return res.status(400).json({ error: "index and newTitle required" });
  try {
    const file = await getFile();
    const content = Buffer.from(file.content, "base64").toString("utf8");
    const books = JSON.parse(content);
    if (index < 0 || index >= books.length)
      return res.status(404).json({ error: "book not found" });
    books[index].title = newTitle;
    await putFile(books, file.sha, `Rename book ${index} to ${newTitle}`);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// ===== SERVER START =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
