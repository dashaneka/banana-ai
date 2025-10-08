// This is a Vercel Serverless Function
// It acts as a secure proxy to the Google Gemini API

export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the API key from Vercel's environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }

    // Use a model that supports images and text, like gemini-1.5-flash
    const model = 'gemini-1.5-flash-latest';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Get the payload (chat history) from the client request
    const payload = request.body;

    // Call the actual Gemini API
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // If the call to Gemini fails, forward the error
    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json();
      console.error('Gemini API Error:', errorBody);
      return response.status(geminiResponse.status).json({ message: 'Error from Gemini API', details: errorBody });
    }

    // Get the data from the Gemini API response
    const data = await geminiResponse.json();

    // Send the successful response back to the client
    return response.status(200).json(data);

  } catch (error) {
    // Handle any other errors, like network issues or missing API key
    console.error('Internal Server Error:', error);
    return response.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
}
