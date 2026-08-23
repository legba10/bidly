import type { ReactNode } from 'react';

export interface OfferCardProps {
  readonly action?: ReactNode;
  readonly availability: string;
  readonly badge?: string | undefined;
  readonly conditions: readonly string[];
  readonly period: string;
  readonly price: string;
  readonly rating: string;
  readonly reviews: string;
  readonly saving: string;
  readonly supplier: string;
  readonly totalCost: string;
}

export function OfferCard({
  action,
  availability,
  badge,
  conditions,
  period,
  price,
  rating,
  reviews,
  saving,
  supplier,
  totalCost,
}: OfferCardProps) {
  return (
    <article className="bidly-offer-card">
      <header>
        <div>
          <h3>{supplier}</h3>
          <p>
            ★ {rating} · {reviews}
          </p>
        </div>
        {badge ? <span>{badge}</span> : null}
      </header>
      <div className="bidly-offer-card__price">
        <strong>{price}</strong>
        <span>{period}</span>
        <em>{saving}</em>
      </div>
      <p className="bidly-offer-card__total">
        Полная стоимость: <strong>{totalCost}</strong>
      </p>
      <ul>
        {conditions.map((condition) => (
          <li key={condition}>{condition}</li>
        ))}
      </ul>
      <footer>
        <span>{availability}</span>
        {action}
      </footer>
    </article>
  );
}
