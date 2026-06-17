import {
  themeOptions,
  fontFamilyOptions,
  fontSizeOptions,
  themeColorOptions,
  codeThemeOptions
} from '../config/config';
import { ThemeType } from '../config/theme';
import { PreviewMode, DropdownItem } from '../types';
import { useElectronFile } from '../hooks/useElectronFile';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Monitor,
  Smartphone,
  Maximize,
  Copy,
  FolderOpen,
  Save,
  FileOutput,
  Check,
  Palette,
  Type,
  Heading,
  Paintbrush,
  Code,
  Info,
  ChevronDown,
  Settings,
  Upload,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

interface ToolbarProps {
  currentTheme: ThemeType;
  setCurrentTheme: (theme: ThemeType) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  codeTheme: string;
  setCodeTheme: (theme: string) => void;
  previewMode: PreviewMode;
  togglePreviewMode: (mode: PreviewMode) => void;
  copyAsWechat: () => void;
  content: string;
  saveContent: (content: string) => void;
  onUploadClick?: () => void;
}

const Toolbar = ({
  currentTheme,
  setCurrentTheme,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  themeColor,
  setThemeColor,
  codeTheme,
  setCodeTheme,
  previewMode,
  togglePreviewMode,
  copyAsWechat,
  content,
  saveContent,
  onUploadClick,
}: ToolbarProps) => {
  const navigate = useNavigate();
  const {
    isElectron,
    openFile,
    saveFile,
    saveFileAs,
  } = useElectronFile(content);

  const menuConfigurations: Record<string, DropdownItem[]> = {
    '主题': themeOptions.map(option => ({
      label: option.label,
      action: () => setCurrentTheme(option.value as ThemeType),
      checked: currentTheme === option.value
    })),
    '字体': fontFamilyOptions.map(option => ({
      label: option.label,
      action: () => setFontFamily(option.value),
      checked: fontFamily.replace(/['"]/g, '') === option.value.replace(/['"]/g, '')
    })),
    '字号': fontSizeOptions.map(option => ({
      label: option.label,
      action: () => setFontSize(option.value),
      checked: fontSize === option.value
    })),
    '主题色': themeColorOptions.map(option => ({
      label: option.label,
      value: option.value,
      action: () => setThemeColor(option.value),
      checked: themeColor === option.value
    })),
    '代码主题': codeThemeOptions.map(option => ({
      label: option.label,
      action: () => setCodeTheme(option.value),
      checked: codeTheme === option.value
    })),
    '关于': [
      {
        label: 'GitHub',
        url: 'https://github.com/flyeric0212/wx-md',
        isLink: true
      }
    ]
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  const getMenuIcon = (menuName: string) => {
    switch (menuName) {
      case '主题': return <Palette className="mr-2 h-4 w-4" />;
      case '字体': return <Type className="mr-2 h-4 w-4" />;
      case '字号': return <Heading className="mr-2 h-4 w-4" />;
      case '主题色': return <Paintbrush className="mr-2 h-4 w-4" />;
      case '代码主题': return <Code className="mr-2 h-4 w-4" />;
      case '关于': return <Info className="mr-2 h-4 w-4" />;
      default: return null;
    }
  };

  const previewModes: { mode: PreviewMode; label: string; icon: React.ReactNode; title: string }[] = [
    { mode: 'responsive', label: '自适应', icon: <Monitor className="h-4 w-4" />, title: '响应式预览' },
    { mode: 'mobile', label: '手机', icon: <Smartphone className="h-4 w-4" />, title: '移动设备预览 (375px)' },
    { mode: 'wide', label: '宽屏', icon: <Maximize className="h-4 w-4" />, title: '宽屏预览' },
  ];

  return (
    <TooltipProvider>
      <header
        className="flex items-center justify-between px-4 h-[60px] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
      >
        {/* 左侧：样式菜单组 */}
        <div className="flex items-center gap-1">
          {Object.entries(menuConfigurations).map(([menuName, items]) => (
            <DropdownMenu key={menuName}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  {getMenuIcon(menuName)}
                  {menuName}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[180px]">
                <DropdownMenuLabel>{menuName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {items.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => {
                      if (item.isLink && item.url) {
                        handleLinkClick(item.url);
                      } else {
                        item.action?.();
                      }
                    }}
                    className="justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {menuName === '主题色' && item.value && (
                        <div
                          className="h-4 w-4 rounded-full border"
                          style={{ backgroundColor: item.value }}
                        />
                      )}
                      <span>{item.label}</span>
                    </div>
                    {item.checked && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        {/* 右侧：操作组 */}
        <div className="flex items-center gap-1">
          {isElectron && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      void (async () => {
                        const fileContent = await openFile();
                        if (fileContent !== null) {
                          saveContent(fileContent);
                        }
                      })();
                    }}
                  >
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>打开文件 (Ctrl+O)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void saveFile()}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>保存文件 (Ctrl+S)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void saveFileAs()}
                  >
                    <FileOutput className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>另存为 (Ctrl+Shift+S)</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="mx-1 h-6" />
            </>
          )}

          {/* 预览模式 */}
          <Tabs
            value={previewMode}
            onValueChange={(value) => togglePreviewMode(value as PreviewMode)}
          >
            <TabsList>
              {previewModes.map(({ mode, label, icon }) => (
                <TabsTrigger key={mode} value={mode} className="gap-1">
                  {icon}
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* 复制按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={copyAsWechat}
                className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Copy className="h-4 w-4" />
                复制
              </Button>
            </TooltipTrigger>
            <TooltipContent>复制为公众号格式</TooltipContent>
          </Tooltip>

          {/* 设置按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>微信公众号设置</TooltipContent>
          </Tooltip>

          {/* 上传草稿按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={() => onUploadClick?.()}
                className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Upload className="h-4 w-4" />
                上传
              </Button>
            </TooltipTrigger>
            <TooltipContent>上传到微信公众号草稿箱</TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Toolbar;
