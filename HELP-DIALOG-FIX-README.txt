Help dialog fixes

- Help text, model descriptions, capability chips, and attachment details now use the selected Persian/Arabic locale dictionary.
- Capability labels are passed through i18n instead of rendered as raw English.
- Dialog has a scrollable content area and a fixed bottom Close button, so Close remains visible even when content is long.
- Dialog uses a higher stacking order, closes on Escape or clicking the backdrop, and locks background page scrolling while open.
- Closing no longer requires a page refresh.

This is source code, not a deployed build. Run the project's normal install/build/deploy process after reviewing and merging it.
