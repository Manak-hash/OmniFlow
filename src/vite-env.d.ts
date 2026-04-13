/// <reference types="vite/client" />

declare module '*.png' {
  const value: string
  export default value
}

declare module '*.jpg' {
  const value: string
  export default value
}

declare module '*.svg' {
  const value: React.FunctionComponent<React.SVGProps<React.SVGAttributes>>
  export default value
}
