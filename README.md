# gnome-shell-clip-note

# gnome扩展：剪贴板摘录

- Save clip contents (`ClipboardType.PRIMARY` means mouse selected text) to multiple notes with separate tags.
- Notes locate at `~/.local/share/clip-note/`. *You can soft link this directory to anywhere as you wish.*
- Dots in filename means splited tags.
- This extension just moves my bash script [y](https://github.com/eexpress/bin/blob/master/y) to the GUI interface.
- 4 Function Buttons: Copy to file, Open Dir, Add new file, Refresh list.

- 保存剪辑内容（`ClipboardType.PRIMARY`表示鼠标选择的文本）到带有多个单独标签的多个笔记。
- 笔记位于`~/.local/share/clip-note/`。您可以根据需要将此目录软链接到任何位置。
- 文件名中的点表示分割的标签。
- 这个扩展只是将我的`bash`脚本 [y](https://github.com/eexpress/bin/blob/master/y) 改成图形界面。
- 4个功能按钮：复制到文件，打开目录，添加新文件，刷新列表。

- Operating instructions
    - First button is `Copy Clip to file below`, this is default function, no need to click.
    - Mouse select text anywhere, Open extension menu, Click one file name in list directlly, selected text will paste into the file.
    - Click `Add a New File` button, input filename as you wish. The dots in the file name will split the file name into colored tags. If you want cancel, just click first button. Those files is virtually added, if you do not copy content to file, press `refresh` button will clear them.
    - `Refresh file list` button is refresh actual exist files in note path. `Open Note Directory` means as it is.
    - On the left side of each file, there is an `open` button, which is displayed only when the mouse moves up (hover).
    - Tips all over those widget you can operate.
- I wonder if file operations such as *rename / delete* should be done by my extension.
- My 3rd JS program. Work in constant Guess.


- 操作说明
    - 第一个按钮是 `剪贴板摘录到下面文件`，这是默认功能，无需点击。
    - 鼠标在任意位置选择文本，打开扩展菜单，直接单击列表中的一个文件名，选定的文本将粘贴到文件中。
    - 点击 `增加一个笔记` 按钮，根据需要输入文件名。文件名中的点会将文件名拆分为彩色标签。 此时如果想要取消，只需单击第一个按钮。这些文件是虚拟添加的，如果您不将内容复制到文件，请按 `刷新笔记列表`按钮将清除它们。
    - `刷新笔记列表`按钮是刷新笔记路径中实际存在的文件。 `打开笔记的目录` 就是字面的意思。
    - 每个文件的左边，有一个 `打开` 的按钮，鼠标移上去才显示。
    - 所有的可操作控件，都有 Tips 文字提示。
- 我不确定 *重命名/删除* 等文件操作，是否应该由我的扩展来完成。
- 我的第三个 JS 程序。 在不断猜测中工作。


![screenshot](screenshot.png)

```
⭕ tree ~/.local/share/gnome-shell/extensions/clip-note@eexpss.gmail.com
├── clip-note-symbolic.svg
├── extension.js
├── metadata.json
└── stylesheet.css
```
