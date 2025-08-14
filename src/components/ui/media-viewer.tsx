import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Eye, 
  Download, 
  FileText, 
  Image, 
  Video, 
  PlayCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';

interface MediaViewerProps {
  fileName: string;
  fileType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  parsedData?: any;
  processingResults?: any;
  children: React.ReactNode;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  fileName,
  fileType,
  fileUrl,
  thumbnailUrl,
  fileSize,
  parsedData,
  processingResults,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileIcon = () => {
    if (fileType.startsWith('image/')) return <Image className="w-6 h-6 text-green-600" />;
    if (fileType.startsWith('video/')) return <Video className="w-6 h-6 text-blue-600" />;
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      return <FileSpreadsheet className="w-6 h-6 text-orange-600" />;
    }
    return <FileText className="w-6 h-6 text-gray-600" />;
  };

  const renderMediaContent = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    if (fileType.startsWith('image/')) {
      return (
        <div className="max-w-full">
          <img 
            src={`${baseUrl}${fileUrl}`}
            alt={fileName}
            className="max-w-full max-h-[70vh] object-contain rounded border mx-auto"
          />
          {thumbnailUrl && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              高质量原图预览
            </p>
          )}
        </div>
      );
    }
    
    if (fileType.startsWith('video/')) {
      return (
        <div className="max-w-full">
          <video 
            src={`${baseUrl}${fileUrl}`}
            className="max-w-full max-h-[70vh] rounded border mx-auto"
            controls
            autoPlay={false}
          />
          <div className="mt-2 text-center">
            <Badge variant="secondary">
              {processingResults?.canPreview ? '支持在线播放' : '可下载播放'}
            </Badge>
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          {renderFileIcon()}
        </div>
        <p className="text-lg font-medium mb-2">{fileName}</p>
        <p className="text-sm text-muted-foreground mb-4">
          此文件类型不支持在线预览
        </p>
        <Button 
          onClick={() => window.open(`${baseUrl}${fileUrl}`, '_blank')}
          className="mr-2"
        >
          <Download className="w-4 h-4 mr-2" />
          下载文件
        </Button>
      </div>
    );
  };

  const renderParsedData = () => {
    if (!parsedData) return null;
    
    if (parsedData.headers || parsedData.firstSheetData) {
      // Excel/CSV 数据预览
      const data = parsedData.firstSheetData || [parsedData.headers, ...parsedData.data];
      
      return (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">数据预览</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-border">
                <thead>
                  <tr className="bg-muted">
                    {data[0]?.map((cell: any, index: number) => (
                      <th key={index} className="border border-border p-1 text-left">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(1, 6).map((row: any[], rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.map((cell: any, cellIndex: number) => (
                        <td key={cellIndex} className="border border-border p-1">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <p>总行数: {parsedData.totalRows}</p>
              <p>总列数: {parsedData.totalColumns}</p>
              {data.length > 6 && <p>仅显示前5行数据</p>}
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">解析信息</h4>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {renderFileIcon()}
              {fileName}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {formatFileSize(fileSize)}
              </Badge>
              {processingResults && (
                <Badge variant="secondary">
                  已解析
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 媒体内容 */}
          {renderMediaContent()}
          
          {/* 解析数据 */}
          {renderParsedData()}
          
          {/* 处理结果 */}
          {processingResults && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">处理结果</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {processingResults.type && (
                    <div>
                      <span className="font-medium">文件类型:</span> {processingResults.type}
                    </div>
                  )}
                  {processingResults.totalRows && (
                    <div>
                      <span className="font-medium">数据行数:</span> {processingResults.totalRows}
                    </div>
                  )}
                  {processingResults.totalColumns && (
                    <div>
                      <span className="font-medium">列数:</span> {processingResults.totalColumns}
                    </div>
                  )}
                  {processingResults.sheets && (
                    <div>
                      <span className="font-medium">工作表数:</span> {processingResults.sheets}
                    </div>
                  )}
                  {processingResults.encoding && (
                    <div>
                      <span className="font-medium">编码:</span> {processingResults.encoding}
                    </div>
                  )}
                  {processingResults.canPreview !== undefined && (
                    <div>
                      <span className="font-medium">在线预览:</span> {processingResults.canPreview ? '支持' : '不支持'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaViewer;
