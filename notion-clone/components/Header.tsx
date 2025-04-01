<<<<<<< HEAD
'use client'

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Breadcrumbs from "./Breadcrumbs";
 
function Header() {
    const {user} = useUser();
  return (
    <div className="flex items-center justify-between p-5">
      {user &&(
        <h1>
            {user?.firstName}
            {`'s`} Space
        </h1>
      )}

      <Breadcrumbs/>

      <div>
        <SignedOut>
            <SignInButton /> 
        </SignedOut>
        <SignedIn>
            <UserButton />
        </SignedIn>
      </div>
    </div>
  )
}

export default Header
=======
// components/Header.tsx
"use client";

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "./Breadcrumbs";
import Link from "next/link";

function Header() {
  const { user } = useUser();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex items-center justify-between p-5">
      {/* 왼쪽: 사용자 이름 */}
      {user && (
        <h1 className="text-xl font-semibold">
          {t("header.userSpace", { name: user.firstName || "User" })}
        </h1>
      )}

      <div className="flex items-center gap-4">
        <Breadcrumbs />
        <Link
          href="/videos"
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm font-medium"
        >
          🎬 Videos
        </Link>
      </div>

      {/* 오른쪽: 언어 선택 + 로그인/유저 버튼 */}
      <div className="flex items-center gap-3">
        <select
          onChange={(e) => changeLanguage(e.target.value)}
          value={i18n.language}
          className="border rounded-md px-2 py-1"
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="zh">中文</option>
        </select>

        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}

export default Header;
>>>>>>> c350f983adaabd5b47b386329954a82136268f6f
