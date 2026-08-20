import { getBlockingAccessibilityViolations } from '@bidly/testing';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

import { TechnicalFoundationPanel } from './patterns/technical-foundation-panel.js';
import { Button } from './primitives/button.js';

describe('UI accessibility baseline', () => {
  it('has no serious or critical automated violations', async () => {
    const { container } = render(
      <main>
        <TechnicalFoundationPanel
          checks={['Семантические элементы', 'Видимый текстовый статус']}
          description="Технический пример проверяет только компоненты системы."
          eyebrow="Проверка"
          statusLabel="Основа готова"
          title="Доступная техническая поверхность"
        />
        <Button disabled>Недоступное действие</Button>
      </main>,
    );
    const results = await axe.run(container, {
      // jsdom has no Canvas implementation. Real-browser Storybook and Playwright suites keep
      // color-contrast enabled; this fast semantic suite covers the remaining axe rules.
      rules: { 'color-contrast': { enabled: false } },
    });

    expect(getBlockingAccessibilityViolations(results.violations)).toEqual([]);
  });
});
