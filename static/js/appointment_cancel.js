document.addEventListener('DOMContentLoaded', function() {
  const cancelButtons = document.querySelectorAll('[data-bs-target="#cancelAppointmentModal"]');
  const confirmBtn = document.getElementById('confirmCancelBtn');
  let currentAppointmentId = null;

  // Обработчик открытия модального окна
  cancelButtons.forEach(button => {
    button.addEventListener('click', function() {
      currentAppointmentId = this.getAttribute('data-appointment-id');
      const serviceTitle = this.getAttribute('data-service-title');
      document.getElementById('modalServiceTitle').textContent = serviceTitle;
    });
  });

  // Обработчик подтверждения отмены
  confirmBtn.addEventListener('click', async function() {
    if (!currentAppointmentId) {
      console.error('ID записи не определён');
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${currentAppointmentId}/cancel/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Получаем элемент записи
        const item = document.querySelector(`[data-appointment-id="${currentAppointmentId}"]`)
          .closest('.list-group-item');

        // Обновляем бейдж статуса
        const badge = item.querySelector('.text-end .status-badge');
        if (badge) {
          badge.textContent = 'Отменено';
          badge.className = 'status-badge status-cancelled';
        }

        // Скрываем кнопку отмены
        const cancelButton = item.querySelector('[data-appointment-id]');
        if (cancelButton) {
          cancelButton.remove();
        }

        // Закрываем модальное окно
        const modalElement = document.getElementById('cancelAppointmentModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        } else {
          // Если экземпляр модального окна не найден, используем метод hide напрямую
          const bootstrapModal = new bootstrap.Modal(modalElement);
          bootstrapModal.hide();
        }

        // Показываем уведомление об успехе
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success alert-dismissible fade show mt-3';
        successAlert.role = 'alert';
        successAlert.innerHTML = `
          <strong>Успешно!</strong>