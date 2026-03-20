# 🔄 Restaurar Banco de Dados MongoDB

## Instruções para Restauração

### Opção 1: Restaurar Tudo
```bash
mongorestore --uri="mongodb://localhost:27017" --db=your_database_name ./your_database_name
```

### Opção 2: Restaurar em Novo Banco
```bash
mongorestore --uri="mongodb://localhost:27017" --db=galant_catalog_novo ./your_database_name
```

### Opção 3: Restaurar Coleção Específica
```bash
mongorestore --uri="mongodb://localhost:27017" --db=your_database_name --collection=pecas ./your_database_name/pecas.bson
```

## 📊 Estatísticas do Dump

- **Database:** your_database_name
- **Data:** 18/03/2026
- **Coleções:** 5
- **Documentos Totais:** 25

### Detalhes por Coleção:
- **categorias:** 7 documentos
- **pecas:** 8 documentos
- **usuarios:** 2 documentos (admin + joao)
- **links:** 3 documentos
- **fornecedores:** 5 documentos

## ⚠️ ATENÇÃO

As senhas dos usuários estão em **texto plano** no dump:
- **admin:** admin123
- **joao:** senha123

**Recomendação:** Altere as senhas após restaurar!

## 🔐 Segurança

Para uso em produção, considere:
1. Criptografar o arquivo de dump
2. Armazenar em local seguro
3. Implementar hash de senhas (bcrypt)
4. Rotacionar credenciais regularmente
