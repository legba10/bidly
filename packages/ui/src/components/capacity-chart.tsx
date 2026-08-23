export interface CapacityChartItem {
  readonly available: number;
  readonly label: string;
}
export interface CapacityChartProps {
  readonly items: readonly CapacityChartItem[];
  readonly maximum?: number;
}

export function CapacityChart({
  items,
  maximum = Math.max(...items.map((item) => item.available), 1),
}: CapacityChartProps) {
  return (
    <div className="bidly-capacity-chart">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <span aria-hidden="true" className="bidly-capacity-chart__track">
            <i style={{ width: `${String((item.available / maximum) * 100)}%` }} />
          </span>
          <strong>
            {item.available === 0 ? 'занято' : `${item.available.toLocaleString('ru-RU')} мест`}
          </strong>
        </div>
      ))}
    </div>
  );
}
