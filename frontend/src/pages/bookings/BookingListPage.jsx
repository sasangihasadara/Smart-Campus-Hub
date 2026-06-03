import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { typeLabel } from "../../utils/resourceModule";

export default function BookingListPage() {
  const [searchParams] = useSearchParams();

  const selectedResource = useMemo(() => {
    const id = searchParams.get("resourceId");
    const name = searchParams.get("resourceName");

    if (!id && !name) return null;

    return {
      id: id || "N/A",
      name: name || "Selected Resource",
      type: typeLabel(searchParams.get("resourceType") || ""),
      location: searchParams.get("location") || "N/A",
      availability: `${searchParams.get("availFrom") || "--:--"} - ${searchParams.get("availUntil") || "--:--"}`,
    };
  }, [searchParams]);

  return (
    <div style={{ padding: "4rem", color: "var(--text-main)" }}>
      <h1 style={{ marginBottom: "0.7rem", textAlign: "center" }}>Bookings</h1>
      <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: "1.6rem" }}>
        {selectedResource
          ? "Resource selected. Booking flow integration can be added here."
          : "Choose a resource from the Available Resources page to start booking."}
      </p>

      {selectedResource ? (
        <div
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            padding: "1.2rem",
            borderRadius: "14px",
            border: "1px solid rgba(76, 111, 168, 0.22)",
            background: "linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(238, 247, 255, 0.92))",
          }}
        >
          <div style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.8rem" }}>
            {selectedResource.name}
          </div>
          <div style={{ display: "grid", gap: "0.35rem", color: "var(--text-muted)" }}>
            <div>
              <strong>ID:</strong> #{selectedResource.id}
            </div>
            <div>
              <strong>Type:</strong> {selectedResource.type || "N/A"}
            </div>
            <div>
              <strong>Location:</strong> {selectedResource.location}
            </div>
            <div>
              <strong>Availability:</strong> {selectedResource.availability}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
