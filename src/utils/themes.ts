/**
 * Premium Theme Definitions for OmniToys
 * Each theme includes complete color palette for a cohesive, premium feel
 */

export type ThemeCategory = 'cyberpunk' | 'retro' | 'gaming' | 'professional' | 'nature' | 'experimental'

export interface Theme {
  id: string
  name: string
  description: string
  category: ThemeCategory
  preview: {
    bg: string
    text: string
    accent: string
    glow: string
  }
  colors: {
    bg: string          // Main background
    bgSecondary: string // Secondary background (cards, panels)
    bgTertiary: string  // Tertiary background (inputs, etc.)
    text: string         // Primary text
    textSecondary: string // Secondary text (descriptions, labels)
    textTertiary: string // Tertiary text (placeholders, etc.)
    primary: string     // Primary accent (brand color)
    primaryHover: string // Primary hover state
    primaryGlow: string  // Primary glow/shadow
    accent: string       // Secondary accent (highlights, CTAs)
    accentGlow: string   // Accent glow/shadow
    border: string       // Border color
    borderHover: string // Border hover state
    success: string      // Success color (green)
    warning: string      //Warning color (yellow/orange)
    error: string        // Error color (red)
  }
  // Typography
  fontFamily: string
  headingWeight: string
  // Accessibility metadata
  accessibility: {
    contrastRatio: number
    wcagLevel: 'AAA' | 'AA' | 'fail'
    colorblindSafe: {
      deuteranopia: boolean
      protanopia: boolean
      tritanopia: boolean
    }
  }
}

export const themes: Theme[] = [
  {
    id: 'cyberpunk-red',
    name: 'Cyberpunk Red',
    description: 'Default red-accented cyberpunk aesthetic',
    category: 'cyberpunk',
    preview: {
      bg: '#252826',
      text: '#f5f5f8',
      accent: '#df1c26',
      glow: 'rgba(223, 28, 38, 0.5)'
    },
    colors: {
      bg: '#252826',
      bgSecondary: 'rgba(255, 255, 255, 0.05)',
      bgTertiary: 'rgba(255, 255, 255, 0.02)',
      text: '#f5f5f8',
      textSecondary: 'rgba(245, 245, 248, 0.6)',
      textTertiary: 'rgba(245, 245, 248, 0.4)',
      primary: '#df1c26',
      primaryHover: '#e62839',
      primaryGlow: 'rgba(223, 28, 38, 0.5)',
      accent: '#4d9fff',
      accentGlow: 'rgba(77, 159, 255, 0.4)',
      border: 'rgba(245, 245, 248, 0.1)',
      borderHover: 'rgba(223, 28, 38, 0.3)',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#ef4444'
    },
    fontFamily: "'Outfit', sans-serif",
    headingWeight: '900',
    accessibility: {
      contrastRatio: 12.5,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: false,
        tritanopia: true
      }
    }
  },
  {
    id: 'matrix',
    name: 'Matrix',
    description: 'Green terminal code rain aesthetic',
    category: 'retro',
    preview: {
      bg: '#0a0a0a',
      text: '#00ff41',
      accent: '#00ff41',
      glow: 'rgba(0, 255, 65, 0.6)'
    },
    colors: {
      bg: '#0a0a0a',
      bgSecondary: 'rgba(0, 255, 65, 0.03)',
      bgTertiary: 'rgba(0, 255, 65, 0.01)',
      text: '#00ff41',
      textSecondary: 'rgba(0, 255, 65, 0.7)',
      textTertiary: 'rgba(0, 255, 65, 0.5)',
      primary: '#00ff41',
      primaryHover: '#00cc33',
      primaryGlow: 'rgba(0, 255, 65, 0.6)',
      accent: '#00ff41',
      accentGlow: 'rgba(0, 255, 65, 0.4)',
      border: 'rgba(0, 255, 65, 0.2)',
      borderHover: 'rgba(0, 255, 65, 0.4)',
      success: '#00ff41',
      warning: '#ffff00',
      error: '#ff0000'
    },
    fontFamily: "'JetBrains Mono', monospace",
    headingWeight: '700',
    accessibility: {
      contrastRatio: 15.8,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'cobalt',
    name: 'Cobalt Deep',
    description: 'Deep ocean blue professional theme',
    category: 'gaming',
    preview: {
      bg: '#0c1929',
      text: '#f1f5f9',
      accent: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.5)'
    },
    colors: {
      bg: '#0c1929',
      bgSecondary: 'rgba(56, 189, 248, 0.05)',
      bgTertiary: 'rgba(56, 189, 248, 0.02)',
      text: '#f1f5f9',
      textSecondary: 'rgba(241, 245, 249, 0.6)',
      textTertiary: 'rgba(241, 245, 249, 0.4)',
      primary: '#38bdf8',
      primaryHover: '#0ea5e9',
      primaryGlow: 'rgba(56, 189, 248, 0.5)',
      accent: '#22d3ee',
      accentGlow: 'rgba(34, 211, 238, 0.4)',
      border: 'rgba(56, 189, 248, 0.15)',
      borderHover: 'rgba(56, 189, 248, 0.3)',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    fontFamily: "'Outfit', sans-serif",
    headingWeight: '800',
    accessibility: {
      contrastRatio: 13.2,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'cyber-amber',
    name: 'Cyber Amber',
    description: 'Warm retro-futuristic amber aesthetic',
    category: 'cyberpunk',
    preview: {
      bg: '#1a1612',
      text: '#fef3c7',
      accent: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.6)'
    },
    colors: {
      bg: '#1a1612',
      bgSecondary: 'rgba(245, 158, 11, 0.05)',
      bgTertiary: 'rgba(245, 158, 11, 0.02)',
      text: '#fef3c7',
      textSecondary: 'rgba(254, 243, 199, 0.6)',
      textTertiary: 'rgba(254, 243, 199, 0.4)',
      primary: '#f59e0b',
      primaryHover: '#d97706',
      primaryGlow: 'rgba(245, 158, 11, 0.6)',
      accent: '#fbbf24',
      accentGlow: 'rgba(251, 191, 36, 0.4)',
      border: 'rgba(245, 158, 11, 0.15)',
      borderHover: 'rgba(245, 158, 11, 0.3)',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#ef4444'
    },
    fontFamily: "'Outfit', sans-serif",
    headingWeight: '900',
    accessibility: {
      contrastRatio: 11.8,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: false,
        tritanopia: true
      }
    }
  },
  {
    id: 'neon-purple',
    name: 'Neon Purple',
    description: 'Vibrant purple-pink cyberpunk aesthetic',
    category: 'cyberpunk',
    preview: {
      bg: '#1a1025',
      text: '#f0abfc',
      accent: '#e879f9',
      glow: 'rgba(232, 121, 249, 0.5)'
    },
    colors: {
      bg: '#1a1025',
      bgSecondary: 'rgba(232, 121, 249, 0.05)',
      bgTertiary: 'rgba(232, 121, 249, 0.02)',
      text: '#f0abfc',
      textSecondary: 'rgba(240, 171, 252, 0.6)',
      textTertiary: 'rgba(240, 171, 252, 0.4)',
      primary: '#e879f9',
      primaryHover: '#c026d3',
      primaryGlow: 'rgba(232, 121, 249, 0.5)',
      accent: '#f0abfc',
      accentGlow: 'rgba(240, 171, 252, 0.4)',
      border: 'rgba(232, 121, 249, 0.15)',
      borderHover: 'rgba(232, 121, 249, 0.3)',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#ef4444'
    },
    fontFamily: "'Outfit', sans-serif",
    headingWeight: '900',
    accessibility: {
      contrastRatio: 9.4,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'slate',
    name: 'Slate Pro',
    description: 'Clean gray professional theme',
    category: 'professional',
    preview: {
      bg: '#0f172a',
      text: '#f1f5f9',
      accent: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.5)'
    },
    colors: {
      bg: '#0f172a',
      bgSecondary: 'rgba(59, 130, 246, 0.05)',
      bgTertiary: 'rgba(59, 130, 246, 0.02)',
      text: '#f1f5f9',
      textSecondary: 'rgba(241, 245, 249, 0.6)',
      textTertiary: 'rgba(241, 245, 249, 0.4)',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryGlow: 'rgba(59, 130, 246, 0.5)',
      accent: '#64748b',
      accentGlow: 'rgba(100, 116, 139, 0.4)',
      border: 'rgba(148, 163, 184, 0.15)',
      borderHover: 'rgba(59, 130, 246, 0.3)',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    fontFamily: "'Inter', sans-serif",
    headingWeight: '700',
    accessibility: {
      contrastRatio: 12.8,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'midnight',
    name: 'Midnight Luxe',
    description: 'Elegant deep blue-black premium theme',
    category: 'professional',
    preview: {
      bg: '#020617',
      text: '#e2e8f0',
      accent: '#818cf8',
      glow: 'rgba(129, 140, 248, 0.5)'
    },
    colors: {
      bg: '#020617',
      bgSecondary: 'rgba(129, 140, 248, 0.05)',
      bgTertiary: 'rgba(129, 140, 248, 0.02)',
      text: '#e2e8f0',
      textSecondary: 'rgba(226, 232, 240, 0.6)',
      textTertiary: 'rgba(226, 232, 240, 0.4)',
      primary: '#818cf8',
      primaryHover: '#6366f1',
      primaryGlow: 'rgba(129, 140, 248, 0.5)',
      accent: '#a5b4fc',
      accentGlow: 'rgba(165, 180, 252, 0.4)',
      border: 'rgba(129, 140, 248, 0.15)',
      borderHover: 'rgba(129, 140, 248, 0.3)',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#ef4444'
    },
    fontFamily: "'Outfit', sans-serif",
    headingWeight: '800',
    accessibility: {
      contrastRatio: 14.6,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    description: 'Pastel pink-purple sunset aesthetic',
    category: 'nature',
    preview: {
      bg: '#2d1b4e',
      text: '#ff79c6',
      accent: '#ff71ce',
      glow: 'rgba(255, 113, 206, 0.5)'
    },
    colors: {
      bg: '#2d1b4e',
      bgSecondary: 'rgba(255, 113, 206, 0.05)',
      bgTertiary: 'rgba(255, 113, 206, 0.02)',
      text: '#ff79c6',
      textSecondary: 'rgba(255, 121, 198, 0.6)',
      textTertiary: 'rgba(255, 121, 198, 0.4)',
      primary: '#ff71ce',
      primaryHover: '#e055a5',
      primaryGlow: 'rgba(255, 113, 206, 0.5)',
      accent: '#ffb7b2',
      accentGlow: 'rgba(255, 183, 178, 0.4)',
      border: 'rgba(255, 113, 206, 0.15)',
      borderHover: 'rgba(255, 113, 206, 0.3)',
      success: '#69f0ae',
      warning: '#ffd60a',
      error: '#ff5c8d'
    },
    fontFamily: "'Outfit', sans-serif",
    headingWeight: '700',
    accessibility: {
      contrastRatio: 8.2,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'gameboy',
    name: 'Game Boy Classic',
    description: 'Original Nintendo Game Boy 4-color LCD palette',
    category: 'retro',
    preview: {
      bg: '#9bbc0f',
      text: '#0f380f',
      accent: '#8bac0f',
      glow: 'rgba(15, 56, 15, 0.3)'
    },
    colors: {
      bg: '#9bbc0f',
      bgSecondary: '#8bac0f',
      bgTertiary: '#306230',
      text: '#0f380f',
      textSecondary: '#0f380f',
      textTertiary: '#306230',
      primary: '#0f380f',
      primaryHover: '#0f380f',
      primaryGlow: 'rgba(15, 56, 15, 0.3)',
      accent: '#8bac0f',
      accentGlow: 'rgba(139, 172, 15, 0.2)',
      border: '#306230',
      borderHover: '#0f380f',
      success: '#0f380f',
      warning: '#8bac0f',
      error: '#306230'
    },
    fontFamily: "'Courier New', monospace",
    headingWeight: '400',
    accessibility: {
      contrastRatio: 6.8,
      wcagLevel: 'AA',
      colorblindSafe: {
        deuteranopia: false,
        protanopia: false,
        tritanopia: true
      }
    }
  },
  {
    id: 'windows95',
    name: 'Windows 95',
    description: 'Classic Microsoft Windows 95 desktop aesthetic',
    category: 'retro',
    preview: {
      bg: '#008080',
      text: '#000000',
      accent: '#000080',
      glow: 'rgba(0, 0, 128, 0.3)'
    },
    colors: {
      bg: '#008080',
      bgSecondary: '#c0c0c0',
      bgTertiary: '#dfdfdf',
      text: '#000000',
      textSecondary: '#000000',
      textTertiary: '#808080',
      primary: '#000080',
      primaryHover: '#0000ff',
      primaryGlow: 'rgba(0, 0, 128, 0.3)',
      accent: '#800000',
      accentGlow: 'rgba(128, 0, 0, 0.2)',
      border: '#808080',
      borderHover: '#000000',
      success: '#008000',
      warning: '#808000',
      error: '#800000'
    },
    fontFamily: "'Segoe UI', sans-serif",
    headingWeight: '700',
    accessibility: {
      contrastRatio: 11.2,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'steampunk',
    name: 'Steampunk',
    description: 'Victorian industrial brass and copper aesthetic',
    category: 'retro',
    preview: {
      bg: '#1a1409',
      text: '#d4a574',
      accent: '#cd7f32',
      glow: 'rgba(205, 127, 50, 0.5)'
    },
    colors: {
      bg: '#1a1409',
      bgSecondary: 'rgba(205, 127, 50, 0.08)',
      bgTertiary: 'rgba(205, 127, 50, 0.03)',
      text: '#d4a574',
      textSecondary: 'rgba(212, 165, 116, 0.7)',
      textTertiary: 'rgba(212, 165, 116, 0.5)',
      primary: '#cd7f32',
      primaryHover: '#daa520',
      primaryGlow: 'rgba(205, 127, 50, 0.5)',
      accent: '#b87333',
      accentGlow: 'rgba(184, 115, 51, 0.4)',
      border: 'rgba(212, 165, 116, 0.2)',
      borderHover: 'rgba(205, 127, 50, 0.4)',
      success: '#228b22',
      warning: '#daa520',
      error: '#8b0000'
    },
    fontFamily: "'Times New Roman', serif",
    headingWeight: '700',
    accessibility: {
      contrastRatio: 8.4,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'paper-ink',
    name: 'Paper & Ink',
    description: 'Warm paper with crisp ink typography',
    category: 'professional',
    preview: {
      bg: '#f4ecd8',
      text: '#1a1a1a',
      accent: '#c0392b',
      glow: 'rgba(192, 57, 43, 0.2)'
    },
    colors: {
      bg: '#f4ecd8',
      bgSecondary: '#fffef5',
      bgTertiary: '#f9f1dd',
      text: '#1a1a1a',
      textSecondary: 'rgba(26, 26, 26, 0.7)',
      textTertiary: 'rgba(26, 26, 26, 0.5)',
      primary: '#2c3e50',
      primaryHover: '#34495e',
      primaryGlow: 'rgba(44, 62, 80, 0.15)',
      accent: '#c0392b',
      accentGlow: 'rgba(192, 57, 43, 0.2)',
      border: 'rgba(26, 26, 26, 0.1)',
      borderHover: 'rgba(192, 57, 43, 0.3)',
      success: '#27ae60',
      warning: '#f39c12',
      error: '#e74c3c'
    },
    fontFamily: "'Georgia', serif",
    headingWeight: '600',
    accessibility: {
      contrastRatio: 14.2,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'tron',
    name: 'Tron Legacy',
    description: 'Electric blue digital grid with white glow',
    category: 'gaming',
    preview: {
      bg: '#0a0a0a',
      text: '#00ffff',
      accent: '#ffffff',
      glow: 'rgba(0, 255, 255, 0.6)'
    },
    colors: {
      bg: '#0a0a0a',
      bgSecondary: 'rgba(0, 255, 255, 0.03)',
      bgTertiary: 'rgba(0, 255, 255, 0.01)',
      text: '#00ffff',
      textSecondary: 'rgba(0, 255, 255, 0.7)',
      textTertiary: 'rgba(0, 255, 255, 0.5)',
      primary: '#00ffff',
      primaryHover: '#66ffff',
      primaryGlow: 'rgba(0, 255, 255, 0.6)',
      accent: '#ffffff',
      accentGlow: 'rgba(255, 255, 255, 0.5)',
      border: 'rgba(0, 255, 255, 0.3)',
      borderHover: 'rgba(0, 255, 255, 0.6)',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0066'
    },
    fontFamily: "'Arial Black', sans-serif",
    headingWeight: '900',
    accessibility: {
      contrastRatio: 10.8,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'halo',
    name: 'Halo HUD',
    description: 'Covenant-inspired cyan and metallic gray UI',
    category: 'gaming',
    preview: {
      bg: '#0d1117',
      text: '#00a8eb',
      accent: '#107c10',
      glow: 'rgba(0, 168, 235, 0.5)'
    },
    colors: {
      bg: '#0d1117',
      bgSecondary: 'rgba(0, 168, 235, 0.05)',
      bgTertiary: 'rgba(0, 168, 235, 0.02)',
      text: '#00a8eb',
      textSecondary: 'rgba(0, 168, 235, 0.7)',
      textTertiary: 'rgba(0, 168, 235, 0.5)',
      primary: '#00a8eb',
      primaryHover: '#33c2ff',
      primaryGlow: 'rgba(0, 168, 235, 0.5)',
      accent: '#107c10',
      accentGlow: 'rgba(16, 124, 16, 0.4)',
      border: 'rgba(0, 168, 235, 0.2)',
      borderHover: 'rgba(0, 168, 235, 0.4)',
      success: '#107c10',
      warning: '#ffaa00',
      error: '#e81123'
    },
    fontFamily: "'Segoe UI', sans-serif",
    headingWeight: '700',
    accessibility: {
      contrastRatio: 9.6,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'portal',
    name: 'Portal',
    description: 'Aperture Science orange and clean white UI',
    category: 'gaming',
    preview: {
      bg: '#1a1a1a',
      text: '#ffffff',
      accent: '#ff9632',
      glow: 'rgba(255, 150, 50, 0.6)'
    },
    colors: {
      bg: '#1a1a1a',
      bgSecondary: 'rgba(255, 150, 50, 0.05)',
      bgTertiary: 'rgba(255, 150, 50, 0.02)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      textTertiary: 'rgba(255, 255, 255, 0.5)',
      primary: '#ff9632',
      primaryHover: '#ffb366',
      primaryGlow: 'rgba(255, 150, 50, 0.6)',
      accent: '#00d9ff',
      accentGlow: 'rgba(0, 217, 255, 0.5)',
      border: 'rgba(255, 150, 50, 0.3)',
      borderHover: 'rgba(255, 150, 50, 0.6)',
      success: '#00ff96',
      warning: '#ffcc00',
      error: '#ff3333'
    },
    fontFamily: "'Verdana', sans-serif",
    headingWeight: '700',
    accessibility: {
      contrastRatio: 16.8,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'masseffect',
    name: 'Mass Effect',
    description: 'Galaxy map blues with orange holographic UI',
    category: 'gaming',
    preview: {
      bg: '#0a0e13',
      text: '#ecf0f1',
      accent: '#ff6b35',
      glow: 'rgba(255, 107, 53, 0.5)'
    },
    colors: {
      bg: '#0a0e13',
      bgSecondary: 'rgba(255, 107, 53, 0.05)',
      bgTertiary: 'rgba(255, 107, 53, 0.02)',
      text: '#ecf0f1',
      textSecondary: 'rgba(236, 240, 241, 0.6)',
      textTertiary: 'rgba(236, 240, 241, 0.4)',
      primary: '#ff6b35',
      primaryHover: '#ff8c61',
      primaryGlow: 'rgba(255, 107, 53, 0.5)',
      accent: '#3498db',
      accentGlow: 'rgba(52, 152, 219, 0.4)',
      border: 'rgba(255, 107, 53, 0.2)',
      borderHover: 'rgba(255, 107, 53, 0.4)',
      success: '#2ecc71',
      warning: '#f1c40f',
      error: '#e74c3c'
    },
    fontFamily: "'Arial', sans-serif",
    headingWeight: '800',
    accessibility: {
      contrastRatio: 13.4,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'cyberpunk2077',
    name: 'Cyberpunk 2077',
    description: 'Night City yellow with cyan glitch effects',
    category: 'cyberpunk',
    preview: {
      bg: '#0c0c0c',
      text: '#fff700',
      accent: '#00ffff',
      glow: 'rgba(255, 247, 0, 0.6)'
    },
    colors: {
      bg: '#0c0c0c',
      bgSecondary: 'rgba(255, 255, 0, 0.03)',
      bgTertiary: 'rgba(0, 255, 255, 0.02)',
      text: '#fff700',
      textSecondary: 'rgba(255, 247, 0, 0.7)',
      textTertiary: 'rgba(255, 247, 0, 0.5)',
      primary: '#fff700',
      primaryHover: '#ffff4d',
      primaryGlow: 'rgba(255, 247, 0, 0.6)',
      accent: '#00ffff',
      accentGlow: 'rgba(0, 255, 255, 0.5)',
      border: 'rgba(255, 247, 0, 0.2)',
      borderHover: 'rgba(0, 255, 255, 0.4)',
      success: '#00ff00',
      warning: '#ff8800',
      error: '#ff0000'
    },
    fontFamily: "'Arial', sans-serif",
    headingWeight: '700',
    accessibility: {
      contrastRatio: 15.6,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'monochrome-amber',
    name: 'Monochrome Amber',
    description: 'Single-color amber like old CRT monitors',
    category: 'experimental',
    preview: {
      bg: '#0a0800',
      text: '#ffb000',
      accent: '#ffb000',
      glow: 'rgba(255, 176, 0, 0.5)'
    },
    colors: {
      bg: '#0a0800',
      bgSecondary: 'rgba(255, 191, 0, 0.05)',
      bgTertiary: 'rgba(255, 191, 0, 0.02)',
      text: '#ffb000',
      textSecondary: 'rgba(255, 176, 0, 0.7)',
      textTertiary: 'rgba(255, 176, 0, 0.5)',
      primary: '#ffb000',
      primaryHover: '#ffcc00',
      primaryGlow: 'rgba(255, 176, 0, 0.5)',
      accent: '#ffb000',
      accentGlow: 'rgba(255, 176, 0, 0.4)',
      border: 'rgba(255, 176, 0, 0.2)',
      borderHover: 'rgba(255, 176, 0, 0.4)',
      success: '#ffb000',
      warning: '#ffb000',
      error: '#ffb000'
    },
    fontFamily: "'Courier New', monospace",
    headingWeight: '400',
    accessibility: {
      contrastRatio: 7.2,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  },
  {
    id: 'gradient-flow',
    name: 'Gradient Flow',
    description: 'Animated color gradients that slowly shift over time',
    category: 'experimental',
    preview: {
      bg: '#1a1a2e',
      text: '#ffffff',
      accent: '#ff6b6b',
      glow: 'rgba(255, 107, 107, 0.5)'
    },
    colors: {
      bg: '#1a1a2e',
      bgSecondary: 'rgba(255, 255, 255, 0.05)',
      bgTertiary: 'rgba(255, 255, 255, 0.02)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.6)',
      textTertiary: 'rgba(255, 255, 255, 0.4)',
      primary: '#ff6b6b',
      primaryHover: '#ff8787',
      primaryGlow: 'rgba(255, 107, 107, 0.5)',
      accent: '#4ecdc4',
      accentGlow: 'rgba(78, 205, 196, 0.4)',
      border: 'rgba(255, 255, 255, 0.1)',
      borderHover: 'rgba(255, 107, 107, 0.3)',
      success: '#a8e6cf',
      warning: '#ffd93d',
      error: '#ff6b6b'
    },
    fontFamily: "'Poppins', sans-serif",
    headingWeight: '700',
    accessibility: {
      contrastRatio: 14.8,
      wcagLevel: 'AAA',
      colorblindSafe: {
        deuteranopia: true,
        protanopia: true,
        tritanopia: true
      }
    }
  }
]

export const defaultTheme = themes[0] // Cyberpunk Red is default

/**
 * Get theme by ID
 */
export function getThemeById(id: string): Theme {
  return themes.find(t => t.id === id) || defaultTheme
}

/**
 * Apply theme to CSS variables
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement

  // Apply all color variables
  root.style.setProperty('--color-bg', theme.colors.bg)
  root.style.setProperty('--color-bg-secondary', theme.colors.bgSecondary)
  root.style.setProperty('--color-bg-tertiary', theme.colors.bgTertiary)
  root.style.setProperty('--color-text', theme.colors.text)
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary)
  root.style.setProperty('--color-text-tertiary', theme.colors.textTertiary)
  root.style.setProperty('--color-primary', theme.colors.primary)
  root.style.setProperty('--color-primary-hover', theme.colors.primaryHover)
  root.style.setProperty('--color-primary-glow', theme.colors.primaryGlow)
  root.style.setProperty('--color-accent', theme.colors.accent)
  root.style.setProperty('--color-accent-glow', theme.colors.accentGlow)
  root.style.setProperty('--color-border', theme.colors.border)
  root.style.setProperty('--color-border-hover', theme.colors.borderHover)
  root.style.setProperty('--color-success', theme.colors.success)
  root.style.setProperty('--color-warning', theme.colors.warning)
  root.style.setProperty('--color-error', theme.colors.error)

  // Apply font
  root.style.setProperty('--font-family', theme.fontFamily)
  root.style.setProperty('--font-heading-weight', theme.headingWeight)
}
