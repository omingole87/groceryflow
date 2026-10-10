import { db } from './connection.js';

export async function seedDatabase() {
  await db.init();

  console.log('[Seed] Seeding authentic Indian grocery catalog in INR (₹)...');
  const products = [
    {
      id: 'prod_aashirvaad_atta',
      name: 'Aashirvaad Sharbati Select Chakki Atta (5 kg)',
      category: 'Atta, Rice & Dal',
      price: 245.00,
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
      unit: '5 kg bag',
      stock: 50,
    },
    {
      id: 'prod_amul_milk',
      name: 'Amul Taaza Fresh Homogenised Toned Milk (1 Litre)',
      category: 'Dairy & Bread',
      price: 56.00,
      image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
      unit: '1 Litre pouch',
      stock: 120,
    },
    {
      id: 'prod_malai_paneer',
      name: 'Fresh Dairy Malai Paneer (200g)',
      category: 'Dairy & Bread',
      price: 85.00,
      image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80',
      unit: '200g pack',
      stock: 40,
    },
    {
      id: 'prod_desi_tomatoes',
      name: 'Farm Fresh Desi Tomatoes (1 kg)',
      category: 'Fresh Vegetables',
      price: 38.00,
      image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
      unit: '1 kg bundle',
      stock: 100,
    },
    {
      id: 'prod_onions',
      name: 'Nasik Fresh Red Onions / Kanda (1 kg)',
      category: 'Fresh Vegetables',
      price: 34.00,
      image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80',
      unit: '1 kg mesh bag',
      stock: 150,
    },
    {
      id: 'prod_potatoes',
      name: 'Fresh Jyoti Potatoes / Aloo (1 kg)',
      category: 'Fresh Vegetables',
      price: 28.00,
      image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
      unit: '1 kg bundle',
      stock: 140,
    },
    {
      id: 'prod_amul_butter',
      name: 'Amul Pasteurised Salted Butter (100g)',
      category: 'Dairy & Bread',
      price: 58.00,
      image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
      unit: '100g pack',
      stock: 80,
    },
    {
      id: 'prod_basmati_rice',
      name: 'Daawat Rozana Super Basmati Rice (1 kg)',
      category: 'Atta, Rice & Dal',
      price: 115.00,
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
      unit: '1 kg pouch',
      stock: 65,
    },
    {
      id: 'prod_fortune_oil',
      name: 'Fortune Sunlite Refined Sunflower Oil (1 Litre)',
      category: 'Cooking Oil & Spices',
      price: 142.00,
      image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
      unit: '1 Litre bottle',
      stock: 45,
    },
    {
      id: 'prod_maggi',
      name: 'Nestlé Maggi 2-Minute Masala Noodles (Pack of 4)',
      category: 'Snacks & Instant Food',
      price: 56.00,
      image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=80',
      unit: '4 x 70g pack',
      stock: 110,
    },
    {
      id: 'prod_tata_salt',
      name: 'Tata Vacuum Evaporated Iodised Salt (1 kg)',
      category: 'Cooking Oil & Spices',
      price: 28.00,
      image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80',
      unit: '1 kg packet',
      stock: 90,
    },
    {
      id: 'prod_nagpur_oranges',
      name: 'Fresh Nagpur Sweet Santra (1 kg)',
      category: 'Fresh Fruits',
      price: 80.00,
      image_url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&q=80',
      unit: '1 kg bundle',
      stock: 50,
    },
  ];

  for (const p of products) {
    await db.query(
      `INSERT INTO products (id, name, category, price, image_url, unit, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE
       SET name = EXCLUDED.name,
           category = EXCLUDED.category,
           price = EXCLUDED.price,
           image_url = EXCLUDED.image_url,
           unit = EXCLUDED.unit`,
      [p.id, p.name, p.category, p.price, p.image_url, p.unit, p.stock]
    );
  }

  try {
    await db.query('ALTER TABLE slots ALTER COLUMN label TYPE VARCHAR(128)');
  } catch (_e) {}

  console.log('[Seed] Seeding Indian grocery delivery slots with capacity limits...');
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const slots = [
    {
      id: 'slot_today_morning',
      date: todayStr,
      start_time: '06:30',
      end_time: '08:30',
      label: 'Today 6:30 AM – 8:30 AM (Milk & Veggies)',
      capacity: 20,
      capacity_used: 18, // 2 left to easily test near-full!
    },
    {
      id: 'slot_today_noon',
      date: todayStr,
      start_time: '11:00',
      end_time: '13:00',
      label: 'Today 11:00 AM – 1:00 PM (Lunch Prep)',
      capacity: 20,
      capacity_used: 12,
    },
    {
      id: 'slot_today_evening',
      date: todayStr,
      start_time: '17:00',
      end_time: '19:00',
      label: 'Today 5:00 PM – 7:00 PM (Tea & Dinner)',
      capacity: 20,
      capacity_used: 5,
    },
    {
      id: 'slot_today_night',
      date: todayStr,
      start_time: '20:00',
      end_time: '22:00',
      label: 'Today 8:00 PM – 10:00 PM (Night Express)',
      capacity: 20,
      capacity_used: 20, // Fully booked!
    },
    {
      id: 'slot_tomorrow_morning',
      date: tomorrowStr,
      start_time: '06:30',
      end_time: '08:30',
      label: 'Tomorrow 6:30 AM – 8:30 AM (Essentials)',
      capacity: 25,
      capacity_used: 2,
    },
    {
      id: 'slot_tomorrow_evening',
      date: tomorrowStr,
      start_time: '17:00',
      end_time: '19:00',
      label: 'Tomorrow 5:00 PM – 7:00 PM (Evening)',
      capacity: 25,
      capacity_used: 0,
    },
  ];

  for (const s of slots) {
    await db.query(
      `INSERT INTO slots (id, date, start_time, end_time, label, capacity, capacity_used, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       ON CONFLICT (id) DO UPDATE
       SET label = EXCLUDED.label,
           date = EXCLUDED.date,
           start_time = EXCLUDED.start_time,
           end_time = EXCLUDED.end_time,
           capacity = EXCLUDED.capacity,
           capacity_used = EXCLUDED.capacity_used`,
      [s.id, s.date, s.start_time, s.end_time, s.label, s.capacity, s.capacity_used]
    );
  }

  console.log('[Seed] Database initialization & seeding completed in INR (₹) with Indian staples.');
}

// Allow direct execution
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}
