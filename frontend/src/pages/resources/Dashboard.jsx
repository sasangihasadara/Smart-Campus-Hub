import { BarChart, ChartLegend, DonutChart } from "../../components/resources/ResourceCharts";
import { useResources } from "../../context/ResourceContext";
import {
  buildStatusSeries,
  buildTypeSeries,
  summarizeResources,
} from "../../utils/resourceModule";

function StatCard({ label, value, tone }) {
  return (
    <div className="resource-stat-card">
      <div className="resource-stat-card__label">{label}</div>
      <div className={`resource-stat-card__value ${tone}`}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { resources, loading } = useResources();
  const summary = summarizeResources(resources);
  const typeSeries = buildTypeSeries(resources).map((item) => ({
    label: item.label,
    color: item.color,
    value: item.count,
  }));
  const statusSeries = buildStatusSeries(resources).map((item) => ({
    label: item.label,
    color: item.color,
    value: item.count,
  }));

  return (
    <section className="resource-page">
      <div className="resource-page__title">Dashboard</div>
      <div className="resource-page__sub">
        Facilities, assets, and analytics
      </div>

      <div className="resource-stats-grid">
        <StatCard label="Total Resources" value={summary.total} tone="blue" />
        <StatCard label="Active" value={summary.active} tone="green" />
        <StatCard label="Out of Service" value={summary.outOfService} tone="red" />
        <StatCard label="Maintenance" value={summary.maintenance} tone="orange" />
      </div>

      {loading ? (
        <div className="resource-empty">
          <div className="resource-empty__title">Loading dashboard</div>
          <div className="resource-empty__sub">Pulling the latest resource data.</div>
        </div>
      ) : (
        <div className="resource-charts-grid">
          <div className="resource-chart-card">
            <div className="resource-chart-card__title">Resources by Type</div>
            <ChartLegend items={typeSeries} />
            <BarChart
              items={typeSeries}
              ariaLabel="Bar chart of resources grouped by type"
            />
          </div>

          <div className="resource-chart-card">
            <div className="resource-chart-card__title">Status Distribution</div>
            <ChartLegend items={statusSeries} />
            <DonutChart items={statusSeries} totalLabel="Resources" />
          </div>
        </div>
      )}
    </section>
  );
}
