import { sql } from "../config/db.js";

export const getAllProducts = async(req, res) => {
    try {
        const products = await sql`
            SELECT * FROM products
            ORDER BY createdAt DESC
        `

        res.status(200).json({success: true, data: products});
    } catch (error) {
        console.log("error getAllProducts",error);
        res.status(500).json({success: false, message: "Something went wrong"});
    }
};

export const createProduct = async(req, res) => {
    const { name, image, price } = req.body;

    if(!name || !image || !price) {
        return res.status(400).json({success: false, message: "Please provide all fields"});
    }

    try {
        const newProduct = await sql`
            INSERT INTO products (name,price,image)
            VALUES (${name},${price},${image})
            RETURNING *
        `;

        res.status(201).json({ success: true, data: newProduct[0] });
    } 
    catch (error) {
        console.log("error createProduct",error);
        res.status(500).json({success: false, message: "Something went wrong"});
    }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await sql`
     SELECT * FROM products WHERE id=${id}
    `;

    res.status(200).json({ success: true, data: product[0] });
  } catch (error) {
    console.log("Error in getProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, image } = req.body;

  try {
    const updateProduct = await sql`
      UPDATE products
      SET name=${name}, price=${price}, image=${image}
      WHERE id=${id}
      RETURNING *
    `;

    if (updateProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({ success: true, data: updateProduct[0] });
  } catch (error) {
    console.log("Error in updateProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteProduct = async(req, res) => {
    const { id } = req.params;
    try {
        await sql`
            DELETE FROM products
            WHERE id = ${id}
            RETURNING *
        `
        res.status(200).json({success: true, message: "Product deleted successfully"});
    } catch (error) {
        res.status(500).json({success: false, message: "Something went wrong"});
    }
};