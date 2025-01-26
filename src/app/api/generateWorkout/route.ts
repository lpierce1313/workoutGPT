import OpenAI from "openai";
import { NextResponse } from 'next/server';

const openAIClient = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export interface WorkoutRequest {
  muscleGroups: string[];
  intensity: number;
  bodyweight: boolean;
  duration: number;
  additionalInfo?: string;
  rest?: number;
  workoutStyle?: string;
}

export interface WorkoutResponse {
  circuit: {
    exercise: string;
    reps: number;
    rest?: number;
  }[];
  duration: number;
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
    Intensity: ${intensity}
    Bodyweight Only: ${bodyweight ? "Yes" : "No"}
    Duration: ${duration} minutes
    rest: ${rest ? rest + 'in seconds' : 'none it is a circuit'}
    maximum of 8 exercises per circuit but can be less
    additional info provided: ${additionalInfo}

    The response should be a JSON object with the following structure:
    {
      "circuit": [
        {
          "exercise": "string",
          "reps": number,
          "rest"?: number
        }
      ]
  }`;

  try {
    const completion = await openAIClient.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      max_tokens: 500,
    });
    const content = completion.choices[0].message.content;
    if (content) {
      // Extract JSON part from the response
      const jsonMatch = content.match(/```json([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        const workoutPlan = JSON.parse(jsonMatch[1].trim());
        return workoutPlan;
      } else {
        throw new Error('No JSON content found in the response');
      }
    } else {
      throw new Error('No content returned from OpenAI');
    }
  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw error;
  }
};
