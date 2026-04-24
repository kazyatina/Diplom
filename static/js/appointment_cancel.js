document.addEventListener("DOMContentLoaded", () => {
  const cancelButtons = document.querySelectorAll('[data-bs-target="#cancelAppointmentModal"]');
  const confirmBtn = document.getElementById("confirmCancelBtn");
  const modalServiceTitle = document.getElementById("modalServiceTitle");
  let currentAppointmentId = null;

  if (!confirmBtn) {
    return;
  }

  cancelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentAppointmentId = button.getAttribute("data-appointment-id");
      const serviceTitle = button.getAttribute("data-service-title");
      if (modalServiceTitle) {
        modalServiceTitle.textContent = serviceTitle || "";
      }
    });
  });

  confirmBtn.addEventListener("click", async () => {
    if (!currentAppointmentId) {
      console.error("ID записи не определен");
      return;
    }

    try {
      const response = await fetch(`/api/${currentAppointmentId}/cancel/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")?.value || "",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const cancelButton = document.querySelector(`[data-appointment-id="${currentAppointmentId}"]`);
      const item = cancelButton ? cancelButton.closest(".list-group-item") : null;
      if (item) {
        const badge = item.querySelector(".text-end .status-badge");
        if (badge) {
          badge.textContent = "Отменено";
          badge.className = "status-badge status-cancelled";
        }
        cancelButton?.remove();
      }

      const modalElement = document.getElementById("cancelAppointmentModal");
      const modal = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;
      if (modal) {
        modal.hide();
      } else if (modalElement) {
        new bootstrap.Modal(modalElement).hide();
      }

      const successAlert = document.createElement("div");
      successAlert.className = "alert alert-success alert-dismissible fade show mt-3";
      successAlert.role = "alert";
      successAlert.innerHTML = `
        <strong>Успешно!</strong> Запись отменена.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      const container = document.querySelector(".container.mt-5.mb-5") || document.body;
      container.prepend(successAlert);
      setTimeout(() => successAlert.remove(), 3000);
    } catch (error) {
      console.error("Ошибка при отмене записи:", error);
      alert("Не удалось отменить запись. Попробуйте еще раз.");
    } finally {
      currentAppointmentId = null;
    }
  });
});