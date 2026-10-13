/**
 * Library Management System with Book Location Tracking
 * B.Tech 2nd Year CSE Mini Project - JSS Academy of Technical Education, Noida
 * Vanilla JavaScript implementation using LocalStorage
 */

// ==========================================
// 1. DEFAULT SAMPLE DATA
// ==========================================
const DEFAULT_BOOKS = [
  {
    id: "101",
    title: "Data Structures",
    author: "Reema Thareja",
    quantity: 3,
    available: 2,
    section: "CSE",
    rack: "Rack 4",
    shelf: "Shelf 2"
  },
  {
    id: "102",
    title: "Database Management Systems",
    author: "Korth & Silberschatz",
    quantity: 4,
    available: 4,
    section: "CSE",
    rack: "Rack 3",
    shelf: "Shelf 1"
  },
  {
    id: "103",
    title: "Operating System Concepts",
    author: "Galvin",
    quantity: 2,
    available: 1,
    section: "CSE",
    rack: "Rack 2",
    shelf: "Shelf 4"
  },
  {
    id: "104",
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    quantity: 3,
    available: 3,
    section: "CSE",
    rack: "Rack 5",
    shelf: "Shelf 3"
  },
  {
    id: "105",
    title: "Engineering Mathematics II",
    author: "B.S. Grewal",
    quantity: 5,
    available: 5,
    section: "General",
    rack: "Rack 1",
    shelf: "Shelf 2"
  }
];

const DEFAULT_MEMBERS = [
  { id: "201", name: "Aman Verma" },
  { id: "202", name: "Priya Singh" },
  { id: "203", name: "Rohan Gupta" },
  { id: "204", name: "Sneha Sharma" }
];

// Helper to format date as YYYY-MM-DD
function formatDateString(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Generate sample initial issued records (1 on-time, 1 overdue to demonstrate fine calculation)
function getInitialIssueRecords() {
  const today = new Date();
  
  // Issue 1: Issued 10 days ago (Within 14-day grace period)
  const issueDate1 = new Date(today);
  issueDate1.setDate(today.getDate() - 10);
  const dueDate1 = new Date(issueDate1);
  dueDate1.setDate(issueDate1.getDate() + 14);

  // Issue 2: Issued 18 days ago (4 days overdue, will incur 4 * Rs. 2 = Rs. 8 fine)
  const issueDate2 = new Date(today);
  issueDate2.setDate(today.getDate() - 18);
  const dueDate2 = new Date(issueDate2);
  dueDate2.setDate(issueDate2.getDate() + 14);

  return [
    {
      memberId: "201",
      bookId: "101",
      issueDate: formatDateString(issueDate1),
      dueDate: formatDateString(dueDate1)
    },
    {
      memberId: "202",
      bookId: "103",
      issueDate: formatDateString(issueDate2),
      dueDate: formatDateString(dueDate2)
    }
  ];
}

// ==========================================
// 2. LOCALSTORAGE STATE MANAGEMENT
// ==========================================
let books = [];
let members = [];
let issuedBooks = [];

function loadDataFromStorage() {
  const storedBooks = localStorage.getItem("lms_books");
  const storedMembers = localStorage.getItem("lms_members");
  const storedIssues = localStorage.getItem("lms_issued_books");

  if (storedBooks) {
    books = JSON.parse(storedBooks);
  } else {
    books = [...DEFAULT_BOOKS];
    saveBooks();
  }

  if (storedMembers) {
    members = JSON.parse(storedMembers);
  } else {
    members = [...DEFAULT_MEMBERS];
    saveMembers();
  }

  if (storedIssues) {
    issuedBooks = JSON.parse(storedIssues);
  } else {
    issuedBooks = getInitialIssueRecords();
    saveIssues();
  }
}

function saveBooks() {
  localStorage.setItem("lms_books", JSON.stringify(books));
}

function saveMembers() {
  localStorage.setItem("lms_members", JSON.stringify(members));
}

function saveIssues() {
  localStorage.setItem("lms_issued_books", JSON.stringify(issuedBooks));
}

function resetAllData() {
  if (confirm("Reset library database to original sample data? Any newly added records will be replaced.")) {
    books = JSON.parse(JSON.stringify(DEFAULT_BOOKS));
    members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
    issuedBooks = getInitialIssueRecords();
    saveBooks();
    saveMembers();
    saveIssues();
    updateDashboard();
    renderSearchTable();
    renderMembersTable();
    renderCurrentIssuesTables();
    showAlert("alert-dashboard", "System data has been successfully reset to sample records.", "success");
    navigateToSection("dashboard");
  }
}

// ==========================================
// 3. UI NAVIGATION (SIDEBAR & SECTIONS)
// ==========================================
function navigateToSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll(".content-section");
  for (let i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }

  // Show selected section
  const targetSection = document.getElementById("section-" + sectionId);
  if (targetSection) {
    targetSection.classList.add("active");
  }

  // Update active state in sidebar links
  const links = document.querySelectorAll(".nav-link");
  for (let j = 0; j < links.length; j++) {
    links[j].classList.remove("active");
    if (links[j].getAttribute("data-section") === sectionId) {
      links[j].classList.add("active");
    }
  }

  // Close mobile sidebar if open
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.remove("mobile-open");
  }

  // Refresh view specific data
  if (sectionId === "dashboard") {
    updateDashboard();
  } else if (sectionId === "search-book") {
    renderSearchTable();
  } else if (sectionId === "view-members") {
    renderMembersTable();
  } else if (sectionId === "issue-book" || sectionId === "return-book") {
    renderCurrentIssuesTables();
  }

  // Scroll to top of main content
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Display inline alerts (success, error, info)
function showAlert(alertElementId, message, type) {
  const alertEl = document.getElementById(alertElementId);
  if (!alertEl) return;

  alertEl.className = "alert alert-" + type + " show";
  alertEl.innerHTML = `<strong>${type === "success" ? "✓ Success:" : "⚠ Note:"}</strong> <span>${message}</span>`;
  
  // Auto-hide alert after 8 seconds if desired, or keep visible until next action
}

function clearAlert(alertElementId) {
  const alertEl = document.getElementById(alertElementId);
  if (alertEl) {
    alertEl.className = "alert";
    alertEl.innerHTML = "";
  }
}

// ==========================================
// 4. DASHBOARD LOGIC
// ==========================================
function updateDashboard() {
  const totalBooksCount = books.length;
  
  // Sum available copies and total stock
  let totalAvailableCopies = 0;
  let totalPhysicalCopies = 0;
  for (let i = 0; i < books.length; i++) {
    totalAvailableCopies += Number(books[i].available);
    totalPhysicalCopies += Number(books[i].quantity);
  }

  const registeredMembersCount = members.length;
  const currentlyIssuedCount = issuedBooks.length;

  // Update DOM elements
  document.getElementById("stat-total-books").textContent = totalBooksCount;
  document.getElementById("stat-total-copies-sub").textContent = `${totalPhysicalCopies} total physical copies`;
  
  document.getElementById("stat-available-copies").textContent = totalAvailableCopies;
  document.getElementById("stat-registered-members").textContent = registeredMembersCount;
  document.getElementById("stat-issued-books").textContent = currentlyIssuedCount;

  // Render recent issues table on dashboard
  renderDashboardRecentIssues();
}

function renderDashboardRecentIssues() {
  const tableBody = document.getElementById("dashboard-issues-table-body");
  if (!tableBody) return;

  if (issuedBooks.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="table-empty">No books are currently issued. All copies are safely in the racks.</td></tr>`;
    return;
  }

  let html = "";
  for (let i = 0; i < issuedBooks.length; i++) {
    const issue = issuedBooks[i];
    const member = members.find(m => m.id === issue.memberId);
    const book = books.find(b => b.id === issue.bookId);

    const memberName = member ? member.name : "Unknown Member";
    const bookTitle = book ? book.title : "Unknown Book";
    const bookLocation = book ? `Section ${book.section} > ${book.rack} > ${book.shelf}` : "N/A";

    html += `
      <tr>
        <td><strong>#${issue.bookId}</strong> - ${bookTitle}</td>
        <td><strong>#${issue.memberId}</strong> - ${memberName}</td>
        <td>${issue.issueDate}</td>
        <td><strong style="color: #0284c7;">${issue.dueDate}</strong></td>
        <td><span class="location-badge">📍 ${bookLocation}</span></td>
        <td>
          <button class="action-link-btn" onclick="quickFillReturn('${issue.memberId}', '${issue.bookId}')">
            Return Book
          </button>
        </td>
      </tr>
    `;
  }

  tableBody.innerHTML = html;
}

// ==========================================
// 5. ADD BOOK FEATURE
// ==========================================
function setupAddBookForm() {
  const form = document.getElementById("form-add-book");
  if (!form) return;

  // Real-time location preview update
  const sectionInput = document.getElementById("add-book-section");
  const rackInput = document.getElementById("add-book-rack");
  const shelfInput = document.getElementById("add-book-shelf");
  const previewVal = document.getElementById("add-location-preview-val");

  function updateLocationPreview() {
    const sec = sectionInput.value.trim() || "CSE";
    const rk = rackInput.value.trim() || "Rack 1";
    const sh = shelfInput.value.trim() || "Shelf 1";
    if (previewVal) {
      previewVal.textContent = `Section ${sec} > ${rk} > ${sh}`;
    }
  }

  sectionInput.addEventListener("input", updateLocationPreview);
  rackInput.addEventListener("input", updateLocationPreview);
  shelfInput.addEventListener("input", updateLocationPreview);

  form.addEventListener("submit", function(event) {
    event.preventDefault();
    clearAlert("alert-add-book");

    const bookId = document.getElementById("add-book-id").value.trim();
    const title = document.getElementById("add-book-title").value.trim();
    const author = document.getElementById("add-book-author").value.trim();
    const quantityStr = document.getElementById("add-book-quantity").value.trim();
    const section = sectionInput.value.trim();
    const rack = rackInput.value.trim();
    const shelf = shelfInput.value.trim();

    // 1. Validation for empty fields
    if (!bookId || !title || !author || !quantityStr || !section || !rack || !shelf) {
      showAlert("alert-add-book", "Please fill in all required fields.", "error");
      return;
    }

    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      showAlert("alert-add-book", "Quantity must be a positive number greater than 0.", "error");
      return;
    }

    // 2. Duplicate Book ID check
    const existingBook = books.find(b => b.id.toLowerCase() === bookId.toLowerCase());
    if (existingBook) {
      showAlert("alert-add-book", `A book with ID "${bookId}" already exists: "${existingBook.title}". Duplicate Book IDs are not permitted.`, "error");
      return;
    }

    // 3. Create and save new book object
    const newBook = {
      id: bookId,
      title: title,
      author: author,
      quantity: quantity,
      available: quantity, // initially all copies are available
      section: section,
      rack: rack,
      shelf: shelf
    };

    books.push(newBook);
    saveBooks();
    updateDashboard();

    // Show success message with location
    showAlert(
      "alert-add-book",
      `Book "${title}" (ID: ${bookId}) added successfully! Shelf location assigned: Section ${section} > ${rack} > ${shelf}.`,
      "success"
    );

    // Reset form and reset preview
    form.reset();
    updateLocationPreview();
  });
}

// ==========================================
// 6. SEARCH BOOK FEATURE
// ==========================================
function renderSearchTable(filteredBooks = null) {
  const tableBody = document.getElementById("search-results-table-body");
  const countSpan = document.getElementById("search-result-count");
  if (!tableBody) return;

  const dataset = filteredBooks !== null ? filteredBooks : books;

  if (countSpan) {
    countSpan.textContent = `Showing ${dataset.length} of ${books.length} book titles in library catalog.`;
  }

  if (dataset.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="table-empty">No books found matching the search criteria.</td></tr>`;
    return;
  }

  let html = "";
  for (let i = 0; i < dataset.length; i++) {
    const b = dataset[i];
    const isAvailable = b.available > 0;
    const stockBadge = isAvailable
      ? `<span class="badge-stock available">${b.available} Available</span>`
      : `<span class="badge-stock out-of-stock">0 Available (Issued)</span>`;

    html += `
      <tr>
        <td><strong>#${b.id}</strong></td>
        <td><strong>${b.title}</strong></td>
        <td>${b.author}</td>
        <td>${b.quantity} copies (${stockBadge})</td>
        <td>
          <span class="location-badge">
            📍 Section ${b.section} &gt; ${b.rack} &gt; ${b.shelf}
          </span>
        </td>
        <td>
          ${isAvailable 
            ? `<button class="action-link-btn" onclick="quickFillIssue('', '${b.id}')">Issue Book</button>`
            : `<span style="font-size: 12px; color: #94a3b8;">Out of stock</span>`
          }
        </td>
      </tr>
    `;
  }

  tableBody.innerHTML = html;
}

function setupSearchFilters() {
  const queryInput = document.getElementById("search-query-input");
  const sectionFilter = document.getElementById("search-section-filter");
  const searchBtn = document.getElementById("search-submit-btn");
  const clearBtn = document.getElementById("search-clear-btn");

  function executeSearch() {
    const query = queryInput.value.trim().toLowerCase();
    const section = sectionFilter.value;

    const filtered = books.filter(b => {
      const matchQuery =
        !query ||
        b.id.toLowerCase().includes(query) ||
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query);

      const matchSection = !section || b.section.toLowerCase() === section.toLowerCase();

      return matchQuery && matchSection;
    });

    renderSearchTable(filtered);
  }

  if (searchBtn) searchBtn.addEventListener("click", executeSearch);
  if (queryInput) queryInput.addEventListener("input", executeSearch);
  if (sectionFilter) sectionFilter.addEventListener("change", executeSearch);

  if (clearBtn) {
    clearBtn.addEventListener("click", function() {
      queryInput.value = "";
      sectionFilter.value = "";
      renderSearchTable();
    });
  }
}

// ==========================================
// 7. REGISTER MEMBER FEATURE
// ==========================================
function setupRegisterMemberForm() {
  const form = document.getElementById("form-register-member");
  if (!form) return;

  form.addEventListener("submit", function(event) {
    event.preventDefault();
    clearAlert("alert-register-member");

    const memberId = document.getElementById("member-id").value.trim();
    const memberName = document.getElementById("member-name").value.trim();

    // 1. Validation for empty inputs
    if (!memberId || !memberName) {
      showAlert("alert-register-member", "Please enter both Member ID and Full Name.", "error");
      return;
    }

    // 2. Prevent duplicate Member ID
    const existingMember = members.find(m => m.id.toLowerCase() === memberId.toLowerCase());
    if (existingMember) {
      showAlert(
        "alert-register-member",
        `A member with ID "${memberId}" is already registered (${existingMember.name}). Please use a unique Member ID.`,
        "error"
      );
      return;
    }

    // 3. Register and persist
    const newMember = {
      id: memberId,
      name: memberName
    };

    members.push(newMember);
    saveMembers();
    updateDashboard();

    showAlert(
      "alert-register-member",
      `Member "${memberName}" (ID: ${memberId}) registered successfully!`,
      "success"
    );

    form.reset();
  });
}

// ==========================================
// 8. VIEW MEMBERS FEATURE
// ==========================================
function renderMembersTable() {
  const tableBody = document.getElementById("members-table-body");
  const countSpan = document.getElementById("members-count-badge");
  if (!tableBody) return;

  if (countSpan) {
    countSpan.textContent = `Total Registered Members: ${members.length}`;
  }

  if (members.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="table-empty">No members registered yet.</td></tr>`;
    return;
  }

  let html = "";
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    
    // Find books currently issued to this member
    const memberIssues = issuedBooks.filter(issue => issue.memberId === m.id);
    let issuedBooksSummary = "None";

    if (memberIssues.length > 0) {
      const titles = memberIssues.map(issue => {
        const bk = books.find(b => b.id === issue.bookId);
        return bk ? `${bk.title} (#${bk.id})` : `#${issue.bookId}`;
      });
      issuedBooksSummary = titles.join(", ");
    }

    html += `
      <tr>
        <td><strong>#${m.id}</strong></td>
        <td><strong>${m.name}</strong></td>
        <td>
          <span style="font-weight: 700; color: ${memberIssues.length > 0 ? '#0284c7' : '#64748b'};">
            ${memberIssues.length} book(s)
          </span>
        </td>
        <td style="font-size: 13px;">${issuedBooksSummary}</td>
        <td>
          <button class="action-link-btn" onclick="quickFillIssue('${m.id}', '')">
            Issue to Member
          </button>
        </td>
      </tr>
    `;
  }

  tableBody.innerHTML = html;
}

// ==========================================
// 9. ISSUE BOOK FEATURE
// ==========================================
function setupIssueBookForm() {
  const form = document.getElementById("form-issue-book");
  if (!form) return;

  // Set default issue date to today
  const issueDateInput = document.getElementById("issue-date");
  if (issueDateInput && !issueDateInput.value) {
    issueDateInput.value = formatDateString(new Date());
  }

  // Helper inputs for live verification feedback
  const memberIdInput = document.getElementById("issue-member-id");
  const bookIdInput = document.getElementById("issue-book-id");
  const memberFeedback = document.getElementById("issue-member-preview");
  const bookFeedback = document.getElementById("issue-book-preview");

  function checkMemberPreview() {
    const mid = memberIdInput.value.trim();
    if (!mid) {
      memberFeedback.textContent = "";
      return;
    }
    const member = members.find(m => m.id === mid);
    if (member) {
      memberFeedback.innerHTML = `<span style="color: #15803d; font-weight: 600;">✓ ${member.name}</span>`;
    } else {
      memberFeedback.innerHTML = `<span style="color: #b91c1c;">✗ Member not registered</span>`;
    }
  }

  function checkBookPreview() {
    const bid = bookIdInput.value.trim();
    if (!bid) {
      bookFeedback.textContent = "";
      return;
    }
    const book = books.find(b => b.id === bid);
    if (book) {
      const stockColor = book.available > 0 ? "#15803d" : "#b91c1c";
      bookFeedback.innerHTML = `
        <span style="color: ${stockColor}; font-weight: 600;">
          ✓ ${book.title} (${book.available}/${book.quantity} copies available)
        </span>
      `;
    } else {
      bookFeedback.innerHTML = `<span style="color: #b91c1c;">✗ Book ID not found</span>`;
    }
  }

  memberIdInput.addEventListener("input", checkMemberPreview);
  bookIdInput.addEventListener("input", checkBookPreview);

  form.addEventListener("submit", function(event) {
    event.preventDefault();
    clearAlert("alert-issue-book");

    const memberId = memberIdInput.value.trim();
    const bookId = bookIdInput.value.trim();
    const issueDateVal = issueDateInput.value || formatDateString(new Date());

    // 1. Validate inputs
    if (!memberId || !bookId) {
      showAlert("alert-issue-book", "Please enter both Member ID and Book ID.", "error");
      return;
    }

    // 2. Validate member existence
    const member = members.find(m => m.id === memberId);
    if (!member) {
      showAlert("alert-issue-book", `Member ID "${memberId}" is not registered in the system. Please register the member first.`, "error");
      return;
    }

    // 3. Validate book existence
    const book = books.find(b => b.id === bookId);
    if (!book) {
      showAlert("alert-issue-book", `Book ID "${bookId}" not found in the catalog.`, "error");
      return;
    }

    // 4. Check available copies
    if (book.available <= 0) {
      showAlert("alert-issue-book", `Cannot issue "${book.title}". All ${book.quantity} copies are currently issued.`, "error");
      return;
    }

    // 5. Prevent the same member from issuing the same book twice
    const alreadyIssued = issuedBooks.some(
      issue => issue.memberId === memberId && issue.bookId === bookId
    );
    if (alreadyIssued) {
      showAlert(
        "alert-issue-book",
        `Member "${member.name}" (ID: ${memberId}) has already issued "${book.title}" (ID: ${bookId}). The same member cannot issue duplicate copies of the same book.`,
        "error"
      );
      return;
    }

    // 6. Calculate due date as 14 days after issue date
    const issueDateObj = new Date(issueDateVal);
    const dueDateObj = new Date(issueDateObj);
    dueDateObj.setDate(dueDateObj.getDate() + 14);
    const dueDateVal = formatDateString(dueDateObj);

    // 7. Deduct available copies
    book.available = book.available - 1;
    saveBooks();

    // 8. Record issue transaction
    issuedBooks.push({
      memberId: memberId,
      bookId: bookId,
      issueDate: issueDateVal,
      dueDate: dueDateVal
    });
    saveIssues();

    // 9. Update Dashboard and Views
    updateDashboard();
    renderCurrentIssuesTables();

    // 10. Success Message
    showAlert(
      "alert-issue-book",
      `Book "${book.title}" issued to ${member.name} (ID: ${memberId}). Due Date: ${dueDateVal} (14-day borrowing window). Available copies remaining: ${book.available}.`,
      "success"
    );

    form.reset();
    issueDateInput.value = formatDateString(new Date());
    checkMemberPreview();
    checkBookPreview();
  });
}

// ==========================================
// 10. RETURN BOOK FEATURE & GUIDED SHELVING
// ==========================================
function setupReturnBookForm() {
  const form = document.getElementById("form-return-book");
  if (!form) return;

  const returnDateInput = document.getElementById("return-date");
  if (returnDateInput && !returnDateInput.value) {
    returnDateInput.value = formatDateString(new Date());
  }

  form.addEventListener("submit", function(event) {
    event.preventDefault();
    clearAlert("alert-return-book");
    hideShelvingBanner();

    const memberId = document.getElementById("return-member-id").value.trim();
    const bookId = document.getElementById("return-book-id").value.trim();
    const returnDateVal = returnDateInput.value || formatDateString(new Date());

    // 1. Validate inputs
    if (!memberId || !bookId) {
      showAlert("alert-return-book", "Please enter both Member ID and Book ID.", "error");
      return;
    }

    // 2. Validate issue record
    const issueIndex = issuedBooks.findIndex(
      issue => issue.memberId === memberId && issue.bookId === bookId
    );

    if (issueIndex === -1) {
      showAlert(
        "alert-return-book",
        `No active issue record found for Member ID "${memberId}" and Book ID "${bookId}". Please verify the IDs from the Issued Books table below.`,
        "error"
      );
      return;
    }

    const issueRecord = issuedBooks[issueIndex];
    const book = books.find(b => b.id === bookId);
    const member = members.find(m => m.id === memberId);

    // 3. Calculate whole days kept
    const issueDate = new Date(issueRecord.issueDate);
    const returnDate = new Date(returnDateVal);
    
    // Difference in milliseconds converted to whole days
    const diffTime = returnDate.getTime() - issueDate.getTime();
    let daysKept = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (daysKept < 0) {
      daysKept = 0; // Return date earlier than issue date fallback
    }

    // 4. Fine Calculation:
    // Allow 14 days without a fine. Charge Rs. 2 per extra day.
    const GRACE_PERIOD = 14;
    const DAILY_FINE_RATE = 2; // Rs. 2 per overdue day
    let fine = 0;
    let overdueDays = 0;

    if (daysKept > GRACE_PERIOD) {
      overdueDays = daysKept - GRACE_PERIOD;
      fine = overdueDays * DAILY_FINE_RATE;
    }

    // 5. Increase available quantity
    if (book) {
      book.available = Math.min(book.quantity, book.available + 1);
      saveBooks();
    }

    // 6. Remove the issue record from active issues list
    issuedBooks.splice(issueIndex, 1);
    saveIssues();

    // 7. Update Dashboard and Views
    updateDashboard();
    renderCurrentIssuesTables();

    // 8. Display Success Alert
    showAlert(
      "alert-return-book",
      `Book "${book ? book.title : bookId}" returned successfully by ${member ? member.name : memberId}.`,
      "success"
    );

    // 9. Display Guided Shelving Message with Exact Book Location
    showShelvingInstruction(book, member, daysKept, overdueDays, fine);

    // Reset inputs
    document.getElementById("return-member-id").value = "";
    document.getElementById("return-book-id").value = "";
    returnDateInput.value = formatDateString(new Date());
  });
}

// Display Guided Shelving Box
function showShelvingInstruction(book, member, daysKept, overdueDays, fine) {
  const banner = document.getElementById("guided-shelving-banner");
  if (!banner) return;

  const shelvingText = document.getElementById("guided-shelving-path");
  const fineInfoBox = document.getElementById("guided-fine-details");
  const bookTitleSpan = document.getElementById("guided-book-title");

  const sectionName = book ? book.section : "CSE";
  const rackName = book ? book.rack : "Rack 1";
  const shelfName = book ? book.shelf : "Shelf 1";

  if (bookTitleSpan && book) {
    bookTitleSpan.textContent = `${book.title} (ID: ${book.id})`;
  }

  // Exact guided shelving message as requested:
  // "Place the book at: Section CSE > Rack 4 > Shelf 2"
  if (shelvingText) {
    shelvingText.textContent = `Place the book at: Section ${sectionName} > ${rackName} > ${shelfName}`;
  }

  // Fine information breakdown
  if (fineInfoBox) {
    if (fine > 0) {
      fineInfoBox.innerHTML = `
        <strong>Overdue Fine: Rs. ${fine}</strong><br>
        Days Kept: ${daysKept} days (Grace period: 14 days | Overdue: ${overdueDays} days @ Rs. 2/day).
      `;
      fineInfoBox.style.backgroundColor = "#fef2f2";
      fineInfoBox.style.color = "#991b1b";
      fineInfoBox.style.borderColor = "#fecaca";
    } else {
      fineInfoBox.innerHTML = `
        <strong>No Fine Applicable (Rs. 0)</strong><br>
        Returned within ${daysKept} days (Permitted borrowing window: 14 days).
      `;
      fineInfoBox.style.backgroundColor = "#ecfdf5";
      fineInfoBox.style.color = "#065f46";
      fineInfoBox.style.borderColor = "#a7f3d0";
    }
  }

  banner.classList.add("show");
  banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideShelvingBanner() {
  const banner = document.getElementById("guided-shelving-banner");
  if (banner) {
    banner.classList.remove("show");
  }
}

// ==========================================
// 11. SHARED TABLES & QUICK ACTIONS
// ==========================================
function renderCurrentIssuesTables() {
  const returnTableBody = document.getElementById("return-issues-table-body");
  const issueTableBody = document.getElementById("active-issues-table-body");

  function buildTableRows(isReturnSection = false) {
    if (issuedBooks.length === 0) {
      return `<tr><td colspan="7" class="table-empty">No books are currently issued.</td></tr>`;
    }

    let rows = "";
    for (let i = 0; i < issuedBooks.length; i++) {
      const issue = issuedBooks[i];
      const member = members.find(m => m.id === issue.memberId);
      const book = books.find(b => b.id === issue.bookId);

      const mName = member ? member.name : "N/A";
      const bTitle = book ? book.title : "N/A";
      const location = book ? `Section ${book.section} > ${book.rack} > ${book.shelf}` : "N/A";

      // Calculate days passed from issue date to today
      const today = new Date();
      const iDate = new Date(issue.issueDate);
      const daysPassed = Math.floor((today.getTime() - iDate.getTime()) / (1000 * 60 * 60 * 24));
      const isOverdue = daysPassed > 14;

      rows += `
        <tr>
          <td><strong>#${issue.bookId}</strong></td>
          <td>${bTitle}</td>
          <td><strong>#${issue.memberId}</strong> - ${mName}</td>
          <td>${issue.issueDate}</td>
          <td>
            <span style="font-weight: 700; color: ${isOverdue ? '#dc2626' : '#0284c7'};">
              ${issue.dueDate} ${isOverdue ? '⚠️ (Overdue)' : ''}
            </span>
          </td>
          <td><span class="location-badge">📍 ${location}</span></td>
          <td>
            <button class="action-link-btn" onclick="quickFillReturn('${issue.memberId}', '${issue.bookId}')">
              Select to Return
            </button>
          </td>
        </tr>
      `;
    }
    return rows;
  }

  if (returnTableBody) returnTableBody.innerHTML = buildTableRows(true);
  if (issueTableBody) issueTableBody.innerHTML = buildTableRows(false);
}

// Quick action to pre-fill Issue form
window.quickFillIssue = function(memberId, bookId) {
  navigateToSection("issue-book");
  if (memberId) {
    const mInput = document.getElementById("issue-member-id");
    if (mInput) {
      mInput.value = memberId;
      mInput.dispatchEvent(new Event("input"));
    }
  }
  if (bookId) {
    const bInput = document.getElementById("issue-book-id");
    if (bInput) {
      bInput.value = bookId;
      bInput.dispatchEvent(new Event("input"));
    }
  }
};

// Quick action to pre-fill Return form
window.quickFillReturn = function(memberId, bookId) {
  navigateToSection("return-book");
  const mInput = document.getElementById("return-member-id");
  const bInput = document.getElementById("return-book-id");
  if (mInput) mInput.value = memberId;
  if (bInput) bInput.value = bookId;
  window.scrollTo({ top: 300, behavior: "smooth" });
};

// ==========================================
// 12. MODAL & HELPER DIALOGS
// ==========================================
function setupAboutModal() {
  const modal = document.getElementById("about-project-modal");
  const openBtn = document.getElementById("btn-about-cpp");
  const closeBtn = document.getElementById("btn-close-modal");

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => modal.classList.add("show"));
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => modal.classList.remove("show"));
  }
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });
  }
}

// Mobile sidebar toggle
function setupMobileMenu() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const sidebar = document.getElementById("sidebar");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open");
    });
  }
}

// ==========================================
// 13. APP INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
  // 1. Load data
  loadDataFromStorage();

  // 2. Setup sidebar links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const target = this.getAttribute("data-section");
      navigateToSection(target);
    });
  });

  // 3. Quick action buttons on Dashboard
  const quickButtons = document.querySelectorAll(".quick-nav-btn");
  quickButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      const target = this.getAttribute("data-target");
      navigateToSection(target);
    });
  });

  // 4. Setup all forms and search filters
  setupAddBookForm();
  setupSearchFilters();
  setupRegisterMemberForm();
  setupIssueBookForm();
  setupReturnBookForm();
  setupAboutModal();
  setupMobileMenu();

  // 5. Reset button in header
  const resetBtn = document.getElementById("btn-reset-sample-data");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAllData);
  }

  // 6. Initial render
  updateDashboard();
  renderSearchTable();
  renderMembersTable();
  renderCurrentIssuesTables();
});
