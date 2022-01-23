# gnome-shell-clip-note

- Save clip contents (`ClipboardType.PRIMARY` means mouse selected text) to multiple notes with separate tags.
- Notes locate at `~/.local/share/clip-note/`. *You can soft link this directory to anywhere as you wish.*
- Dots in filename means splited tags.
- This extension just moves my bash script [y](https://github.com/eexpress/bin/blob/master/y) to the GUI interface.
- I wonder if file operations such as *new / open / rename / delete / refresh* should be done by my extension, although I put all the icons in the software interface.

![screenshot](screenshot.png)

```
⭕ tree ~/.local/share/gnome-shell/extensions/clip-note@eexpss.gmail.com
├── clip-note-symbolic.svg
├── extension.js
├── metadata.json
└── stylesheet.css
```