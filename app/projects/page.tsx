"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/sections/header/page-header"
import { useRouter } from "next/navigation"

const projects = [
  {
    id: 1,
    title: "Project Alpha",
    description: "A revolutionary web application that transforms how users interact with data visualization.",
    status: "Active",
    lastUpdated: "2 days ago"
  },
  {
    id: 2,
    title: "Project Beta",
    description: "An AI-powered content management system designed for modern digital workflows.",
    status: "Active", 
    lastUpdated: "1 week ago"
  }
]

export default function ProjectsPage() {
  const router = useRouter();
  return (
    <div className="relative min-h-screen">
      <PageHeader />

      {/* Content */}
      <section className="flex flex-col items-center justify-center py-8 px-8 min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-2xl space-y-6">
          {projects.map((project) => (
            <Card key={project.id} className="w-full">
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
                  Last updated: {project.lastUpdated}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Button positioned at fixed distance from bottom */}
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
    </div>
  )
} 