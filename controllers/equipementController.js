import Equipement from '../models/Equipement.js';
import QRCode from 'qrcode';



  //Récupérer un équipement par ID
export const getEquipementById = async (req, res) => {
  try {
    const equipement = await Equipement.findById(req.params.id);
    if (!equipement) return res.status(404).json({ message: "Equipement non trouvé." });

    res.status(200).json(equipement);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération de l'équipement." });
  }
};

// Récupérer tous les équipements
export const getAllEquipements = async (req, res) => {
  try {
    const equipements = await Equipement.find();
    res.status(200).json(equipements);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération des équipements." });
  }
};

export const updateEquipement = async (req, res) => {
  try {
    const equipement = await Equipement.findById(req.params.id);

    if (!equipement) {
      return res.status(404).json({ message: "Équipement non trouvé." });
    }

    const { designation, statut, localisation, marque, modele, numeroSerie } = req.body;
    const userRole = req.user.role; // Récupération du rôle de l'utilisateur connecté

    if (userRole === 'Administrateur') {
      if (designation) equipement.designation = designation;
      if (marque) equipement.marque = marque;
      if (modele) equipement.modele = modele;
      if (numeroSerie) equipement.numeroSerie = numeroSerie;
      if (statut) equipement.statut = statut;
      if (localisation) equipement.localisation = localisation;
    } else {
      return res.status(403).json({ message: "Accès refusé : seuls les administrateurs peuvent modifier un équipement." });
    }

    await equipement.save();

    res.status(200).json({
      message: "Équipement mis à jour avec succès",
      equipement,
    });

  } catch (error) {
    console.error("Erreur serveur : ", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'équipement.", error: error.message });
  }
};

//supprimer un équipement
export const deleteEquipement = async (req, res) => {
    try {
      const equipement = await Equipement.findByIdAndDelete(req.params.id);
      if (!equipement) {
        return res.status(404).json({ message: "Equipement non trouvé." });
      }
      res.status(200).json({ message: "Equipement supprimé avec succès." });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de la suppression de l'équipement.", error: error.message });
    }
  };

  
  // Ajouter un équipement avec QR Code
  export const addEquipementWithQRCode = async (req, res) => {
    try {
      const { designation, marque, modele, numeroSerie, statut, localisation } = req.body;
  
      // Vérifier si l'équipement existe déjà par son numéro de série
      const existingEquipement = await Equipement.findOne({ numeroSerie });
      if (existingEquipement) {
        return res.status(400).json({ message: "Un équipement avec ce numéro de série existe déjà." });
      }
  
      // Générer un QR Code unique basé sur le numéro de série
      const qrCodeData = `EQUIPEMENT_${numeroSerie}`;
  
      // Créer l’équipement
      const newEquipement = new Equipement({
        designation,
        marque,
        modele,
        numeroSerie,
        statut: statut || 'en service',
        localisation,
        qrCodeData
      });
  
      await newEquipement.save();
  
      // Générer l'image du QR Code
      const qrCodeImage = await QRCode.toDataURL(qrCodeData);
  
      res.status(201).json({ 
        message: "Équipement ajouté avec succès", 
        equipement: newEquipement, 
        qrCodeImage 
      });
  
    } catch (error) {
      res.status(500).json({ 
        message: "Erreur serveur lors de l'ajout de l'équipement.", 
        error: error.message 
      });
    }
  };
  
//recuper un qrcode 
export const getEquipementByQRCode = async (req, res) => {
    try {
      const { qrCodeData } = req.params;
      const equipement = await Equipement.findOne({ qrCodeData });
  
      if (!equipement) {
        return res.status(404).json({ message: "Aucun équipement trouvé avec ce QR Code." });
      }
  
      res.status(200).json(equipement);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de la récupération de l'équipement.", error: error.message });
    }
  };
  // Récupérer un équipement par désignation ou numéro de série
export const getEquipementByDesignationOrNumeroSerie = async (req, res) => {
  try {
    const { designation, numeroSerie } = req.query;  // Récupère les paramètres de requête

    if (!designation && !numeroSerie) {
      return res.status(400).json({ message: 'Veuillez fournir soit une désignation, soit un numéro de série.' });
    }

    // Recherche selon les paramètres fournis
    const query = {};
    if (designation) query.designation = designation;  // Recherche par désignation
    if (numeroSerie) query.numeroSerie = numeroSerie;  // Recherche par numéro de série

    // Récupère l'équipement correspondant à la requête
    const equipement = await Equipement.findOne(query);

    if (!equipement) {
      return res.status(404).json({ message: "Aucun équipement trouvé avec cette désignation ou ce numéro de série." });
    }

    res.status(200).json(equipement);
  } catch (error) {
    console.error('Erreur de récupération :', error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération de l'équipement.", error: error.message });
  }
};
