import { NextApiHandler } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import { JWT } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline", // Ensures we get a refresh token
          scope:
            "openid profile email https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube.readonly",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user || !account?.access_token) return false;

      if (account.provider === "google") {
        try {
          const youtubeData = await axios.get(
            "https://www.googleapis.com/youtube/v3/channels",
            {
              params: {
                part: "snippet,contentDetails,statistics",
                mine: "true",
              },
              headers: {
                Authorization: `Bearer ${account.access_token}`,
              },
            }
          );

          if (
            youtubeData.data &&
            youtubeData.data.items &&
            youtubeData.data.items.length > 0
          ) {
            const youtube = youtubeData.data.items[0];
            await prisma.user.upsert({
              where: { email: user.email as string },
              update: {
                image: user.image,
                name: user.name || "a unique person from youtube",
                accounts: {
                  upsert: {
                    where: {
                      provider_providerAccountId: {
                        provider: account.provider,
                        providerAccountId: account.providerAccountId,
                      },
                    },
                    create: {
                      provider: account.provider,
                      providerAccountId: account.providerAccountId,
                      type: account.type,
                      refresh_token: account.refresh_token,
                      access_token: account.access_token,
                      expires_at: account.expires_at,
                      token_type: account.token_type,
                      scope: account.scope,
                      id_token: account.id_token,
                      session_state: account.session_state,
                      youtubeId: youtube.id,
                      youtubeEtag: youtube.etag,
                      youtubeTitle: youtube.snippet.title,
                      youtubeDescription: youtube.snippet.description,
                      youtubeCustomUrl: youtube.snippet.customUrl || undefined,
                      youtubeImage:
                        youtube.snippet.thumbnails?.default?.url || undefined,
                    },
                    update: {
                      refresh_token: account.refresh_token,
                      access_token: account.access_token,
                      expires_at: account.expires_at,
                      token_type: account.token_type,
                      scope: account.scope,
                      id_token: account.id_token,
                      session_state: account.session_state,
                      youtubeEtag: youtube.etag,
                      youtubeTitle: youtube.snippet.title,
                      youtubeDescription: youtube.snippet.description,
                      youtubeCustomUrl: youtube.snippet.customUrl || undefined,
                      youtubeImage:
                        youtube.snippet.thumbnails?.default?.url || undefined,
                    },
                  },
                },
              },
              create: {
                email: user.email as string,
                name: user.name!,
                image: user.image,
                accounts: {
                  create: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    type: account.type,
                    refresh_token: account.refresh_token,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                    session_state: account.session_state,
                    youtubeId: youtube.id,
                    youtubeEtag: youtube.etag,
                    youtubeTitle: youtube.snippet.title,
                    youtubeDescription: youtube.snippet.description,
                    youtubeCustomUrl: youtube.snippet.customUrl || undefined,
                    youtubeImage:
                      youtube.snippet.thumbnails?.default?.url || undefined,
                  },
                },
              },
            });
          }
        } catch (error: any) {
          console.error(
            "Failed to fetch YouTube data:",
            error.response?.data || error.message
          );
        }
      }

      return true;
    },
    async jwt({ token, account, user }) {
      // Initial sign-in
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires =
          Date.now() + ((account.expires_in as number) || 0) * 1000;
      }

      // Add user details to the token
      if (user) {
        token.user = user;
      }

      // If the access token has not expired, return it
      if (Date.now() < (token.accessTokenExpires || 0)) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // Attach the access token and user to the session
      session.accessToken = token.accessToken;
      session.user = token.user;
      return session;
    },
  },
};

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: token.refreshToken,
      grant_type: "refresh_token",
    });

    return {
      ...token,
      accessToken: response.data.access_token,
      accessTokenExpires: Date.now() + response.data.expires_in * 1000,
    };
  } catch (error: any) {
    console.error(
      "Failed to refresh access token:",
      error.response?.data || error.message
    );
    return { ...token, error: "RefreshAccessTokenError" };
  }
};

const authHandler: NextApiHandler = (req, res) =>
  NextAuth(req, res, authOptions);

export default authHandler;

// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { NextApiHandler } from "next";
// import NextAuth, { NextAuthOptions } from "next-auth";
// import prisma from "./prisma";
// import GoogleProvider from "next-auth/providers/google";

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           scope:
//             "openid  profile email https://www.googleapis.com/auth/youtube.upload  https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly",
//         },
//       },
//     }),
//   ],
//   callbacks: {
//     session: async ({ session, user }) => {
//       console.log("session", user);
//       if (session?.user) {
//         session.user.id = user.id;
//       }
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET || "secret",
// };

// export default authOptions;
