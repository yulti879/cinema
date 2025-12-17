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

    setLayout(
      hall.layout?.length
        ? hall.layout
        : Array.from({ length: hall.rows }, () =>
            Array.from({ length: hall.seatsPerRow }, (_, i) => ({
              row: 0,
              number: i + 1,
              type: 'standard' as Seat['type'],
              price: hall.standardPrice || 0,
            }))
          )
    );
  }, [selectedHallId, halls]);

  // Изменение типа кресла при клике
  const handleSeatTypeChange = (rowIndex: number, seatIndex: number, type: Seat['type']) => {
    setLayout(prev => {
      const newLayout = prev.map(r => [...r]);
      newLayout[rowIndex][seatIndex].type = type;
      return newLayout;
    });
  };

  // Цикл типов кресел: standard → vip → disabled → standard
  const nextType = (current: Seat['type']): Seat['type'] => {
    if (current === 'standard') return 'vip';
    if (current === 'vip') return 'disabled';
    return 'standard';
  };

  const handleSave = async () => {
    if (!selectedHallId) return;

    setIsLoading(true);
    try {
      await axios.put(`/api/halls/${selectedHallId}`, {
        rows,
        seatsPerRow,
        layout,
      });

      onConfigurationSaved({
        hallId: selectedHallId,
        rows,
        seatsPerRow,
        seats: layout,
      });

      alert('Конфигурация сохранена');
    } catch {
      alert('Ошибка при сохранении конфигурации. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfigSection title="Конфигурация залов" isOpen={isOpen} onToggle={onToggle}>
      <p className="conf-step__paragraph">Выберите зал для конфигурации:</p>
      <ul className="conf-step__selectors-box">
        {halls.map(hall => (
          <li key={hall.id}>
            <input
              type="radio"
              className="conf-step__radio"
              name="chairs-hall"
              value={hall.id}
              checked={selectedHallId === hall.id}
              onChange={() => setSelectedHallId(hall.id)}
            />
            <span className="conf-step__selector">{hall.name}</span>
          </li>
        ))}
      </ul>

      {selectedHallId && (
        <>
          <p className="conf-step__paragraph">Укажите количество рядов и максимальное количество кресел в ряду:</p>
          <div className="conf-step__legend">
            <label className="conf-step__label">
              Рядов, шт
              <input
                type="number"
                className="conf-step__input"
                value={rows}
                min={1}
                onChange={e => setRows(Number(e.target.value))}
              />
            </label>
            <span className="multiplier">x</span>
            <label className="conf-step__label">
              Мест, шт
              <input
                type="number"
                className="conf-step__input"
                value={seatsPerRow}
                min={1}
                onChange={e => setSeatsPerRow(Number(e.target.value))}
              />
            </label>
          </div>

          <p className="conf-step__paragraph">Теперь вы можете указать типы кресел на схеме зала:</p>
          <div className="conf-step__legend">
            <span className="conf-step__chair conf-step__chair_standard"></span> — обычные кресла
            <span className="conf-step__chair conf-step__chair_vip"></span> — VIP кресла
            <span className="conf-step__chair conf-step__chair_disabled"></span> — заблокированные
            <p className="conf-step__hint">Чтобы изменить вид кресла, нажмите по нему левой кнопкой мыши</p>
          </div>

          <div className="conf-step__hall">
            <div className="conf-step__hall-wrapper">
              {layout.map((row, rowIndex) => (
                <div key={rowIndex} className="conf-step__row">
                  {row.map((seat, seatIndex) => (
                    <span
                      key={seatIndex}
                      className={`conf-step__chair conf-step__chair_${seat.type}`}
                      onClick={() =>
                        handleSeatTypeChange(rowIndex, seatIndex, nextType(seat.type))
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <fieldset className="conf-step__buttons text-center">
            <ConfigButton variant="regular" onClick={() => setSelectedHallId(null)}>
              Отмена
            </ConfigButton>
            <ConfigButton variant="accent" onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Сохраняем...' : 'Сохранить'}
            </ConfigButton>
          </fieldset>
        </>
      )}      
    </ConfigSection>
  );
};