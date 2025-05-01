import express from 'express';
import { 
  signalerPanne, 
  attribuerTechnicien, 
  mettreAJourStatut, 
  getPannes ,deletePanne,modifierPanne
} from '../controllers/panneController.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';

const panneRouter = express.Router();

// 📌 Un client signale une panne
panneRouter.post('/signalerPanne', authenticateToken, authorizeRole(['Client']), signalerPanne);
panneRouter.delete('/deletePanne/:panneId', authenticateToken, authorizeRole(['Client', 'Technicien']), deletePanne);
panneRouter.put('/modifierPanne/:panneId', authenticateToken, authorizeRole(['Client']), modifierPanne);

// 📌 Un administrateur attribue un technicien
panneRouter.put('/attribuerTechnicien/:panneId', authenticateToken, authorizeRole(['admin']), attribuerTechnicien);

// 📌 Un technicien met à jour le statut d'une panne
panneRouter.put('/mettreAJourStatut/:panneId', authenticateToken, authorizeRole(['Technicien']), mettreAJourStatut);

// 📌 Un technicien récupère ses pannes
panneRouter.get('/getPannes', authenticateToken, authorizeRole(['Technicien','Client']), getPannes);

export default panneRouter;
