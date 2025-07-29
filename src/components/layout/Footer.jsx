"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Twitter, Linkedin, Github } from "lucide-react"

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="bg-gray-100 py-8 px-4 md:px-8 lg:px-10 text-gray-700 border-t border-gray-200"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IM</span>
            </div>
            <span className="text-xl font-bold text-gray-900">InterviewMate</span>
          </Link>
          <p className="text-sm">
            Your AI-powered partner for mastering interviews. Practice, get feedback, and land your dream job.
          </p>
          <div className="flex space-x-4">
            {import.meta.env.VITE_TWITTER_URL && (
              <a
                href={import.meta.env.VITE_TWITTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-500"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {import.meta.env.VITE_LINKEDIN_URL && (
              <a
                href={import.meta.env.VITE_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-700"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {import.meta.env.VITE_GITHUB_URL && (
              <a
                href={import.meta.env.VITE_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <Github className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 mb-2">Quick Links</h3>
          <ul className="space-y-1">
            <li>
              <Link to="/dashboard" className="hover:underline text-sm">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/interview/setup" className="hover:underline text-sm">
                Start Interview
              </Link>
            </li>
            <li>
              <Link to="/reports" className="hover:underline text-sm">
                Reports
              </Link>
            </li>
            <li>
              <Link to="/analytics" className="hover:underline text-sm">
                Analytics
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:underline text-sm">
                Profile
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 mb-2">Legal</h3>
          <ul className="space-y-1">
            <li>
              <Link to="/terms" className="hover:underline text-sm">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:underline text-sm">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
          <ul className="space-y-1 text-sm">
            <li>
              Email:{" "}
              <a href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL}`} className="hover:underline">
                {import.meta.env.VITE_SUPPORT_EMAIL}
              </a>
            </li>
            <li>
              Support:{" "}
              <a href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL}`} className="hover:underline">
                {import.meta.env.VITE_CONTACT_EMAIL}
              </a>
            </li>
            <li>Address: 123 Interview St, Prep City, World</li>
          </ul>
        </div>
      </div>
      <footer className="border-t bg-card p-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} InterviewMate. All rights reserved.</p>
        <nav className="mt-2 flex justify-center space-x-4">
          <Link to="/privacy" className="hover:text-primary">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-primary">
            Terms of Service
          </Link>
          <Link to="/contact" className="hover:text-primary">
            Contact Us
          </Link>
        </nav>
      </footer>
    </motion.footer>
  )
}
