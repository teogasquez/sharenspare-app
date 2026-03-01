const statusConfig: Record<string, { label: string; color: string }> = {
  Pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  QuoteSent: { label: "Devis envoyé", color: "bg-blue-100 text-blue-800" },
  Accepted: { label: "Accepté", color: "bg-green-100 text-green-800" },
  Rejected: { label: "Refusé", color: "bg-red-100 text-red-800" },
  InProgress: { label: "En cours", color: "bg-purple-100 text-purple-800" },
  Returned: { label: "Retourné", color: "bg-indigo-100 text-indigo-800" },
  Closed: { label: "Clôturé", color: "bg-gray-100 text-gray-800" },
  Cancelled: { label: "Annulé", color: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
