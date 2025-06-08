import Notification from "../models/Notification.js";

// Créer une notification (appelée quand le statut change)
export const creerNotification = async (clientId, reclamationId, message, type) => {
  try {
    const notification = new Notification({
      client: clientId,
      reclamation: reclamationId,
      message,
      type,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    return null;
  }
};

// Obtenir les notifications d'un client
export const getNotificationsByClient = async (req, res) => {
  try {
    const clientId = req.user.id;
    
    const notifications = await Notification.find({ client: clientId })
      .populate('reclamation', 'description statut')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      message: "Notifications récupérées avec succès",
      notifications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des notifications" });
  }
};

// Marquer une notification comme lue
export const marquerCommeLue = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;
    
    const notification = await Notification.findOne({ _id: id, client: clientId });
    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }
    
    notification.lu = true;
    await notification.save();
    
    res.status(200).json({ message: "Notification marquée comme lue" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

// Obtenir le nombre de notifications non lues
export const getNombreNotificationsNonLues = async (req, res) => {
  try {
    const clientId = req.user.id;
    
    const count = await Notification.countDocuments({ 
      client: clientId, 
      lu: false 
    });
    
    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors du comptage" });
  }
};

// ✨ NOUVELLE FONCTION - Supprimer une notification spécifique
export const supprimerNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.userId; // Utilisez userId selon votre structure auth
    
    // Vérifier que la notification appartient bien au client connecté
    const notification = await Notification.findOne({ 
      _id: id, 
      client: clientId 
    });
    
    if (!notification) {
      return res.status(404).json({ 
        message: "Notification non trouvée ou vous n'avez pas l'autorisation de la supprimer" 
      });
    }
    
    // Supprimer la notification
    await Notification.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: "Notification supprimée avec succès",
      notificationId: id
    });
    
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    res.status(500).json({ 
      message: "Erreur lors de la suppression de la notification" 
    });
  }
};

// ✨ BONUS - Supprimer toutes les notifications lues d'un client
export const supprimerNotificationsLues = async (req, res) => {
  try {
    const clientId = req.user.userId; // Utilisez userId selon votre structure auth
    
    // Supprimer toutes les notifications lues du client
    const result = await Notification.deleteMany({ 
      client: clientId, 
      lu: true 
    });
    
    res.status(200).json({ 
      message: `${result.deletedCount} notification(s) lue(s) supprimée(s) avec succès`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error("Erreur lors de la suppression des notifications lues:", error);
    res.status(500).json({ 
      message: "Erreur lors de la suppression des notifications lues" 
    });
  }
};

// ✨ BONUS - Supprimer toutes les notifications d'un client (avec confirmation)
export const supprimerToutesNotifications = async (req, res) => {
  try {
    const clientId = req.user.userId; // Utilisez userId selon votre structure auth
    const { confirmer } = req.body;
    
    // Vérification de confirmation pour éviter les suppressions accidentelles
    if (!confirmer || confirmer !== 'OUI_SUPPRIMER_TOUT') {
      return res.status(400).json({ 
        message: "Confirmation requise. Envoyez { 'confirmer': 'OUI_SUPPRIMER_TOUT' }" 
      });
    }
    
    // Supprimer toutes les notifications du client
    const result = await Notification.deleteMany({ 
      client: clientId 
    });
    
    res.status(200).json({ 
      message: `Toutes vos notifications (${result.deletedCount}) ont été supprimées`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error("Erreur lors de la suppression de toutes les notifications:", error);
    res.status(500).json({ 
      message: "Erreur lors de la suppression de toutes les notifications" 
    });
  }
};