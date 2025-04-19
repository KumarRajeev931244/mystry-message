'use client'
import { SessionProvider } from "next-auth/react"
import React from "react"
export default function AuthProvider({children}: {children: React.ReactNode}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}

/** when used use-client
 * - Require browser-specific APIs (e.g., window, document).
- Use state management hooks like useState, useEffect, or useContext.
- Need access to session or authentication data, often via libraries like NextAuth.js.
- Include interactive elements, such as form handling or dynamic UI updates.

 */