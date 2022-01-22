/* extension.js
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */
imports.gi.versions.Gtk = '4.0';
const GETTEXT_DOMAIN = 'clip-note';
const { GObject, GLib, Gio, St, Gtk } = imports.gi;

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
        const logpath = GLib.get_home_dir()+"/.local/share/clip-note";
        log(logprefix+logpath);
        //~ UserDirectory.DIRECTORY_DOWNLOAD
        let f4array;
        if(!GLib.file_test(logpath,GLib.FileTest.IS_DIR)){
			GLib.mkdir_with_parents(logpath, 0o700);
			f4array = ["1.web", "2.live", "3.tech", "4.other"];
		}
        //~ log("------------\tClip Note\t---------------");
		//~ const r = GLib.file_get_contents(logpath+"/test");
		//~ log(r[1]);	GLib.free(r[1]);


        //~ ---------------------------------------------
        const mact = new PopupMenu.PopupBaseMenuItem({reactive: false});
		const hbox = new St.BoxLayout();
		const butt = [];
		//~ vbox.add_child(butt);
		["edit-copy-symbolic", "document-new-symbolic", "tools-check-spelling-symbolic", "edit-delete-symbolic"].forEach((str, i)=>{
			const icon = new St.Icon({ icon_name: str, icon_size: 32, style_class: "cn-icon" });
			butt[i] = new St.Button({ can_focus: true, child: icon, hover: true});
			//~ butt.actor.toggle-mode = true;
			//~ butt.actor.checked = true;
			//~ butt.set_checked(true);
			butt[i].set_toggle_mode(true);
			butt[i].connect('button-press-event', () => {
				log(`${i} clicked. lastclick = ${lastclick}.`);
				butt[lastclick].set_checked(false);
				lastclick = i;
				butt[i].set_checked(true);
				//~ butt[i].set_hover(true);
			});
			hbox.add_child(butt[i]);
		});
		mact.actor.add_child(hbox);
		let lastclick = 0;
		butt[0].set_checked(true);
		this.menu.addMenuItem(mact);
        //~ ---------------------------------------------
        //~ ---------------------------------------------
        //~ ---------------------------------------------
        //~ ---------------------------------------------
        //~ Gtk.DirectoryList
        //~ g_dir_open g_dir_read_name
		const dir = Gio.File.new_for_path(logpath);
		let fileEnum;
		try{
			fileEnum = dir.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
		} catch (e) { fileEnum = null; }
		if (fileEnum != null) {
			let info;
			while ((info = fileEnum.next_file(null))){
				const fname = info.get_name();
				log(logprefix+fname);
				const item = new PopupMenu.PopupMenuItem(fname, {style_class:'ct-text', can_focus:true});
				item.label.clutter_text.set_markup(split2pango(fname));
				item.filename = fname;	//additional properties
				item.connect('activate', (actor) => {
					log(`${actor.filename} click.`);
				});
				this.menu.addMenuItem(item);
			}
		}
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
