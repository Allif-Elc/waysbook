const { chat, user, profile } = require("../../models");

const jwt = require("jsonwebtoken");

const { Op } = require("sequelize");

// init variable here
const connectedUser = {};

const socketIo = (io) => {
  io.use((socket, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token) {
      next();
    } else {
      next(new Error("Error: access denied"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connect");
    console.log("Client ID: ", socket.id);
    const token = socket.handshake.auth.token;
    const tokenKey = process.env.TOKEN_KEY;
    const userId = jwt.verify(token, tokenKey).id;

    connectedUser[userId] = socket.id;
    // define listener on event load admin contact
    socket.on("load admin contact", async () => {
      try {
        const adminContact = await user.findAll({
          where: {
            status: "admin",
          },
          include: {
            model: profile,
            as: "profile",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          attributes: {
            exclude: ["password", "createdAt", "updatedAt"],
          },
        });


        socket.emit("admin contact", adminContact);
      } catch (error) {
        console.log(error);
      }
    });

    // define listener on event load customer contact
    socket.on("load customer contact", async () => {
      try {
        let customerContact = await user.findAll({
          include: [
            {
              model: profile,
              as: "profile",
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: chat,
              as: "recipient",
              attributes: {
                exclude: ["idRecipient", "idSender", "createdAt", "updatedAt"],
              },
            },
            {
              model: chat,
              as: "sender",
              attributes: {
                exclude: ["idRecipient", "idSender", "createdAt", "updatedAt"],
              },
            },
          ],
          attributes: {
            exclude: ["password", "createdAt", "updatedAt"],
          },
          where: {
            status: "customer",
          },
        });

        customerContact = JSON.parse(JSON.stringify(customerContact));
        customerContact = customerContact.map((item) => ({
          ...item,
          profile: {
            ...item.profile,
            image: item.profile?.image
              ? process.env.FILE_PATH + item.profile?.image
              : null,
          },
        }));
        

        socket.emit("customer contact", customerContact);
      } catch (error) {
        console.log(error);
      }
    });

    // define listener on event load messages
    socket.on("load messages", async (payload) => {
      try {
        const idRecipient = payload;
        const idSender = userId;
        
        const data = await chat.findAll({
          where: {
            idSender: {
              [Op.or]: [idRecipient, idSender],
            },
            idRecipient: {
              [Op.or]: [idRecipient, idSender],
            },
          },
          include: [
            {
              model: user,
              as: "recipient",
              attributes: {
                exclude: ["createdAt", "updatedAt", "password"],
              },
            },
            {
              model: user,
              as: "sender",
              attributes: {
                exclude: ["createdAt", "updatedAt", "password"],
              },
            },
          ],
          order: [["createdAt", "ASC"]],
          attributes: {
            exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
          },
        });

        socket.emit("messages", data);
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("send message", async (payload) => {
      try {
        const token = socket.handshake.auth.token;

        const tokenKey = process.env.TOKEN_KEY;
        const verified = jwt.verify(token, tokenKey);

        const idSender = verified.id;

        const { idRecipient, message } = payload;

        await chat.create({
          message,
          idRecipient,
          idSender,
        });

        io.to(socket.id)
          .to(connectedUser[idRecipient])
          .emit("new message", idRecipient);
      } catch (err) {
        console.log(error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnect");
    });
  });
};

module.exports = socketIo;
