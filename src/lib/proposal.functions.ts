import { createOpenAI } from "@ai-sdk/openai";
import { createServerFn } from "@tanstack/react-start";
import { Output, streamText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayRunIdFetch } from "./ai-gateway.server";

const DetailsSchema = z.object({
  yourName: z.string().max(60),
  theirName: z.string().max(60),
  howWeMet: z.string().max(400),
  favoriteMemory: z.string().max(400),
  whatILove: z.string().max(400),
  insideJoke: z.string().max(200),
  timeTogether: z.string().max(80),
  tone: z.enum(["playful", "romantic", "poetic", "heartfelt"]),
});

export type ProposalDetails = z.infer<typeof DetailsSchema>;

const ResultSchema = z.object({
  headline: z.string(),
  message: z.string(),
  celebration: z.string(),
});

export type ProposalCopy = z.infer<typeof ResultSchema>;

export const generateProposalCopy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => DetailsSchema.parse(input))
  .handler(async ({ data }): Promise<ProposalCopy> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: {
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
      fetch: runIdFetch.fetch,
    });

    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      output: Output.object({ schema: ResultSchema }),
      system:
        "You write short, warm, personal marriage-proposal copy for an interactive proposal web page. " +
        "Use the couple's real details naturally, never invent facts they did not give, and never use placeholders. " +
        "headline: the proposal question, at most 12 words, including their name. " +
        "message: 2-3 sentences (max 60 words) leading up to the question. " +
        "celebration: one short joyful line (max 20 words) shown after they say yes.",
      prompt: [
        `Tone: ${data.tone}`,
        `Proposer: ${data.yourName || "(unnamed)"}`,
        `Recipient: ${data.theirName || "(unnamed)"}`,
        `Time together: ${data.timeTogether}`,
        `How they met: ${data.howWeMet}`,
        `Favorite memory: ${data.favoriteMemory}`,
        `What the proposer loves about them: ${data.whatILove}`,
        `Inside joke or nickname: ${data.insideJoke}`,
      ].join("\n"),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    return await result.output;
  });
