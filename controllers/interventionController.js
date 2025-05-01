import Intervention from "../models/Intervention.js";
import Panne from "../models/Panne.js";

// 📌 Création d'une intervention pour une panne
export const creerIntervention = async (req, res) => {
  try {
    const { panneId, technicienId } = req.body;

    // Vérifier si la panne existe
    const panne = await Panne.findById(panneId);
    if (!panne) {
      return res.status(404).json({ message: "Panne non trouvée." });
    }

    // Vérifier si une intervention existe déjà pour cette panne
    const interventionExistante = await Intervention.findOne({ panne: panneId });
    if (interventionExistante) {
      return res.status(400).json({ message: "Une intervention existe déjà pour cette panne." });
    }

    // Créer l'intervention
    const nouvelleIntervention = new Intervention({
      panne: panneId,
      technicien: technicienId,
      statut: "Planifiée"
    });

    await nouvelleIntervention.save();

    res.status(201).json({ message: "Intervention créée avec succès.", intervention: nouvelleIntervention });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la création de l'intervention.", error: error.message });
  }
};

// 📌 Mise à jour de l'intervention par le technicien
export const mettreAJourIntervention = async (req, res) => {
    try {
      const { id } = req.params;
      const { statut, actions, piecesUtilisees } = req.body;
  
      // Vérifier si l'intervention existe
      const intervention = await Intervention.findById(id);
      if (!intervention) {
        return res.status(404).json({ message: "Intervention non trouvée." });
      }
  
      // Mise à jour des champs
      if (statut) intervention.statut = statut;
      if (actions) intervention.actions = actions;
      if (piecesUtilisees) {
        // S'assurer que piecesUtilisees est un tableau
        intervention.piecesUtilisees = Array.isArray(piecesUtilisees) ? piecesUtilisees : [piecesUtilisees];
      }
  
      // Si l'intervention est terminée, on met à jour la panne comme "Résolue"
      if (statut === "Terminée") {
        intervention.dateFin = Date.now();
        
        const panne = await Panne.findById(intervention.panne);
        if (panne) {
          panne.statut = "Résolue";
          await panne.save();
        }
      }
  
      await intervention.save();
      res.status(200).json({ message: "Intervention mise à jour avec succès.", intervention });
  
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'intervention.", error: error.message });
    }
  };
  

// 📌 Obtenir la liste des interventions
export const obtenirInterventions = async (req, res) => {
  try {
    const interventions = await Intervention.find().populate("panne technicien");
    res.status(200).json(interventions);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération des interventions.", error: error.message });
  }
};

// 📌 Suppression d'une intervention
export const supprimerIntervention = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'intervention existe
    const intervention = await Intervention.findById(id);
    if (!intervention) {
      return res.status(404).json({ message: "Intervention non trouvée." });
    }

    // Supprimer l'intervention
    await intervention.deleteOne();

    res.status(200).json({ message: "Intervention supprimée avec succès." });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la suppression de l'intervention.", error: error.message });
  }
};
