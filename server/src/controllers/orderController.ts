import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SAS-${timestamp}-${random}`;
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const isAdmin = req.user?.role === 'ADMIN';

    const where: any = {};

    if (!isAdmin) {
      where.userId = req.user!.id;
    }

    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: { product: { select: { images: true, slug: true } } },
          },
          user: isAdmin ? { select: { id: true, email: true, firstName: true, lastName: true } } : false,
          address: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'ADMIN';

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { images: true, slug: true } } },
        },
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        address: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Commande non trouvée' });
      return;
    }

    // Vérifier que l'utilisateur a accès à cette commande
    if (!isAdmin && order.userId !== req.user!.id) {
      res.status(403).json({ error: 'Accès non autorisé' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, addressId, notes } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Le panier est vide' });
      return;
    }

    // Vérifier l'adresse
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.id },
    });

    if (!address) {
      res.status(400).json({ error: 'Adresse non valide' });
      return;
    }

    // Récupérer les produits et vérifier les stocks
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== items.length) {
      res.status(400).json({ error: 'Un ou plusieurs produits ne sont pas disponibles' });
      return;
    }

    // Vérifier les stocks
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        res.status(400).json({ error: `Stock insuffisant pour ${product?.nameFr || 'un produit'}` });
        return;
      }
    }

    // Calculer les totaux
    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;
      return {
        productId: item.productId,
        nameFr: product.nameFr,
        nameEn: product.nameEn,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const shipping = subtotal >= 50 ? 0 : 5.99;
    const total = subtotal + shipping;

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user!.id,
        addressId,
        subtotal,
        shipping,
        total,
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        address: true,
      },
    });

    // Mettre à jour les stocks
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Statut invalide' });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        user: { select: { email: true, firstName: true } },
      },
    });

    // Si annulation, restaurer les stocks
    if (status === 'CANCELLED' || status === 'REFUNDED') {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Commande non trouvée' });
      return;
    }

    if (order.userId !== req.user!.id) {
      res.status(403).json({ error: 'Accès non autorisé' });
      return;
    }

    if (!['PENDING', 'PAID'].includes(order.status)) {
      res.status(400).json({ error: 'Cette commande ne peut plus être annulée' });
      return;
    }

    // Restaurer les stocks
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de l\'annulation de la commande' });
  }
};
