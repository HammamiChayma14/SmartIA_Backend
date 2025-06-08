import Intervention from '../models/Intervention.js';
import Reclamation from '../models/Reclamation.js';
import Equipement from '../models/Equipement.js';

export const commencerIntervention = async (req, res) => {
  const { reclamationId } = req.body;
  const technicienId = req.user.id;

  try {
    const reclamation = await Reclamation.findById(reclamationId);
    if (!reclamation) {
      return res.status(404).json({ message: 'Réclamation non trouvée.' });
    }

    let intervention = await Intervention.findOne({
      reclamation: reclamationId,
      statut: { $in: ['En attente', 'En cours'] }
    });

    if (intervention) {
      if (intervention.statut === 'En cours') {
        return res.status(400).json({ message: 'Une intervention est déjà en cours pour cette réclamation.' });
      }
      intervention.statut = 'En cours';
      intervention.dateDebut = new Date();
      intervention.technicien = technicienId;
      await intervention.save();

      reclamation.statut = 'En cours';
      await reclamation.save();

      if (reclamation.equipement) {
        await Equipement.findByIdAndUpdate(reclamation.equipement, { statut: 'En maintenance' });
      }

      return res.status(200).json({
        message: "L'intervention est commencée.",
        interventionId: intervention._id
      });
    }

    intervention = new Intervention({
      reclamation: reclamationId,
      technicien: technicienId,
      statut: 'En cours',
      dateDebut: new Date(),
    });

    await intervention.save();

    reclamation.statut = 'En cours';
    await reclamation.save();

    if (reclamation.equipement) {
      await Equipement.findByIdAndUpdate(reclamation.equipement, { statut: 'En maintenance' });
    }

    return res.status(200).json({
      message: "L'intervention est commencée.",
      interventionId: intervention._id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

export const terminerIntervention = async (req, res) => {
  const { interventionId, rapport } = req.body;
  const technicienId = req.user.id;

  try {
    const intervention = await Intervention.findOne({ _id: interventionId, technicien: technicienId });

    if (!intervention) {
      return res.status(404).json({ message: 'Intervention non trouvée.', receivedId: interventionId });
    }

    if (intervention.statut !== 'En cours') {
      return res.status(400).json({ message: 'L\'intervention n\'est pas en cours.', currentStatus: intervention.statut });
    }

    intervention.statut = 'Terminée';
    intervention.dateFin = new Date();
    intervention.rapport = rapport;

    await intervention.save();

    const reclamation = await Reclamation.findById(intervention.reclamation);
    if (reclamation) {
      reclamation.statut = 'Traitée';
      await reclamation.save();

      if (reclamation.equipement) {
        await Equipement.findByIdAndUpdate(reclamation.equipement, { statut: 'En service' });
      }
    }

    return res.status(200).json({ message: 'Intervention terminée avec succès.', intervention });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const getAllInterventions = async (req, res) => {
  try {
    const technicienId = req.user.id;
    console.log("Technicien ID:", technicienId);

    // 1. Chercher les réclamations assignées à ce technicien
    const assignedReclamations = await Reclamation.find({
      technicien: technicienId,
      statut: "Assignée"
    });

    // 2. Pour chaque réclamation assignée, vérifier s’il existe une intervention
    for (const reclamation of assignedReclamations) {
      const reclamationId = reclamation._id; // ✅ On extrait _id ici

      const interventionExists = await Intervention.findOne({ reclamation: reclamationId });
      if (!interventionExists) {
        // Créer une intervention en attente si elle n'existe pas encore
        const newIntervention = new Intervention({
          reclamation: reclamationId,
          technicien: technicienId,
          statut: "En attente",
          dateDebut: new Date(),
        });
        await newIntervention.save();
        console.log(`Intervention en attente créée pour réclamation ${reclamationId}`);
      }
    }

    // 3. Récupérer toutes les interventions du technicien
    const interventions = await Intervention.find({
      technicien: technicienId,
      statut: { $in: ["En attente", "En cours", "Terminée"] }
    })
    .populate({
      path: 'reclamation',
      select: 'description statut diagnosticPdf',
      populate: [
        { path: 'equipement', select: 'designation marque modele numeroSerie localisation' },
        { path: 'client', select: 'name email phone address' }
      ]
    })
    .sort({ createdAt: -1 });

    if (!interventions || interventions.length === 0) {
      return res.status(404).json({ message: "Aucune intervention trouvée." });
    }

    res.status(200).json({
      message: "Interventions récupérées avec succès.",
      interventions,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des interventions:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
