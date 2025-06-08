import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminrouter from "./routes/adminRoutes.js";
import equipementRouter from "./routes/equipementRoutes.js"
import articleRouter from './routes/articleRoutes.js';
import reclamationRouter from "./routes/reclamationRouter.js"
import interventionRouter from "./routes/interventionRouter.js"
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import notificationRouter from "./routes/notificationRoutes.js";

dotenv.config();
connectDB();

// Fonction pour créer un admin si nécessaire

const createAdmin= async () => {
  console.log(" Vérification de l'existence de l'admin");

  const adminExists = await User.findOne({ email: "admin@taskforceit.com" });

  if (!adminExists) {
    console.log(" Admin non trouvé, création en cours...");
    
    const hashedPassword = await bcrypt.hash("admin123", 10); // Hash du mot de passe

    const admin = new User({
      name: "Admin ",
      email: "admin@taskforceit.com",
      password: hashedPassword, // Stocke la version hachée
      role: "admin"
    });

    await admin.save();
    console.log("Admin créé avec succès !");
  } else {
    console.log("Admin déjà existant !");
  }
};


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminrouter); 
app.use("/equipements", equipementRouter); 
app.use("/reclamations", reclamationRouter); 
app.use("/interventions",interventionRouter);

app.use("/articles", articleRouter);
app.use("/notifications", notificationRouter);

// Démarrage du serveur et création de l'admin si nécessaire
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Serveur en ligne sur http://localhost:${PORT}`);
  
  // Appel de la fonction de création de l'admin au démarrage
  await createAdmin();
});
