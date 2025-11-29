import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const fixRestaurantIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("restaurants");

    // 1. List current indexes
    console.log("\n📋 Current indexes:");
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // 2. Drop the problematic email_1 index if it exists
    try {
      await collection.dropIndex("email_1");
      console.log("\n✅ Dropped 'email_1' index");
    } catch (error) {
      console.log("\n⚠️  'email_1' index not found or already dropped");
    }

    // 3. Find and delete restaurants with null email (duplicates)
    const nullEmailRestaurants = await collection
      .find({ email: null })
      .toArray();
    console.log(
      `\n📦 Found ${nullEmailRestaurants.length} restaurants with email: null`
    );

    if (nullEmailRestaurants.length > 0) {
      // Keep only the first one, delete the rest
      const idsToDelete = nullEmailRestaurants
        .slice(1)
        .map((r) => r._id);
      if (idsToDelete.length > 0) {
        await collection.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`✅ Deleted ${idsToDelete.length} duplicate restaurants`);
      }
    }

    // 4. Create a sparse index on email (allows multiple null values)
    await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log("\n✅ Created sparse unique index on email field");

    // 5. Verify indexes after cleanup
    console.log("\n📋 Indexes after cleanup:");
    const finalIndexes = await collection.indexes();
    console.log(JSON.stringify(finalIndexes, null, 2));

    console.log("\n✅ Restaurant index fix completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing restaurant index:", error);
    process.exit(1);
  }
};

fixRestaurantIndex();
