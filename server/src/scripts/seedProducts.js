
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';

const BRANCH_ID = '6ae64c015faaba915dc607ba';

// KEEP YOUR EXISTING 70 PRODUCTS ARRAY HERE

const products = [
  // CHAAP (001–013)
  { sku: 'PCJ-001', name: 'Malai Chaap', category: 'Chaap', sellingPrice: 270 },
  { sku: 'PCJ-002', name: 'Afghani Chaap', category: 'Chaap', sellingPrice: 270 },
  { sku: 'PCJ-003', name: 'Tawa Chaap', category: 'Chaap', sellingPrice: 280 },
  { sku: 'PCJ-004', name: 'Masala Chaap', category: 'Chaap', sellingPrice: 250 },
  { sku: 'PCJ-005', name: 'Achari Chaap', category: 'Chaap', sellingPrice: 260 },
  { sku: 'PCJ-006', name: 'Punjabi Chaap', category: 'Chaap', sellingPrice: 280 },
  { sku: 'PCJ-007', name: 'Peri Peri Chaap', category: 'Chaap', sellingPrice: 290 },
  { sku: 'PCJ-008', name: 'Haryali Chaap', category: 'Chaap', sellingPrice: 270 },
  { sku: 'PCJ-009', name: 'Mughlai Chaap', category: 'Chaap', sellingPrice: 290 },
  { sku: 'PCJ-010', name: 'Lemon Chaap', category: 'Chaap', sellingPrice: 250 },
  { sku: 'PCJ-011', name: 'Kurkuri Chaap', category: 'Chaap', sellingPrice: 280 },
  { sku: 'PCJ-012', name: 'Stuffed Chaap', category: 'Chaap', sellingPrice: 300 },
  { sku: 'PCJ-013', name: 'Pudina Chaap', category: 'Chaap', sellingPrice: 260 },

  // STARTERS (014–025)
  { sku: 'PCJ-014', name: 'Paneer Tikka', category: 'Starters', sellingPrice: 290 },
  { sku: 'PCJ-015', name: 'Paneer Malai Tikka', category: 'Starters', sellingPrice: 310 },
  { sku: 'PCJ-016', name: 'Hara Bhara Kebab', category: 'Starters', sellingPrice: 220 },
  { sku: 'PCJ-017', name: 'Veg Seekh Kebab', category: 'Starters', sellingPrice: 240 },
  { sku: 'PCJ-018', name: 'Crispy Corn', category: 'Starters', sellingPrice: 190 },
  { sku: 'PCJ-019', name: 'Honey Chilli Potato', category: 'Starters', sellingPrice: 210 },
  { sku: 'PCJ-020', name: 'Chilli Paneer', category: 'Starters', sellingPrice: 260 },
  { sku: 'PCJ-021', name: 'Veg Manchurian', category: 'Starters', sellingPrice: 220 },
  { sku: 'PCJ-022', name: 'Mushroom Tikka', category: 'Starters', sellingPrice: 270 },
  { sku: 'PCJ-023', name: 'Dahi Ke Kebab', category: 'Starters', sellingPrice: 240 },
  { sku: 'PCJ-024', name: 'French Fries', category: 'Starters', sellingPrice: 130 },
  { sku: 'PCJ-025', name: 'Peri Peri Fries', category: 'Starters', sellingPrice: 160 },

  // MAIN COURSE (026–047)
  { sku: 'PCJ-026', name: 'Dal Makhani', category: 'Main Course', sellingPrice: 250 },
  { sku: 'PCJ-027', name: 'Shahi Paneer', category: 'Main Course', sellingPrice: 280 },
  { sku: 'PCJ-028', name: 'Kadai Paneer', category: 'Main Course', sellingPrice: 290 },
  { sku: 'PCJ-029', name: 'Paneer Butter Masala', category: 'Main Course', sellingPrice: 290 },
  { sku: 'PCJ-030', name: 'Paneer Lababdar', category: 'Main Course', sellingPrice: 300 },
  { sku: 'PCJ-031', name: 'Matar Paneer', category: 'Main Course', sellingPrice: 260 },
  { sku: 'PCJ-032', name: 'Palak Paneer', category: 'Main Course', sellingPrice: 270 },
  { sku: 'PCJ-033', name: 'Mix Veg', category: 'Main Course', sellingPrice: 230 },
  { sku: 'PCJ-034', name: 'Veg Kolhapuri', category: 'Main Course', sellingPrice: 250 },
  { sku: 'PCJ-035', name: 'Kadai Mushroom', category: 'Main Course', sellingPrice: 280 },
  { sku: 'PCJ-036', name: 'Chana Masala', category: 'Main Course', sellingPrice: 210 },
  { sku: 'PCJ-037', name: 'Rajma Masala', category: 'Main Course', sellingPrice: 220 },
  { sku: 'PCJ-038', name: 'Malai Kofta', category: 'Main Course', sellingPrice: 280 },
  { sku: 'PCJ-039', name: 'Veg Handi', category: 'Main Course', sellingPrice: 260 },
  { sku: 'PCJ-040', name: 'Mushroom Masala', category: 'Main Course', sellingPrice: 270 },
  { sku: 'PCJ-041', name: 'Jeera Rice', category: 'Main Course', sellingPrice: 160 },
  { sku: 'PCJ-042', name: 'Veg Pulao', category: 'Main Course', sellingPrice: 190 },
  { sku: 'PCJ-043', name: 'Veg Biryani', category: 'Main Course', sellingPrice: 220 },
  { sku: 'PCJ-044', name: 'Steam Rice', category: 'Main Course', sellingPrice: 140 },
  { sku: 'PCJ-045', name: 'Fried Rice', category: 'Main Course', sellingPrice: 190 },
  { sku: 'PCJ-046', name: 'Dal Tadka', category: 'Main Course', sellingPrice: 220 },
  { sku: 'PCJ-047', name: 'Dal Fry', category: 'Main Course', sellingPrice: 200 },

  // BREADS (048–060)
  { sku: 'PCJ-048', name: 'Garlic Naan', category: 'Breads', sellingPrice: 70, unit: 'PIECE' },
  { sku: 'PCJ-049', name: 'Butter Naan', category: 'Breads', sellingPrice: 60, unit: 'PIECE' },
  { sku: 'PCJ-050', name: 'Plain Naan', category: 'Breads', sellingPrice: 50, unit: 'PIECE' },
  { sku: 'PCJ-051', name: 'Tandoori Roti', category: 'Breads', sellingPrice: 20, unit: 'PIECE' },
  { sku: 'PCJ-052', name: 'Butter Roti', category: 'Breads', sellingPrice: 25, unit: 'PIECE' },
  { sku: 'PCJ-053', name: 'Lachha Paratha', category: 'Breads', sellingPrice: 60, unit: 'PIECE' },
  { sku: 'PCJ-054', name: 'Pudina Paratha', category: 'Breads', sellingPrice: 60, unit: 'PIECE' },
  { sku: 'PCJ-055', name: 'Aloo Paratha', category: 'Breads', sellingPrice: 80, unit: 'PIECE' },
  { sku: 'PCJ-056', name: 'Missi Roti', category: 'Breads', sellingPrice: 45, unit: 'PIECE' },
  { sku: 'PCJ-057', name: 'Plain Kulcha', category: 'Breads', sellingPrice: 50, unit: 'PIECE' },
  { sku: 'PCJ-058', name: 'Butter Kulcha', category: 'Breads', sellingPrice: 65, unit: 'PIECE' },
  { sku: 'PCJ-059', name: 'Stuffed Kulcha', category: 'Breads', sellingPrice: 90, unit: 'PIECE' },
  { sku: 'PCJ-060', name: 'Roomali Roti', category: 'Breads', sellingPrice: 30, unit: 'PIECE' },

  // MOMOS (061–063)
  { sku: 'PCJ-061', name: 'Veg Steamed Momos', category: 'Momos', sellingPrice: 120 },
  { sku: 'PCJ-062', name: 'Veg Fried Momos', category: 'Momos', sellingPrice: 140 },
  { sku: 'PCJ-063', name: 'Tandoori Momos', category: 'Momos', sellingPrice: 220 },

  // ROLLS (064–070)
  { sku: 'PCJ-064', name: 'Malai Chaap Roll', category: 'Rolls', sellingPrice: 160 },
  { sku: 'PCJ-065', name: 'Afghani Chaap Roll', category: 'Rolls', sellingPrice: 170 },
  { sku: 'PCJ-066', name: 'Paneer Tikka Roll', category: 'Rolls', sellingPrice: 160 },
  { sku: 'PCJ-067', name: 'Masala Chaap Roll', category: 'Rolls', sellingPrice: 150 },
  { sku: 'PCJ-068', name: 'Veg Seekh Roll', category: 'Rolls', sellingPrice: 140 },
  { sku: 'PCJ-069', name: 'Kurkuri Chaap Roll', category: 'Rolls', sellingPrice: 170 },
  { sku: 'PCJ-070', name: 'Paneer Bhurji Roll', category: 'Rolls', sellingPrice: 160 }
];


const seedProducts = async () => {
  try {
    await connectDB();

    const branchId = new mongoose.Types.ObjectId(BRANCH_ID);

    const branch = await mongoose.connection
      .collection('branches')
      .findOne({ _id: branchId });

    if (!branch) {
      throw new Error('Faridabad branch not found.');
    }

    // Validate required product fields before importing.
    for (const product of products) {
      if (
        !product.sku ||
        !product.name ||
        !product.category ||
        product.sellingPrice === undefined
      ) {
        throw new Error(
          `Missing required field in product: ${product.sku || product.name || 'Unknown'}`
        );
      }
    }

    const operations = products.map((product) => ({
      updateOne: {
        filter: {
          branchId,
          sku: product.sku
        },
        update: {
          $setOnInsert: {
            ...product,
            unit: product.unit || 'PORTION',
            stock: 0,
            minStock: 10,
            cost: 0,
            location: 'Faridabad - Sector 49',
            branchId
          }
        },
        upsert: true
      }
    }));

    const result = await Product.bulkWrite(operations);

    console.log('\nProduct import completed!');
    console.log('Branch:', branch.name);
    console.log('Products processed:', products.length);
    console.log('New products inserted:', result.upsertedCount);
    console.log('Existing products skipped:', result.matchedCount);
    console.log('Stock and cost for new products are placeholders (0).');

  } catch (error) {
    console.error('Product import failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

seedProducts();
