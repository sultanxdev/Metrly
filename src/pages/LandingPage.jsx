import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Star, Users, Lightbulb, BarChart2, ShieldCheck, Mic, FileText } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">InterviewMate</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link to="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Login
          </Link>
          <Link to="/register" className="text-sm font-medium hover:underline underline-offset-4">
            Register
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex-1 flex items-center justify-center">
        <div className="container px-4 md:px-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Master Your Next Interview with AI
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              InterviewMate provides AI-powered mock interviews, real-time feedback, and detailed performance reports to
              help you ace your job interviews.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                <Link to="/register">Get Started Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/10 dark:border-primary/50 dark:text-primary-foreground bg-transparent"
              >
                <Link to="/login">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <Mic className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="mb-2">AI Mock Interviews</CardTitle>
              <CardContent className="text-muted-foreground p-0">
                Practice with an AI interviewer tailored to your desired role and industry.
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <BarChart2 className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="mb-2">Real-time Feedback</CardTitle>
              <CardContent className="text-muted-foreground p-0">
                Get instant insights on your communication, confidence, and content.
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <FileText className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="mb-2">Detailed Reports</CardTitle>
              <CardContent className="text-muted-foreground p-0">
                Receive comprehensive reports highlighting strengths and areas for improvement.
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <Lightbulb className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="mb-2">Customizable Interviews</CardTitle>
              <CardContent className="text-muted-foreground p-0">
                Choose from various roles, difficulties, and topics to simulate real scenarios.
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="mb-2">HR & Technical Focus</CardTitle>
              <CardContent className="text-muted-foreground p-0">
                Prepare for both behavioral and technical questions with specialized AI models.
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <ShieldCheck className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="mb-2">Secure & Private</CardTitle>
              <CardContent className="text-muted-foreground p-0">
                Your practice sessions and data are kept confidential and secure.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8">What Our Users Say</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-6 shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "InterviewMate transformed my interview preparation. The AI feedback was incredibly accurate and helped
                me identify my weak spots instantly."
              </p>
              <p className="font-semibold">- Jane Doe, Software Engineer</p>
            </Card>
            <Card className="p-6 shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "I landed my dream job thanks to InterviewMate! The realistic mock interviews gave me the confidence I
                needed."
              </p>
              <p className="font-semibold">- John Smith, Marketing Manager</p>
            </Card>
            <Card className="p-6 shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "The detailed reports are a game-changer. I could see my progress and focus on specific areas for
                improvement."
              </p>
              <p className="font-semibold">- Emily White, Data Scientist</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground text-center">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Ready to Ace Your Interview?
          </h2>
          <p className="max-w-[700px] mx-auto text-lg mb-8">
            Join thousands of successful job seekers who prepared with InterviewMate.
          </p>
          <Button asChild size="lg" variant="secondary" className="shadow-lg">
            <Link to="/register">Start Your Free Mock Interview</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 w-full shrink-0 border-t bg-background text-muted-foreground text-center text-sm">
        <div className="container px-4 md:px-6">
          <p>&copy; {new Date().getFullYear()} InterviewMate. All rights reserved.</p>
          <nav className="mt-2 flex justify-center space-x-4">
            <Link to="/privacy" className="hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:underline underline-offset-4">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:underline underline-offset-4">
              Contact Us
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
