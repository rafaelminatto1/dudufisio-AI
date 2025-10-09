# 🚀 GUIA RÁPIDO - GOOGLE BANANA (IMAGEN 3)

## ⚡ **COMEÇE EM 3 PASSOS**

### **1️⃣ Acesse a Página**
```
http://localhost:5176/image-generation
```

### **2️⃣ Escolha o Tipo de Imagem**
- 🏋️ **Exercício** - Para biblioteca de exercícios
- 📋 **Protocolo** - Para protocolos clínicos
- 🦴 **Anatomia** - Para diagramas anatômicos
- 📚 **Educacional** - Para material educativo
- ✨ **Custom** - Prompt personalizado

### **3️⃣ Gere e Use**
1. Preencha os campos
2. Clique em "Gerar"
3. Copie o prompt otimizado
4. Use no [Google AI Studio](https://aistudio.google.com)

---

## 💡 **EXEMPLOS RÁPIDOS**

### **Exemplo 1: Imagem de Exercício**
```
Nome: Agachamento
Parte do Corpo: Membros inferiores
Dificuldade: Intermediário

→ Gerar → Copiar Prompt → Usar no AI Studio
```

### **Exemplo 2: Diagrama Anatômico**
```
Parte do Corpo: Joelho
Vista: Vista anterior
☑️ Incluir anotações

→ Gerar → Copiar Prompt → Usar no AI Studio
```

### **Exemplo 3: Material Educacional**
```
Tópico: Prevenção de Quedas em Idosos
Público: Pacientes e cuidadores

→ Gerar → Copiar Prompt → Usar no AI Studio
```

---

## 🎯 **DICAS RÁPIDAS**

### ✅ **Faça**
- Use nomes descritivos
- Especifique a dificuldade
- Indique o público-alvo
- Copie e salve os prompts

### ❌ **Evite**
- Prompts genéricos
- Falta de contexto
- Termos ambíguos

---

## 🔧 **USO PROGRAMÁTICO**

```typescript
import { imagenService } from './services/ai/imagenService';

// Gerar imagem
const image = await imagenService.generateImageObject('exercise', {
  name: 'Ponte de Glúteos',
  bodyPart: 'Glúteos',
  difficulty: 'Iniciante'
});

// Usar prompt
console.log(image.prompt);
```

---

## 📊 **RECURSOS**

### **Presets Disponíveis**
- Esportiva (dinâmico, atlético)
- Pós-Operatória (profissional, cuidadoso)
- Gerontológica (acolhedor, respeitoso)
- Anatomia (preciso, educacional)

### **Formatos de Exportação**
- Cópia direta (Ctrl+C)
- Export JSON (prompt + metadata)
- Preview SVG (placeholder)

---

## 🎨 **API KEY**

**Configurada**: `AIzaSyDc5vZXFRAlU18dl1Bk9K2NT-BS8GmuLtM`

Localização: `services/ai/imagenService.ts:11`

---

## 🌐 **LINKS ÚTEIS**

- **Página Demo**: `http://localhost:5176/image-generation`
- **AI Studio**: `https://aistudio.google.com`
- **Documentação**: `🎨_GOOGLE_BANANA_IMAGEN3.md`

---

## ✅ **STATUS**

- ✅ Sistema funcionando
- ✅ Prompts otimizados
- ✅ Placeholders ativos
- ✅ Pronto para Imagen 3

**Comece agora!** 🚀
