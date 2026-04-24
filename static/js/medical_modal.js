document.addEventListener('DOMContentLoaded', function() {
  const changePhotoBtn = document.querySelector('.btn-outline-primary.btn-sm');
  const avatarForm = document.getElementById('avatarForm');
  const avatarModalElement = document.getElementById('avatarModal');

  if (changePhotoBtn) {
    changePhotoBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const avatarModal = new bootstrap.Modal(avatarModalElement);
      avatarModal.show();
    });
  }

  if (!avatarForm) {
    return;
  }

  avatarForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const uploadUrl = this.getAttribute('action');
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    if (!uploadUrl) {
      alert('URL загрузки аватара не найден.');
      return;
    }

    try {
      console.log('Отправляем запрос на загрузку аватара...');
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': csrftoken,
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
      });

      console.log('Статус ответа:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка сервера:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Ответ сервера:', result);

      if (result.success) {
        const avatarImg = document.querySelector('.avatar-medium');
        if (avatarImg) {
          avatarImg.src = result.avatar_url + '?' + new Date().getTime();
        }
        if (
          typeof bootstrap !== 'undefined' &&
          bootstrap.Modal &&
          typeof bootstrap.Modal.getOrCreateInstance === 'function'
        ) {
          bootstrap.Modal.getOrCreateInstance(avatarModalElement).hide();
        } else if (typeof $ !== 'undefined' && typeof $.fn.modal === 'function') {
          $('#avatarModal').modal('hide');
        }
        alert('Аватар успешно обновлён!');
      } else {
        alert(`Ошибка: ${result.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Критическая ошибка:', error);
      alert('Произошла ошибка при загрузке. Проверьте консоль для деталей.');
    }
  });
});

    document.addEventListener('DOMContentLoaded', function() {
  const modalBody = document.getElementById('historyRecords');

  async function loadMedicalHistory() {
    try {
      // Показываем индикатор загрузки
      modalBody.innerHTML = '<tr><td colspan="3" class="text-center">Загрузка...</td></tr>';

      const medicalHistoryModal = document.getElementById('medicalHistoryModal');
      const historyUrl = medicalHistoryModal
        ? medicalHistoryModal.getAttribute('data-history-url')
        : null;

      if (!historyUrl) {
        throw new Error('URL медицинской истории не найден');
      }

      const response = await fetch(historyUrl, { credentials: 'same-origin' });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Очищаем список перед заполнением
      modalBody.innerHTML = '';

      if (data.records.length === 0) {
        modalBody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Записей не найдено</td></tr>';
        return;
      }

      // Заполняем таблицу данными
      data.records.forEach(record => {
        const row = `
          <tr>
            <td>${record.date}</td>
            <td>${record.service}</td>
            <td>${record.doctor}</td>
          </tr>
        `;
        modalBody.insertAdjacentHTML('beforeend', row);
      });
    } catch (error) {
      console.error('Ошибка загрузки медицинской истории:', error);
      modalBody.innerHTML = '<tr><td colspan="3" class="text-danger">Ошибка загрузки данных</td></tr>';
    }
  }

  // Получаем модальное окно Bootstrap
  const medicalHistoryModal = document.getElementById('medicalHistoryModal');
  if (medicalHistoryModal) {
    medicalHistoryModal.addEventListener('show.bs.modal', loadMedicalHistory);
  }
});
