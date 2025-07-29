"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import api from "@/services/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Search, Filter, PlusCircle, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/dialog"

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("All")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState(null)
  const [form, setForm] = useState({
    name: "",
    type: "HR",
    jobRole: "",
    difficulty: "Medium",
    topics: "",
    instructions: "",
  })
  const [formLoading, setFormLoading] = useState(false)
  const { toast } = useToast()

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await api.get("/admin/templates")
      setTemplates(res.data.templates)
    } catch (error) {
      console.error("Failed to fetch templates:", error)
      toast({
        title: "Error",
        description: "Failed to load templates.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const resetForm = () => {
    setForm({
      name: "",
      type: "HR",
      jobRole: "",
      difficulty: "Medium",
      topics: "",
      instructions: "",
    })
    setCurrentTemplate(null)
    setIsEditMode(false)
    setIsDialogOpen(false)
  }

  const handleCreateClick = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEditClick = (template) => {
    setCurrentTemplate(template)
    setForm({
      name: template.name,
      type: template.type,
      jobRole: template.jobRole,
      difficulty: template.difficulty,
      topics: template.topics.join(", "),
      instructions: template.instructions,
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const handleFormChange = (e) => {
    const { id, value } = e.target
    setForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id, value) => {
    setForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const payload = {
        ...form,
        topics: form.topics
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }

      if (isEditMode) {
        const res = await api.put(`/admin/templates/${currentTemplate._id}`, payload)
        setTemplates(templates.map((t) => (t._id === currentTemplate._id ? res.data.template : t)))
        toast({
          title: "Template Updated",
          description: "Interview template has been successfully updated.",
        })
      } else {
        const res = await api.post("/admin/templates", payload)
        setTemplates([...templates, res.data.template])
        toast({
          title: "Template Created",
          description: "New interview template has been successfully created.",
        })
      }
      resetForm()
    } catch (error) {
      console.error("Failed to save template:", error.response?.data || error.message)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    try {
      await api.delete(`/admin/templates/${templateId}`)
      toast({
        title: "Template Deleted",
        description: "The interview template has been successfully deleted.",
      })
      setTemplates(templates.filter((template) => template._id !== templateId))
    } catch (error) {
      console.error("Failed to delete template:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete template. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.jobRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.topics.some((topic) => topic.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter = filterType === "All" || template.type === filterType

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Interview Templates</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filter & Search Templates</CardTitle>
          <Button onClick={handleCreateClick}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, role, or topics..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="HR">HR Interview</SelectItem>
              <SelectItem value="Technical">Technical Interview</SelectItem>
              <SelectItem value="Custom">Custom Interview</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Topics</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template._id}>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{template.type}</TableCell>
                      <TableCell>{template.jobRole}</TableCell>
                      <TableCell>{template.difficulty}</TableCell>
                      <TableCell>{template.topics.join(", ")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(template)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this interview template.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTemplate(template._id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No templates found. Click "Create New" to add one.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Template" : "Create New Template"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Make changes to the template here." : "Define a new interview template."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={form.name} onChange={handleFormChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={form.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger id="type" className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jobRole" className="text-right">
                Job Role
              </Label>
              <Input id="jobRole" value={form.jobRole} onChange={handleFormChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="difficulty" className="text-right">
                Difficulty
              </Label>
              <Select value={form.difficulty} onValueChange={(value) => handleSelectChange("difficulty", value)}>
                <SelectTrigger id="difficulty" className="col-span-3">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="topics" className="text-right">
                Topics
              </Label>
              <Input
                id="topics"
                value={form.topics}
                onChange={handleFormChange}
                placeholder="e.g., React, Node.js, Leadership (comma-separated)"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructions" className="text-right">
                Instructions
              </Label>
              <Textarea
                id="instructions"
                value={form.instructions}
                onChange={handleFormChange}
                placeholder="Specific instructions for the AI interviewer."
                className="col-span-3"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? <LoadingSpinner className="mr-2" /> : null}
                {isEditMode ? "Save changes" : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
