document.addEventListener('DOMContentLoaded', function() {
  const changePhotoBtn = document.querySelector('.btn-outline-primary.btn-sm');

  if (changePhotoBtn) {
    changePhotoBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const avatarModal = new bootstrap.Modal(document.getElementById('avatarModal'));
      avatarModal.show();
    });
  }

  document.getElementById('avatarForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    // Добавляем CSRF‑токен вручную
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    formData.append('csrfmiddlewaretoken', csrftoken);

    try {
      console.log('Отправляем запрос на загрузку аватара...');
      const response = await fetch('{% url "accounts:update_avatar" %}', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
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
        const avatarModal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
        avatarModal.hide();
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

      const response = await fetch('/api/medical-history/');

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
