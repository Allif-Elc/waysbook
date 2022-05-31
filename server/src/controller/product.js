const { user,product } = require("../../models");

exports.addProduct = async (req,res) => {
    try {
        const data = { 
            image: req.files.image[0].filename,
            bookFile: req.files.bookFile[0].filename,
            title: req.body.title,
            author: req.body.author,
            publicationDate: req.body.publicationDate,
            pages: req.body.pages,
            isbn: req.body.isbn,
            desc: req.body.desc,
            price: req.body.price,
            idUser: req.user.id,
        };

        //return console.log(data.image,data.bookFile);
        
        const newProduct = await product.create(data);

        let dataProduct = await product.findOne({
            where: {
                id: newProduct.id,
            },
            include:{
                model:user,
                as: "user",
                attributes:{
                    exclude: ["createdAt","updatedAt","password","status"]
                },
            },
            attributes:{
                exclude:["createdAt","updatedAt"]
            }
        });

        dataProduct = JSON.parse(JSON.stringify(dataProduct));

        res.status(200).send({
            status: "success",
            data: {
                ...dataProduct,
                image: process.env.PATH_FILE + dataProduct.image,
                donwload: process.env.PATH_FILE + dataProduct.bookFile,
            },
        });

    } catch (error) {
        console.log(error);
        res.status(200).send({
            status: "failed",
            message: "Server Error"
        })
    }
};

exports.getProduct = async (req,res) => {
    try {
      const {id} = req.params;
      
      let dataproduct = await product.findOne({
          where: {id:id},
          include:{
            model:user,
            as: "user",
            attributes:{
                exclude: ["createdAt","updatedAt","password","status"]
            },
        },
        attributes:{
            exclude:["idUser","createdAt","updatedAt"]
        },
      });

      dataproduct = JSON.parse(JSON.stringify(dataproduct));

      res.status(200).send({
        status: "success",
        data: {
            ...dataproduct,
            image: dataproduct.image == null ? null:process.env.PATH_FILE + dataproduct.image,
            donwload: process.env.PATH_FILE + dataproduct.bookFile,
        },
      });

    } catch (error) {
        console.log(error);
        res.status(400).send({
            status: "failed",
            message: "Server Error",
        });
    };
};

exports.getProducts = async (req,res) => {
    try {
      
      let dataproduct = await product.findAll({
          include:{
            model:user,
            as: "user",
            attributes:{
                exclude: ["createdAt","updatedAt","password","status"]
            },
        },
        attributes:{
            exclude:["createdAt","updatedAt"]
        },
      });

      dataproduct = JSON.parse(JSON.stringify(dataproduct));
      dataproduct = dataproduct.map((item) => {
        return { ...item,
                 image: item.image == null ? null:process.env.PATH_FILE + item.image,
                 donwload: process.env.PATH_FILE + item.bookFile,
               };
      });

      res.status(200).send({
        status: "success",
        data: dataproduct 
        
      });

    } catch (error) {
        console.log(error);
        res.status(400).send({
            status: "failed",
            message: "Server Error",
        });
    };
};

exports.updateProduct = async (req,res) => {
    try {
        const {id} = req.params;
        const data = { 
            image: req.files.image[0].filename,
            bookFile: req.files.bookFile[0].filename,
            title: req.body.title,
            author: req.body.author,
            publicationDate: req.body.publicationDate,
            pages: req.body.pages,
            isbn: req.body.isbn,
            desc: req.body.desc,
            price: req.body.price,
            idUser: req.user.id,
        };

        //return console.log(data.image)
        await product.update(data,{where:{id:id}});

        let updateProduct = await product.findOne({
            where: {
                id:id,
            },
            attributes:{ 
                exclude:["createdAt","updatedAt"]
        },
        });

        updateProduct = JSON.parse(JSON.stringify(updateProduct));
        updateProduct = {
            ...updateProduct,
            image: updateProduct.image == null ? null:process.env.PATH_FILE + updateProduct.image,        
        }
        res.status(200).send({
            status: "success",
            data: updateProduct,
        })
    } catch (error) {
        console.log(error);        
        res.status(400).send({
            status: "failed",
            message: "Server Error",
        });
    }
};

exports.deleteProduct = async (req,res) => {
    try {
        const {id} = req.params;

        await product.destroy({
            where: {id:id},
        });

        res.status(200).send({
            status: "success",
            data: {
                id: id,
            }
        })
        
    } catch (error) {
        console.log(error);
        res.status(400).send({
            status: "failed",
            message: "Server Error",
        });
    }
}