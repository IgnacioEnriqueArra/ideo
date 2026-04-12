import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  cover_image: string | null;
  published_at: string;
  user: {
    name: string;
    profile_image: string;
    username: string;
  };
  tag_list: string[];
}

export const NewsFeed: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching from DEV.to API as a reliable tech news source
    fetch('https://dev.to/api/articles?tag=programming&top=1&per_page=15')
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching news:', err);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full bg-gray-50 min-h-full"
    >
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Tech News</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {articles.map((article, i) => (
            <motion.a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="block bg-white p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-6 h-6 rounded-md">
                  <AvatarImage src={article.user.profile_image} />
                  <AvatarFallback>{article.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{article.user.name}</span>
                <span className="text-xs text-gray-400">· {formatDistanceToNow(new Date(article.published_at), { addSuffix: true }).replace('about ', '')}</span>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <h2 className="font-bold text-gray-900 leading-tight mb-1">{article.title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{article.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {article.tag_list.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                {article.cover_image && (
                  <img 
                    src={article.cover_image} 
                    alt={article.title} 
                    className="w-20 h-20 object-cover rounded-lg border border-gray-100"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </motion.div>
  );
};
