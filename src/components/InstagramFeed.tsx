
import React, { useState, useEffect } from 'react';
import { Instagram, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InstagramPost {
  id: string;
  titulo: string;
  url_post: string;
  url_imagem: string;
  ativo: boolean;
  ordem: number;
  curtidas?: number;
  comentarios?: number;
  descricao?: string;
}

export const InstagramFeed = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao carregar posts do Instagram:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="instagram" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section id="instagram" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                Siga-nos no Instagram
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Nenhum post disponível no momento.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const displayedPosts = showAll ? posts : posts.slice(0, 6);

  return (
    <section id="instagram" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              Siga-nos no Instagram
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Acompanhe nossos posts e fique por dentro das novidades da nossa pizzaria
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPosts.map((post) => (
            <div key={post.id} className="bg-gray-900 rounded-lg overflow-hidden shadow-xl group hover:transform hover:scale-105 transition-all duration-300">
              <div className="relative">
                <img 
                  src={post.url_imagem} 
                  alt={post.titulo}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <a 
                    href={post.url_post} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-full transition-colors"
                    aria-label={`Ver post ${post.titulo} no Instagram`}
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">{post.titulo}</h3>
                {post.descricao && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.descricao}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    {post.curtidas !== undefined && post.curtidas > 0 && (
                      <span>❤️ {post.curtidas}</span>
                    )}
                    {post.comentarios !== undefined && post.comentarios > 0 && (
                      <span>💬 {post.comentarios}</span>
                    )}
                  </div>
                  <Instagram size={16} className="text-pink-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length > 6 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              {showAll ? (
                <>
                  <ChevronUp className="mr-2" size={20} />
                  Ver Menos
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2" size={20} />
                  Ver Mais Posts
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
