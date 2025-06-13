import expres from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/productController.js";

const router = expres.Router();

router.get("/", getAllProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;