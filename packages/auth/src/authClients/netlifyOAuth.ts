import fetch from 'node-fetch'
import queryString from 'query-string'

import type { AuthClient } from './'

export type NetlifyOAuth = any

// TODO: Map out this user properly?
export interface NetlifyUser {}

export const netlifyOAuth = (client: NetlifyOAuth): AuthClient => {
  const key = [
    '@@netlifyOAuth@@',
    process.env.NETLIFY_OAUTH_CLIENT_ID,
    client.redirectUrl,
    client.scope,
  ].join('::')

  const getAccessTokenFromStorage = () => {
    return JSON.parse(localStorage.getItem(key))?.body?.accessToken
  }

  return {
    type: 'netlifyOAuth',
    client,
    restoreAuthState: async () => {
      let accessToken
      const hash = window.location.hash
      window.location.hash = ''

      const parsedHash = queryString.parse(hash)

      if (parsedHash && parsedHash.token_type === 'Bearer') {
        if (parsedHash.state && parsedHash.state !== client.state) {
          throw new Error('Possible CSRF')
        }

        accessToken = parsedHash.access_token

        if (accessToken === undefined) {
          throw new Error('Unable to fetch accessToken')
        }

        const body = { accessToken: accessToken }

        localStorage.setItem(key, JSON.stringify({ body: body }))
      }
    },
    login: async () => {
      const authorizationUrl =
        'https://app.netlify.com/authorize?' +
        'client_id=' +
        process.env.NETLIFY_OAUTH_CLIENT_ID +
        '&response_type=token' +
        '&redirect_uri=' +
        client.redirectUrl +
        '&state=' +
        client.state

      window.location.assign(authorizationUrl)
    },
    logout: () => localStorage.clear(),
    getToken: async () => {
      return getAccessTokenFromStorage()
    },
    getUserMetadata: async () => {
      const accessToken = getAccessTokenFromStorage()

      // TODO - Do not hit Netlify API all the time
      const url = `https://api.netlify.com/api/v1/user`

      if (accessToken) {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        })

        const user = await response.json()

        if (response.status === 422) {
          throw new Error(`Error ${JSON.stringify(user || null)}`)
        }

        return user || null
      }
      return null
    },
  }
}
