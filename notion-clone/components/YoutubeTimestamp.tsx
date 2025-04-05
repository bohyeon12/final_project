import { createReactBlockSpec } from "@blocknote/react";
import { useState, useEffect, useRef } from "react";

// YouTube API 로드 함수
const loadYouTubeAPI = () => {
  if (window.YT && window.YT.Player) return Promise.resolve();

  return new Promise((resolve) => {
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
      const [timestamps, setTimestamps] = useState<{ time: number; note: string }[]>(
        JSON.parse(block.props.timestamps || "[]")
      );
      const [newNote, setNewNote] = useState<string>("");
      // 내부 타이머를 위한 상태 추가
      const [currentTime, setCurrentTime] = useState<number>(0);
      const timerRef = useRef<number | null>(null);

      const playerRef = useRef<any>(null);
      const playerContainerId = `youtube-video-${block.id}`;
      const safeUpdateBlock = updateBlock || (() => {});

      const extractVideoId = (url: string) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
      };

      useEffect(() => {
        let ytPlayer: any = null;
        const videoId = extractVideoId(block.props.url);
        if (!videoId) {
          console.error("❌ Invalid YouTube URL");
          return;
        }

        const initPlayer = async () => {
          await loadYouTubeAPI();

          if (playerRef.current) {
            playerRef.current.destroy();
          }

          ytPlayer = new window.YT.Player(playerContainerId, {
            videoId,
            playerVars: { rel: 0, enablejsapi: 1 },
            events: {
              onReady: (event: any) => {
                const ytPlayer = event.target;
                playerRef.current = ytPlayer;
                setPlayer(ytPlayer);
                setPlayerReady(true);
                console.log("Player ready!");
              },
              onStateChange: (event: any) => {
                console.log("Player state changed:", event.data);
              },
              onError: (error: any) => {
                console.error("🚨 YouTube Player Error:", error);
              },
            },
          });
        };

        initPlayer();

        return () => {
          if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
          }
          
          // 타이머 정리
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
        };
      }, [block.props.url, block.id]);

      // 내부 타이머 설정을 위한 useEffect
      useEffect(() => {
        // 이전 타이머 정리
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // 플레이어가 준비되면 타이머 시작
        if (playerReady && player) {
          console.log("⏱️ 내부 타이머 시작");
          
          // 0.1초마다 시간 업데이트
          timerRef.current = window.setInterval(() => {
            try {
              const time = player.getCurrentTime();
              if (typeof time === 'number' && time >= 0) {
                setCurrentTime(time);
                // 디버깅용 로그 (필요시 활성화)
                // console.log("🕐 내부 타이머 시간:", time);
              }
            } catch (e) {
              console.error("⚠️ 타이머 업데이트 오류:", e);
            }
          }, 100); // 100ms마다 업데이트
        }
        
        return () => {
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
        };
      }, [playerReady, player]);

      const handleTimestampAdd = () => {
        if (!playerReady) {
          alert("YouTube Player가 아직 준비되지 않았습니다.");
          return;
        }

        // 내부 타이머의 시간 사용
        const time = currentTime;
        console.log("📍 현재 시간 (내부 타이머):", time);
        
        if (time > 0) {
          const newTimestamps = [...timestamps, { time, note: newNote }];
          setTimestamps(newTimestamps);
          setNewNote("");

          safeUpdateBlock({
            ...block,
            props: {
              ...block.props,
              timestamps: JSON.stringify(newTimestamps),
            },
          });
        } else {
          // 시간이 0이면 영상 재생 유도
          player.playVideo();
          alert("영상이 재생 중인지 확인해주세요. 재생을 시작합니다.");
        }
      };

      const handleDeleteTimestamp = (index: number) => {
        const newTimestamps = timestamps.filter((_, i) => i !== index);
        setTimestamps(newTimestamps);

        safeUpdateBlock({
          ...block,
          props: { ...block.props, timestamps: JSON.stringify(newTimestamps) },
        });
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

        const hoursStr = hours > 0 ? `${hours}:` : "";
        const minsStr = `${hours > 0 ? mins.toString().padStart(2, "0") : mins}:`;
        const secsStr = secs.toString().padStart(2, "0");

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
          <div className="relative w-full max-w-[640px] mb-4">
            <div className="relative" style={{ paddingBottom: "56.25%" }}>
              <div id={playerContainerId} className="absolute top-0 left-0 w-full h-full" />
            </div>
          </div>

          {/* 현재 시간 표시 (디버깅용) */}
          <div className="w-full max-w-[640px] mb-2 text-center text-gray-500">
            현재 시간: {formatTime(currentTime)} ({currentTime.toFixed(2)}초)
          </div>

          {/* 메모 입력 및 타임스탬프 추가 */}
          <div className="flex items-center gap-2 w-full max-w-[640px] mb-2">
            <input
              type="text"
              placeholder="메모를 입력하세요 (선택사항)"
              className="flex-1 border px-3 py-2 rounded-md shadow-sm"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <button
              className={`px-4 py-2 rounded-lg shadow-md transition-all duration-300 ${
                playerReady
                  ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
              onClick={handleTimestampAdd}
              disabled={!playerReady}
            >
              타임스탬프 추가
            </button>
          </div>

          {/* 타임스탬프 목록 */}
          <div className="w-full max-w-[640px] mt-2 p-3 bg-gray-100 rounded-md text-gray-800 text-sm">
            {timestamps.length > 0 ? (
              <ul className="space-y-2">
                {timestamps.map((item, index) => (
                  <li
                    key={index}
                    className="p-2 bg-white rounded shadow flex justify-between items-center"
                  >
                    <div
                      className="flex-1 cursor-pointer hover:underline"
                      onClick={() => jumpToTimestamp(item.time)}
                    >
                      <strong>{formatTime(item.time)}</strong>{" "}
                      <span className="text-gray-500 ml-1">
                        ({item.time.toFixed(2)}초)
                      </span>
                      {item.note && <span className="text-gray-600 ml-2">– {item.note}</span>}
                    </div>
                    <button
                      onClick={() => handleDeleteTimestamp(index)}
                      className="ml-4 text-red-500 hover:text-red-700 text-xs"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div>타임스탬프가 없습니다. 타임스탬프를 추가해보세요.</div>
            )}
          </div>
        </div>
      );
    },
  }
);