import { parseUserId } from '../../auth/utils.mjs'

export function getUserId(event) {
  const authorization = event.headers.Authorization || event.headers.authorization
  console.log('authorization: ', authorization)
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}
