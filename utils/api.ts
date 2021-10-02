import { NextApiRequest, NextApiResponse } from 'next'

export const verifyApiSecretKey = (request: NextApiRequest) =>
  request.headers.authorization === `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`

export const buildAuthorisedHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  allowedMethod: string,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  try {
    if (req.method === allowedMethod) {
      if (verifyApiSecretKey(req)) {
        await handler(req, res)
      } else {
        res.status(401).end("Unauthorised")
      }
    } else {
      res.setHeader("Allow", "POST")
      res.status(405).end("Method Not Allowed")
    }
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}
