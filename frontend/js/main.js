// frontend/js/main.js
import { getBooks } from "./api.js";
import { initBooks, renderBooks } from "./books.js";
import { initRating, openRateUserModal } from "./rating.js";
import { initQw, openQwModal } from "./qw.js";
import { initLibrarian } from "./librarian.js";

const tabs = document.querySelectorAll(".tab");
const panels = {
  books: document.getElementById("booksPanel"),
  quotes: document.getElementById("quotesPanel"),
};

let books = [];

function getBooksLocal() {
  return books;
}

async function refreshBooks() {
  const data = await getBooks();
  books = data;
  renderBooks(books);
}

function initTabs() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.tab;
      Object.values(panels).forEach((p) => p.classList.remove("active"));
      panels[target].classList.add("active");
    });
  });
}

async function init() {
  initTabs();

  initBooks({
    onRate: (idx) => openRateUserModal(idx),
    onQw: (idx) => openQwModal(idx),
  });

  initRating({
    getBooks: getBooksLocal,
    refreshBooks,
  });

  initQw({
    getBooks: getBooksLocal,
    refreshBooks,
  });

  initLibrarian({
    getBooks: getBooksLocal,
    refreshBooks,
  });

  await refreshBooks();
}

init();
