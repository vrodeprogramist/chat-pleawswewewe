import { Piazzolla } from 'next/font/google';

const pizzaola = Piazzolla({ 
  subsets: ['latin', 'cyrillic']
});


import Button from "@/components/ui/Button";
import { Children } from 'react';

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
    <section className={`${backgrounds[background] } ${pizzaola.className}  py-20 ` }>
      <div className="max-w-7xl mx-auto px-6">
        <div
          className={
            image
              ? "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              : "max-w-3xl mx-auto text-center"
          }
        >
          {/* Контент */}
          <div className="space-y-6">
            {subtitle && (
              <p className="text-gray-100 font-semibold text-sm uppercase tracking-wide">
                {subtitle}
              </p>
            )}

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              {title}
            </h1>
            {/* Кнопки */}
            {(primaryButton || secondaryButton) && (
              <div
                className={`flex flex-wrap gap-4 ${
                  !image ? "justify-center" : ""
                }`}
              >
                {primaryButton && (         
                  <Button
                  className='bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300'
                    // variant="primary"
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
                {description && (
                  <p className="text-xl  leading-relaxed">{description}</p>
                )}
              </div>
            )}
          </div>

          {/* Изображение */}
          {image && (
            <div className="flex items-center justify-center">{image}</div>
          )}
        </div>
      </div>
    </section>
  );
}
