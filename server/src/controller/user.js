const {user} = require('../../models');

exports.getUsers = async(req,res) => {
    try {

        const users = await user.findAll({
            attributes:{
                exclude: ["status","password","createdAt","updatedAt"]
            },    
        });

        res.status(200).send({
            status: "success",
            data: users,
        })
        
    } catch (error) {
        console.log(error);
        res.status(400).send({
            status: "failed",
            message: "Server Error",
        });
    };
};

exports.getUser = async(req,res) => {
    try {

        const {id} = req.params

        const user = await user.findOne({
            where: {
                id:id,
            },
            attributes:{
                exclude: ["status","password","createdAt","updatedAt"]
            },    
        });

        res.status(200).send({
            status: "success",
            data: user,
        })
        
    } catch (error) {
        console.log(error);
        res.status(400).send({
            status: "failed",
            message: "Server Error",
        });
    };
};

exports.updateUser = async (req,res) => {
    try {
        const {id} = req.params;
        
        await user.update(req.body,{where:{id:id}});

        res.status(200).send({
            status: "success",
            messages: `update data user id:${id} finish`,
            data: req.body
        })

    } catch (error) {
        console.log(error);
        res.status(400).send({
            status: "failed",
            message: "Server Error",
        });
    };
};

exports.deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
  
      await user.destroy({
        where: {
          id,
        },
      });
  
      res.send({
        status: 'success',
        message: `Delete user id: ${id} finished`,
      });
    } catch (error) {
      console.log(error);
      res.send({
        status: 'failed',
        message: 'Server Error',
      });
    }
  };