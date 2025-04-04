import { createReactBlockSpec } from "@blocknote/react";
import { useState, useEffect, useRef } from "react";


const loadYouTubeAPI = () => {
  if (window.YT && window.YT.Player) return; 
  
  return new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API is fully loaded!");
      resolve(true);
    };
    
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);
  });
};

export const YoutubeTimestamp = createReactBlockSpec(
  {
    type: "youtubetimestamp",
    propSchema: {
      url: { default: "" as string },
      timestamps: { default: "[]" as string },
    },
    content: "inline",
    onResize: true,
    draggable: true,
  },
  {
    render: ({ block, updateBlock }: any) => {
      const [player, setPlayer] = useState<any>(null);
      const [playerReady, setPlayerReady] = useState<boolean>(false);
      const [timestamps, setTimestamps] = useState<number[]>(JSON.parse(block.props.timestamps || "[]"));
      const [isPlaying, setIsPlaying] = useState<boolean>(false);
      const playerContainerId = `youtube-video-${block.id}`;
      const playerRef = useRef<any>(null);

      const safeUpdateBlock = updateBlock || (() => {});

      const extractVideoId = (url: string) => {
        const regex =
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
      };

      useEffect(() => {
        let ytPlayer: any = null;
        const videoId = extractVideoId(block.props.url);
        
        if (!videoId) {
          console.error("Invalid YouTube URL");
          return;
        }
        
        const initPlayer = async () => {
          await loadYouTubeAPI();
          
          const checkYTLoaded = () => {
            return new Promise((resolve) => {
              const checkInterval = setInterval(() => {
                if (window.YT && window.YT.Player) {
                  clearInterval(checkInterval);
                  resolve(true);
                }
              }, 100);
            });
          };
          
          await checkYTLoaded();
          
          if (playerRef.current) {
            playerRef.current.destroy();
          }
          
          console.log("Creating new YouTube Player...");
          ytPlayer = new window.YT.Player(playerContainerId, {
            videoId: videoId,
            playerVars: { 
              rel: 0,
              enablejsapi: 1
            },
            events: {
              onReady: (event: any) => {
                console.log("YouTube Player is ready!");
                setPlayerReady(true);
                playerRef.current = event.target;
                setPlayer(event.target);
              },
              onStateChange: (event: any) => {
                console.log("Player state changed:", event.data);
                setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
                
                if (event.data === window.YT.PlayerState.PLAYING) {
                  console.log("Video is playing, ready to capture timestamps!");
                }
              },
              onError: (error: any) => {
                console.error("YouTube Player Error:", error);
              }
            },
          });
        };
        
        initPlayer();
        
        return () => {
          if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
          }
        };
      }, [block.props.url, block.id]);

      const handleTimestampAdd = () => {
        if (!playerReady || !player) {
          console.warn("YouTube Player is not ready yet!");
          return;
        }

        try {
          const currentPlayerState = player.getPlayerState();
          console.log("Current Player State:", currentPlayerState);
          
          if (currentPlayerState === window.YT.PlayerState.PLAYING || isPlaying) {
            const time = player.getCurrentTime();
            console.log("Current Time:", time);
            
            if (time > 0) {
              setTimestamps((prevTimestamps) => {
                const newTimestamps = [...prevTimestamps, time];
                console.log("New Timestamps:", newTimestamps);
                
                safeUpdateBlock({
                  ...block,
                  props: { ...block.props, timestamps: JSON.stringify(newTimestamps) },
                });
                return newTimestamps;
              });
            } else {
              console.warn("getCurrentTime returned 0 or invalid value");
            }
          } else {
            console.warn("Video is not playing. Current state:", currentPlayerState);
          }
        } catch (error) {
          console.error("Error adding timestamp:", error);
        }
      };

      const jumpToTimestamp = (timestamp: number) => {
        if (playerReady && player) {
          player.seekTo(timestamp, true);
          player.playVideo();
        }
      };

      const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        const hoursStr = hours > 0 ? `${hours}:` : '';
        const minsStr = `${hours > 0 ? mins.toString().padStart(2, '0') : mins}:`;
        const secsStr = secs.toString().padStart(2, '0');
        
        return `${hoursStr}${minsStr}${secsStr}`;
      };

      if (!block.props.url) {
        return (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            Input YouTube URL.
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center w-full">
          <button
            className={`mb-2 px-4 py-2 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${
              playerReady 
                ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1" 
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
            onClick={handleTimestampAdd}
            disabled={!playerReady}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Add Timestamp</span>
            <span className="text-xs ml-1 bg-blue-500 px-2 py-0.5 rounded-full">
              {isPlaying ? "Playing" : "Stopped"}
            </span>
          </button>

          <div className="relative w-full max-w-[640px]">
            <div className="relative" style={{ paddingBottom: "56.25%" }}>
              <div id={playerContainerId} className="absolute top-0 left-0 w-full h-full" />
            </div>
          </div>

          <div className="w-full max-w-[640px] mt-2 p-3 bg-gray-100 rounded-md text-gray-800 text-sm">
            {timestamps.length > 0 ? (
              <div>
                <strong>Timestamps:</strong>
                <ul className="mt-2 space-y-1">
                  {timestamps.map((timestamp, index) => (
                    <li 
                      key={index}
                      className="cursor-pointer hover:bg-gray-200 p-1 rounded flex justify-between items-center"
                      onClick={() => jumpToTimestamp(timestamp)}
                    >
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        {formatTime(timestamp)} ({timestamp.toFixed(2)} seconds)
                      </span>
                      <span className="text-blue-600 text-xs">Click to move</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>No timestamps. Click the button to add timestamps after playing the video.</div>
            )}
          </div>
        </div>
      );
    },
  }
);