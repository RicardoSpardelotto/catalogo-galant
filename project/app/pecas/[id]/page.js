'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Phone, ExternalLink, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PartDetailPage({ params }) {
  const router = useRouter();
  const [part, setPart] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartDetails();
  }, [params.id]);

  const loadPartDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/parts/${params.id}`);
      const data = await res.json();
      
      if (data.part) {
        setPart(data.part);
        setSuppliers(data.suppliers || []);
        setLinks(data.links || []);
      }
    } catch (error) {
      console.error('Error loading part:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h2 className="text-2xl text-white mb-2">Peça não encontrada</h2>
          <Button onClick={() => router.push('/')} className="bg-red-600 hover:bg-red-700">
            Voltar ao Catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="bg-zinc-900/50 border-b border-red-900/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.push('/')} 
              variant="outline" 
              size="sm"
              className="border-zinc-700 hover:bg-zinc-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{part.nome}</h1>
                <p className="text-sm text-gray-400">Código OEM: {part.codigo_oem}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {part.imagem_url && (
              <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                <img 
                  src={part.imagem_url} 
                  alt={part.nome} 
                  className="w-full h-auto object-cover" 
                />
              </Card>
            )}

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Códigos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Código OEM</p>
                  <p className="text-red-400 font-mono text-lg">{part.codigo_oem}</p>
                </div>
                {part.codigo_alternativo && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Códigos Alternativos</p>
                    <p className="text-gray-300 text-sm">{part.codigo_alternativo}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Compatibilidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-2">Categoria</p>
                  <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                    {part.categoria}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">Versões do Galant</p>
                  <div className="flex flex-wrap gap-2">
                    {part.versoes && part.versoes.length > 0 ? (
                      part.versoes.map(versao => (
                        <Badge key={versao} variant="outline" className="border-zinc-600 text-gray-300">
                          {versao}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">Não especificado</span>
                    )}
                  </div>
                </div>
                {(part.ano_inicial || part.ano_final) && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Anos</p>
                    <p className="text-gray-300">{part.ano_inicial} - {part.ano_final}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details and Suppliers */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-xl">Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {part.descricao || 'Sem descrição disponível'}
                </p>
              </CardContent>
            </Card>

            {part.compatibilidade && (
              <Card className="bg-blue-900/20 border-blue-800/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    Compatibilidade com Outros Modelos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{part.compatibilidade}</p>
                </CardContent>
              </Card>
            )}

            {part.observacoes && (
              <Card className="bg-amber-900/20 border-amber-800/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    Observações Importantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{part.observacoes}</p>
                </CardContent>
              </Card>
            )}

            {/* Suppliers */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-xl">Onde Comprar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suppliers.length > 0 ? (
                  suppliers.map(supplier => (
                    <Card key={supplier.id} className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-white">{supplier.nome}</h3>
                            {supplier.contato && (
                              <a 
                                href={`tel:${supplier.contato.replace(/[^0-9]/g, '')}`}
                                className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                              >
                                <Phone className="w-4 h-4" />
                                <span className="font-mono">{supplier.contato}</span>
                              </a>
                            )}
                            {supplier.site && (
                              <a 
                                href={supplier.site} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Visitar site
                              </a>
                            )}
                            {supplier.observacoes && (
                              <p className="text-xs text-gray-400 bg-zinc-900/50 p-2 rounded mt-2">
                                {supplier.observacoes}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-6">Nenhum fornecedor cadastrado para esta peça</p>
                )}

                {/* Links with Prices */}
                {links.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-zinc-700">
                    <h4 className="text-white font-semibold mb-3">Links Diretos</h4>
                    <div className="space-y-2">
                      {links.map(link => (
                        <Card key={link.id} className="bg-zinc-800/50 border-zinc-700">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-white font-medium">{link.supplier?.nome}</p>
                                {link.observacoes && (
                                  <p className="text-xs text-gray-400">{link.observacoes}</p>
                                )}
                              </div>
                              {link.preco && (
                                <p className="text-lg font-bold text-green-400 mx-4">{link.preco}</p>
                              )}
                              {link.url && (
                                <a 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0"
                                >
                                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Comprar
                                  </Button>
                                </a>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}