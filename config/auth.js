import passport from "passport";
import localStrategy from 'passport-local' 
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Model de usuário
import Usuario from "../models/Usuario.js"

export default (passport) =>{
    passport.use(new localStrategy({usernameField: 'email', passwordField: "senha"}, (email, senha, done) =>{
        Usuario.findOne({email: email}).then((usuario) =>{
            if(!usuario){
                return done(null, false, {message: "Está conta não existe"})
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) =>{
                if(batem){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: "Senha incorreta"})
                }
            })
        })
    }))

    passport.serializeUser((usuario, done) =>{
        done(null, usuario.id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            // Utilizando async/await com findById
            const usuario = await Usuario.findById(id);
            done(null, usuario);
        } catch (err) {
            done(err);
        }
    });
    
}