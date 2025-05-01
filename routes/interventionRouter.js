import express from "express";
import { 
  creerIntervention, 
  mettreAJourIntervention, 
  obtenirInterventions, 
  supprimerIntervention 
} from "../controllers/interventionController.js";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware.js";

const interventionRouter = express.Router();

// 📌 Création d'une intervention (Admin ou Technicien)
interventionRouter.post("/creerIntervention",authenticateToken,authorizeRole(["technicien"]),
  creerIntervention
);

// 📌 Mise à jour d'une intervention (Technicien)
interventionRouter.put("/mettreAJourIntervention/:id",authenticateToken,authorizeRole(["technicien"]),mettreAJourIntervention);

// 📌 Récupérer toutes les interventions (Admin & Technicien)
interventionRouter.get("/obtenirInterventions",authenticateToken,authorizeRole(["admin", "technicien"]),obtenirInterventions);

// 📌 Supprimer une intervention (Admin)
interventionRouter.delete("/supprimerIntervention/:id",authenticateToken,authorizeRole(["admin"]),supprimerIntervention);

export default interventionRouter;
