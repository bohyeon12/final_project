// global.d.ts
declare global {
    interface Window {
      YT: any;  // YouTube API 객체를 글로벌로 선언
      onYouTubeIframeAPIReady: () => void;
    }
  }
  
    export {}; // 이 파일이 모듈로 인식되도록 하기 위해 추가