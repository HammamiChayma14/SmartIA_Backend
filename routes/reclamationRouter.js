import express from "express";
import { validerReclamationAvantIntervention, supprimerReclamation,creerReclamation,validerReclamationAprésIntervention ,modifierReclamation,getAllReclamations} from "../controllers/reclamationController.js";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware.js";

const reclamationRouter = express.Router();

// 📌 Valider une réclamation (Admin uniquement)
reclamationRouter.put('/validerReclamationAvantIntervention/:id', authenticateToken, authorizeRole(['admin']), validerReclamationAvantIntervention);
reclamationRouter.put('/validerReclamationInterventionaa/:id', authenticateToken, authorizeRole(['admin', 'Client']), validerReclamationAprésIntervention
  );// 📌 Supprimer une réclamation (Admin uniquement)
reclamationRouter.delete('/supprimerReclamation/:id', authenticateToken, authorizeRole(['admin']), supprimerReclamation);
reclamationRouter.post( "/creerReclamation",authenticateToken, authorizeRole(["Client"]),creerReclamation );
export default reclamationRouter;
// 📌 Modifier une réclamation (Client uniquement, le client peut modifier sa propre réclamation)
reclamationRouter.put('/modifierReclamation/:id', authenticateToken, authorizeRole(['Client']), modifierReclamation);
reclamationRouter.get('/getAllReclamations', authenticateToken, authorizeRole(['admin', 'Technicien', 'Client']), getAllReclamations);
