const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
    index: true,
  },
  content: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Atualiza o updatedAt antes de cada save
noteSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
