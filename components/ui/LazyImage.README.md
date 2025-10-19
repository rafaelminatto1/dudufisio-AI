# LazyImage - Componente de Imagem Otimizado

## 📝 Descrição

Componente de imagem otimizado com suporte a:
- ✅ Lazy loading (Intersection Observer)
- ✅ WebP com fallback automático
- ✅ Skeleton loader durante carregamento
- ✅ Tratamento de erro com placeholder
- ✅ Transições suaves

## 🚀 Uso Básico

### Imagem Simples
```tsx
import LazyImage from '@/components/ui/LazyImage';

<LazyImage
  src="/images/photo.jpg"
  alt="Descrição da imagem"
  className="w-full h-64 rounded-lg"
/>
```

### WebP com Fallback
```tsx
<LazyImage
  src="/images/photo.webp"
  fallback="/images/photo.jpg"
  alt="Descrição da imagem"
  className="w-full h-64 rounded-lg"
/>
```

## 📋 Props

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|------|------|-------------|--------|-----------|
| `src` | `string` | ✅ | - | URL da imagem (WebP recomendado) |
| `alt` | `string` | ✅ | - | Texto alternativo para acessibilidade |
| `className` | `string` | ❌ | `''` | Classes CSS adicionais |
| `fallback` | `string` | ❌ | - | URL da imagem fallback (JPG/PNG) |
| `placeholder` | `string` | ❌ | - | URL do placeholder customizado |
| `onLoad` | `() => void` | ❌ | - | Callback quando imagem carregar |
| `onError` | `() => void` | ❌ | - | Callback quando houver erro |

## 🎯 Exemplos de Uso

### 1. Avatar de Paciente
```tsx
<LazyImage
  src="/images/patients/patient-123.webp"
  fallback="/images/patients/patient-123.jpg"
  alt="Foto do paciente"
  className="w-16 h-16 rounded-full"
/>
```

### 2. Banner Principal
```tsx
<LazyImage
  src="/images/banner.webp"
  fallback="/images/banner.jpg"
  alt="Banner principal"
  className="w-full h-96 object-cover"
/>
```

### 3. Galeria de Imagens
```tsx
{images.map((img) => (
  <LazyImage
    key={img.id}
    src={img.webp}
    fallback={img.jpg}
    alt={img.alt}
    className="w-full h-64 rounded-lg"
  />
))}
```

### 4. Com Callbacks
```tsx
<LazyImage
  src="/images/photo.webp"
  fallback="/images/photo.jpg"
  alt="Descrição"
  onLoad={() => console.log('Carregado!')}
  onError={() => console.error('Erro!')}
  className="w-full h-64"
/>
```

## 🔄 Como Funciona

### 1. Lazy Loading
- Usa Intersection Observer para detectar quando a imagem entra no viewport
- Só carrega a imagem quando ela está visível
- Reduz carregamento inicial da página

### 2. WebP com Fallback
- Tenta carregar WebP primeiro (menor tamanho)
- Se falhar, carrega automaticamente o fallback (JPG/PNG)
- Suporta navegadores antigos

### 3. Skeleton Loader
- Mostra skeleton durante carregamento
- Melhor UX durante loading
- Transição suave para imagem real

### 4. Tratamento de Erro
- Se WebP falhar, tenta fallback
- Se fallback falhar, mostra placeholder de erro
- Console log para debugging

## 🎨 Estilos

### Tamanhos Comuns
```tsx
// Avatar pequeno
className="w-12 h-12 rounded-full"

// Avatar médio
className="w-16 h-16 rounded-full"

// Avatar grande
className="w-24 h-24 rounded-full"

// Card
className="w-full h-48 rounded-lg"

// Banner
className="w-full h-96 object-cover"
```

### Object Fit
```tsx
// Cobrir área (crop)
className="w-full h-64 object-cover"

// Conter área (sem crop)
className="w-full h-64 object-contain"

// Preencher área
className="w-full h-64 object-fill"
```

## 🚀 Otimização

### Converter Imagens para WebP
```bash
# Executar script de conversão
npm run convert:webp

# Script converte todas as imagens em public/images/
# Gera versões .webp mantendo originais como fallback
```

### Estrutura de Pastas Recomendada
```
public/
├── images/
│   ├── patients/
│   │   ├── patient-1.webp
│   │   ├── patient-1.jpg
│   │   ├── patient-2.webp
│   │   └── patient-2.jpg
│   ├── therapists/
│   │   ├── therapist-1.webp
│   │   └── therapist-1.jpg
│   └── banners/
│       ├── banner-1.webp
│       └── banner-1.jpg
```

## 📊 Benefícios

### Performance
- ✅ Redução de 25-35% no tamanho das imagens (WebP vs JPG)
- ✅ Lazy loading reduz carregamento inicial
- ✅ Skeleton loader melhora percepção de velocidade

### UX
- ✅ Loading suave com skeleton
- ✅ Transições suaves
- ✅ Fallback automático para compatibilidade

### Acessibilidade
- ✅ Alt text obrigatório
- ✅ Suporte a screen readers
- ✅ Loading states anunciados

## 🐛 Troubleshooting

### Imagem não carrega
```tsx
// Verificar caminho
<LazyImage
  src="/images/photo.webp"  // Caminho correto?
  fallback="/images/photo.jpg"  // Fallback existe?
  alt="Teste"
/>
```

### WebP não funciona em navegador antigo
```tsx
// Fallback será usado automaticamente
// Navegador antigo: carrega JPG
// Navegador moderno: carrega WebP
```

### Skeleton não aparece
```tsx
// Verificar se imagem está no viewport
// Skeleton só aparece antes do carregamento
```

## 📚 Recursos

- [WebP Support](https://caniuse.com/webp)
- [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Lazy Loading Images](https://web.dev/lazy-loading-images/)

---

**Versão:** 1.0  
**Última atualização:** 19 de Outubro de 2025

