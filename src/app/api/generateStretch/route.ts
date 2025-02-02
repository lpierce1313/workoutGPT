import { NextResponse } from 'next/server';
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import openAIClient from '@/lib/AIClient';

const Stretch = z.object({
  stretchName: z.string(),
  description: z.string(),
  numReps: z.number().optional(),
  durationInSeconds: z.string(),
});

const StretchingRoutine = z.object({
  description: z.string(),
  totalEstimatedDurationMinutes: z.string(),
  stretches: z.array(Stretch),
});

export interface StretchRequest {
  stretchType: string;
  stretchAreas: string[];
  duration: number;
  additionalInfo?: string;
  injuries?: string;
}

export type StretchResponse = z.infer<typeof StretchingRoutine>;

export async function POST(req: Request) {
  const stretchRequest: StretchRequest = await req.json();
  try {
    console.log("Stretch Request:", stretchRequest);
    const stretchPlan = await generateStretchRoutine(stretchRequest);
    return NextResponse.json(stretchPlan);
  } catch (error) {
    console.error("Error generating stretching plan:", error);
}
}

const generateStretchRoutine = async (
  stretchRequest: StretchRequest
): Promise<StretchResponse> => {
  const {
    stretchType,
    stretchAreas,
    duration,
    additionalInfo,
    injuries,
  } = stretchRequest;

  const prompt = `Generate a stretching routine based on ${stretchType} for the following parameters:
  - Stretch Type: ${stretchType}
  - Stretch Areas: ${stretchAreas.join(", ")}
  - Include number of reps if applicable in description for each stretch
  - Duration: ${duration} minutes
  - Additional Info: ${additionalInfo}
  - do not exceed 100 chars for description or 50 chars for strech description
  - Injuries: ${injuries}`;

  console.log("Prompt:", prompt);
  
  try {
    const completion = await openAIClient.beta.chat.completions.parse({
      messages: [
        { role: "system", content: "You are a fitness trainer supplying a stretch routine based on a prompt." },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(StretchingRoutine, "stretch_routine"),
      model: "gpt-4o-mini",
      max_tokens: 2000,
    });
    const stretch_routine = completion.choices[0].message.parsed;
    console.log("Stretch Routine:", stretch_routine);
    if (!stretch_routine) {
      throw new Error("Failed to generate workout routine");
    }
    return stretch_routine;
  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw error;
  }
};
