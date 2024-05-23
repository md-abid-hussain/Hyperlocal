import mongoose from 'mongoose';

const reset = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  try {
    await Promise.all(
      collections.map(async (collectionName) => {
        const collection = mongoose.connection.collections[collectionName];
        await collection.deleteMany({});
      }),
    );
    console.log('Database reset successfully');
  } catch (error) {
    console.log(error);
  }
};

export default reset;
