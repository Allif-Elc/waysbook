const { user, profile, product, transaction } = require("../../models");
const { Op, or } = require("sequelize");
const midtransClient = require("midtrans-client");

exports.getTransaction = async (req, res) => {
  try {
    const idBuyer = req.user.id;
    const idSeller = req.user.id;
    let dataTrans = await transaction.findAll({
      where: {
        [Op.or]: [{ idBuyer: idBuyer }, { idSeller: idSeller }],
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: user,
          as: "buyer",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password", "status"],
          },
        },
        {
          model: user,
          as: "seller",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password", "status"],
          },
        },
        {
          model: product,
          as: "product",
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "price",
              "idUser",
              "qty",
              "desc",
            ],
          },
        },
      ],

      attributes: {
        exclude: ["idBuyer", "idSeller", "idProduct", "updatedAt"],
      },
    });

    dataTrans = JSON.parse(JSON.stringify(dataTrans));

    dataTrans = dataTrans.map((item) => {
      return {
        ...item,
        product: {
          ...item.product,
          image:
            item.product.image == null
              ? null
              : process.env.PATH_FILE + item.product.image,
          donwload: process.env.PATH_FILE + item.product.bookFile,
        },
      };
    });

    res.status(200).send({
      status: "success",
      data: dataTrans,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: "failed",
      message: "server error",
    });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    let data = {
      idBuyer: req.user.id,
      idSeller: req.body.idSeller,
      idProduct: req.body.idProduct,
      price: req.body.price,
      qty: req.body.qty,
      status: "pending",
    };
    data = {
      id: parseInt(data.idProduct + Math.random().toString().slice(3, 8)),
      ...data,
    };

    const newTransaction = await transaction.create(data);

    const buyerData = await user.findOne({
      where: {
        id: data.idBuyer,
      },
      include: [
        {
          model: profile,
          as: "profile",
          attributes: {
            exclude: ["createdAt", "updatedAt", "idUser"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    let parameter = {
      transaction_details: {
        order_id: newTransaction.id,
        gross_amount: data.price,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        full_name: buyerData?.name,
        email: buyerData?.email,
        phone: buyerData?.profile?.phone,
      },
    };

    const payment = await snap.createTransaction(parameter);
    res.send({
        status: 'pending',
        message: 'Pending transaction payment gateway',
        payment,
        product: {
          id: data.idProduct,
        },
      });

  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: "failed",
      message: "server error",
    });
  }
};

const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

const core = new midtransClient.CoreApi();

core.apiConfig.set({
  isProduction: false,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

/**
 *  Handle update transaction status after notification
 * from midtrans webhook
 * @param {string} status
 * @param {transactionId} transactionId
 */



 exports.notification = async (req, res) => {
    try {
      const statusResponse = await core.transaction.notification(req.body);
  
      console.log('------- Notification --------- ✅');
      console.log(statusResponse);
  
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;
  
      if (transactionStatus == 'capture') {
        if (fraudStatus == 'challenge') {
          // TODO set transaction status on your database to 'challenge'
          // and response with 200 OK
          updateTransaction('pending', orderId);
          res.status(200);
        } else if (fraudStatus == 'accept') {
          // TODO set transaction status on your database to 'success'
          // and response with 200 OK
          updateProduct(orderId);
          updateTransaction('success', orderId);
          res.status(200);
        }
      } else if (transactionStatus == 'settlement') {
        // TODO set transaction status on your database to 'success'
        // and response with 200 OK
        updateTransaction('success', orderId);
        res.status(200);
      } else if (
        transactionStatus == 'cancel' ||
        transactionStatus == 'deny' ||
        transactionStatus == 'expire'
      ) {
        // TODO set transaction status on your database to 'failure'
        // and response with 200 OK
        updateTransaction('failed', orderId);
        res.status(200);
      } else if (transactionStatus == 'pending') {
        // TODO set transaction status on your database to 'pending' / waiting payment
        // and response with 200 OK
        updateTransaction('pending', orderId);
        res.status(200);
      }
    } catch (error) {
      console.log(error);
      res.status(500);
    }
  };
  
  const updateTransaction = async (status, transactionId) => {
    await transaction.update(
      {
        status,
      },
      {
        where: {
          id: transactionId,
        },
      }
    );
  };
