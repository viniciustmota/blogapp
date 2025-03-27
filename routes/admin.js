import express from 'express'
const router = express.Router()
import mongoose from 'mongoose'
import Categoria from '../models/Categoria.js'
import Postagem from '../models/Postagem.js'
import eAdmin from '../helpers/eAdmin.js'

router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res) => {
    res.send('Página de Posts')
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) =>{
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })   
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", eAdmin, (req, res) =>{
    
    let erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
         }
    
         new Categoria(novaCategoria).save().then(() =>{
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
         }).catch((err) =>{
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
            res.redirect("/admin")
         })
    }
    
})

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        if (!categoria) {
            req.flash("error_msg", "A categoria solicitada não existe.");
            return res.redirect("/admin/categorias");
        }
        
        // Se a categoria for encontrada, renderiza a página de edição
        res.render("admin/editcategorias", {
            categoria: categoria, // Passa a categoria encontrada
            erros: req.flash('erros') || [] // Mensagens de erro, se houver
        });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar a categoria para edição.");
        res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit/", eAdmin, (req, res) => {
    let erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido" });
    }

    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria muito pequeno" });
    }

    // Se houver erros, renderiza a página de edição novamente com os erros e os dados
    if (erros.length > 0) {
        // Passa os erros e dados preenchidos, incluindo o ID na URL
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {
            res.render("admin/editcategorias", {
                categoria: categoria,
                erros: erros
            });
        }).catch((err) => {
            req.flash("erro_msg", "Erro ao encontrar a categoria para edição.");
            res.redirect("/admin/categorias");
        });
    } else {
        // Se não houver erros, faz a atualização da categoria
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!");
                res.redirect("/admin/categorias");
            }).catch((err) => {
                req.flash("erro_msg", "Houve um erro ao salvar a edição da categoria");
                res.redirect("/admin");
            });
        }).catch((err) => {
            req.flash("erro_msg", "Houve um erro ao editar a categoria");
            res.redirect("/admin/categorias");
        });
    }
});

router.post("/categorias/deletar", eAdmin, (req, res) =>{
    Categoria.findByIdAndDelete({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", eAdmin, (req, res) =>{
    Postagem.find().populate("categoria").sort({data:"desc"}).then((postagens) =>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", eAdmin, (req, res) =>{
    Categoria.find().then((categorias) =>{
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect('/admin')
    })
})

router.post("/postagens/nova", eAdmin, (req, res) =>{
    let erros = []

    if(req.body.categoria == 0){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo:   req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id", eAdmin, (req,res) =>{
    Postagem.findOne({_id: req.params.id}).then((postagem) =>{
        Categoria.find().then((categorias) =>{
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err) =>{
            req.flash("error_msg", "Houve um errro ao listar as categorias")
            req.redirect("/admin/postagens")
        })
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagem/edit", eAdmin, (req,res) =>{
    Postagem.findOne({_id: req.body.id}).then((postagem) =>{

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() =>{
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro interno")
            res.redirect("/admin/postagens")
        })
    }).catch((err) =>{

        console.log(err);
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id", eAdmin, (req,res) =>{
    Postagem.findByIdAndDelete({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/admin/postagens")
    })
})

export default router;