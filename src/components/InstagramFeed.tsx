
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Instagram, Heart, MessageCircle, Share2 } from 'lucide-react';

interface InstagramPost {
  id: string;
  caption: string;
  media_url: string;
  media_type: string;
  timestamp: string;
  permalink: string;
}

export const InstagramFeed = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - in a real app, you'd fetch from Instagram API
  const mockPosts = [
    {
      id: '1',
      caption: 'Pizza margherita fresquinha saindo do forno! 🍕🔥 #juliospizzahouse #pizza #londrina',
      media_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=400&fit=crop',
      media_type: 'IMAGE',
      timestamp: '2024-01-15T18:30:00Z',
      permalink: 'https://instagram.com/p/example1'
    },
    {
      id: '2',
      caption: 'Nosso chef preparando a massa artesanal 👨‍🍳✨ #artesanal #qualidade #londrina',
      media_url: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=400&fit=crop',
      media_type: 'IMAGE',
      timestamp: '2024-01-14T20:15:00Z',
      permalink: 'https://instagram.com/p/example2'
    },
    {
      id: '3',
      caption: 'Pizza de pepperoni com borda recheada! Quem mais ama? ❤️🍕 #pepperoni #bordaRecheada',
      media_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop',
      media_type: 'IMAGE',
      timestamp: '2024-01-13T19:45:00Z',
      permalink: 'https://instagram.com/p/example3'
    },
    {
      id: '4',
      caption: 'Entrega especial para nossos clientes queridos! 🚗💨 #delivery #londrina #clientes',
      media_url: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&h=400&fit=crop',
      media_type: 'IMAGE',
      timestamp: '2024-01-12T21:00:00Z',
      permalink: 'https://instagram.com/p/example4'
    },
    {
      id: '5',
      caption: 'Pizza vegetariana carregada de sabor! 🥬🍅 #vegetariana #saudavel #sabor',
      media_url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=400&fit=crop',
      media_type: 'IMAGE',
      timestamp: '2024-01-11T18:20:00Z',
      permalink: 'https://instagram.com/p/example5'
    },
    {
      id: '6',
      caption: 'Final de semana especial com promoção! 🎉 #promocao #fimdesemana #pizza',
      media_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop',
      media_type: 'IMAGE',
      timestamp: '2024-01-10T17:30:00Z',
      permalink: 'https://instagram.com/p/example6'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  return (
    <section id="instagram" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Instagram className="text-pink-500 mr-4" size={40} />
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                @juliospizzahouse
              </span>
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Acompanhe nosso dia a dia e descubra as novidades mais saborosas do nosso Instagram!
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
                <div className="w-full h-64 bg-gray-700 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className="bg-gray-800 border-gray-700 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 group cursor-pointer"
                onClick={() => window.open(post.permalink, '_blank')}
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={post.media_url} 
                    alt="Instagram post"
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-pink-500 text-white">
                      <Instagram size={12} className="mr-1" />
                      Post
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex space-x-4 text-white">
                      <div className="flex items-center">
                        <Heart size={20} className="mr-1" />
                        <span className="text-sm">142</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle size={20} className="mr-1" />
                        <span className="text-sm">23</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {post.caption}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">
                      {formatDate(post.timestamp)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-pink-400 transition-colors">
                        <Heart size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-blue-400 transition-colors">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button 
            onClick={() => window.open('https://instagram.com/juliospizzahouse', '_blank')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center mx-auto"
          >
            <Instagram className="mr-2" size={20} />
            Seguir no Instagram
          </button>
        </div>
      </div>
    </section>
  );
};
