import { NextResponse } from 'next/server';
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import openAIClient from '@/lib/AIClient';

export interface SwimRequest {
  swimStrokes: string[];
  swimStyles: string[];
  intensity: number;
  duration: number;
  additionalInfo?: string;
  injuries?: string;
}

export interface SwimSegment {
  swimOption: string;
  sets: number;
  description: string;
  length: number;
  restDuration: number;
}

export interface SwimResponse {
  warmup: SwimSegment[];
  main: SwimSegment[];
  cooldown: SwimSegment[];
  totalDistance: number;
  workoutDescription: string;
  estimatedTimeMinutes: number;
}

export async function POST(req: Request) {
  const swimRequest: SwimRequest = await req.json();
  try {
    const workoutPlan = await generateSwimWorkout(swimRequest);
    return NextResponse.json(workoutPlan);
  } catch (error) {
    console.error("Error generating workout plan:", error);
}
}

const generateSwimWorkout = async (
  swimRequest: SwimRequest
): Promise<SwimResponse> => {
  const {
    swimStrokes,
    swimStyles,
    intensity,
    duration,
    additionalInfo,
    injuries,
  } = swimRequest;

  const prompt = `Generate a swim workout plan with the following parameters:
    Swim strokes: ${swimStrokes.length > 0 ? swimStrokes.join(", ") : 'any'}
    Swim styles: ${swimStyles.length > 0 ? swimStyles.join(", ") : 'any'}
    Intensity: ${intensity}
    Duration: ${duration} minutes
    Additional info: ${additionalInfo ? additionalInfo : 'none'}
    Injuries: ${injuries ? injuries : 'none'}
    Rest in 30-second increments.
    Length in meters, increments of 25 or 100.

    Example for easy swim but do not use as final:

    6×50 swim to warm-up 20-30 seconds rest between sets.
    100 kick with a board
    6×25 swim freestyle. Take 20-30 seconds rest between repetitions.
    100 pull with a buoy
    6×25 swim – alternate 25 fast and 25 smooth. 20-30 seconds rest between sets.
    100 double arm backstroke easy to warm-down`;

  const SwimSegment = z.object({
    swimOption: z.string(),
    description: z.string(),
    length: z.number(), // Length of the swim in meters
    sets: z.number(), // Number of sets
    restDuration: z.number(), // Rest duration in seconds
  });
  
  const SwimRoutine = z.object({
    warmup: z.array(SwimSegment),
    main: z.array(SwimSegment),
    cooldown: z.array(SwimSegment),
    workoutDescription: z.string(),
    totalDistance: z.number(),
    estimatedTimeMinutes: z.number(),
  });

  try {
    const completion = await openAIClient.beta.chat.completions.parse({
      messages: [
        { role: "system", content: "You are a swim coach supplying a swim routine based on a prompt." },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(SwimRoutine, "swim_routine"),
      model: "gpt-4o-mini",
      max_tokens: 500,
    });
    const swim_routine = completion.choices[0].message.parsed;
    console.log("Swim Routine:", swim_routine);
    if (!swim_routine) {
      throw new Error("Failed to generate workout routine");
    }
    return swim_routine;
  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw error;
  }
};
