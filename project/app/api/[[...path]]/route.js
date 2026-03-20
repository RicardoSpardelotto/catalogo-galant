import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

const client = new MongoClient(process.env.MONGO_URL);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.DB_NAME || 'galant_catalog');
  }
  return db;
}

// Helper to generate UUID
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET(request, { params }) {
  try {
    const db = await connectDB();
    const path = params.path?.join('/') || '';
    const { searchParams } = new URL(request.url);

    // GET all parts
    if (path === 'parts') {
      const search = searchParams.get('search');
      const category = searchParams.get('category');
      const versao = searchParams.get('versao');
      
      let query = {};
      if (search) {
        query.$or = [
          { nome: { $regex: search, $options: 'i' } },
          { codigo_oem: { $regex: search, $options: 'i' } },
          { codigo_alternativo: { $regex: search, $options: 'i' } }
        ];
      }
      if (category && category !== 'all') {
        query.categoria = category;
      }
      if (versao && versao !== 'all') {
        query.versoes = versao;
      }

      const parts = await db.collection('pecas').find(query).sort({ data_adicionado: -1 }).toArray();
      return NextResponse.json({ parts });
    }

    // GET single part
    if (path.startsWith('parts/') && path.split('/').length === 2) {
      const id = path.split('/')[1];
      const part = await db.collection('pecas').findOne({ id });
      if (!part) {
        return NextResponse.json({ error: 'Part not found' }, { status: 404 });
      }
      
      // Get suppliers that sell this part
      const suppliers = await db.collection('fornecedores').find({ 
        pecas: id 
      }).toArray();
      
      // Get links for this part
      const links = await db.collection('links').find({ pecaId: id }).toArray();
      const enrichedLinks = await Promise.all(links.map(async (link) => {
        const supplier = await db.collection('fornecedores').findOne({ id: link.fornecedorId });
        return { ...link, supplier };
      }));
      
      return NextResponse.json({ part, suppliers, links: enrichedLinks });
    }

    // GET all suppliers
    if (path === 'suppliers') {
      const suppliers = await db.collection('fornecedores').find({}).sort({ nome: 1 }).toArray();
      return NextResponse.json({ suppliers });
    }

    // GET single supplier
    if (path.startsWith('suppliers/') && path.split('/').length === 2) {
      const id = path.split('/')[1];
      const supplier = await db.collection('fornecedores').findOne({ id });
      if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }
      
      // Get parts that this supplier sells
      const parts = await db.collection('pecas').find({ 
        id: { $in: supplier.pecas || [] } 
      }).toArray();
      
      return NextResponse.json({ supplier, parts });
    }

    // GET all categories
    if (path === 'categories') {
      const categories = await db.collection('categorias').find({}).sort({ nome: 1 }).toArray();
      return NextResponse.json({ categories });
    }

    // GET all links
    if (path === 'links') {
      const partId = searchParams.get('partId');
      let query = {};
      if (partId) {
        query.pecaId = partId;
      }
      const links = await db.collection('links').find(query).toArray();
      
      // Enrich with part and supplier data
      const enrichedLinks = await Promise.all(links.map(async (link) => {
        const part = await db.collection('pecas').findOne({ id: link.pecaId });
        const supplier = await db.collection('fornecedores').findOne({ id: link.fornecedorId });
        return { ...link, part, supplier };
      }));
      
      return NextResponse.json({ links: enrichedLinks });
    }

    // GET all users
    if (path === 'users') {
      const users = await db.collection('usuarios').find({}).sort({ username: 1 }).toArray();
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      return NextResponse.json({ users: safeUsers });
    }

    // AUTH LOGIN
    if (path === 'auth/login') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const db = await connectDB();
    const path = params.path?.join('/') || '';
    const body = await request.json();

    // AUTH LOGIN
    if (path === 'auth/login') {
      const { username, password } = body;
      
      // Check user in database
      const user = await db.collection('usuarios').findOne({ username });
      
      if (user && user.password === password) {
        return NextResponse.json({ 
          success: true, 
          user: { 
            id: user.id,
            username: user.username,
            nome: user.nome 
          },
          message: 'Login realizado com sucesso!' 
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Credenciais inválidas' 
      }, { status: 401 });
    }

    // CREATE part
    if (path === 'parts') {
      const newPart = {
        id: generateId(),
        nome: body.nome,
        codigo_oem: body.codigo_oem,
        codigo_alternativo: body.codigo_alternativo || '',
        descricao: body.descricao || '',
        categoria: body.categoria,
        versoes: body.versoes || [],
        ano_inicial: body.ano_inicial || '',
        ano_final: body.ano_final || '',
        compatibilidade: body.compatibilidade || '',
        observacoes: body.observacoes || '',
        imagem_url: body.imagem_url || '',
        data_adicionado: new Date().toISOString()
      };
      
      await db.collection('pecas').insertOne(newPart);
      return NextResponse.json({ part: newPart, message: 'Peça criada com sucesso!' });
    }

    // CREATE supplier
    if (path === 'suppliers') {
      const newSupplier = {
        id: generateId(),
        nome: body.nome,
        contato: body.contato || '',
        site: body.site || '',
        observacoes: body.observacoes || '',
        pecas: body.pecas || []
      };
      
      await db.collection('fornecedores').insertOne(newSupplier);
      return NextResponse.json({ supplier: newSupplier, message: 'Fornecedor criado com sucesso!' });
    }

    // CREATE category
    if (path === 'categories') {
      const existing = await db.collection('categorias').findOne({ nome: body.nome });
      if (existing) {
        return NextResponse.json({ error: 'Categoria já existe' }, { status: 400 });
      }
      
      const newCategory = {
        id: generateId(),
        nome: body.nome,
        descricao: body.descricao || ''
      };
      
      await db.collection('categorias').insertOne(newCategory);
      return NextResponse.json({ category: newCategory, message: 'Categoria criada com sucesso!' });
    }

    // CREATE link
    if (path === 'links') {
      const newLink = {
        id: generateId(),
        pecaId: body.pecaId,
        fornecedorId: body.fornecedorId,
        url: body.url || '',
        preco: body.preco || '',
        observacoes: body.observacoes || ''
      };
      
      await db.collection('links').insertOne(newLink);
      return NextResponse.json({ link: newLink, message: 'Link criado com sucesso!' });
    }

    // CREATE user
    if (path === 'users') {
      const existing = await db.collection('usuarios').findOne({ username: body.username });
      if (existing) {
        return NextResponse.json({ error: 'Usuário já existe' }, { status: 400 });
      }

      if (!body.username || !body.password) {
        return NextResponse.json({ error: 'Username e senha são obrigatórios' }, { status: 400 });
      }
      
      const newUser = {
        id: generateId(),
        username: body.username,
        password: body.password,
        nome: body.nome || '',
        criado_em: new Date().toISOString()
      };
      
      await db.collection('usuarios').insertOne(newUser);
      const { password, ...safeUser } = newUser;
      return NextResponse.json({ user: safeUser, message: 'Usuário criado com sucesso!' });
    }

    // SEED database
    if (path === 'seed') {
      // Clear existing data
      await db.collection('pecas').deleteMany({});
      await db.collection('fornecedores').deleteMany({});
      await db.collection('categorias').deleteMany({});
      await db.collection('links').deleteMany({});
      await db.collection('usuarios').deleteMany({});

      // Create admin user
      const adminUser = {
        id: generateId(),
        username: 'admin',
        password: 'admin123',
        nome: 'Administrador',
        criado_em: new Date().toISOString()
      };
      await db.collection('usuarios').insertOne(adminUser);

      // Create categories
      const categories = [
        { id: generateId(), nome: 'Motor', descricao: 'Componentes do motor' },
        { id: generateId(), nome: 'Suspensão', descricao: 'Sistema de suspensão' },
        { id: generateId(), nome: 'Freios', descricao: 'Sistema de freios' },
        { id: generateId(), nome: 'Elétrica', descricao: 'Sistema elétrico' },
        { id: generateId(), nome: 'Carroceria', descricao: 'Peças da carroceria' },
        { id: generateId(), nome: 'Transmissão', descricao: 'Sistema de transmissão' },
        { id: generateId(), nome: 'Direção', descricao: 'Sistema de direção' }
      ];
      await db.collection('categorias').insertMany(categories);

      // Create sample parts
      const parts = [
        {
          id: generateId(),
          nome: 'Filtro de Óleo',
          codigo_oem: 'MZ690115',
          codigo_alternativo: 'PH3614, ML9098',
          descricao: 'Filtro de óleo para motor 6A13 2.5 V6',
          categoria: 'Motor',
          versoes: ['VR', 'GS'],
          ano_inicial: '2001',
          ano_final: '2003',
          compatibilidade: 'Também compatível com Lancer Evolution (mesma rosca)',
          observacoes: 'Trocar a cada 5.000 km',
          imagem_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
          data_adicionado: new Date().toISOString()
        },
        {
          id: generateId(),
          nome: 'Amortecedor Dianteiro',
          codigo_oem: 'MR267960',
          codigo_alternativo: 'KYB334336, MONROE5848',
          descricao: 'Amortecedor dianteiro direito',
          categoria: 'Suspensão',
          versoes: ['VR', 'SS', 'ES', 'GS'],
          ano_inicial: '1999',
          ano_final: '2003',
          compatibilidade: 'Mesmo amortecedor do Lancer - intercambiável',
          observacoes: 'Sempre trocar em par (direito e esquerdo)',
          imagem_url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400',
          data_adicionado: new Date().toISOString()
        },
        {
          id: generateId(),
          nome: 'Pastilha de Freio Dianteira',
          codigo_oem: 'MR527772',
          codigo_alternativo: 'BOSCH0986BB0017, TRW324532',
          descricao: 'Jogo de pastilhas de freio dianteiro',
          categoria: 'Freios',
          versoes: ['VR', 'SS', 'ES'],
          ano_inicial: '2000',
          ano_final: '2005',
          compatibilidade: 'Compatível com Galant VR-4 e modelos 2.0',
          observacoes: 'Verificar espessura mínima 3mm',
          imagem_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
          data_adicionado: new Date().toISOString()
        },
        {
          id: generateId(),
          nome: 'Vela de Ignição',
          codigo_oem: 'MN163190',
          codigo_alternativo: 'NGK BKR6E-11, DENSO K20PR-U11',
          descricao: 'Vela de ignição platinada',
          categoria: 'Elétrica',
          versoes: ['VR', 'GS'],
          ano_inicial: '2001',
          ano_final: '2003',
          compatibilidade: 'Motor 6A13 2.5 V6 (conjunto de 6 unidades)',
          observacoes: 'Trocar a cada 30.000 km, gap 1.1mm',
          imagem_url: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400',
          data_adicionado: new Date().toISOString()
        },
        {
          id: generateId(),
          nome: 'Lanterna Traseira',
          codigo_oem: 'MB831037',
          codigo_alternativo: 'DEPO335-1905L-AS',
          descricao: 'Lanterna traseira lado esquerdo',
          categoria: 'Carroceria',
          versoes: ['VR', 'SS', 'ES', 'GS'],
          ano_inicial: '2001',
          ano_final: '2003',
          compatibilidade: 'Específica para modelo 2001-2003',
          observacoes: 'Verificar ano do veículo antes de comprar',
          imagem_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
          data_adicionado: new Date().toISOString()
        },
        {
          id: generateId(),
          nome: 'Óleo de Transmissão Automática',
          codigo_oem: 'MZ320292',
          codigo_alternativo: 'DIAMONDSP-III, MOBILATF220',
          descricao: 'Óleo ATF para transmissão automática F4A42',
          categoria: 'Transmissão',
          versoes: ['VR', 'ES'],
          ano_inicial: '2000',
          ano_final: '2005',
          compatibilidade: 'Transmissão F4A42 (4 marchas)',
          observacoes: 'Capacidade: 8.5 litros. Trocar a cada 40.000 km',
          imagem_url: 'https://images.unsplash.com/photo-1625047508564-e7258dc0a3f3?w=400',
          data_adicionado: new Date().toISOString()
        },
        {
          id: generateId(),
          nome: 'Bomba de Direção Hidráulica',
          codigo_oem: 'MR267729',
          codigo_alternativo: 'CARDONE96-7819, ZF8001',
          descricao: 'Bomba de direção hidráulica remanufaturada',
          categoria: 'Direção',
          versoes: ['VR', 'SS', 'ES', 'GS'],
          ano_inicial: '1999',
          ano_final: '2005',
          compatibilidade: 'Serve em Galant 2.0 e 2.5 com pequeno ajuste no suporte',
          observacoes: 'Verificar vazamentos antes de trocar',
          imagem_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400',
          data_adicionado: new Date().toISOString()
        }
      ];
      await db.collection('pecas').insertMany(parts);

      // Create suppliers
      const suppliers = [
        {
          id: generateId(),
          nome: 'AutoPeças Brasil',
          contato: '(11) 3456-7890',
          site: 'https://autopecasbrasil.com.br',
          observacoes: 'Entrega rápida, bons preços',
          pecas: [parts[0].id, parts[2].id]
        },
        {
          id: generateId(),
          nome: 'Mitsubishi Original Parts',
          contato: '(11) 4567-8901',
          site: 'https://mitsubishiparts.com',
          observacoes: 'Peças originais certificadas',
          pecas: [parts[0].id, parts[3].id, parts[4].id]
        },
        {
          id: generateId(),
          nome: 'Universal Auto Parts',
          contato: '(11) 5678-9012',
          site: 'https://universalparts.com.br',
          observacoes: 'Alternativas de qualidade',
          pecas: [parts[1].id, parts[5].id]
        },
        {
          id: generateId(),
          nome: 'Speed Parts',
          contato: '(11) 6789-0123',
          site: 'https://speedparts.com.br',
          observacoes: 'Especializado em importados',
          pecas: [parts[1].id, parts[6].id]
        }
      ];
      await db.collection('fornecedores').insertMany(suppliers);

      // Create some links
      const links = [
        {
          id: generateId(),
          pecaId: parts[0].id,
          fornecedorId: suppliers[0].id,
          url: 'https://autopecasbrasil.com.br/filtro-oleo-mz690115',
          preco: 'R$ 45,00',
          observacoes: 'Em estoque'
        },
        {
          id: generateId(),
          pecaId: parts[0].id,
          fornecedorId: suppliers[1].id,
          url: 'https://mitsubishiparts.com/original/mz690115',
          preco: 'R$ 78,00',
          observacoes: 'Original - entrega 3 dias'
        },
        {
          id: generateId(),
          pecaId: parts[1].id,
          fornecedorId: suppliers[2].id,
          url: 'https://universalparts.com.br/amortecedor-kyb334336',
          preco: 'R$ 320,00',
          observacoes: 'KYB - excelente qualidade'
        }
      ];
      await db.collection('links').insertMany(links);

      return NextResponse.json({ 
        message: 'Banco de dados populado com sucesso!',
        counts: {
          categories: categories.length,
          suppliers: suppliers.length,
          parts: parts.length,
          links: links.length,
          users: 1
        }
      });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const db = await connectDB();
    const path = params.path?.join('/') || '';
    const body = await request.json();

    // UPDATE part
    if (path.startsWith('parts/') && path.split('/').length === 2) {
      const id = path.split('/')[1];
      const updateData = {
        nome: body.nome,
        codigo_oem: body.codigo_oem,
        codigo_alternativo: body.codigo_alternativo || '',
        descricao: body.descricao || '',
        categoria: body.categoria,
        versoes: body.versoes || [],
        ano_inicial: body.ano_inicial || '',
        ano_final: body.ano_final || '',
        compatibilidade: body.compatibilidade || '',
        observacoes: body.observacoes || '',
        imagem_url: body.imagem_url || ''
      };
      
      const result = await db.collection('pecas').updateOne(
        { id },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Part not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Peça atualizada com sucesso!' });
    }

    // UPDATE supplier
    if (path.startsWith('suppliers/') && path.split('/').length === 2) {
      const id = path.split('/')[1];
      const updateData = {
        nome: body.nome,
        contato: body.contato || '',
        site: body.site || '',
        observacoes: body.observacoes || '',
        pecas: body.pecas || []
      };
      
      const result = await db.collection('fornecedores').updateOne(
        { id },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Fornecedor atualizado com sucesso!' });
    }

    // UPDATE link
    if (path.startsWith('links/') && path.split('/').length === 2) {
      const id = path.split('/')[1];
      const updateData = {
        url: body.url || '',
        preco: body.preco || '',
        observacoes: body.observacoes || ''
      };
      
      const result = await db.collection('links').updateOne(
        { id },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Link not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Link atualizado com sucesso!' });
    }

    // UPDATE user
    if (path.startsWith('users/') && path.split('/').length === 2) {
      const id = path.split('/')[1];
      const updateData = {
        username: body.username,
        nome: body.nome || ''
      };
      
      // Only update password if provided
      if (body.password) {
        updateData.password = body.password;
      }
      
      const result = await db.collection('usuarios').updateOne(
        { id },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Usuário atualizado com sucesso!' });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = await connectDB();
    const path = params.path?.join('/') || '';

    // DELETE part
    if (path.startsWith('parts/') && path.split('/').length === 2) {
      const id = path.split('/')[1];
      
      // Also delete related links
      await db.collection('links').deleteMany({ pecaId: id });
      
      // Remove from suppliers' pecas array
      await db.collection('fornecedores').updateMany(
        { pecas: id },
        { $pull: { pecas: id } }
      );
      
      const result = await db.collection('pecas').deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Part not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Peça excluída com sucesso!' });
    }

    // DELETE supplier
    if (path.startsWith('suppliers/') && path.split('/').length === 2) {
      const id = path.split('/')[1];
      
      // Also delete related links
      await db.collection('links').deleteMany({ fornecedorId: id });
      
      const result = await db.collection('fornecedores').deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Fornecedor excluído com sucesso!' });
    }

    // DELETE category
    if (path.startsWith('categories/') && path.split('/').length === 2) {
      const id = path.split('/')[1];
      const result = await db.collection('categorias').deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Categoria excluída com sucesso!' });
    }

    // DELETE link
    if (path.startsWith('links/') && path.split('/').length === 2) {
      const id = path.split('/')[1];
      const result = await db.collection('links').deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Link not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Link excluído com sucesso!' });
    }

    // DELETE user
    if (path.startsWith('users/') && path.split('/').length === 2) {
      const id = path.split('/')[1];
      const result = await db.collection('usuarios').deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Usuário excluído com sucesso!' });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}