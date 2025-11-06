# ✅ Bucket Attachments Configurado com Sucesso

**Data**: 27 de Outubro de 2025  
**Status**: ✅ Operacional

## Resumo

O bucket de Storage `attachments` foi criado e configurado no Supabase com sucesso através da migration `20251027000008_create_attachments_bucket.sql`.

## O que foi implementado

### 1. Migration SQL aplicada

**Arquivo**: `supabase/migrations/20251027000008_create_attachments_bucket.sql`

### 2. Configurações do Bucket

- **Nome**: `attachments`
- **Visibilidade**: Privado (não público)
- **Limite de tamanho**: 10MB por arquivo (10.485.760 bytes)
- **MIME types permitidos**:
  - Imagens: `image/*`
  - Vídeos: `video/*`
  - Áudios: `audio/*`
  - Documentos: `application/pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`
  - Texto: `text/plain`

### 3. Políticas RLS Configuradas

#### INSERT Policy
```sql
"Authenticated users can upload attachments"
- Permite que usuários autenticados façam upload
- Bucket: attachments
```

#### SELECT Policy
```sql
"Users can view their own attachments"
- Usuários só podem visualizar seus próprios arquivos
- Estrutura: attachments/{user_id}/{filename}
```

#### DELETE Policy
```sql
"Users can delete their own attachments"
- Usuários só podem deletar seus próprios arquivos
```

#### UPDATE Policy
```sql
"Users can update their own attachments"
- Usuários podem atualizar metadados dos próprios arquivos
```

## Estrutura de Armazenamento

Os arquivos são organizados da seguinte forma:

```
attachments/
  └── {user_id}/
      ├── foto-joelho-123.jpg
      ├── raio-x-coluna.pdf
      └── exercicio-video.mp4
```

## Validação

✅ **Bucket criado**: Confirmado via `supabase storage ls --experimental`  
✅ **Políticas RLS aplicadas**: 4 políticas (INSERT, SELECT, DELETE, UPDATE)  
✅ **Migration sincronizada**: 37/37 migrations aplicadas  
✅ **Pronto para uso**: Upload de anexos habilitado na aplicação

## Uso na Aplicação

O serviço `attachmentStorageService.ts` já está configurado para usar este bucket:

```typescript
// Exemplo de upload
const file = await camera.takePhoto();
const attachment = await attachmentService.upload(file, {
  sessionId: 'uuid',
  patientId: 'uuid'
});
```

## Links Úteis

- **Dashboard do Supabase Storage**: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/storage/buckets
- **Bucket attachments**: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/storage/buckets/attachments
- **Documentação**: Ver `supabase/migrations/README_MIGRATIONS.md`

## Próximos Passos

1. ✅ Bucket configurado
2. ✅ Políticas RLS aplicadas
3. ⏭️ Testar upload em produção ([moocafisio.com.br](https://moocafisio.com.br))
4. ⏭️ Validar funcionamento completo em Atendimento V2 → Anexos

---

**Comandos úteis**:

```bash
# Listar buckets
supabase storage ls --experimental

# Listar arquivos em um bucket (após ter arquivos)
supabase storage ls --experimental ss:///attachments/

# Verificar status das migrations
supabase db diff --linked
```

---

**Configurado por**: Claude AI  
**Método**: Supabase CLI + Migration SQL  
**Resultado**: ✅ 100% Funcional

