// Carregando módulos
    import express from 'express'
    import { engine } from 'express-handlebars'
    import bodyParser from 'body-parser'
    const app = express()
    import admin from './routes/admin.js'
    import path from 'path'
    import { dirname } from 'path';
    import { fileURLToPath } from 'url';
    
    // Criando __dirname manualmente
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
    import mongoose from 'mongoose'
    import session from 'express-session'
    import flash from 'connect-flash'
    import Postagem from "./models/Postagem.js"
    import Categoria from "./models/Categoria.js"
    import usuarios from './routes/usuario.js'
    import passport from "passport";
    import configureAuth from "./config/auth.js";
    configureAuth(passport);
    
// Configurações
    // Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())
    // Middleware
        app.use((req, res, next) =>{
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            next()
        })
    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', engine({defaultLayout: 'main',
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true
            }
        }))
        app.set('view engine', 'handlebars')
    // Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect(`mongodb://localhost/blogapp`).then(() =>{
            console.log("Conectado ao MongoDB!");
        }).catch((err) =>{
            console.log(`Erro ao se conectar:  ${err}`);
        })
    //  Public
        app.use(express.static(path.join(__dirname, "public")))
// Rotas

    app.get('/', (req, res) => {
        Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/postagem/:slug", (req, res) =>{
        Postagem.findOne({slug: req.params.slug}).then((postagem) =>{
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Está postagem não existe")
                res.redirect("/")
            }
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/categorias", (req, res) =>{
        Categoria.find().then((categorias) =>{
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno ao listar as categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) =>{
        Categoria.findOne({slug: req.params.slug}).then((categoria) =>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).then((postagens) =>{
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err) =>{
                    req.flash("error_msg", "Houve um erro ao listar os posts!")
                    res.redirect("/")
                })

            }else{
                req.flash("error_msg", "Está categoria não existe")
                res.redirect("/")
            }
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
            res.redirect("/")
        })
    })

    app.get("/404", (req, res) => {
        res.send("Erro 404!")
    })

    app.use('/admin', admin)
    app.use("/usuarios", usuarios)
// Outros
    const PORT = 8081
    try {
        app.listen(PORT, () =>{
            console.log(`Servidor rodando em: http://localhost:${PORT}`);
        })
    }catch(err) {
        console.log(`Servidor não iniciado: ${err}`);
        
    }
