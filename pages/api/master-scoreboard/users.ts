import { NextApiRequest, NextApiResponse } from 'next'
import { buildAuthorisedHandler } from 'utils/api'
import { getAllUsers } from 'utils/master-scoreboard/users'
import prisma from 'lib/prisma'

const authorisedHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const users = await getAllUsers()

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  })

  res.status(200).json(users)
}

const handler = (req, res) => buildAuthorisedHandler(req, res, "POST", authorisedHandler)

export default handler
