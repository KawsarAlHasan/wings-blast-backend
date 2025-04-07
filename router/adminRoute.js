const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");
const { adminLogin, getMeAdmin } = require("../controllers/adminController");
const router = express.Router();

// router.post("/signup", signUpAdmin);
router.post("/login", adminLogin);
router.get("/me", verifyAdmin, getMeAdmin);
// router.get("/all", verifyAdmin, getAllAdmins);

// router.put("/update", verifyAdmin, updateAdmin);
// router.put("/update/password", verifyAdmin, updateAdminPassword);
// router.put("/update/role/:id", verifyAdmin, adminRoleIdUpdate);
// router.delete("/delete/:id", verifyAdmin, deleteAdmin);

// router.get("/role", verifyAdmin, getAllRole);
// router.get("/rolewithpermission", verifyAdmin, getAllRoleWithPermission);

// router.get("/:id", verifyAdmin, getSingleAdmin);

module.exports = router;
