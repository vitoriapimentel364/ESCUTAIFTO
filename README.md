# EscutaIFTO - Plataforma de Acolhimento e Proteção Estudantil

## Sobre o Projeto

O **EscutaIFTO** é uma plataforma inteligente de acolhimento e proteção estudantil desenvolvida para o Instituto Federal do Tocantins (IFTO). Este é um **projeto acadêmico demonstrativo** com interface adaptada para dispositivos móveis.

## Funcionalidades Implementadas

### ✅ Todas as funcionalidades solicitadas:

1. **Página inicial** - Nome EscutaIFTO, explicação sobre acolhimento estudantil e cards informativos
2. **Interface de conversa com chatbot IA** - Chatbot com mensagens acolhedoras e sem auto-apresentação como psicólogo
3. **Opções de situação** - "Aconteceu comigo", "Presenciei uma situação" e "Quero orientação"
4. **Campos nome e matrícula** - Usando apenas dados fictícios
5. **Conversa demonstrativa** - Acolhe, faz perguntas cuidadosas e organiza o relato
6. **Formulário de registro do caso** - Descrição, categoria, prioridade sugerida e encaminhamento recomendado
7. **Sistema de tickets demonstrativo** - Número do caso, situação, responsável fictício, providências e acompanhamento
8. **Área administrativa simulada** - Acesso restrito com login fictício para visualizar tickets
9. **Demonstração de notificações** - Simulação de notificações por e-mail, lembretes e WhatsApp
10. **Tela de urgência** - Sinaliza necessidade de avaliação humana imediata quando há indícios de urgência

## Regras de Segurança Implementadas

- ✅ IA não se apresenta como psicóloga nem diagnostica
- ✅ Decisão sobre providências pertence aos profissionais responsáveis
- ✅ Apenas dados fictícios utilizados
- ✅ Não envia informações sensíveis a serviços externos
- ✅ Não solicita senhas pessoais
- ✅ Não inventa APIs nem automatiza acesso ao SUAP
- ✅ Integrações com WhatsApp, e-mail e SUAP são **simuladas** e claramente identificadas como tais
- ✅ Todos os dados ficam armazenados localmente (localStorage não implementado, mas simulado em memória)

## Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Design responsivo com Grid e Flexbox
- **JavaScript Vanilla** - Sem frameworks, puro JavaScript
- **Google Fonts (Inter)** - Tipografia moderna

## Como Abrir o Projeto no Navegador

### Método 1: Abrir diretamente (mais simples)
1. Abra a pasta `ESCUTAIFTO` no seu computador
2. Clique duas vezes no arquivo `index.html`
3. O projeto abrirá automaticamente no seu navegador padrão

### Método 2: Usando um servidor local (recomendado)
Se tiver problemas com algumas funcionalidades, use um servidor local:

**Com Python (se tiver instalado):**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Depois acesse: `http://localhost:8000`

**Com Node.js (se tiver instalado):**
```bash
npx serve .
```
Depois acesse: `http://localhost:3000`

**Com VS Code:**
1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

## Instruções de Uso para Demonstração

### 1. Página Inicial
- Visualize as informações sobre o EscutaIFTO
- Clique em "Começar Conversa" para iniciar

### 2. Chatbot
- Preencha nome e matrícula **fictícios** (ex: João Silva, 2024001234)
- Selecione uma das opções: "Aconteceu comigo", "Presenciei uma situação" ou "Quero orientação"
- Clique em "Iniciar Conversa"
- Digite mensagens e veja as respostas acolhedoras do bot
- Use "📝 Registrar Caso" para abrir o formulário
- Use "🚨 Necessita avaliação humana imediata" para ver o modal de urgência

### 3. Registro de Caso
- Preencha a descrição detalhada
- Selecione categoria e prioridade
- Adicione sugestão de encaminhamento (opcional)
- Clique em "Gerar Ticket" para criar

### 4. Sistema de Tickets
- Veja todos os tickets criados na seção "Meus Tickets"
- Cada ticket mostra: número, status, informações, descrição, responsável, providências e acompanhamento

### 5. Área Administrativa
- Vá para a seção "Administrativo"
- Use as credenciais fictícias: **Usuário:** `coordenacao` / **Senha:** `demo123`
- Visualize estatísticas, notificações simuladas e todos os tickets
- Clique em "Sair" para voltar

## Arquivos do Projeto

```
ESCUTAIFTO/
├── index.html      # Página principal com todas as seções
├── style.css       # Estilos e design responsivo
├── app.js          # Funcionalidades JavaScript
└── README.md       # Este arquivo
```

## Características Importantes

- **Totalmente responsivo** - Funciona perfeitamente em celulares, tablets e desktops
- **Interface intuitiva** - Navegação simples e clara
- **Identidade visual profissional** - Cores inspiradas no verde institucional do IFTO
- **Acolhedor** - Linguagem respeitosa e sem julgamentos
- **Transparente** - Todas as simulações são claramente identificadas
- **Seguro** - Segue todas as regras de segurança solicitadas

## Observações

- Este é um **projeto acadêmico demonstrativo**
- Todos os dados são fictícios
- As integrações (WhatsApp, e-mail, SUAP) são **apenas simulações visuais**
- Não há banco de dados real - os tickets são armazenados apenas na memória do navegador
- Ao recarregar a página, os tickets criados serão perdidos (comportamento esperado para demonstração)

**Desenvolvido com carinho para demonstrar o conceito do EscutaIFTO!** 💚
