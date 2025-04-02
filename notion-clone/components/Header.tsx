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
          Videos
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <select
          onChange={(e) => changeLanguage(e.target.value)}
          value={i18n.language}
          className="border rounded-md px-2 py-1"
        >
          <option value="ko">Korean</option>
          <option value="en">English</option>
          <option value="ja">Japanese</option>
          <option value="zh">Chinese</option>
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
