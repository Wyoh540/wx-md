import { useEffect } from 'react';
import { toast } from 'sonner';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onClose: () => void;
}

/**
 * 通知组件（已迁移至 Sonner Toast）
 * 保持原有接口以兼容上层调用，内部通过 Sonner 展示
 */
const Notification = ({ message, type, visible, onClose }: NotificationProps) => {
  useEffect(() => {
    if (!visible) return;

    const id = toast[type](message, {
      duration: 2000,
      onDismiss: onClose,
      onAutoClose: onClose,
    });

    return () => {
      toast.dismiss(id);
    };
  }, [visible, message, type, onClose]);

  return null;
};

export default Notification;
