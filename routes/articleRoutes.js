import express from 'express';
import { importArticleFromURL,updateImportedArticle, createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle, } from "../controllers/articleController.js";

import { authenticateToken, authorizeRole, } from "../middlewares/authMiddleware.js";

const articleRouter = express.Router();

articleRouter.post("/import-from-url",authenticateToken,authorizeRole(["admin"]),importArticleFromURL);
articleRouter.put("/update-imported/:id", authenticateToken, authorizeRole(["admin"]), updateImportedArticle);
articleRouter.post("/addArticle", authenticateToken, authorizeRole(["admin"]),createArticle);
articleRouter.get("/allArticles", authenticateToken, authorizeRole(["admin"]),getAllArticles);
articleRouter.get("/getArticle/:id", authenticateToken, authorizeRole(["admin"]), getArticleById);
articleRouter.put("/updateArticle/:id", authenticateToken, authorizeRole(["admin"]), updateArticle);
articleRouter.delete("/deleteArticle/:id", authenticateToken, authorizeRole(["admin"]),deleteArticle);


export default articleRouter;