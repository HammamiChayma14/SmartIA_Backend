import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js"; 

dotenv.config();

// Vérification du token JWT
export const authenticateToken = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Accès non autorisé" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Vérifier si l'utilisateur est actif
    const user = await User.findById(req.user.id);
    if (!user.active) {
      return res.status(403).json({ message: "Compte désactivé. Contactez l'admin." });
    }

    next();
  } catch (error) {
    res.status(403).json({ message: "Token invalide" });
  }
};

// Vérification du rôle utilisateur
export const authorizeRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Accès interdit" });
  }
  next();
};
