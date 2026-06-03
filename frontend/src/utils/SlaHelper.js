export const SLA_CONFIG = {
  CRITICAL: { response: 1, resolution: 4 }, // hours
  HIGH: { response: 4, resolution: 24 }, // hours
  MEDIUM: { response: 24, resolution: 72 }, // hours (3 days)
  LOW: { response: 72, resolution: 168 }, // hours (7 days)
};

export function getSlaStatus(priority, createdAt, updatedAt, status, comments = []) {
  const config = SLA_CONFIG[priority] || SLA_CONFIG.MEDIUM;
  const created = new Date(createdAt).getTime();
  const now = Date.now();

  // Time to first response: first comment by a non-reporter staff member
  const staffComment = comments.find(c => ["ADMIN", "TECHNICIAN", "STAFF"].includes(c.authorRole?.toUpperCase()));
  const responseTime = staffComment ? new Date(staffComment.createdAt).getTime() : now;
  const responseDeadline = created + config.response * 3600000;
  const responseRemaining = responseDeadline - responseTime;

  // Time to resolution: when status becomes RESOLVED or CLOSED
  const isResolved = ["RESOLVED", "CLOSED"].includes(status);
  const resolvedAt = isResolved ? new Date(updatedAt).getTime() : now;
  const resolutionDeadline = created + config.resolution * 3600000;
  const resolutionRemaining = resolutionDeadline - resolvedAt;

  return {
    response: {
      deadline: new Date(responseDeadline),
      remaining: responseRemaining,
      met: staffComment ? responseRemaining >= 0 : null,
      label: staffComment ? "Responded" : "Response Due",
    },
    resolution: {
      deadline: new Date(resolutionDeadline),
      remaining: resolutionRemaining,
      met: isResolved ? resolutionRemaining >= 0 : null,
      label: isResolved ? "Resolved" : "Resolution Due",
    },
  };
}

export function formatSlaRemaining(ms) {
  const absolute = Math.abs(ms);
  const totalMinutes = Math.floor(absolute / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  let text = "";
  if (days > 0) text = `${days}d ${hours}h`;
  else if (hours > 0) text = `${hours}h ${minutes}m`;
  else text = `${minutes}m`;

  return ms < 0 ? `${text} overdue` : `${text} left`;
}
