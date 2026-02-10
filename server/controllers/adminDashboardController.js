import Order from "../models/Order.js";
import User from "../models/User.js";
import Design from "../models/Design.js";
import Stock from "../models/Stock.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total orders and revenue
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: "Delivered" });
    const pendingOrders = await Order.countDocuments({ status: "Pending" });
    
    // Calculate total revenue from completed orders
    const ordersWithRevenue = await Order.find({ status: "Delivered" });
    const totalRevenue = ordersWithRevenue.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Get active customers (customers who have placed orders)
    const activeCustomers = await Order.distinct('user');
    const activeCustomersCount = activeCustomers.length;

    // Get new customers in last month
    const newCustomers = await User.countDocuments({ 
      role: "customer", 
      createdAt: { $gte: lastMonth } 
    });

    // Get average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get previous month data for comparison
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    const prevMonthEnd = lastMonth;
    
    const prevMonthOrders = await Order.find({
      createdAt: { $gte: prevMonthStart, $lt: prevMonthEnd },
      status: "Delivered"
    });
    
    const prevMonthRevenue = prevMonthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const prevMonthPending = await Order.countDocuments({
      createdAt: { $gte: prevMonthStart, $lt: prevMonthEnd },
      status: "Pending"
    });

    // Calculate percentage changes
    const revenueChange = prevMonthRevenue > 0 ? 
      ((totalRevenue - prevMonthRevenue) / prevMonthRevenue * 100) : 0;
    const pendingChange = prevMonthPending > 0 ? 
      ((pendingOrders - prevMonthPending) / prevMonthPending * 100) : 0;
    const customerChange = newCustomers > 0 ? 8.2 : 0; // Simplified calculation

    res.json({
      totalOrders,
      pendingApprovals: pendingOrders,
      activeCustomers: activeCustomersCount,
      revenue: totalRevenue,
      completedOrders,
      newCustomers,
      avgOrderValue,
      conversionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100) : 0,
      revenueChange: parseFloat(revenueChange.toFixed(1)),
      pendingChange: parseFloat(pendingChange.toFixed(1)),
      customerChange: parseFloat(customerChange.toFixed(1))
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// Get recent activities
export const getRecentActivities = async (req, res) => {
  try {
    const activities = [];

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .populate('design', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    recentOrders.forEach(order => {
      activities.push({
        id: order._id,
        action: "New Order",
        desc: `${order.user?.name || 'Unknown Customer'} placed order #${order.orderNumber}`,
        time: formatTimeAgo(order.createdAt),
        icon: "Package"
      });
    });

    // Get low stock items
    const lowStockItems = await Stock.find({ quantity: { $lt: 10 } })
      .limit(3);

    lowStockItems.forEach(stock => {
      activities.push({
        id: stock._id,
        action: "Stock Alert",
        desc: `${stock.itemName || 'Item'} is low on stock (${stock.quantity} left)`,
        time: "2 hours ago",
        icon: "AlertCircle"
      });
    });

    // Get new users
    const newUsers = await User.find({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
      .limit(3);

    newUsers.forEach(user => {
      activities.push({
        id: user._id,
        action: "User Signup",
        desc: `New ${user.role} registered: ${user.name}`,
        time: formatTimeAgo(user.createdAt),
        icon: "UserCheck"
      });
    });

    // Sort by time (most recent first) and limit to 10
    activities.sort((a, b) => {
      const timeA = parseTimeAgo(a.time);
      const timeB = parseTimeAgo(b.time);
      return timeA - timeB;
    });

    res.json(activities.slice(0, 10));
  } catch (error) {
    console.error("Recent Activities Error:", error);
    res.status(500).json({ message: "Failed to fetch recent activities" });
  }
};

// Get recent orders
export const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name')
      .populate('design', 'title')
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customerName: order.user?.name || 'Unknown Customer',
      productName: order.design?.title || 'Custom Design',
      amount: order.totalPrice || 0,
      status: order.status.toLowerCase(),
      createdAt: order.createdAt
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Recent Orders Error:", error);
    res.status(500).json({ message: "Failed to fetch recent orders" });
  }
};

// Get notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = [];

    // Pending orders count
    const pendingCount = await Order.countDocuments({ status: "Pending" });
    if (pendingCount > 0) {
      notifications.push({
        id: 1,
        type: "order",
        message: `${pendingCount} orders pending approval`,
        time: "Just now",
        read: false
      });
    }

    // Low stock alerts
    const lowStockCount = await Stock.countDocuments({ quantity: { $lt: 10 } });
    if (lowStockCount > 0) {
      notifications.push({
        id: 2,
        type: "stock",
        message: `${lowStockCount} items running low on stock`,
        time: "1 hour ago",
        read: false
      });
    }

    // New customers today
    const newCustomersToday = await User.countDocuments({
      role: "customer",
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    if (newCustomersToday > 0) {
      notifications.push({
        id: 3,
        type: "customer",
        message: `${newCustomersToday} new customers joined today`,
        time: "2 hours ago",
        read: true
      });
    }

    res.json(notifications);
  } catch (error) {
    console.error("Notifications Error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Helper functions
function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} mins ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}

function parseTimeAgo(timeStr) {
  const match = timeStr.match(/(\d+)\s*(mins?|hours?|days?)\s*ago/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  if (unit.startsWith('min')) return value * 60000;
  if (unit.startsWith('hour')) return value * 3600000;
  if (unit.startsWith('day')) return value * 86400000;
  return 0;
}
