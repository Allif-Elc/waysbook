const { user } = require("../../models");

const joi = require("joi");

const bycrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

exports.register = async (req,res) => {
    const schema = joi.object({
        name: joi.string().min(6).max(20).required(),
        email: joi.string().email().min(6).required(),
        password: joi.string().min(6).required(),
        //status: joi.string().min(6),
    });

    const { error } =  schema.validate(req.body);

    if(error){
        return res.status(401).send({
            error:{
                message: error.details[0].message,
            }
        });
    };

    try{

        const salt = await bycrypt.genSalt(10);

        const hashedPassword = await bycrypt.hash(req.body.password, salt);

        const userExist = await user.create({
            name: req.body.name,
            email: req.body.email,
            status: "customer",
            password: hashedPassword,

        });

        const token = jwt.sign({id: userExist.id}, process.env.TOKEN_KEY);

        res.status(200).send({
            status: "success",
            data: {
                name: userExist.name,
                email: userExist.email,
                status: userExist.status,
                token
            }
        })

    }catch(error){
        console.log(error);
        res.status(500).send({
          status: "failed",
          message: "Server Error",
        }); 
    }
};

exports.login = async (req,res) => {

    const schema = joi.object({
        
        email: joi.string().email().min(6).required(),
        password: joi.string().min(6).required(),

    });

    const { error } = schema.validate(req.body);

    if(error){
        return res.status(400).send({
            error: {
                message: error.details[0].message,
            },
        });
    };

    try{

        const userExist = await user.findOne({
            where: {
                email: req.body.email,
            },

            attributes: {
                excludes: ["createdAt","updatedAt"]
            }

        });

        const isValid = await bycrypt.compare(req.body.password, userExist.password);

        if(!isValid){
            return res.status(400).send({
                status: "failed",
                message: "credential is invalid"
            })
        };

        const token = jwt.sign({id: userExist.id}, process.env.TOKEN_KEY);

        res.status(200).send({
            status: "success",
            data: {
                id: userExist.id,
                name: userExist.name,
                email: userExist.email,
                status: userExist.status,
                token
            }
        })


    }catch(error){
        console.log(error);
        res.status(500).send({
          status: "failed",
          message: "Server Error",
        });    
    }
};

exports.checkAuth = async (req, res) => {
    try {
      const id = req.user.id;
  
      const dataUser = await user.findOne({
        where: {
          id,
        },
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      });
  
      if (!dataUser) {
        return res.status(404).send({
          status: "failed",
        });
      }
  
      res.send({
        status: "success",
        data: {
          user: {
            id: dataUser.id,
            name: dataUser.name,
            email: dataUser.email,
            status: dataUser.status,
          },
        },
      });
    } catch (error) {
      console.log(error);
      res.status({
        status: "failed",
        message: "Server Error",
      });
    }
  };