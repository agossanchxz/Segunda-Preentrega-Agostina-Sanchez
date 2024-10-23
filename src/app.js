import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import productRouter from "./routes/products.router.js";
import cartRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
const app = express ();
const PUERTO = 8080;

// Middleware
app.use(express.json());
app.use(express.static("./src/public"));

let productos = []; // 

app.get('/', (req, res) => {
    res.render('home', { productos });
});

// Configuramos Express-Handlebars
app.engine("handlebars", engine()); 
app.set("view engine", "handlebars"); 
app.set("views", "./src/views"); 

// Rutas
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);

// Configurar el WebSocket
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Enviar productos al nuevo cliente
    socket.emit('actualizarProductos', productos);

    // Escuchar por nuevos productos
    socket.on('nuevoProducto', (producto) => {
        if (producto && producto.id) { // Verifica que el producto tenga un ID
            productos.push(producto);
            io.emit('actualizarProductos', productos);
        }
    });

    // Escuchar por productos eliminados
    socket.on('eliminarProducto', (id) => {
        productos = productos.filter(p => p.id !== id); // Filtrar por ID
        io.emit('actualizarProductos', productos);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Rutas para agregar y eliminar productos
app.post('/api/productos', (req, res) => {
    const { producto } = req.body;
    if (producto && producto.id) { // Verifica que hay un id
        productos.push(producto);
        io.emit('actualizarProductos', productos);
        return res.status(200).send('Producto agregado');
    }
    return res.status(400).send('Producto no válido');
});

app.post('/api/productos/eliminar', (req, res) => {
    const { id } = req.body; // Espera un id en lugar del objeto completo
    if (id) {
        productos = productos.filter(p => p.id !== id);
        io.emit('actualizarProductos', productos);
        return res.status(200).send('Producto eliminado');
    }
    return res.status(400).send('ID no válido');
});

app.listen(PUERTO, () => {
    console.log(`Escuchando en el http://localhost:${PUERTO}`);
});
