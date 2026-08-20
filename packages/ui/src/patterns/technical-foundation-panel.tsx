import { StatusIndicator } from '../components/status-indicator.js';
import { CheckIcon } from '../icons/check-icon.js';
import { Surface } from '../primitives/surface.js';

export interface TechnicalFoundationPanelProps {
  readonly checks: readonly string[];
  readonly description: string;
  readonly eyebrow: string;
  readonly statusLabel: string;
  readonly title: string;
}

export function TechnicalFoundationPanel({
  checks,
  description,
  eyebrow,
  statusLabel,
  title,
}: TechnicalFoundationPanelProps) {
  return (
    <Surface className="bidly-technical-panel" elevation="raised">
      <header className="bidly-technical-panel__header">
        <p className="bidly-technical-panel__eyebrow">{eyebrow}</p>
        <h2 className="bidly-technical-panel__title">{title}</h2>
        <p className="bidly-technical-panel__description">{description}</p>
        <StatusIndicator label={statusLabel} tone="ready" />
      </header>
      <ul className="bidly-technical-panel__list">
        {checks.map((check) => (
          <li className="bidly-technical-panel__item" key={check}>
            <CheckIcon className="bidly-technical-panel__icon" />
            <span>{check}</span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
