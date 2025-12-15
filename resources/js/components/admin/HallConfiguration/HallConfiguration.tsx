import { useState, useEffect } from 'react';
import axios from 'axios';
import { CinemaHall, HallConfigData, Seat } from '../../../types';
import { ConfigSection } from '../ConfigSection/ConfigSection';
import { ConfigButton } from '../ConfigButton/ConfigButton';
import './HallConfiguration.css';

interface HallConfigurationProps {
  isOpen: boolean;
  onToggle: () => void;
  halls: CinemaHall[];
  onConfigurationSaved: (hallConfig: HallConfigData) => void;
}

export const HallConfiguration: React.FC<HallConfigurationProps> = ({
  isOpen,
  onToggle,
  halls,
  onConfigurationSaved
}) => {
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);
  const [rows, setRows] = useState<number>(0);
  const [seatsPerRow, setSeatsPerRow] = useState<number>(0);
  const [layout, setLayout] = useState<Seat[][]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем конфигурацию выбранного зала
  useEffect(() => {
    if (!selectedHallId) return;
    const hall = halls.find(h => h.id === selectedHallId);
    if (!hall) return;

    setRows(hall.rows);
    setSeatsPerRow(hall.seatsPerRow);
    setLayout(hall.layout || Array.from({ length: hall.rows }, () =>
      Array.from({ length: hall.seatsPerRow }, (_, index) => ({
        row: 0,
        number: index + 1,
        type: 'standard' as Seat['type'],
        price: hall.standardPrice || 0
      }))
    ));
  }, [selectedHallId, halls]);

  const handleSeatTypeChange = (rowIndex: number, seatIndex: number, type: Seat['type']) => {
    setLayout(prev => {
      const newLayout = prev.map(row => [...row]);
      newLayout[rowIndex][seatIndex].type = type;
      return newLayout;
    });
  };

  const handleSave = async () => {
    if (!selectedHallId) return;
    setIsLoading(true);
    try {
      await axios.put(`/api/halls/${selectedHallId}`, {
        rows,
        seats_per_row: seatsPerRow,
        layout
      });
      onConfigurationSaved({
        hallId: selectedHallId,
        rows,
        seatsPerRow,
        seats: layout
      });
      alert('Конфигурация сохранена');
    } catch (err) {
      alert('Ошибка при сохранении конфигурации. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfigSection title="Конфигурация зала" isOpen={isOpen} onToggle={onToggle}>
      <div className="hall-config__selector">
        <label>Выберите зал: </label>
        <select
          value={selectedHallId || ''}
          onChange={e => setSelectedHallId(e.target.value)}
        >
          <option value="" disabled>Выберите зал</option>
          {halls.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>

      {selectedHallId && (
        <>
          <div className="hall-config__layout">
            {layout.map((row, rowIndex) => (
              <div key={rowIndex} className="hall-config__row">
                {row.map((seat, seatIndex) => (
                  <select
                    key={seatIndex}
                    value={seat.type}
                    onChange={e => handleSeatTypeChange(rowIndex, seatIndex, e.target.value as Seat['type'])}
                    disabled={isLoading}
                  >
                    <option value="standard">Стандарт</option>
                    <option value="vip">VIP</option>
                    <option value="disabled">Заблокировано</option>
                  </select>
                ))}
              </div>
            ))}
          </div>

          <div className="hall-config__buttons text-center">
            <ConfigButton variant="accent" onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Сохраняем...' : 'Сохранить конфигурацию'}
            </ConfigButton>
          </div>
        </>
      )}

      {!selectedHallId && <p>Выберите зал для конфигурации</p>}
    </ConfigSection>
  );
};