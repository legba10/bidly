export interface ConversionFunnelItem {
  readonly label: string;
  readonly value: number;
}
export interface ConversionFunnelProps {
  readonly items: readonly ConversionFunnelItem[];
}

export function ConversionFunnel({ items }: ConversionFunnelProps) {
  const maximum = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="bidly-conversion-funnel">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <i style={{ width: `${String(Math.max(18, (item.value / maximum) * 100))}%` }} />
          <strong>{item.value.toLocaleString('ru-RU')}</strong>
        </div>
      ))}
    </div>
  );
}
