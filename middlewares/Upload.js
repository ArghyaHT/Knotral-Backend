import multer from "multer";
import path from "path";

// Store files temporarily in /tmp or memory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp"); // temporary folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});

// Accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

export const upload = multer({ storage, fileFilter });
