"use client";

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
import { YouTubeBlock } from "./YouTubeBlock";
import { getDefaultReactSlashMenuItems } from "@blocknote/react";

type EditorProps = {
  doc: Y.Doc;
  provider: any;
  darkMode: boolean;
};

function BlockNote({doc, provider, darkMode} : EditorProps){
    const userInfo = useSelf((me) => me.info);
    const editor = useCreateBlockNote({
        collaboration: {
            provider,
            fragment : doc.getXmlFragment("document-store"),
            user : {
                name: userInfo?.name || "Anonymous",
                color: stringToColor(userInfo?.email || "default@email.com"),
            },
        },
        schema: BlockNoteSchema.create({
            blockSpecs: {
                ...defaultBlockSpecs,
                youtube: YouTubeBlock,
            }
        })
    });

    return (
        <div className="relative max-w-6xl mx-auto">
            <BlockNoteView 
            editor={editor}
            className="min-h-screen"
            theme={darkMode ? "dark" : "light"}
            slashMenu={false} // Disable the default slash menu
            >
            <SuggestionMenuController
                triggerCharacter={"/"} // Trigger character for the slash menu
                getItems={async (query) => {
                const defaultItems = getDefaultReactSlashMenuItems(editor);
                const youtubeItem = {
                    title: "YouTube",
                    onItemClick: () => {
                    const url = prompt("Enter YouTube URL:");
                    if (url) {
                        editor.insertBlocks(
                        [
                            {
                            type: "youtube",
                            props: { url },
                            },
                        ],
                        editor.getTextCursorPosition().block,
                        "after"
                        );
                    }
                    },
                };
                return filterSuggestionItems([...defaultItems, youtubeItem], query);
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
      {/* 다크모드 전환 버튼 (이 부분도 번역할 수 있음) */}
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
