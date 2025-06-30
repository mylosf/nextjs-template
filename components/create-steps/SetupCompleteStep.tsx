import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Props {
  onRestart: () => void
  formData: any
}

function downloadJSON(data: any, filename = 'project.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function saveProjectToStorage(formData: any) {
  const project = {
    id: `project-${Date.now()}`,
    title: formData.projectName || 'Untitled Project',
    description: formData.description || 'No description provided',
    status: 'Active',
    lastUpdated: new Date().toISOString(),
    formData: formData
  };

  // Get existing projects
  const existingProjects = localStorage.getItem('projects');
  const projects = existingProjects ? JSON.parse(existingProjects) : [];
  
  // Add new project
  projects.push(project);
  
  // Save back to localStorage
  localStorage.setItem('projects', JSON.stringify(projects));
  
  return project.id;
}

export default function SetupCompleteStep({ onRestart, formData }: Props) {
  const router = useRouter();

  const handleDownload = () => {
    downloadJSON(formData);
  };

  const handleViewProjects = () => {
    // Save project first
    saveProjectToStorage(formData);
    // Navigate to projects page
    router.push('/projects');
  };

  const handleStartOver = () => {
    // Save project before restarting
    saveProjectToStorage(formData);
    onRestart();
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-6">Setup Complete!</h2>
      <div className="mb-4 text-green-400 font-semibold text-lg">Your project is now saved!</div>
      <div className="mb-8 text-gray-400">Your project setup is complete. You can now proceed to wireframes or start building your app.</div>
      <div className="flex flex-col items-center gap-4">
        <Button onClick={handleViewProjects} className="bg-blue-600 hover:bg-blue-700">
          View All Projects
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          Download JSON
        </Button>
        <Button variant="ghost" onClick={handleStartOver}>
          Start Over
        </Button>
      </div>
    </div>
  )
} 