# VisareBR - Diretrizes, Arquitetura e Conhecimento do Sistema

Este documento serve como a **base de conhecimento e diretrizes arquiteturais centralizada** para assistentes de IA e desenvolvedores que atuam no repositório **VisareBR**. Todas as sessões de desenvolvimento devem consultar e respeitar as definições deste arquivo.

---

## 1. Visão Geral do Negócio (O que a aplicação faz)

A **VisareBR** é uma plataforma completa de consultoria, assessoria e suporte para solicitações de vistos consulares (com foco principal em Visto Americano B1/B2, mas expansível a outros vistos como Canadense, Europeu, etc.) e serviços correlatos.

### Principais Funcionalidades:
1. **Formulário Inteligente DS-160**:
   - Formulário interativo em 8 etapas para coleta detalhada de dados dos solicitantes.
   - Criptografia de ponta para dados sensíveis (número de passaporte criptografado via AES).
   - Visualizador administrativo dedicado (`Ds160Visualizer.tsx`) para revisão, validação e aprovação dos dados pela equipe consular.
2. **Sistema de Planos e Precificação Dinâmica**:
   - Planos escalonados com benefícios e prazos de processamento.
   - Faixas de preço (`PlanPricingTier`) com cálculo automático e descontos progressivos por quantidade de solicitantes.
   - Serviços avulsos (`StandaloneService`): preenchimento, antecipação de agendamento CASV/Consulado, passaportes, etc.
3. **Headless CMS & Blog Especializado**:
   - Sistema de artigos com blocos de conteúdo polimórficos (Texto, Imagens, Vídeos incorporados, Botões de chamada para ação e Recomendações automáticas de leitura).
   - Publicação direcionada: artigos podem ser configurados para alimentar dinamicamente os menus suspensos do Navbar (`ShowInVisaDropdown`, `ShowInOthersDropdown`).
   - Otimizações para SEO (MetaTitle, MetaDescription, Tags, Slug único e tempo estimado de leitura).
4. **Avaliações e Prova Social**:
   - Sistema de depoimentos e notas (1 a 5 estrelas) com moderação e aprovação administrativa prévia antes da publicação.
5. **Integração com YouTube e Mídias**:
   - Carrossel dinâmico de vídeos informativos com busca pelo canal oficial e suporte a vídeos em destaque personalizados.
6. **Painel Administrativo Completo (`AdminDashboard`)**:
   - Gestão de artigos e blocos de conteúdo.
   - Gestão de envios de formulários DS-160 e status de revisão.
   - Gerenciamento de planos, faixas de preço e serviços avulsos.
   - Moderação de avaliações, FAQs, carrosséis e configurações globais do site (WhatsApp, métricas da home, CNPJ, analytics).

---

## 2. Estrutura e Arquitetura da Solução

A solução é dividida em quatro projetos principais:

```
VisareBR/
├── VisareBR.Core/          # Camada de Domínio e Acesso a Dados
│   ├── Entities/           # Entidades do Domínio (Article, Plan, Ds160Submission, etc.)
│   ├── Events/             # Eventos de domínio (ex: ArticleEvents)
│   ├── Data/               # ApplicationDbContext, mapeamentos EF Core e ValueConverters
│   └── Migrations/         # Histórico de migrações do EF Core
├── VisareBR.Api/           # Camada de Apresentação Backend (Web API)
│   ├── Controllers/        # Endpoints REST (Blog, DS-160, Pricing, Services, etc.)
│   ├── Services/           # Serviços de infraestrutura e cache
│   └── Program.cs          # Setup da API, Identity, CORS, Npgsql e Middleware
├── VisareBR.Web/           # Frontend Single Page Application (SPA)
│   ├── src/
│   │   ├── api/            # Clientes HTTP e serviços de comunicação com a API
│   │   ├── components/     # Componentes reutilizáveis (BlockRenderer, Navbar, etc.)
│   │   ├── layouts/        # Layouts principais (MainLayout, AdminLayout)
│   │   ├── pages/          # Páginas da aplicação (Home, DS-160, Blog, Pricing, etc.)
│   │   └── utils/          # Funções utilitárias e helpers
│   └── package.json        # Dependências React, TypeScript, Tailwind
└── VisareBR.Tests/         # Testes unitários e de integração (xUnit)
```

---

## 3. Tecnologias e Dependências

### Backend (.NET 8 / C#)
- **Framework**: ASP.NET Core Web API (.NET 8).
- **Banco de Dados**: PostgreSQL com **Npgsql.EntityFrameworkCore.PostgreSQL**.
- **Autenticação**: ASP.NET Core Identity API Endpoints (`/api/identity/*`) com usuário customizado `ApplicationUser`.
- **Cache**: `IMemoryCache` integrado com eventos de domínio para invalidação reativa.
- **Documentação**: Swagger / OpenAPI (`Swashbuckle.AspNetCore`).
- **Deploy**: Otimizado para PostgreSQL hospedado (como Render), com parsing automático de `DATABASE_URL` no `Program.cs`.

### Frontend (React + TypeScript)
- **Tooling**: Vite + TypeScript.
- **Estilização**: Tailwind CSS com design moderno, responsivo e paleta profissional.
- **Ícones**: `lucide-react`.
- **Roteamento**: `react-router-dom`.
- **Consumo de API**: Fetch / Axios com tipagem estrita via interfaces TypeScript.

### Testes
- **Framework**: xUnit.
- **Asserções & Mocks**: Testes unitários para regras de domínio, geradores de slug, parsers de vídeo e listeners de eventos.

---

## 4. Técnicas e Padrões de Programação Utilizados

### 4.1. Domain-Driven Design & Separação Limpa
- **`VisareBR.Core`** concentra a verdade sobre os dados e regras de negócio, sem acoplamento direto com a interface HTTP.
- **`VisareBR.Api`** atua como adaptador HTTP e orquestrador de injeção de dependências.

### 4.2. Criptografia Transparente no EF Core (PII / Dados Sensíveis)
- O número de passaporte dos solicitantes (`Ds160Submission.PassportNumber`) é protegido por criptografia simétrica **AES-256** diretamente no mapeamento do EF Core via `ValueConverter`.
- Os dados são salvos cifrados no PostgreSQL e decifrados automaticamente em memória ao carregar a entidade.

### 4.3. Modelo Híbrido Relacional + Documento (JSONB no PostgreSQL)
- O formulário complexo do DS-160 (com 8 etapas altamente variáveis) é persistido na coluna `JsonData` tipada como `jsonb`.
- Isso evita dezenas de tabelas relacionais artificiais, mantendo buscas e metadados rápidos nas colunas indexadas (`ApplicantName`, `Email`, `CreatedAt`, `IsReviewed`).

### 4.4. Blocos Polimórficos no Headless CMS
- Os artigos utilizam a classe abstrata `ArticleBlock` com discriminação de tipos via `System.Text.Json` (`[JsonPolymorphic]` / `[JsonDerivedType]`).
- Os tipos derivados suportados são:
  - `TextBlock` (Markdown / Rich Text)
  - `ImageBlock` (URL e texto alternativo)
  - `VideoBlock` (URLs de embed e dados adicionais)
  - `ButtonBlock` (Botões de CTA customizados com cores hexadecimais)
  - `RecommendationBlock` (Lista de IDs de artigos recomendados)
- No frontend, o componente `BlockRenderer.tsx` cuida da renderização de cada bloco de forma desacoplada.

### 4.5. Event-Driven Cache Invalidation
- O `BlogController` despacha eventos via `IArticleEventDispatcher` (`ArticlePublishedOrUpdatedEvent`).
- O serviço `ArticleCacheInvalidator` escuta esses eventos e limpa as chaves relevantes do `IMemoryCache`, garantindo leituras ultra-rápidas sem dados obsoletos.

### 4.6. Precificação Flexível em Camadas (`Tiered Pricing`)
- Os planos possuem `ICollection<PlanPricingTier>`, permitindo que a administração defina preços baseados na quantidade exata de pessoas por processo familiar/grupo, sem fórmulas rígidas no código.

---

## 5. Convenções e Boas Práticas para Desenvolvimento

Ao propor ou implementar novos códigos no projeto, siga rigorosamente as seguintes diretrizes:

### Para o Backend (C# / .NET):
1. **Nomenclatura**:
   - Classes, métodos, propriedades e DTOs em `PascalCase`.
   - Campos privados em `_camelCase`.
2. **Tratamento Assíncrono**:
   - Sempre utilize métodos assíncronos (`async`/`await`) para operações de I/O e banco (`ToListAsync`, `SaveChangesAsync`, etc.).
3. **Injeção de Dependência**:
   - Registre novos serviços com escopos adequados (`Scoped` para repositórios e serviços de dados; `Singleton` ou `Transient` apenas quando justificado).
4. **Migrações do Banco de Dados**:
   - Ao alterar entidades no `VisareBR.Core`, gere a migration especificando o assembly da API:
     `dotnet ef migrations add <NomeDaMigration> --project VisareBR.Core --startup-project VisareBR.Api`

### Para o Frontend (React / TypeScript):
1. **Tipagem Estrita**:
   - Evite `any`. Declare interfaces explícitas para respostas de APIs e props de componentes.
2. **Componentização e Reusabilidade**:
   - Mantenha componentes focados em uma única responsabilidade.
   - Extraia lógicas complexas de formulários e estados para hooks customizados quando apropriado.
3. **Estilo e Acessibilidade**:
   - Utilize as classes utilitárias do Tailwind CSS.
   - Assegure contraste adequado, suporte responsivo para dispositivos móveis e tags semânticas de HTML.
4. **Comunicação com a API**:
   - Centralize chamadas HTTP na pasta `src/api/` em vez de disparar `fetch` soltos dentro dos componentes.

---

## 6. Comandos Úteis

- **Executar a API localmente**:
  ```bash
  dotnet run --project VisareBR.Api
  ```
- **Executar o Frontend localmente**:
  ```bash
  cd VisareBR.Web
  npm run dev
  ```
- **Executar Testes**:
  ```bash
  dotnet test
  ```
