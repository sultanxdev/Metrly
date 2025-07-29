import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as GitHubStrategy } from "passport-github2"
import User from "../models/User.js"
import dotenv from "dotenv"

dotenv.config({ path: "./.env" })

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ oauthId: profile.id, oauthProvider: "google" })

        if (user) {
          // User already exists, update tokens if necessary or just return
          done(null, user)
        } else {
          // Check if user exists with this email but without OAuth
          user = await User.findOne({ email: profile.emails[0].value })
          if (user) {
            // Link existing account
            user.oauthId = profile.id
            user.oauthProvider = "google"
            user.isEmailVerified = true // Assume email from Google is verified
            await user.save()
            done(null, user)
          } else {
            // Create new user
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              oauthId: profile.id,
              oauthProvider: "google",
              isEmailVerified: true,
              // A dummy password is required by schema, but won't be used for OAuth login
              password: Math.random().toString(36).slice(-8),
            })
            done(null, user)
          }
        }
      } catch (err) {
        done(err, null)
      }
    },
  ),
)

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ oauthId: profile.id, oauthProvider: "github" })

        if (user) {
          done(null, user)
        } else {
          // GitHub's profile.emails might be empty if user keeps it private.
          // Need to fetch public emails if available or prompt user for email.
          // For simplicity, we'll assume email is available or create without it initially.
          const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null

          if (email) {
            user = await User.findOne({ email: email })
            if (user) {
              user.oauthId = profile.id
              user.oauthProvider = "github"
              user.isEmailVerified = true
              await user.save()
              done(null, user)
            }
          }

          // Create new user
          user = await User.create({
            name: profile.displayName || profile.username,
            email: email, // Can be null if not provided by GitHub
            oauthId: profile.id,
            oauthProvider: "github",
            isEmailVerified: !!email, // Verified if email is present
            password: Math.random().toString(36).slice(-8),
          })
          done(null, user)
        }
      } catch (err) {
        done(err, null)
      }
    },
  ),
)
