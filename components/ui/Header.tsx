"use client";

import Link from "next/link";

interface HeaderProps {
  logo?: React.ReactNode;
  navigation?: { label: string; href: string }[];
  actions?: React.ReactNode;
}

export default function Header({ logo, navigation, actions }: HeaderProps) {
  return (
    <header className="bg-#1c1212">
      <div className="max-w-1xl mx-auto px-2 py-2">
        <div className="flex justify-between gap-8">
          {/* Логотип */}
          <div className="flex items-center gap-1">
            {logo || (
              <img src="/images/Логотип.png" alt="logo" width={170} height={200}/>
            )}
          </div>

          {/* Навигация */}
          {navigation && (
            <nav className="mt-10 flex gap-30 last:mr-20">
              {navigation.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-gray-200 hover:text-red-950 font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Действия (кнопки, иконки) */}
          {actions && <div className="flex items-between gap-2 ml-auto">{actions}</div>}
        </div>
      </div>
    </header>
  );
}