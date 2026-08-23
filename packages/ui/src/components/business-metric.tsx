export interface BusinessMetricProps {
  readonly detail: string;
  readonly label: string;
  readonly tone?: 'brand' | 'success' | 'warm';
  readonly value: string;
}

export function BusinessMetric({ detail, label, tone = 'brand', value }: BusinessMetricProps) {
  return (
    <article className="bidly-business-metric" data-tone={tone}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}
