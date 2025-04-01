import { useRoom } from "@liveblocks/react/suspense";
import { useEffect, useState } from "react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteSchema, filterSuggestionItems, defaultBlockSpecs } from "@blocknote/core";
import { SuggestionMenuController, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useSelf } from "@liveblocks/react";
import stringToColor from "@/lib/stringToColor";
import { YouTubeBlock } from "./YouTubeBlock"; // 기존 YoutubeBlock 컴포넌트
import { YoutubeTimestamp } from "./YoutubeTimestamp"; // 새로 만든 YoutubeTimestamp 컴포넌트
import { getDefaultReactSlashMenuItems } from "@blocknote/react";

type EditorProps = {
  doc: Y.Doc;
  provider: any;
  darkMode: boolean;
};

function BlockNote({ doc, provider, darkMode }: EditorProps) {
  const userInfo = useSelf((me) => me.info);
  const editor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: userInfo?.name || "Anonymous",
        color: stringToColor(userInfo?.email || "default@email.com"),
      },
    },
    schema: BlockNoteSchema.create({
      blockSpecs: {
        ...defaultBlockSpecs,
        youtube: YouTubeBlock, // 기존 YoutubeBlock 유지
        youtubetimestamp: YoutubeTimestamp, // 새로운 YoutubeTimestamp 추가
      },
    }),
  });

  return (
    <div className="relative max-w-6xl mx-auto">
      <BlockNoteView
        editor={editor}
        className="min-h-screen"
        theme={darkMode ? "dark" : "light"}
        slashMenu={false} // 기본 슬래시 메뉴 비활성화
      >
        <SuggestionMenuController
  triggerCharacter={"/"} // 슬래시 메뉴의 트리거 문자
  getItems={async (query) => {
    const defaultItems = getDefaultReactSlashMenuItems(editor);

    // YouTube 블록 추가 항목
    const youtubeItem = {
      title: "YouTube",
      onItemClick: () => {
        const url = prompt("Enter YouTube URL:");
        if (url) {
          editor.insertBlocks(
            [
              {
                type: "youtube", // YouTube 블록 추가
                props: { url },
              },
            ],
            editor.getTextCursorPosition().block,
            "after"
          );
        }
      },
    };

    // YouTube Timestamp 블록 추가 항목
    const youtubeTimestampItem = {
      title: "YouTube Timestamp",
      onItemClick: () => {
        const url = prompt("불러올 URL을 입력하세요.");
        if (url) {
          editor.insertBlocks(
            [
              {
                type: "youtubetimestamp", // YouTube 블록 추가
                props: { url }, // 타임스탬프 추가 기능을 포함한 URL
              },
            ],
            editor.getTextCursorPosition().block,
            "after"
          );
        }
      },
    };

    return filterSuggestionItems(
      [...defaultItems, youtubeItem, youtubeTimestampItem],
      query
    );
  }}
/>

      </BlockNoteView>
    </div>
  );
}

function Editor() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);
  }, [room]);

  if (!doc || !provider) {
    return null;
  }

  const style = `hover:text-white ${
    darkMode
      ? "text-gray-300 bg-gray-700 hover:bg-gray-100 hover:text-gray-700"
      : "text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-700"
  }`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 justify-end mb-10">
        <Button className={style} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>

      <BlockNote doc={doc} provider={provider} darkMode={darkMode} />
    </div>
  );
}

export default Editor;
