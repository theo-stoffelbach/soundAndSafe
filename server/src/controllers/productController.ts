import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
      page = '1',
      limit = '12',
      featured,
      active = 'true'
    } = req.query;

    const where: any = {};

    if (active === 'true') {
      where.isActive = true;
    } else if (active === 'false') {
      where.isActive = false;
    }

    if (category) {
      where.category = { slug: category as string };
    }

    if (search) {
      where.OR = [
        { nameFr: { contains: search as string, mode: 'insensitive' } },
        { nameEn: { contains: search as string, mode: 'insensitive' } },
        { descriptionFr: { contains: search as string, mode: 'insensitive' } },
        { descriptionEn: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { [sortBy as string]: order },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Produit non trouvé' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Produit non trouvé' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      nameFr, nameEn, slug, descriptionFr, descriptionEn,
      price, comparePrice, stock, lowStockAlert, images,
      categoryId, isFeatured
    } = req.body;

    const product = await prisma.product.create({
      data: {
        nameFr,
        nameEn,
        slug,
        descriptionFr,
        descriptionEn,
        price,
        comparePrice,
        stock: stock || 0,
        lowStockAlert: lowStockAlert || 5,
        images: images || [],
        categoryId,
        isFeatured: isFeatured || false,
      },
      include: { category: true },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    res.json(product);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete - désactiver le produit
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Produit désactivé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la désactivation du produit:', error);
    res.status(500).json({ error: 'Erreur lors de la désactivation du produit' });
  }
};

export const restoreProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.update({
      where: { id },
      data: { isActive: true },
    });

    res.json({ message: 'Produit réactivé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la réactivation du produit:', error);
    res.status(500).json({ error: 'Erreur lors de la réactivation du produit' });
  }
};

export const getLowStockProducts = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: prisma.product.fields.lowStockAlert },
      },
      include: { category: true },
      orderBy: { stock: 'asc' },
    });

    // Alternative approach since Prisma doesn't support field comparison directly
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
    });

    const lowStockProducts = allProducts.filter(p => p.stock <= p.lowStockAlert);

    res.json(lowStockProducts);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits en rupture:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits en rupture' });
  }
};
