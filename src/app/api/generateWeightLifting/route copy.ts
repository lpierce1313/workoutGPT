import { NextResponse } from 'next/server';
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import openAIClient from '@/lib/AIClient';

export interface WorkoutRequest {
  muscleGroups: string[];
  intensity: number;
  bodyweight: boolean;
  duration: number;
  additionalInfo?: string;
  rest?: boolean;
  workoutStyle?: string;
  injuries?: string;
}

export interface WorkoutResponse {
  circuit: {
    exercise: string;
    reps: number;
  }[];
  restAmount?: number;
}

export interface SwimRequest {
  swimStrokes: string[];
  swimStyles: string[];
  intensity: number;
  duration: number;
  additionalInfo?: string;
  injuries?: string;
}

export interface SwimResponse {
  swimRoutine: {
    swimOption: string;
    length: number;
    restInterval: number;
  }[];
}

export async function POST(req: Request) {
  const workoutRequest: WorkoutRequest = await req.json();
  try {
    const workoutPlan = await generateWorkoutPlan(workoutRequest);
    return NextResponse.json(workoutPlan);
  } catch (error) {
    console.error("Error generating workout plan:", error);
}
}

const generateWorkoutPlan = async (
  workoutRequest: WorkoutRequest
): Promise<WorkoutResponse> => {
  const {
    muscleGroups,
    intensity,
    duration,
    rest,
    additionalInfo,
    bodyweight,
    workoutStyle,
    injuries,
  } = workoutRequest;

  const prompt = `Generate a ${workoutStyle} style of workout plan for the following parameters:
    List of muscle groups to target: ${muscleGroups.length > 0 ? muscleGroups.join(", ") : 'none so focus on full body'}
    Intensity level of the workout: ${intensity}
    Whether the workout is bodyweight only: ${bodyweight ? "Yes" : "No"}
    Duration of the workout in minutes: ${duration} minutes
    Rest time between sets in seconds: ${rest ? rest + 'in seconds between in 15 sec increments and base on intensity level' : 'none it is a circuit'}
    Additional information for the workout plan: ${additionalInfo ? additionalInfo : 'none'}
    Any injuries to consider: ${injuries ? injuries : 'none'}
    maximum of 8 exercises per circuit but can be less
  }`;

  const WorkoutRoutine = z.object({
    circuit: z.array(
      z.object({
        exercise: z.string(),
        reps: z.number(),
      })
    ),
    restAmount: z.number().optional(),
  });

  try {
    const completion = await openAIClient.beta.chat.completions.parse({
      messages: [
        { role: "system", content: "You are a fitness trainer supplying a workout based on a prompt." },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(WorkoutRoutine, "workout_routine"),
      model: "gpt-4o-mini",
      max_tokens: 500,
    });
    const workout_routine = completion.choices[0].message.parsed;
    console.log("Workout Routine:", workout_routine);
    if (!workout_routine) {
      throw new Error("Failed to generate workout routine");
    }
    return workout_routine;
  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw error;
  }
};
