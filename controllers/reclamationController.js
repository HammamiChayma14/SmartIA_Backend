import Reclamation from "../models/Reclamation.js";
import Panne from "../models/Panne.js";
import mongoose from "mongoose";

// 📌 Création d'une réclamation par un client après le signalement d'une panne
export const creerReclamation = async (req, res) => {
  try {
    const { panneId, description } = req.body;
    const clientId = req.user.id; // Récupérer l'ID du client depuis le token

    // Vérifier si la panne existe
    const panne = await Panne.findById(panneId);
    if (!panne) {
      return res.status(404).json({ message: "Panne non trouvée." });
    }

    // Vérifier si une réclamation existe déjà pour cette panne
    const reclamationExistante = await Reclamation.findOne({ panne: panneId });
    if (reclamationExistante) {
      return res.status(400).json({ message: "Une réclamation existe déjà pour cette panne." });
    }

    // Créer la réclamation
    const nouvelleReclamation = new Reclamation({
      panne: panneId,
      client: clientId,
      description,
      statut: "En attente" // Statut initial
    });

    await nouvelleReclamation.save();

    res.status(201).json({ message: "Réclamation créée avec succès.", reclamation: nouvelleReclamation });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la création de la réclamation.", error: error.message });
  }
};
export const validerReclamationAvantIntervention = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Vérifier si la réclamation existe
      const reclamation = await Reclamation.findById(id);
      if (!reclamation) {
        return res.status(404).json({ message: "Réclamation non trouvée." });
      }
  
      // Mettre à jour le statut de la réclamation
      reclamation.statut = "En cours";
      await reclamation.save();
  
      res.status(200).json({ message: "Réclamation validée avec succès.", reclamation });
  
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de la validation de la réclamation.", error: error.message });
    }
  };
  
  // 📌 Supprimer une réclamation (L'administrateur peut supprimer une réclamation inutile)
  export const supprimerReclamation = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Vérifier si la réclamation existe
      const reclamation = await Reclamation.findById(id);
      if (!reclamation) {
        return res.status(404).json({ message: "Réclamation non trouvée." });
      }
  
      // Supprimer la réclamation
      await reclamation.deleteOne();
  
      res.status(200).json({ message: "Réclamation supprimée avec succès." });
  
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de la suppression de la réclamation.", error: error.message });
    }
  };

  export const validerReclamationAprésIntervention = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Vérifier si l'ID est valide
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "ID de réclamation invalide." });
      }
  
      // Vérifier si la réclamation existe
      const reclamation = await Reclamation.findById(id);
      if (!reclamation) {
        return res.status(404).json({ message: "Réclamation non trouvée." });
      }
      console.log(`Réclamation trouvée :`, reclamation);
  
      // Vérifier si la panne associée est bien résolue
      const panne = await Panne.findById(reclamation.panne);
      if (!panne) {
        return res.status(404).json({ message: "Panne associée non trouvée." });
      }
  
      if (panne.statut !== "Résolue") {
        return res.status(400).json({ message: "Impossible de valider la réclamation tant que la panne n'est pas résolue." });
      }
      // Mettre à jour la réclamation
      reclamation.statut = "Traitée";
      await reclamation.save();  
      res.status(200).json({ message: "Réclamation Traitée avec succès.", reclamation });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de la validation de la réclamation.", error: error.message });
    }
  };
  export const modifierReclamation = async (req, res) => {
    try {
      const { id } = req.params;
      const { description } = req.body;
      const clientId = req.user.id;
  
      // Vérifier si la réclamation existe
      const reclamation = await Reclamation.findById(id);
      if (!reclamation) {
        return res.status(404).json({ message: "Réclamation non trouvée." });
      }
  
      // Vérifier que le client est bien celui qui a créé la réclamation
      if (reclamation.client.toString() !== clientId) {
        return res.status(403).json({ message: "Vous ne pouvez modifier que vos propres réclamations." });
      }
  
      // Mettre à jour la description de la réclamation
      reclamation.description = description;
      await reclamation.save();
  
      res.status(200).json({ message: "Réclamation modifiée avec succès.", reclamation });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de la modification de la réclamation.", error: error.message });
    }
  };
  export const getAllReclamations = async (req, res) => {
    try {
      // Récupérer toutes les réclamations sans peupler les données des objets liés
      const reclamations = await Reclamation.find()
        .select('_id panne client description statut createdAt updatedAt') // Sélectionner seulement les champs nécessaires
        .exec();
  
      // Vérifier s'il y a des réclamations
      if (!reclamations || reclamations.length === 0) {
        return res.status(404).json({ message: 'Aucune réclamation trouvée.' });
      }
  
      // Retourner les réclamations avec seulement les IDs de panne et client
      res.status(200).json(reclamations);
    } catch (error) {
      console.error('Erreur lors de la récupération des réclamations:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des réclamations.', error: error.message });
    }
  };
  