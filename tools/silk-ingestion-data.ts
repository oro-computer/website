// Original ownership policy and ordered editorial replacements.
export const EXCLUDE_BASENAMES = [
  "PLAN.md",
  "README.md",
  "STATUS.md",
  "TEMPLATE.md",
  "_template-language.md",
  "_template-stdlib.md",
  "arenas.md",
  "llms.txt",
  "style-guide.md"
]

export const KEEP_DOCS_PREFIXES = [
  "guides/"
]

export const KEEP_DOCS_FILES = [
  "compiler/backend-wasm.md",
  "compiler/implementation-status.md",
  "compiler/libsilk-quickstart.md",
  "compiler/testing-strategy.md",
  "compiler/zig-api.md",
  "start.md",
  "usage/cli-examples.md",
  "usage/editor-coc-nvim.md",
  "usage/editor-ctags.md",
  "usage/editor-textmate.md",
  "usage/editor-vim.md",
  "usage/getting-started.md",
  "usage/github-linguist.md",
  "usage/howto-custom-stdlib-root.md",
  "usage/howto-run-wasi-node.md",
  "usage/tutorials/01-first-program.md",
  "usage/tutorials/02-structs-and-impls.md",
  "usage/tutorials/03-arrays-and-slices.md",
  "usage/tutorials/04-filesystem.md",
  "usage/tutorials/05-concurrency.md",
  "usage/tutorials/06-async-io-streams-abort.md",
  "usage/tutorials/07-formal-silk.md"
]

export const KEEP_WIKI_FILES = [
  "start.md"
]

export const normalize_region_identifiers = [
  [
    "\\bexport const region global_arena\\b",
    "export const region global_region_buf"
  ],
  [
    "\\bconst region arena\\b",
    "const region region_buf"
  ],
  [
    "\\bwith arena\\b",
    "with region_buf"
  ],
  [
    "\\bfrom arena\\b",
    "from region_buf"
  ],
  [
    "\\bglobal_arena\\b",
    "global_region_buf"
  ],
  [
    "\\barena\\[",
    "region_buf["
  ],
  [
    "`arena`",
    "`region_buf`"
  ],
  [
    "`global_arena`",
    "`global_region_buf`"
  ]
]

export const normalize_editorial_framing = [
  [
    "\\bStatus:\\s*\\*\\*([^*]+)\\*\\*\\.\\s*",
    ""
  ],
  [
    "\\bStatus:\\s*\\*\\*([^*]+)\\*\\*\\s*",
    ""
  ],
  [
    "\\bStatus:\\s*",
    ""
  ],
  [
    "\\bImplementation status\\s*\\([^)]*\\)\\s*:\\s*",
    ""
  ],
  [
    "\\bImplementation status\\s*:\\s*",
    ""
  ],
  [
    "Returning readers typically want the “Implementation Status” section near the top",
    "Returning readers typically want the notes near the top"
  ],
  [
    "see “Implementation Status” below",
    "see the notes below"
  ],
  [
    "Implementation Status” sections",
    "notes sections"
  ],
  [
    "\\bCurrent supported contexts include\\b",
    "Supported contexts include"
  ],
  [
    "\\bcurrent supported\\b",
    "supported"
  ],
  [
    "\\bCurrent compiler subset restriction\\b",
    "Restriction"
  ],
  [
    "\\bthe current compiler subset\\b",
    "Silk currently"
  ],
  [
    "\\bThe current compiler subset\\b",
    "Silk currently"
  ],
  [
    "\\bcurrent compiler subset\\b",
    "current implementation"
  ],
  [
    "\\bCurrent subset\\b",
    "Supported forms"
  ],
  [
    "\\bcurrent subset\\b",
    "supported forms"
  ],
  [
    "\\bInitial implementation target\\b",
    "Implementation target"
  ],
  [
    "\\binitial implementation target\\b",
    "implementation target"
  ],
  [
    "\\binitial implementation\\b",
    "implementation"
  ],
  [
    "\\bInitial implementation\\b",
    "Implementation"
  ],
  [
    "\\bImplemented-subset notes\\b",
    "Notes"
  ],
  [
    "\\bImplemented-subset details\\b",
    "Reference details"
  ],
  [
    "\\bImplemented-subset\\b",
    "Reference"
  ],
  [
    "\\bImplemented subset notes\\b",
    "Notes"
  ],
  [
    "\\bimplemented subset notes\\b",
    "notes"
  ],
  [
    "\\bImplemented subset\\b",
    "Supported forms"
  ],
  [
    "\\bimplemented subset\\b",
    "supported forms"
  ],
  [
    "\\bImplemented Subset\\b",
    "Supported Forms"
  ],
  [
    "\\bInitial Implemented Subset\\b",
    "Supported Forms"
  ],
  [
    "\\bCurrent Implemented Subset\\b",
    "Supported Forms"
  ],
  [
    "\\bexamples that exercise the supported forms\\b",
    "examples"
  ],
  [
    "\\bExamples that exercise the supported forms\\b",
    "Examples"
  ],
  [
    "\\bactive expansion\\b",
    "current module surface"
  ],
  [
    "\\bPartially implemented\\b",
    "Implemented"
  ],
  [
    "\\bpartially implemented\\b",
    "implemented"
  ],
  [
    "\\bin progress\\b",
    "available"
  ],
  [
    "\\bIn progress\\b",
    "Available"
  ]
]
