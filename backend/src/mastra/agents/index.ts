import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const getWeather = createTool({
  id: "getWeather",
  inputSchema: z.object({
    location: z.string(),
  }),
  description: `Fetches the current weather information for a given location`,
  execute: async ({ location }) => {
    // Tool logic here (e.g., API call)
    console.log("Using tool to fetch weather information for", location);
    return { temperature: 20, conditions: "Sunny" }; // Example return
  },
});

export const myAgent = new Agent({
  id: "myAgent",
  name: "My Agent",
  instructions: "You are a helpful assistant!",
  model: openai("gpt-5.4-mini"),
  tools: {
    getWeather,
  },
});