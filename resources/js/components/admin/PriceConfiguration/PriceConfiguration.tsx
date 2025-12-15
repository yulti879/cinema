import { useState, useEffect } from 'react';
import axios from 'axios';
import { CinemaHall, PriceData } from '../../../types';
import { ConfigSection } from '../ConfigSection/ConfigSection';
import { ConfigButton } from '../ConfigButton/ConfigButton';
import { FormField } from '../FormField/FormField';
import { Popup } from '../Popup/Popup';
import './PriceConfiguration.css';

interface PriceConfigurationProps {
  isOpen: boolean;
  onToggle: () => void;
  halls: CinemaHall[];
  onPricesSaved: (prices: PriceData) => void;
}

export const PriceConfiguration: React.FC<PriceConfigurationProps> = ({
  isOpen,
  onToggle,
  halls,
  onPricesSaved
}) => {
  const [selectedHall, setSelectedHall] = useState<string>(halls[0]?.id || '');
  const [standardPrice, setStandardPrice] = useState<number>(500);
  const [vipPrice, setVipPrice] = useState<number>(800);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavePopupOpen, setIsSavePopupOpen] = useState(false);

  // Загружаем цены с backend при выборе зала
  useEffect(() => {
    if (!selectedHall) return;

    const fetchPrices = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/api/halls/${selectedHall}`);
        setStandardPrice(res.data.standard_price ?? 500);
        setVipPrice(res.data.vip_price ?? 800);
      } catch (err) {
        console.error('Ошибка загрузки цен:', err);
        alert('Не удалось загрузить цены для зала');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, [selectedHall]);

  const handlePriceChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    const num = Number(value.replace(/\D/g, ''));
    if (!isNaN(num) && num >= 0) setter(num);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHall) return;

    const prices: PriceData = {
      hallId: selectedHall,
      hallName: halls.find(h => h.id === selectedHall)?.name || 'Неизвестный зал',
      standardPrice,
      vipPrice,
      timestamp: new Date().toISOString()
    };

    setIsLoading(true);
    try {
      await axios.put(`/api/halls/${selectedHall}`, {
        standard_price: standardPrice,
        vip_price: vipPrice
      });
      onPricesSaved(prices);
      setIsSavePopupOpen(true);
    } catch (err) {
      console.error('Ошибка сохранения цен:', err);
      alert('Не удалось сохранить цены. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  if (halls.length === 0) {
    return (
      <ConfigSection title="Конфигурация цен" isOpen={isOpen} onToggle={onToggle}>
        <p style={{ color: '#ff6b6b' }}>
          Нет доступных залов. Сначала создайте зал в разделе "Управление залами".
        </p>
      </ConfigSection>
    );
  }

  return (
    <ConfigSection title="Конфигурация цен" isOpen={isOpen} onToggle={onToggle}>
      <p>Выберите зал для конфигурации:</p>

      <ul className="conf-step__selectors-box">
        {halls.map(hall => (
          <li key={hall.id}>
            <input
              type="radio"
              name="prices-hall"
              value={hall.id}
              checked={selectedHall === hall.id}
              onChange={e => setSelectedHall(e.target.value)}
              disabled={isLoading}
            />
            <span>{hall.name}</span>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSave}>
        <p>Установите цены для типов кресел:</p>

        <div className="conf-step__legend">
          <FormField
            label="Цена, рублей"
            name="standardPrice"
            type="text"
            value={standardPrice.toString()}
            onChange={e => handlePriceChange(setStandardPrice, e.target.value)}
            disabled={isLoading}
          />
          за обычные кресла
        </div>

        <div className="conf-step__legend">
          <FormField
            label="Цена, рублей"
            name="vipPrice"
            type="text"
            value={vipPrice.toString()}
            onChange={e => handlePriceChange(setVipPrice, e.target.value)}
            disabled={isLoading}
          />
          за VIP кресла
        </div>

        <div className="conf-step__buttons text-center">
          <ConfigButton variant="regular" type="button" onClick={() => {}} disabled={isLoading}>
            Отмена
          </ConfigButton>
          <ConfigButton variant="accent" type="submit" disabled={isLoading}>
            {isLoading ? 'Сохраняем...' : 'Сохранить'}
          </ConfigButton>
        </div>
      </form>

      <Popup
        isOpen={isSavePopupOpen}
        onClose={() => setIsSavePopupOpen(false)}
        title="Цены сохранены"
      >
        <p>Цены для зала "{halls.find(h => h.id === selectedHall)?.name}" успешно сохранены.</p>
        <div className="conf-step__buttons text-center">
          <ConfigButton variant="accent" onClick={() => setIsSavePopupOpen(false)}>
            ОК
          </ConfigButton>
        </div>
      </Popup>
    </ConfigSection>
  );
};