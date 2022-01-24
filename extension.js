/* extension.js
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */
//~ imports.gi.versions.Gtk = '4.0';
const GETTEXT_DOMAIN = 'clip-note';
const { GObject, GLib, Gio, St } = imports.gi;

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const logprefix = "===clip-note===>";

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Clip Note'));

        this.add_child(new St.Icon({ gicon: Gio.icon_new_for_string(Me.path+"/clip-note-symbolic.svg") }));
        //~ =============================================
        //~ Creat New Directory and New Files
        //~ ---------------------------------------------
        const savepath = GLib.get_home_dir()+"/.local/share/clip-note";
        const init_file_array = ["1.web.javascript", "2.live.skill", "3.tech.clip", "4.other"];
        if(!GLib.file_test(savepath,GLib.FileTest.IS_DIR)){
			GLib.mkdir_with_parents(savepath, 0o700);
			init_file_array.forEach((i)=>{
				GLib.file_set_contents(savepath+"/"+i,'auto create file.\n');
			});
		}
        //~ =============================================
        //~ Creat Icon list
        //~ ---------------------------------------------
		//~ "document-open-symbolic","tools-check-spelling-symbolic", "edit-delete-symbolic"
        const gname = ["copy","open","new","refresh"];
        const gicon = ["edit-copy-symbolic", "folder-open-symbolic", "document-new-symbolic", "view-refresh-symbolic"];
        const gtoggle = [true, false, true, false];
        const gtip = [_("Copy Clip to file below"), _("Open Notes directory"), _("Add a new file"), _("Refresh file list")];
        //~ ---------------------------------------------
        const mact = new PopupMenu.PopupBaseMenuItem({reactive: false});
		const hbox = new St.BoxLayout();
		const butt = [];
		gname.forEach((str, i)=>{
			const icon = new St.Icon({ icon_name: gicon[i], icon_size: 32, style_class: "cn-icon", track_hover: true });
			butt[i] = new St.Button({ child: icon, toggle_mode: gtoggle[i] });
			butt[i].name = str;	//additional properties
			//~ checked 状态由 css `:checked` 控制。瞎猜出来的。
			butt[i].connect('style-changed', (self) => {
				if(self.hover && ! input.get_reactive() ){
					input.text = gtip[i];
				};
			});
			butt[i].connect('clicked', (self) => {
				switch(self.name){
					case "copy":
					case "new":
						virtual_click(self);
						break;
					case "open":
						let [, stdout, , status] = GLib.spawn_command_line_sync('xdg-open '+savepath);
						break;
					case "refresh":
						this.menu._getMenuItems().forEach((j)=>{	//_getMenuItems()看源码找出来的。删除全部文件的 PopupMenuItem
							if(j.filename) j.destroy();
						});
						refresh_menu(this, ls(savepath));
						break;
				}
			});
			hbox.add_child(butt[i]);
		});
		mact.actor.add_child(hbox);
		butt[0].set_checked(true);
		this.menu.addMenuItem(mact);
        //~ ---------------------------------------------
        function virtual_click(self){
			const isnew = (self === butt[2]) ? true : false;
			input.set_reactive(isnew);
			butt.forEach((self)=>{ self.checked = false; });
			self.checked = true;
			input.style_class = isnew ? "cn-input-active" : "cn-text";
			if(isnew){
				input.text = "";
				input.hint_text = _("Input filename use dots split tags.");
			}
		};
			//~ input.actor.grab_key_focus();
//Usage of object.actor is deprecated for St_Entry ！！
//~ https://github.com/phocean/TopIcons-plus/issues/137
        //~ ---------------------------------------------
		const minput = new PopupMenu.PopupBaseMenuItem({reactive: false});
		const input = new St.Entry({ name: 'input', style_class: 'cn-text', x_expand: true, can_focus: true, reactive: false});
//~ clutter_input_focus_set_cursor_location: assertion 'clutter_input_focus_is_focused (focus)' failed	第一次显示tip时出现。
		input.clutter_text.connect('activate', (actor) => {
			if(butt[2].checked){
				add_menu(this, input.text);
				input.text = _("%s has been added virtually.").format(input.text);
			}
			virtual_click(butt[0]);
		});
		minput.add(input);
		this.menu.addMenuItem(minput);
		//~ ---------------------------------------------
        this._clipboard = St.Clipboard.get_default();
        //~ Read files from savepath, Creat PopupMenuItem.
		refresh_menu(this, ls(savepath));
        //~ ---------------------------------------------
		function refresh_menu(owner, list){
			list.forEach((fname)=>{ add_menu(owner,fname); });
		};
         //~ ---------------------------------------------
         function add_menu(owner,fname){
			const item = new PopupMenu.PopupMenuItem(fname, {style_class:'cn-text'});
			item.label.clutter_text.set_markup(split2pango(fname));
			item.filename = fname;	//additional properties
			item.connect('activate', (actor) => {
				owner._clipboard.get_text(St.ClipboardType.PRIMARY, (clipboard, text) => {
					if(text){
						const f = savepath+"/"+actor.filename;
						if(!GLib.file_test(f, GLib.FileTest.IS_REGULAR)){
							GLib.file_set_contents(f,'auto create file.\n');
						}
						const ByteArray = imports.byteArray;
						const r = ByteArray.toString(GLib.file_get_contents(f)[1]);
						const t = r+"\n------  "+GLib.DateTime.new_now_local().format("%F %T")+"  ------\n"+text+"\n";
						GLib.file_set_contents(f,t);
					}
				});
			});
			owner.menu.addMenuItem(item);
		 };
         //~ ---------------------------------------------
        function ls(path){	//return an array of files
			const dir = Gio.File.new_for_path(path);
			let fileEnum;
			let r = [];
			try{
				fileEnum = dir.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
			} catch (e) { fileEnum = null; }
			if (fileEnum != null) {
				let info;
				while (info = fileEnum.next_file(null)) r.push(info.get_name());
			}
			return r;
		};
        //~ ---------------------------------------------
        function split2pango(str){
			const color = ['#00193E','#6196E6','#42CC53','#E68061','#E6617A','#D361E6'];
			const seg = str.split('.');
			let out = '';
			seg.forEach((s)=>{
				if(s) out += '  <span background="'+color[(s.length-1)%color.length]+'"><b> '+s+' </b></span>';
			});
			return out;
		};
        //~ ---------------------------------------------
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
