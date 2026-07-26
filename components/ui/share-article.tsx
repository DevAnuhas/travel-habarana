"use client"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ShareNetwork } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"

function ShareArticle({ post }: { post?: { title?: string } }) {
  const sharePost = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post?.title || "Ceylon Safari guide",
          text: "Check out this amazing blog post!",
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
        })
    } else {
      // Fallback for browsers that don’t support navigator.share
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }
  return (
    <>
      <div className="flex h-fit items-center justify-between rounded-lg bg-gray-100 px-6 py-4">
        <span className="mr-8 font-medium text-gray-700">
          Share this article
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" onClick={sharePost}>
                <ShareNetwork size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share this article</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  )
}

export default ShareArticle
