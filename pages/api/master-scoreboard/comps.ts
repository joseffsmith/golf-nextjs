import { NextApiRequest, NextApiResponse } from 'next'
import { buildAuthorisedHandler } from 'utils/api'
import { saveComps } from 'utils/master-scoreboard/comps'

const authorisedHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const comps = await saveComps()

  res.status(200).json(comps)
}

const handler = (req, res) => buildAuthorisedHandler(req, res, "POST", authorisedHandler)

export default handler
