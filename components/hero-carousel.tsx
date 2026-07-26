"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CarouselSlide } from "@/lib/types"
import Image from "next/image"

interface HeroCarouselProps {
  slides: CarouselSlide[]
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    if (slides.length <= 1 || isHovered) return
    const interval = setInterval(nextSlide, 4000)
    return () => clearInterval(interval)
  }, [slides.length, nextSlide, isHovered])

  if (slides.length === 0) {
    return (
      <section className="relative mb-4 sm:mb-8 overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#7C5C3E] via-[#A8845C] to-[#C8956A] shadow-2xl">
        <div className="relative flex aspect-[16/7] sm:aspect-[3/1] min-h-[120px] sm:min-h-[200px] items-center justify-center p-4 sm:p-12">
          <div className="text-center">
            <h2 className="mb-1 sm:mb-4 text-xl sm:text-5xl font-black text-white">Kartinka</h2>
            <p className="text-xs sm:text-xl text-white/90">{`Devorga ilingan go'zallik`}</p>
          </div>
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        </div>
      </section>
    )
  }

  return (
    <section
      className="relative mb-4 sm:mb-8 overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[16/7] sm:aspect-[3/1] w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              index === currentIndex
                ? "scale-100 opacity-100"
                : index < currentIndex
                  ? "-translate-x-full scale-95 opacity-0"
                  : "translate-x-full scale-95 opacity-0"
            }`}
          >
            {slide.link ? (
              <a href={slide.link} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
                <Image
                  src={slide.image_url || `https://placehold.co/1350x450/5200BB/FFFFFF/png?text=NEOX+Store`}
                  alt={`Slide ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </a>
            ) : (
              <Image
                src={slide.image_url || `https://placehold.co/1350x450/5200BB/FFFFFF/png?text=NEOX+Store`}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            )}
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {slides.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            onClick={prevSlide}
            className="absolute left-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border-0 bg-white/90 text-foreground shadow-xl backdrop-blur-sm transition-all hover:scale-110 hover:bg-white sm:left-5 sm:h-12 sm:w-12"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={nextSlide}
            className="absolute right-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border-0 bg-white/90 text-foreground shadow-xl backdrop-blur-sm transition-all hover:scale-110 hover:bg-white sm:right-5 sm:h-12 sm:w-12"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  index === currentIndex ? "w-8 bg-[#7C5C3E] shadow-lg" : "w-2.5 bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
