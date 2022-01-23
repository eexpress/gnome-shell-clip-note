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
        //~ ---------------------------------------------
        //~ Creat New Directory and New Files
        const savepath = GLib.get_home_dir()+"/.local/share/clip-note";
        //~ UserDirectory.DIRECTORY_DOWNLOAD
        const init_file_array = ["1.web.javascript", "2.live.skill", "3.tech.clip", "4.other"];
        if(!GLib.file_test(savepath,GLib.FileTest.IS_DIR)){
			GLib.mkdir_with_parents(savepath, 0o700);
			init_file_array.forEach((i)=>{
				GLib.file_set_contents(savepath+"/"+i,'auto create file.\n');
			});
		}
        //~ ---------------------------------------------
        //~ Creat Icon List, no function now.
        //~ CopyTo / Add / Open / Delete / Rename / Refresh list
        const mact = new PopupMenu.PopupBaseMenuItem({reactive: false});
		const hbox = new St.BoxLayout();
		const butt = [];
		//~ ["edit-copy-symbolic", "document-new-symbolic", "document-open-symbolic","tools-check-spelling-symbolic", "edit-delete-symbolic", "view-refresh-symbolic"].forEach((str, i)=>{
		["edit-copy-symbolic", "folder-open-symbolic", "view-refresh-symbolic"].forEach((str, i)=>{
			const icon = new St.Icon({ icon_name: str, icon_size: 32, style_class: "cn-icon" });
			butt[i] = new St.Button({ can_focus: true, child: icon, toggle_mode: true });
			butt[i].name = str;
			//~ checked 状态由 css `:checked` 控制。瞎猜出来的。
			butt[i].connect('clicked', (self) => {
				butt.forEach((self)=>{ self.checked = false; });
				self.checked = true;
				log(logprefix+self.name);
				if(self.name == "view-refresh-symbolic"){
					this.menu._getMenuItems().forEach((j)=>{	//_getMenuItems()看源码找出来的。
						if(j.filename) j.destroy();	//PopupMenuItem
					});
					refresh_menu(this, ls(savepath));
				}
				if(self.name == "folder-open-symbolic"){
					let [, stdout, , status] = GLib.spawn_command_line_sync('xdg-open '+savepath);
				}
				self.checked = false;
				butt[0].set_checked(true);
			});
			hbox.add_child(butt[i]);
		});
		mact.actor.add_child(hbox);
		butt[0].set_checked(true);
		this.menu.addMenuItem(mact);
        //~ ---------------------------------------------
        //~ ---------------------------------------------
        this._clipboard = St.Clipboard.get_default();
        //~ Read files from savepath, Creat PopupMenuItem.
		refresh_menu(this, ls(savepath));
        //~ ---------------------------------------------
		function refresh_menu(owner, list){
			list.forEach((fname)=>{
				const item = new PopupMenu.PopupMenuItem(fname, {style_class:'ct-text', can_focus:true});
				item.label.clutter_text.set_markup(split2pango(fname));
				item.filename = fname;	//additional properties
				item.connect('activate', (actor) => {
					log(logprefix+actor.filename+"click.");
					owner._clipboard.get_text(St.ClipboardType.PRIMARY, (clipboard, text) => {
						if(text){
							const f = savepath+"/"+actor.filename;
							const ByteArray = imports.byteArray;
							const r = ByteArray.toString(GLib.file_get_contents(f)[1]);
							const c = new Date();
							const t = r+"\n------  "+c.getFullYear()+"-"+c.getMonth()+1+"-"+c.getDate()+" "+c.getHours()+":"+c.getMinutes()+":"+c.getSeconds()+"  ------\n"+text+"\n";
							GLib.file_set_contents(f,t);
						}
					});
				});
				owner.menu.addMenuItem(item);
			});
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
			seg.forEach((s, i)=>{
				out += '  <span background="'+color[(s.length-1)%color.length]+'"><b> '+s+' </b></span>';
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
