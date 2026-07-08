const Shipment = require('../models/Shipment')
const User = require('../models/User')
const Quote = require('../models/Quote')
const SupportTicket = require('../models/SupportTicket')
const asyncHandler = require('../middleware/asyncHandler')

// GET /api/analytics/dashboard
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalCustomers,
    totalShipments,
    pendingShipments,
    deliveredShipments,
    inTransitShipments,
    openTickets,
    pendingQuotes,
    revenueAgg,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Shipment.countDocuments({ isArchived: false }),
    Shipment.countDocuments({ status: { $nin: ['Delivered', 'Cancelled'] }, isArchived: false }),
    Shipment.countDocuments({ status: 'Delivered', isArchived: false }),
    Shipment.countDocuments({ status: { $in: ['In Transit', 'Departed UK', 'Customs Clearance'] }, isArchived: false }),
    SupportTicket.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
    Quote.countDocuments({ status: 'Pending' }),
    Shipment.aggregate([
      { $match: { isArchived: false, paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]),
  ])

  const revenue = revenueAgg[0]?.total || 0

  // Recent activity: latest 10 shipments
  const recentShipments = await Shipment.find({ isArchived: false })
    .populate('customer', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10)

  // Shipment status breakdown
  const statusBreakdown = await Shipment.aggregate([
    { $match: { isArchived: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  res.json({
    success: true,
    stats: {
      totalCustomers,
      totalShipments,
      pendingShipments,
      deliveredShipments,
      inTransitShipments,
      openTickets,
      pendingQuotes,
      revenue,
    },
    recentShipments,
    statusBreakdown,
  })
})

// GET /api/analytics/revenue
exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period = 'monthly' } = req.query

  const groupFormat = period === 'daily' ? '%Y-%m-%d' : period === 'yearly' ? '%Y' : '%Y-%m'

  const revenue = await Shipment.aggregate([
    { $match: { isArchived: false, paymentStatus: 'Paid' } },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
        total: { $sum: '$price' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  res.json({ success: true, revenue })
})

// GET /api/analytics/shipments
exports.getShipmentAnalytics = asyncHandler(async (req, res) => {
  const { period = 'monthly' } = req.query
  const groupFormat = period === 'daily' ? '%Y-%m-%d' : period === 'yearly' ? '%Y' : '%Y-%m'

  const [byDate, byCourier, byDestination] = await Promise.all([
    Shipment.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Shipment.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$courier', count: { $sum: 1 } } },
    ]),
    Shipment.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$destination', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ])

  res.json({ success: true, byDate, byCourier, byDestination })
})
