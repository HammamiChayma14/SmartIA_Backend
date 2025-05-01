import express from 'express';
import { addEquipement, updateEquipement, getEquipementById, getAllEquipements,deleteEquipement,getEquipementByQRCode ,addEquipementWithQRCode,getEquipementByDesignationOrNumeroSerie} from '../controllers/equipementController.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';

const equipementRouter = express.Router();

// Ajouter un équipement (seulement pour les administrateurs)
equipementRouter.post('/addEquipement', authenticateToken, authorizeRole(['admin']), addEquipement);

// Mettre à jour un équipement (seulement pour les administrateurs)
equipementRouter.put('/updateEquipement/:id', authenticateToken, authorizeRole(['admin', 'Technicien']), updateEquipement);

/* Récupérer un équipement par ID
equipementRouter.get('/getEquipementById/:id', authenticateToken, getEquipementById);*/

// Récupérer tous les équipements
equipementRouter.get('/getAllEquipements', authenticateToken, getAllEquipements);
equipementRouter.get('/getEquipementByDesignationOrNumeroSerie', authenticateToken, getEquipementByDesignationOrNumeroSerie);

equipementRouter.delete('/deleteEquipement/:id', authenticateToken, authorizeRole(['admin']), deleteEquipement);
equipementRouter.get('/getEquipementByQRCode/:qrCodeData', authenticateToken, authorizeRole(['admin','Technicien']), getEquipementByQRCode);
equipementRouter.post('/addEquipementWithQRCode', authenticateToken, authorizeRole(['admin']), addEquipementWithQRCode);

export default equipementRouter;
