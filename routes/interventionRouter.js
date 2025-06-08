import express from "express";
import { 
  commencerIntervention,terminerIntervention,getAllInterventions
} from "../controllers/interventionController.js";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware.js";

const interventionRouter = express.Router();

interventionRouter.post('/commencer', authenticateToken,authorizeRole(['Administrateur']), commencerIntervention);
interventionRouter.post('/terminer', authenticateToken,authorizeRole(['Administrateur']),terminerIntervention);

interventionRouter.get('/getAllInterventions',authenticateToken,authorizeRole(['TAdministrateur']),getAllInterventions);

export default interventionRouter;
