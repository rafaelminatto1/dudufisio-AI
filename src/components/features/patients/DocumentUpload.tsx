'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Upload, File, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { createServerComponentClient } from '~/lib/supabase/server';

interface DocumentUploadProps {
  patientId: string;
  onUploadComplete?: () => void;
}

export function DocumentUpload({ patientId, onUploadComplete }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Valida tipos de arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validFiles = selectedFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Tipo de arquivo não permitido: ${file.name}`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error(`Arquivo muito grande: ${file.name} (máx 10MB)`);
        return false;
      }
      return true;
    });

    setFiles([...files, ...validFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Selecione pelo menos um arquivo');
      return;
    }

    setUploading(true);

    try {
      // Aqui você implementaria o upload para Supabase Storage
      // Por enquanto, apenas simula
      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso!`);
      setFiles([]);
      onUploadComplete?.();
    } catch (error) {
      toast.error('Erro ao fazer upload dos arquivos');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Documentos</CardTitle>
        <CardDescription>
          Envie documentos do paciente (PDF, JPG, PNG, DOCX - máx 10MB cada)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Selecionar Arquivos</Label>
          <Input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Arquivos selecionados ({files.length}):</p>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Enviando...' : `Enviar ${files.length} arquivo(s)`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

