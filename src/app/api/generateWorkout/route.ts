import OpenAI from "openai";
import { NextResponse } from 'next/server';
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openAIClient = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export interface WorkoutRequest {
  muscleGroups: string[];
  intensity: number;
  bodyweight: boolean;
  duration: number;
  additionalInfo?: string;
  rest?: boolean;
  workoutStyle?: string;
}

export interface WorkoutResponse {
  circuit: {
    exercise: string;
    reps: number;
  }[];
  restAmount?: number;
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
  } = workoutRequest;

  const prompt = `Generate a ${workoutStyle} style workout plan in JSON format for the following parameters:
    Muscle Groups: ${muscleGroups.join(", ")}
    Intensity Level: ${intensity}
    Bodyweight Only: ${bodyweight ? "Yes" : "No"}
    Duration: ${duration} minutes
    rest: ${rest ? rest + 'in seconds between in 15 sec increments and base on intensity level' : 'none it is a circuit'}
    maximum of 8 exercises per circuit but can be less
    additional info: ${additionalInfo}
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
