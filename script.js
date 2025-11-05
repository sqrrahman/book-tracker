// ===== CONFIG =====
const API_BASE = "https://book-tracker-a70i.onrender.com";
const USER_COLORS = { A: "#fcbf49", N: "#4cc9f0" };

// ===== TABS =====
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

// ===== BOOK DOM =====
const booksList = document.getElementById("booksList");

// ===== RATING DOM =====
const rateUserBackdrop = document.getElementById("rateUserBackdrop");
const rateUserCards = rateUserBackdrop ? rateUserBackdrop.querySelectorAll(".user-card") : [];
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

// ===== QW DOM =====
const qwBackdrop = document.getElementById("qwBackdrop");
const qwTitle = document.getElementById("qwTitle");
const qwQuotesA = document.getElementById("qwQuotesA");
const qwQuotesN = document.getElementById("qwQuotesN");
const qwWordsA = document.getElementById("qwWordsA");
const qwWordsN = document.getElementById("qwWordsN");
const qwEditBtn = document.getElementById("qwEditBtn");
const qwCloseBtn = document.getElementById("qwCloseBtn");

const qwUserBackdrop = document.getElementById("qwUserBackdrop");
const qwUserCards = qwUserBackdrop ? qwUserBackdrop.querySelectorAll("[data-qw-user]") : [];
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

// ===== BUILD RATING SQUARES =====
function buildPentagons() {
  if (!ratingPentagons) return;
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
  if (!ratingInput) return;
  let v = Math.round(val * 2) / 2;
  if (v < 0) v = 0;
  if (v > 10) v = 10;
  selectedRating = v;
  ratingInput.value = v;

  if (!ratingPentagons) return;
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
      sq.style.background = `linear-gradient(45deg, ${currentUserColor} 50%, rgba(255,255,255,0.04) 50%)`;
      sq.style.borderColor = currentUserColor;
    }
  });
}

// ===== FETCH BOOKS =====
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

// ===== RENDER BOOK LIST =====
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

    const quotesBtn = document.createElement("button");
    quotesBtn.className = "quotes-btn";
    quotesBtn.textContent = "Q";
    quotesBtn.addEventListener("click", () => openQwModal(idx));

    row.appendChild(index);
    row.appendChild(title);
    row.appendChild(ratingBlock);
    row.appendChild(quotesBtn);
    booksList.appendChild(row);
  });
}

// ===== RATING FLOW =====
function openRateUserModal(bookIndex) {
  if (!rateUserBackdrop) return;
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

    if (!rateForUser || !rateModalTitle || !okRateBtn) return;

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
    if (rateValueBackdrop) rateValueBackdrop.classList.add("show");
  });
});

cancelRateUserBtn?.addEventListener("click", () => {
  rateUserBackdrop.classList.remove("show");
});
rateUserBackdrop?.addEventListener("click", (e) => {
  if (e.target === rateUserBackdrop) rateUserBackdrop.classList.remove("show");
});
ratingInput?.addEventListener("change", () => {
  const val = Number(ratingInput.value);
  if (!Number.isNaN(val)) setSelectedRating(val);
});
cancelRateBtn?.addEventListener("click", () => {
  rateValueBackdrop.classList.remove("show");
});
rateValueBackdrop?.addEventListener("click", (e) => {
  if (e.target === rateValueBackdrop) rateValueBackdrop.classList.remove("show");
});
okRateBtn?.addEventListener("click", async () => {
  if (!selectedUser) {
    if (rateMsg) rateMsg.textContent = "Select user first.";
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
  } catch {
    if (rateMsg) rateMsg.textContent = "Error saving rating.";
  }
});

// ===== QW VIEW/EDIT =====
function openQwModal(bookIndex) {
  if (!qwBackdrop) return;
  currentBookIndex = bookIndex;
  const book = books[bookIndex];
  qwTitle.textContent = `Quotes & Words – ${book?.title || ""}`;
  fillList(qwQuotesA, book?.quotes?.A || []);
  fillList(qwQuotesN, book?.quotes?.N || []);
  fillList(qwWordsA, book?.words?.A || []);
  fillList(qwWordsN, book?.words?.N || []);
  qwBackdrop.classList.add("show");
}

function fillList(ul, arr) {
  if (!ul) return;
  ul.innerHTML = "";
  if (!arr?.length) {
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

qwCloseBtn?.addEventListener("click", () => qwBackdrop.classList.remove("show"));
qwBackdrop?.addEventListener("click", (e) => {
  if (e.target === qwBackdrop) qwBackdrop.classList.remove("show");
});

qwEditBtn?.addEventListener("click", () => qwUserBackdrop?.classList.add("show"));
qwUserCancelBtn?.addEventListener("click", () => qwUserBackdrop.classList.remove("show"));
qwUserBackdrop?.addEventListener("click", (e) => {
  if (e.target === qwUserBackdrop) qwUserBackdrop.classList.remove("show");
});

qwEditCancelBtn?.addEventListener("click", () => qwEditBackdrop.classList.remove("show"));
qwEditBackdrop?.addEventListener("click", (e) => {
  if (e.target === qwEditBackdrop) qwEditBackdrop.classList.remove("show");
});

qwUserCards.forEach((card) => {
  card.addEventListener("click", () => {
    currentQwUser = card.dataset.qwUser;
    qwUserBackdrop.classList.remove("show");
    const book = books[currentBookIndex];
    const existingQuotes = book?.quotes?.[currentQwUser] || [];
    const existingWords = book?.words?.[currentQwUser] || [];
    buildQwInputs(qwQuotesInputs, 6, existingQuotes);
    buildQwInputs(qwWordsInputs, 9, existingWords);
    if (qwEditTitle) {
      qwEditTitle.textContent = `Edit for ${currentQwUser} – ${book?.title || ""}`;
    }
    if (qwEditMsg) qwEditMsg.textContent = "";
    qwEditBackdrop.classList.add("show");
  });
});

function buildQwInputs(container, count, existing) {
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const inp = document.createElement("input");
    inp.type = "text";
    inp.value = existing[i] || "";
    container.appendChild(inp);
  }
}

qwEditSaveBtn?.addEventListener("click", async () => {
  if (!qwQuotesInputs || !qwWordsInputs) return;
  const quoteInputs = Array.from(qwQuotesInputs.querySelectorAll("input"));
  const wordInputs = Array.from(qwWordsInputs.querySelectorAll("input"));
  const quotes = quoteInputs.map((i) => i.value.trim()).filter((x) => x);
  const words = wordInputs.map((i) => i.value.trim()).filter((x) => x);
  try {
    await fetch(`${API_BASE}/books/${currentBookIndex}/qw`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: currentQwUser, quotes, words }),
    });
    await fetchBooks();
    openQwModal(currentBookIndex);
    qwEditBackdrop.classList.remove("show");
  } catch {
    if (qwEditMsg) qwEditMsg.textContent = "Error saving.";
  }
});

// ===== INIT =====
if (ratingPentagons) {
  buildPentagons();
  setSelectedRating(5);
}
fetchBooks();

// ====================================================
// === LIBRARIAN MODALS AND FUNCTIONS (new section) ===
// ====================================================
const librarianBackdrop = document.getElementById("librarianBackdrop");
const burgerBtn = document.getElementById("burgerBtn");
const libCloseBtn = document.getElementById("libCloseBtn");
const libAddBtn = document.getElementById("libAddBtn");
const libRemoveBtn = document.getElementById("libRemoveBtn");
const libRenameBtn = document.getElementById("libRenameBtn");
const libSortBtn = document.getElementById("libSortBtn");

const addBooksBackdrop = document.getElementById("addBooksBackdrop");
const addBooksTextarea = document.getElementById("addBooksTextarea");
const addBooksCancel = document.getElementById("addBooksCancel");
const addBooksSave = document.getElementById("addBooksSave");
const addBooksMsg = document.getElementById("addBooksMsg");

const removeBooksBackdrop = document.getElementById("removeBooksBackdrop");
const removeBooksInput = document.getElementById("removeBooksInput");
const removeBooksCancel = document.getElementById("removeBooksCancel");
const removeBooksNext = document.getElementById("removeBooksNext");
const removeBooksMsg = document.getElementById("removeBooksMsg");

const confirmDeleteBackdrop = document.getElementById("confirmDeleteBackdrop");
const confirmDeleteList = document.getElementById("confirmDeleteList");
const confirmDeleteCancel = document.getElementById("confirmDeleteCancel");
const confirmDeleteConfirm = document.getElementById("confirmDeleteConfirm");

const renameBackdrop = document.getElementById("renameBackdrop");
const renameNumber = document.getElementById("renameNumber");
const renameLoadBtn = document.getElementById("renameLoadBtn");
const renameEditSection = document.getElementById("renameEditSection");
const renameCurrentTitle = document.getElementById("renameCurrentTitle");
const renameNewTitle = document.getElementById("renameNewTitle");
const renameSaveBtn = document.getElementById("renameSaveBtn");
const renameCancelBtn = document.getElementById("renameCancelBtn");
const renameMsg = document.getElementById("renameMsg");

const sortBackdrop = document.getElementById("sortBackdrop");
const sortCloseBtn = document.getElementById("sortCloseBtn");

// === Open Librarian ===
burgerBtn.addEventListener("click", () => librarianBackdrop.classList.add("show"));
libCloseBtn.addEventListener("click", () => librarianBackdrop.classList.remove("show"));
librarianBackdrop.addEventListener("click", (e) => {
  if (e.target === librarianBackdrop) librarianBackdrop.classList.remove("show");
});

// === Add Books ===
libAddBtn.addEventListener("click", () => {
  librarianBackdrop.classList.remove("show");
  addBooksBackdrop.classList.add("show");
  addBooksTextarea.value = "";
  addBooksMsg.textContent = "";
});
addBooksCancel.addEventListener("click", () => addBooksBackdrop.classList.remove("show"));
addBooksBackdrop.addEventListener("click", (e) => {
  if (e.target === addBooksBackdrop) addBooksBackdrop.classList.remove("show");
});
addBooksSave.addEventListener("click", async () => {
  const lines = addBooksTextarea.value
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length);
  if (!lines.length) {
    addBooksMsg.textContent = "No valid titles entered.";
    return;
  }
  try {
    await fetch(`${API_BASE}/books/bulk-add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titles: lines }),
    });
    await fetchBooks();
    addBooksBackdrop.classList.remove("show");
  } catch {
    addBooksMsg.textContent = "Error adding books.";
  }
});

// === Remove Books ===
libRemoveBtn.addEventListener("click", () => {
  librarianBackdrop.classList.remove("show");
  removeBooksBackdrop.classList.add("show");
  removeBooksInput.value = "";
  removeBooksMsg.textContent = "";
});
removeBooksCancel.addEventListener("click", () => removeBooksBackdrop.classList.remove("show"));
removeBooksBackdrop.addEventListener("click", (e) => {
  if (e.target === removeBooksBackdrop) removeBooksBackdrop.classList.remove("show");
});
removeBooksNext.addEventListener("click", () => {
  const nums = removeBooksInput.value
    .split(",")
    .map((n) => parseInt(n.trim(), 10))
    .filter((n) => !isNaN(n));
  if (!nums.length) {
    removeBooksMsg.textContent = "Enter valid numbers.";
    return;
  }
  confirmDeleteList.innerHTML = "";
  nums.forEach((n) => {
    const b = books[n - 1];
    const li = document.createElement("li");
    li.textContent = b ? `${n}. ${b.title}` : `${n}. (not found)`;
    confirmDeleteList.appendChild(li);
  });
  removeBooksBackdrop.classList.remove("show");
  confirmDeleteBackdrop.classList.add("show");
  confirmDeleteConfirm.dataset.nums = JSON.stringify(nums);
});
confirmDeleteCancel.addEventListener("click", () => confirmDeleteBackdrop.classList.remove("show"));
confirmDeleteBackdrop.addEventListener("click", (e) => {
  if (e.target === confirmDeleteBackdrop) confirmDeleteBackdrop.classList.remove("show");
});
confirmDeleteConfirm.addEventListener("click", async () => {
  const nums = JSON.parse(confirmDeleteConfirm.dataset.nums || "[]");
  try {
    await fetch(`${API_BASE}/books/bulk-remove`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indexes: nums }),
    });
    await fetchBooks();
    confirmDeleteBackdrop.classList.remove("show");
  } catch {
    alert("Error deleting books.");
  }
});

// === Rename ===
libRenameBtn.addEventListener("click", () => {
  librarianBackdrop.classList.remove("show");
  renameBackdrop.classList.add("show");
  renameEditSection.style.display = "none";
  renameMsg.textContent = "";
  renameNumber.value = "";
  renameNewTitle.value = "";
});
renameBackdrop.addEventListener("click", (e) => {
  if (e.target === renameBackdrop) renameBackdrop.classList.remove("show");
});
renameLoadBtn.addEventListener("click", () => {
  const num = parseInt(renameNumber.value, 10);
  if (isNaN(num) || num < 1 || num > books.length) {
    renameMsg.textContent = "Invalid book number.";
    renameEditSection.style.display = "none";
    return;
  }
  const book = books[num - 1];
  renameCurrentTitle.textContent = `Current title: ${book.title}`;
  renameEditSection.style.display = "block";
});
renameCancelBtn.addEventListener("click", () => renameBackdrop.classList.remove("show"));
renameSaveBtn.addEventListener("click", async () => {
  const num = parseInt(renameNumber.value, 10);
  const newTitle = renameNewTitle.value.trim();
  if (!newTitle) {
    renameMsg.textContent = "Enter new title.";
    return;
  }
  try {
    await fetch(`${API_BASE}/books/rename`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: num - 1, newTitle }),
    });
    await fetchBooks();
    renameBackdrop.classList.remove("show");
  } catch {
    renameMsg.textContent = "Error renaming.";
  }
});

// === Sort Placeholder ===
libSortBtn.addEventListener("click", () => {
  librarianBackdrop.classList.remove("show");
  sortBackdrop.classList.add("show");
});
sortCloseBtn.addEventListener("click", () => sortBackdrop.classList.remove("show"));
sortBackdrop.addEventListener("click", (e) => {
  if (e.target === sortBackdrop) sortBackdrop.classList.remove("show");
});
