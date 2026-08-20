export interface StatusIndicatorProps {
  readonly label: string;
  readonly tone?: 'neutral' | 'ready' | 'attention' | 'info';
}

export function StatusIndicator({ label, tone = 'neutral' }: StatusIndicatorProps) {
  return (
    <span className="bidly-status" data-tone={tone}>
      <span aria-hidden="true" className="bidly-status__mark" />
      <span>{label}</span>
    </span>
  );
}
