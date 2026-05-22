Create a modern responsive **website UI design** (not a mobile app) for an internal IT Help Desk system with a real-time dashboard for the IT department.

The interface must look like a professional SaaS platform similar to Linear, Jira, Notion, Zendesk or Monday.com.

All UI text, labels, buttons, placeholders and content must be written in Portuguese (Brazil).

---

# GENERAL REQUIREMENTS

* Responsive web application
* Modern dashboard layout
* Minimalist and elegant interface
* White/light background
* Dark text
* Primary color: blue
* Rounded corners everywhere
* Smooth shadows
* Modern sans-serif typography
* Spacious layout with 16px–24px spacing
* Use cards, tables and dashboard widgets
* Real-time visual feeling
* Design for desktop first (1440px width)
* Show all pages in a single Figma canvas organized left to right

---

# WEBSITE STRUCTURE

The system has two main areas:

1. Employee Portal
2. IT Admin Dashboard

---

# EMPLOYEE PORTAL

---

## PAGE 1 — Home / Open Ticket

### Layout

* Left sidebar with logo and navigation
* Main content centered

### Header

* Logo + app name:
  "Help Desk"
* Subtitle:
  "Reporte um problema ao TI"

---

## Ticket Form Card

Large centered card with sections.

---

### Section — Informações do Funcionário

Fields:

* Nome completo
* Email corporativo
* Departamento

Department selector as modern selectable cards:

* Financeiro
* RH
* TI
* Comercial
* Jurídico
* Operações
* Diretoria
* Outro

When “Outro” is selected:
show text input:
"Qual é o seu departamento?"

---

### Section — Localização

Two large selectable buttons:

* 5º Andar
* 6º Andar

---

### Section — Qual a urgência?

Four modern priority cards with colored left border:

🟢 Baixa
"Não impede o trabalho"

🟡 Média
"Dificulta mas consigo continuar"

🟠 Alta
"Estou com dificuldade séria"

🔴 Crítica
"Não consigo trabalhar"

Selected card should have:

* blue outline
* soft background highlight
* check icon

---

### Section — Área do Problema

Grid buttons:

* Computador
* Rede
* Impressora
* Acesso/Senha
* Telefone
* Outro

When “Outro” is selected:
show input:
"Descreva brevemente a área do problema"

---

### Section — Detalhes

Dynamic buttons based on previous selection.

Example for “Computador”:

* Não liga
* Está lento
* Tela azul
* Sem som
* Periférico com problema
* Outro

If “Outro”:
show textarea:
"Descreva o que está acontecendo"

---

### Section — Desde quando?

Selectable buttons:

* Agora mesmo
* Hoje
* Ontem
* Há alguns dias
* Outro

If “Outro”:
show input:
"Quando o problema começou?"

---

### Section — Impacto

Buttons:

* Só eu
* Minha equipe
* Não sei

---

### Additional Notes

Textarea:
"Observações adicionais (opcional)"

---

### Upload Area

Drag-and-drop attachment zone:

* screenshots
* photos
* documents

Placeholder:
"Arraste arquivos aqui ou clique para anexar"

---

### Primary CTA

Large sticky bottom button:
"Abrir chamado"

---

# PAGE 2 — Ticket Confirmation

Centered success state.

Large animated success icon.

Title:
"Chamado aberto com sucesso!"

Display generated ticket number:
#00142

Message:
"A equipe de TI foi notificada e em breve entrará em contato."

Buttons:

* Ver meu chamado
* Abrir novo chamado

---

# PAGE 3 — Employee Ticket Tracking

Modern ticket tracking interface.

---

## Header

Title:
"Meus Chamados"

Search bar:
"Buscar chamado"

---

## Ticket List

Modern cards showing:

* número do chamado
* status
* prioridade
* categoria
* data
* técnico responsável
* última atualização

Status badges:

* Aberto
* Em andamento
* Aguardando
* Resolvido

---

## Ticket Detail Drawer

When a ticket is clicked:
open side panel with:

* Histórico completo
* Mensagens da TI
* Uploads
* Timeline
* Botão:
  "Confirmar resolução"

---

# PAGE 4 — Resolution Confirmation

Title:
"O seu problema foi resolvido?"

Two large buttons:

* Sim, pode fechar
* Não, o problema continua

If negative:
show textarea:
"O que ainda está acontecendo?"

---

# PAGE 5 — Rating

Centered feedback card.

Title:
"Como foi o atendimento?"

Large interactive 5-star rating.

Comment field:
"Deixe um comentário (opcional)"

Button:
"Enviar avaliação"

---

# IT ADMIN DASHBOARD

This should look like a professional real-time operations center.

---

# PAGE 6 — IT Dashboard

---

## Top Header

Left:

* "Painel de TI"

Right:

* green live indicator:
  ● Ao vivo
* technician avatar
* notifications icon

---

## Top Metrics Row

Four large metric cards:

### Card 1

Abertos

### Card 2

Em andamento

### Card 3

Resolvidos hoje

### Card 4

Críticos

Each card includes:

* icon
* number
* trend indicator
* subtle chart

---

## Main Layout

### Left Side

Real-time ticket management

### Right Side

Infrastructure monitoring widgets

---

# Ticket Management Area

---

## Filter Tabs

* Todos
* Abertos
* Em andamento
* Aguardando
* Resolvidos

---

## Real-Time Ticket Table

Modern table/cards hybrid.

Each ticket row contains:

* Ticket ID
* Nome do funcionário
* Departamento
* Andar
* Categoria
* Prioridade colorida
* Status badge
* Tempo desde abertura
* Técnico responsável

New tickets animate into the top of the list.

Critical tickets:

* red glow
* pulse animation

---

## Kanban View Toggle

Button to switch between:

* Lista
* Kanban

---

## Kanban Columns

* Novo
* Em andamento
* Aguardando
* Resolvido

Cards draggable between columns.

---

# Infrastructure Monitoring Panel

Right-side dashboard widgets:

---

## Widget — Impressoras

Show printer cards:

* Online
* Offline
* Sem papel
* Pouca tinta

---

## Widget — Rede

Display:

* Internet status
* Ping
* Switches
* Wi-Fi

---

## Widget — SLA

Show:

* tickets atrasados
* tempo médio
* atendimentos hoje

---

# PAGE 7 — Ticket Detail (IT View)

Professional admin detail page.

---

## Header

Back button + ticket number

Example:
#00142

---

## Employee Information Card

* Nome
* Departamento
* Andar
* Contato

---

## Problem Summary Card

Generated summary from selections:

* área
* detalhe
* urgência
* impacto
* desde quando

---

## Timeline / Histórico

Vertical timeline:

* Ticket criado
* Técnico assumiu
* Mensagem enviada
* Status alterado
* Resolvido

---

## Internal Communication Area

Modern chat interface between TI and employee.

---

## Internal Notes

Textarea:
"Notas internas (visível apenas para o TI)"

---

## Action Buttons

Primary:

* Assumir chamado

Secondary:

* Alterar status
* Escalar chamado
* Enviar mensagem
* Encerrar chamado

---

# DESIGN REFERENCES

Visual inspiration:

* Linear
* Jira Service Management
* Zendesk
* Notion
* Monday.com

The final result should feel like:

* modern SaaS platform
* enterprise operations dashboard
* elegant and highly usable
* real-time monitoring center
* premium corporate UI/UX
