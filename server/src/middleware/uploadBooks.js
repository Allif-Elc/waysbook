const multer = require("multer");

exports.uploadBooks= (files) => {

    const storage = multer.diskStorage({
        destination: (req,file,cb)=>{
            cb(null,"uploads");
        },
        filename: (req,file,cb)=>{
            cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, ""));
        }
    });

    const fileFilter = ( req, file, cb ) =>{
        if(file.fieldname == files ) {
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
    }).single(files);

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
