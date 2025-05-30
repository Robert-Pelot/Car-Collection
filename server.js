// last edit 02092025

const fs = require("fs");
const path = require("path");
const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob"); // Azure SDK for Blob Storage
require("dotenv").config(); // Use environment variables from .env file

const app = express();
const port = 3000;

// Azure Blob Storage Setup
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "car-images"; // The container where you will store the images
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Set up the path to the certificate
const certPath = process.env.DB_SSL_CA_PATH;;
const caCert = fs.readFileSync(certPath);

// Serve static files from the 'public' directory

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));
app.use("/images", express.static(path.join(__dirname, "../images")));

// Create the MySQL connection with the CA certificate
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: caCert,
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true", // Convert to boolean
    debug: process.env.DB_SSL_DEBUG === "true", // Convert to boolean
  },
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: ", err.stack);
    return;
  }
  console.log("Connected to the database");
});

// Set up body parsing for POST requests
app.use(express.static(path.join(__dirname, "public")));

// Main page route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});

// Route for the Add Car page
app.get("/add-car", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "add-car.html"));
});

// Route for the View Cars page
app.get("/view-cars", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "view-cars.html"));
});

// Route for the Edit Cars page
app.get("/edit-cars", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "edit-cars.html"));
});

// Endpoint to fetch all cars (used in the "view cars" page)
app.get("/api/cars", (req, res) => {
  const query = "SELECT * FROM Cars";

  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching cars:", err);
      res
        .status(500)
        .send({ error: "Error fetching car data", details: err.message });
    } else {
      res.json(result);
    }
  });
});

// Endpoint to fetch a car by CarID (used in the "edit car" form)
app.get("/api/car", (req, res) => {
  const CarID = req.query.carID; // Get CarID from query parameters
  if (!CarID) {
    return res.status(400).send({ error: "CarID is required" });
  }
  const query = "SELECT * FROM Cars WHERE carID = ?"; // Query to get the specific car

  connection.query(query, [CarID], (err, result) => {
    if (err) {
      console.error("Error fetching car from DB:", err);
      return res.status(500).send({ error: "Database error", details: err.message });
    }
    if (result.length === 0) {
      console.log('No car found with ID:', CarID);
      return res.status(404).send({ error: "Car not found" });
    }
    res.json(result[0]); // Send the first (and only) result
  });
});

app.get("/make", (req, res) => {
  connection.query("SELECT * FROM make", (err, results) => {  
    if (err) {
      return res.status(500).send("Error Fetching Makes");
    } else {
      res.json(results); // Send the data as JSON
    }
  });
});

// Endpoint to fetch brands
app.get("/brands", (req, res) => {
  connection.query("SELECT * FROM brands", (err, results) => {  
    if (err) {
      return res.status(500).send("Error Fetching Brands");
    } else {
      res.json(results); // Send the data as JSON
    }
  });
});

// Endpoint to fetch materials
app.get("/materials", (req, res) => {
  connection.query("SELECT * FROM material", (err, results) => {
    if (err) {
      return res.status(500).send("Error fetching materials");
    } else {
      res.json(results); // Send the list of materials in JSON format
    }
  });
});

// Endpoint to fetch materials
app.get("/purchases", (req, res) => {
  connection.query("SELECT * FROM purchase", (err, results) => {
    if (err) {
      return res.status(500).send("Error fetching locations:");
    } else {
      res.json(results); // Send the list of materials in JSON format
    }
  });
});

// Endpoint to fetch materials
app.get("/categories", (req, res) => {
  connection.query("SELECT * FROM categories", (err, results) => {
    if (err) {
      return res.status(500).send("Error fetching categories:");
    } else {
      res.json(results); // Send the list of materials in JSON format
    }
  });
});

// Endpoint to fetch materials
app.get("/storageTable", (req, res) => {
  connection.query("SELECT * FROM storage", (err, results) => {
    if (err) {
      return res.status(500).send("Error fetching categories:");
    } else {
      res.json(results); // Send the list of materials in JSON format
    }
  });
});

// Endpoint to fetch materials
app.get("/rarity", (req, res) => {
  connection.query("SELECT * FROM rarity", (err, results) => {
    if (err) {
      return res.status(500).send("Error fetching categories:");
    } else {
      res.json(results); // Send the list of materials in JSON format
    }
  });
});

// Endpoint to fetch condition
app.get("/carcondition", (req, res) => {
  connection.query("SELECT * FROM carcondition", (err, results) => {
    if (err) {
      return res.status(500).send("Error fetching conditions:");
    } else {
      res.json(results); // Send the list of materials in JSON format
    }
  });
});

// Route to fetch all photos (no CarID required)
app.get('/api/photos', (req, res) => {
  // Query the database to get all photos
  const query = 'SELECT * FROM photos';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching photo data:', err);
      return res.status(500).json({ error: 'Failed to load photos' });
    }

    // If no photos found, return an empty array
    if (results.length === 0) {
      return res.json([]);
    }

    // Return the photo data
    res.json(results);
  });
});

// Setup multer to handle file uploads
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Set file size limit to 5MB
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

// Endpoint to handle the image upload to Azure Blob Storage
app.post(
  "/upload-photo",
  upload.fields([
    { name: "front-photo", maxCount: 1 },
    { name: "side-photo", maxCount: 1 },
    { name: "back-photo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Upload images to Azure and get URLs
      const frontPhotoUrl = req.files["front-photo"]
        ? await uploadToAzure(req.files["front-photo"][0])
        : null;
      const sidePhotoUrl = req.files["side-photo"]
        ? await uploadToAzure(req.files["side-photo"][0])
        : null;
      const backPhotoUrl = req.files["back-photo"]
        ? await uploadToAzure(req.files["back-photo"][0])
        : null;

      res.status(200).json({
        frontPhotoUrl,
        sidePhotoUrl,
        backPhotoUrl,
      });
    } catch (error) {
      console.error("Error uploading photos:", error);
      res.status(500).send({ error: "Error uploading photos" });
    }
  }
);

// Helper function to upload to Azure Blob Storage
async function uploadToAzure(file) {
  const blobName = `${Date.now()}-${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(file.buffer, file.size);
  return `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}/${blobName}`;
}

// Endpoint to add a new car to the database
app.post(
  "/add-car",
  upload.fields([
    { name: "front-photo", maxCount: 1 },
    { name: "side-photo", maxCount: 1 },
    { name: "back-photo", maxCount: 1 },
  ]),
  async (req, res) => {
    // Log incoming request
    console.log("Received request to add car:", req.body);

    const {
      brandID, // Brand ID
      makeID, // Make of the car
      model_name, // Model name of the car
      year_of_release, // Year of the car
      series, // Series of the car
      car_type, // Car type (e.g., sedan, sports car)
      color, // Color of the car
      materialID, // Material ID (e.g., plastic, metal)
      carConditionID, // Condition of the car (e.g., new, used)
      rarityID, // Rarity of the car
      price_paid, // Price paid for the car
      current_value, // Current value of the car
      locationID, // Location ID (where it’s stored)
      purchaseID, // Purchase ID (where it was bought)
      notes, // Additional notes
      categoryID, // Category ID (muscle car, sports car, etc.)
      storageID, // Storage location ID
    } = req.body;

    // Handle photo uploads to Azure Blob Storage
    let frontPhotoUrl = null,
        sidePhotoUrl = null,
        backPhotoUrl = null;

    try {
      if (req.files["front-photo"]) {
        frontPhotoUrl = await uploadToAzure(req.files["front-photo"][0]);
      }

      if (req.files["side-photo"]) {
        sidePhotoUrl = await uploadToAzure(req.files["side-photo"][0]);
      }

      if (req.files["back-photo"]) {
        backPhotoUrl = await uploadToAzure(req.files["back-photo"][0]);
      }
    } catch (uploadError) {
      console.error("Error during file upload:", uploadError);
      return res.status(500).send({ error: "Failed to upload photos" });
    }

    // SQL query to insert the car data (without photo URLs)
    const carQuery = `INSERT INTO cars 
                    ( BrandID, Series, Year, Color, RarityID, MakeID, OriginalPrice, CurrentValue, CarConditionID, Notes, CategoryID, StorageID, PurchaseID, MaterialID, Model) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(
      carQuery,
      [
        brandID, // Name
        series, // Series
        year_of_release, // Year
        color, // Color
        rarityID, // Rarity
        makeID, // ReleaseType
        price_paid, // OriginalPrice
        current_value, // CurrentValue
        carConditionID, // Car_condition
        notes, // Notes
        categoryID, // CategoryID
        storageID, // StorageID
        purchaseID, // PurchaseID
        materialID, // MaterialID
        model_name, // Model
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting car data into database:", err);
          return res.status(500).send({ error: "Failed to add car" });
        }

        const carID = result.insertId; // Get the CarID for the newly inserted car
        console.log("Car data inserted successfully. CarID:", carID);

        // Now insert the photo URLs into the 'photos' table
        const photoQuery = `INSERT INTO photos (CarID, PhotoURL, PhotoDescription) VALUES (?, ?, ?)`;
        const photoUrls = [
          { url: frontPhotoUrl, description: "Front photo" },
          { url: sidePhotoUrl, description: "Side photo" },
          { url: backPhotoUrl, description: "Back photo" },
        ];

        photoUrls.forEach((photo) => {
          if (photo.url) {
            console.log(`Inserting photo: ${photo.description} with URL: ${photo.url}`);
            connection.query(photoQuery, [carID, photo.url, photo.description], (err) => {
              if (err) {
                console.error("Error inserting photo data:", err);
              } else {
                console.log(`Successfully inserted photo: ${photo.description}`);
              }
            });
          } else {
            console.log(`No URL for ${photo.description}`);
          }
        });

        res.status(200).send("Car added successfully along with photos!");
      }
    );
  }
);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
