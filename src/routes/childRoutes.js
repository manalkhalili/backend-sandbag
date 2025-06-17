const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const childController = require("../controllers/childController");

router.use(authMiddleware);
//  Get all subjects (for the dropdown menu) ---> this will be used to populate the subjects dropdown in the child dashboard and get the subjectId for the api 
router.get("/subjects", childController.getAllSubjects); // This will list all subjects

// 1. Get cards for a specific subject, relevant to the authenticated child's context
router.get("/subjects/:subjectId/cards", childController.getSubjectCardsForChild);

// 2. Get material items for a specific card, relevant to the authenticated child's context
router.get("/cards/:cardId/materials", childController.getCardMaterialsForChild);


module.exports = router;
