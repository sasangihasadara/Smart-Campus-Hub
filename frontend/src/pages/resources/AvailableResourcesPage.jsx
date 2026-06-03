import { useMemo, useState } from "react";
import { CalendarCheck2, RotateCcw, Search } from "lucide-react";
import { useResources } from "../../context/ResourceContext";
import BookingModal from "../../components/booking/BookingModal";
import {
  RESOURCE_TYPES,
  filterResources,
  formatAvailability,
  typeClass,
  typeLabel,
} from "../../utils/resourceModule";

const DEFAULT_FILTERS = {
  search: "",
  type: "",
  capacity: "",
};

export default function AvailableResourcesPage() {
  const { resources, loading, reloadResources } = useResources();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookClick = (resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const activeResources = useMemo(
    () => resources.filter((item) => item.status === "ACTIVE"),
    [resources]
  );

  const filteredResources = useMemo(
    () => filterResources(activeResources, filters),
    [activeResources, filters]
  );

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <section className="resource-page">
      <div className="resource-page__title">Available Resources</div>
      <div className="resource-page__sub">
        Active resources only. Choose one and click Book Now to continue.
      </div>

      <div className="resource-toolbar">
        <div className="resource-toolbar__group resource-toolbar__group--search">
          <span className="resource-toolbar__label">Find Active Resource</span>
          <div className="resource-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
            />
          </div>
        </div>

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
          <span className="resource-toolbar__label">Capacity</span>
          <select
            value={filters.capacity}
            onChange={(event) =>
              setFilters((current) => ({ ...current, capacity: event.target.value }))
            }
          >
            <option value="">Any Capacity</option>
            <option value="small">1-20</option>
            <option value="medium">21-50</option>
            <option value="large">51+</option>
          </select>
        </label>

        <div className="resource-toolbar__meta">
          <div className="resource-toolbar__count">
            {filteredResources.length} active result{filteredResources.length === 1 ? "" : "s"}
            {activeFilterCount
              ? ` | ${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} active`
              : ""}
          </div>

          <div className="resource-toolbar__actions">
            <button
              className="resource-btn resource-btn--ghost"
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              disabled={!activeFilterCount}
            >
              <RotateCcw size={15} />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="resource-cards resource-cards--available">
        {loading ? (
          <div className="resource-empty">
            <div className="resource-empty__title">Loading active resources</div>
            <div className="resource-empty__sub">Preparing the latest bookable list.</div>
          </div>
        ) : filteredResources.length ? (
          filteredResources.map((resource) => (
            <div key={resource.id} className="resource-card resource-card--available">
              <div className="resource-card__header">
                <div className="resource-card__name">{resource.name}</div>
                <div className="resource-card__type">
                  <span className={`resource-chip ${typeClass(resource.type)}`}>
                    {typeLabel(resource.type)}
                  </span>
                </div>
              </div>

              <div className="resource-card__body">
                <div className="resource-card__row">
                  <span>Capacity:</span>
                  <strong>{resource.capacity || "-"}</strong>
                </div>
                <div className="resource-card__row">
                  <span>Location:</span>
                  <strong>{resource.location}</strong>
                </div>
                <div className="resource-card__row">
                  <span>Availability:</span>
                  <strong>{formatAvailability(resource)}</strong>
                </div>
                <div className="resource-card__row">
                  <span>Status:</span>
                  <span className="resource-status active">
                    <span className="resource-status__dot" />
                    Active
                  </span>
                </div>
              </div>

              <div className="resource-card__book resource-card__book--available">
                <button
                  className="resource-btn resource-btn--book"
                  type="button"
                  onClick={() => handleBookClick(resource)}
                >
                  <CalendarCheck2 size={16} />
                  <span>Book Now</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="resource-empty">
            <div className="resource-empty__title">No active resources found</div>
            <div className="resource-empty__sub">
              Try changing the filters to see more bookable resources.
            </div>
          </div>
        )}
      </div>

      {selectedResource && (
        <BookingModal
          resource={selectedResource}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            if (reloadResources) reloadResources();
            // Optional: add a toast or global notification here
          }}
        />
      )}
    </section>
  );
}
