import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BidlyMarketJourney } from './bidly-market-journey.js';

const steps = [
  { label: 'Опишите потребность', description: 'Расскажите, что для вас важно.' },
  { label: 'Объединим спрос', description: 'Сопоставим совместимые запросы.' },
] as const;

describe('BidlyMarketJourney', () => {
  it('changes the disclosed step with a native keyboard-focusable button', () => {
    render(<BidlyMarketJourney steps={steps} title="Путь покупателя" />);

    const secondStep = screen.getByRole('button', { name: 'Объединим спрос' });
    fireEvent.click(secondStep);

    expect(secondStep).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('Сопоставим совместимые запросы.')).toBeVisible();
  });
});
