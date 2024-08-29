import Question from "./model.js";

export const getQuestion = async (req, res) => {
    const { id } = req.params;  // `id` es `id_pregunta` en la URL
    try {
        const question = await Question.findOne({ id_pregunta: id });  // Buscar por `id_pregunta`
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};