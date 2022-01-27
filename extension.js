/* extension.js
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */
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

		const mact = new PopupMenu.PopupBaseMenuItem({reactive: false});
		const hbox = new St.BoxLayout();
		const butt = [];
		gname.forEach((str, i)=>{
			const icon = new St.Icon({ icon_name: gicon[i], icon_size: 30, style_class: "cn-icon", track_hover: true });
			butt[i] = new St.Button({ child: icon, toggle_mode: gtoggle[i], style_class:'cn' });
			butt[i].name = str; //additional properties
			//~ checked 状态由 css `:checked` 控制。瞎猜出来的。
			butt[i].connect('style-changed', (self) => {
				hover_text(self, gtip[i]);
			});
			butt[i].connect('clicked', (self) => {
				switch(self.name){
					case "copy":
					case "new":
						virtual_click(self);
						break;
					case "open":
						GLib.spawn_command_line_async('xdg-open '+savepath);
						break;
					case "refresh":
						this.menu._getMenuItems().forEach((j)=>{    //_getMenuItems()看源码找出来的。删除全部文件的 PopupMenuItem
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

		function virtual_click(self){
			const isAddNewFile = (self === butt[2]) ? true : false;
			input.set_reactive(isAddNewFile);
			butt.forEach((self)=>{ self.checked = false; });
			self.checked = true;
			input.style_class = isAddNewFile ? "cn-input-active" : "cn-text";
			input.hint_text = "";
			if(isAddNewFile){
				input.text = "";
				input.hint_text = _("Input filename here.");
				input.clutter_text.grab_key_focus();
			}
		};

		const minput = new PopupMenu.PopupBaseMenuItem({reactive: false});
		const input = new St.Entry({ name: 'input', style_class: 'cn-text', x_expand: true, can_focus: true, reactive: false});
		input.height = input.height*2;
//~ clutter_input_focus_set_cursor_location: assertion 'clutter_input_focus_is_focused (focus)' failed  第一次显示tip时（写入时）出现。
		input.clutter_text.connect('activate', (actor) => {
			if(butt[2].checked){
				add_menu(this, input.text);
				input.text = _("%s has been added virtually.").format(input.text);
			}
			virtual_click(butt[0]);
		});
		minput.add(input);
		this.menu.addMenuItem(minput);
		//~ =============================================
		//~ Read files from savepath, Creat PopupMenuItem.
		//~ ---------------------------------------------
		this._clipboard = St.Clipboard.get_default();
		refresh_menu(this, ls(savepath));

		function refresh_menu(owner, list){
			list.forEach((fname)=>{ add_menu(owner,fname); });
		};

		function hover_text(self, str){
			if(!input.get_reactive()){
				if(self.hover) input.text = str;
				else input.text = "";
			}
		};

		function add_menu(owner,fname){
			const item = new PopupMenu.PopupBaseMenuItem({style_class:'cn-text'});
			const icon0 = new St.Icon({ icon_name: "document-open-symbolic", icon_size: 24 });
			const icon1 = new St.Icon({ icon_name: "view-app-grid-symbolic", icon_size: 24 });
			const butt = new St.Button({ child: icon1, track_hover: true, style_class:'cn'});
			const lbl = new St.Label();
			const hbox = new St.BoxLayout();
			hbox.add_child(butt);hbox.add_child(lbl);
			lbl.clutter_text.set_markup(split2pango(fname));
			item.add(hbox);
			item.set_track_hover = true;
			item.connect('style-changed', (self) => {
				hover_text(self,_("Copy to ")+butt.filename);
			});
			butt.connect('clicked', (self) => {
				GLib.spawn_command_line_async('xdg-open '+savepath+"/"+butt.filename);
			});
			butt.connect('style-changed', (self) => {
				hover_text(self,_("Open ")+butt.filename);
				if(self.hover) self.child = icon0; else self.child = icon1;
			});

			butt.filename = fname;  //additional properties
			item.filename = fname;  //additional properties
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

		function ls(path){  //return an array of files
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

		function split2pango(str){
			const color = ['#00193E','#6196E6','#42CC53','#E68061','#E6617A','#D361E6'];
			const seg = str.split('.');
			let out = '';
			seg.forEach((s)=>{
				if(s) out += '  <span background="'+color[(s.length-1)%color.length]+'"><b> '+s+' </b></span>';
			});
			return out;
		};
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
