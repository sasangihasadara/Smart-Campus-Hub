function buildGradient(items) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return "conic-gradient(#2b3141 0deg 360deg)";
  }

  let current = 0;
  const stops = items.map((item) => {
    const start = current;
    const end = current + (item.value / total) * 360;
    current = end;
    return `${item.color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

export function ChartLegend({ items, suffix = "" }) {
  return (
    <div className="resource-legend">
      {items.map((item) => (
        <div className="resource-legend__item" key={item.label}>
          <span
            className="resource-legend__dot"
            style={{ backgroundColor: item.color }}
          />
          <span>
            {item.label}
            {suffix ? ` ${suffix}` : ""}
            {typeof item.value === "number" ? ` (${item.value})` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BarChart({ items, maxValue, ariaLabel }) {
  const safeMax = maxValue || Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="resource-bar-chart" role="img" aria-label={ariaLabel}>
      {items.map((item) => (
        <div className="resource-bar-chart__item" key={item.label}>
          <span className="resource-bar-chart__value">{item.value}</span>
          <div className="resource-bar-chart__track">
            <div
              className="resource-bar-chart__fill"
              style={{
                backgroundColor: item.color,
                height: `${safeMax ? (item.value / safeMax) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="resource-bar-chart__label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ items, totalLabel = "Total" }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="resource-donut-chart">
      <div
        className="resource-donut-chart__ring"
        style={{ backgroundImage: buildGradient(items) }}
        role="img"
        aria-label={items.map((item) => `${item.label}: ${item.value}`).join(", ")}
      >
        <div className="resource-donut-chart__inner">
          <span className="resource-donut-chart__total">{total}</span>
          <span className="resource-donut-chart__text">{totalLabel}</span>
        </div>
      </div>
    </div>
  );
}
