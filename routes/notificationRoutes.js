import express from "express";
import { 
  getNotificationsByClient,
  marquerCommeLue,
  getNombreNotificationsNonLues,
  supprimerNotification,           // ✨ NOUVEAU
  supprimerNotificationsLues,      // ✨ NOUVEAU  
  supprimerToutesNotifications     // ✨ NOUVEAU
} from "../controllers/notificationController.js";
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';

const notificationRouter = express.Router();

// Routes existantes
notificationRouter.get('/mes-notifications', authenticateToken, authorizeRole(['Client']), getNotificationsByClient
);

notificationRouter.put('/marquer-lue/:id', 
  authenticateToken, 
  authorizeRole(['Client']), 
  marquerCommeLue
);

notificationRouter.get('/non-lues', 
  authenticateToken, 
  authorizeRole(['Client']), 
  getNombreNotificationsNonLues
);

// ✨ NOUVELLES ROUTES pour la suppression
notificationRouter.delete('/supprimer/:id', 
  authenticateToken, 
  authorizeRole(['Client']), 
  supprimerNotification
);

notificationRouter.delete('/supprimer-lues', 
  authenticateToken, 
  authorizeRole(['Client']), 
  supprimerNotificationsLues
);

notificationRouter.delete('/supprimer-toutes', 
  authenticateToken, 
  authorizeRole(['Client']), 
  supprimerToutesNotifications
);

export default notificationRouter;