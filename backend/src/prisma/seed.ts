import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const menuItems = [
  // Snacks
  {
    name: 'Kachori',
    category: 'snacks',
    description: 'Crispy fried pastry filled with spiced moong dal and potatoes',
    price: 50,
    image: 'https://images.unsplash.com/photo-1667521121517-a96c62b1b3b4?w=500&h=500&fit=crop',
    rating: 4.5,
    reviewCount: 120,
    isVegetarian: true,
    spiceLevel: 'medium',
    preparationTime: 10,
    availability: true,
  },
  {
    name: 'Mirchi Vada',
    category: 'snacks',
    description: 'Green chili stuffed with potato and spices, deep fried until golden',
    price: 45,
    image: 'https://images.unsplash.com/photo-1599599810694-b3b41c56ae38?w=500&h=500&fit=crop',
    rating: 4.3,
    reviewCount: 95,
    isVegetarian: true,
    spiceLevel: 'hot',
    preparationTime: 12,
    availability: true,
  },
  {
    name: 'Sev Puri',
    category: 'snacks',
    description: 'Crispy puri with boiled potatoes, chickpeas, onions and sev topped with chutneys',
    price: 60,
    image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b1?w=500&h=500&fit=crop',
    rating: 4.6,
    reviewCount: 110,
    isVegetarian: true,
    spiceLevel: 'medium',
    preparationTime: 8,
    availability: true,
  },
  {
    name: 'Dahi Puri',
    category: 'snacks',
    description: 'Crispy puris filled with potato, chickpeas, onions and topped with yogurt and tamarind chutney',
    price: 55,
    image: 'https://images.unsplash.com/photo-1585262369078-86e05809197f?w=500&h=500&fit=crop',
    rating: 4.4,
    reviewCount: 105,
    isVegetarian: true,
    spiceLevel: 'mild',
    preparationTime: 9,
    availability: true,
  },
  {
    name: 'Pani Puri',
    category: 'snacks',
    description: 'Hollow crispy puris filled with spiced potato, chickpeas, onions and flavored water',
    price: 50,
    image: 'https://images.unsplash.com/photo-1585238341710-4dd0bd180d8d?w=500&h=500&fit=crop',
    rating: 4.5,
    reviewCount: 130,
    isVegetarian: true,
    spiceLevel: 'medium',
    preparationTime: 7,
    availability: true,
  },
  {
    name: 'Moong Dal Pakoda',
    category: 'snacks',
    description: 'Crispy deep-fried fritters made with moong dal, onions and spices',
    price: 40,
    image: 'https://images.unsplash.com/photo-1582058116613-fba9b58ac736?w=500&h=500&fit=crop',
    rating: 4.2,
    reviewCount: 80,
    isVegetarian: true,
    spiceLevel: 'mild',
    preparationTime: 10,
    availability: true,
  },
  {
    name: 'Aloou Chat',
    category: 'snacks',
    description: 'Spiced potato salad with chickpeas, onions, tomatoes and tamarind chutney',
    price: 65,
    image: 'https://images.unsplash.com/photo-1644018322487-d1b1cbc79b05?w=500&h=500&fit=crop',
    rating: 4.3,
    reviewCount: 70,
    isVegetarian: true,
    spiceLevel: 'medium',
    preparationTime: 6,
    availability: true,
  },
  {
    name: 'Samosa Chat',
    category: 'snacks',
    description: 'Crumbled samosas topped with chickpeas, yogurt, onions and tangy chutneys',
    price: 70,
    image: 'https://images.unsplash.com/photo-1599599810974-d3977f1ef4c0?w=500&h=500&fit=crop',
    rating: 4.4,
    reviewCount: 85,
    isVegetarian: true,
    spiceLevel: 'medium',
    preparationTime: 8,
    availability: true,
  },
  {
    name: 'Papadi Chat',
    category: 'snacks',
    description: 'Crispy papadis topped with potato, chickpeas, yogurt and chutneys',
    price: 60,
    image: 'https://images.unsplash.com/photo-1645074066282-e7b80a4a7baa?w=500&h=500&fit=crop',
    rating: 4.3,
    reviewCount: 65,
    isVegetarian: true,
    spiceLevel: 'mild',
    preparationTime: 7,
    availability: true,
  },
  {
    name: 'Bhale Puri',
    category: 'breads',
    description: 'Puffed deep-fried bread made with maida and served with curry',
    price: 55,
    image: 'https://images.unsplash.com/photo-1589985643862-16f3d46ff5ac?w=500&h=500&fit=crop',
    rating: 4.2,
    reviewCount: 90,
    isVegetarian: true,
    spiceLevel: 'mild',
    preparationTime: 12,
    availability: true,
  },
  // Curries
  {
    name: 'Chole Batura',
    category: 'curries',
    description: 'Spiced chickpeas curry with fluffy deep-fried bread, a classic North Indian combo',
    price: 120,
    image: 'https://images.unsplash.com/photo-1596516109370-29001ec8ec36?w=500&h=500&fit=crop',
    rating: 4.7,
    reviewCount: 200,
    isVegetarian: true,
    spiceLevel: 'medium',
    preparationTime: 25,
    availability: true,
  },
  {
    name: 'Dal Batti Plate',
    category: 'curries',
    description: 'Creamy lentil curry served with hard bread balls, a traditional Rajasthani dish',
    price: 150,
    image: 'https://images.unsplash.com/photo-1585566119967-0e6d1b1c41fe?w=500&h=500&fit=crop',
    rating: 4.4,
    reviewCount: 75,
    isVegetarian: true,
    spiceLevel: 'medium',
    preparationTime: 30,
    availability: true,
  },
  // Desserts
  {
    name: 'Dal Ka Halwa',
    category: 'desserts',
    description: 'Sweet pudding made with lentils, ghee, sugar and dried fruits',
    price: 80,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
    rating: 4.6,
    reviewCount: 95,
    isVegetarian: true,
    spiceLevel: 'mild',
    preparationTime: 20,
    availability: true,
  },
  {
    name: 'Jalebi',
    category: 'desserts',
    description: 'Spiral-shaped sweet made with maida, deep-fried and soaked in sugar syrup',
    price: 70,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a104?w=500&h=500&fit=crop',
    rating: 4.5,
    reviewCount: 140,
    isVegetarian: true,
    spiceLevel: 'mild',
    preparationTime: 15,
    availability: true,
  },
  {
    name: 'Rabri',
    category: 'desserts',
    description: 'Thick, creamy milk dessert sweetened with sugar and flavored with cardamom',
    price: 90,
    image: 'https://images.unsplash.com/photo-1585365770305-47fab31649c3?w=500&h=500&fit=crop',
    rating: 4.7,
    reviewCount: 110,
    isVegetarian: true,
    spiceLevel: 'mild',
    preparationTime: 25,
    availability: true,
  },
  // Specialty
  {
    name: 'Mansukh Bhai',
    category: 'snacks',
    description: 'Our signature specialty dish - a unique blend of crispy exterior with soft, flavorful filling',
    price: 100,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=500&fit=crop',
    rating: 4.8,
    reviewCount: 250,
    isVegetarian: true,
    spiceLevel: 'medium',
    preparationTime: 15,
    availability: true,
  },
];

async function main() {
  console.log('Start seeding ...');

  // Clear existing menu items
  await prisma.menuItem.deleteMany();

  for (const item of menuItems) {
    const menuItem = await prisma.menuItem.create({
      data: item,
    });
    console.log(`Created menu item with id: ${menuItem.id} - ${menuItem.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
