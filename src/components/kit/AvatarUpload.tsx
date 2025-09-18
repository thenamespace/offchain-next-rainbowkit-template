"use client"

import * as React from "react"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Upload, Trash2, Loader2, AlertCircle, Check, RotateCw, Move } from "lucide-react"
import { useUploadAvatar } from "@/hooks/use-upload-avatar"
import { useUpdateEnsAvatar } from "@/hooks/use-update-ens-avatar"
import { emojiAvatarForAddress } from "@/utils/avatar"
import AvatarEditor from 'react-avatar-editor'

interface AvatarUploadProps {
  subname: string
  network?: 'mainnet' | 'sepolia' | 'holesky'
  address?: string
  currentAvatarSrc?: string
  onAvatarUploaded?: (avatarUrl: string) => void
  onAvatarDeleted?: () => void
  className?: string
}

export function AvatarUpload({
  subname,
  network = 'mainnet',
  address,
  currentAvatarSrc,
  onAvatarUploaded,
  onAvatarDeleted,
  className = ""
}: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [croppedPreviewUrl, setCroppedPreviewUrl] = React.useState<string | null>(null)
  const [croppedFile, setCroppedFile] = React.useState<File | null>(null)
  const [cropMode, setCropMode] = React.useState(false)
  const [scale, setScale] = React.useState(1.2)
  const [rotate, setRotate] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const editorRef = React.useRef<AvatarEditor>(null)

  const { uploadAvatar, deleteAvatar, isUploading, isDeleting, data, error } = useUploadAvatar()
  const { updateEnsAvatar, clearEnsAvatar } = useUpdateEnsAvatar()

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      alert('File size must be less than 2MB')
      return
    }

    // Clear any existing cropped data
    setCroppedFile(null)
    if (croppedPreviewUrl) {
      URL.revokeObjectURL(croppedPreviewUrl)
      setCroppedPreviewUrl(null)
    }

    setSelectedFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    
    // Enter crop mode
    setCropMode(true)
    setScale(1.2)
    setRotate(0)
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedFile(null)
    setCroppedFile(null)
    setCropMode(false)
    setScale(1.2)
    setRotate(0)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (croppedPreviewUrl) {
      URL.revokeObjectURL(croppedPreviewUrl)
      setCroppedPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Get cropped image as blob
  const getCroppedImage = async (): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!editorRef.current || !selectedFile) {
        reject(new Error('No image to crop'))
        return
      }

      const canvas = editorRef.current.getImage()
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) {
          reject(new Error('Failed to create blob'))
          return
        }
        
        // Create a new File from the blob with the original filename
        const croppedFile = new File([blob], selectedFile.name, {
          type: selectedFile.type,
          lastModified: Date.now(),
        })
        resolve(croppedFile)
      }, selectedFile.type, 0.9)
    })
  }

  // Rotate image
  const handleRotate = () => {
    setRotate(prev => (prev + 90) % 360)
  }

  // Confirm crop and proceed to upload
  const handleConfirmCrop = async () => {
    if (!editorRef.current || !selectedFile) return

    try {
      // Get the cropped file for upload
      const croppedFileForUpload = await getCroppedImage()
      setCroppedFile(croppedFileForUpload)

      // Get the cropped canvas and create a preview URL
      const canvas = editorRef.current.getImage()
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          // Clean up previous cropped preview
          if (croppedPreviewUrl) {
            URL.revokeObjectURL(croppedPreviewUrl)
          }
          
          // Create new preview URL for the cropped image
          const croppedUrl = URL.createObjectURL(blob)
          setCroppedPreviewUrl(croppedUrl)
        }
      }, selectedFile.type, 0.9)
      
      setCropMode(false)
    } catch (err) {
      console.error('Failed to generate crop preview:', err)
      setCropMode(false)
    }
  }

  // Upload avatar
  const handleUpload = async () => {
    if (!selectedFile || !subname) return

    try {
      // Use cropped file if available, otherwise use original file
      const fileToUpload = croppedFile || selectedFile

      const result = await uploadAvatar({
        file: fileToUpload,
        subname,
        network,
      })

      // Update ENS text record with the new avatar URL
      try {
        await updateEnsAvatar({ subname, avatarUrl: result.avatarUrl })
      } catch (ensError) {
        console.error('Error updating ENS text record:', ensError)
        // Still call success callback since the upload itself succeeded
      }

      // Call success callback
      onAvatarUploaded?.(result.avatarUrl)
      
      // Clear selection after successful upload
      clearSelection()
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  // Delete avatar
  const handleDelete = async () => {
    if (!subname) return

    try {
      await deleteAvatar({ subname, network })
      
      // Update ENS text record to remove avatar
      try {
        await clearEnsAvatar(subname)
      } catch (ensError) {
        console.error('Error clearing ENS text record:', ensError)
      }

      onAvatarDeleted?.()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      if (croppedPreviewUrl) {
        URL.revokeObjectURL(croppedPreviewUrl)
      }
    }
  }, [previewUrl, croppedPreviewUrl])

  const displayAvatarSrc = croppedPreviewUrl || data?.avatarUrl || currentAvatarSrc
  const isProcessing = isUploading || isDeleting

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Crop Mode */}
      {cropMode && selectedFile && previewUrl && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-sm font-medium mb-2">Crop your avatar</h3>
            <p className="text-xs text-gray-500 mb-4">Drag to reposition, use controls to adjust</p>
          </div>
          
          {/* Avatar Editor */}
          <div className="flex justify-center">
            <AvatarEditor
              ref={editorRef}
              image={previewUrl}
              width={200}
              height={200}
              border={20}
              borderRadius={100} // Makes it circular
              color={[255, 255, 255, 0.6]} // RGBA
              scale={scale}
              rotate={rotate}
              style={{ cursor: 'move' }}
            />
          </div>

          {/* Crop Controls */}
          <div className="space-y-3">
            {/* Scale Control */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Zoom</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Rotate Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRotate}
                disabled={isProcessing}
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Rotate 90°
              </Button>
            </div>
          </div>

          {/* Crop Actions */}
          <div className="flex gap-2">
            <Button
              onClick={clearSelection}
              variant="outline"
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCrop}
              disabled={isProcessing}
              className="flex-1"
            >
              Confirm Crop
            </Button>
          </div>
        </div>
      )}

      {/* Avatar Preview (when not in crop mode) */}
      {!cropMode && (
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="w-20 h-20">
            {displayAvatarSrc && <AvatarImage src={displayAvatarSrc} alt="Avatar" />}
            <AvatarFallback 
              className="text-2xl flex items-center justify-center"
              style={{
                backgroundColor: address ? emojiAvatarForAddress(address).color : undefined
              }}
            >
              {address ? emojiAvatarForAddress(address).emoji : '?'}
            </AvatarFallback>
          </Avatar>

          {selectedFile && (
            <div className="text-center">
              <p className="text-sm text-gray-600">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          )}
        </div>
      )}

      {/* File Input (only show when not in crop mode) */}
      {!cropMode && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose Image
          </Button>
        </div>
      )}

      {/* Upload Actions (only show when file is selected and not in crop mode) */}
      {selectedFile && !cropMode && (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              // Clear cropped preview and file when re-entering crop mode
              if (croppedPreviewUrl) {
                URL.revokeObjectURL(croppedPreviewUrl)
                setCroppedPreviewUrl(null)
              }
              setCroppedFile(null)
              setCropMode(true)
            }}
            variant="outline"
            disabled={isProcessing}
            className="flex-1"
          >
            <Move className="w-4 h-4 mr-2" />
            Edit & Crop
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isProcessing}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>
      )}

      {/* Delete Avatar */}
      {(currentAvatarSrc || data?.avatarUrl) && !selectedFile && (
        <Button
          onClick={handleDelete}
          variant="outline"
          disabled={isProcessing}
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Avatar
            </>
          )}
        </Button>
      )}

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error.message}</p>
        </div>
      )}

      {data && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">
            Avatar {data.isUpdate ? 'updated' : 'uploaded'} successfully!
          </p>
        </div>
      )}
    </div>
  )
}

