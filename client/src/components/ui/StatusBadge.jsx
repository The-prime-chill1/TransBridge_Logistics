const STATUS_MAP = {
  // Shipment statuses
  'Shipment Created': 'info',
  'Picked Up': 'info',
  'Warehouse': 'info',
  'Departed UK': 'warning',
  'In Transit': 'warning',
  'Customs Clearance': 'warning',
  'Arrived Nigeria': 'warning',
  'Out for Delivery': 'warning',
  'Delivered': 'success',
  'Cancelled': 'danger',
  'On Hold': 'danger',
  // Quote statuses
  'Pending': 'warning',
  'Quoted': 'info',
  'Accepted': 'success',
  'Declined': 'danger',
  'Expired': 'muted',
  // Support ticket statuses
  'Open': 'warning',
  'In Progress': 'info',
  'Resolved': 'success',
  'Closed': 'muted',
  // Payment
  'Paid': 'success',
  'Partial': 'warning',
  'Refunded': 'muted',
}

export default function StatusBadge({ status }) {
  const variant = STATUS_MAP[status] || 'muted'
  return <span className={`badge badge-${variant}`}>{status}</span>
}
