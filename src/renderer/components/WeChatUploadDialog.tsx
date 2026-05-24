import React, { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { useWeChatDraft } from '@/hooks/useWeChatDraft';

interface WeChatUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  author: string;
  digest: string;
  contentHtml: string;
  onUpload: () => void;
}

const WeChatUploadDialog: React.FC<WeChatUploadDialogProps> = ({
  open,
  onOpenChange,
  title,
  author,
  digest,
  contentHtml,
  onUpload,
}) => {
  const { uploadDraft } = useWeChatDraft();
  const [formTitle, setFormTitle] = useState(title);
  const [formAuthor, setFormAuthor] = useState(author);
  const [formDigest, setFormDigest] = useState(digest);
  const [uploading, setUploading] = useState(false);

  // 同步 props 到表单状态
  React.useEffect(() => {
    if (open) {
      setFormTitle(title);
      setFormAuthor(author);
      setFormDigest(digest);
    }
  }, [open, title, author, digest]);

  const handleUpload = async () => {
    setUploading(true);
    try {
      const result = await uploadDraft({
        title: formTitle,
        author: formAuthor,
        digest: formDigest,
        contentHtml,
      });

      if (result.success) {
        toast.success(result.message);
        onUpload();
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>上传微信草稿</DialogTitle>
          <DialogDescription>
            内容将作为草稿上传到微信公众号后台
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="draft-title">标题</Label>
            <Input
              id="draft-title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="文章标题"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="draft-author">作者</Label>
            <Input
              id="draft-author"
              value={formAuthor}
              onChange={(e) => setFormAuthor(e.target.value)}
              placeholder="文章作者"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="draft-digest">摘要</Label>
            <Textarea
              id="draft-digest"
              value={formDigest}
              onChange={(e) => setFormDigest(e.target.value)}
              placeholder="文章摘要（最多 120 字）"
              rows={3}
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formDigest.length}/120
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            取消
          </Button>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-1.5" />
            )}
            {uploading ? '上传中...' : '上传'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WeChatUploadDialog;