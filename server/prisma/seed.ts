import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding de la base de données...');

  // Créer les catégories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'sprays' },
      update: {},
      create: {
        nameFr: 'Sprays de défense',
        nameEn: 'Defense Sprays',
        slug: 'sprays',
        image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'alarms' },
      update: {},
      create: {
        nameFr: 'Alarmes personnelles',
        nameEn: 'Personal Alarms',
        slug: 'alarms',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        nameFr: 'Accessoires',
        nameEn: 'Accessories',
        slug: 'accessories',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      },
    }),
  ]);

  console.log('Catégories créées:', categories.length);

  // Créer les produits
  const products = await Promise.all([
    // Sprays
    prisma.product.upsert({
      where: { slug: 'spray-poivre-50ml' },
      update: {},
      create: {
        nameFr: 'Spray au poivre 50ml',
        nameEn: 'Pepper Spray 50ml',
        slug: 'spray-poivre-50ml',
        descriptionFr: '<p>Spray de défense au poivre OC haute concentration. Portée de 3-4 mètres. Format compact idéal pour le transport quotidien.</p><ul><li>Concentration OC 10%</li><li>Portée 3-4m</li><li>50ml - environ 20 utilisations</li></ul>',
        descriptionEn: '<p>High concentration OC pepper defense spray. Range of 3-4 meters. Compact format ideal for daily carry.</p><ul><li>OC concentration 10%</li><li>Range 3-4m</li><li>50ml - approximately 20 uses</li></ul>',
        price: 19.99,
        comparePrice: 24.99,
        stock: 50,
        lowStockAlert: 10,
        images: ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'],
        categoryId: categories[0].id,
        isFeatured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'spray-gel-poivre-75ml' },
      update: {},
      create: {
        nameFr: 'Spray Gel au poivre 75ml',
        nameEn: 'Pepper Gel Spray 75ml',
        slug: 'spray-gel-poivre-75ml',
        descriptionFr: '<p>Formule gel qui réduit les risques de contamination croisée. Ne coule pas et adhère à la cible.</p>',
        descriptionEn: '<p>Gel formula that reduces cross-contamination risks. Does not drip and adheres to target.</p>',
        price: 29.99,
        stock: 35,
        lowStockAlert: 8,
        images: ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'],
        categoryId: categories[0].id,
        isFeatured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'spray-defense-compact' },
      update: {},
      create: {
        nameFr: 'Spray défense format porte-clés',
        nameEn: 'Keychain Defense Spray',
        slug: 'spray-defense-compact',
        descriptionFr: '<p>Format ultra-compact avec anneau porte-clés. Toujours à portée de main.</p>',
        descriptionEn: '<p>Ultra-compact format with keychain ring. Always within reach.</p>',
        price: 14.99,
        stock: 100,
        lowStockAlert: 20,
        images: ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'],
        categoryId: categories[0].id,
      },
    }),

    // Alarmes
    prisma.product.upsert({
      where: { slug: 'alarme-personnelle-120db' },
      update: {},
      create: {
        nameFr: 'Alarme personnelle 120dB',
        nameEn: 'Personal Alarm 120dB',
        slug: 'alarme-personnelle-120db',
        descriptionFr: '<p>Alarme puissante de 120dB avec LED intégrée. Activation par goupille. Batterie longue durée incluse.</p>',
        descriptionEn: '<p>Powerful 120dB alarm with integrated LED. Pin activation. Long-lasting battery included.</p>',
        price: 12.99,
        comparePrice: 16.99,
        stock: 75,
        lowStockAlert: 15,
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
        categoryId: categories[1].id,
        isFeatured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'alarme-usb-rechargeable' },
      update: {},
      create: {
        nameFr: 'Alarme USB rechargeable 130dB',
        nameEn: 'USB Rechargeable Alarm 130dB',
        slug: 'alarme-usb-rechargeable',
        descriptionFr: '<p>Alarme rechargeable par USB. 130dB pour une protection maximale. Design élégant.</p>',
        descriptionEn: '<p>USB rechargeable alarm. 130dB for maximum protection. Elegant design.</p>',
        price: 18.99,
        stock: 40,
        lowStockAlert: 10,
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
        categoryId: categories[1].id,
      },
    }),

    // Accessoires
    prisma.product.upsert({
      where: { slug: 'etui-ceinture-spray' },
      update: {},
      create: {
        nameFr: 'Étui ceinture pour spray',
        nameEn: 'Belt Holster for Spray',
        slug: 'etui-ceinture-spray',
        descriptionFr: '<p>Étui en nylon robuste avec clip ceinture. Compatible avec la plupart des sprays.</p>',
        descriptionEn: '<p>Robust nylon holster with belt clip. Compatible with most sprays.</p>',
        price: 9.99,
        stock: 60,
        lowStockAlert: 15,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'],
        categoryId: categories[2].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'bracelet-alarme' },
      update: {},
      create: {
        nameFr: 'Bracelet alarme discret',
        nameEn: 'Discreet Alarm Bracelet',
        slug: 'bracelet-alarme',
        descriptionFr: '<p>Bracelet avec alarme intégrée. Design discret et élégant. Parfait pour le jogging.</p>',
        descriptionEn: '<p>Bracelet with integrated alarm. Discreet and elegant design. Perfect for jogging.</p>',
        price: 24.99,
        stock: 25,
        lowStockAlert: 5,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'],
        categoryId: categories[2].id,
        isFeatured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'lampe-torche-defense' },
      update: {},
      create: {
        nameFr: 'Lampe torche tactique LED',
        nameEn: 'Tactical LED Flashlight',
        slug: 'lampe-torche-defense',
        descriptionFr: '<p>Lampe torche haute puissance avec mode stroboscopique défensif. Corps en aluminium.</p>',
        descriptionEn: '<p>High power flashlight with defensive strobe mode. Aluminum body.</p>',
        price: 34.99,
        comparePrice: 44.99,
        stock: 3,
        lowStockAlert: 5,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'],
        categoryId: categories[2].id,
      },
    }),
  ]);

  console.log('Produits créés:', products.length);

  // Créer un utilisateur admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@soundandsafe.com' },
    update: {},
    create: {
      email: 'admin@soundandsafe.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'SoundAndSafe',
      role: 'ADMIN',
    },
  });

  console.log('Admin créé:', admin.email);

  // Créer un utilisateur test
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      password: userPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '0612345678',
      role: 'CUSTOMER',
      addresses: {
        create: {
          label: 'Domicile',
          firstName: 'Jean',
          lastName: 'Dupont',
          street: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
          phone: '0612345678',
          isDefault: true,
        },
      },
    },
  });

  console.log('Utilisateur test créé:', user.email);

  console.log('Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
