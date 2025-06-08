import axios from "axios";
import { load } from "cheerio";

export const importArticleFromURL = async (req, res) => {
  const { url, categorie, auteur } = req.body;

  try {
    const { data: html } = await axios.get(url);
    const $ = load(html);

    const title = $("h1").first().text().trim();
    let content = "";

    $("p").each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 0) {
        content += `<p>${text}</p>\n`;
      }
    });

    const mainImage = $("img").first().attr("src");

    const newArticle = new Article({
      titre: title,
      contenu: content,
      categorie,
      auteur,
      image: mainImage || null,
      urlSource: url,
    });

    await newArticle.save();

    res.status(201).json({
      success: true,
      article: newArticle,
    });
  } catch (err) {
    console.error("Erreur lors de l'import :", err.message);
    res.status(500).json({ success: false, message: "Échec de l'import." });
  }
};

export const updateImportedArticle = async (req, res) => {
  const { id } = req.params;
  const { url, titre, contenu, categorie, auteur } = req.body;

  try {
    let updatedFields = { titre, contenu, categorie, auteur };

    if (url) {
      const { data: html } = await axios.get(url);
      const $ = load(html);

      const extractedTitle = $("h1").first().text().trim();
      let extractedContent = "";

      $("p").each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 0) {
          extractedContent += `<p>${text}</p>\n`;
        }
      });

      const mainImage = $("img").first().attr("src");

      updatedFields.titre = extractedTitle;
      updatedFields.contenu = extractedContent;
      updatedFields.image = mainImage || null;
      updatedFields.urlSource = url;
    }

    const updatedArticle = await Article.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!updatedArticle) return res.status(404).json({ success: false, message: "Article non trouvé." });

    res.json({ success: true, article: updatedArticle });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'article importé :", err.message);
    res.status(500).json({ success: false, message: "Erreur lors de la mise à jour.", error: err.message });
  }
};

// Créer un article manuellement
export const createArticle = async (req, res) => {
  const { titre, contenu, categorie, auteur } = req.body;

  try {
    const newArticle = new Article({ titre, contenu, categorie, auteur });
    await newArticle.save();
    res.status(201).json({ success: true, article: newArticle });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur lors de la création.", error: err.message });
  }
};

// Récupérer tous les articles
export const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ dateCreation: -1 });
    res.json({ success: true, articles });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur lors de la récupération.", error: err.message });
  }
};

// Récupérer un seul article par ID
export const getArticleById = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ success: false, message: "Article introuvable." });
    res.json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur lors de la récupération.", error: err.message });
  }
};

// Mettre à jour un article
export const updateArticle = async (req, res) => {
  const { id } = req.params;
  const { titre, contenu, categorie, auteur } = req.body;

  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { titre, contenu, categorie, auteur },
      { new: true }
    );

    if (!updatedArticle) return res.status(404).json({ success: false, message: "Article non trouvé." });

    res.json({ success: true, article: updatedArticle });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur lors de la mise à jour.", error: err.message });
  }
};

// Supprimer un article
export const deleteArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedArticle = await Article.findByIdAndDelete(id);
    if (!deletedArticle) return res.status(404).json({ success: false, message: "Article non trouvé." });
    res.json({ success: true, message: "Article supprimé." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur lors de la suppression.", error: err.message });
  }
};
