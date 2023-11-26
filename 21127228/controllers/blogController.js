const controller = {};
const models=require('../models')
const { Op } = require('sequelize');

controller.showList = async (req, res) => {

    //Get search key
    let search_key = req.query.search_key;

    //Get category choice
    let categoryFilter = req.query.category;

    //Get tag choice
    let tagFilter = req.query.tag;
    
    res.locals.categories = await models.Category.findAll({
        attributes: ["id", "name"]
    });
    res.locals.tags = await models.Tag.findAll({
        attributes: ["id", "name"]
    });

    let blogsQuery = {
        attributes: ["id", "title", "imagePath", "summary", "createdAt"],
        include: [
            { model: models.Comment },
            { model: models.Tag },
            { model: models.Category, where: {} },
        ],
    };

    if (search_key) {
        blogsQuery.where = {
            ...blogsQuery.where,
            title: { 
                [Op.iLike]: { [Op.any]: [`%${search_key.toLowerCase()}%`] }
            }
        };
    }

    if (categoryFilter) {
        blogsQuery.include[2].where.name = categoryFilter;
    }

    if (tagFilter) {
        const taggedBlogs = await models.Blog.findAll({
            attributes: ["id"],
            include: [{
                model: models.Tag,
                where: { name: tagFilter },
                attributes: [],
            }],
        });

        const blogIdsWithTag = taggedBlogs.map((blog) => blog.id);

        blogsQuery.where = {
            id: blogIdsWithTag 
        };
    }

    res.locals.blogs = await models.Blog.findAll(blogsQuery);

    
    console.log("Search key:" +search_key); 
    console.log("Tag choose:" + tagFilter);
    console.log("Category choose:" + categoryFilter);
    res.render("index");
};

/*controller.showList =async (req,res) => {   
    let categoryFilter = req.query.category;
    res.locals.categories = await models.Category.findAll({
        attributes: ["id", "name"]
    });
    res.locals.blogs = await models.Blog.findAll({
        attributes: ["id", "title", "imagePath", "summary", "createdAt"],
        include: [
            {model: models.Comment},
            {model: models.Tag},
            {model: models.Category},
        ],
    });
    console.log(categoryFilter);
    res.render("index");
}; */

controller.showDetails = async (req,res) => {
    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
    res.locals.blog = await models.Blog.findOne({
        attributes: ["id","title","description","createdAt"],
        where: {id: id},
        include: [
            {model: models.User},
            {model: models.Tag},
            {model: models.Category},
            {model: models.Comment},
        ],
    });
    res.render("details");
}

module.exports = controller;