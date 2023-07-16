# Minimalistic workflow
An extremely simple workflow framework plugin, the goal is to provide a plugin that can easily customize the workflow (at least the goal is this).

The plugin has a built-in todo/doing/done workflow, which is an extremely simple example that provides a dock view, a swipe menu, and an automatic transition after clicking.

If you need to implement a custom workflow, please clone this project, implement your own WorkFlow (defined in src/types/index.d.ts), and add it to src\allWorkFlow.ts.