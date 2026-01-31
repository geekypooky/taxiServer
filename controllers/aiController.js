const OpenAI = require("openai");
const { AppError } = require("../middleware/errorHandler");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return next(new AppError("Please provide a message", 400));
    }

    const systemPrompt = `You are a helpful and friendly AI assistant for "City Taxi", a premium taxi booking platform.
    
    Your goal is to assist users with using the website.
    
    Website Features you should know about:
    1. **Booking a Taxi**: Users can search for taxis by entering pickup/drop location and date. usage: Go to 'Search Taxis' page.
    2. **Manage Bookings**: Users can view their upcoming and past rides in 'My Bookings'.
    3. **Admin Panel**: There is a separate admin login for managing taxis and routes.
    4. **Taxis**: We offer various types: Mini, Sedan, SUV, Luxury, Premium.
    
    Guidelines:
    - Be concise and polite.
    - If asked about features not related to the website, politely explain you are a taxi booking assistant.
    - Do not make up fake booking data.
    - If a user asks technical questions, you can briefly answer but bring it back to the context of the site if possible.
    `;

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-v3.2-speciale",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 1000,
    });

    const reply = completion.choices[0].message.content;

    res.status(200).json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (error) {
    console.error("AI Error:", error);
    next(new AppError("Failed to get AI response", 500));
  }
};
