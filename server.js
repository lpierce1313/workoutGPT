/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = 3000;

// Set up OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set your API key in the environment
});
const openai = new OpenAIApi(configuration);

app.use(express.json());

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    res.json({
      response: completion.data.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});