import User from "../models/User.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";


// Fonction pour ajouter un utilisateur
export const addUser = async (req, res) => {
  try {
    const { name, email, role, phone, address } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }

    // Générer un mot de passe temporaire
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Préparer l'objet utilisateur
    const newUserData = {
      name,
      email,
      role,
      password: hashedPassword,
      statut: true,
      phone,
      address,
    };

    const newUser = new User(newUserData);
    await newUser.save();

    // Envoi de l'email de bienvenue avec les identifiants
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Votre compte a été créé",
      text: `Bonjour ${name},\n\nVotre compte a été créé avec succès.\n\nRôle : ${role}\nEmail : ${email}\nMot de passe temporaire : ${password}\n\nCordialement,\nL'équipe Taskforce IT`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Utilisateur ajouté avec succès et email envoyé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Fonction pour supprimer un utilisateur

export const deleteUser = async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur depuis les paramètres de l'URL
    const userId = req.params.id;

    // Trouver l'utilisateur dans la base de données
    const user = await User.findById(userId);
    
    // Si l'utilisateur n'est pas trouvé, renvoyer une erreur
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Utiliser findByIdAndDelete pour supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    // Renvoyer un message de succès avec le nom de l'utilisateur et son rôle
    res.json({ message: `Le ${user.role} ${user.name} a été supprimé avec succès.` });
  } catch (error) {
    console.error("Erreur de suppression d'utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression de l'utilisateur." });
  }
};

// liste des techniciens
export const getTechnicians = async (req, res) => {
    try {
      const technicians = await User.find({ role: 'Technicien' });
            console.log("Technicians found:", technicians.length); // <-- Vérifiez le nombre

      res.status(200).json(technicians);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des techniciens.' });
    }
  };

// liste des clients 
export const getClients = async (req, res) => {
    try {
      const clients = await User.find({ role: 'Client' }); 
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des clients.' });
    }
  };

  export const getAllUsers = async (req, res) => {
    try {
  
      if (!req.user || req.user.role !== "Administrateur") {
        return res.status(403).json({ message: "Accès interdit" });
      }
  
      const users = await User.find({}, "-password"); // Exclure le mot de passe
      res.status(200).json({ success: true, users });
        } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
  };

  
// 🔹 Activer / désactiver un compte utilisateur
//deszactiver est pour le technicien
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        user.statut = !user.statut;
        await user.save();

        res.json({ message: `Utilisateur ${user.statut ? "activé" : "désactivé"} avec succès !` });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

