import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function PageHeader() {
  return (
    <div className="w-full flex justify-between items-center p-4 bg-gray-800 text-white shadow-md">
      <h1 className="text-xl font-bold">My Projects</h1>
      <Avatar>
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  );
} 