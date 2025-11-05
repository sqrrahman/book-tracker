// frontend/js/tx.js
import { updateTx } from "./api.js";

let getBooksFn = null;
let refreshBooksFn = null;

let txBackdrop,
  txTitle,
  txANotes,
  txAComments,
  txNNotes,
  txNComments,
  txEditBtn,
  txUserBackdrop,
  txUserCards,
  txUserCancelBtn,
  txEditBackdrop,
  txEditTitle,
  txNotesInput,
  txCommentsInput,
  txEditCancelBtn,
  txEditSaveBtn,
  txEditMsg;

let currentBookIndex = null;
let currentTxUser = null;

export function initTx({ getBooks, refreshBooks }) {
  getBooksFn = getBooks;
  refreshBooksFn = refreshBooks;

  txBackdrop = document.getElementById("txBackdrop");
  txTitle = document.getElementById("txTitle");
  txANotes = document.getElementById("txANotes");
  txAComments = document.getElementById("txAComments");
  txNNotes = document.getElementById("txNNotes");
  txNComments = document.getElementById("txNComments");
  txEditBtn = document.getElementById("txEditBtn");

  txUserBackdrop = document.getElementById("txUserBackdrop");
  txUserCards = txUserBackdrop ? txUserBackdrop.querySelectorAll("[data-tx-user]") : [];
  txUserCancelBtn = document.getElementById("txUserCancelBtn");

  txEditBackdrop = document.getElementById("txEditBackdrop");
  txEditTitle = document.getElementById("txEditTitle");
  txNotesInput = document.getElementById("txNotesInput");
  txCommentsInput = document.getElementById("txCommentsInput");
  txEditCancelBtn = document.getElementById("txEditCancelBtn");
  txEditSaveBtn = document.getElementById("txEditSaveBtn");
  txEditMsg = document.getElementById("txEditMsg");

  txBackdrop?.addEventListener("click", (e) => {
    if (e.target === txBackdrop) txBackdrop.classList.remove("show");
  });

  txEditBtn?.addEventListener("click", () => {
    txUserBackdrop?.classList.add("show");
  });

  txUserCancelBtn?.addEventListener("click", () => {
    txUserBackdrop.classList.remove("show");
  });

  txUserBackdrop?.addEventListener("click", (e) => {
    if (e.target === txUserBackdrop) txUserBackdrop.classList.remove("show");
  });

  txEditCancelBtn?.addEventListener("click", () => {
    txEditBackdrop.classList.remove("show");
  });

  txEditBackdrop?.addEventListener("click", (e) => {
    if (e.target === txEditBackdrop) txEditBackdrop.classList.remove("show");
  });

  txUserCards.forEach((card) => {
    card.addEventListener("click", () => {
      currentTxUser = card.dataset.txUser;
      txUserBackdrop.classList.remove("show");
      const books = getBooksFn ? getBooksFn() : [];
      const book = books[currentBookIndex];

      const texts = book?.texts?.[currentTxUser] || { notes: "", comments: "" };

      txNotesInput.value = texts.notes || "";
      txCommentsInput.value = texts.comments || "";

      if (txEditTitle) {
        txEditTitle.textContent = `Edit for ${currentTxUser} – ${book?.title || ""}`;
      }
      if (txEditMsg) txEditMsg.textContent = "";

      txEditBackdrop.classList.add("show");
      txNotesInput.focus();
    });
  });

  txEditSaveBtn?.addEventListener("click", saveTx);
}

export function openTxModal(bookIndex) {
  currentBookIndex = bookIndex;
  const books = getBooksFn ? getBooksFn() : [];
  const book = books[bookIndex];

  txTitle.textContent = `Texts – ${book?.title || ""}`;

  const aTexts = book?.texts?.A || { notes: "", comments: "" };
  const nTexts = book?.texts?.N || { notes: "", comments: "" };

  fillTxBox(txANotes, aTexts.notes);
  fillTxBox(txAComments, aTexts.comments);
  fillTxBox(txNNotes, nTexts.notes);
  fillTxBox(txNComments, nTexts.comments);

  txBackdrop.classList.add("show");
}

function fillTxBox(el, text) {
  if (!el) return;
  el.innerHTML = "";
  if (!text) {
    el.textContent = "— empty —";
  } else {
    // simple paragraph
    const p = document.createElement("p");
    p.textContent = text;
    el.appendChild(p);
  }
}

async function saveTx() {
  const books = getBooksFn ? getBooksFn() : [];
  const book = books[currentBookIndex];
  if (!book) return;

  const notes = txNotesInput.value.trim();
  const comments = txCommentsInput.value.trim();

  try {
    await updateTx(currentBookIndex, currentTxUser, notes, comments);
    if (refreshBooksFn) await refreshBooksFn();
    openTxModal(currentBookIndex);
    txEditBackdrop.classList.remove("show");
  } catch (e) {
    if (txEditMsg) txEditMsg.textContent = "Error saving.";
  }
}
