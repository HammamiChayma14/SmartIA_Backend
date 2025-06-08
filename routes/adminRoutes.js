import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware.js";
import { toggleUserStatus, deleteUser,getTechnicians,getClients, getAllUsers,addUser} from "../controllers/adminController.js"; // Importation du controller

const adminrouter = express.Router();

adminrouter.post("/addUser", authenticateToken, authorizeRole(["Administrateur"]), addUser);
adminrouter.get("/getAllUsers", authenticateToken, authorizeRole(["Administrateur"]), getAllUsers);
// Route pour activer/désactiver un utilisateur
adminrouter.put("/toggle-user-status/:id", authenticateToken, authorizeRole(["Administrateur"]), toggleUserStatus);

adminrouter.delete("/delete-user/:id", authenticateToken, authorizeRole(["Administrateur"]), deleteUser);
adminrouter.get("/technicians", authenticateToken, authorizeRole(["Administrateur"]), getTechnicians);

// Route pour obtenir la liste des clients
adminrouter.get("/clients", authenticateToken, authorizeRole(["Administrateur"]), getClients);
export default adminrouter;
