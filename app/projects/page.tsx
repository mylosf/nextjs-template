"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface Project {
  id: string
  title: string
  description: string
  status: string
  lastUpdated: string
  formData: any
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load projects from localStorage
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative min-h-screen">

      {/* Content */}
      <section className="flex flex-col items-center justify-center py-8 px-8 min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-2xl space-y-6">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-gray-400 mb-6">Create your first project to get started</p>
              <Button 
                onClick={() => router.push('/create')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create your first project
              </Button>
            </div>
          ) : (
            projects.map((project) => (
              <Card key={project.id} className="w-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <span className="text-sm text-green-600 font-medium">{project.status}</span>
                  </div>
                  <CardDescription className="text-base">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {formatDate(project.lastUpdated)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Button positioned at fixed distance from bottom */}
      {projects.length > 0 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <Button 
            variant="outline" 
            size="lg"
            className="border-red-300 text-red-300 hover:bg-red-300 hover:text-black"
            onClick={() => router.push('/create')}
          >
            Create more magic
          </Button>
        </div>
      )}
    </div>
  )
} 