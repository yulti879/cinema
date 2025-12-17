import { useState, useRef } from 'react';
import { ConfigButton } from './ConfigButton/ConfigButton';
import { FormField } from './FormField/FormField';
import { Popup } from './Popup/Popup';
import type { Movie } from '../../types';

interface AddMoviePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onMovieAdded: (movie: Movie) => void;
}

export const AddMoviePopup: React.FC<AddMoviePopupProps> = ({ isOpen, onClose, onMovieAdded }) => {
  const [form, setForm] = useState({
    title: '',
    duration: '',
    synopsis: '',
    origin: '',
  });
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPosterFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.duration || !form.synopsis || !form.origin) {
      alert('Заполните все обязательные поля');
      return;
    }

    try {
      setIsUploading(true);

      const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('duration', form.duration);
      formData.append('synopsis', form.synopsis);
      formData.append('origin', form.origin);
      if (posterFile) {
        formData.append('poster', posterFile);
      }

      const response = await fetch('/api/movies', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
        },
        credentials: 'same-origin', // передаём куки
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении фильма');
      }

      const movie: Movie = await response.json();

      onMovieAdded(movie);
      setForm({ title: '', duration: '', synopsis: '', origin: '' });
      setPosterFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onClose();
    } catch (err) {
      console.error(err);
      alert('Не удалось добавить фильм');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Popup isOpen={isOpen} onClose={onClose} title="Добавление фильма">
      <form onSubmit={handleSubmit}>
        <FormField
          label="Название фильма"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <FormField
          label="Продолжительность фильма (мин.)"
          name="duration"
          type="number"
          value={form.duration}
          onChange={handleChange}
          required
        />
        <FormField
          label="Описание фильма"
          name="synopsis"
          type="textarea"
          value={form.synopsis}
          onChange={handleChange}
          required
        />
        <FormField
          label="Страна"
          name="origin"
          value={form.origin}
          onChange={handleChange}
          required
        />

        <div className="form-field">
          <label className="conf-step__label conf-step__label-fullsize">
            Постер (PNG, до 2 МБ)
            <input type="file" accept=".png" onChange={handleFileChange} ref={fileInputRef} />
          </label>
        </div>

        <div className="conf-step__buttons text-center">
          <ConfigButton variant="accent" type="submit" disabled={isUploading}>
            Добавить фильм
          </ConfigButton>
          <ConfigButton variant="regular" type="button" onClick={onClose}>
            Отменить
          </ConfigButton>
        </div>
      </form>
    </Popup>
  );
};