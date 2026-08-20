import { formatInteger, formatPercentageBasisPoints } from '@bidly/config';
import { Button, MoneyValue, Surface, TechnicalFoundationPanel } from '@bidly/ui';

import { ruRU } from '../i18n/messages/ru-RU';

export default function TechnicalFoundationPage() {
  const messages = ruRU.page;

  return (
    <>
      <a className="bidly-skip-link" href="#main-content">
        {messages.skipLink}
      </a>
      <header className="border-b border-[var(--bidly-color-border)] bg-[var(--bidly-color-surface)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <strong className="text-lg tracking-[-0.02em] text-[var(--bidly-color-text-primary)]">
            {messages.brand}
          </strong>
          <span className="text-sm text-[var(--bidly-color-text-muted)]">{messages.context}</span>
        </div>
      </header>
      <main
        className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:items-start lg:py-24"
        id="main-content"
      >
        <div className="grid gap-8">
          <div className="grid max-w-3xl gap-4">
            <h1 className="m-0 text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-[var(--bidly-color-text-primary)] sm:text-5xl">
              {messages.title}
            </h1>
            <p className="m-0 max-w-2xl text-base leading-7 text-[var(--bidly-color-text-secondary)] sm:text-lg">
              {messages.lead}
            </p>
          </div>

          <TechnicalFoundationPanel
            checks={messages.panel.checks}
            description={messages.panel.description}
            eyebrow={messages.panel.eyebrow}
            statusLabel={messages.panel.status}
            title={messages.panel.title}
          />
        </div>

        <div className="grid gap-5">
          <Surface aria-labelledby="numeric-heading">
            <div className="grid gap-5">
              <div className="grid gap-2">
                <h2 className="m-0 text-xl font-semibold" id="numeric-heading">
                  {messages.numeric.heading}
                </h2>
                <p className="m-0 text-sm leading-6 text-[var(--bidly-color-text-muted)]">
                  {messages.numeric.description}
                </p>
              </div>
              <MoneyValue amountMinor={54_900n} periodLabel={messages.numeric.monthlyPeriod} />
              <dl className="m-0 grid gap-4 border-t border-[var(--bidly-color-border)] pt-5">
                <div className="grid gap-1">
                  <dt className="text-sm text-[var(--bidly-color-text-muted)]">
                    {messages.numeric.countLabel}
                  </dt>
                  <dd className="m-0 text-2xl font-semibold [font-variant-numeric:tabular-nums]">
                    {formatInteger(18_421n)}
                  </dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-sm text-[var(--bidly-color-text-muted)]">
                    {messages.numeric.deltaLabel}
                  </dt>
                  <dd className="m-0 text-2xl font-semibold [font-variant-numeric:tabular-nums]">
                    {formatPercentageBasisPoints(-2_700n)}
                  </dd>
                </div>
              </dl>
            </div>
          </Surface>

          <Surface aria-labelledby="action-heading">
            <div className="grid gap-3">
              <Button disabled fullWidth>
                {messages.action.label}
              </Button>
              <p
                className="m-0 text-sm leading-6 text-[var(--bidly-color-text-muted)]"
                id="action-heading"
              >
                {messages.action.note}
              </p>
            </div>
          </Surface>
        </div>
      </main>
    </>
  );
}
