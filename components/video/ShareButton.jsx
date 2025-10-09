// components/video/ShareButton.tsx
import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Link2, Check, Mail, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '../ui/dropdown-menu';
import { useToast } from '../../contexts/ToastContext';
export const ShareButton = ({ title, url, description = '', hashtags = [], variant = 'outline', size = 'sm', }) => {
    const [copied, setCopied] = useState(false);
    const { showToast } = useToast();
    const shareUrl = `${window.location.origin}${url}`;
    const hashtagsString = hashtags.map(tag => `#${tag}`).join(' ');
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            showToast('Link copiado!', 'success');
            setTimeout(() => setCopied(false), 2000);
        }
        catch (err) {
            showToast('Erro ao copiar link', 'error');
        }
    };
    const handleShare = (platform) => {
        let shareLink = '';
        switch (platform) {
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(hashtagsString)}`;
                break;
            case 'linkedin':
                shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'whatsapp':
                shareLink = `https://wa.me/?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`;
                break;
            case 'email':
                shareLink = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${shareUrl}`)}`;
                break;
        }
        if (shareLink) {
            window.open(shareLink, '_blank', 'width=600,height=400');
        }
    };
    // Web Share API (if available)
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: description,
                    url: shareUrl,
                });
                showToast('Compartilhado com sucesso!', 'success');
            }
            catch (err) {
                // User cancelled or error
            }
        }
    };
    return (<DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} aria-label="Compartilhar">
          <Share2 className="w-4 h-4"/>
          {size !== 'icon' && <span className="ml-2">Compartilhar</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Compartilhar</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Native Share (if available) */}
        {navigator.share && (<>
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="w-4 h-4 mr-2"/>
              Compartilhar...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>)}

        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (<>
              <Check className="w-4 h-4 mr-2 text-green-500"/>
              Link copiado!
            </>) : (<>
              <Link2 className="w-4 h-4 mr-2"/>
              Copiar link
            </>)}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Social Platforms */}
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="w-4 h-4 mr-2"/>
          Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="w-4 h-4 mr-2"/>
          Twitter / X
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare('linkedin')}>
          <Linkedin className="w-4 h-4 mr-2"/>
          LinkedIn
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          <MessageCircle className="w-4 h-4 mr-2"/>
          WhatsApp
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare('email')}>
          <Mail className="w-4 h-4 mr-2"/>
          Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>);
};
export default ShareButton;
