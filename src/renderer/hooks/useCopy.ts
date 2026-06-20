import { useCallback } from 'react';
import { inlineContent } from 'juice/client';
import { getImageMimeType } from '@/utils/fileKind';

/**
 * 将 file:// 路径的图片转为 base64 data URI
 */
const convertLocalImagesToBase64 = async (element: HTMLElement): Promise<void> => {
  if (!window.electronAPI?.readFileAsBase64) return;

  const images = element.getElementsByTagName('img');
  for (const image of Array.from(images)) {
    const src = image.getAttribute('src');
    if (src && src.startsWith('file://')) {
      try {
        const base64 = await window.electronAPI.readFileAsBase64(src);
        if (base64) {
          const mimeType = getImageMimeType(src);
          image.setAttribute('src', `data:${mimeType};base64,${base64}`);
        }
      } catch (error) {
        console.error('转换图片为 base64 失败:', src, error);
      }
    }
  }
};

/**
 * 处理图片大小，将width/height属性转为style
 */
const solveWeChatImage = (element: HTMLElement) => {
  const images = element.getElementsByTagName('img');
  Array.from(images).forEach((image) => {
    const width = image.getAttribute('width');
    const height = image.getAttribute('height');

    if (width) {
      image.style.width = width;
      image.removeAttribute('width');
    }

    if (height) {
      image.style.height = height;
      image.removeAttribute('height');
    }
  });
};

/**
 * 修改HTML结构，确保列表结构正确
 */
const modifyHtmlStructure = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // 移动 li > ul 和 li > ol 到 li 后面
  tempDiv.querySelectorAll('li > ul, li > ol').forEach((originalItem) => {
    originalItem.parentElement!.insertAdjacentElement('afterend', originalItem);
  });

  return tempDiv.innerHTML;
};

/**
 * 执行富文本复制到剪贴板
 * 优先使用 Electron 原生 clipboard API 写入 text/html 格式，确保微信编辑器能正确解析
 */
const executeRichCopy = async (html: string): Promise<boolean> => {
  try {
    // 优先使用 Electron 原生 clipboard API 写入 HTML，确保格式正确
    if (window.electronAPI?.writeClipboardHtml) {
      const success = await window.electronAPI.writeClipboardHtml(html);
      if (success) {
        console.log('使用 Electron clipboard API 复制成功');
        return true;
      }
    }

    // 回退到传统 document.execCommand('copy')
    console.warn('Electron clipboard API 不可用，回退到 execCommand');
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html;
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '0';
    tempContainer.style.left = '-9999px';
    tempContainer.setAttribute('contenteditable', 'true');
    document.body.appendChild(tempContainer);

    const selection = window.getSelection();
    if (!selection) {
      throw new Error('浏览器不支持selection API');
    }

    selection.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(tempContainer);
    selection.addRange(range);

    const successful = document.execCommand('copy');

    selection.removeAllRanges();
    document.body.removeChild(tempContainer);

    if (successful) {
      return true;
    } else {
      throw new Error('复制命令执行失败');
    }
  } catch (err) {
    console.error('复制失败:', err);
    alert('复制失败，请重试');
    return false;
  }
};

export function useCopy() {
  // 不再需要获取主题样式字符串
  const copyToWechat = useCallback(async (): Promise<boolean> => {
    try {
      console.log('开始执行复制到微信公众号格式');

      // 1. 获取预览区内容
      const previewElement = document.querySelector('.markdown-preview');
      if (!previewElement) {
        console.error('找不到预览区内容');
        alert('找不到预览区内容');
        return false;
      }

      // 2. 直接使用预览区的HTML内容（已经包含内联样式）
      let html = previewElement.innerHTML;

      // 3. 将代码主题CSS内联到HTML中（微信会剥离class，必须转为内联style）
      const codeThemeStyle = document.querySelector('style[id^="code-theme-"]');
      if (codeThemeStyle && codeThemeStyle.textContent) {
        try {
          html = inlineContent(html, codeThemeStyle.textContent);
          console.log('代码主题CSS内联成功');
        } catch (err) {
          console.error('CSS内联失败:', err);
        }
      }

      // 4. 修正HTML结构并处理图片
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = modifyHtmlStructure(html);
      solveWeChatImage(tempDiv);

      // 5. 将本地图片转为 base64 data URI（剪贴板可跨应用使用）
      await convertLocalImagesToBase64(tempDiv);

      // 6. 执行富文本复制
      return await executeRichCopy(tempDiv.innerHTML);
    } catch (error) {
      console.error('处理复制内容时出错:', error);
      alert('复制过程中出错');
      return false;
    }
  }, []);

  return { copyToWechat };
}