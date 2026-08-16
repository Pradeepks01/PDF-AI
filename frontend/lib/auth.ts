import { getServerSession, NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateUser } from "./user-store";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/sign-in'
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                name: { label: "Name", type: "text" },
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                isRegistering: { label: "isRegistering", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Please enter both email and password.");
                }

                const isRegistering = (credentials as any).isRegistering === "true";
                const user = authenticateUser(
                    credentials.email,
                    credentials.password,
                    isRegistering,
                    (credentials as any).name
                );

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`
                };
            }
        })
    ],
    callbacks: {
        async session({ token, session }: any) {
            if (token && session?.user) {
                session.user.id = token.id || token.sub;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
                session.user.username = token.name || token.email?.split('@')[0];
                session.user.role = token.role || "user";
                session.user.whatsappNumber = token.whatsappNumber || null;
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.picture = user.image;
            }
            return token;
        },
        redirect({ url, baseUrl }: any) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return `${baseUrl}/dashboard/account`;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "default_secret_key_1234567890"
};

export const getAuthSession = async () => getServerSession(authOptions);

export const getCurrentUser = async () => {
  const session = await getAuthSession();
  if (!session?.user) return null;

  return {
    id: (session.user as any).id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as any).role || "user",
    whatsappNumber: (session.user as any).whatsappNumber || null
  };
};

export const requireRole = (user: any, requiredRole: string) => {
  if (!user) {
    throw new Error('Authentication required');
  }
  if (user.role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
};
