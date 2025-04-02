import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function main() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });
  const result = await model.generateContent("Explain how AI works in a few words");
  const response = await result.response;
  console.log(response.text());
}

await main();
