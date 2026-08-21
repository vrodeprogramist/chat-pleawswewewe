import { Piazzolla } from "next/font/google";

const pizzaola = Piazzolla({
  subsets: ["latin", "cyrillic"],
});

import Button from "@/components/ui/Button";
import { Children } from "react";

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryButton?: {
    text: string;
    onClick: () => void;
    reverse?: boolean;
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
  };
  image?: React.ReactNode;
  background?: "gradient" | "solid" | "image";
}

export default function Hero({
  title,
  subtitle,
  description,
  primaryButton,
  secondaryButton,
  image,
  background = "solid",
}: HeroProps) {
  const backgrounds = {
    gradient: "bg-gradient-to-br from-blue-50 to-indigo-100",
    solid: "bg-#1c1212",
    image: "bg-#1c1212",
  };

  return (
    <section
      className={`${backgrounds[background]} ${pizzaola.className}  py-20 `}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div
          className={
            image ? "flex gap-12 items-center" : "max-w-3xl mx-auto text-center"
          }
        >
          {/* Изображение */}
          {image && (
            <div className="flex flex-col items-center w-1/3">
              <div className="flex items-center justify-center mb-6">
                {image}
              </div>
              {/* Кнопки под изображением */}
              {(primaryButton || secondaryButton) && (
                <div className="flex flex-wrap gap-4">
                  {primaryButton && (
                    <Button
                      className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300"
                      size="lg"
                      onClick={primaryButton.onClick}
                    >
                      {primaryButton.text}
                    </Button>
                  )}
                  {secondaryButton && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={secondaryButton.onClick}
                    >
                      {secondaryButton.text}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Контент */}
          <div className={image ? "w-2/3" : "w-full"}>
            {/* Заголовок */}
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              {title}
            </h1>
            
            {/* Субтитул */}
            {subtitle && (
              <p className="text-red-700 font-semibold text-sm uppercase tracking-wide mt-4">
                {subtitle}
              </p>
            )}
            
            {/* Описание под заголовком */}
            {description && (
              <p className="text-xl leading-relaxed mt-6 w-50">
                {description}
              </p>
            )}
            
            {/* Кнопки под описанием (только если нет изображения) */}
            {!image && (primaryButton || secondaryButton) && (
              <div className="flex flex-wrap gap-4 mt-8">
                {primaryButton && (
                  <Button
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300"
                    size="lg"
                    onClick={primaryButton.onClick}
                  >
                    {primaryButton.text}
                  </Button>
                )}
                {secondaryButton && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={secondaryButton.onClick}
                  >
                    {secondaryButton.text}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}