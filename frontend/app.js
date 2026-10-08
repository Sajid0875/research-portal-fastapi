/**
 * Research Opportunity Portal - Vanilla JavaScript Client
 */

// Configuration: API base URL pointing to FastAPI backend
const API_BASE_URL = "http://127.0.0.1:8000/api/opportunities";

// Global In-Memory State
let opportunities = [];
let selectedOpportunity = null;
let opportunityToDelete = null;

// DOM Elements - Navigation & Filters
const opportunitiesList = document.getElementById("opportunities-list");
const loadingSpinner = document.getElementById("loading-spinner");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const btnOpenCreate = document.getElementById("btn-open-create");
const toastContainer = document.getElementById("toast-container");

// DOM Elements - Create/Edit Modal
const formModal = document.getElementById("form-modal");
const formModalTitle = document.getElementById("form-modal-title");
const opportunityForm = document.getElementById("opportunity-form");
const btnCloseForm = document.getElementById("btn-close-form");
const btnCancelForm = document.getElementById("btn-cancel-form");
const fieldId = document.getElementById("field-id");
const fieldTitle = document.getElementById("field-title");
const fieldFaculty = document.getElementById("field-faculty");
const fieldDepartment = document.getElementById("field-department");
const fieldArea = document.getElementById("field-area");
const fieldPositions = document.getElementById("field-positions");
const fieldStatus = document.getElementById("field-status");
const fieldDeadline = document.getElementById("field-deadline");
const fieldSkills = document.getElementById("field-skills");
const fieldDescription = document.getElementById("field-description");

// DOM Elements - Detail Modal
const detailModal = document.getElementById("detail-modal");
const btnCloseDetail = document.getElementById("btn-close-detail");
const detailBadge = document.getElementById("detail-badge");
const detailTitle = document.getElementById("detail-title");
const detailFaculty = document.getElementById("detail-faculty");
const detailDepartment = document.getElementById("detail-department");
const detailArea = document.getElementById("detail-area");
const detailPositions = document.getElementById("detail-positions");
const detailDeadline = document.getElementById("detail-deadline");
const detailId = document.getElementById("detail-id");
const detailSkills = document.getElementById("detail-skills");
const detailDescription = document.getElementById("detail-description");
const btnDetailClosePos = document.getElementById("btn-detail-close-pos");
const btnDetailEdit = document.getElementById("btn-detail-edit");
const btnDetailDelete = document.getElementById("btn-detail-delete");

// DOM Elements - Delete Confirmation Modal
const deleteModal = document.getElementById("delete-modal");
const btnCloseDelete = document.getElementById("btn-close-delete");
const btnCancelDelete = document.getElementById("btn-cancel-delete");
const btnConfirmDelete = document.getElementById("btn-confirm-delete");
const deleteTargetTitle = document.getElementById("delete-target-title");

// ============================================================
// Toast Notification System
// ============================================================
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button class="btn-close" style="font-size: 1.1rem;">&times;</button>
  `;

  toast.querySelector(".btn-close").addEventListener("click", () => {
    toast.remove();
  });

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

function parseApiError(errorData, status) {
  if (!errorData) return `Server returned error (${status})`;
  if (typeof errorData.detail === "string") return errorData.detail;
  if (Array.isArray(errorData.detail)) {
    return errorData.detail.map(e => e.msg || JSON.stringify(e)).join("; ");
  }
  return errorData.message || `Request failed with status ${status}`;
}

// ============================================================
// API Calls via fetch()
// ============================================================
async function fetchOpportunities() {
  setLoading(true);
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(parseApiError(errorData, response.status));
    }
    opportunities = await response.json();
    renderOpportunities();
  } catch (err) {
    console.error("Fetch error:", err);
    showToast(`Failed to load opportunities: ${err.message}`, "error");
    renderOpportunities();
  } finally {
    setLoading(false);
  }
}

async function fetchOpportunityById(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(parseApiError(errorData, response.status));
  }
  return await response.json();
}

async function createOpportunity(payload) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(parseApiError(errorData, response.status));
  }
  return await response.json();
}

async function updateOpportunity(id, payload) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(parseApiError(errorData, response.status));
  }
  return await response.json();
}

async function deleteOpportunity(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(parseApiError(errorData, response.status));
  }
  return await response.json();
}

// ============================================================
// UI Rendering & Filtering
// ============================================================
function renderOpportunities() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filtered = opportunities.filter((item) => {
    const matchesStatus = (selectedStatus === "ALL") || (item.status === selectedStatus);
    const matchesSearch = !searchTerm ||
      (item.title && item.title.toLowerCase().includes(searchTerm)) ||
      (item.faculty_name && item.faculty_name.toLowerCase().includes(searchTerm)) ||
      (item.department && item.department.toLowerCase().includes(searchTerm)) ||
      (item.research_area && item.research_area.toLowerCase().includes(searchTerm)) ||
      (item.required_skills && item.required_skills.toLowerCase().includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  opportunitiesList.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    filtered.forEach((opp) => {
      opportunitiesList.appendChild(buildOpportunityCard(opp));
    });
  }
}

function buildOpportunityCard(opp) {
  const card = document.createElement("article");
  card.className = "opportunity-card";
  card.dataset.id = opp.id;

  const isOpen = opp.status === "Open";
  const badgeClass = isOpen ? "badge-open" : "badge-closed";

  card.innerHTML = `
    <div>
      <div class="card-top">
        <span class="dept-badge" title="${escapeHtml(opp.department)}">${escapeHtml(opp.department)}</span>
        <span class="badge ${badgeClass}">${escapeHtml(opp.status)}</span>
      </div>
      <h3 class="card-title" title="Click to view full details">${escapeHtml(opp.title)}</h3>
      <p class="card-faculty-info">
        <span>👨‍🏫 ${escapeHtml(opp.faculty_name)}</span> &bull;
        <span>🔬 ${escapeHtml(opp.research_area)}</span>
      </p>
      <div class="card-meta-list">
        <span class="meta-chip">Positions: <strong>${opp.available_positions}</strong></span>
        <span class="meta-chip">Deadline: <strong>${opp.application_deadline}</strong></span>
      </div>
    </div>
    <div class="card-actions">
      <button class="btn btn-outline btn-sm action-view">Details</button>
      <div class="btn-group">
        <button class="btn btn-warning btn-sm action-close-pos" ${isOpen ? "" : "disabled"} title="${isOpen ? 'Close this opportunity' : 'Position is already closed'}">
          ${isOpen ? "Close" : "Closed"}
        </button>
        <button class="btn btn-secondary btn-sm action-edit">Edit</button>
        <button class="btn btn-danger btn-sm action-delete">Delete</button>
      </div>
    </div>
  `;

  // Attach card event listeners
  card.querySelector(".card-title").addEventListener("click", () => openDetailModal(opp.id));
  card.querySelector(".action-view").addEventListener("click", () => openDetailModal(opp.id));
  card.querySelector(".action-edit").addEventListener("click", () => openEditModal(opp));
  card.querySelector(".action-close-pos").addEventListener("click", () => closeOpportunityStatus(opp));
  card.querySelector(".action-delete").addEventListener("click", () => openDeleteModal(opp));

  return card;
}

function setLoading(isLoading) {
  if (isLoading) {
    loadingSpinner.classList.remove("hidden");
    emptyState.classList.add("hidden");
  } else {
    loadingSpinner.classList.add("hidden");
  }
}

// ============================================================
// Modal Handlers
// ============================================================
async function openDetailModal(id) {
  try {
    const opp = await fetchOpportunityById(id);
    selectedOpportunity = opp;

    detailTitle.textContent = opp.title;
    detailFaculty.textContent = opp.faculty_name;
    detailDepartment.textContent = opp.department;
    detailArea.textContent = opp.research_area;
    detailPositions.textContent = opp.available_positions;
    detailDeadline.textContent = opp.application_deadline;
    detailId.textContent = `#${opp.id}`;
    detailDescription.textContent = opp.description;

    const isOpen = opp.status === "Open";
    detailBadge.className = `badge ${isOpen ? "badge-open" : "badge-closed"}`;
    detailBadge.textContent = opp.status;

    // Disable/avoid Close button if already closed
    if (isOpen) {
      btnDetailClosePos.disabled = false;
      btnDetailClosePos.textContent = "Close Position";
      btnDetailClosePos.title = "Mark this opportunity as Closed";
    } else {
      btnDetailClosePos.disabled = true;
      btnDetailClosePos.textContent = "Position Closed";
      btnDetailClosePos.title = "This opportunity is already closed";
    }

    // Populate skills tags
    detailSkills.innerHTML = "";
    const skillsList = opp.required_skills.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    skillsList.forEach(skill => {
      const tag = document.createElement("span");
      tag.className = "skill-tag";
      tag.textContent = skill;
      detailSkills.appendChild(tag);
    });

    detailModal.classList.remove("hidden");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function closeDetailModal() {
  detailModal.classList.add("hidden");
  selectedOpportunity = null;
}

function openCreateModal() {
  clearValidationMessages();
  opportunityForm.reset();
  fieldId.value = "";
  formModalTitle.textContent = "Post New Research Opportunity";
  fieldStatus.value = "Open";
  fieldPositions.value = "1";

  // Set today as minimum deadline
  const today = new Date().toISOString().split("T")[0];
  fieldDeadline.min = today;
  fieldDeadline.value = today;

  formModal.classList.remove("hidden");
}

function openEditModal(opp) {
  clearValidationMessages();
  fieldDeadline.removeAttribute("min");
  fieldId.value = opp.id;
  formModalTitle.textContent = "Edit Research Opportunity";

  fieldTitle.value = opp.title;
  fieldFaculty.value = opp.faculty_name;
  fieldDepartment.value = opp.department;
  fieldArea.value = opp.research_area;
  fieldPositions.value = opp.available_positions;
  fieldStatus.value = opp.status;
  fieldDeadline.value = opp.application_deadline;
  fieldSkills.value = opp.required_skills;
  fieldDescription.value = opp.description;

  formModal.classList.remove("hidden");
}

function closeFormModal() {
  formModal.classList.add("hidden");
  fieldDeadline.removeAttribute("min");
  opportunityForm.reset();
  clearValidationMessages();
}

function openDeleteModal(opp) {
  opportunityToDelete = opp;
  deleteTargetTitle.textContent = opp.title;
  deleteModal.classList.remove("hidden");
}

function closeDeleteModal() {
  deleteModal.classList.add("hidden");
  opportunityToDelete = null;
}

// ============================================================
// Actions: Close Opportunity (Open -> Closed) & Delete
// ============================================================
async function closeOpportunityStatus(opp) {
  if (opp.status === "Closed") {
    showToast("This opportunity is already closed.", "warning");
    return;
  }

  const payload = {
    title: opp.title,
    faculty_name: opp.faculty_name,
    department: opp.department,
    research_area: opp.research_area,
    available_positions: opp.available_positions,
    status: "Closed",
    application_deadline: opp.application_deadline,
    required_skills: opp.required_skills,
    description: opp.description
  };

  try {
    const updated = await updateOpportunity(opp.id, payload);
    const index = opportunities.findIndex(o => o.id === opp.id);
    if (index !== -1) opportunities[index] = updated;

    if (selectedOpportunity && selectedOpportunity.id === opp.id && !detailModal.classList.contains("hidden")) {
      openDetailModal(opp.id);
    }

    renderOpportunities();
    showToast(`Opportunity #${opp.id} marked as Closed.`);
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function confirmDeleteOpportunity() {
  if (!opportunityToDelete) return;
  const id = opportunityToDelete.id;

  try {
    await deleteOpportunity(id);
    opportunities = opportunities.filter(o => o.id !== id);
    closeDeleteModal();

    if (selectedOpportunity && selectedOpportunity.id === id) {
      closeDetailModal();
    }

    renderOpportunities();
    showToast("Opportunity deleted successfully.");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ============================================================
// Form Validation & Submission
// ============================================================
function clearValidationMessages() {
  document.querySelectorAll(".validation-msg").forEach(el => el.textContent = "");
  document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
}

function setFieldValidation(inputEl, msgEl, message) {
  if (inputEl) inputEl.classList.add("invalid");
  if (msgEl) msgEl.textContent = message;
}

function validateForm() {
  clearValidationMessages();
  let isValid = true;

  const title = fieldTitle.value.trim();
  if (!title || title.length < 3) {
    setFieldValidation(fieldTitle, document.getElementById("msg-title"), "Title is required (min 3 characters).");
    isValid = false;
  }

  const faculty = fieldFaculty.value.trim();
  if (!faculty || faculty.length < 2) {
    setFieldValidation(fieldFaculty, document.getElementById("msg-faculty"), "Faculty advisor name is required.");
    isValid = false;
  }

  const dept = fieldDepartment.value.trim();
  if (!dept || dept.length < 2) {
    setFieldValidation(fieldDepartment, document.getElementById("msg-department"), "Department is required.");
    isValid = false;
  }

  const area = fieldArea.value.trim();
  if (!area || area.length < 2) {
    setFieldValidation(fieldArea, document.getElementById("msg-area"), "Research area is required.");
    isValid = false;
  }

  const positions = parseInt(fieldPositions.value, 10);
  if (isNaN(positions) || positions <= 0) {
    setFieldValidation(fieldPositions, document.getElementById("msg-positions"), "Positions must be a positive integer.");
    isValid = false;
  }

  const deadline = fieldDeadline.value.trim();
  if (!deadline) {
    setFieldValidation(fieldDeadline, document.getElementById("msg-deadline"), "Valid deadline date is required.");
    isValid = false;
  }

  const skills = fieldSkills.value.trim();
  if (!skills || skills.length < 2) {
    setFieldValidation(fieldSkills, document.getElementById("msg-skills"), "Required skills must be specified.");
    isValid = false;
  }

  const description = fieldDescription.value.trim();
  if (!description || description.length < 10) {
    setFieldValidation(fieldDescription, document.getElementById("msg-description"), "Description is required (min 10 characters).");
    isValid = false;
  }

  return isValid;
}

async function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    showToast("Please fix the validation errors in the form.", "error");
    return;
  }

  const btnSave = document.getElementById("btn-save-form");
  const originalText = btnSave.textContent;
  btnSave.disabled = true;
  btnSave.textContent = "Saving...";

  const id = fieldId.value;
  const payload = {
    title: fieldTitle.value.trim(),
    faculty_name: fieldFaculty.value.trim(),
    department: fieldDepartment.value.trim(),
    research_area: fieldArea.value.trim(),
    available_positions: parseInt(fieldPositions.value, 10),
    status: fieldStatus.value,
    application_deadline: fieldDeadline.value,
    required_skills: fieldSkills.value.trim(),
    description: fieldDescription.value.trim()
  };

  try {
    if (id) {
      // Edit existing
      const updated = await updateOpportunity(id, payload);
      const index = opportunities.findIndex(o => o.id === parseInt(id, 10));
      if (index !== -1) opportunities[index] = updated;
      showToast("Opportunity updated successfully.");
    } else {
      // Create new
      const created = await createOpportunity(payload);
      opportunities.unshift(created);
      showToast("Opportunity created successfully.");
    }

    closeFormModal();
    renderOpportunities();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btnSave.disabled = false;
    btnSave.textContent = originalText;
  }
}

// ============================================================
// Event Listeners Initialization
// ============================================================
function initEventListeners() {
  btnOpenCreate.addEventListener("click", openCreateModal);
  btnCloseForm.addEventListener("click", closeFormModal);
  btnCancelForm.addEventListener("click", closeFormModal);
  opportunityForm.addEventListener("submit", handleFormSubmit);

  searchInput.addEventListener("input", renderOpportunities);
  statusFilter.addEventListener("change", renderOpportunities);

  btnCloseDetail.addEventListener("click", closeDetailModal);
  btnDetailClosePos.addEventListener("click", () => {
    if (selectedOpportunity) closeOpportunityStatus(selectedOpportunity);
  });
  btnDetailEdit.addEventListener("click", () => {
    if (selectedOpportunity) {
      const opp = selectedOpportunity;
      closeDetailModal();
      openEditModal(opp);
    }
  });
  btnDetailDelete.addEventListener("click", () => {
    if (selectedOpportunity) {
      const opp = selectedOpportunity;
      closeDetailModal();
      openDeleteModal(opp);
    }
  });

  btnCloseDelete.addEventListener("click", closeDeleteModal);
  btnCancelDelete.addEventListener("click", closeDeleteModal);
  btnConfirmDelete.addEventListener("click", confirmDeleteOpportunity);

  // Close modals on clicking backdrop
  [formModal, detailModal, deleteModal].forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  });

  // ESC key closes modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      formModal.classList.add("hidden");
      detailModal.classList.add("hidden");
      deleteModal.classList.add("hidden");
    }
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Boot application
document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  fetchOpportunities();
});
