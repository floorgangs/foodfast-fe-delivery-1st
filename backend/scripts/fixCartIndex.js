import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function fixCartIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("carts");

    // List all indexes
    console.log("\nCurrent indexes:");
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Drop the old 'user_1' index if it exists
    try {
      await collection.dropIndex("user_1");
      console.log("\nDropped 'user_1' index");
    } catch (error) {
      console.log("\nIndex 'user_1' does not exist or already dropped");
    }

    // Delete duplicate guest carts (user: null)
    const guestCarts = await collection.find({ user: null }).toArray();
    console.log(`\nFound ${guestCarts.length} guest carts with user: null`);
    
    if (guestCarts.length > 1) {
      // Keep only the first one, delete the rest
      const idsToDelete = guestCarts.slice(1).map(cart => cart._id);
      const result = await collection.deleteMany({ _id: { $in: idsToDelete } });
      console.log(`Deleted ${result.deletedCount} duplicate guest carts`);
    }

    // List indexes again
    console.log("\nIndexes after cleanup:");
    const indexesAfter = await collection.indexes();
    console.log(JSON.stringify(indexesAfter, null, 2));

    console.log("\nCart index fix completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixCartIndex();
