// components/Header.tsx
"use client";

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "./Breadcrumbs";

function Header() {
  const { user } = useUser();
  const { t, i18n } = useTranslation();

  // 언어 변경 핸들러
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex items-center justify-between p-5">
      {/* 사용자 이름 + "공간" */}
      {user && (
        <h1 className="text-xl font-semibold">
          {t("header.userSpace", { name: user.firstName || "User" })}
        </h1>
      )}

      <Breadcrumbs />

      <div className="flex items-center gap-3">
        {/* 언어 선택창 (프로필 왼쪽) */}
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
