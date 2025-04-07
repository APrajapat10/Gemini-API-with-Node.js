import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function main() {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    tools: [
      {
        functionDeclarations: [
          {
            name: "calculate",
            description: "Performs a basic arithmetic operation",
            parameters: {
              type: "object",
              properties: {
                operation: {
                  type: "string",
                  description: "The operation to perform",
                  enum: ["add", "subtract", "multiply", "divide"],
                },
                a: {
                  type: "number",
                  description: "The first number",
                },
                b: {
                  type: "number",
                  description: "The second number",
                },
              },
              required: ["operation", "a", "b"],
            },
          },
        ],
      },
    ],
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: "What's 7 multiplied by 6?" }] }],
    toolConfig: { functionCallingConfig: { mode: "auto" } },
  });

  const response = result.response;
  const part = response.candidates?.[0]?.content.parts?.[0];

  if (part.functionCall) {
    const { name, args } = part.functionCall;
    console.log(`Function called: ${name}`);
    console.log("Arguments:", args);

    // Tool implementation
    if (name === "calculate") {
      const { operation, a, b } = args;
      let result;

      switch (operation) {
        case "add":
          result = a + b;
          break;
        case "subtract":
          result = a - b;
          break;
        case "multiply":
          result = a * b;
          break;
        case "divide":
          result = b !== 0 ? a / b : NaN;
          break;
        default:
          throw new Error("Unknown operation");
      }

      console.log(`Tool Response: ${a} ${operation} ${b} = ${result}`);
    }
  } else {
    console.log("Model Response:", part.text);
  }
}

await main();
