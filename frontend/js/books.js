// frontend/js/books.js
const USER_COLORS = { A: "#fcbf49", N: "#4cc9f0" };

let booksListEl = null;
let onRateCb = null;
let onQwCb = null;

export function initBooks({ onRate, onQw }) {
  booksListEl = document.getElementById("booksList");
  onRateCb = onRate;
  onQwCb = onQw;
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
    }
    dots.appendChild(d);
  }

  wrap.appendChild(lbl);
  wrap.appendChild(dots);
  return wrap;
}

export function renderBooks(books) {
  if (!booksListEl) return;
  booksListEl.innerHTML = "";
  if (!books.length) {
    booksListEl.innerHTML = "<p class='empty-text'>No books yet.</p>";
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
    ratingBlock.ondblclick = () => {
      if (onRateCb) onRateCb(idx);
    };

    const quotesBtn = document.createElement("button");
    quotesBtn.className = "quotes-btn";
    quotesBtn.textContent = "Q";
    quotesBtn.addEventListener("click", () => {
      if (onQwCb) onQwCb(idx);
    });

    row.appendChild(index);
    row.appendChild(title);
    row.appendChild(ratingBlock);
    row.appendChild(quotesBtn);

    booksListEl.appendChild(row);
  });
}
