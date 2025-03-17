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
// Configurações
    // Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())
    // Middleware
        app.use((req, res, next) =>{
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
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
    app.use('/admin', admin)
// Outros
    const PORT = 8081
    try {
        app.listen(PORT, () =>{
            console.log(`Servidor rodando em: http://localhost:${PORT}`);
        })
    }catch(err) {
        console.log(`Servidor não iniciado: ${err}`);
        
    }
