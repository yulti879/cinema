import { useState } from 'react';
import axios from 'axios';
import { AdminHall } from '../../../types/admin';
import { ConfigSection } from '../ConfigSection/ConfigSection';
import { ConfigButton } from '../ConfigButton/ConfigButton';
import { Popup } from '../Popup/Popup';
import { DeleteForm } from '../DeleteForm/DeleteForm';

interface HallManagementProps {
  isOpen: boolean;
  onToggle: () => void;
  halls: AdminHall[];
  onHallCreated: (hall: AdminHall) => void;
  onHallDeleted: (hallId: string) => void;
}

export const HallManagement: React.FC<HallManagementProps> = ({
  isOpen,
  onToggle,
  halls,
  onHallCreated,
  onHallDeleted,
}) => {
  const [isAddHallPopupOpen, setIsAddHallPopupOpen] = useState(false);
  const [newHallName, setNewHallName] = useState('');
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [hallToDelete, setHallToDelete] = useState<AdminHall | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Добавление зала
  const handleAddHall = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = newHallName.trim();

    // Валидация
    if (!name) {
      alert('Пожалуйста, введите название зала');
      return;
    }

    if (name.length < 2) {
      alert('Название зала должно быть минимум 2 символа');
      return;
    }

    // Проверяем, нет ли уже зала с таким названием
    const existingHall = halls.find(h =>
      h.name.toLowerCase() === name.toLowerCase()
    );

    if (existingHall) {
      alert(`Зал с названием "${name}" уже существует`);
      return;
    }

    setIsLoading(true);
    try {
      // Отправляем данные на сервер
      const response = await axios.post('/api/halls', {
        name: name,
        rows: 10,          // Дефолтное количество рядов
        seats_per_row: 8,  // Дефолтное количество мест в ряду
        standard_price: 0, // Цена по умолчанию для обычных мест
        vip_price: 0,      // Цена по умолчанию для VIP мест
        layout: null,      // Пустая схема (сгенерируется на бэкенде)
      });

      // Проверяем успешный ответ
      if (response.data && response.data.data) {
        const newHall = response.data.data;

        // Уведомляем родительский компонент
        onHallCreated(newHall);

        // Закрываем попап и сбрасываем форму
        setIsAddHallPopupOpen(false);
        setNewHallName('');        
      } else {
        throw new Error('Сервер вернул некорректные данные');
      }

    } catch (err: any) {
      console.error('Ошибка при создании зала:', err);

      // Детализированная обработка ошибок
      if (err.response) {
        // Ошибка от сервера
        const serverError = err.response.data;

        if (serverError.errors) {
          // Laravel валидационные ошибки
          const firstError = Object.values(serverError.errors)[0];
          alert(Array.isArray(firstError) ? firstError[0] : firstError);
        } else if (serverError.message) {
          // Сообщение об ошибке
          alert(serverError.message);
        } else {
          alert('Ошибка сервера при создании зала');
        }
      } else if (err.request) {
        // Нет ответа от сервера
        alert('Не удалось соединиться с сервером. Проверьте подключение.');
      } else {
        // Другая ошибка
        alert(err.message || 'Неизвестная ошибка при создании зала');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление зала
  const confirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hallToDelete) return;

    setIsLoading(true);
    try {
      await axios.delete(`/api/halls/${hallToDelete.id}`);
      onHallDeleted(hallToDelete.id);
      setIsDeletePopupOpen(false);
      setHallToDelete(null);
    } catch (err: any) {
      const error = err.response?.data?.error || 'Не удалось удалить зал';
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfigSection title="Управление залами" isOpen={isOpen} onToggle={onToggle}>
      {halls.length > 0 ? (
        <ul className="conf-step__list">
          {halls.map(hall => (
            <li key={hall.id}>
              {hall.name}
              <ConfigButton
                variant="trash"
                title="Удалить зал"
                onClick={() => {
                  setHallToDelete(hall);
                  setIsDeletePopupOpen(true);
                }}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="conf-step__paragraph" style={{ color: '#848484' }}>
          Нет созданных залов
        </p>
      )}

      <ConfigButton
        variant="accent"
        onClick={() => setIsAddHallPopupOpen(true)}
      >
        Создать зал
      </ConfigButton>

      {/* Попап добавления */}
      <Popup
        isOpen={isAddHallPopupOpen}
        onClose={() => {
          setIsAddHallPopupOpen(false);
          setNewHallName('');
        }}
        title="Добавление зала"
      >
        <form onSubmit={handleAddHall}>
          <label className="conf-step__label conf-step__label-fullsize">
            Название зала
            <input
              className="conf-step__input"
              type="text"
              placeholder="Например, «Зал 1»"
              value={newHallName}
              onChange={e => setNewHallName(e.target.value)}
              required
              autoFocus
            />
          </label>

          <div className="conf-step__buttons text-center">
            <ConfigButton variant="accent" type="submit">
              Добавить зал
            </ConfigButton>
            <ConfigButton
              variant="regular"
              type="button"
              onClick={() => {
                setIsAddHallPopupOpen(false);
                setNewHallName('');
              }}
            >
              Отменить
            </ConfigButton>
          </div>
        </form>
      </Popup>

      {/* Попап удаления */}
      <Popup
        isOpen={isDeletePopupOpen}
        onClose={() => {
          setIsDeletePopupOpen(false);
          setHallToDelete(null);
        }}
        title="Удаление зала"
      >
        <DeleteForm
          message="Вы действительно хотите удалить зал"
          itemName={hallToDelete?.name || ''}
          onSubmit={confirmDelete}
          onCancel={() => {
            setIsDeletePopupOpen(false);
            setHallToDelete(null);
          }}
        />
      </Popup>
    </ConfigSection>
  );
};