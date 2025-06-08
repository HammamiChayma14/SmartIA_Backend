import express from 'express';
import { updateEquipement, getAllEquipements,deleteEquipement,getEquipementByQRCode ,addEquipementWithQRCode,getEquipementByDesignationOrNumeroSerie} from '../controllers/equipementController.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';

const equipementRouter = express.Router();


// Mettre à jour un équipement (seulement pour les administrateurs)
equipementRouter.put('/updateEquipement/:id', authenticateToken, authorizeRole(['Administrateur']), updateEquipement);

/* Récupérer un équipement par ID
equipementRouter.get('/getEquipementById/:id', authenticateToken, getEquipementById);*/

// Récupérer tous les équipements
equipementRouter.get('/getAllEquipements', authenticateToken, getAllEquipements);
equipementRouter.get('/getEquipementByDesignationOrNumeroSerie', authenticateToken, getEquipementByDesignationOrNumeroSerie);

equipementRouter.delete('/deleteEquipement/:id', authenticateToken, authorizeRole(['Administrateur']), deleteEquipement);
equipementRouter.get('/getEquipementByQRCode/:qrCodeData', authenticateToken, authorizeRole(['Administrateur','Technicien']), getEquipementByQRCode);
equipementRouter.post('/addEquipementWithQRCode', authenticateToken, authorizeRole(['Administrateur']), addEquipementWithQRCode);

export default equipementRouter;
