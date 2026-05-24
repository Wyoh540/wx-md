import https from 'https';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

interface AccessTokenResponse {
  access_token?: string;
  expires_in?: number;
  errcode?: number;
  errmsg?: string;
}

interface UploadDraftResponse {
  media_id?: string;
  errcode?: number;
  errmsg?: string;
}

interface WechatConfig {
  appId: string;
  appSecret: string;
  author: string;
  thumbMediaId: string;
}

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function httpsPost(url: string, body: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(body);
    req.end();
  });
}

export function wechatGetAccessToken(
  appId: string,
  appSecret: string
): Promise<AccessTokenResponse> {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  return httpsGet(url)
    .then((data) => {
      try {
        return JSON.parse(data) as AccessTokenResponse;
      } catch {
        return { errcode: -1, errmsg: 'Invalid JSON response' };
      }
    })
    .catch((err) => {
      return { errcode: -1, errmsg: err.message };
    });
}

export function wechatUploadDraft(
  accessToken: string,
  articles: Array<{
    title: string;
    author: string;
    digest: string;
    content: string;
    thumb_media_id: string;
    need_open_comment: number;
    only_fans_can_comment: number;
  }>
): Promise<UploadDraftResponse> {
  const url = `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`;
  const body = JSON.stringify({ articles });
  return httpsPost(url, body)
    .then((data) => {
      try {
        return JSON.parse(data) as UploadDraftResponse;
      } catch {
        return { errcode: -1, errmsg: 'Invalid JSON response' };
      }
    })
    .catch((err) => {
      return { errcode: -1, errmsg: err.message };
    });
}

export async function wechatReadConfig(): Promise<WechatConfig | null> {
  const configPath = path.join(os.homedir(), '.wx-md', 'wechat-config.json');
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data) as WechatConfig;
  } catch {
    return null;
  }
}

export async function wechatWriteConfig(config: WechatConfig): Promise<boolean> {
  const configDir = path.join(os.homedir(), '.wx-md');
  const configPath = path.join(configDir, 'wechat-config.json');
  try {
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('写入微信配置失败:', error);
    return false;
  }
}