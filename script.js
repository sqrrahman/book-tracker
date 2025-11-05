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

// rating flow DOM
const rateUserBackdrop = document.getElementById("rateUserBackdrop");
const rateUserCards = rateUserBackdrop.querySelectorAll(".user-card");
const cancelRateUserBtn = document.getElementById("cancelRateUserBtn");
const rateUserMsg = document.getElementById("rateUserMsg");
const rateUserBookTitle = document.getElementById("rateUserBookTitle");

const rateValueBackdrop = document.getElementById("rateValueBackdrop");
const ratingPentagons = document.getElementById("ratingPentagons");
const ratingInput = document.getElementById("ratingInput");
const cancelRateBtn = document.getElementById("cancelRateBtn");
const okRateBtn = document.getElementById("okRateBtn");
const rateMsg = document.getElementById("rateMsg");
const rateForUser = document.getElementById("rateForUser");
const rateModalTitle = document.getElementById("rateModalTitle");

let books = [];

// state for rating
let currentBookIndex = null;
let selectedUser = null;
let selectedRating = 5;
let currentUserColor = USER_COLORS.A;

// build squares (10)
function buildPentagons() {
  ratingPentagons.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    const p = document.createElement("div");
    p.className = "rating-square";
    p.dataset.index = i;
    // single click -> full number
    p.addEventListener("click", () => {
      setSelectedRating(i);
    });
    // double click -> number - 0.5
    p.addEventListener("dblclick", () => {
      setSelectedRating(i - 0.5);
    });
    ratingPentagons.appendChild(p);
  }
}

function setSelectedRating(val) {
  // round to .5
  let v = Math.round(val * 2) / 2;
  if (v < 0) v = 0;
  if (v > 10) v = 10;
  selectedRating = v;
  ratingInput.value = v;

  const whole = Math.floor(v);
  const hasHalf = v - whole === 0.5;

  const shapes = ratingPentagons.querySelectorAll(".rating-square");
  shapes.forEach((p) => {
    const idx = Number(p.dataset.index);
    p.style.background = "rgba(255,255,255,0.04)";
    p.style.borderColor = "rgba(255,255,255,0.25)";

    if (idx <= whole) {
      p.style.background = currentUserColor;
      p.style.borderColor = currentUserColor;
    } else if (idx === whole + 1 && hasHalf) {
      p.style.background = `linear-gradient(135deg, ${currentUserColor} 50%, rgba(255,255,255,0.04) 50%)`;
      p.style.borderColor = currentUserColor;
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

  const value = Number(val) || 0;
  const whole = Math.floor(value);
  const hasHalf = value - whole === 0.5;

  for (let i = 0; i < 10; i++) {
    const d = document.createElement("div");
    d.className = "rating-small-square";
    if (i < whole) {
      d.style.background = color;
      d.style.borderColor = color;
    } else if (i === whole && hasHalf) {
      d.style.background = `linear-gradient(135deg, ${color} 50%, rgba(255,255,255,0.04) 50%)`;
      d.style.borderColor = color;
    } else {
      d.style.background = "rgba(255,255,255,0.04)";
      d.style.borderColor = "rgba(255,255,255,0.04)";
    }
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
  rateUserBookTitle.textContent = books[bookIndex]?.title || "Book";
  rateUserBackdrop.classList.add("show");
}

rateUserCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedUser = card.dataset.user;
    currentUserColor = USER_COLORS[selectedUser];
    rateUserCards.forEach((c) => c.classList.remove("active"));
    card.classList.add("active");
    rateUserBackdrop.classList.remove("show");

    rateForUser.textContent = `Rating for: ${selectedUser}`;

    // dynamic heading with actual title
    const btitle = books[currentBookIndex]?.title || "this book";
    rateModalTitle.innerHTML = `Rate this book <i>(${btitle})</i>`;

    // color OK button
    okRateBtn.style.background = currentUserColor;
    okRateBtn.style.color = selectedUser === "N" ? "#0f1534" : "#111827";

    // read existing value for this user/book
    const currentBook = books[currentBookIndex];
    const existing =
      currentBook && currentBook.ratings && currentBook.ratings[selectedUser] != null
        ? currentBook.ratings[selectedUser]
        : 0;

    setSelectedRating(existing);
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
