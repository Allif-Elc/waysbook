const { user,profile } = require('../../models');

exports.addProfile = async (req,res) => {

    try{

        let data = {
            idUser: req.user.id
        }

        await profile.create(data);

        const newUser = await profile.findOne({
            where: {idUser: req.user.id},

            includes:{
                model: user,
                as: "user",
                attributes:{
                    exclude: ["password","status","createdAt","updatedAt"],
                },
            },

            attributes: {
                exclude: ["createdAt","updatedAt"],
            }
        });

        res.status(200).send({
            status: "success",
            data : newUser,
        })

    }catch(error){
        console.log(error);
        return res.status(400).send({
            status: "error",
            message: "server error",
        });
    }

};


exports.getProfile = async (req,res) => {

    try{

        let userExist = await profile.findOne({
            where: {idUser: req.user.id},

            include:{
                model: user,
                as: "user",
                attributes:{
                    exclude: ["password","status","createdAt","updatedAt"],
                },
            },

            attributes: {
                exclude: ["createdAt","updatedAt"],
            }
        });

        userExist = JSON.parse(JSON.stringify(userExist));

        userExist = {
            ...userExist,
            image: process.env.PATH_FILE + userExist.image,
        }

        res.status(200).send({
            status: "success",
            data : userExist,
        })

    }catch(error){
        console.log(error);
        return res.status(400).send({
            status: "error",
            message: "server error",
        });
    }

};

exports.updateProfile = async (req,res)=>{
  try {    
      
    dataProfile = {
        image: req?.file?.filename,
        phone: req?.body?.phone,
        gender: req?.body?.gender,
        address: req?.body?.address,
    };
    

    const newProfile = await profile.update(dataProfile,{
        where: {idUser:req.user.id},
    });

    let data = await profile.findOne({
        where: {idUser:req.user.id},
        includes:{
            model: user,
            as: "user",
            attributes:{
            exclude: ["password","status","createdAt","updatedAt"],
            }
        },
        attributes: {
            exclude: ["createdAt","updatedAt"]
        },
    });

    data = JSON.parse(JSON.stringify(data));

    
    res.status(200).send({
        status: "success",
        data: {
            ...data,
            image: process.env.PATH_FILE + data.image,
        }
    });

  } catch (error) {
    console.log(error);
    return res.status(400).send({
        status: "error",
        message: "server error",
    }); 
  };
}
