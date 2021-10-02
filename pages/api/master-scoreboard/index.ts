import { NextApiRequest, NextApiResponse } from 'next'
import { buildAuthorisedHandler } from 'utils/api'
import { fetchAllUsers } from 'utils/master-scoreboard/users'
import prisma from 'lib/prisma'

const authorisedHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const events = await fetchAllUsers()

  await prisma.event.createMany({
    data: events,
    skipDuplicates: true,
  })

  res.status(200).json(events)
}

const handler = (req, res) => buildAuthorisedHandler(req, res, "POST", authorisedHandler)

export default handler
