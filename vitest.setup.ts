import '@testing-library/jest-dom'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// JSDOM Polyfills for Radix UI 
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

global.IntersectionObserver = class IntersectionObserver {
    root: any = null
    rootMargin: string = ''
    thresholds: ReadonlyArray<number> = []
    observe() { }
    unobserve() { }
    disconnect() { }
    takeRecords() { return [] }
}

if (typeof window !== 'undefined') {
    window.PointerEvent = class PointerEvent extends Event { } as any;
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();

    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(), // Deprecated
            removeListener: vi.fn(), // Deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
}

// Mock Next.js navigation (useRouter, etc.)
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn()
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => ''
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))
