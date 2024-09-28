const express = require('express');
const fetch = require('node-fetch');

const streaming = express();

const key = ''; // Your GPT Key

streaming.post('/sse-values', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');

  res.setHeader('Content-Type', 'text/event-stream');

  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders();

  try {
    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: req.body.text,
          },
        ],
        stream: true,
      }),
    });

    response.body.on('data', chunk => {
      const dataString = chunk.toString();
      const dataLines = dataString
        .split('\n')
        .filter(line => line.trim() !== '');

      dataLines.forEach(line => {
        if (line.startsWith('data:')) {
          const data = line.substring(5).trim();
          if (data !== '[DONE]') {
            res.write(`data: ${data}\n\n`);
          } else {
            res.write(`data: [DONE]\n\n`);
            res.end();
          }
        }
      });
    });

    response.body.on('end', () => {
      res.end();
    });
  } catch (error) {
    console.error('Error streaming OpenAI response:', error);
    res.write(`data: ${JSON.stringify({error: 'Streaming failed.'})}\n\n`);
    res.end();
  }
});

module.exports = {
  streaming,
};
