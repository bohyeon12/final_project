import { createReactBlockSpec } from "@blocknote/react";
import { useState, useEffect, useRef } from "react";

// YouTube API 로드 함수
const loadYouTubeAPI = () => {
  if (window.YT && window.YT.Player) return; // 이미 YT가 로드되었으면 중지
  
  return new Promise((resolve) => {
    // YouTube API 로드 콜백 설정
    window.onYouTubeIframeAPIReady = () => {
      console.log("✅ YouTube API is fully loaded!");
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

      // YouTube 비디오 ID 추출 함수
      const extractVideoId = (url: string) => {
        const regex =
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
      };

      // YouTube API 로드 및 플레이어 초기화
      useEffect(() => {
        let ytPlayer: any = null;
        const videoId = extractVideoId(block.props.url);
        
        if (!videoId) {
          console.error("❌ Invalid YouTube URL");
          return;
        }
        
        const initPlayer = async () => {
          // API 로드 확인
          await loadYouTubeAPI();
          
          // API가 완전히 로드될 때까지 대기
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
          
          // 기존 플레이어 정리
          if (playerRef.current) {
            playerRef.current.destroy();
          }
          
          // 새 플레이어 초기화
          console.log("🎥 Creating new YouTube Player...");
          ytPlayer = new window.YT.Player(playerContainerId, {
            videoId: videoId,
            playerVars: { 
              rel: 0,
              enablejsapi: 1
            },
            events: {
              onReady: (event: any) => {
                console.log("🎬 YouTube Player is ready!");
                setPlayerReady(true);
                playerRef.current = event.target;
                setPlayer(event.target);
              },
              onStateChange: (event: any) => {
                console.log("Player state changed:", event.data);
                // 재생 상태 업데이트 (1은 재생 중)
                setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
                
                if (event.data === window.YT.PlayerState.PLAYING) {
                  console.log("🎬 Video is playing, ready to capture timestamps!");
                }
              },
              onError: (error: any) => {
                console.error("🚨 YouTube Player Error:", error);
              }
            },
          });
        };
        
        // 플레이어 초기화 실행
        initPlayer();
        
        // 컴포넌트 언마운트 시 플레이어 제거
        return () => {
          if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
          }
        };
      }, [block.props.url, block.id]);

      // 타임스탬프 추가 함수
      const handleTimestampAdd = () => {
        if (!playerReady || !player) {
          console.warn("⏳ YouTube Player is not ready yet!");
          return;
        }

        try {
          // 플레이어 상태 확인
          const currentPlayerState = player.getPlayerState();
          console.log("Current Player State:", currentPlayerState);
          
          // 재생 중일 때만 타임스탬프 추가 (YT.PlayerState.PLAYING는 1)
          if (currentPlayerState === window.YT.PlayerState.PLAYING || isPlaying) {
            // 현재 시간 가져오기
            const time = player.getCurrentTime();
            console.log("Current Time:", time);
            
            if (time > 0) {
              // 상태 업데이트: 새 타임스탬프 추가
              setTimestamps((prevTimestamps) => {
                const newTimestamps = [...prevTimestamps, time];
                console.log("New Timestamps:", newTimestamps);
                
                // 업데이트된 타임스탬프를 block에 반영
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
            alert("비디오가 재생 중일 때만 타임스탬프를 추가할 수 있습니다. 재생 버튼을 눌러주세요.");
          }
        } catch (error) {
          console.error("Error adding timestamp:", error);
        }
      };

      // 타임스탬프로 이동하는 함수
      const jumpToTimestamp = (timestamp: number) => {
        if (playerReady && player) {
          player.seekTo(timestamp, true);
          player.playVideo();
        }
      };

      // 타임스탬프 포맷팅 함수 (시:분:초 형식)
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
            YouTube URL을 입력해주세요. URL을 입력하면 영상이 로드됩니다.
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center w-full">
          {/* 타임스탬프 추가 버튼 - 디자인 개선 */}
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
            <span className="font-medium">타임스탬프 추가</span>
            <span className="text-xs ml-1 bg-blue-500 px-2 py-0.5 rounded-full">
              {isPlaying ? "재생중" : "정지됨"}
            </span>
          </button>

          {/* YouTube 영상 */}
          <div className="relative w-full max-w-[640px]">
            <div className="relative" style={{ paddingBottom: "56.25%" }}>
              <div id={playerContainerId} className="absolute top-0 left-0 w-full h-full" />
            </div>
          </div>

          {/* 타임스탬프 목록 */}
          <div className="w-full max-w-[640px] mt-2 p-3 bg-gray-100 rounded-md text-gray-800 text-sm">
            {timestamps.length > 0 ? (
              <div>
                <strong>타임스탬프:</strong>
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
                        {formatTime(timestamp)} ({timestamp.toFixed(2)}초)
                      </span>
                      <span className="text-blue-600 text-xs">클릭하여 이동</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>타임스탬프가 없습니다. 비디오를 재생한 후 타임스탬프 추가 버튼을 클릭하세요.</div>
            )}
          </div>
        </div>
      );
    },
  }
);