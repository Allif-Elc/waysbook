const multer = require("multer");

exports.uploadImages= (image,bookFile) => {

    const storage = multer.diskStorage({
        destination: (req,file,cb)=>{
            cb(null,"uploads");
        },
        filename: (req,file,cb)=>{
            cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, ""));
        }
    });

    const fileFilter = ( req, file, cb ) =>{
        if(file.fieldname == image||file.fieldname == bookFile ) {
            if(!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|pdf|PDF)$/)) {
                req.fileValidationError =  {
                    message:"Only image files are allowed",
                };
                return cb(new Error("Only pdf files are allowed"), false);
                }
            }
        cb(null,true);
        };

    const sizeinMB = 50;
    const maxSize = sizeinMB * 1000 * 1000;

    const upload = multer ({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSize,
        },
    }).fields([
        {name:`${image}`,maxCount:1},
        {name:`${bookFile}`,maxCount:1}
    ]);

    return (req,res,next) => {
        upload (req, res, (err)=>{

            if (req.fileValidationError)
                return res.status(400).send(req.fileValidationError);

            if(err){
                if(err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).send({
                        message: "Max file sized 10MB",
                    });
                }
                return  res.status(400).send(err);
            }

            return next();
        })
    }
}
