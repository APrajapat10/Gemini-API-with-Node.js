import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// 🔧 Calculator function (tool implementation)
function calculator({
  operation,
  a,
  b,
}){
  switch (operation) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      return b !== 0 ? a / b : "undefined (division by zero)";
    default:
      return "Unknown operation";
  }
}

// 🧠 Gemini model with tool declaration
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
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
  const chat = model.startChat({ history: [] });

  const userPrompt = "Can you subtract 5 from 20?";

  const result = await chat.sendMessage([{ text: userPrompt }]);
  const response = result.response;

  const part = response.candidates?.[0]?.content.parts?.[0];

  if (part?.functionCall) {
    const { name, args } = part.functionCall;
    console.log(`Function called: ${name}`);
    console.log("Arguments:", args);

    if (name === "calculate") {
      const answer = calculator(args);
      console.log(`Tool Response: ${args.a} ${args.operation} ${args.b} = ${answer}`);
    }
  } else {
    console.log("Model Response:", part?.text);
  }
}

await main();
