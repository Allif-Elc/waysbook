const express = require('express');

const router = express.Router();


//controller
const { register, login,checkAuth } = require("../controller/auth");
const { getUsers,
        getUser,
        updateUser,
        deleteUser,} = require("../controller/user");
const { getProduct,
        getProducts,
        addProduct,
        updateProduct,
        deleteProduct} = require("../controller/product");
const { getTransaction, addTransaction, notification
        } = require("../controller/transaction");
const {addProfile,getProfile,updateProfile} = require("../controller/profile")
//middlewares 
const { auth } = require("../middleware/auth");
const { uploadBooks } = require("../middleware/uploadBooks");
const { uploadImages } = require("../middleware/uploadImages");


//routes
// Route
router.get('/users', getUsers);
router.get('/user/:id', getUser);
router.delete('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);

router.post('/login', login);
router.post('/register', register);
router.get ('/check-auth',auth, checkAuth);

router.get('/product/:id', auth,getProduct);
router.get('/products', getProducts);
router.post('/product', auth,uploadImages('image','bookFile'),addProduct);
router.patch('/product/:id', auth,uploadImages('image','bookFile'),updateProduct);
router.delete('/product/:id', auth,deleteProduct);

router.get('/transaction',auth, getTransaction);
router.post('/transaction', auth,addTransaction);
router.post('/notification', notification);

router.get('/profile',auth,getProfile);
router.post('/profile',auth,addProfile);
router.patch('/profile',auth,uploadBooks("image"),updateProfile);

module.exports = router;