import express from "express";
import {  supprimerReclamation,creerReclamation ,modifierReclamation,getAllReclamations,modifierStatutReclamation, assignerReclamationTechnicien,afficherDiagnosticPdf} from "../controllers/reclamationController.js";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js"; 

const reclamationRouter = express.Router();


reclamationRouter.delete('/supprimerReclamation/:id', authenticateToken, authorizeRole(['Administrateur','Client']), supprimerReclamation);
reclamationRouter.get('/getAllReclamations', authenticateToken, authorizeRole(['Administrateur', 'Technicien', 'Client']), getAllReclamations);
reclamationRouter.post("/creerReclamation", authenticateToken, authorizeRole(["Client"]), upload.single('diagnosticPdf'), creerReclamation);
reclamationRouter.put( '/modifierReclamation/:id',authenticateToken, authorizeRole(['Client']),upload.single('diagnosticPdf'), modifierReclamation);
reclamationRouter.put('/modifierStatutReclamation/:id', authenticateToken,authorizeRole(["Administrateur"]),modifierStatutReclamation);
reclamationRouter.put('/assignerReclamation/:id', authenticateToken, authorizeRole(['Administrateur']), assignerReclamationTechnicien); 
reclamationRouter.get('/afficherDiagnosticPdf/:id', authenticateToken, authorizeRole(['Administrateur', 'Technicien','Client']), afficherDiagnosticPdf);
export default reclamationRouter;
