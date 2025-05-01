import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware.js";
import { toggleUserStatus, deleteUser,getTechnicians,getClients, getAllUsers,addUser} from "../controllers/adminController.js"; // Importation du controller

const adminrouter = express.Router();

adminrouter.post("/addUser", authenticateToken, authorizeRole(["admin"]), addUser);
adminrouter.get("/getAllUsers", authenticateToken, authorizeRole(["admin"]), getAllUsers);
// Route pour activer/désactiver un utilisateur
adminrouter.put("/toggle-user-status/:id", authenticateToken, authorizeRole(["admin"]), toggleUserStatus);

adminrouter.delete("/delete-user/:id", authenticateToken, authorizeRole(["admin"]), deleteUser);
adminrouter.get("/technicians", authenticateToken, authorizeRole(["admin"]), getTechnicians);

// Route pour obtenir la liste des clients
adminrouter.get("/clients", authenticateToken, authorizeRole(["admin"]), getClients);
export default adminrouter;
