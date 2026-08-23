import type { ReactNode } from 'react';

import { MarketProgress } from '../patterns/market-progress.js';

export interface AuctionCardProps {
  readonly action?: ReactNode;
  readonly category: string;
  readonly deadline: string;
  readonly offerCount: number;
  readonly participants: string;
  readonly progress: number;
  readonly status: string;
}

export function AuctionCard({
  action,
  category,
  deadline,
  offerCount,
  participants,
  progress,
  status,
}: AuctionCardProps) {
  return (
    <article className="bidly-auction-card">
      <header>
        <div>
          <p>{status}</p>
          <h3>{category}</h3>
        </div>
        <strong>{participants}</strong>
      </header>
      <MarketProgress
        steps={['Спрос', 'Проверка', 'Условия', 'Выбор', 'Результат'].map((label, index) => ({
          label,
          state: index < progress ? 'complete' : index === progress ? 'current' : 'upcoming',
        }))}
        title="Этап торгов"
      />
      <footer>
        <span>{offerCount} предложений</span>
        <span>{deadline}</span>
        {action}
      </footer>
    </article>
  );
}
