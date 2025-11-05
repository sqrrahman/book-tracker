// frontend/js/librarian.js
import { bulkAdd, bulkRemove, renameBook } from "./api.js";

let librarianBackdrop,
  libCloseBtn,
  libAddBtn,
  libRemoveBtn,
  libRenameBtn,
  libSortBtn,
  addBooksBackdrop,
  addBooksTextarea,
  addBooksCancel,
  addBooksSave,
  addBooksMsg,
  removeBooksBackdrop,
  removeBooksInput,
  removeBooksCancel,
  removeBooksNext,
  removeBooksMsg,
  confirmDeleteBackdrop,
  confirmDeleteList,
  confirmDeleteCancel,
  confirmDeleteConfirm,
  renameBackdrop,
  renameNumber,
  renameLoadBtn,
  renameEditSection,
  renameCurrentTitle,
  renameNewTitle,
  renameSaveBtn,
  renameCancelBtn,
  renameMsg,
  sortBackdrop,
  sortCloseBtn;

// NEW: sidebar elements
let burgerBtn,
  sidebar,
  sidebarOverlay,
  sidebarCloseBtn,
  sidebarShelfBtn,
  sidebarLibrarianBtn,
  sidebarAboutBtn;

let getBooksFn = null;
let refreshBooksFn = null;

export function initLibrarian({ getBooks, refreshBooks }) {
  getBooksFn = getBooks;
  refreshBooksFn = refreshBooks;

  librarianBackdrop = document.getElementById("librarianBackdrop");
  libCloseBtn = document.getElementById("libCloseBtn");
  libAddBtn = document.getElementById("libAddBtn");
  libRemoveBtn = document.getElementById("libRemoveBtn");
  libRenameBtn = document.getElementById("libRenameBtn");
  libSortBtn = document.getElementById("libSortBtn");

  // sidebar
  burgerBtn = document.getElementById("burgerBtn");
  sidebar = document.getElementById("sidebar");
  sidebarOverlay = document.getElementById("sidebarOverlay");
  sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
  sidebarShelfBtn = document.getElementById("sidebarShelfBtn");
  sidebarLibrarianBtn = document.getElementById("sidebarLibrarianBtn");
  sidebarAboutBtn = document.getElementById("sidebarAboutBtn");

  addBooksBackdrop = document.getElementById("addBooksBackdrop");
  addBooksTextarea = document.getElementById("addBooksTextarea");
  addBooksCancel = document.getElementById("addBooksCancel");
  addBooksSave = document.getElementById("addBooksSave");
  addBooksMsg = document.getElementById("addBooksMsg");

  removeBooksBackdrop = document.getElementById("removeBooksBackdrop");
  removeBooksInput = document.getElementById("removeBooksInput");
  removeBooksCancel = document.getElementById("removeBooksCancel");
  removeBooksNext = document.getElementById("removeBooksNext");
  removeBooksMsg = document.getElementById("removeBooksMsg");

  confirmDeleteBackdrop = document.getElementById("confirmDeleteBackdrop");
  confirmDeleteList = document.getElementById("confirmDeleteList");
  confirmDeleteCancel = document.getElementById("confirmDeleteCancel");
  confirmDeleteConfirm = document.getElementById("confirmDeleteConfirm");

  renameBackdrop = document.getElementById("renameBackdrop");
  renameNumber = document.getElementById("renameNumber");
  renameLoadBtn = document.getElementById("renameLoadBtn");
  renameEditSection = document.getElementById("renameEditSection");
  renameCurrentTitle = document.getElementById("renameCurrentTitle");
  renameNewTitle = document.getElementById("renameNewTitle");
  renameSaveBtn = document.getElementById("renameSaveBtn");
  renameCancelBtn = document.getElementById("renameCancelBtn");
  renameMsg = document.getElementById("renameMsg");

  sortBackdrop = document.getElementById("sortBackdrop");
  sortCloseBtn = document.getElementById("sortCloseBtn");

  // ===== SIDEBAR HANDLERS =====
  const openSidebar = () => {
    sidebar?.classList.add("show");
    sidebarOverlay?.classList.add("show");
  };
  const closeSidebar = () => {
    sidebar?.classList.remove("show");
    sidebarOverlay?.classList.remove("show");
  };

  burgerBtn?.addEventListener("click", openSidebar);
  sidebarCloseBtn?.addEventListener("click", closeSidebar);
  sidebarOverlay?.addEventListener("click", closeSidebar);

  // Shelf placeholder
  sidebarShelfBtn?.addEventListener("click", () => {
    // later you can open a shelf modal or panel
    closeSidebar();
  });

  // Librarian: open existing modal
  sidebarLibrarianBtn?.addEventListener("click", () => {
    closeSidebar();
    librarianBackdrop?.classList.add("show");
  });

  // About: go to about.html
  sidebarAboutBtn?.addEventListener("click", () => {
    window.location.href = "about.html";
  });

  // ====== EXISTING LIBRARIAN MODALS ======
  libCloseBtn?.addEventListener("click", () => librarianBackdrop.classList.remove("show"));
  librarianBackdrop?.addEventListener("click", (e) => {
    if (e.target === librarianBackdrop) librarianBackdrop.classList.remove("show");
  });

  // Add
  libAddBtn?.addEventListener("click", () => {
    librarianBackdrop.classList.remove("show");
    addBooksBackdrop.classList.add("show");
    addBooksTextarea.value = "";
    addBooksMsg.textContent = "";
  });
  addBooksCancel?.addEventListener("click", () => addBooksBackdrop.classList.remove("show"));
  addBooksBackdrop?.addEventListener("click", (e) => {
    if (e.target === addBooksBackdrop) addBooksBackdrop.classList.remove("show");
  });
  addBooksSave?.addEventListener("click", async () => {
    const lines = addBooksTextarea.value
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length);
    if (!lines.length) {
      addBooksMsg.textContent = "No valid titles entered.";
      return;
    }
    try {
      await bulkAdd(lines);
      if (refreshBooksFn) await refreshBooksFn();
      addBooksBackdrop.classList.remove("show");
    } catch (e) {
      addBooksMsg.textContent = "Error adding books.";
    }
  });

  // Remove
  libRemoveBtn?.addEventListener("click", () => {
    librarianBackdrop.classList.remove("show");
    removeBooksBackdrop.classList.add("show");
    removeBooksInput.value = "";
    removeBooksMsg.textContent = "";
  });
  removeBooksCancel?.addEventListener("click", () => removeBooksBackdrop.classList.remove("show"));
  removeBooksBackdrop?.addEventListener("click", (e) => {
    if (e.target === removeBooksBackdrop) removeBooksBackdrop.classList.remove("show");
  });
  removeBooksNext?.addEventListener("click", () => {
    const nums = removeBooksInput.value
      .split(",")
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n));
    if (!nums.length) {
      removeBooksMsg.textContent = "Enter valid numbers.";
      return;
    }
    confirmDeleteList.innerHTML = "";
    const books = getBooksFn ? getBooksFn() : [];
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
  confirmDeleteCancel?.addEventListener("click", () => confirmDeleteBackdrop.classList.remove("show"));
  confirmDeleteBackdrop?.addEventListener("click", (e) => {
    if (e.target === confirmDeleteBackdrop) confirmDeleteBackdrop.classList.remove("show");
  });
  confirmDeleteConfirm?.addEventListener("click", async () => {
    const nums = JSON.parse(confirmDeleteConfirm.dataset.nums || "[]");
    try {
      await bulkRemove(nums);
      if (refreshBooksFn) await refreshBooksFn();
      confirmDeleteBackdrop.classList.remove("show");
    } catch (e) {
      alert("Error deleting books.");
    }
  });

  // Rename
  libRenameBtn?.addEventListener("click", () => {
    librarianBackdrop.classList.remove("show");
    renameBackdrop.classList.add("show");
    renameEditSection.style.display = "none";
    renameMsg.textContent = "";
    renameNumber.value = "";
    renameNewTitle.value = "";
  });
  renameBackdrop?.addEventListener("click", (e) => {
    if (e.target === renameBackdrop) renameBackdrop.classList.remove("show");
  });
  renameLoadBtn?.addEventListener("click", () => {
    const num = parseInt(renameNumber.value, 10);
    const books = getBooksFn ? getBooksFn() : [];
    if (isNaN(num) || num < 1 || num > books.length) {
      renameMsg.textContent = "Invalid book number.";
      renameEditSection.style.display = "none";
      return;
    }
    const book = books[num - 1];
    renameCurrentTitle.textContent = `Current title: ${book.title}`;
    renameEditSection.style.display = "block";
  });
  renameCancelBtn?.addEventListener("click", () => renameBackdrop.classList.remove("show"));
  renameSaveBtn?.addEventListener("click", async () => {
    const num = parseInt(renameNumber.value, 10);
    const newTitle = renameNewTitle.value.trim();
    if (!newTitle) {
      renameMsg.textContent = "Enter new title.";
      return;
    }
    try {
      await renameBook(num - 1, newTitle);
      if (refreshBooksFn) await refreshBooksFn();
      renameBackdrop.classList.remove("show");
    } catch (e) {
      renameMsg.textContent = "Error renaming.";
    }
  });

  // Sort placeholder
  libSortBtn?.addEventListener("click", () => {
    librarianBackdrop.classList.remove("show");
    sortBackdrop.classList.add("show");
  });
  sortCloseBtn?.addEventListener("click", () => sortBackdrop.classList.remove("show"));
  sortBackdrop?.addEventListener("click", (e) => {
    if (e.target === sortBackdrop) sortBackdrop.classList.remove("show");
  });
}
