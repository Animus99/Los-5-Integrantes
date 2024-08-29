import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema(
  {
    n_pregunta:{
        type: Number,
        required: true,
        trim: true,
      },

    preguntas:{
      type: String,
      required: true,
      trim: true,
    },

    respuestas:{
      type: Number,
      required: true,
      trim: true,
    },

    estado:{
      type: String,
      required: true,
      trim: true,
    },

  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export default mongoose.model("Questions", questionsSchema);