import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const res = await model.embedContent(text);
  return res.embedding.values;
}

/**
 * chatComplete: wraps a Gemini chat call with a system prompt + context.
 * responseFormatJson: if true, forces the model to return valid JSON only.
 */
export async function chatComplete({ system, messages, responseFormatJson = false }) {
 const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
    systemInstruction: system,
    ...(responseFormatJson
      ? { generationConfig: { responseMimeType: "application/json" } }
      : {}),
  });

  // Gemini uses "model" instead of "assistant", and wants history separate
  // from the latest message.
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const lastMessage = messages[messages.length - 1].content;

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage);
  return result.response.text();
}

export default genAI;