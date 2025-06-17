const express = require("express")
const router = express.Router()
const { uploadFile } = require("../controller/filesController")
const auth = require("../middleware/auth")
const File = require("../models/File")
const { v4: uuidv4 } = require("uuid")

// File upload route - requires authentication
router.post("/upload", auth, uploadFile)

// Get all files for a user
router.get("/files", auth, async (req, res) => {
  try {
    const files = await File.find({ ownerId: req.user.id }).sort({ createdAt: -1 })
    res.json(files)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Toggle file privacy and generate/remove share link
router.patch("/files/:fileId/toggle-privacy", auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId, ownerId: req.user.id })

    if (!file) {
      return res.status(404).json({ message: "File not found" })
    }

    // Toggle privacy
    file.isPublic = !file.isPublic

    // Generate share ID if making public, remove if making private
    if (file.isPublic && !file.shareId) {
      file.shareId = uuidv4()
    } else if (!file.isPublic) {
      file.shareId = undefined
    }

    await file.save()

    res.json({
      message: `File is now ${file.isPublic ? "public" : "private"}`,
      file: file,
      shareUrl: file.isPublic ? `${process.env.BASE_URL}/api/files/share/${file.shareId}` : null,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Access public file via share link
router.get("/share/:shareId", async (req, res) => {
  try {
    const file = await File.findOne({ shareId: req.params.shareId, isPublic: true })

    if (!file) {
      return res.status(404).json({ message: "File not found or not public" })
    }

    // Redirect to the actual file URL
    res.redirect(file.fileURl)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete file
router.delete("/files/:fileId", auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId, ownerId: req.user.id })

    if (!file) {
      return res.status(404).json({ message: "File not found" })
    }

    // Delete from database
    await File.findByIdAndDelete(req.params.fileId)

    res.json({ message: "File deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
