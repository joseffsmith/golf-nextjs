import { NextApiRequest, NextApiResponse } from 'next'
import { buildAuthorisedHandler } from 'utils/api'
import { getComps } from 'utils/master-scoreboard/comps'
import prisma from 'lib/prisma'

const authorisedHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const comps = await getComps()

  await prisma.comp.createMany({
    data: comps,
    skipDuplicates: true,
  })

  res.status(200).json(comps)
}

const handler = (req, res) => buildAuthorisedHandler(req, res, "POST", authorisedHandler)

export default handler
