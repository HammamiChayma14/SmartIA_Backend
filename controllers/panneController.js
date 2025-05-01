import Panne from "../models/Panne.js";
import Equipement from "../models/Equipement.js";
import User from "../models/User.js"; // ✅ Import pour vérifier les techniciens

// 📌 Signalement d'une panne par un client
export const signalerPanne = async (req, res) => {
  try {
    const { equipementId, description } = req.body;
    const clientId = req.user.id;

    const equipement = await Equipement.findById(equipementId);
    if (!equipement) return res.status(404).json({ message: "Équipement non trouvé." });

    const nouvellePanne = new Panne({
      equipement: equipementId,
      description,
      client: clientId
    });

    await nouvellePanne.save();
    res.status(201).json({ message: "Panne signalée avec succès.", panne: nouvellePanne });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// 📌 Attribution d'un technicien par l'administrateur
export const attribuerTechnicien = async (req, res) => {
  try {
    const { panneId } = req.params;
    const { technicienId } = req.body;

    const panne = await Panne.findById(panneId);
    if (!panne) return res.status(404).json({ message: "Panne non trouvée." });

    const technicien = await User.findById(technicienId);
    if (!technicien || technicien.role !== "Technicien") {
      return res.status(400).json({ message: "Technicien invalide." });
    }

    panne.technicien = technicienId;
    panne.statut = "En cours";
    await panne.save();

    res.status(200).json({ message: "Technicien attribué avec succès.", panne });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// 📌 Un technicien met à jour le statut de sa panne
export const mettreAJourStatut = async (req, res) => {
  try {
    const { panneId } = req.params;
    const { statut } = req.body;

    const panne = await Panne.findById(panneId);
    if (!panne) return res.status(404).json({ message: "Panne non trouvée." });

    if (panne.technicien.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé." });
    }

    panne.statut = statut;
    await panne.save();

    res.status(200).json({ message: "Statut mis à jour.", panne });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

export const getPannes = async (req, res) => {
  try {
    let filtre = {};
    
    // Filtrer en fonction du rôle
    if (req.user.role === 'Technicien') {
      filtre = { technicien: req.user.id };
    } else if (req.user.role === 'Client') {
      filtre = { client: req.user.id };
    } else {
      return res.status(403).json({ message: "Accès non autorisé." });
    }

    // Requête avec peuplement de l'équipement
    const pannes = await Panne.find(filtre).populate('equipement');
    res.status(200).json(pannes);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
export const deletePanne = async (req, res) => {
  try {
    const { panneId } = req.params; // Récupérer l'ID de la panne à partir des paramètres de l'URL

    const panne = await Panne.findById(panneId);
    if (!panne) {
      return res.status(404).json({ message: "Panne non trouvée." });
    }

    // Vérification des droits d'accès
    if (req.user.role === 'client' && panne.client.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé : cette panne ne vous appartient pas." });
    }

    if (req.user.role === 'technicien' && panne.technicien?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé : cette panne ne vous est pas assignée." });
    }

    // Suppression de la panne
    await panne.deleteOne();

    res.status(200).json({ message: "Panne supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression.", error: error.message });
  }
};
// 📌 Un client modifie une panne (équipement ou description)
export const modifierPanne = async (req, res) => {
  try {
    const { panneId } = req.params;
    const { equipementId, description } = req.body;

    const panne = await Panne.findById(panneId);
    if (!panne) {
      return res.status(404).json({ message: "Panne non trouvée." });
    }

    // Vérifier que la panne appartient bien au client connecté
    if (panne.client.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé : cette panne ne vous appartient pas." });
    }

    // Si l'utilisateur a fourni un nouvel équipement, on vérifie qu'il existe
    if (equipementId) {
      const equipement = await Equipement.findById(equipementId);
      if (!equipement) {
        return res.status(400).json({ message: "Équipement invalide." });
      }
      panne.equipement = equipementId;
    }

    // Mise à jour de la description si elle est fournie
    if (description) {
      panne.description = description;
    }

    await panne.save();

    res.status(200).json({ message: "Panne modifiée avec succès.", panne });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
