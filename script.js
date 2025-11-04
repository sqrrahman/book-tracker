// ===== CONFIG =====
const API_BASE = "https://book-tracker-a70i.onrender.com";
const USER_COLORS = { A: "#fcbf49", N: "#4cc9f0" };

// tabs
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

// book DOM
const booksList = document.getElementById("booksList");
const addBookBtn = document.getElementById("addBookBtn");
const bookModalBackdrop = document.getElementById("bookModalBackdrop");
const saveBookBtn = document.getElementById("saveBook");
const modalMsg = document.getElementById("modalMsg");

let books = [];

// rating flow DOM
const rateUserBackdrop = document.getElementById("rateUserBackdrop");
const rateUserCards = rateUserBackdrop.querySelectorAll(".user-card");
const cancelRateUserBtn = document.getElementById("cancelRateUserBtn");
const rateUserMsg = document.getElementById("rateUserMsg");

const rateValueBackdrop = document.getElementById("rateValueBackdrop");
const ratingPentagons = document.getElementById("ratingPentagons");
const ratingInput = document.getElementById("ratingInput");
const cancelRateBtn = document.getElementById("cancelRateBtn");
const okRateBtn = document.getElementById("okRateBtn");
const rateMsg = document.getElementById("rateMsg");
const rateForUser = document.getElementById("rateForUser");

let currentBookIndex = null;
let selectedUser = null;
let selectedRating = 5;
let currentUserColor = USER_COLORS.A;

// build pentagons
function buildPentagons() {
  ratingPentagons.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    const p = document.createElement("div");
    p.className = "rating-penta";
    p.dataset.index = i;
    p.addEventListener("click", () => {
      setSelectedRating(i);
    });
    ratingPentagons.appendChild(p);
  }
}

function setSelectedRating(val) {
  let v = Math.round(val * 2) / 2;
  if (v < 0) v = 0;
  if (v > 10) v = 10;
  selectedRating = v;
  ratingInput.value = v;

  const whole = Math.floor(v);
  const hasHalf = v - whole === 0.5;

  const pentas = ratingPentagons.querySelectorAll(".rating-penta");
  pentas.forEach((p) => {
    const idx = Number(p.dataset.index);
    p.classList.remove("filled", "outline");
    if (idx <= whole) {
      p.classList.add("filled");
      p.style.background = currentUserColor;
      p.style.borderColor = currentUserColor;
    } else if (idx === whole + 1 && hasHalf) {
      p.classList.add("outline");
      p.style.borderColor = currentUserColor;
    } else {
      p.style.background = "rgba(255,255,255,0.04)";
      p.style.borderColor = "rgba(255,255,255,0.25)";
    }
  });
}

// fetch books
async function fetchBooks() {
  booksList.innerHTML = "<p class='empty-text'>Loading...</p>";
  try {
    const res = await fetch(`${API_BASE}/books`);
    const data = await res.json();
    books = data;
    renderBooks();
  } catch (err) {
    console.error(err);
    booksList.innerHTML = "<p class='empty-text'>Error loading books.</p>";
  }
}

function renderRatingRow(label, val, color) {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.gap = "10px";
  wrap.style.alignItems = "center";
  const lbl = document.createElement("span");
  lbl.textContent = label + ":";
  lbl.style.color = color;
  const dots = document.createElement("div");
  dots.style.display = "flex";
  dots.style.gap = "4px";
  const whole = Math.floor(val || 0);
  for (let i = 0; i < 10; i++) {
    const d = document.createElement("div");
    d.style.width = "12px";
    d.style.height = "12px";
    d.style.borderRadius = "4px";
    d.style.background = i < whole ? color : "rgba(255,255,255,0.08)";
    dots.appendChild(d);
  }
  wrap.appendChild(lbl);
  wrap.appendChild(dots);
  return wrap;
}

function renderBooks() {
  booksList.innerHTML = "";
  if (!books.length) {
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

    const statusSelect = document.createElement("select");
    statusSelect.className = "status-select";
    ["To Read", "Reading", "Completed"].forEach((opt) => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      if ((book.status || "To Read") === opt) o.selected = true;
      statusSelect.appendChild(o);
    });
    statusSelect.addEventListener("change", async (e) => {
      const newStatus = e.target.value;
      try {
        await fetch(`${API_BASE}/books/${idx}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err) {
        console.error(err);
      }
    });

    const ratingBlock = document.createElement("div");
    ratingBlock.style.display = "flex";
    ratingBlock.style.flexDirection = "column";
    ratingBlock.style.gap = "4px";
    ratingBlock.style.cursor = "pointer";

    const rA = book.ratings?.A ?? 0;
    const rN = book.ratings?.N ?? 0;
    ratingBlock.appendChild(renderRatingRow("A", rA, USER_COLORS.A));
    ratingBlock.appendChild(renderRatingRow("N", rN, USER_COLORS.N));

    ratingBlock.ondblclick = () => openRateUserModal(idx);

    row.appendChild(index);
    row.appendChild(title);
    row.appendChild(statusSelect);
    row.appendChild(ratingBlock);
    booksList.appendChild(row);
  });
}

// add-book modal
addBookBtn.addEventListener("click", () => {
  bookModalBackdrop.classList.add("show");
  document.getElementById("bookTitle").value = "";
  document.getElementById("bookStatus").value = "To Read";
  modalMsg.textContent = "";
});
bookModalBackdrop.addEventListener("click", (e) => {
  if (e.target === bookModalBackdrop || e.target.matches("[data-close-book]")) {
    bookModalBackdrop.classList.remove("show");
  }
});
saveBookBtn.addEventListener("click", async () => {
  const title = document.getElementById("bookTitle").value.trim();
  const status = document.getElementById("bookStatus").value;
  if (!title) {
    modalMsg.textContent = "Title required.";
    return;
  }
  try {
    await fetch(`${API_BASE}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status }),
    });
    await fetchBooks();
    bookModalBackdrop.classList.remove("show");
  } catch (err) {
    console.error(err);
    modalMsg.textContent = "Error saving to backend.";
  }
});

// rating flow
function openRateUserModal(bookIndex) {
  currentBookIndex = bookIndex;
  selectedUser = null;
  rateUserMsg.textContent = "";
  rateUserCards.forEach((c) => c.classList.remove("active"));
  rateUserBackdrop.classList.add("show");
}

rateUserCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedUser = card.dataset.user;
    currentUserColor = USER_COLORS[selectedUser];
    rateUserBackdrop.classList.remove("show");

    rateForUser.textContent = `Rating for: ${selectedUser}`;
    rateMsg.textContent = "";
    setSelectedRating(5);
    rateValueBackdrop.classList.add("show");
  });
});

cancelRateUserBtn.addEventListener("click", () => {
  rateUserBackdrop.classList.remove("show");
});

ratingInput.addEventListener("input", () => {
  const val = Number(ratingInput.value);
  if (!Number.isNaN(val)) {
    setSelectedRating(val);
  }
});

cancelRateBtn.addEventListener("click", () => {
  rateValueBackdrop.classList.remove("show");
});

rateValueBackdrop.addEventListener("click", (e) => {
  if (e.target === rateValueBackdrop) {
    rateValueBackdrop.classList.remove("show");
  }
});

okRateBtn.addEventListener("click", async () => {
  if (!selectedUser) {
    rateMsg.textContent = "Select user first.";
    return;
  }
  try {
    await fetch(`${API_BASE}/books/${currentBookIndex}/rating`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: selectedUser, rating: selectedRating }),
    });
    await fetchBooks();
    rateValueBackdrop.classList.remove("show");
  } catch (err) {
    console.error(err);
    rateMsg.textContent = "Error saving rating.";
  }
});

// init
buildPentagons();
setSelectedRating(5);
fetchBooks();
