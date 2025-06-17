const cloudinary = require("cloudinary").v2
const File = require("../models/File")
require("dotenv").config()
const multer = require("multer")
const storage = multer.memoryStorage()
const upload = multer({ storage })

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

exports.uploadFile = (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err)
      return res.status(500).json({ message: "File upload failed", error: err.message })
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
        },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary error:", error)
            return res.status(500).json({ message: "File upload failed", error: error.message })
          }

          try {
            // Save file metadata to database
            const newFile = new File({
              ownerId: req.user.id,
              filename: req.file.originalname,
              fileURl: result.secure_url,
              isPublic: false,
            })

            await newFile.save()
            console.log("File saved to database:", newFile)

            res.status(200).json({
              message: "File uploaded successfully",
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              size: result.bytes,
              fileId: newFile._id,
            })
          } catch (dbError) {
            console.error("Database save error:", dbError)
            return res
              .status(500)
              .json({ message: "File uploaded but failed to save to database", error: dbError.message })
          }
        },
      )

      require("streamifier").createReadStream(req.file.buffer).pipe(uploadStream)
    } catch (error) {
      console.error("Server error:", error)
      return res.status(500).json({ message: "Server error", error: error.message })
    }
  })
}
