# init step

- pn create next-app@latest
- pnx shadcn-ui@latest init

- add script to package.json to expose host to mobile and network: `"dev": "next dev -H 0.0.0.0",`

**packages:**
pn add @blocknote/core @blocknote/react @blocknote/mantine @mantine/core @mantine/hooks @mantine/utils

pn add @phosphor-icons/react@latest
pn add tiptap/react @tiptap/starter-kit @tiptap/pm
@tiptap/core @tiptap/extension-bubble-menu @tiptap/extension-color @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-table @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-table-row @tiptap/extension-text-style @tiptap/pm @tiptap/react @tiptap/starter-kit @tiptap/suggestion

pnpm add react-hook-form @hookform/resolvers

pn add crypto-js html2pdf.js jspdf modern-screenshot react-to-print secure-ls tippy.js

pn add zod
pnpm add swr

**shadcn**
pnx shadcn@latest init

pnx shadcn@latest add card button input sonner drawer skeleton command popover
