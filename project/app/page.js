'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Filter, ChevronRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CatalogoPublico() {
  const router = useRouter();
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVersao, setSelectedVersao] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [partsRes, categoriesRes] = await Promise.all([
        fetch('/api/parts'),
        fetch('/api/categories')
      ]);
      
      const partsData = await partsRes.json();
      const categoriesData = await categoriesRes.json();
      
      setParts(partsData.parts || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      loadData();
    } catch (error) {
      console.error('Error seeding:', error);
    }
  };

  // Filter parts
  const filteredParts = parts.filter(part => {
    const matchesSearch = searchTerm === '' || 
      part.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.codigo_oem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (part.codigo_alternativo && part.codigo_alternativo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || part.categoria === selectedCategory;
    const matchesVersao = selectedVersao === 'all' || (part.versoes && part.versoes.includes(selectedVersao));
    
    return matchesSearch && matchesCategory && matchesVersao;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-xl">Carregando catálogo...</div>
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
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Catálogo de Peças Galant</h1>
                <p className="text-sm text-gray-400">Encontre peças para seu Mitsubishi Galant</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/admin/login')} 
              variant="outline" 
              className="border-zinc-700 hover:bg-zinc-800 text-gray-300"
            >
              <Settings className="w-4 h-4 mr-2" />
              Área Administrativa
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="bg-zinc-900/50 border-zinc-800 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por nome, código OEM ou alternativo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 bg-zinc-800 border-zinc-700 text-white h-12 text-base"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px] bg-zinc-800 border-zinc-700 text-white h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedVersao} onValueChange={setSelectedVersao}>
                <SelectTrigger className="w-full md:w-[200px] bg-zinc-800 border-zinc-700 text-white h-12">
                  <SelectValue placeholder="Versão" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectItem value="all">Todas as versões</SelectItem>
                  <SelectItem value="VR">VR</SelectItem>
                  <SelectItem value="SS">SS</SelectItem>
                  <SelectItem value="ES">ES</SelectItem>
                  <SelectItem value="GS">GS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Parts Grid */}
        {parts.length === 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-white mb-2">Catálogo Vazio</h3>
              <p className="text-gray-400 mb-4">Ainda não há peças cadastradas no sistema</p>
              <Button onClick={handleSeedData} className="bg-red-600 hover:bg-red-700">
                Carregar Dados de Exemplo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-gray-400 text-sm">
              {filteredParts.length} peça(s) encontrada(s)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredParts.map(part => (
                <Card 
                  key={part.id} 
                  className="bg-zinc-800/50 border-zinc-700 hover:border-red-600/50 transition-all cursor-pointer group hover:shadow-lg hover:shadow-red-600/10"
                  onClick={() => router.push(`/pecas/${part.id}`)}
                >
                  {part.imagem_url && (
                    <div className="w-full h-48 bg-zinc-900 overflow-hidden">
                      <img 
                        src={part.imagem_url} 
                        alt={part.nome} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2 group-hover:text-red-400 transition-colors">
                          {part.nome}
                        </CardTitle>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400">
                            OEM: <span className="text-red-400 font-mono">{part.codigo_oem}</span>
                          </p>
                          {part.codigo_alternativo && (
                            <p className="text-xs text-gray-400">Alt: {part.codigo_alternativo}</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-red-400 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                        {part.categoria}
                      </Badge>
                      {part.versoes && part.versoes.map(versao => (
                        <Badge key={versao} variant="outline" className="border-zinc-600 text-gray-300">
                          {versao}
                        </Badge>
                      ))}
                    </div>
                    {(part.ano_inicial || part.ano_final) && (
                      <p className="text-xs text-gray-400">
                        📅 Anos: {part.ano_inicial} - {part.ano_final}
                      </p>
                    )}
                    {part.descricao && (
                      <p className="text-sm text-gray-300 line-clamp-2">{part.descricao}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {filteredParts.length === 0 && parts.length > 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma peça encontrada</h3>
              <p className="text-gray-400">Tente ajustar os filtros de busca</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900/50 border-t border-zinc-800 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Catálogo de Peças Galant • {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}