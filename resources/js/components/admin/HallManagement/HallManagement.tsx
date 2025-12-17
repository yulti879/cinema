import { useState } from 'react';
import axios from 'axios';
import { CinemaHall } from '../../../types';
import { ConfigSection } from '../ConfigSection/ConfigSection';
import { ConfigButton } from '../ConfigButton/ConfigButton';
import { Popup } from '../Popup/Popup';
import { DeleteForm } from '../DeleteForm/DeleteForm';
import './HallManagement.css';

interface HallManagementProps {
  isOpen: boolean;
  onToggle: () => void;
  halls: CinemaHall[];
  onHallCreated: (hall: CinemaHall) => void;
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
  const [hallToDelete, setHallToDelete] = useState<CinemaHall | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ----------------------------------
  // Добавление зала
  // ----------------------------------
  const handleAddHall = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = newHallName.trim();
    if (!name) {
      alert('Название зала не может быть пустым');
      return;
    }
    if (name.length < 2) {
      alert('Название зала должно быть минимум 2 символа');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/api/halls', {
        name,
        rows: 10,
        seatsPerRow: 8,
        standardPrice: 300,
        vipPrice: 500,
        layout: null,
      });
      
      const newHall: CinemaHall = res.data.data;
      onHallCreated(newHall);

      setIsAddHallPopupOpen(false);
      setNewHallName('');
    } catch (err: any) {
      console.error('Create hall error:', err.response?.data);

      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0] as string[];
        alert(firstError[0]);
      } else {
        alert('Не удалось создать зал');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAddHall = () => {
    setIsAddHallPopupOpen(false);
    setNewHallName('');
  };

  // ----------------------------------
  // Удаление зала
  // ----------------------------------
  const handleDeleteClick = (hall: CinemaHall) => {
    setHallToDelete(hall);
    setIsDeletePopupOpen(true);
  };

  const confirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hallToDelete) return;

    setIsLoading(true);
    try {
      await axios.delete(`/api/halls/${hallToDelete.id}`);
      onHallDeleted(hallToDelete.id);
      setIsDeletePopupOpen(false);
      setHallToDelete(null);
    } catch (err) {
      alert('Не удалось удалить зал. Попробуйте ещё раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setIsDeletePopupOpen(false);
    setHallToDelete(null);
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
                onClick={() => handleDeleteClick(hall)}
                disabled={isLoading}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p
          className="conf-step__paragraph"
          style={{ color: '#848484', fontStyle: 'italic' }}
        >
          Пока нет созданных залов. Нажмите «Создать зал», чтобы добавить первый зал.
        </p>
      )}

      <ConfigButton
        variant="accent"
        onClick={() => setIsAddHallPopupOpen(true)}
        disabled={isLoading}
      >
        Создать зал
      </ConfigButton>

      {/* Попап добавления */}
      <Popup
        isOpen={isAddHallPopupOpen}
        onClose={cancelAddHall}
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
              disabled={isLoading}
            />
          </label>

          <div className="conf-step__buttons text-center">
            <ConfigButton
              variant="accent"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Создание…' : 'Добавить зал'}
            </ConfigButton>

            <ConfigButton
              variant="regular"
              type="button"
              onClick={cancelAddHall}
              disabled={isLoading}
            >
              Отменить
            </ConfigButton>
          </div>
        </form>
      </Popup>

      {/* Попап удаления */}
      <Popup
        isOpen={isDeletePopupOpen}
        onClose={cancelDelete}
        title="Удаление зала"
      >
        <DeleteForm
          message="Вы действительно хотите удалить зал"
          itemName={hallToDelete?.name || ''}
          onSubmit={confirmDelete}
          onCancel={cancelDelete}
          submitText={isLoading ? 'Удаляем…' : 'Удалить'}
        />
      </Popup>      
    </ConfigSection>
  );
};