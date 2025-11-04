// ====== CONFIG ======
const API_BASE = "https://book-tracker-a70i.onrender.com"; // real backend

// ====== TABS ======
const tabs = document.querySelectorAll(".tab");
const panels = {
  books: document.getElementById("booksPanel"),
  quotes: document.getElementById("quotesPanel"),
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const target = tab.dataset.tab;
    Object.values(panels).forEach((p) => p.classList.remove("active"));
    panels[target].classList.add("active");
  });
});

// ====== BOOKS ======
const booksList = document.getElementById("booksList");
const bookModalBackdrop = document.getElementById("bookModalBackdrop");
const addBookBtn = document.getElementById("addBookBtn");
const saveBookBtn = document.getElementById("saveBook");
const modalMsg = document.getElementById("modalMsg");

let books = [];

// load from backend
async function fetchBooks() {
  booksList.innerHTML = "<p class='empty-text'>Loading...</p>";
  try {
    const res = await fetch(`${API_BASE}/books`);
    if (!res.ok) throw new Error("not ok");
    const data = await res.json();
    books = data;
    renderBooks();
  } catch (err) {
    console.error(err);
    booksList.innerHTML = "<p class='empty-text'>Error loading books.</p>";
  }
}

function renderBooks() {
  booksList.innerHTML = "";
  if (!books || books.length === 0) {
    booksList.innerHTML = "<p class='empty-text'>No books yet.</p>";
    return;
  }

  books.forEach((book, idx) => {
    const row = document.createElement("div");
    row.className = "book-row";

    const index = document.createElement("div");
    index.className = "book-index";
    index.textContent = idx + 1;

    const title = document.createElement("div");
    title.className = "book-title";
    title.textContent = book.title;

    // editable status
    const statusSelect = document.createElement("select");
    statusSelect.className = "status-select";
    const options = ["To Read", "Reading", "Completed"];
    const current = book.status || "To Read";
    options.forEach((opt) => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      if (opt === current) o.selected = true;
      statusSelect.appendChild(o);
    });

    statusSelect.addEventListener("change", async (e) => {
      const newStatus = e.target.value;
      try {
        const res = await fetch(`${API_BASE}/books/${idx}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error("failed");
        // update local copy
        books[idx].status = newStatus;
      } catch (err) {
        console.error(err);
        alert("Failed to update status.");
        e.target.value = current;
      }
    });

    row.appendChild(index);
    row.appendChild(title);
    row.appendChild(statusSelect);
    booksList.appendChild(row);
  });
}

// open modal
addBookBtn.addEventListener("click", () => {
  bookModalBackdrop.classList.add("show");
  document.getElementById("bookTitle").value = "";
  document.getElementById("bookStatus").value = "To Read"; // default
  modalMsg.textContent = "";
});

// close modal
bookModalBackdrop.addEventListener("click", (e) => {
  if (e.target === bookModalBackdrop || e.target.matches("[data-close-book]")) {
    bookModalBackdrop.classList.remove("show");
  }
});

// save book -> POST to backend
saveBookBtn.addEventListener("click", async () => {
  const title = document.getElementById("bookTitle").value.trim();
  const status = document.getElementById("bookStatus").value;

  if (!title) {
    modalMsg.textContent = "Title required.";
    return;
  }

  modalMsg.textContent = "Saving...";
  try {
    const res = await fetch(`${API_BASE}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status }),
    });
    if (!res.ok) throw new Error("failed");
    await fetchBooks();
    bookModalBackdrop.classList.remove("show");
  } catch (err) {
    console.error(err);
    modalMsg.textContent = "Error saving to backend.";
  }
});

// initial load
fetchBooks();
