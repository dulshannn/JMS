const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check existing jewellery
    const jewelleryData = await mongoose.connection.db.collection('jewelleries').find({}).toArray();
    console.log('Current jewellery count:', jewelleryData.length);
    
    // Add 13 more jewellery items
    const newItems = [
      {
        name: 'Diamond Solitaire Ring',
        type: 'Ring',
        weight: 2.5,
        quantity: 3,
        price: 250000,
        description: 'Classic solitaire diamond ring with platinum band',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ruby Tennis Bracelet',
        type: 'Bracelet',
        weight: 8.2,
        quantity: 2,
        price: 180000,
        description: 'Elegant tennis bracelet with ruby accents',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Emerald Drop Earrings',
        type: 'Earring',
        weight: 1.8,
        quantity: 4,
        price: 95000,
        description: 'Stunning emerald drop earrings with white gold',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sapphire Heart Necklace',
        type: 'Necklace',
        weight: 3.5,
        quantity: 2,
        price: 165000,
        description: 'Romantic heart-shaped sapphire necklace',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gold Cuban Link Chain',
        type: 'Chain',
        weight: 12.0,
        quantity: 5,
        price: 85000,
        description: 'Classic Cuban link chain in 22K gold',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pearl Cluster Ring',
        type: 'Ring',
        weight: 3.2,
        quantity: 2,
        price: 120000,
        description: 'Elegant pearl cluster ring with diamond accents',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tanzanite Cocktail Ring',
        type: 'Ring',
        weight: 2.8,
        quantity: 1,
        price: 320000,
        description: 'Rare tanzanite cocktail ring with platinum setting',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Diamond Hoop Earrings',
        type: 'Earring',
        weight: 2.1,
        quantity: 6,
        price: 110000,
        description: 'Classic diamond hoop earrings in white gold',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ruby Bangle',
        type: 'Bangle',
        weight: 15.5,
        quantity: 3,
        price: 195000,
        description: 'Traditional ruby bangle with intricate design',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Aquamarine Pendant',
        type: 'Necklace',
        weight: 1.2,
        quantity: 4,
        price: 75000,
        description: 'Beautiful aquamarine pendant with diamond halo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Platinum Wedding Band',
        type: 'Ring',
        weight: 4.0,
        quantity: 8,
        price: 145000,
        description: 'Classic platinum wedding band with comfort fit',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Emerald Tennis Necklace',
        type: 'Necklace',
        weight: 6.8,
        quantity: 2,
        price: 280000,
        description: 'Luxurious emerald tennis necklace with white gold',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Rose Gold Chain',
        type: 'Chain',
        weight: 8.5,
        quantity: 7,
        price: 65000,
        description: 'Modern rose gold chain with unique design',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const result = await mongoose.connection.db.collection('jewelleries').insertMany(newItems);
    console.log('✅ Added', result.insertedCount, 'new jewellery items');
    
    // Verify total count
    const totalItems = await mongoose.connection.db.collection('jewelleries').countDocuments();
    console.log('📊 Total jewellery items now:', totalItems);
    
    console.log('\n📝 Added Items:');
    newItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - ${item.type} - LKR ${item.price.toLocaleString()}`);
    });
    
    mongoose.connection.close();
    console.log('\n✅ Database updated successfully!');
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
