import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import nodemailer from 'nodemailer';
import crypto from 'crypto';

dotenv.config();

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

// Stockage temporaire des OTP
const otpStore = new Map();

// 🔹 Login avec génération et envoi d'un OTP
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email incorrect" });
    }


    if (!user.statut) {
      console.log(`Compte désactivé pour l'email : ${email}`);
      return res.status(403).json({ message: "Compte désactivé. Contactez l'admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    if (user.role === "Client" || user.role === "Technicien") {

      // Générer un OTP de 4 chiffres
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      otpStore.set(user.email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Votre code de vérification",
        text: `Votre code OTP est : ${otp}. Il est valide pendant 5 minutes.`,
      });

      return res.json({ message: "Code OTP envoyé à votre email", requiresOTP: true, email: user.email });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.json({message: "Authentification réussie", token, role: user.role });
  } catch (error) {

  
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Vérification de l'OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedOTP = otpStore.get(email);

    if (!storedOTP) {
      return res.status(400).json({ message: "Code OTP non trouvé" });
    }

    if (storedOTP.otp !== otp) {
      return res.status(401).json({ message: "Code OTP incorrect" });
    }

    if (storedOTP.expiresAt < Date.now()) {
      return res.status(402).json({ message: "Code OTP expiré" });
    }

    otpStore.delete(email); 

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.json({ message: "Authentification réussie", token, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Renvoi de l'OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes d'expiration

    otpStore.set(email, { otp, expiresAt });


    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Votre code de vérification",
      text: `Votre code OTP est : ${otp}. Il est valide pendant 5 minutes.`,
    });

    res.status(200).json({ message: "OTP renvoyé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
};


// Fonction pour envoyer un token de réinitialisation de mot de passe
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Vérifier si l'utilisateur existe
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé." });
  }

  // Générer un token de réinitialisation
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // Token valide pendant 1 heure
  await user.save();

  // Configuration de Nodemailer pour envoyer l'email
  const transporter = nodemailer.createTransport({
    service: 'gmail',  
    auth: {
      user: process.env.EMAIL_USER,  
      pass: process.env.EMAIL_PASS   
    }
  });

  // URL pour la réinitialisation avec le token
  const resetLink = `http://localhost:5000/auth/reset-password/${resetToken}`;

  // Options de l'email
  const mailOptions = {
    to: email,
    from: process.env.EMAIL_USER, 
    subject: 'Réinitialisation de mot de passe',
    text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`
  };

  // Envoi de l'email avec le token
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.status(500).json({ message: "Erreur d'envoi d'email." });
    }
    res.status(200).json({
      message: 'Email envoyé avec succès. Veuillez vérifier votre boîte de réception.'
    });
  });
};

// Fonction pour réinitialiser le mot de passe
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;  // Le nouveau mot de passe

  // Trouver l'utilisateur en fonction du token et de l'expiration
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }  // Vérifier si le token est encore valide
  });

  if (!user) {
    return res.status(400).json({ message: "Token invalide ou expiré" });
  }

  // Mettre à jour le mot de passe
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  
  await user.save();

  res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
};

// 🔹 Récupérer son propre compte
export const getMyProfile = async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select("-password"); // Exclure le mot de passe
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

      res.status(200).json(user);
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
  }
};

//  Modifier  compte
export const updateMyProfile = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Mettre à jour les champs renseignés
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({ message: "Profil mis à jour avec succès", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
