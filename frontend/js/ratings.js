// frontend/js/rating.js
import { updateRating } from "./api.js";

const USER_COLORS = { A: "#fcbf49", N: "#4cc9f0" };

let rateUserBackdrop,
  rateUserCards,
  cancelRateUserBtn,
  rateUserBookTitle,
  rateValueBackdrop,
  ratingPentagons,
  ratingInput,
  cancelRateBtn,
  okRateBtn,
  rateMsg,
  rateForUser,
  rateModalTitle;

let getBooksFn = null;
let refreshBooksFn = null;

let currentBookIndex = null;
let selectedUser = null;
let selectedRating = 5;
let currentUserColor = USER_COLORS.A;

export function initRating({ getBooks, refreshBooks }) {
  getBooksFn = getBooks;
  refreshBooksFn = refreshBooks;

  rateUserBackdrop = document.getElementById("rateUserBackdrop");
  rateUserCards = rateUserBackdrop ? rateUserBackdrop.querySelectorAll(".user-card") : [];
  cancelRateUserBtn = document.getElementById("cancelRateUserBtn");
  rateUserBookTitle = document.getElementById("rateUserBookTitle");

  rateValueBackdrop = document.getElementById("rateValueBackdrop");
  ratingPentagons = document.getElementById("ratingPentagons");
  ratingInput = document.getElementById("ratingInput");
  cancelRateBtn = document.getElementById("cancelRateBtn");
  okRateBtn = document.getElementById("okRateBtn");
  rateMsg = document.getElementById("rateMsg");
  rateForUser = document.getElementById("rateForUser");
  rateModalTitle = document.getElementById("rateModalTitle");

  buildPentagons();
  setSelectedRating(5);

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

  ratingInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      okRateBtn?.click();
    }
  });

  cancelRateBtn?.addEventListener("click", () => {
    rateValueBackdrop.classList.remove("show");
  });
  rateValueBackdrop?.addEventListener("click", (e) => {
    if (e.target === rateValueBackdrop) rateValueBackdrop.classList.remove("show");
  });

  okRateBtn?.addEventListener("click", saveRating);
}

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

export function openRateUserModal(bookIndex) {
  currentBookIndex = bookIndex;
  selectedUser = null;
  rateUserCards.forEach((c) => c.classList.remove("active"));
  const books = getBooksFn ? getBooksFn() : [];
  rateUserBookTitle.textContent = books[bookIndex]?.title || "Book";
  rateUserBackdrop.classList.add("show");

  rateUserCards.forEach((card) => {
    card.onclick = () => {
      selectedUser = card.dataset.user;
      currentUserColor = USER_COLORS[selectedUser];
      rateUserCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      rateUserBackdrop.classList.remove("show");

      const b = getBooksFn ? getBooksFn()[currentBookIndex] : null;
      const existing =
        b && b.ratings && b.ratings[selectedUser] != null ? b.ratings[selectedUser] : 0;

      if (rateForUser) rateForUser.textContent = `Rating for: ${selectedUser}`;
      if (rateModalTitle)
        rateModalTitle.innerHTML = `Rate this book <i>(${b?.title || "this book"})</i>`;
      if (okRateBtn) {
        okRateBtn.style.background = currentUserColor;
        okRateBtn.style.color = selectedUser === "N" ? "#0f1534" : "#111827";
      }

      setSelectedRating(existing);
      rateValueBackdrop.classList.add("show");
    };
  });
}

async function saveRating() {
  if (!selectedUser) {
    if (rateMsg) rateMsg.textContent = "Select user first.";
    return;
  }
  try {
    await updateRating(currentBookIndex, selectedUser, selectedRating);
    if (refreshBooksFn) await refreshBooksFn();
    rateValueBackdrop.classList.remove("show");
  } catch (e) {
    if (rateMsg) rateMsg.textContent = "Error saving rating.";
  }
}
