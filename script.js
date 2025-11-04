// ========== TABS ==========
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

// ========== BOOKS ==========
const booksList = document.getElementById("booksList");
const bookModalBackdrop = document.getElementById("bookModalBackdrop");
const addBookBtn = document.getElementById("addBookBtn");
const saveBookBtn = document.getElementById("saveBook");

function loadBooks() {
  const saved = localStorage.getItem("mylib_books");
  if (!saved) {
    // starter data
    return [
      { title: "The Feynman Lectures", status: "Reading", rating: 9 },
      { title: "Clean Code", status: "To Read", rating: 8 },
    ];
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
}

let books = loadBooks();

function saveBooks() {
  localStorage.setItem("mylib_books", JSON.stringify(books));
}

function renderBooks() {
  booksList.innerHTML = "";
  if (books.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-text";
    empty.textContent = "No books yet. Add your first one!";
    booksList.appendChild(empty);
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

    const status = document.createElement("select");
    status.className = "status-select";
    ["Reading", "Completed", "To Read"].forEach((opt) => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      if (book.status === opt) o.selected = true;
      status.appendChild(o);
    });
    status.addEventListener("change", (e) => {
      books[idx].status = e.target.value;
      saveBooks();
    });

    const rating = document.createElement("div");
    rating.className = "rating";
    const ratingVal = Number(book.rating) || 0;
    for (let i = 0; i < 10; i++) {
      const dot = document.createElement("div");
      dot.className = "rating-dot";
      if (i < ratingVal) dot.classList.add("filled");
      rating.appendChild(dot);
    }

    const actions = document.createElement("div");
    actions.className = "book-actions";

    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn delete";
    delBtn.innerHTML = "🗑";
    delBtn.title = "Delete";
    delBtn.addEventListener("click", () => {
      books.splice(idx, 1);
      saveBooks();
      renderBooks();
    });

    actions.appendChild(delBtn);

    row.appendChild(index);
    row.appendChild(title);
    row.appendChild(status);
    row.appendChild(rating);
    row.appendChild(actions);

    booksList.appendChild(row);
  });
}

addBookBtn.addEventListener("click", () => {
  bookModalBackdrop.classList.add("show");
  document.getElementById("bookTitle").value = "";
  document.getElementById("bookStatus").value = "Reading";
  document.getElementById("bookRating").value = "7";
});

saveBookBtn.addEventListener("click", () => {
  const title = document.getElementById("bookTitle").value.trim();
  const status = document.getElementById("bookStatus").value;
  const rating = document.getElementById("bookRating").value;
  if (!title) return;
  books.push({ title, status, rating: Number(rating) });
  saveBooks();
  renderBooks();
  bookModalBackdrop.classList.remove("show");
});

bookModalBackdrop.addEventListener("click", (e) => {
  if (e.target === bookModalBackdrop || e.target.matches("[data-close-book]")) {
    bookModalBackdrop.classList.remove("show");
  }
});

// ========== QUOTES ==========
const quotesList = document.getElementById("quotesList");
const quoteModalBackdrop = document.getElementById("quoteModalBackdrop");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const saveQuoteBtn = document.getElementById("saveQuote");

function loadQuotes() {
  const saved = localStorage.getItem("mylib_quotes");
  if (!saved) {
    return [
      { text: "What I cannot create, I do not understand.", source: "Feynman" },
    ];
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
}

let quotes = loadQuotes();

function saveQuotes() {
  localStorage.setItem("mylib_quotes", JSON.stringify(quotes));
}

function renderQuotes() {
  quotesList.innerHTML = "";
  if (quotes.length === 0) {
    const p = document.createElement("p");
    p.className = "empty-text";
    p.textContent = "No quotes yet. Add some you like.";
    quotesList.appendChild(p);
    return;
  }

  quotes.forEach((q, idx) => {
    const card = document.createElement("div");
    card.className = "quote-card";

    const text = document.createElement("div");
    text.className = "quote-text";
    text.textContent = q.text;

    const meta = document.createElement("div");
    meta.className = "quote-meta";

    const src = document.createElement("span");
    src.textContent = q.source ? q.source : "Unknown source";

    const del = document.createElement("button");
    del.className = "quote-delete";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      quotes.splice(idx, 1);
      saveQuotes();
      renderQuotes();
    });

    meta.appendChild(src);
    meta.appendChild(del);

    card.appendChild(text);
    card.appendChild(meta);

    quotesList.appendChild(card);
  });
}

addQuoteBtn.addEventListener("click", () => {
  quoteModalBackdrop.classList.add("show");
  document.getElementById("quoteText").value = "";
  document.getElementById("quoteSource").value = "";
});

saveQuoteBtn.addEventListener("click", () => {
  const text = document.getElementById("quoteText").value.trim();
  const source = document.getElementById("quoteSource").value.trim();
  if (!text) return;
  quotes.push({ text, source });
  saveQuotes();
  renderQuotes();
  quoteModalBackdrop.classList.remove("show");
});

quoteModalBackdrop.addEventListener("click", (e) => {
  if (e.target === quoteModalBackdrop || e.target.matches("[data-close-quote]")) {
    quoteModalBackdrop.classList.remove("show");
  }
});

// initial render
renderBooks();
renderQuotes();
