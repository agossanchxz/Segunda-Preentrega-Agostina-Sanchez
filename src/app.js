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

//Configuramos Express-Handlebars
app.engine("handlebars", engine()); 
app.set("view engine", "handlebars"); 
app.set("views", "./src/views"); 

//Rutas
app.use ("/api/products", productRouter);
app.use ("/api/carts", cartRouter);

// Configurar el WebSocket
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Enviar productos al nuevo cliente
    socket.emit('actualizarProductos', productos);

    // Escuchar por nuevos productos
    socket.on('nuevoProducto', (producto) => {
        productos.push(producto);
        io.emit('actualizarProductos', productos);
    });

    // Escuchar por productos eliminados
    socket.on('eliminarProducto', (producto) => {
        productos = productos.filter(p => p !== producto);
        io.emit('actualizarProductos', productos);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Rutas para agregar y eliminar productos
app.post('/api/productos', (req, res) => {
    const { producto } = req.body;
    if (producto) {
        productos.push(producto);
        io.emit('actualizarProductos', productos);
    }
    res.status(200).send('Producto agregado');
});

app.post('/api/productos/eliminar', (req, res) => {
    const { producto } = req.body;
    if (producto) {
        productos = productos.filter(p => p !== producto);
        io.emit('actualizarProductos', productos);
    }
    res.status(200).send('Producto eliminado');
});

app.listen(PUERTO, () => {
    console.log ('Escuchando en el http://localhost:${PUERTO}');
    })