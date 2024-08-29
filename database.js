import mongoose from "mongoose";
try {
    const db = await mongoose.connect("mongodb+srv://andresrick1999:123*@cluster0.nclkaza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log("database se conecto", db.connection.name);
    
} catch (exception) {
    console.error(exception.mensaje)
}