import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"

dotenv.config({ path: "./.env" })

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Function to generate interview report using Gemini AI
export const generateReport = async (interviewData) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const prompt = `
    You are an expert AI interviewer and career coach. Based on the following mock interview data, generate a comprehensive interview report.
    The report should include:
    1. An overall score (out of 100).
    2. Key strengths observed.
    3. Areas for improvement.
    4. Detailed feedback for each question, including the question asked, the user's answer, your specific feedback on that answer, and a score (out of 100) for that particular answer.

    Interview Details:
    - Type: ${interviewData.interviewType}
    - Job Role: ${interviewData.jobRole}
    - Difficulty: ${interviewData.difficulty}
    - Topics: ${interviewData.topics.join(", ") || "N/A"}
    - Custom Instructions: ${interviewData.customInstructions || "None"}

    Conversation History (Interviewer: AI, Candidate: User):
    ${interviewData.conversationHistory.map((c) => `${c.role}: ${c.text}`).join("\n")}

    Please format the output as a JSON object with the following structure:
    {
      "overallScore": number,
      "strengths": string[],
      "areasForImprovement": string[],
      "detailedFeedback": [
        {
          "question": string,
          "userAnswer": string,
          "aiFeedback": string,
          "score": number
        }
      ]
    }
    Ensure all scores are integers between 0 and 100.
    `

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Attempt to parse the JSON string. Gemini might sometimes return extra text.
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    } else {
      console.error("Gemini response could not be parsed as JSON:", text)
      // Fallback to a default error report or re-prompt
      return {
        overallScore: 0,
        strengths: ["Could not generate detailed strengths."],
        areasForImprovement: ["Failed to parse AI response. Please try again."],
        detailedFeedback: [
          {
            question: "N/A",
            userAnswer: "N/A",
            aiFeedback: "Failed to generate feedback due to parsing error.",
            score: 0,
          },
        ],
      }
    }
  } catch (error) {
    console.error("Error generating report with Gemini AI:", error)
    throw new Error("Failed to generate report with AI. Please check API key and try again.")
  }
}
