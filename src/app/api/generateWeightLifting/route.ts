import { NextResponse } from 'next/server';
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import openAIClient from '@/lib/AIClient';

const Lift = z.object({
  liftName: z.string(),
  liftDescription: z.string(),
  numReps: z.number(),
  numSets: z.number(),
  restDuration: z.string(),
});

const LiftDay = z.object({
  dayName: z.string(),
  description: z.string(),
  lifts: z.array(Lift),
});

const StrengthRoutine = z.object({
  description: z.string(),
  totalEstimatedDurationMinutes: z.string(),
  liftDays: z.array(LiftDay),
});

export interface StrengthRequest {
  trainingStyle: string;
  daysPerWeek: number;
  duration: number;
  additionalInfo?: string;
  injuries?: string;
}

export type StrengthResponse = z.infer<typeof StrengthRoutine>;

export async function POST(req: Request) {
  const request: StrengthRequest = await req.json();
  try {
    console.log("Stretch Request:", request);
    const strengthPlan = await generateStrengthRoutine(request);
    return NextResponse.json(strengthPlan);
  } catch (error) {
    console.error("Error generating strength plan:", error);
}
}

const generateStrengthRoutine = async (
  request: StrengthRequest
): Promise<StrengthResponse> => {
  const {
    trainingStyle,
    daysPerWeek,
    duration,
    additionalInfo,
    injuries,
  } = request;

  const prompt = `Generate a strength training routine based on the following parameters:
  - Training Styles: ${trainingStyle}
  - Days Per Week: ${daysPerWeek} days
  - Include number of sets and reps for each exercise
  - Duration: ${duration} minutes
  - Should have label for each day. Day 1, 2, etc.
  - Additional Info: ${additionalInfo}
  - Do not exceed 100 characters for exercise description or 50 characters for exercise name
  - Injuries: ${injuries}`;
  
  try {
    const completion = await openAIClient.beta.chat.completions.parse({
      messages: [
        { role: "system", content: "You are a fitness coach supplying a workout routine based on a prompt." },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(StrengthRoutine, "strength_routine"),
      model: "gpt-4o-mini",
      max_tokens: 2000,
    });
    const strength_routine = completion.choices[0].message.parsed;
    if (!strength_routine) {
      throw new Error("Failed to generate workout routine");
    }
    return strength_routine;
  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw error;
  }
};
