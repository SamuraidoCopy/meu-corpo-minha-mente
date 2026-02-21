'use client'

import { useState, useRef, useTransition } from 'react'
import { updateProfilePicture } from '@/app/actions/user'
import { Camera, Loader2 } from 'lucide-react'

interface UserAvatarProps {
    avatarUrl?: string | null
    firstName: string
}

export function UserAvatar({ avatarUrl, firstName }: UserAvatarProps) {
    const [hasError, setHasError] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Create an image element to read bounds
        const img = document.createElement('img')
        const url = URL.createObjectURL(file)

        img.onload = () => {
            const canvas = document.createElement('canvas')
            const MAX_SIZE = 200
            let width = img.width
            let height = img.height

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width
                    width = MAX_SIZE
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height
                    height = MAX_SIZE
                }
            }

            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            ctx?.drawImage(img, 0, 0, width, height)

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
            setPreviewUrl(compressedBase64)
            setHasError(false)

            startTransition(async () => {
                try {
                    await updateProfilePicture(compressedBase64)
                } catch (error) {
                    console.error('Failed to upload image', error)
                }
            })
            URL.revokeObjectURL(url)
        }
        img.src = url
    }

    const handleClick = () => {
        if (!isPending) fileInputRef.current?.click()
    }

    const displayUrl = previewUrl || avatarUrl

    const renderContent = () => (
        <>
            {displayUrl && !hasError ? (
                <img
                    src={displayUrl}
                    alt={firstName}
                    className="w-full h-full object-cover"
                    onError={() => setHasError(true)}
                />
            ) : (
                <span className="text-primary text-3xl font-serif italic">
                    {firstName.charAt(0).toUpperCase()}
                </span>
            )}
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPending ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {isPending ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
        </>
    )

    return (
        <div
            className="w-16 h-16 rounded-full border-2 border-primary/30 relative group cursor-pointer overflow-hidden shadow-md flex items-center justify-center bg-primary/10 shrink-0"
            onClick={handleClick}
        >
            {renderContent()}
        </div>
    )
}
