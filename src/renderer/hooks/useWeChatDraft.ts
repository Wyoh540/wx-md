import { useCallback } from 'react';
import type { WeChatConfig, WeChatDraftArticle, WeChatImageUploadMap } from '@/types';

/**
 * 从 Markdown 文本中提取 H1 标题
 * 返回第一个 # 开头的标题文本，若无则返回 "无标题"
 */
function extractTitle(markdownText: string): string {
  const lines = markdownText.split('\n');
  for (const line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      return trimmed.slice(2).trim();
    }
  }
  return '无标题';
}

/**
 * 从 Markdown 文本中提取摘要
 * 找到第一个非空段落（不以 #, >, -, *, |, ` 开头的行）
 * 去除 Markdown 格式（粗体、斜体、链接），截取前 120 字符
 */
function extractDigest(markdownText: string): string {
  const lines = markdownText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // 跳过空行、标题、引用、列表、表格、代码
    if (!trimmed) continue;
    if (/^[#>`]/.test(trimmed)) continue;
    if (/^[-*+]\s/.test(trimmed)) continue;
    if (/^\d+\.\s/.test(trimmed)) continue;
    if (/^\|/.test(trimmed)) continue;
    if (/^---+$/.test(trimmed)) continue;
    if (/^\*\*\*$/.test(trimmed)) continue;

    // 去除 Markdown 格式
    let plain = trimmed;
    // 去除链接 [text](url) → text
    plain = plain.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
    // 去除粗体 **text** 或 __text__
    plain = plain.replace(/\*\*([^*]*)\*\*/g, '$1');
    plain = plain.replace(/__([^_]*)__/g, '$1');
    // 去除斜体 *text* 或 _text_
    plain = plain.replace(/\*([^*]*)\*/g, '$1');
    plain = plain.replace(/_([^_]*)_/g, '$1');
    // 去除行内代码 `code`
    plain = plain.replace(/`([^`]*)`/g, '$1');
    // 去除删除线 ~~text~~
    plain = plain.replace(/~~([^~]*)~~/g, '$1');
    // 去除图片 ![alt](url)
    plain = plain.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');

    plain = plain.trim();
    if (plain) {
      return plain.length > 120 ? plain.slice(0, 120) : plain;
    }
  }
  return '';
}

/**
 * 微信公众号草稿上传 Hook
 * 提供 extractTitle、extractDigest、uploadDraft 方法
 */
export function useWeChatDraft() {
  const uploadDraft = useCallback(async (params: {
    title: string;
    author: string;
    digest: string;
    contentHtml: string;
    baseDir?: string;
  }): Promise<{ success: boolean; message: string }> => {
    // 检查 Electron 环境
    if (!window.electronAPI?.wechatGetAccessToken) {
      return { success: false, message: '此功能需要桌面端应用，请下载使用' };
    }

    try {
      // 读取配置
      const config: WeChatConfig | null = await window.electronAPI.wechatReadConfig();
      if (!config || !config.appId.trim() || !config.appSecret.trim()) {
        return { success: false, message: '请先配置微信公众号 App ID 和 App Secret' };
      }

      // 获取 access_token
      const tokenResponse = await window.electronAPI.wechatGetAccessToken(
        config.appId,
        config.appSecret
      );

      if (tokenResponse.errcode || !tokenResponse.access_token) {
        return {
          success: false,
          message: tokenResponse.errmsg ?? `获取 access_token 失败（错误码：${tokenResponse.errcode}）`,
        };
      }

      const accessToken = tokenResponse.access_token;

      // 处理文章中的图片：上传到微信素材库并替换 URL
      let processedContentHtml = params.contentHtml;

      const parser = new DOMParser();
      const doc = parser.parseFromString(params.contentHtml, 'text/html');
      const images = doc.querySelectorAll('img');
      const imageSrcs: string[] = [];

      for (const img of images) {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('data:') && !src.includes('mmbiz.qpic.cn')) {
          imageSrcs.push(src);
        }
      }

      if (imageSrcs.length > 0) {
        const uploadMaps: WeChatImageUploadMap[] = await window.electronAPI.wechatUploadImages(
          accessToken,
          imageSrcs,
          params.baseDir
        );

        // 替换 contentHtml 中的图片 URL
        for (const map of uploadMaps) {
          processedContentHtml = processedContentHtml.replace(
            new RegExp(map.originalSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            map.wechatUrl
          );
        }
      }

      // 构造草稿文章
      const article: WeChatDraftArticle = {
        title: params.title,
        author: params.author,
        digest: params.digest,
        content: processedContentHtml,
        thumb_media_id: config.thumbMediaId || '',
        need_open_comment: 0,
        only_fans_can_comment: 0,
      };

      // 上传草稿
      const draftResponse = await window.electronAPI.wechatUploadDraft(accessToken, [article]);

      if (draftResponse.media_id) {
        return { success: true, message: `草稿上传成功（media_id: ${draftResponse.media_id}）` };
      }

      if (draftResponse.errcode) {
        return {
          success: false,
          message: draftResponse.errmsg ?? `上传失败（错误码：${draftResponse.errcode}）`,
        };
      }

      return { success: false, message: '上传失败，未知错误' };
    } catch (error) {
      return {
        success: false,
        message: `上传失败：${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }, []);

  return { extractTitle, extractDigest, uploadDraft };
}