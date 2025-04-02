import "dotenv/config";
import readline from "readline";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function run() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });

    const chat = model.startChat({
        history: [], // Start with an empty history
    });

    async function askAndRespond() {
        rl.question("You: ", async (msg) => {
            if (msg.toLowerCase() === "exit") {
                rl.close();
            } else {
                const result = await chat.sendMessage(msg);
                const response = await result.response;
                const text = await response.text();
                console.log("AI: ", text);
                askAndRespond();
            }
        });
    }

    askAndRespond(); // Start the conversation loop
}

run();