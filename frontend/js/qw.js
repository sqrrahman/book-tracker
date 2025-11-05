// frontend/js/qw.js
import { updateQw } from "./api.js";

let qwBackdrop,
  qwTitle,
  qwQuotesA,
  qwQuotesN,
  qwWordsA,
  qwWordsN,
  qwEditBtn,
  qwUserBackdrop,
  qwUserCards,
  qwUserCancelBtn,
  qwEditBackdrop,
  qwEditTitle,
  qwQuotesInputs,
  qwWordsInputs,
  qwEditCancelBtn,
  qwEditSaveBtn,
  qwEditMsg;

let getBooksFn = null;
let refreshBooksFn = null;

let currentBookIndex = null;
let currentQwUser = null;

export function initQw({ getBooks, refreshBooks }) {
  getBooksFn = getBooks;
  refreshBooksFn = refreshBooks;

  qwBackdrop = document.getElementById("qwBackdrop");
  qwTitle = document.getElementById("qwTitle");
  qwQuotesA = document.getElementById("qwQuotesA");
  qwQuotesN = document.getElementById("qwQuotesN");
  qwWordsA = document.getElementById("qwWordsA");
  qwWordsN = document.getElementById("qwWordsN");
  qwEditBtn = document.getElementById("qwEditBtn");

  qwUserBackdrop = document.getElementById("qwUserBackdrop");
  qwUserCards = qwUserBackdrop ? qwUserBackdrop.querySelectorAll("[data-qw-user]") : [];
  qwUserCancelBtn = document.getElementById("qwUserCancelBtn");

  qwEditBackdrop = document.getElementById("qwEditBackdrop");
  qwEditTitle = document.getElementById("qwEditTitle");
  qwQuotesInputs = document.getElementById("qwQuotesInputs");
  qwWordsInputs = document.getElementById("qwWordsInputs");
  qwEditCancelBtn = document.getElementById("qwEditCancelBtn");
  qwEditSaveBtn = document.getElementById("qwEditSaveBtn");
  qwEditMsg = document.getElementById("qwEditMsg");

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
      const books = getBooksFn ? getBooksFn() : [];
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
      focusFirstQwInput();
    });
  });

  qwEditSaveBtn?.addEventListener("click", saveQw);
}

export function openQwModal(bookIndex) {
  currentBookIndex = bookIndex;
  const books = getBooksFn ? getBooksFn() : [];
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

function buildQwInputs(container, count, existing) {
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const inp = document.createElement("input");
    inp.type = "text";
    inp.value = existing[i] || "";
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        focusNextQwInput(container, inp);
      }
    });
    container.appendChild(inp);
  }
}

function focusFirstQwInput() {
  const first = qwEditBackdrop?.querySelector("input");
  if (first) first.focus();
}

function focusNextQwInput(container, current) {
  const inputs = Array.from(container.querySelectorAll("input"));
  const idx = inputs.indexOf(current);
  if (idx >= 0 && idx < inputs.length - 1) {
    inputs[idx + 1].focus();
  } else {
    const all = Array.from(qwEditBackdrop.querySelectorAll("input"));
    const allIdx = all.indexOf(current);
    if (allIdx >= 0 && allIdx < all.length - 1) {
      all[allIdx + 1].focus();
    }
  }
}

async function saveQw() {
  const books = getBooksFn ? getBooksFn() : [];
  const book = books[currentBookIndex];
  if (!book) return;

  const quoteInputs = Array.from(qwQuotesInputs.querySelectorAll("input"));
  const wordInputs = Array.from(qwWordsInputs.querySelectorAll("input"));

  const quotes = quoteInputs.map((i) => i.value.trim()).filter((x) => x);
  const words = wordInputs.map((i) => i.value.trim()).filter((x) => x);

  try {
    await updateQw(currentBookIndex, currentQwUser, quotes, words);
    if (refreshBooksFn) await refreshBooksFn();
    openQwModal(currentBookIndex);
    qwEditBackdrop.classList.remove("show");
  } catch (e) {
    if (qwEditMsg) qwEditMsg.textContent = "Error saving.";
  }
}
