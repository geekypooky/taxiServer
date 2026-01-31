const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Taxi = require("./models/Taxi");
const Route = require("./models/Route");
const User = require("./models/User");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Sample Taxis
const taxis = [
  {
    name: "Swift Dzire",
    model: "Maruti Suzuki Swift Dzire",
    vehicleNumber: "TN01AB1234",
    taxiType: "Sedan",
    capacity: 4,
    pricePerKm: 12,
    driverName: "Rajesh Kumar",
    driverPhone: "+91-9876543210",
    amenities: ["AC", "Music System", "GPS"],
    operator: "Chennai Cabs",
    rating: 4.5,
    reviewCount: 120,
    isActive: true,
  },
  {
    name: "Toyota Innova",
    model: "Toyota Innova Crysta",
    vehicleNumber: "TN02CD5678",
    taxiType: "SUV",
    capacity: 7,
    pricePerKm: 18,
    driverName: "Suresh Babu",
    driverPhone: "+91-9876543211",
    amenities: ["AC", "Music System", "GPS", "Spacious Boot"],
    operator: "TamilNadu Travels",
    rating: 4.7,
    reviewCount: 85,
    isActive: true,
  },
  {
    name: "Maruti Alto",
    model: "Maruti Suzuki Alto K10",
    vehicleNumber: "TN03EF9012",
    taxiType: "Mini",
    capacity: 4,
    pricePerKm: 8,
    driverName: "Murugan S",
    driverPhone: "+91-9876543212",
    amenities: ["AC", "Music System"],
    operator: "Budget Cabs",
    rating: 4.2,
    reviewCount: 65,
    isActive: true,
  },
  {
    name: "Honda City",
    model: "Honda City ZX",
    vehicleNumber: "TN04GH3456",
    taxiType: "Sedan",
    capacity: 4,
    pricePerKm: 14,
    driverName: "Karthik R",
    driverPhone: "+91-9876543213",
    amenities: ["AC", "Music System", "GPS", "Phone Charger"],
    operator: "Elite Taxi Services",
    rating: 4.6,
    reviewCount: 95,
    isActive: true,
  },
  {
    name: "Mahindra XUV500",
    model: "Mahindra XUV500 W8",
    vehicleNumber: "TN05IJ7890",
    taxiType: "SUV",
    capacity: 7,
    pricePerKm: 20,
    driverName: "Venkatesh P",
    driverPhone: "+91-9876543214",
    amenities: ["AC", "Music System", "GPS", "Spacious Boot", "WiFi"],
    operator: "Premium Rides",
    rating: 4.8,
    reviewCount: 110,
    isActive: true,
  },
  {
    name: "Mercedes E-Class",
    model: "Mercedes-Benz E-Class E220d",
    vehicleNumber: "TN06KL1122",
    taxiType: "Luxury",
    capacity: 4,
    pricePerKm: 35,
    driverName: "Arjun Singh",
    driverPhone: "+91-9876543215",
    amenities: ["AC", "Music System", "GPS", "WiFi", "Phone Charger"],
    operator: "Luxury Cabs India",
    rating: 4.9,
    reviewCount: 45,
    isActive: true,
  },
  {
    name: "Hyundai i10",
    model: "Hyundai Grand i10 Nios",
    vehicleNumber: "TN07MN3344",
    taxiType: "Mini",
    capacity: 4,
    pricePerKm: 9,
    driverName: "Ravi Kumar",
    driverPhone: "+91-9876543216",
    amenities: ["AC", "Music System"],
    operator: "Quick Taxi",
    rating: 4.1,
    reviewCount: 78,
    isActive: true,
  },
  {
    name: "BMW 5 Series",
    model: "BMW 5 Series 520d",
    vehicleNumber: "TN08OP5566",
    taxiType: "Premium",
    capacity: 4,
    pricePerKm: 30,
    driverName: "Deepak Sharma",
    driverPhone: "+91-9876543217",
    amenities: ["AC", "Music System", "GPS", "WiFi", "Phone Charger"],
    operator: "Exec Rides",
    rating: 4.9,
    reviewCount: 62,
    isActive: true,
  },
];

// Sample Routes (will be populated after taxis are created)
const createRoutes = async (taxiIds) => {
  const routes = [
    // Chennai Routes
    {
      taxi: taxiIds[0],
      source: "Chennai",
      destination: "Coimbatore",
      departureTime: "06:00",
      arrivalTime: "13:00",
      duration: "7h 0m",
      distance: 500,
      price: 3500,
      offers: "10% off on first ride",
      discount: 10,
      isActive: true,
    },
    {
      taxi: taxiIds[1],
      source: "Chennai",
      destination: "Madurai",
      departureTime: "07:00",
      arrivalTime: "14:30",
      duration: "7h 30m",
      distance: 460,
      price: 4200,
      offers: "",
      discount: 0,
      isActive: true,
    },
    {
      taxi: taxiIds[2],
      source: "Chennai",
      destination: "Salem",
      departureTime: "08:00",
      arrivalTime: "13:00",
      duration: "5h 0m",
      distance: 340,
      price: 2400,
      offers: "Weekend special",
      discount: 15,
      isActive: true,
    },
    // Coimbatore Routes
    {
      taxi: taxiIds[3],
      source: "Coimbatore",
      destination: "Chennai",
      departureTime: "05:30",
      arrivalTime: "12:30",
      duration: "7h 0m",
      distance: 500,
      price: 3600,
      offers: "",
      discount: 0,
      isActive: true,
    },
    {
      taxi: taxiIds[4],
      source: "Coimbatore",
      destination: "Madurai",
      departureTime: "09:00",
      arrivalTime: "13:00",
      duration: "4h 0m",
      distance: 215,
      price: 2800,
      offers: "",
      discount: 0,
      isActive: true,
    },
    // Madurai Routes
    {
      taxi: taxiIds[5],
      source: "Madurai",
      destination: "Chennai",
      departureTime: "06:00",
      arrivalTime: "13:30",
      duration: "7h 30m",
      distance: 460,
      price: 5500,
      offers: "Luxury ride special",
      discount: 5,
      isActive: true,
    },
    {
      taxi: taxiIds[6],
      source: "Madurai",
      destination: "Trichy",
      departureTime: "10:00",
      arrivalTime: "12:30",
      duration: "2h 30m",
      distance: 135,
      price: 1500,
      offers: "",
      discount: 0,
      isActive: true,
    },
    // Salem Routes
    {
      taxi: taxiIds[7],
      source: "Salem",
      destination: "Chennai",
      departureTime: "07:00",
      arrivalTime: "12:00",
      duration: "5h 0m",
      distance: 340,
      price: 4500,
      offers: "Premium comfort",
      discount: 0,
      isActive: true,
    },
    {
      taxi: taxiIds[0],
      source: "Salem",
      destination: "Coimbatore",
      departureTime: "14:00",
      arrivalTime: "17:30",
      duration: "3h 30m",
      distance: 165,
      price: 1800,
      offers: "",
      discount: 0,
      isActive: true,
    },
    // Additional popular routes
    {
      taxi: taxiIds[1],
      source: "Chennai",
      destination: "Trichy",
      departureTime: "08:30",
      arrivalTime: "14:00",
      duration: "5h 30m",
      distance: 320,
      price: 3200,
      offers: "",
      discount: 0,
      isActive: true,
    },
    {
      taxi: taxiIds[3],
      source: "Trichy",
      destination: "Chennai",
      departureTime: "06:30",
      arrivalTime: "12:00",
      duration: "5h 30m",
      distance: 320,
      price: 3300,
      offers: "",
      discount: 0,
      isActive: true,
    },
    {
      taxi: taxiIds[2],
      source: "Chennai",
      destination: "Vellore",
      departureTime: "09:00",
      arrivalTime: "12:00",
      duration: "3h 0m",
      distance: 145,
      price: 1600,
      offers: "Budget friendly",
      discount: 20,
      isActive: true,
    },
  ];

  return await Route.insertMany(routes);
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Taxi.deleteMany({});
    await Route.deleteMany({});
    console.log("✅ Existing data cleared\n");

    // Insert taxis
    console.log("🚕 Creating taxis...");
    const createdTaxis = await Taxi.insertMany(taxis);
    console.log(`✅ Created ${createdTaxis.length} taxis\n`);

    // Get taxi IDs
    const taxiIds = createdTaxis.map((taxi) => taxi._id);

    // Insert routes
    console.log("🗺️  Creating routes...");
    const createdRoutes = await createRoutes(taxiIds);
    console.log(`✅ Created ${createdRoutes.length} routes\n`);

    // Check if admin exists
    console.log("👤 Checking admin user...");
    const adminExists = await User.findOne({ role: "admin" });
    
    if (!adminExists) {
      console.log("creating default admin user...");
      await User.create({
        name: "Admin",
        email: process.env.ADMIN_EMAIL || "admin@travelbooking.com",
        password: process.env.ADMIN_PASSWORD || "Admin@123",
        phone: "0000000000",
        role: "admin",
      });
      console.log("✅ Admin user created: admin@travelbooking.com / Admin@123\n");
    } else {
      console.log(`✅ Admin user exists: ${adminExists.email}\n`);
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Taxis: ${createdTaxis.length}`);
    console.log(`   - Routes: ${createdRoutes.length}`);
    console.log("\n🚀 Your taxi booking system is ready to use!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run seeder
connectDB().then(() => seedDatabase());
