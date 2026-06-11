import type { TeamStatus } from "@/lib/config";
import { STATUS_LABELS } from "@/lib/config";

const classMap: Record<TeamStatus, string> = {
  pending_payment: "pill-pending",
  under_review: "pill-review",
  approved: "pill-approved",
  rejected: "pill-rejected",
  missing_info: "pill-missing",
};

export default function StatusPill({ status }: { status: TeamStatus }) {
  return (
    <span className={classMap[status] ?? "pill-pending"}>
      <span className="pill-dot bg-current" />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
