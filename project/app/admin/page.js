'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Edit2, Trash2, ExternalLink, Package, Users, Link as LinkIcon, Tag, X, LogOut, ArrowLeft, CheckSquare, Square, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [parts, setParts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Dialog states
  const [partDialogOpen, setPartDialogOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  
  // Form states
  const [editingPart, setEditingPart] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  
  const [partForm, setPartForm] = useState({
    nome: '',
    codigo_oem: '',
    codigo_alternativo: '',
    descricao: '',
    categoria: '',
    versoes: [],
    ano_inicial: '',
    ano_final: '',
    compatibilidade: '',
    observacoes: '',
    imagem_url: ''
  });
  
  const [supplierForm, setSupplierForm] = useState({
    nome: '',
    contato: '',
    site: '',
    observacoes: '',
    pecas: []
  });
  
  const [categoryForm, setCategoryForm] = useState({
    nome: '',
    descricao: ''
  });
  
  const [linkForm, setLinkForm] = useState({
    pecaId: '',
    fornecedorId: '',
    url: '',
    preco: '',
    observacoes: ''
  });
  
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    nome: ''
  });

  useEffect(() => {
    // Check authentication
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUser');
    router.push('/');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [partsRes, suppliersRes, categoriesRes, linksRes, usersRes] = await Promise.all([
        fetch('/api/parts'),
        fetch('/api/suppliers'),
        fetch('/api/categories'),
        fetch('/api/links'),
        fetch('/api/users')
      ]);
      
      const partsData = await partsRes.json();
      const suppliersData = await suppliersRes.json();
      const categoriesData = await categoriesRes.json();
      const linksData = await linksRes.json();
      const usersData = await usersRes.json();
      
      setParts(partsData.parts || []);
      setSuppliers(suppliersData.suppliers || []);
      setCategories(categoriesData.categories || []);
      setLinks(linksData.links || []);
      setUsers(usersData.users || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Part CRUD
  const savePart = async () => {
    try {
      if (!partForm.nome || !partForm.codigo_oem || !partForm.categoria) {
        showMessage('Preencha os campos obrigatórios', 'error');
        return;
      }
      
      const method = editingPart ? 'PUT' : 'POST';
      const url = editingPart ? `/api/parts/${editingPart.id}` : '/api/parts';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partForm)
      });
      
      const data = await res.json();
      showMessage(data.message, 'success');
      setPartDialogOpen(false);
      resetPartForm();
      loadData();
    } catch (error) {
      showMessage('Erro ao salvar peça', 'error');
    }
  };

  const deletePart = async (id) => {
    if (!confirm('Deseja realmente excluir esta peça?')) return;
    
    try {
      const res = await fetch(`/api/parts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      showMessage(data.message, 'success');
      loadData();
    } catch (error) {
      showMessage('Erro ao excluir peça', 'error');
    }
  };

  const editPart = (part) => {
    setEditingPart(part);
    setPartForm({
      nome: part.nome,
      codigo_oem: part.codigo_oem,
      codigo_alternativo: part.codigo_alternativo || '',
      descricao: part.descricao || '',
      categoria: part.categoria,
      versoes: part.versoes || [],
      ano_inicial: part.ano_inicial || '',
      ano_final: part.ano_final || '',
      compatibilidade: part.compatibilidade || '',
      observacoes: part.observacoes || '',
      imagem_url: part.imagem_url || ''
    });
    setPartDialogOpen(true);
  };

  const resetPartForm = () => {
    setEditingPart(null);
    setPartForm({
      nome: '',
      codigo_oem: '',
      codigo_alternativo: '',
      descricao: '',
      categoria: '',
      versoes: [],
      ano_inicial: '',
      ano_final: '',
      compatibilidade: '',
      observacoes: '',
      imagem_url: ''
    });
  };

  const toggleVersao = (versao) => {
    const newVersoes = partForm.versoes.includes(versao)
      ? partForm.versoes.filter(v => v !== versao)
      : [...partForm.versoes, versao];
    setPartForm({ ...partForm, versoes: newVersoes });
  };

  // Supplier CRUD
  const saveSupplier = async () => {
    try {
      if (!supplierForm.nome) {
        showMessage('Nome do fornecedor é obrigatório', 'error');
        return;
      }
      
      const method = editingSupplier ? 'PUT' : 'POST';
      const url = editingSupplier ? `/api/suppliers/${editingSupplier.id}` : '/api/suppliers';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      });
      
      const data = await res.json();
      showMessage(data.message, 'success');
      setSupplierDialogOpen(false);
      resetSupplierForm();
      loadData();
    } catch (error) {
      showMessage('Erro ao salvar fornecedor', 'error');
    }
  };

  const deleteSupplier = async (id) => {
    if (!confirm('Deseja realmente excluir este fornecedor?')) return;
    
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      showMessage(data.message, 'success');
      loadData();
    } catch (error) {
      showMessage('Erro ao excluir fornecedor', 'error');
    }
  };

  const editSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      nome: supplier.nome,
      contato: supplier.contato || '',
      site: supplier.site || '',
      observacoes: supplier.observacoes || '',
      pecas: supplier.pecas || []
    });
    setSupplierDialogOpen(true);
  };

  const resetSupplierForm = () => {
    setEditingSupplier(null);
    setSupplierForm({
      nome: '',
      contato: '',
      site: '',
      observacoes: '',
      pecas: []
    });
  };

  const togglePecaInSupplier = (pecaId) => {
    const newPecas = supplierForm.pecas.includes(pecaId)
      ? supplierForm.pecas.filter(p => p !== pecaId)
      : [...supplierForm.pecas, pecaId];
    setSupplierForm({ ...supplierForm, pecas: newPecas });
  };

  // Category CRUD
  const saveCategory = async () => {
    try {
      if (!categoryForm.nome) {
        showMessage('Nome da categoria é obrigatório', 'error');
        return;
      }
      
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      
      const data = await res.json();
      if (res.ok) {
        showMessage(data.message, 'success');
        setCategoryDialogOpen(false);
        resetCategoryForm();
        loadData();
      } else {
        showMessage(data.error, 'error');
      }
    } catch (error) {
      showMessage('Erro ao salvar categoria', 'error');
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Deseja realmente excluir esta categoria?')) return;
    
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      showMessage(data.message, 'success');
      loadData();
    } catch (error) {
      showMessage('Erro ao excluir categoria', 'error');
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      nome: '',
      descricao: ''
    });
  };

  // Link CRUD
  const saveLink = async () => {
    try {
      if (!linkForm.pecaId || !linkForm.fornecedorId) {
        showMessage('Selecione peça e fornecedor', 'error');
        return;
      }
      
      const method = editingLink ? 'PUT' : 'POST';
      const url = editingLink ? `/api/links/${editingLink.id}` : '/api/links';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkForm)
      });
      
      const data = await res.json();
      showMessage(data.message, 'success');
      setLinkDialogOpen(false);
      resetLinkForm();
      loadData();
    } catch (error) {
      showMessage('Erro ao salvar link', 'error');
    }
  };

  const deleteLink = async (id) => {
    if (!confirm('Deseja realmente excluir este link?')) return;
    
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
      const data = await res.json();
      showMessage(data.message, 'success');
      loadData();
    } catch (error) {
      showMessage('Erro ao excluir link', 'error');
    }
  };

  const editLink = (link) => {
    setEditingLink(link);
    setLinkForm({
      pecaId: link.pecaId,
      fornecedorId: link.fornecedorId,
      url: link.url || '',
      preco: link.preco || '',
      observacoes: link.observacoes || ''
    });
    setLinkDialogOpen(true);
  };

  const resetLinkForm = () => {
    setEditingLink(null);
    setLinkForm({
      pecaId: '',
      fornecedorId: '',
      url: '',
      preco: '',
      observacoes: ''
    });
  };

  const openLinkDialog = (partId = '') => {
    setLinkForm({ ...linkForm, pecaId: partId });
    setLinkDialogOpen(true);
  };

  // User CRUD
  const saveUser = async () => {
    try {
      if (!userForm.username || !userForm.password) {
        showMessage('Username e senha são obrigatórios', 'error');
        return;
      }
      
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      
      const data = await res.json();
      if (res.ok) {
        showMessage(data.message, 'success');
        setUserDialogOpen(false);
        resetUserForm();
        loadData();
      } else {
        showMessage(data.error, 'error');
      }
    } catch (error) {
      showMessage('Erro ao salvar usuário', 'error');
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      showMessage(data.message, 'success');
      loadData();
    } catch (error) {
      showMessage('Erro ao excluir usuário', 'error');
    }
  };

  const editUser = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      password: '',
      nome: user.nome || ''
    });
    setUserDialogOpen(true);
  };

  const resetUserForm = () => {
    setEditingUser(null);
    setUserForm({
      username: '',
      password: '',
      nome: ''
    });
  };

  // Filter parts
  const filteredParts = parts.filter(part => {
    const matchesSearch = searchTerm === '' || 
      part.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.codigo_oem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (part.codigo_alternativo && part.codigo_alternativo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || part.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getPartLinks = (partId) => {
    return links.filter(link => link.pecaId === partId);
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="bg-zinc-900/50 border-b border-red-900/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Área Administrativa</h1>
                <p className="text-sm text-gray-400">Gerencie o catálogo de peças</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => router.push('/')} 
                variant="outline" 
                className="border-zinc-700 hover:bg-zinc-800 text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Catálogo Público
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Message Toast */}
      {message && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
            {message}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="parts" className="space-y-6">
          <TabsList className="bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger value="parts" className="data-[state=active]:bg-red-600">
              <Package className="w-4 h-4 mr-2" />
              Peças
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="data-[state=active]:bg-red-600">
              <Users className="w-4 h-4 mr-2" />
              Fornecedores
            </TabsTrigger>
            <TabsTrigger value="links" className="data-[state=active]:bg-red-600">
              <LinkIcon className="w-4 h-4 mr-2" />
              Links
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-red-600">
              <Tag className="w-4 h-4 mr-2" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-red-600">
              <UserCog className="w-4 h-4 mr-2" />
              Usuários
            </TabsTrigger>
          </TabsList>

          {/* Parts Tab */}
          <TabsContent value="parts" className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Peças Cadastradas</CardTitle>
                    <CardDescription className="text-gray-400">Gerencie as peças do catálogo</CardDescription>
                  </div>
                  <Dialog open={partDialogOpen} onOpenChange={(open) => {
                    setPartDialogOpen(open);
                    if (!open) resetPartForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Peça
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingPart ? 'Editar Peça' : 'Nova Peça'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Nome da Peça *</Label>
                            <Input
                              value={partForm.nome}
                              onChange={(e) => setPartForm({ ...partForm, nome: e.target.value })}
                              className="bg-zinc-800 border-zinc-700 text-white"
                            />
                          </div>
                          <div>
                            <Label>Código OEM *</Label>
                            <Input
                              value={partForm.codigo_oem}
                              onChange={(e) => setPartForm({ ...partForm, codigo_oem: e.target.value })}
                              className="bg-zinc-800 border-zinc-700 text-white"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Códigos Alternativos</Label>
                          <Input
                            value={partForm.codigo_alternativo}
                            onChange={(e) => setPartForm({ ...partForm, codigo_alternativo: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            placeholder="Separe por vírgula"
                          />
                        </div>

                        <div>
                          <Label>Categoria *</Label>
                          <Select value={partForm.categoria} onValueChange={(value) => setPartForm({ ...partForm, categoria: value })}>
                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Versões do Galant *</Label>
                          <div className="flex gap-4 mt-2">
                            {['VR', 'SS', 'ES', 'GS'].map(versao => (
                              <button
                                key={versao}
                                type="button"
                                onClick={() => toggleVersao(versao)}
                                className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
                              >
                                {partForm.versoes.includes(versao) ? (
                                  <CheckSquare className="w-5 h-5 text-red-500" />
                                ) : (
                                  <Square className="w-5 h-5" />
                                )}
                                {versao}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Ano Inicial</Label>
                            <Input
                              value={partForm.ano_inicial}
                              onChange={(e) => setPartForm({ ...partForm, ano_inicial: e.target.value })}
                              className="bg-zinc-800 border-zinc-700 text-white"
                              placeholder="Ex: 2000"
                            />
                          </div>
                          <div>
                            <Label>Ano Final</Label>
                            <Input
                              value={partForm.ano_final}
                              onChange={(e) => setPartForm({ ...partForm, ano_final: e.target.value })}
                              className="bg-zinc-800 border-zinc-700 text-white"
                              placeholder="Ex: 2005"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Descrição</Label>
                          <Textarea
                            value={partForm.descricao}
                            onChange={(e) => setPartForm({ ...partForm, descricao: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label>Compatibilidade</Label>
                          <Textarea
                            value={partForm.compatibilidade}
                            onChange={(e) => setPartForm({ ...partForm, compatibilidade: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label>Observações</Label>
                          <Textarea
                            value={partForm.observacoes}
                            onChange={(e) => setPartForm({ ...partForm, observacoes: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label>URL da Imagem</Label>
                          <Input
                            value={partForm.imagem_url}
                            onChange={(e) => setPartForm({ ...partForm, imagem_url: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPartDialogOpen(false)} className="border-zinc-700">
                          Cancelar
                        </Button>
                        <Button onClick={savePart} className="bg-red-600 hover:bg-red-700">
                          Salvar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px] bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Parts List */}
                <div className="space-y-3">
                  {filteredParts.map(part => (
                    <Card key={part.id} className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-2">{part.nome}</h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge className="bg-red-600/20 text-red-400">{part.categoria}</Badge>
                              {part.versoes?.map(v => (
                                <Badge key={v} variant="outline" className="border-zinc-600 text-gray-300">{v}</Badge>
                              ))}
                            </div>
                            <p className="text-xs text-gray-400">OEM: {part.codigo_oem}</p>
                            {part.ano_inicial && (
                              <p className="text-xs text-gray-400">Anos: {part.ano_inicial}-{part.ano_final}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => editPart(part)} className="border-zinc-700">
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deletePart(part.id)} className="border-red-600 text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Fornecedores</CardTitle>
                    <CardDescription className="text-gray-400">Gerencie fornecedores e suas peças</CardDescription>
                  </div>
                  <Dialog open={supplierDialogOpen} onOpenChange={(open) => {
                    setSupplierDialogOpen(open);
                    if (!open) resetSupplierForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Fornecedor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Nome *</Label>
                          <Input
                            value={supplierForm.nome}
                            onChange={(e) => setSupplierForm({ ...supplierForm, nome: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                        <div>
                          <Label>Telefone/Contato</Label>
                          <Input
                            value={supplierForm.contato}
                            onChange={(e) => setSupplierForm({ ...supplierForm, contato: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            placeholder="(11) 1234-5678"
                          />
                        </div>
                        <div>
                          <Label>Site</Label>
                          <Input
                            value={supplierForm.site}
                            onChange={(e) => setSupplierForm({ ...supplierForm, site: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                        <div>
                          <Label>Observações</Label>
                          <Textarea
                            value={supplierForm.observacoes}
                            onChange={(e) => setSupplierForm({ ...supplierForm, observacoes: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Peças que este fornecedor vende</Label>
                          <div className="mt-2 max-h-60 overflow-y-auto space-y-2 border border-zinc-700 rounded-lg p-3 bg-zinc-800/50">
                            {parts.map(part => (
                              <button
                                key={part.id}
                                type="button"
                                onClick={() => togglePecaInSupplier(part.id)}
                                className="flex items-center gap-2 text-white hover:text-red-400 transition-colors w-full text-left"
                              >
                                {supplierForm.pecas.includes(part.id) ? (
                                  <CheckSquare className="w-4 h-4 text-red-500 flex-shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 flex-shrink-0" />
                                )}
                                <span className="text-sm">{part.nome} ({part.codigo_oem})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSupplierDialogOpen(false)} className="border-zinc-700">
                          Cancelar
                        </Button>
                        <Button onClick={saveSupplier} className="bg-red-600 hover:bg-red-700">
                          Salvar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suppliers.map(supplier => (
                    <Card key={supplier.id} className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-2">{supplier.nome}</h3>
                            {supplier.contato && <p className="text-sm text-gray-300">📞 {supplier.contato}</p>}
                            {supplier.pecas && supplier.pecas.length > 0 && (
                              <p className="text-xs text-gray-400 mt-2">{supplier.pecas.length} peça(s) cadastrada(s)</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => editSupplier(supplier)} className="border-zinc-700">
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteSupplier(supplier.id)} className="border-red-600 text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Links de Compra</CardTitle>
                    <CardDescription className="text-gray-400">Gerencie links diretos</CardDescription>
                  </div>
                  <Dialog open={linkDialogOpen} onOpenChange={(open) => {
                    setLinkDialogOpen(open);
                    if (!open) resetLinkForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Link
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                      <DialogHeader>
                        <DialogTitle>{editingLink ? 'Editar Link' : 'Novo Link'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Peça *</Label>
                          <Select value={linkForm.pecaId} onValueChange={(value) => setLinkForm({ ...linkForm, pecaId: value })} disabled={editingLink}>
                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                              {parts.map(part => (
                                <SelectItem key={part.id} value={part.id}>{part.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Fornecedor *</Label>
                          <Select value={linkForm.fornecedorId} onValueChange={(value) => setLinkForm({ ...linkForm, fornecedorId: value })} disabled={editingLink}>
                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                              {suppliers.map(supplier => (
                                <SelectItem key={supplier.id} value={supplier.id}>{supplier.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>URL</Label>
                          <Input
                            value={linkForm.url}
                            onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                        <div>
                          <Label>Preço</Label>
                          <Input
                            value={linkForm.preco}
                            onChange={(e) => setLinkForm({ ...linkForm, preco: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            placeholder="R$ 100,00"
                          />
                        </div>
                        <div>
                          <Label>Observações</Label>
                          <Textarea
                            value={linkForm.observacoes}
                            onChange={(e) => setLinkForm({ ...linkForm, observacoes: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            rows={2}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setLinkDialogOpen(false)} className="border-zinc-700">
                          Cancelar
                        </Button>
                        <Button onClick={saveLink} className="bg-red-600 hover:bg-red-700">
                          Salvar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {links.map(link => (
                    <Card key={link.id} className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-red-600/20 text-red-400">{link.part?.nome}</Badge>
                              <span className="text-gray-500">→</span>
                              <Badge variant="outline" className="border-zinc-600 text-gray-300">{link.supplier?.nome}</Badge>
                            </div>
                            {link.preco && <p className="text-green-400 font-semibold">{link.preco}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => editLink(link)} className="border-zinc-700">
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteLink(link.id)} className="border-red-600 text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Categorias</CardTitle>
                    <CardDescription className="text-gray-400">Gerencie categorias de peças</CardDescription>
                  </div>
                  <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
                    setCategoryDialogOpen(open);
                    if (!open) resetCategoryForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Categoria
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                      <DialogHeader>
                        <DialogTitle>Nova Categoria</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Nome *</Label>
                          <Input
                            value={categoryForm.nome}
                            onChange={(e) => setCategoryForm({ ...categoryForm, nome: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                        <div>
                          <Label>Descrição</Label>
                          <Textarea
                            value={categoryForm.descricao}
                            onChange={(e) => setCategoryForm({ ...categoryForm, descricao: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            rows={2}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCategoryDialogOpen(false)} className="border-zinc-700">
                          Cancelar
                        </Button>
                        <Button onClick={saveCategory} className="bg-red-600 hover:bg-red-700">
                          Salvar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories.map(category => (
                    <Card key={category.id} className="bg-zinc-800/50 border-zinc-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-lg">{category.nome}</CardTitle>
                          <Button size="sm" variant="outline" onClick={() => deleteCategory(category.id)} className="border-red-600 text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      {category.descricao && (
                        <CardContent>
                          <p className="text-sm text-gray-400">{category.descricao}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Usuários</CardTitle>
                    <CardDescription className="text-gray-400">Gerencie usuários administrativos</CardDescription>
                  </div>
                  <Dialog open={userDialogOpen} onOpenChange={(open) => {
                    setUserDialogOpen(open);
                    if (!open) resetUserForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Usuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                      <DialogHeader>
                        <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          {editingUser ? 'Atualize os dados do usuário' : 'Crie um novo usuário administrativo'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Username *</Label>
                          <Input
                            value={userForm.username}
                            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            placeholder="usuario123"
                            disabled={editingUser}
                          />
                        </div>
                        <div>
                          <Label>Senha *</Label>
                          <Input
                            type="password"
                            value={userForm.password}
                            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            placeholder={editingUser ? 'Deixe em branco para manter a senha atual' : 'Digite a senha'}
                          />
                          {editingUser && (
                            <p className="text-xs text-gray-400 mt-1">Deixe em branco para não alterar a senha</p>
                          )}
                        </div>
                        <div>
                          <Label>Nome Completo</Label>
                          <Input
                            value={userForm.nome}
                            onChange={(e) => setUserForm({ ...userForm, nome: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            placeholder="João da Silva (opcional)"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setUserDialogOpen(false)} className="border-zinc-700">
                          Cancelar
                        </Button>
                        <Button onClick={saveUser} className="bg-red-600 hover:bg-red-700">
                          Salvar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map(user => (
                    <Card key={user.id} className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                                <UserCog className="w-5 h-5 text-red-400" />
                              </div>
                              <div>
                                <h3 className="text-white font-semibold text-lg">@{user.username}</h3>
                                {user.nome && <p className="text-sm text-gray-400">{user.nome}</p>}
                              </div>
                            </div>
                            {user.criado_em && (
                              <p className="text-xs text-gray-500">Criado em: {new Date(user.criado_em).toLocaleDateString('pt-BR')}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => editUser(user)} className="border-zinc-700">
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteUser(user.id)} className="border-red-600 text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {users.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <UserCog className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum usuário cadastrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}