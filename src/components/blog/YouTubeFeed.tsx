import { useState, useEffect } from 'react';
import { Play, Youtube, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Video {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        description: string;
        thumbnails: {
            medium: {
                url: string;
            };
            high: {
                url: string;
            };
        };
        publishTime: string;
        channelTitle: string;
    };
}

const YouTubeFeed = ({ apiKey, channelId, query = "Revenue Operations" }: { apiKey: string, channelId?: string, query?: string }) => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // If channelId is provided, search within channel. Otherwise search by query.
                const baseUrl = 'https://www.googleapis.com/youtube/v3/search';
                let params = `?part=snippet&maxResults=3&order=date&type=video&key=${apiKey}`;

                if (channelId) {
                    params += `&channelId=${channelId}`;
                } else {
                    params += `&q=${encodeURIComponent(query)}`;
                }

                const response = await fetch(baseUrl + params);
                const data = await response.json();

                if (data.error) {
                    console.error("YouTube API Error:", data.error);
                    setError(true);
                } else {
                    setVideos(data.items || []);
                }
            } catch (err) {
                console.error("YouTube Fetch Error:", err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideos();
    }, [apiKey, channelId, query]);

    if (error) {
        // Fallback UI or empty (don't break the page)
        return null;
    }

    if (isLoading) {
        return (
            <div className="w-full py-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    if (videos.length === 0) return null;

    return (
        <div className="w-full py-12 border-t border-zinc-100">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Youtube className="w-6 h-6 text-red-600" />
                    <h3 className="text-xl font-bold tracking-tight text-black">
                        Últimos Vídeos
                        <span className="text-zinc-400 font-normal ml-2 text-sm hidden md:inline">
                            {channelId ? 'do nosso Canal' : `sobre ${query}`}
                        </span>
                    </h3>
                </div>
                <Button variant="ghost" className="text-xs uppercase font-bold tracking-widest text-zinc-500 hover:text-red-600 gap-2"
                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank')}
                >
                    Ver Mais <ExternalLink className="w-3 h-3" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <a
                        key={video.id.videoId}
                        href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block bg-black rounded-xl overflow-hidden aspect-video shadow-sm transition-all duration-300 transform hover:-translate-y-1"
                    >
                        {/* Thumbnail */}
                        <img
                            src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium.url}
                            alt={video.snippet.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 text-white fill-white ml-1" />
                            </div>
                        </div>

                        {/* Title Overlay (Bottom) */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80">
                            <h4 className="text-white text-sm font-bold leading-tight line-clamp-2 mb-1">
                                {video.snippet.title}
                            </h4>
                            <span className="text-[10px] text-zinc-300 block">
                                {new Date(video.snippet.publishTime).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default YouTubeFeed;
