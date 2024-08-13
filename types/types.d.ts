import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null | undefined;
            email?: string | null | undefined;
            image?: string | null | undefined;
            youtubeAccount?: {
                youtubeId: string;
                etag: string;
                title?: string;
                description?: string;
                customUrl?: string;
                image?: string;
            };
        } & DefaultSession["user"];
        accessToken?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        user?: {
            id: string;
            name?: string | null | undefined;
            email?: string | null | undefined;
            image?: string | null | undefined;
            youtubeAccount?: {
                youtubeId: string;
                etag: string;
                title?: string;
                description?: string;
                customUrl?: string;
                image?: string;
            };
        };
    }
}
