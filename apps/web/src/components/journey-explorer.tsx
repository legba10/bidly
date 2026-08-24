'use client';

import { BidlyIcon } from '@bidly/ui';
import { useState } from 'react';

const steps = [
  {
    title: 'Вы описываете потребность',
    body: 'Услуга, город, бюджет и важные ограничения сохраняются в вашем запросе.',
    visual: ['Город: Сургут', 'Скорость: от 500 Мбит/с', 'Бюджет: до 700 ₽/мес'],
    safeVisual: ['Город', 'Условие услуги', 'Бюджет и ограничения'],
  },
  {
    title: 'Bidly объединяет совместимый спрос',
    body: 'Совместимые запросы становятся сильнее, но ваши индивидуальные ограничения не исчезают.',
    visual: ['18 421 участник', '7 842 подтверждено', 'одинаковые критерии'],
    safeVisual: ['Совместимые запросы', 'Подтверждённость', 'Одинаковые критерии'],
  },
  {
    title: 'Компании делают предложения',
    body: 'Поставщики видят агрегированный спрос и конкурируют полными условиями в пределах своей capacity.',
    visual: ['6 компаний', 'конечная квота', 'условия версионируются'],
    safeVisual: ['Несколько компаний', 'Конечная квота', 'Условия версионируются'],
  },
  {
    title: 'Варианты становятся сопоставимыми',
    body: 'Bidly приводит цены, доплаты, сроки и доступность к единой структуре сравнения.',
    visual: ['Полная стоимость', 'состав услуги', 'реальная доступность'],
    safeVisual: ['Полная стоимость', 'Состав услуги', 'Реальная доступность'],
  },
  {
    title: 'Вы выбираете сами',
    body: 'Несколько предложений могут подходить. Низкая цена не делает поставщика автоматическим победителем.',
    visual: ['Связь+ · 549 ₽', 'ДомСеть · 579 ₽', 'NetCom · 599 ₽'],
    safeVisual: ['Подходящий вариант', 'Полные условия', 'Выбор за вами'],
  },
  {
    title: 'Подключаетесь или записываетесь',
    body: 'После вашего действия проверяется версия условий и атомарно резервируется доступное место.',
    visual: ['25 августа', '12:00', 'место подтверждено'],
    safeVisual: ['Дата или подключение', 'Версия условий', 'Место подтверждено'],
  },
  {
    title: 'Результат подтверждается',
    body: 'Исполнение фиксируется доказательством. Только после этого может начисляться CPA поставщику.',
    visual: ['Услуга оказана', 'покупатель подтвердил', 'CPA начислен'],
    safeVisual: ['Услуга оказана', 'Покупатель подтвердил', 'CPA может быть начислен'],
  },
] as const;

export function JourneyExplorer({ demoMode }: { readonly demoMode: boolean }) {
  const [active, setActive] = useState(0);
  const step = steps[active] ?? steps[0];
  return (
    <div className="p5-journey-explorer">
      <div aria-label="Этапы работы Bidly" className="p5-journey-explorer__tabs" role="tablist">
        {steps.map((item, index) => (
          <button
            aria-selected={active === index}
            key={item.title}
            onClick={() => {
              setActive(index);
            }}
            role="tab"
            type="button"
          >
            <span>{index + 1}</span>
            {item.title}
          </button>
        ))}
      </div>
      <article aria-live="polite" className="p5-journey-explorer__panel">
        <div>
          <p className="bidly-eyebrow">Шаг {active + 1} из 7</p>
          <h2>{step.title}</h2>
          <p>{step.body}</p>
        </div>
        <div className="p5-journey-explorer__visual" data-step={active + 1}>
          <header>
            <span className="p5-journey-explorer__pulse">
              <BidlyIcon
                name={
                  active < 2
                    ? 'users'
                    : active < 4
                      ? 'building'
                      : active === 5
                        ? 'calendar'
                        : 'check-circle'
                }
              />
            </span>
            <div>
              <strong>{active === 0 ? 'Запрос на домашний интернет' : step.title}</strong>
              <small>
                {active === 0 ? 'Черновик условий покупателя' : `Шаг ${String(active + 1)} из 7`}
              </small>
            </div>
          </header>
          <div className="p5-journey-explorer__fields">
            {(demoMode ? step.visual : step.safeVisual).map((item, index) => (
              <div key={item}>
                <span>
                  {active === 0 ? ['Город', 'Скорость', 'Бюджет'][index] : `0${String(index + 1)}`}
                </span>
                <strong>{item}</strong>
                <BidlyIcon name={active === 4 && index < 2 ? 'arrow-right' : 'check-circle'} />
              </div>
            ))}
          </div>
          <footer>
            <span>{active === 0 ? 'Условия сохраняются в запросе' : 'Проверка условий Bidly'}</span>
            <BidlyIcon name="shield" />
          </footer>
        </div>
      </article>
    </div>
  );
}
