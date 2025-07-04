"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Download, Edit, Trash2, Calendar, FileText, Palette, Shield, CreditCard, Map, Database, Globe, Key, Eye, EyeOff } from 'lucide-react'
import { toast } from "sonner"; // Import toast

interface Project {
  id: string
  title: string
  description: string
  status: string
  lastUpdated: string
  formData: any
  awsCredentials?: {
    accessKeyId: string
    secretAccessKey: string
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAwsDialog, setShowAwsDialog] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [awsCredentials, setAwsCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: ''
  })
  const [isGenerating, setIsGenerating] = useState(false); // New state for generation loading

  useEffect(() => {
    const projectId = params.id as string
    const storedProjects = localStorage.getItem('projects')
    
    if (storedProjects) {
      const projects = JSON.parse(storedProjects)
      const foundProject = projects.find((p: Project) => p.id === projectId)
      
      if (foundProject) {
        setProject(foundProject)
        if (foundProject.awsCredentials) {
          setAwsCredentials(foundProject.awsCredentials)
        }
      }
    }
    setLoading(false)
  }, [params.id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadProjectJSON = () => {
    if (!project) return
    
    const blob = new Blob([JSON.stringify(project.formData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleGenerateFolders = async () => {
    if (!project) {
      toast.error("No project data available to generate folders.");
      return;
    }
    setIsGenerating(true);
    toast.info("Generating folders... This may take a moment.");

    try {
      const response = await fetch('/api/generate-folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          projectData: project.formData, // Send the entire formData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || "Folders generation workflow started successfully!");
        // TODO: Implement logic to poll for or directly trigger download of generated folders
        // For now, simply notify the user.
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to start folder generation.");
      }
    } catch (error) {
      console.error("Error initiating folder generation:", error);
      toast.error(`Error: ${(error as Error).message || 'Unknown error during folder generation.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadFolder = async () => {
    if (!project) {
      toast.error("No project data available to download.");
      return;
    }

    toast.info("Preparing download link...");

    try {
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.signedUrl) {
          window.open(result.signedUrl, '_blank');
          toast.success("Download started!");
        } else {
          toast.error("Signed URL not received.");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to get download link.");
      }
    } catch (error) {
      console.error("Error initiating download:", error);
      toast.error(`Error: ${(error as Error).message || 'Unknown error during download.'}`);
    }
  };

  const handleDownloadComps = async () => {
    toast.info("Preparing component download...");

    try {
      const response = await fetch('/api/download-components', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.downloadUrl) {
          window.open(result.downloadUrl, '_blank');
          toast.success(`Component download started! (${result.filename})`);
        } else {
          toast.error("Download URL not received.");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to get component download link.");
      }
    } catch (error) {
      console.error("Error initiating component download:", error);
      toast.error(`Error: ${(error as Error).message || 'Unknown error during component download.'}`);
    }
  };

  const deleteProject = () => {
    if (!project) return
    
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      const storedProjects = localStorage.getItem('projects')
      if (storedProjects) {
        const projects = JSON.parse(storedProjects)
        const updatedProjects = projects.filter((p: Project) => p.id !== project.id)
        localStorage.setItem('projects', JSON.stringify(updatedProjects))
        router.push('/projects')
      }
    }
  }

  const saveAwsCredentials = () => {
    if (!project) return

    const updatedProject = {
      ...project,
      awsCredentials: awsCredentials
    }

    // Update project in localStorage
    const storedProjects = localStorage.getItem('projects')
    if (storedProjects) {
      const projects = JSON.parse(storedProjects)
      const updatedProjects = projects.map((p: Project) => 
        p.id === project.id ? updatedProject : p
      )
      localStorage.setItem('projects', JSON.stringify(updatedProjects))
      setProject(updatedProject)
    }

    setShowAwsDialog(false)
  }

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading project...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="relative min-h-screen">
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-gray-400 mb-6">The project you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/projects')}>
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { formData } = project

  return (
    <div className="relative min-h-screen">

      {/* Header */}
      <div className="px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/projects')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </div>

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <p className="text-gray-400 text-lg mb-4">{project.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created {formatDate(project.lastUpdated)}
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {project.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={showAwsDialog} onOpenChange={setShowAwsDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {project.awsCredentials ? 'Update AWS Credentials' : 'Add AWS Credentials'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>AWS Credentials</DialogTitle>
                    <DialogDescription>
                      Enter your AWS access key ID and secret access key for this project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="accessKeyId">Access Key ID</Label>
                      <Input
                        id="accessKeyId"
                        value={awsCredentials.accessKeyId}
                        onChange={(e) => setAwsCredentials(prev => ({ ...prev, accessKeyId: e.target.value }))}
                        placeholder="AKIA..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="secretAccessKey">Secret Access Key</Label>
                      <div className="relative">
                        <Input
                          id="secretAccessKey"
                          type={showSecretKey ? "text" : "password"}
                          value={awsCredentials.secretAccessKey}
                          onChange={(e) => setAwsCredentials(prev => ({ ...prev, secretAccessKey: e.target.value }))}
                          placeholder="Enter your secret access key"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                        >
                          {showSecretKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAwsDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveAwsCredentials}>
                      Save Credentials
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={downloadProjectJSON}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button
                variant="default"
                onClick={handleGenerateFolders}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <>Download Folders</>
                )}
              </Button>
              <Button variant="outline" onClick={handleDownloadFolder} disabled={isGenerating}>
                <Download className="h-4 w-4 mr-2" />
                Download Folder
              </Button>
              <Button variant="outline" onClick={handleDownloadComps} disabled={isGenerating}>
                <Download className="h-4 w-4 mr-2" />
                Download Comps
              </Button>
              <Button variant="outline" onClick={() => router.push('/create')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
              <Button variant="outline" onClick={deleteProject} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Overview of your project settings.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.websiteType && (
                <div>
                  <h3 className="font-semibold mb-1">Website Type</h3>
                  <p>{formData.websiteType}</p>
                </div>
              )}
              {formData.designChoice && (
                <div>
                  <h3 className="font-semibold mb-1">Design Choice</h3>
                  <p>{formData.designChoice}</p>
                </div>
              )}
              {formData.authConfig && (
                <div>
                  <h3 className="font-semibold mb-1">Authentication</h3>
                  <p>{formData.authConfig.authType} - {formData.authConfig.identityProvider}</p>
                </div>
              )}
              {formData.hostingChoice && (
                <div>
                  <h3 className="font-semibold mb-1">Hosting</h3>
                  <p>{formData.hostingChoice.type}</p>
                </div>
              )}
              {formData.paymentConfig && (
                <div>
                  <h3 className="font-semibold mb-1">Payments</h3>
                  <p>{formData.paymentConfig.currency} ({formData.paymentConfig.paymentProcessor})</p>
                </div>
              )}
              {formData.databaseConfig && (
                <div>
                  <h3 className="font-semibold mb-1">Database</h3>
                  <p>{formData.databaseConfig.type}</p>
                </div>
              )}
              {formData.storageConfig && (
                <div>
                  <h3 className="font-semibold mb-1">Storage</h3>
                  <p>{formData.storageConfig.type}</p>
                </div>
              )}
              {formData.mediaConfig && (
                <div>
                  <h3 className="font-semibold mb-1">Media</h3>
                  <p>{formData.mediaConfig.type}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {formData.sitemap && formData.sitemap.pages && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Sitemap Configuration</CardTitle>
                <CardDescription>Pages and their sections configured for your website.</CardDescription>
              </CardHeader>
              <CardContent>
                {formData.sitemap.pages.map((page: any, pageIndex: number) => (
                  <div key={pageIndex} className="mb-4 p-4 border rounded-md">
                    <h3 className="font-semibold mb-2">Page: {page.name || 'Unnamed Page'} ({page.route})</h3>
                    {page.sections && page.sections.length > 0 ? (
                      <ul className="list-disc list-inside ml-4">
                        {page.sections.map((section: any, sectionIndex: number) => (
                          <li key={sectionIndex}>{section.name} ({section.type})</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No sections configured for this page.</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 