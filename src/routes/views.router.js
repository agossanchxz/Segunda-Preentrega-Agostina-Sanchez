import { Router } from "express";
const router = Router(); 

import ProductManager from "../managers/product-manager.js";
const manager = new ProductManager("./src/data/productos.json"); 

// Ruta para obtener todos los productos
router.get("/products", async (req, res) => {
    const productos = await manager.getProducts(); 
    res.render("home", { productos }); 
});

// Ruta para la vista de productos en tiempo real
router.get("/realtimeproducts", async (req, res) => {
    res.render("realtimeproducts"); 
});

export default router; 
