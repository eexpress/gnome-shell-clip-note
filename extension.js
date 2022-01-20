/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
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

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Clip Note'));

        this.add_child(new St.Icon({
            icon_name: 'face-smile-symbolic',
            style_class: 'system-status-icon',
        }));
        //~ ---------------------------------------------
        log("------------\tClip Note\t---------------");
        const logpath = Me.path+"/../../../clip-note";
        //~ UserDirectory.DIRECTORY_DOWNLOAD
        log(Me.path);
        let f4array;
        if(!GLib.file_test(logpath,GLib.FileTest.IS_DIR)){
			GLib.mkdir_with_parents(logpath, 0o700);
			f4array = ["1.web", "2.live", "3.tech", "4.other"];
		}
        log("------------\tClip Note\t---------------");
		const r = GLib.file_get_contents(logpath+"/test");
		log(r[1]);	GLib.free(r[1]);
        //~ ---------------------------------------------
        //~ Gtk.DirectoryList
        //~ g_dir_open g_dir_read_name
		const dir = Gio.File.new_for_path(logpath);
		let fileEnum
		try{
		fileEnum = dir.enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NONE, null);
		} catch (e) { fileEnum = null; }
		if (fileEnum != null) {
			let info;
			while ((info = fileEnum.next_file(null)))
			//~ processFile(fileEnum.get_child(info), info);
			log(`--->\t${info.get_name()}`);
		}


        //~ ---------------------------------------------
        let item = new PopupMenu.PopupMenuItem(_('Show Notification'));
        item.connect('activate', () => {
            Main.notify(_('Whatʼs up, folks?'));
        });
        this.menu.addMenuItem(item);
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
