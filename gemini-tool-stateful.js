import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Define the tool schema
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro", // or "gemini-2.5-pro-exp-03-25"
  tools: [
    {
      functionDeclarations: [
        {
          name: "calculate",
          description: "Performs basic arithmetic",
          parameters: {
            type: "object",
            properties: {
              operation: {
                type: "string",
                enum: ["add", "subtract", "multiply", "divide"],
              },
              a: { type: "number" },
              b: { type: "number" },
            },
            required: ["operation", "a", "b"],
          },
        },
      ],
    },
  ],
  systemInstruction: {
    role: "system",
    parts: [{ text: "You're a helpful assistant that can do math using a calculator tool." }],
  },
});

async function main() {
  // Create chat instance with empty history
  const chat = model.startChat({
    history: [], // You can also keep a running history for more advanced cases
  });

  // User message
  const userPrompt = "What’s 12 divided by 3?";

  // Send message to chat
  const result = await chat.sendMessage([{ text: userPrompt }]);

  const response = result.response;
  console.log("response content is ",response.candidates[0].content);
  const part = response.candidates?.[0]?.content.parts?.[0];

  // Check for function call
  if (part.functionCall) {
    const { name, args } = part.functionCall;
    console.log(`Function called: ${name}`);
    console.log("Arguments:", args);

    // Handle function
    if (name === "calculate") {
      const { operation, a, b } = args;
      let answer;
      switch (operation) {
        case "add":
          answer = a + b;
          break;
        case "subtract":
          answer = a - b;
          break;
        case "multiply":
          answer = a * b;
          break;
        case "divide":
          answer = b !== 0 ? a / b : "undefined (division by zero)";
          break;
        default:
          answer = "Unknown operation";
      }

      console.log(`Tool Response: ${a} ${operation} ${b} = ${answer}`);
    }
  } else {
    // If model just replies normally
    console.log("Model Response:", part?.text);
  }
}

await main();
