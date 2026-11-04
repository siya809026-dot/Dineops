
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';

dotenv.config();

// Use Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected!');

    const result = await mongoose.connection
      .collection('products')
      .updateOne(
        {
          _id: new mongoose.Types.ObjectId(
            '6ae72b4af06182c30177eaf6'
          )
        },
        {
          $set: {
            branchId: new mongoose.Types.ObjectId(
              '6ae64c015faaba915dc607ba'
            )
          }
        }
      );

    console.log('Update result:', result);

    const updatedProduct = await mongoose.connection
      .collection('products')
      .findOne({
        _id: new mongoose.Types.ObjectId(
          '6ae72b4af06182c30177eaf6'
        )
      });

    console.log('Updated product:', updatedProduct);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

run();
