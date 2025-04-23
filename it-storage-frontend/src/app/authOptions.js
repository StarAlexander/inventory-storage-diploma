
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          try {
            const response = await fetch(`http://backend:8000/token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                username: credentials?.username || '',
                password: credentials?.password || ''
              })
            })
  
            if (!response.ok) {
              const error = await response.text()
              throw new Error(error || 'Login failed')
            }
  
            const { access_token } = await response.json()
            
            const userResponse = await fetch(`http://backend:8000/me`, {
              headers: {
                'Authorization': `Bearer ${access_token}`
              }
            })
            
            if (!userResponse.ok) throw new Error('Failed to fetch user data')
            
            const user = await userResponse.json()
            console.log(user)
            return {
              ...user,
              accessToken: access_token
            }
          } catch (error) {
            console.error('Authorization error:', error)
            return null
          }
        }
      })
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.accessToken = user.accessToken
          token.user = user
        }
        return token
      },
      async session({ session, token }) {
        session.accessToken = token.accessToken
        session.user = token.user
        return session
      }
    },
    pages: {
      signIn: '/login'
    },
    session: {
      strategy: 'jwt'
    }
  }