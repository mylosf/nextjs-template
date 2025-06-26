import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Plus, FolderOpen, Archive, Star } from "lucide-react"

export function ProjectsSidebar() {
  return (
    <div className="w-64 bg-black border-r border-gray-800 p-6 space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search projects..." 
            className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-300">Filter</h3>
          <Filter className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start text-white hover:bg-gray-800 hover:text-white">
            <FolderOpen className="mr-2 h-4 w-4" />
            All Projects
            <Badge variant="secondary" className="ml-auto bg-gray-700 text-white">2</Badge>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-white hover:bg-gray-800 hover:text-white">
            <Star className="mr-2 h-4 w-4" />
            Favorites
            <Badge variant="secondary" className="ml-auto bg-gray-700 text-white">0</Badge>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-white hover:bg-gray-800 hover:text-white">
            <Archive className="mr-2 h-4 w-4" />
            Archived
            <Badge variant="secondary" className="ml-auto bg-gray-700 text-white">0</Badge>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Quick Actions</h3>
        <Button className="w-full" size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Recent Activity</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <p>Project Alpha updated 2 days ago</p>
          <p>Project Beta created 1 week ago</p>
        </div>
      </div>
    </div>
  )
} 