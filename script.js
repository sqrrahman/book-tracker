// ====== CONFIG ======
const API_BASE = "https://book-tracker-a70i.onrender.com";

const USER_COLORS = {
  A: "#fcbf49",
  N: "#4cc9f0",
};

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

// ====== RATE MODAL ELEMENTS ======
const rateModalBackdrop = document.getElementById("rateModalBackdrop");
const userCards = document.querySelectorAll(".user-card");
const ratingPentagons = document.getElementById("ratingPentagons");
const ratingInput = document.getElementById("ratingInput");
const cancelRateBtn = document.getElementById("cancelRateBtn");
const okRateBtn = document.getElementById("okRateBtn");
const rateMsg = document.getElementById("rateMsg");
const userCardRow = document.getElementById("userCardRow");

let currentBookIndex = null;
let selectedUser = null;
let selectedRating = 5;
let currentUserColor = USER_COLORS.A;

// build 10 pentagons (1..10)
function buildPentagons() {
  ratingPentagons.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    const p = document.createElement("div");
    p.className = "rating-penta";
    p.dataset.index = i;
    p.addEventListener("click", () => {
      // click on 7th → rating = 7.0
      setSelectedRating(i * 1.0);
    });
    ratingPentagons.appendChild(p);
  }
}

// set rating and repaint pentagons
function setSelectedRating(val) {
  // clamp & snap to 0.5
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
    p.style.setProperty("--penta-color", currentUserColor);
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

function renderRatingRow(label, val, color) {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.gap = "10px";

  const lbl = document.createElement("span");
  lbl.textContent = label + ":";
  lbl.style.color = color;
  lbl.style.minWidth = "24px";

  const dotsWrap = document.createElement("div");
  dotsWrap.style.display = "flex";
  dotsWrap.style.gap = "4px";

  const whole = Math.floor(val || 0);
  for (let i = 0; i < 10; i++) {
    const dot = document.createElement("div");
    dot.style.width = "12px";
    dot.style.height = "12px";
    dot.style.borderRadius = "4px";
    dot.style.background = i < whole ? color : "rgba(255,255,255,0.08)";
    dotsWrap.appendChild(dot);
  }

  wrap.appendChild(lbl);
  wrap.appendChild(dotsWrap);
  return wrap;
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

    // status select
    const statusSelect = document.createElement("select");
    statusSelect.className = "status-select";
    const options = ["To Read", "Reading", "Completed"];
    options.forEach((opt) => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      if ((book.status || "To Read") === opt) o.selected = true;
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
        books[idx].status = newStatus;
      } catch (err) {
        console.error(err);
        alert("Failed to update status.");
        e.target.value = book.status || "To Read";
      }
    });

    // rating block
    const ratingBlock = document.createElement("div");
    ratingBlock.style.display = "flex";
    ratingBlock.style.flexDirection = "column";
    ratingBlock.style.gap = "4px";
    ratingBlock.style.cursor = "pointer";

    const rA = book.ratings && typeof book.ratings.A !== "undefined" ? book.ratings.A : 0;
    const rN = book.ratings && typeof book.ratings.N !== "undefined" ? book.ratings.N : 0;

    ratingBlock.appendChild(renderRatingRow("A", rA, USER_COLORS.A));
    ratingBlock.appendChild(renderRatingRow("N", rN, USER_COLORS.N));

    ratingBlock.ondblclick = () => {
      openRateModal(idx);
    };

    row.appendChild(index);
    row.appendChild(title);
    row.appendChild(statusSelect);
    row.appendChild(ratingBlock);

    booksList.appendChild(row);
  });
}

// open add-book modal
addBookBtn.addEventListener("click", () => {
  bookModalBackdrop.classList.add("show");
  document.getElementById("bookTitle").value = "";
  document.getElementById("bookStatus").value = "To Read";
  modalMsg.textContent = "";
});

// close add-book modal
bookModalBackdrop.addEventListener("click", (e) => {
  if (e.target === bookModalBackdrop || e.target.matches("[data-close-book]")) {
    bookModalBackdrop.classList.remove("show");
  }
});

// save book
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

// ====== RATE MODAL LOGIC ======
function openRateModal(bookIndex) {
  currentBookIndex = bookIndex;
  selectedUser = null;
  selectedRating = 5;
  rateMsg.textContent = "";

  // reset cards
  userCards.forEach((c) => {
    c.classList.remove("active", "disabled");
  });

  // default color
  currentUserColor = USER_COLORS.A;
  setSelectedRating(5);

  rateModalBackdrop.classList.add("show");
}

// select user
userCards.forEach((card) => {
  card.addEventListener("click", () => {
    // activate this one
    selectedUser = card.dataset.user;
    currentUserColor = selectedUser === "A" ? USER_COLORS.A : USER_COLORS.N;

    userCards.forEach((c) => {
      if (c === card) {
        c.classList.add("active");
        c.classList.remove("disabled");
      } else {
        // keep space but disable
        c.classList.add("disabled");
        c.classList.remove("active");
      }
    });

    // repaint pentagons in this color
    setSelectedRating(selectedRating);
  });
});

ratingInput.addEventListener("input", () => {
  let val = Number(ratingInput.value);
  if (Number.isNaN(val)) return;
  // user can type 4.6 -> we round to 4.5
  val = Math.round(val * 2) / 2;
  setSelectedRating(val);
});

cancelRateBtn.addEventListener("click", () => {
  rateModalBackdrop.classList.remove("show");
});

rateModalBackdrop.addEventListener("click", (e) => {
  if (e.target === rateModalBackdrop) {
    rateModalBackdrop.classList.remove("show");
  }
});

okRateBtn.addEventListener("click", async () => {
  if (!selectedUser) {
    rateMsg.textContent = "Select user first.";
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/books/${currentBookIndex}/rating`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: selectedUser, rating: selectedRating }),
    });
    if (!res.ok) throw new Error("failed");
    await fetchBooks();
    rateModalBackdrop.classList.remove("show");
  } catch (err) {
    console.error(err);
    rateMsg.textContent = "Error saving rating.";
  }
});

// init
buildPentagons();
setSelectedRating(5);
fetchBooks();
