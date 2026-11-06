export const dummyMessages = [
  {
    id: "1",
    role: "user",
    content: "How do I build authentication in Next.js?",
    createdAt: "10:30 AM",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "You can build authentication in Next.js using NextAuth, Clerk, or a custom solution with JWT and cookies.",
    createdAt: "10:30 AM",
  },
  {
    id: "3",
    role: "user",
    content: "Which option would you recommend for a SaaS application?",
    createdAt: "10:31 AM",
  },
  {
    id: "4",
    role: "assistant",
    content:
      "For a SaaS app, Clerk is a great choice because it provides prebuilt UI, organizations, and billing-friendly user management out of the box.",
    createdAt: "10:31 AM",
  },
  {
    id: "5",
    role: "user",
    content: "What if I want more control over the auth flow?",
    createdAt: "10:32 AM",
  },
  {
    id: "6",
    role: "assistant",
    content:
      "NextAuth (Auth.js) gives you more control. You can customize providers, callbacks, and session handling while still avoiding a fully custom build.",
    createdAt: "10:32 AM",
  },
  {
    id: "7",
    role: "user",
    content: "How do I protect routes in the App Router?",
    createdAt: "10:33 AM",
  },
  {
    id: "8",
    role: "assistant",
    content:
      "Use middleware to check the session before a request reaches protected routes, and redirect unauthenticated users to your sign-in page.",
    image: "/image.jpg",
    createdAt: "10:33 AM",
  },
  {
    id: "9",
    role: "user",
    content: "Should I store the session in a JWT or in the database?",
    createdAt: "10:34 AM",
  },
  {
    id: "10",
    role: "assistant",
    content:
      "JWT sessions are stateless and fast, while database sessions make it easier to revoke access. Many SaaS apps choose database sessions for better security control.",
    createdAt: "10:34 AM",
  },
  {
    id: "11",
    role: "user",
    content: "Can I add Google and GitHub login too?",
    createdAt: "10:35 AM",
  },
  {
    id: "12",
    role: "assistant",
    content:
      "Yes. Both NextAuth and Clerk support OAuth providers like Google and GitHub. You just add your client ID and secret and enable the provider.",
    createdAt: "10:35 AM",
  },
  {
    id: "13",
    role: "user",
    content: "Thanks, that really helps!",
    createdAt: "10:36 AM",
  },
];
