import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Twitter, Linkedin, Facebook, Link as LinkIcon } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const shareData = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <Share2 className="w-4 h-4" />
        {t('blog.share')}:
      </span>

      <div className="flex gap-2">
        <a
          href={shareData.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-muted hover:bg-[#1DA1F2] hover:text-white transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
        </a>

        <a
          href={shareData.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-muted hover:bg-[#0A66C2] hover:text-white transition-colors"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </a>

        <a
          href={shareData.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-muted hover:bg-[#1877F2] hover:text-white transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
        </a>

        <button
          onClick={copyLink}
          className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors relative"
          aria-label="Copy link"
        >
          <LinkIcon className="w-4 h-4" />
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap">
              {t('blog.copied')}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}