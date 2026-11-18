# 🌐 BA Protege+ · Portal Web & Recuperação de Contraseña Firebase

Este módulo contém a **Landing Page Institucional** de BA Protege+ e a **Página Oficial de Recuperação de Senha (Firebase Auth Action Handler)** personalizada com a identidade visual do aplicativo (cores oficiais, tipografia Roboto, logotipo de BA Protege+ e expressões dinâmicas do mascote **Boti**).

---

## 📁 Estrutura do Módulo (`frontend/landing/`)

```text
frontend/landing/
├── index.html                           # Landing Page institucional responsive (Desktop & Mobile)
├── terminos-y-condiciones.html          # Página oficial de Términos y Condiciones (LOTBA S.E.)
├── politica-de-privacidad.html          # Página oficial de Política de Privacidad (Ley N° 25.326)
├── reset-password.html                  # Página de Recuperação de Senha modular (para Firebase Hosting)
├── firebase-reset-password-standalone.html # Versão 100% autossuficiente (single-file com CSS, JS e SVG embutidos)
├── _redirects                           # Configuração de rotas amigáveis para o Netlify
├── firebase.json                        # Configuração pronta para Firebase Hosting (com rewrite de /__/auth/action)
├── styles/
│   ├── main.css                         # Design System oficial (tokens de uikit.txt e layout responsive)
│   └── reset-password.css               # Estilos dedicados ao card de autenticação e medidor de senha
├── scripts/
│   ├── landing.js                       # FAQ interativo, denúncias de sites e navegação suave
│   └── reset-password.js                # Lógica de integração com Firebase REST API e reações de Boti
└── assets/
    ├── apk/
    │   └── ba-protege-release.apk       # Instalador APK oficial para download direto
    └── img/                             # Logos oficiais e expressões de Boti (feliz, pensando, nervoso, triste)
```

---

## 🔑 Como Usar / Colar no Firebase (3 Opções)

Quando o Firebase envia o e-mail de recuperação de senha, o link padrão gerado possui o formato:
`https://ba-protege-d304e.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=...&apiKey=...`

Você tem **3 formas práticas** de usar esta tela:

### Opção 1: Configurar a URL de Ação Customizada no Firebase Console (Recomendado)
1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Selecione o projeto **`ba-protege-d304e`**.
3. No menu lateral, vá em **Autenticação (Authentication)** > aba **Modelos (Templates)**.
4. Clique em **Redefinição de senha (Password reset)** e depois no ícone de **lápis (Editar)**.
5. Clique em **Personalizar URL de ação (Customize action URL)** no rodapé do modal.
6. Informe a URL onde você hospedou a página, por exemplo:
   - `https://ba-protege-d304e.web.app/reset-password.html` (ou seu domínio próprio).
7. Salve as alterações. Pronto! Todos os e-mails enviados pelo Firebase passarão a abrir a nova página com a cara do app.

### Opção 2: Deploy Direto no Firebase Hosting
O arquivo `firebase.json` já está preparado com os rewrites oficiais:
```bash
# Na pasta frontend/landing (ou na raiz com firebase CLI):
npx firebase-tools deploy --only hosting
```
Isso substitui o manipulador padrão `/__/auth/action` automaticamente pela página `reset-password.html` e serve a landing page em `/`.

### Opção 3: Uso do Arquivo Standalone (`firebase-reset-password-standalone.html`)
Se você precisa de um **único arquivo HTML independente** (sem pastas de imagens ou CSS externos) para colar em um serviço estático ou painel:
- Utilize o arquivo [`firebase-reset-password-standalone.html`](file:///C:/Projetos/baprotege+/frontend/landing/firebase-reset-password-standalone.html).
- Ele contém todo o CSS embutido, scripts autônomos e um mascote **Boti em SVG vetorial interativo** que altera suas expressões conforme o status da operação:
  - 🤖 **Boti Pensando/Neutro:** Durante o carregamento e validação do link.
  - 😊 **Boti Feliz:** Quando o link é válido ou a senha foi redefinida com sucesso.
  - 😟 **Boti Nervoso:** Se o formulário tiver erros ou senhas divergentes.
  - 😢 **Boti Triste:** Caso o link esteja expirado ou já tenha sido utilizado.

---

## ✉️ Modelo HTML de E-mail para o Firebase Console

O arquivo [`templates/email-password-reset.html`](file:///C:/Projetos/baprotege+/frontend/landing/templates/email-password-reset.html) foi projetado para substituir o e-mail em texto puro padrão do Firebase por uma mensagem institucional elegante com o estilo de **BA Protege+**:

### Como Colar no Firebase Console:
1. Acesse o **Firebase Console** > **Authentication** > aba **Templates (Modelos)**.
2. Clique no modelo **Restablecimiento de contraseña (Password reset)** e clique no **lápis (Editar)**.
3. No campo **Asunto (Subject)**, defina por exemplo: `Restablece tu contraseña de %APP_NAME%`.
4. No corpo da mensagem (**Message**), cole o conteúdo de `templates/email-password-reset.html`.
5. Os marcadores dinâmicos oficiais do Firebase (`%APP_NAME%`, `%EMAIL%`, `%LINK%`) serão substituídos automaticamente a cada envio.
6. Clique em **Guardar (Save)**.

---

## 🎨 Identidade Visual Aplicada
- **Primary:** `#007AFF` (Botões de ação principal, headers ativos).
- **Secondary / Sucesso:** `#28A745` (Indicadores de proteção ativa e confirmações).
- **Background:** `#F8F9FA` (Fundo neutro e cards suaves).
- **Textos:** `#1C1C1E` (Títulos principais) e `#6C757D` / `#8E8E93` (Subtítulos).
- **Mascote Boti:** Expressões emocionais semânticas conforme `src/utils/botMascots.ts`.
- **Badges Oficiais:** Governo da Ciudad de Buenos Aires e Lotería de la Ciudad (LOTBA).

---

## 🚀 Como Visualizar Localmente no Navegador

Para testar no seu computador:
1. Abra diretamente o arquivo `frontend/landing/index.html` ou `frontend/landing/reset-password.html` no seu navegador (Google Chrome, Edge, etc.).
2. Ou inicie um servidor local leve:
   ```bash
   npx serve frontend/landing
   ```
3. Para simular a recuperação de senha com parâmetros de teste:
   `http://localhost:3000/reset-password.html?mode=resetPassword&oobCode=CODIGO_TESTE`
