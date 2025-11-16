# 🧭 Estrutura Completa do Menu de Navegação - DuduFisio AI

**Última Atualização:** 15 de outubro de 2025
**Arquivo Fonte:** `/workspace/components/Sidebar.tsx`

---

## 📋 Visão Geral

O sistema DuduFisio possui um menu lateral (sidebar) dinâmico que se adapta ao perfil (role) do usuário autenticado. Cada perfil tem acesso a diferentes funcionalidades do sistema.

---

## 👑 Perfil: Administrador (Role.Admin)

### 🏠 PRINCIPAL
| Rota | Ícone | Label | Badge |
|------|-------|-------|-------|
| `/dashboard` | LayoutGrid | Dashboard Geral | - |
| `/admin-dashboard` | BarChart3 | Dashboard Administrativo | - |
| `/notifications` | Bell | Notificações | Contador de não lidas |
| `/tasks` | ClipboardList | Quadro de Tarefas | - |

### 🩺 CLÍNICO
| Rota | Ícone | Label |
|------|-------|-------|
| `/patients` | Users | Pacientes |
| `/agenda` | Calendar | Agenda |
| `/acompanhamento` | Activity | Acompanhamento |
| `/session-evolution` | TrendingUp | Evolução de Sessões |
| `/teleconsulta` | Activity | Teleconsulta |
| `/exercises` | Dumbbell | Exercícios |
| `/exercise-library` | Library | Biblioteca de Exercícios |
| `/free-video-generator` | Film | Gerador Gemini Veo |
| `/protocols` | FileText | Protocolos Clínicos |
| `/specialty-assessments` | Search | Avaliações Especializadas |
| `/clinical-library` | Archive | Biblioteca Clínica |
| `/materials` | BookMarked | Materiais Clínicos |
| `/mentoria` | BrainCircuit | Sistema de Mentoria |
| `/knowledge-base` | Library | Base de Conhecimento |

### 📊 ANALYTICS & BI
| Rota | Ícone | Label |
|------|-------|-------|
| `/reports/consolidated` | BarChart3 | Dashboard de Relatórios |
| `/clinical-analytics` | PieChart | Analytics Clínicos |
| `/ai-analytics` | BrainCircuit | Analytics de IA |
| `/financials` | DollarSign | Gestão Financeira |

### 🤖 FERRAMENTAS IA
| Rota | Ícone | Label |
|------|-------|-------|
| `/ai-tools/consolidated` | BrainCircuit | Ferramentas IA |
| `/gerar-laudo` | FilePlus | Gerar Laudo |
| `/gerar-evolucao` | FileClock | Gerar Evolução |
| `/hep-generator` | Dumbbell | Gerar Plano (HEP) |
| `/risk-analysis` | AlertTriangle | Análise de Risco |
| `/ia-economica` | AreaChart | IA Econômica |

### 👥 GESTÃO
| Rota | Ícone | Label |
|------|-------|-------|
| `/user-management` | Users2 | Gestão de Usuários |
| `/groups` | Users2 | Grupos |
| `/inventory` | Package | Estoque/Insumos |
| `/inventory-dashboard` | Monitor | Dashboard de Estoque |
| `/events` | Ticket | Eventos |
| `/events-list` | Calendar | Lista de Eventos |
| `/partnerships` | Handshake | Parcerias |
| `/subscriptions` | CreditCard | Assinaturas |

### ⚙️ SISTEMA
| Rota | Ícone | Label |
|------|-------|-------|
| `/crm` | Target | CRM & Leads |
| `/whatsapp` | MessageSquare | WhatsApp Business |
| `/email-inativos` | Mail | Email para Inativos |
| `/backup-management` | HardDrive | Gerenciamento de Backup |
| `/agenda-settings` | SlidersHorizontal | Config. Agenda |
| `/integrations` | ShieldCheck | Integrações |
| `/integrations-test` | Zap | Teste de Integrações |
| `/bi-integration-test` | Globe | Teste BI |
| `/ai-settings` | SlidersHorizontal | Config. IA |
| `/audit-log` | ShieldCheck | Auditoria & Compliance |
| `/audit-log-page` | FileCheck | Log de Auditoria |
| `/legal` | FileText | Legal |
| `/settings` | Cog | Configurações |

**Total de Itens:** 53 links

---

## 🩺 Perfil: Fisioterapeuta (Role.Therapist)

### 🏠 PRINCIPAL
| Rota | Ícone | Label | Badge |
|------|-------|-------|-------|
| `/dashboard` | LayoutGrid | Dashboard | - |
| `/therapist-dashboard` | Stethoscope | Dashboard Terapeuta | - |
| `/notifications` | Bell | Notificações | Contador |
| `/tasks` | ClipboardList | Tarefas | - |

### 🩺 CLÍNICO
| Rota | Ícone | Label |
|------|-------|-------|
| `/patients` | Users | Pacientes |
| `/agenda` | Calendar | Agenda |
| `/acompanhamento` | Activity | Acompanhamento |
| `/session-evolution` | TrendingUp | Evolução de Sessões |
| `/teleconsulta` | Activity | Teleconsulta |
| `/exercises` | Dumbbell | Exercícios |
| `/exercise-library` | Library | Biblioteca de Exercícios |
| `/free-video-generator` | Film | Gerador Gemini Veo |
| `/protocols` | FileText | Protocolos |
| `/specialty-assessments` | Search | Avaliações Especializadas |
| `/clinical-library` | Archive | Biblioteca Clínica |
| `/materials` | BookMarked | Materiais Clínicos |
| `/knowledge-base` | Library | Base de Conhecimento |

### 📊 ANALYTICS & BI
| Rota | Ícone | Label |
|------|-------|-------|
| `/clinical-analytics` | PieChart | Analytics Clínicos |
| `/my-performance` | BarChart3 | Minha Performance |
| `/reports` | FileText | Relatórios |
| `/medical-reports` | FileSpreadsheet | Relatórios Médicos |
| `/evaluation-reports` | FileCheck | Relatórios de Avaliação |

### 🤖 FERRAMENTAS IA
| Rota | Ícone | Label |
|------|-------|-------|
| `/gerar-laudo` | FilePlus | Gerar Laudo |
| `/gerar-evolucao` | FileClock | Gerar Evolução |
| `/hep-generator` | Dumbbell | Gerar Plano (HEP) |
| `/risk-analysis` | AlertTriangle | Análise de Risco |

### ⚙️ SISTEMA
| Rota | Ícone | Label |
|------|-------|-------|
| `/settings` | Cog | Configurações |

**Total de Itens:** 27 links

---

## 👤 Perfil: Paciente (Role.Patient)

### 🏠 PRINCIPAL
| Rota | Ícone | Label | Badge |
|------|-------|-------|-------|
| `/patient-portal` | LayoutGrid | Meu Portal | - |
| `/my-appointments` | Calendar | Meus Agendamentos | - |
| `/my-treatments` | Activity | Meus Tratamentos | - |
| `/notifications` | Bell | Notificações | Contador |

### 📊 ANALYTICS & BI
| Rota | Ícone | Label |
|------|-------|-------|
| `/my-progress` | TrendingUp | Meu Progresso |

### 👥 GESTÃO
| Rota | Ícone | Label |
|------|-------|-------|
| `/my-exercises` | Dumbbell | Meus Exercícios |
| `/teleconsulta` | Activity | Teleconsulta |
| `/settings` | Cog | Configurações |

**Total de Itens:** 8 links

---

## 🏃 Perfil: Educador Físico (Role.EducadorFisico)

### 🏠 PRINCIPAL
| Rota | Ícone | Label | Badge |
|------|-------|-------|-------|
| `/dashboard` | LayoutGrid | Dashboard | - |
| `/partner-dashboard` | Stethoscope | Dashboard Parceiro | - |
| `/notifications` | Bell | Notificações | Contador |

### 🩺 CLÍNICO
| Rota | Ícone | Label |
|------|-------|-------|
| `/exercise-library` | Library | Biblioteca de Exercícios |
| `/materials` | BookMarked | Materiais Educativos |
| `/clinical-library` | Archive | Biblioteca Clínica |
| `/knowledge-base` | Library | Base de Conhecimento |

### 📊 ANALYTICS & BI
| Rota | Ícone | Label |
|------|-------|-------|
| `/exercise-analytics` | BarChart3 | Analytics de Exercícios |
| `/reports` | FileText | Relatórios |

### 🤖 FERRAMENTAS IA
| Rota | Ícone | Label |
|------|-------|-------|
| `/hep-generator` | Dumbbell | Gerar Plano (HEP) |

### 👥 GESTÃO
| Rota | Ícone | Label |
|------|-------|-------|
| `/partnerships` | Handshake | Parcerias |
| `/events` | Ticket | Eventos/Workshops |
| `/events-list` | Calendar | Lista de Eventos |

### ⚙️ SISTEMA
| Rota | Ícone | Label |
|------|-------|-------|
| `/settings` | Cog | Configurações |

**Total de Itens:** 14 links

---

## 🔍 Seletores para Testes Automatizados

### Seletor Genérico por Texto
```typescript
// Buscar link por texto visível
await page.click('a:has-text("Pacientes")');
await page.click('a:has-text("Agenda")');
await page.click('a:has-text("Acompanhamento")');
```

### Seletor por Rota
```typescript
// Buscar link pela rota href
await page.click('a[href="/patients"]');
await page.click('a[href="/agenda"]');
await page.click('a[href="/acompanhamento"]');
```

### Seletor por NavLink (React Router)
```typescript
// NavLink ativo tem classe específica
await page.locator('a.bg-sky-50.text-sky-600').click(); // Link ativo
await page.locator('a.text-slate-600').first().click(); // Link inativo
```

### Seletor por Data-TestID (Recomendado)
```typescript
// Adicionar data-testid nos NavLinks para melhor testabilidade
await page.click('[data-testid="nav-patients"]');
await page.click('[data-testid="nav-agenda"]');
```

---

## 🎨 Classes CSS Importantes

### Menu Colapsado vs Expandido
```css
/* Colapsado */
.w-14 /* Largura reduzida */

/* Expandido */
.w-56 /* Largura completa */
```

### Link Ativo
```css
.bg-sky-50.text-sky-600.font-semibold /* Link da página atual */
```

### Link Inativo
```css
.text-slate-600.hover:bg-slate-100 /* Link hover state */
```

---

## 📱 Comportamento Responsivo

O sidebar possui os seguintes estados:
- **Desktop:** Sempre visível, pode ser colapsado
- **Mobile:** Pode ser escondido/mostrado via botão hamburguer (se implementado)

---

## 🔔 Badges e Notificações

Alguns itens do menu possuem badges dinâmicos:

### Notificações
```typescript
{
  to: '/notifications',
  icon: Bell,
  label: 'Notificações',
  badgeCount: unreadCount // Número de notificações não lidas
}
```

O badge é exibido:
- **Menu expandido:** Número dentro de um círculo vermelho
- **Menu colapsado:** Ponto vermelho no canto superior direito do ícone

---

## 🎯 Funcionalidades do Menu

### 1. Busca no Menu (SidebarSearch)
O componente possui busca integrada que filtra os itens:
```typescript
<SidebarSearch
  isCollapsed={isCollapsed}
  onSearch={handleSearch}
  onClear={handleClearSearch}
  searchResults={searchNavigationItems(searchQuery)}
  onResultClick={handleResultClick}
/>
```

### 2. Colapsar/Expandir
Botão de toggle no header do sidebar:
```typescript
<button onClick={() => setIsCollapsed(!isCollapsed)}>
  {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
</button>
```

### 3. Perfil do Usuário
Seção no rodapé mostrando:
- Avatar do usuário
- Nome
- Role (com cor específica)
- Botão de logout
- Botão de notificações

---

## 🧪 Como Testar Cada Seção

### Teste de Navegação Completa
```typescript
// Fazer login
await page.goto('http://localhost:5175');
await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
await page.fill('[data-testid="login-password"]', 'demo123456');
await page.click('[data-testid="login-submit"]');

// Aguardar menu carregar
await page.waitForSelector('aside[data-testid="sidebar"]');

// Clicar em cada seção
await page.click('a:has-text("Pacientes")');
await page.waitForURL('**/patients');

await page.click('a:has-text("Agenda")');
await page.waitForURL('**/agenda');

// etc...
```

### Teste de Busca no Menu
```typescript
// Abrir busca
await page.click('[data-testid="sidebar-search"]');

// Digitar termo
await page.fill('[data-testid="sidebar-search-input"]', 'paciente');

// Clicar no resultado
await page.click('[data-testid="search-result-0"]');
```

---

## 📊 Matriz de Acesso por Role

| Funcionalidade | Admin | Therapist | Patient | Educador Físico |
|----------------|-------|-----------|---------|-----------------|
| Dashboard Geral | ✅ | ✅ | ❌ | ✅ |
| Dashboard Admin | ✅ | ❌ | ❌ | ❌ |
| Pacientes | ✅ | ✅ | ❌ | ❌ |
| Agenda | ✅ | ✅ | ❌ | ❌ |
| Acompanhamento | ✅ | ✅ | ❌ | ❌ |
| Exercícios | ✅ | ✅ | ✅ | ✅ |
| Financeiro | ✅ | ❌ | ❌ | ❌ |
| CRM | ✅ | ❌ | ❌ | ❌ |
| WhatsApp | ✅ | ❌ | ❌ | ❌ |
| Configurações | ✅ | ✅ | ✅ | ✅ |

---

## 🎓 Notas para Desenvolvedores

### Adicionar Novo Item ao Menu

1. Editar `/workspace/components/Sidebar.tsx`
2. Localizar função `getFilteredNavigation()`
3. Adicionar item na seção apropriada para cada role:

```typescript
case Role.Admin:
  return {
    clinicalNav: [
      // ... itens existentes
      { to: '/nova-funcionalidade', icon: NovoIcone, label: 'Nova Funcionalidade' },
    ]
  };
```

### Adicionar Data-TestID para Testes
Para melhor testabilidade, adicione data-testid:

```typescript
<NavLink
  to={to}
  data-testid={`nav-${to.replace('/', '')}`}
  // ... outras props
>
```

---

**Documentação mantida por:** Equipe de Desenvolvimento DuduFisio AI
**Próxima revisão:** Após adicionar novas funcionalidades ao menu
