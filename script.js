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
const rateUserBookTitle = document.getElementById("rateUserBookTitle");

const rateValueBackdrop = document.getElementById("rateValueBackdrop");
const ratingPentagons = document.getElementById("ratingPentagons");
const ratingInput = document.getElementById("ratingInput");
const cancelRateBtn = document.getElementById("cancelRateBtn");
const okRateBtn = document.getElementById("okRateBtn");
const rateMsg = document.getElementById("rateMsg");
const rateForUser = document.getElementById("rateForUser");
const rateModalTitle = document.getElementById("rateModalTitle");

// QW DOM
const qwBackdrop = document.getElementById("qwBackdrop");
const qwTitle = document.getElementById("qwTitle");
const qwQuotesA = document.getElementById("qwQuotesA");
const qwQuotesN = document.getElementById("qwQuotesN");
const qwWordsA = document.getElementById("qwWordsA");
const qwWordsN = document.getElementById("qwWordsN");
const qwEditBtn = document.getElementById("qwEditBtn");
const qwCloseBtn = document.getElementById("qwCloseBtn");

const qwUserBackdrop = document.getElementById("qwUserBackdrop");
const qwUserCards = qwUserBackdrop.querySelectorAll("[data-qw-user]");
const qwUserCancelBtn = document.getElementById("qwUserCancelBtn");

const qwEditBackdrop = document.getElementById("qwEditBackdrop");
const qwEditTitle = document.getElementById("qwEditTitle");
const qwQuotesInputs = document.getElementById("qwQuotesInputs");
const qwWordsInputs = document.getElementById("qwWordsInputs");
const qwEditCancelBtn = document.getElementById("qwEditCancelBtn");
const qwEditSaveBtn = document.getElementById("qwEditSaveBtn");
const qwEditMsg = document.getElementById("qwEditMsg");

let books = [];

let currentBookIndex = null;
let selectedUser = null;
let selectedRating = 5;
let currentUserColor = USER_COLORS.A;

// QW state
let currentQwUser = null;

// build squares (ratings)
function buildPentagons() {
  ratingPentagons.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    const sq = document.createElement("div");
    sq.className = "rating-square";
    sq.dataset.index = i;
    sq.addEventListener("click", () => setSelectedRating(i));
    sq.addEventListener("dblclick", () => setSelectedRating(i - 0.5));
    ratingPentagons.appendChild(sq);
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

  const squares = ratingPentagons.querySelectorAll(".rating-square");
  squares.forEach((sq) => {
    const idx = Number(sq.dataset.index);
    sq.style.background = "rgba(255,255,255,0.04)";
    sq.style.borderColor = "rgba(255,255,255,0.25)";
    if (idx <= whole) {
      sq.style.background = currentUserColor;
      sq.style.borderColor = currentUserColor;
    } else if (idx === whole + 1 && hasHalf) {
      // "\" diagonal
      sq.style.background = `linear-gradient(45deg, ${currentUserColor} 50%, rgba(255,255,255,0.04) 50%)`;
      sq.style.borderColor = currentUserColor;
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
      d.style.background = `linear-gradient(45deg, ${color} 50%, rgba(255,255,255,0.04) 50%)`;
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

    const quotesBtn = document.createElement("button");
    quotesBtn.className = "quotes-btn";
    quotesBtn.textContent = "Q";
    quotesBtn.addEventListener("click", () => openQwModal(idx));

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
    row.appendChild(quotesBtn);
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
    rateModalTitle.innerHTML = `Rate this book <i>(${books[currentBookIndex]?.title || "this book"})</i>`;
    okRateBtn.style.background = currentUserColor;
    okRateBtn.style.color = selectedUser === "N" ? "#0f1534" : "#111827";

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

ratingInput.addEventListener("change", () => {
  const val = Number(ratingInput.value);
  if (!Number.isNaN(val)) setSelectedRating(val);
});

cancelRateBtn.addEventListener("click", () => {
  rateValueBackdrop.classList.remove("show");
});

// close rating if outside
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

// QW VIEW
function openQwModal(bookIndex) {
  currentBookIndex = bookIndex;
  const book = books[bookIndex];
  qwTitle.textContent = `Quotes & Words – ${book?.title || ""}`;

  const qa = book?.quotes?.A || [];
  const qn = book?.quotes?.N || [];
  const wa = book?.words?.A || [];
  const wn = book?.words?.N || [];

  fillList(qwQuotesA, qa);
  fillList(qwQuotesN, qn);
  fillList(qwWordsA, wa);
  fillList(qwWordsN, wn);

  qwBackdrop.classList.add("show");
}

function fillList(ul, arr) {
  ul.innerHTML = "";
  if (!arr || !arr.length) {
    const li = document.createElement("li");
    li.textContent = "— empty —";
    ul.appendChild(li);
    return;
  }
  arr.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });
}

qwCloseBtn.addEventListener("click", () => {
  qwBackdrop.classList.remove("show");
});
qwBackdrop.addEventListener("click", (e) => {
  if (e.target === qwBackdrop) {
    qwBackdrop.classList.remove("show");
  }
});

// QW edit flow
qwEditBtn.addEventListener("click", () => {
  qwUserBackdrop.classList.add("show");
});

qwUserCancelBtn.addEventListener("click", () => {
  qwUserBackdrop.classList.remove("show");
});
qwUserBackdrop.addEventListener("click", (e) => {
  if (e.target === qwUserBackdrop) {
    qwUserBackdrop.classList.remove("show");
  }
});

qwEditCancelBtn.addEventListener("click", () => {
  qwEditBackdrop.classList.remove("show");
});
qwEditBackdrop.addEventListener("click", (e) => {
  if (e.target === qwEditBackdrop) {
    qwEditBackdrop.classList.remove("show");
  }
});

qwUserCards.forEach((card) => {
  card.addEventListener("click", () => {
    currentQwUser = card.dataset.qwUser;
    qwUserBackdrop.classList.remove("show");

    const book = books[currentBookIndex];
    const existingQuotes = (book?.quotes && book.quotes[currentQwUser]) || [];
    const existingWords = (book?.words && book.words[currentQwUser]) || [];

    buildQwInputs(qwQuotesInputs, 6, existingQuotes);
    buildQwInputs(qwWordsInputs, 9, existingWords);

    qwEditTitle.textContent = `Edit for ${currentQwUser} – ${book?.title || ""}`;
    qwEditMsg.textContent = "";
    qwEditBackdrop.classList.add("show");
  });
});

function buildQwInputs(container, count, existing) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const inp = document.createElement("input");
    inp.type = "text";
    inp.value = existing[i] || "";
    container.appendChild(inp);
  }
}

qwEditSaveBtn.addEventListener("click", async () => {
  const quoteInputs = Array.from(qwQuotesInputs.querySelectorAll("input"));
  const wordInputs = Array.from(qwWordsInputs.querySelectorAll("input"));
  const quotes = quoteInputs.map((i) => i.value.trim()).filter((x) => x.length);
  const words = wordInputs.map((i) => i.value.trim()).filter((x) => x.length);

  try {
    await fetch(`${API_BASE}/books/${currentBookIndex}/qw`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: currentQwUser,
        quotes,
        words,
      }),
    });
    await fetchBooks();
    // refresh view modal too
    openQwModal(currentBookIndex);
    qwEditBackdrop.classList.remove("show");
  } catch (err) {
    console.error(err);
    qwEditMsg.textContent = "Error saving.";
  }
});

// init
buildPentagons();
setSelectedRating(5);
fetchBooks();
