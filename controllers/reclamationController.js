import Reclamation from "../models/Reclamation.js";
import Equipement from "../models/Equipement.js"; // ✅ Ajout nécessaire

import { creerNotification } from "./notificationController.js";

  export const creerReclamation = async (req, res) => {
  try {
    const { equipement, description } = req.body;
    const clientId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "Le fichier diagnostic PDF est obligatoire." });
    }

    const existe = await Reclamation.findOne({ equipement, statut: "En attente" });
    if (existe) {
      return res.status(409).json({ message: "Cet équipement a déjà une réclamation en attente." });
    }

    const nouvelleReclamation = new Reclamation({
      equipement,
      client: clientId,
      description,
      diagnosticPdf: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
      statut: "En attente",
    });

    await nouvelleReclamation.save();

    res.status(201).json({ message: "Réclamation créée avec succès." });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la création de la réclamation." });
  }
};


  
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

 
  
export const getAllReclamations = async (req, res) => {
  try {
    const reclamations = await Reclamation.find()
      .populate('client', 'name email address  phone')
      .populate('technicien', 'name')
      .populate('equipement', ' designation  marque   modele   numeroSerie localisation');
    
    res.status(200).json({
      message: "Réclamations récupérées avec succès.",
      reclamations: reclamations,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const modifierReclamation = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipement, description } = req.body;
    const clientId = req.user.id;

    const reclamation = await Reclamation.findById(id);
    if (!reclamation) {
      return res.status(404).json({ message: "Réclamation non trouvée." });
    }

    if (reclamation.client.toString() !== clientId) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    if (description) reclamation.description = description;
    if (equipement) reclamation.equipement = equipement;

    if (req.file) {
      reclamation.diagnosticPdf = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    await reclamation.save();

    res.status(200).json({
      message: "Réclamation modifiée avec succès.",
      reclamation,
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur lors de la modification de la réclamation.",
    });
  }
};





export const modifierStatutReclamation = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, justification } = req.body;

    // Validation des statuts autorisés
    const statutsAutorises = ["En attente", "Validée", "Refusée", "Assignée", "Traitée", "Résolue"];
    if (!statutsAutorises.includes(statut)) {
      return res.status(400).json({ 
        success: false,
        message: `Statut invalide. Les statuts valides sont: ${statutsAutorises.join(", ")}`
      });
    }

    const reclamation = await Reclamation.findById(id);
    if (!reclamation) {
      return res.status(404).json({ 
        success: false,
        message: "Réclamation non trouvée." 
      });
    }

    const ancienStatut = reclamation.statut;
    
    // Nettoyage automatique des données en fonction du nouveau statut
    if (statut === "Refusée") {
      if (!justification?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Une justification est obligatoire pour refuser une réclamation."
        });
      }
      reclamation.justification = justification;
      reclamation.technicien = undefined;
    } 
    else if (statut === "Validée") {
      reclamation.justification = undefined;
      reclamation.technicien = undefined;

      // ✅ Mise à jour du statut de l’équipement en "En panne"
      if (reclamation.equipement) {
        await Equipement.findByIdAndUpdate(reclamation.equipement, { statut: "En panne" });
      }
    }
    else if (!["Assignée", "Traitée"].includes(statut)) {
      reclamation.justification = undefined;
      reclamation.technicien = undefined;
    }

    // Application du nouveau statut
    reclamation.statut = statut;
    await reclamation.save();

    // Gestion des notifications
    if (ancienStatut !== statut) {
      let message, type, recipient;

      switch(statut) {
        case "Validée":
          message = "Votre réclamation a été validée.";
          type = "validation";
          recipient = reclamation.client;
          break;
          
        case "Refusée":
          message = `Votre réclamation a été refusée. Motif: ${reclamation.justification}`;
          type = "refus";
          recipient = reclamation.client;
          break;
          
        case "Assignée":
          message = `Nouvelle réclamation assignée: ${reclamation.description.substring(0, 50)}...`;
          type = "assignation";
          recipient = reclamation.technicien;
          break;
      }

      if (message && recipient) {
        try {
          await creerNotification(recipient, reclamation._id, message, type);
        } catch (err) {
          console.error("Échec notification:", err);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Statut mis à jour: ${statut}`,
      reclamation: {
        _id: reclamation._id,
        statut: reclamation.statut,
        justification: reclamation.justification,
        technicien: reclamation.technicien,
        updatedAt: reclamation.updatedAt
      }
    });

  } catch (error) {
    console.error("Erreur modification statut:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
};

// Assigner une réclamation à un technicien (par l'admin)
export const assignerReclamationTechnicien = async (req, res) => {
  try {
    const { id } = req.params; // ID de la réclamation
    const { technicienId } = req.body; // ID du technicien à assigner

    if (!technicienId) {
      return res.status(400).json({ message: "L'ID du technicien est requis." });
    }

    const reclamation = await Reclamation.findById(id);
    if (!reclamation) {
      return res.status(404).json({ message: "Réclamation non trouvée." });
    }

    // Vérifier si la réclamation est dans un statut approprié pour l'assignation
    // Par exemple, elle doit être "Validée" ou "En attente" (selon votre workflow)
    if (!["En attente", "Validée"].includes(reclamation.statut)) {
      return res.status(400).json({ message: `La réclamation avec le statut '${reclamation.statut}' ne peut pas être assignée.` });
    }
    reclamation.technicien = technicienId;
    reclamation.statut = "Assignée";
    await reclamation.save();

    // Créer une notification pour le technicien
    try {
      await creerNotification(
        technicienId,
        reclamation._id,
        `Une nouvelle réclamation vous a été assignée concernant l'équipement: ${reclamation.description}`, // Amélioration du message
        "Assignée"
      );
    } catch (notificationError) {
      console.error("Erreur lors de la création de la notification pour le technicien:", notificationError);
      // Continuer même si la notification échoue, mais logguer l'erreur est important
    }

    res.status(200).json({
      message: "Réclamation assignée avec succès au technicien.",
      reclamation,
    });

  } catch (error) {
    console.error("Erreur lors de l'assignation de la réclamation:", error);
    res.status(500).json({ message: "Erreur serveur lors de l'assignation de la réclamation." });
  }
};


export const afficherDiagnosticPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const reclamation = await Reclamation.findById(id);

    if (!reclamation?.diagnosticPdf?.data) {
      return res.status(404).json({ message: "Fichier PDF non trouvé." });
    }

    // Conversion explicite en Buffer
    const pdfBuffer = Buffer.from(reclamation.diagnosticPdf.data);
    
    // Vérification que le buffer n'est pas vide
    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(500).json({ message: "Le PDF est vide." });
    }

    console.log(`Envoi PDF - Taille: ${pdfBuffer.length} bytes`); // Debug

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=diagnostic_${id}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erreur PDF:', error);
    res.status(500).json({ 
      message: "Erreur serveur",
      error: error.message 
    });
  }
};
