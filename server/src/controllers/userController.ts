import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '20' } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            items: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['CUSTOMER', 'ADMIN'].includes(role)) {
      res.status(400).json({ error: 'Rôle invalide' });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle' });
  }
};

// Gestion des adresses pour les utilisateurs
export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: { isDefault: 'desc' },
    });

    res.json(addresses);
  } catch (error) {
    console.error('Erreur lors de la récupération des adresses:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des adresses' });
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { label, firstName, lastName, street, city, postalCode, country, phone, isDefault } = req.body;

    // Si c'est l'adresse par défaut, retirer le défaut des autres
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user!.id,
        label,
        firstName,
        lastName,
        street,
        city,
        postalCode,
        country: country || 'France',
        phone,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json(address);
  } catch (error) {
    console.error('Erreur lors de la création de l\'adresse:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'adresse' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Vérifier que l'adresse appartient à l'utilisateur
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existingAddress) {
      res.status(404).json({ error: 'Adresse non trouvée' });
      return;
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data,
    });

    res.json(address);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'adresse:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'adresse' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const address = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!address) {
      res.status(404).json({ error: 'Adresse non trouvée' });
      return;
    }

    // Vérifier si l'adresse est utilisée dans des commandes
    const ordersCount = await prisma.order.count({ where: { addressId: id } });
    if (ordersCount > 0) {
      res.status(400).json({ error: 'Cette adresse est liée à des commandes et ne peut pas être supprimée' });
      return;
    }

    await prisma.address.delete({ where: { id } });

    res.json({ message: 'Adresse supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'adresse:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'adresse' });
  }
};
