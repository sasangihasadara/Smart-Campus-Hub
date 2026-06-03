import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CalendarDays, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import BookingModal from "../../components/booking/BookingModal";
import { getBookingsByResource } from "../../services/bookingService";
import { typeLabel } from "../../utils/resourceModule";

export default function BookingListPage() {
  const [searchParams] = useSearchParams();
  const [resourceBookings, setResourceBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const selectedResource = useMemo(() => {
    const id = searchParams.get("resourceId");
    const name = searchParams.get("resourceName");

    if (!id && !name) return null;

    return {
      id: id || "N/A",
      name: name || "Selected Resource",
      type: typeLabel(searchParams.get("resourceType") || ""),
      rawType: searchParams.get("resourceType") || "",
      capacity: searchParams.get("capacity") || "",
      location: searchParams.get("location") || "N/A",
      availability: `${searchParams.get("availFrom") || "--:--"} - ${searchParams.get("availUntil") || "--:--"}`,
    };
  }, [searchParams]);

  useEffect(() => {
    if (!selectedResource?.id || selectedResource.id === "N/A") {
      setResourceBookings([]);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    getBookingsByResource(selectedResource.id)
      .then((data) => {
        if (active) {
          setResourceBookings(data || []);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError.message || "Failed to load resource bookings");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedResource?.id]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
              <Sparkles size={14} />
              Resource booking workspace
            </div>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Bookings</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Select a resource, check existing reservations, and submit a new booking request for the same resource.
            </p>
          </div>

          {selectedResource ? (
            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              <CalendarClock size={16} />
              Book this resource
            </button>
          ) : null}
        </div>

        {selectedResource ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Selected resource</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{selectedResource.name}</h2>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <ShieldCheck size={22} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard label="Resource ID" value={`#${selectedResource.id}`} />
                <InfoCard label="Type" value={selectedResource.type || "N/A"} />
                <InfoCard label="Location" value={selectedResource.location} icon={<MapPin size={16} />} />
                <InfoCard label="Availability" value={selectedResource.availability} icon={<CalendarDays size={16} />} />
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                This resource is ready for booking. Use the button above to create a request with date, time, purpose, and attendees.
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Existing bookings</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">Resource timeline</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {resourceBookings.length} record{resourceBookings.length === 1 ? "" : "s"}
                </span>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              ) : resourceBookings.length ? (
                <div className="space-y-3">
                  {resourceBookings.slice(0, 6).map((booking) => (
                    <div key={booking.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{booking.date}</p>
                          <p className="text-sm text-slate-500">
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            booking.status === "APPROVED"
                              ? "bg-green-50 text-green-700"
                              : booking.status === "PENDING"
                                ? "bg-amber-50 text-amber-700"
                                : booking.status === "REJECTED"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{booking.purpose}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  No bookings have been made for this resource yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Choose a resource first</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500">
              Open the Available Resources page, select a lecture hall, lab, or asset, then come back here to review and book it.
            </p>
          </div>
        )}
      </section>

      {selectedResource ? (
        <BookingModal
          resource={{
            id: Number(selectedResource.id),
            name: selectedResource.name,
            type: searchParams.get("resourceType") || "",
            capacity: searchParams.get("capacity") || "",
          }}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          onSuccess={() => {
            setIsBookingOpen(false);
            getBookingsByResource(selectedResource.id)
              .then((data) => setResourceBookings(data || []))
              .catch((fetchError) => setError(fetchError.message || "Failed to refresh resource bookings"));
          }}
        />
      ) : null}
    </main>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {icon ? <span className="text-blue-600">{icon}</span> : null}
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
