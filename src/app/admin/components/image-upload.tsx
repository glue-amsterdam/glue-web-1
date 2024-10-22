"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onUpload: (imageUrl: string) => void;
}

export default function ImageUpload({ onUpload }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    // Simulating upload delay
    setTimeout(() => {
      const imageUrl = "/placeholders/placeholder-1.jpg";
      onUpload(imageUrl);
      setIsUploading(false);
    }, 1000);
  };

  return (
    <Button
      onClick={handleUpload}
      disabled={isUploading}
      className="bg-purple-500 hover:bg-purple-600"
    >
      {isUploading ? "Uploading..." : "Add Image"}
    </Button>
  );
}
