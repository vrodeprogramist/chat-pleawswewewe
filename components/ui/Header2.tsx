"use client";

import Link from "next/link";

interface HeaderProps {
  logo?: React.ReactNode;
  navigation?: { label: string; href: string }[];
  actions?: React.ReactNode;
}

export default function Header2({ logo, navigation, actions }: HeaderProps) {
  return (
    <header className="bg-#1c1212">
      <div className="max-w-1xl mx-auto px-2 py-2">
        <div className="flex justify-center">
          
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