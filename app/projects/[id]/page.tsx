"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PageHeader } from "@/components/sections/header/page-header"
import { ArrowLeft, Download, Edit, Trash2, Calendar, FileText, Palette, Shield, CreditCard, Map, Database, Globe, Key, Eye, EyeOff } from 'lucide-react'

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
        <PageHeader />
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
        <PageHeader />
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
      <PageHeader />

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
              <Button variant="outline" onClick={() => router.push('/create')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
              <Button variant="outline" onClick={deleteProject} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* AWS Credentials Status */}
          {project.awsCredentials && (
            <Card className="mb-6 border-orange-200 bg-orange-50/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                  <Key className="h-5 w-5" />
                  AWS Credentials Configured
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Access Key ID:</span>
                    <p className="font-mono text-orange-600">{project.awsCredentials.accessKeyId}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Secret Access Key:</span>
                    <p className="font-mono text-orange-600">••••••••••••••••</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Configuration Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Project Name:</span>
                  <p className="font-medium">{formData.projectName || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Type:</span>
                  <p className="font-medium">{formData.isWebApp ? 'Web Application' : 'Website'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Description:</span>
                  <p className="font-medium">{formData.description || 'No description'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Design */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Logo:</span>
                  <p className="font-medium">{formData.media?.logo?.uploaded ? 'Uploaded' : 'Not uploaded'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Favicon:</span>
                  <p className="font-medium">{formData.media?.favicon?.uploaded ? 'Uploaded' : 'Not uploaded'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Color Palette:</span>
                  <p className="font-medium">{formData.design?.selected ? 'Configured' : 'Not configured'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Authentication */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Providers:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.auth?.providers?.length > 0 ? (
                      formData.auth.providers.map((provider: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {provider}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400">None selected</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Plans:</span>
                  <p className="font-medium">{formData.pricing?.length || 0} pricing plans</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Payment Methods:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.payments?.length > 0 ? (
                      formData.payments.map((method: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400">None selected</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sitemap */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Sitemap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Pages:</span>
                  <p className="font-medium">{formData.sitemap?.length || 0} pages</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Sections:</span>
                  <p className="font-medium">
                    {formData.sitemap?.reduce((total: number, page: any) => total + (page.sections?.length || 0), 0) || 0} sections
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Infrastructure */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Storage:</span>
                  <p className="font-medium">{formData.storage?.length > 0 ? 'Configured' : 'Not configured'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Database Tables:</span>
                  <p className="font-medium">{formData.database?.tables?.length || 0} tables</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Domains:</span>
                  <p className="font-medium">{formData.hosting?.length || 0} domains</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 