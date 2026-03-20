# 📦 Catálogo de Peças Galant - Export Completo

## 📋 Conteúdo do Pacote

```
catalogo-galant/
├── project/              # Código fonte do projeto
│   ├── app/             # Next.js App Router
│   ├── components/      # Componentes UI
│   ├── lib/             # Utilitários
│   ├── hooks/           # React Hooks
│   ├── package.json     # Dependências
│   └── ...
│
└── database/            # Dump MongoDB
    ├── your_database_name/
    │   ├── pecas.bson
    │   ├── usuarios.bson
    │   ├── categorias.bson
    │   ├── fornecedores.bson
    │   ├── links.bson
    │   └── *.metadata.json
    └── README_RESTORE.md
```

## 🚀 Como Usar

### 1. Extrair o ZIP
```bash
unzip catalogo-galant.zip
cd catalogo-galant
```

### 2. Instalar Dependências
```bash
cd project
yarn install
```

### 3. Restaurar Banco de Dados
```bash
cd ../database
mongorestore --uri="mongodb://localhost:27017" --db=your_database_name ./your_database_name
```

### 4. Configurar Variáveis de Ambiente
```bash
cd ../project
# Editar .env se necessário
nano .env
```

### 5. Iniciar o Projeto
```bash
yarn dev
```

Acesse: http://localhost:3000

## 📚 Documentação

Consulte o arquivo `DOCUMENTACAO_COMPLETA.md` dentro da pasta `project/` para:
- Estrutura completa do projeto
- API endpoints
- Esquema do banco de dados
- Melhorias sugeridas
- Guia de desenvolvimento

## 🔑 Credenciais Padrão

- **Username:** admin
- **Senha:** admin123

## 🌐 Deploy

O projeto está configurado para:
- Next.js 14
- MongoDB
- Tailwind CSS + shadcn/ui

## 📞 Suporte

Para dúvidas, consulte a documentação completa incluída no pacote.

---

**Versão:** 1.0  
**Data:** 18/03/2026
