import multer from "multer";

export const uploadLogo = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new Error("Arquivo precisa ser uma imagem."));
            return;
        }
        cb(null, true);
    },
}).single("file");
