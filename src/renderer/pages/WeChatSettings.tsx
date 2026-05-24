import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, TestTube } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/sonner'
import { useWeChatConfig } from '@/hooks/useWeChatConfig'

const WeChatSettings: React.FC = () => {
  const navigate = useNavigate()
  const { config, isLoaded, saveConfig } = useWeChatConfig()
  const [form, setForm] = useState({
    appId: config.appId,
    appSecret: config.appSecret,
    author: config.author,
    thumbMediaId: config.thumbMediaId,
  })
  const [testing, setTesting] = useState(false)

  // 同步 hook 加载的配置到表单
  React.useEffect(() => {
    if (isLoaded) {
      setForm({
        appId: config.appId,
        appSecret: config.appSecret,
        author: config.author,
        thumbMediaId: config.thumbMediaId,
      })
    }
  }, [isLoaded, config.appId, config.appSecret, config.author, config.thumbMediaId])

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!form.appId.trim()) {
      toast.error('请填写 App ID')
      return
    }
    if (!form.appSecret.trim()) {
      toast.error('请填写 App Secret')
      return
    }
    saveConfig(form)
    toast.success('配置已保存')
  }

  const handleTestConnection = async () => {
    if (!form.appId.trim() || !form.appSecret.trim()) {
      toast.error('请先填写 App ID 和 App Secret')
      return
    }
    setTesting(true)
    try {
      if (window.electronAPI?.wechatGetAccessToken) {
        const result = await window.electronAPI.wechatGetAccessToken(form.appId, form.appSecret)
        if (result.access_token) {
          toast.success('连接成功！access_token 已获取')
        } else {
          toast.error(`连接失败：${result.errmsg ?? `错误码 ${result.errcode}`}`)
        }
      } else {
        toast.error('当前为 Web 模式，无法测试连接')
      }
    } catch (error) {
      toast.error(`连接失败：${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-start justify-center pt-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            aria-label="返回"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg">微信公众号设置</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="appId" className="text-sm font-medium">
              App ID
            </label>
            <Input
              id="appId"
              placeholder="wx1234567890abcdef"
              value={form.appId}
              onChange={e => handleChange('appId', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="appSecret" className="text-sm font-medium">
              App Secret
            </label>
            <Input
              id="appSecret"
              type="password"
              placeholder="请输入 App Secret"
              value={form.appSecret}
              onChange={e => handleChange('appSecret', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="author" className="text-sm font-medium">
              作者
            </label>
            <Input
              id="author"
              placeholder="文章作者名称"
              value={form.author}
              onChange={e => handleChange('author', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="thumbMediaId" className="text-sm font-medium">
              封面媒体ID
              <span className="text-muted-foreground font-normal ml-1">（可选）</span>
            </label>
            <Input
              id="thumbMediaId"
              placeholder="已上传素材的 media_id"
              value={form.thumbMediaId}
              onChange={e => handleChange('thumbMediaId', e.target.value)}
            />
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            App ID 和 App Secret 可在微信公众号后台「开发-基本配置」中获取。封面媒体ID
            是已上传素材的 media_id，可在素材管理中获取。
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing}
            >
              <TestTube className="h-4 w-4 mr-1.5" />
              {testing ? '测试中...' : '测试连接'}
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1.5" />
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WeChatSettings