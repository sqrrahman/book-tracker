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
const ratingSection = document.getElementById("ratingSection");
const ratingDots = document.getElementById("ratingDots");
const ratingInput = document.getElementById("ratingInput");
const cancelRateBtn = document.getElementById("cancelRateBtn");
const okRateBtn = document.getElementById("okRateBtn");
const rateMsg = document.getElementById("rateMsg");

let currentBookIndex = null;
let selectedUser = null;
let selectedRating = 5;

function buildRatingDots() {
  ratingDots.innerHTML = "";
  const steps = [];
  for (let v = 0; v <= 10; v += 0.5) {
    steps.push(Number(v.toFixed(1)));
  }
  steps.forEach((val) => {
    const dot = document.createElement("div");
    dot.className = "rating-dot-pick";
    dot.dataset.value = val;
    dot.title = val.toString();
    dot.addEventListener("click", () => {
      setSelectedRating(val);
    });
    ratingDots.appendChild(dot);
  });
}

function setSelectedRating(val) {
  selectedRating = val;
  ratingInput.value = val;
  const dots = ratingDots.querySelectorAll(".rating-dot-pick");
  dots.forEach((d) => {
    const dv = Number(d.dataset.value);
    d.classList.toggle("active", dv === val);
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
  ratingSection.classList.add("hidden");
  okRateBtn.classList.add("hidden");
  userCards.forEach((c) => c.classList.remove("active"));
  setSelectedRating(5);
  rateModalBackdrop.classList.add("show");
}

userCards.forEach((card) => {
  card.addEventListener("click", () => {
    userCards.forEach((c) => c.classList.remove("active"));
    card.classList.add("active");
    selectedUser = card.dataset.user;
    ratingSection.classList.remove("hidden");
    okRateBtn.classList.remove("hidden");
  });
});

ratingInput.addEventListener("input", () => {
  let val = Number(ratingInput.value);
  if (Number.isNaN(val)) return;
  val = Math.round(val * 2) / 2;
  if (val < 0) val = 0;
  if (val > 10) val = 10;
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
  if (selectedUser === null) {
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

// init dots
buildRatingDots();

// initial load
fetchBooks();
