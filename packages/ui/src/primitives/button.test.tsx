import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button.js';

describe('Button', () => {
  it('uses native button behavior and forwards activation', () => {
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Проверить</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disables activation and exposes busy state while loading', () => {
    render(
      <Button loading loadingLabel="Выполняется проверка">
        Проверить
      </Button>,
    );

    expect(screen.getByRole('button', { name: /Проверить/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Проверить/ })).toHaveAttribute('aria-busy', 'true');
  });
});
