const mongoose = require("mongoose");
const { Schema } = mongoose;

const ExpenditureSchema = new Schema({
  category: { type: String },
  amount: { type: Number, required: true },
  comment: { type: String },
  batch: { type: String },
  date: { type: Date, default: Date.now },
});

const Expenditure = mongoose.model("Expenditure", ExpenditureSchema);

module.exports = Expenditure;
