// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// ---- CORS: allow your GitHub Pages site ----
app.use(
  cors({
    origin: "https://sqrrahman.github.io", // your GitHub Pages origin
  })
);

app.use(express.json());

// ----- CONFIG -----
// repo where books.json lives
const OWNER = "sqrrahman";
const REPO = "book-tracker";
const FILE_PATH = "books.json"; // must exist in repo
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const GH_API_BASE = "https://api.github.com";

// helper: get current file (content + sha)
async function getFile() {
  const res = await fetch(
    `${GH_API_BASE}/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  if (!res.ok) {
    const txt = await res.text();
    console.error("GitHub GET error:", txt);
    throw new Error("Cannot fetch file from GitHub");
  }
  return res.json();
}

// GET /books  --> return array from books.json
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

// POST /books  --> add a book and commit to GitHub
app.post("/books", async (req, res) => {
  const { title, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title required" });
  }

  try {
    // 1. get current books.json
    const file = await getFile();
    const content = Buffer.from(file.content, "base64").toString("utf8");
    const books = JSON.parse(content);

    // 2. modify
    books.push({ title, status: status || "Reading" });

    // 3. encode new content
    const newContentB64 = Buffer.from(
      JSON.stringify(books, null, 2),
      "utf8"
    ).toString("base64");

    // 4. PUT back to GitHub
    const updateRes = await fetch(
      `${GH_API_BASE}/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: `Add book: ${title}`,
          content: newContentB64,
          sha: file.sha,
        }),
      }
    );

    if (!updateRes.ok) {
      const txt = await updateRes.text();
      console.error("GitHub PUT error:", txt);
      return res.status(500).json({ error: "cannot write to github" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
