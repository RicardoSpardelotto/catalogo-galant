# 📚 Documentação Completa - Catálogo de Peças Galant

## 🏗️ Arquitetura do Projeto

### Estrutura de Diretórios
```
/app
├── .env                          # Variáveis de ambiente
├── package.json                  # Dependências do projeto
├── next.config.js               # Configuração Next.js
├── tailwind.config.js           # Configuração Tailwind CSS
├── postcss.config.js            # Configuração PostCSS
├── jsconfig.json                # Configuração JavaScript
├── components.json              # Configuração shadcn/ui
│
├── app/                         # App Router (Next.js 14)
│   ├── globals.css             # Estilos globais
│   ├── layout.js               # Layout raiz
│   ├── page.js                 # Página inicial (catálogo público)
│   │
│   ├── pecas/
│   │   └── [id]/
│   │       └── page.js         # Página de detalhes da peça
│   │
│   ├── admin/
│   │   ├── page.js             # Dashboard administrativo
│   │   └── login/
│   │       └── page.js         # Página de login
│   │
│   └── api/
│       └── [[...path]]/
│           └── route.js        # API Backend (catch-all)
│
├── components/
│   └── ui/                     # Componentes shadcn/ui
│       ├── button.jsx
│       ├── input.jsx
│       ├── card.jsx
│       ├── dialog.jsx
│       ├── select.jsx
│       ├── tabs.jsx
│       ├── badge.jsx
│       ├── label.jsx
│       ├── textarea.jsx
│       └── ... (outros 30+ componentes)
│
├── hooks/
│   ├── use-mobile.jsx
│   └── use-toast.js
│
└── lib/
    └── utils.js                # Utilitários (cn function)
```

---

## 🗄️ Banco de Dados MongoDB

### Informações de Conexão
- **URL:** `mongodb://localhost:27017`
- **Database:** `your_database_name`
- **Coleções:** 5 (categorias, pecas, usuarios, links, fornecedores)

### 📊 Estrutura das Coleções

#### 1. **categorias**
```javascript
{
  "_id": ObjectId,           // ID MongoDB (gerado automaticamente)
  "id": String,              // UUID personalizado
  "nome": String,            // Nome da categoria
  "descricao": String        // Descrição opcional
}
```

**Exemplos:**
- Motor
- Suspensão
- Freios
- Elétrica
- Carroceria
- Transmissão
- Direção

---

#### 2. **pecas**
```javascript
{
  "_id": ObjectId,
  "id": String,                    // UUID
  "nome": String,                  // Nome da peça
  "codigo_oem": String,            // Código original
  "codigo_alternativo": String,    // Códigos alternativos (separados por vírgula)
  "descricao": String,             // Descrição detalhada
  "categoria": String,             // Nome da categoria
  "versoes": Array<String>,        // ["VR", "SS", "ES", "GS"]
  "ano_inicial": String,           // Ano inicial (ex: "2000")
  "ano_final": String,             // Ano final (ex: "2005")
  "compatibilidade": String,       // Compatibilidade com outros modelos
  "observacoes": String,           // Observações importantes
  "imagem_url": String,            // URL da imagem
  "data_adicionado": ISODate       // Data de criação
}
```

**Versões Suportadas:**
- **VR** - V6 2.5
- **SS** - Sport Sedan
- **ES** - Executive Sport
- **GS** - Grand Sport

**Índices Recomendados:**
- `id` (único)
- `categoria`
- `versoes`
- `codigo_oem`

---

#### 3. **usuarios**
```javascript
{
  "_id": ObjectId,
  "id": String,              // UUID
  "username": String,        // Username único
  "password": String,        // Senha (texto plano - considerar hash)
  "nome": String,            // Nome completo (opcional)
  "criado_em": ISODate       // Data de criação
}
```

**⚠️ ATENÇÃO:** As senhas estão armazenadas em texto plano. Para produção, recomenda-se usar bcrypt ou similar.

**Índices Recomendados:**
- `username` (único)

---

#### 4. **fornecedores**
```javascript
{
  "_id": ObjectId,
  "id": String,              // UUID
  "nome": String,            // Nome do fornecedor
  "contato": String,         // Telefone/contato
  "site": String,            // URL do site
  "observacoes": String,     // Observações
  "pecas": Array<String>     // Array de IDs de peças que vende
}
```

**Relacionamento:**
- Um fornecedor pode vender múltiplas peças
- Array `pecas` contém os IDs das peças

**Índices Recomendados:**
- `id` (único)
- `pecas` (array)

---

#### 5. **links**
```javascript
{
  "_id": ObjectId,
  "id": String,              // UUID
  "pecaId": String,          // ID da peça (FK)
  "fornecedorId": String,    // ID do fornecedor (FK)
  "url": String,             // Link direto de compra
  "preco": String,           // Preço (formato: "R$ 100,00")
  "observacoes": String      // Observações sobre o link
}
```

**Relacionamentos:**
- Muitos para muitos entre peças e fornecedores
- `pecaId` → `pecas.id`
- `fornecedorId` → `fornecedores.id`

---

## 🔌 API Backend (Endpoints)

### Base URL: `/api`

### Autenticação
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "user": {
    "id": "...",
    "username": "admin",
    "nome": "Administrador"
  },
  "message": "Login realizado com sucesso!"
}
```

---

### Peças (Parts)
```http
# Listar todas
GET /api/parts

# Buscar
GET /api/parts?search=filtro

# Filtrar por categoria
GET /api/parts?category=Motor

# Filtrar por versão
GET /api/parts?versao=VR

# Obter uma peça (com fornecedores e links)
GET /api/parts/{id}

# Criar peça
POST /api/parts
{
  "nome": "...",
  "codigo_oem": "...",
  "categoria": "...",
  "versoes": ["VR", "GS"],
  "ano_inicial": "2000",
  "ano_final": "2005",
  ...
}

# Atualizar peça
PUT /api/parts/{id}
{...}

# Deletar peça (também remove de fornecedores.pecas)
DELETE /api/parts/{id}
```

---

### Fornecedores (Suppliers)
```http
# Listar todos
GET /api/suppliers

# Obter um (com peças que vende)
GET /api/suppliers/{id}

# Criar fornecedor
POST /api/suppliers
{
  "nome": "...",
  "contato": "...",
  "site": "...",
  "pecas": ["id1", "id2"]
}

# Atualizar
PUT /api/suppliers/{id}

# Deletar
DELETE /api/suppliers/{id}
```

---

### Categorias
```http
GET /api/categories
POST /api/categories
DELETE /api/categories/{id}
```

---

### Links
```http
GET /api/links
GET /api/links?partId={id}
POST /api/links
PUT /api/links/{id}
DELETE /api/links/{id}
```

---

### Usuários
```http
GET /api/users
POST /api/users
PUT /api/users/{id}
DELETE /api/users/{id}
```

---

### Seed (Popular banco)
```http
POST /api/seed

Response:
{
  "message": "Banco de dados populado com sucesso!",
  "counts": {
    "categories": 7,
    "suppliers": 4,
    "parts": 7,
    "links": 3,
    "users": 1
  }
}
```

---

## 🎨 Frontend

### Páginas Públicas (Sem Login)

#### 1. **Catálogo Principal** (`/`)
- Busca por nome, código OEM ou alternativo
- Filtros:
  - Categoria
  - Versão (VR/SS/ES/GS)
- Cards clicáveis para detalhes
- Design automotivo (dark + vermelho)

#### 2. **Detalhes da Peça** (`/pecas/[id]`)
- Informações completas da peça
- Versões compatíveis
- Range de anos
- Compatibilidade
- Observações
- Lista de fornecedores com telefones
- Links diretos de compra com preços

---

### Páginas Administrativas (Requer Login)

#### 3. **Login** (`/admin/login`)
- Autenticação simples
- Sem credenciais visíveis na tela
- LocalStorage para sessão

#### 4. **Dashboard Admin** (`/admin`)
- **5 Abas:**
  1. **Peças** - CRUD completo com:
     - Checkboxes para versões (VR/SS/ES/GS)
     - Campos de ano inicial/final
     - Todos os campos de peça
  
  2. **Fornecedores** - CRUD com:
     - Seletor múltiplo de peças que vende
     - Telefone/contato
  
  3. **Links** - Vincular peças a fornecedores
  
  4. **Categorias** - Criar/deletar categorias
  
  5. **Usuários** - Gerenciar usuários admin

---

## 🔐 Segurança

### Pontos Fortes
- ✅ Autenticação via banco de dados
- ✅ Sessão via localStorage
- ✅ Senhas não aparecem em respostas da API

### ⚠️ Melhorias Necessárias

1. **Senhas em Texto Plano**
   ```javascript
   // ATUAL (INSEGURO)
   password: "admin123"
   
   // RECOMENDADO
   const bcrypt = require('bcrypt');
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **JWT ao invés de LocalStorage**
   ```javascript
   // Instalar
   yarn add jsonwebtoken
   
   // Gerar token
   const jwt = require('jsonwebtoken');
   const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
   ```

3. **Middleware de Autenticação**
   - Proteger rotas admin no servidor
   - Validar token em cada request

4. **Sanitização de Inputs**
   ```javascript
   yarn add validator xss
   ```

5. **Rate Limiting**
   ```javascript
   yarn add express-rate-limit
   ```

---

## ⚡ Performance

### Melhorias Recomendadas

1. **Índices MongoDB**
```javascript
db.pecas.createIndex({ "codigo_oem": 1 })
db.pecas.createIndex({ "categoria": 1 })
db.pecas.createIndex({ "versoes": 1 })
db.usuarios.createIndex({ "username": 1 }, { unique: true })
```

2. **Paginação**
```javascript
// Adicionar na API
const page = parseInt(searchParams.get('page')) || 1;
const limit = 20;
const skip = (page - 1) * limit;

const parts = await db.collection('pecas')
  .find(query)
  .skip(skip)
  .limit(limit)
  .toArray();
```

3. **Cache**
```javascript
// Redis para cache de consultas frequentes
yarn add redis
```

4. **Imagens**
- Usar CDN ou serviço de imagens (Cloudinary, S3)
- Implementar lazy loading
- Otimizar tamanhos

---

## 🐛 Bugs Conhecidos

### Nenhum bug crítico identificado ✅

### Pontos de Atenção

1. **Upload de Imagens**
   - Atualmente só aceita URLs
   - Considerar implementar upload direto

2. **Validação de Formulários**
   - Validação básica no frontend
   - Adicionar validação robusta no backend

3. **Mensagens de Erro**
   - Melhorar feedback de erros
   - Adicionar toast notifications

---

## 📦 Dependências Principais

```json
{
  "next": "14.2.3",
  "react": "^18",
  "mongodb": "^6.6.0",
  "lucide-react": "^0.516.0",
  "tailwindcss": "^3.4.1",
  "@radix-ui/*": "Diversos componentes UI"
}
```

---

## 🚀 Como Rodar

```bash
# Instalar dependências
yarn install

# Iniciar MongoDB (deve estar rodando)
# mongodb://localhost:27017

# Popular banco de dados
curl -X POST http://localhost:3000/api/seed -d '{}'

# Iniciar desenvolvimento
yarn dev

# Acessar
http://localhost:3000
```

---

## 🔑 Credenciais Padrão

**Admin:**
- Username: `admin`
- Senha: `admin123`

---

## 📝 TODO / Melhorias Futuras

### Alta Prioridade
- [ ] Implementar hash de senhas (bcrypt)
- [ ] JWT para autenticação
- [ ] Middleware de proteção de rotas
- [ ] Validação de inputs
- [ ] Testes unitários

### Média Prioridade
- [ ] Upload de imagens
- [ ] Paginação
- [ ] Cache (Redis)
- [ ] Logs de auditoria
- [ ] Exportar catálogo (CSV/PDF)

### Baixa Prioridade
- [ ] Dark/Light mode
- [ ] Internacionalização (i18n)
- [ ] PWA
- [ ] Notificações push
- [ ] Analytics

---

## 🎯 Funcionalidades Implementadas

### Público
- ✅ Catálogo navegável
- ✅ Busca avançada
- ✅ Filtros (categoria, versão)
- ✅ Detalhes da peça completos
- ✅ Lista de fornecedores
- ✅ Links de compra com preços

### Admin
- ✅ Autenticação
- ✅ CRUD de peças (com 4 versões)
- ✅ CRUD de fornecedores
- ✅ CRUD de categorias
- ✅ CRUD de links
- ✅ CRUD de usuários
- ✅ Gerenciamento de versões (VR/SS/ES/GS)
- ✅ Range de anos

---

## 🌐 URLs de Produção

- **Catálogo:** https://galant-catalog.preview.emergentagent.com
- **Admin:** https://galant-catalog.preview.emergentagent.com/admin/login

---

## 📞 Suporte Técnico

Para dúvidas ou melhorias, consulte esta documentação ou entre em contato com a equipe de desenvolvimento.

---

**Última atualização:** 12/12/2025
**Versão:** 1.0
