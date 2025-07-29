"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/contexts/ThemeContext"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { AlertCircle, Loader2 } from "lucide-react"
import api from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await api.delete("/users/delete-account")
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      })
      logout() // Log out the user after deletion
      navigate("/")
    } catch (error) {
      console.error("Failed to delete account:", error.response?.data || error.message)
      toast({
        title: "Deletion Failed",
        description: error.response?.data?.message || "An error occurred while deleting your account.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteAccountDialogOpen(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto py-8 space-y-8"
    >
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch id="dark-mode" checked={theme === "dark"} onCheckedChange={handleThemeToggle} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <Label htmlFor="change-password">Change Password</Label>
              <Button asChild variant="outline">
                <Link to="/change-password">Change</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">Account Actions</CardTitle>
            <CardDescription className="text-gray-600">
              Manage your application preferences and account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-t border-gray-200 pt-6 mt-6">
              <Button
                variant="destructive"
                className="w-full py-3 text-lg rounded-lg"
                onClick={() => setDeleteAccountDialogOpen(true)}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" /> Confirm Account Deletion
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700">
            Are you absolutely sure you want to delete your account? This action is irreversible and all your data,
            including interview reports, will be permanently lost.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deleteLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteLoading}>
              {deleteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {deleteLoading ? "Deleting..." : "Delete My Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
