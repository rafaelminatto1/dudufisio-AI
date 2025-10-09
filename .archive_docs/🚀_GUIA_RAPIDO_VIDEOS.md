# 🚀 GUIA RÁPIDO - SISTEMA DE VÍDEOS SORA 2

## ⚡ **COMEÇE EM 3 PASSOS**

### **1️⃣ Acesse**
```
http://localhost:5176/video-generation
```

### **2️⃣ Gere Vídeo**
1. Aba "Gerar Vídeo"
2. Escolha tipo + modalidade
3. Configure parâmetros
4. Clique "Gerar Vídeo com Sora 2"

### **3️⃣ Use**
- Copie o prompt
- Salve na biblioteca
- Vincule a exercícios

---

## 🥋 **8 MODALIDADES**

1. **Jiu-Jitsu** - Técnicas de solo, passagens
2. **Muay Thai** - Golpes, combinações
3. **CrossFit** - WODs, alta intensidade
4. **Yoga** - Asanas, flows
5. **Pilates** - Reformer, mat
6. **Natação** - Técnicas de nado
7. **Corrida** - Técnica, intervalos
8. **Funcional** - TRX, kettlebell

---

## 🎬 **4 TIPOS DE VÍDEO**

- **Exercício** - Individual, demonstração
- **Técnica** - Artes marciais, golpes
- **Série** - Sequência de exercícios
- **Demonstração** - Personalizado

---

## 💡 **EXEMPLO RÁPIDO**

```typescript
// Gerar vídeo de Jiu-Jitsu
const video = await soraService.generateVideoObject('technique', {
  technique: 'Passagem de Guarda',
  modality: 'jiujitsu',
  position: 'Guarda Fechada',
  demonstration: 'pair'
});

// Salvar na biblioteca
await videoLibraryService.createVideo({
  ...video,
  linkedExercises: ['exercise-001'],
  difficulty: 'intermediate'
});
```

---

## 📊 **FUNCIONALIDADES**

### **CRUD Completo**
- ✅ Create, Read, Update, Delete
- ✅ Vincular a exercícios
- ✅ Filtros avançados
- ✅ Likes, views, downloads

### **Biblioteca**
- ✅ Grid/List view
- ✅ Filtros por modalidade
- ✅ Ordenação múltipla
- ✅ Busca por texto

### **Modalidades**
- ✅ 8 esportes diferentes
- ✅ Configurações específicas
- ✅ Templates pré-prontos
- ✅ Cores e equipamentos

---

## 🎯 **CASOS DE USO**

### **Para Jiu-Jitsu**
```
Tipo: Técnica
Modalidade: jiujitsu
Técnica: Triângulo de Braço
Posição: Guarda Fechada
Demonstração: Par (2 atletas)
```

### **Para CrossFit**
```
Tipo: Série
Modalidade: crossfit
Exercícios: Burpee, Box Jump, Pull-up
Duração: 20s
Estilo: Dinâmico
```

### **Para Yoga**
```
Tipo: Série
Modalidade: yoga
Exercícios: Sun Salutation A
Duração: 20s
Estilo: Calmo, fluido
```

---

## 🔧 **CONFIGURAÇÕES**

- **Duração**: 5s, 10s, 20s
- **Proporção**: 16:9, 9:16, 1:1
- **Resolução**: 720p, 1080p, 4K
- **FPS**: 24, 30, 60
- **Estilo**: Realistic, Cinematic
- **Câmera**: Static, Tracking, Orbit

---

## ✅ **CHECKLIST**

- [ ] Acessar `/video-generation`
- [ ] Escolher modalidade
- [ ] Configurar vídeo
- [ ] Gerar com Sora 2
- [ ] Copiar prompt
- [ ] Salvar na biblioteca
- [ ] Vincular a exercícios

---

## 🌐 **LINKS**

- **Página**: `http://localhost:5176/video-generation`
- **Docs Completa**: `🎬_SORA2_VIDEO_SYSTEM.md`
- **Código**: `services/ai/soraService.ts`

---

**Pronto para criar vídeos incríveis!** 🎬✨
