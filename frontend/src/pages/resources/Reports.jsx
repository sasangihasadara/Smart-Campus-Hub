import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import jsPDF from "jspdf";
import { BarChart, ChartLegend, DonutChart } from "../../components/resources/ResourceCharts";
import { useResources } from "../../context/ResourceContext";
import {
  RESOURCE_STATUSES,
  RESOURCE_TYPES,
  buildStatusSeries,
  buildTypeSeries,
  filterResources,
  formatAvailability,
  statusClass,
  statusLabel,
  summarizeResources,
  typeClass,
  typeLabel,
} from "../../utils/resourceModule";

function StatCard({ label, value, tone }) {
  return (
    <div className="resource-stat-card">
      <div className="resource-stat-card__label">{label}</div>
      <div className={`resource-stat-card__value ${tone}`}>{value}</div>
    </div>
  );
}

export default function Reports() {
  const { resources, loading } = useResources();
  const [filters, setFilters] = useState({ type: "", status: "" });

  const filteredResources = useMemo(
    () => filterResources(resources, filters),
    [filters, resources]
  );

  const summary = summarizeResources(filteredResources);
  const typeSeries = buildTypeSeries(filteredResources).map((item) => ({
    label: item.label,
    color: item.color,
    value: item.count,
  }));
  const capacitySeries = buildTypeSeries(filteredResources).map((item) => ({
    label: item.label,
    color: item.color,
    value: item.capacity,
  }));
  const statusSeries = buildStatusSeries(filteredResources).map((item) => ({
    label: item.label,
    color: item.color,
    value: item.count,
  }));
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleDownload = () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const generatedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      let yPosition = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const lineHeight = 7;

      // Title
      pdf.setFontSize(24);
      pdf.setFont(undefined, "bold");
      pdf.text("Smart Campus Facilities Report", margin, yPosition);
      yPosition += 12;

      // Date
      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");
      pdf.text(`Generated on ${generatedDate}`, margin, yPosition);
      yPosition += 10;

      // Summary Stats
      pdf.setFontSize(11);
      pdf.setFont(undefined, "bold");
      pdf.text("Summary", margin, yPosition);
      yPosition += 7;

      pdf.setFontSize(9);
      pdf.setFont(undefined, "normal");
      const stats = [
        `Total: ${summary.total}`,
        `Active: ${summary.active}`,
        `Out of Service: ${summary.outOfService}`,
        `Maintenance: ${summary.maintenance}`,
      ];

      stats.forEach((stat) => {
        pdf.text(stat, margin + 5, yPosition);
        yPosition += lineHeight;
      });

      yPosition += 5;

      // Table header
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 7, "F");
      
      const headers = ["Name", "Type", "Capacity", "Location", "Status", "Available"];
      const columnWidths = [40, 25, 20, 40, 25, 28];
      let xPosition = margin;

      headers.forEach((header, idx) => {
        pdf.text(header, xPosition, yPosition, { maxWidth: columnWidths[idx] - 1 });
        xPosition += columnWidths[idx];
      });

      yPosition += 10;

      // Table rows
      pdf.setFont(undefined, "normal");
      pdf.setFontSize(8);

      filteredResources.forEach((resource) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        xPosition = margin;
        const rowData = [
          resource.name,
          typeLabel(resource.type),
          resource.capacity || "-",
          resource.location,
          statusLabel(resource.status),
          formatAvailability(resource),
        ];

        rowData.forEach((data, idx) => {
          pdf.text(String(data), xPosition, yPosition, { maxWidth: columnWidths[idx] - 1 });
          xPosition += columnWidths[idx];
        });

        yPosition += lineHeight;
      });

      // Add logo and signature section at the bottom
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      yPosition += 15;

      // Add logo area
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.text("Smart", margin, yPosition);
      pdf.setTextColor(79, 142, 247); // Blue color
      pdf.text("Campus", margin + 20, yPosition);
      pdf.setTextColor(0, 0, 0); // Back to black
      pdf.setFontSize(7);
      pdf.setFont(undefined, "normal");
      pdf.text("Resource Control Suite", margin, yPosition + 5);

      yPosition += 20;

      // Signature section
      pdf.setDrawColor(0, 0, 0);
      pdf.line(margin, yPosition, margin + 60, yPosition);
      pdf.setFontSize(8);
      pdf.text("Authorized Signature", margin, yPosition + 5);

      yPosition += 15;
      pdf.line(margin + 80, yPosition - 15, margin + 140, yPosition - 15);
      pdf.text("Date", margin + 80, yPosition - 10);

      yPosition += 10;
      pdf.setFontSize(7);
      pdf.setFont(undefined, "italic");
      pdf.text("This report was generated by Smart Campus Operations Hub", margin, yPosition);

      // Auto-download the PDF
      const timestamp = new Date().toISOString().slice(0, 10);
      pdf.save(`resource-report-${timestamp}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <section className="resource-page">
      <div className="resource-page__title">Reports</div>
      <div className="resource-page__sub">
        Visual analytics and downloadable reports for campus resources.
      </div>

      <div className="resource-toolbar resource-toolbar--reports">
        <label className="resource-toolbar__group">
          <span className="resource-toolbar__label">Type</span>
          <select
            value={filters.type}
            onChange={(event) =>
              setFilters((current) => ({ ...current, type: event.target.value }))
            }
          >
            <option value="">All Types</option>
            {RESOURCE_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="resource-toolbar__group">
          <span className="resource-toolbar__label">Status</span>
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
          >
            <option value="">All Statuses</option>
            {RESOURCE_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <div className="resource-toolbar__meta">
          <div className="resource-toolbar__count">
            {filteredResources.length} resource{filteredResources.length === 1 ? "" : "s"} in this report
            {activeFilterCount ? ` | ${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} active` : ""}
          </div>

          <div className="resource-toolbar__actions">
            <button
              className="resource-btn resource-btn--primary"
              type="button"
              onClick={handleDownload}
              disabled={!filteredResources.length}
            >
              Download PDF Report
            </button>
            <button
              className="resource-btn resource-btn--ghost"
              type="button"
              onClick={() => setFilters({ type: "", status: "" })}
              disabled={!activeFilterCount}
            >
              <RotateCcw size={15} />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="resource-stats-grid">
        <StatCard label="Total" value={summary.total} tone="blue" />
        <StatCard label="Active" value={summary.active} tone="green" />
        <StatCard label="Out of Service" value={summary.outOfService} tone="red" />
        <StatCard label="Maintenance" value={summary.maintenance} tone="orange" />
      </div>

      {loading ? (
        <div className="resource-empty">
          <div className="resource-empty__title">Loading reports</div>
          <div className="resource-empty__sub">Building charts and summary cards.</div>
        </div>
      ) : (
        <div className="resource-charts-grid">
          <div className="resource-chart-card resource-chart-card--full">
            <div className="resource-chart-card__title">Resources by Type</div>
            <ChartLegend items={typeSeries} />
            <BarChart items={typeSeries} ariaLabel="Bar chart of resources by type" />
          </div>

          <div className="resource-chart-card">
            <div className="resource-chart-card__title">Status Distribution</div>
            <ChartLegend items={statusSeries} />
            <DonutChart items={statusSeries} totalLabel="Resources" />
          </div>

          <div className="resource-chart-card">
            <div className="resource-chart-card__title">Capacity by Type</div>
            <ChartLegend items={capacitySeries} />
            <BarChart
              items={capacitySeries}
              ariaLabel="Bar chart of total capacity by resource type"
            />
          </div>

          <div className="resource-chart-card resource-chart-card--full">
            <div className="resource-chart-card__title">Resource Breakdown Table</div>
            <div className="resource-table-scroll">
              <table className="resource-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.length ? (
                    filteredResources.map((resource) => (
                      <tr key={resource.id}>
                        <td>
                          <div className="resource-table__name">{resource.name}</div>
                        </td>
                        <td>
                          <span className={`resource-chip ${typeClass(resource.type)}`}>
                            {typeLabel(resource.type)}
                          </span>
                        </td>
                        <td>{resource.capacity || "-"}</td>
                        <td className="resource-muted">{resource.location}</td>
                        <td>
                          <span className={`resource-status ${statusClass(resource.status)}`}>
                            <span className="resource-status__dot" />
                            {statusLabel(resource.status)}
                          </span>
                        </td>
                        <td className="resource-muted">{formatAvailability(resource)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">
                        <div className="resource-empty">
                          <div className="resource-empty__title">No report data</div>
                          <div className="resource-empty__sub">
                            Change the filters to include more resources.
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
