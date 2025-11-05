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
