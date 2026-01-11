import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      pendingOrders,
      lowStockCount
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count({
        where: {
          isActive: true,
          stock: { lte: 5 }, // Approximation pour les alertes
        },
      }),
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult._sum.total || 0,
      pendingOrders,
      lowStockCount,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

export const getSalesStats = async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Grouper par jour
    const salesByDay: Record<string, { date: string; revenue: number; orders: number }> = {};

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!salesByDay[date]) {
        salesByDay[date] = { date, revenue: 0, orders: 0 };
      }
      salesByDay[date].revenue += Number(order.total);
      salesByDay[date].orders += 1;
    });

    const salesData = Object.values(salesByDay);

    res.json({
      period: days,
      data: salesData,
      totals: {
        revenue: salesData.reduce((sum, day) => sum + day.revenue, 0),
        orders: salesData.reduce((sum, day) => sum + day.orders, 0),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des ventes' });
  }
};

export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: { productId: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: parseInt(limit as string),
    });

    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        nameFr: true,
        nameEn: true,
        price: true,
        images: true,
        stock: true,
      },
    });

    const result = topProducts.map((tp) => {
      const product = products.find((p) => p.id === tp.productId);
      return {
        ...product,
        totalSold: tp._sum.quantity,
        orderCount: tp._count.productId,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits populaires:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits populaires' });
  }
};

export const getOrdersByStatus = async (_req: Request, res: Response) => {
  try {
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const result = ordersByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));

    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes par statut:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes par statut' });
  }
};

export const getRecentOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { select: { quantity: true } },
      },
    });

    res.json(orders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes récentes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes récentes' });
  }
};
