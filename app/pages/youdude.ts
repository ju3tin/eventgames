import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // ── Query parameters (always available)
  const { userId, sort = 'desc' } = req.query;   // ?userId=123&sort=asc

  // ── Body (usually exists on POST/PUT/PATCH)
  // Next.js automatically parses JSON, form-data, etc. when Content-Type is correct
  const body = req.body;                         // whole body object
  const { name, email, amount } = req.body ?? {}; // safe destructuring

  if (req.method === 'GET') {
    // Example: reading from query
    res.status(200).json({
      message: 'GET request received',
      queryReceived: req.query,
      userId: userId || 'not provided',
      sortBy: sort,
    });
  }

  else if (req.method === 'POST') {
    // Example: reading from body (most common for POST)
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // You can now save to database, etc.
    res.status(201).json({
      message: 'User created!',
      receivedData: {
        name,
        email,
        amount: amount || 0,
        fromQuery: userId,
      },
    });
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}