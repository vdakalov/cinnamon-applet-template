Applet template
===
Used to develop applet for cinnamon

## How to use

First of all rename the applet in `package.json` file, but **don't type** UUID there (with "@").
Also you can specify applet version, description and author name.

```json
{
  "name": "cinnamon-applet-template",
  "version": "1.0.0",
  "description": "Applet for template",
  "author": "The Developer <thedeveloper@mail.com>"
}
```

These data will be used to generate `metadata.json` file when you build your applet.

_If you want to control `metadata.json` file just create it in project root (next to `package.json`)
and define some fields.  All undefined fields will be defined automatically (uuid, version,
last-edited, name, description, author)._

UUID will be generated as `{package_json_name}@{pc_hostname}.local` for example
`applet-template@my-home-pc.local`

Then place your icons and other assets into `assets` folder. All it entries will be copies direct
into `build` directory (without `assets` in path). If you have at least one file in `assets/icon`
the local folder will be registered as extra icons folder this way

```javascript
imports.gi.Gtk.IconTheme.get_default().append_search_path(...)
```

_You can also create your own `applet.js` file in project root. Key "%f" will be replace with
absolute path to main js file with applet class._

If build task run with env var `NODE_ENV=production` the `debug` variable will be set to `false`
and it will set to `true` otherwise.

## Run configurations
If you are using WebStorm IDE there are number of built-in run configurations. It descriptions
below. It also possible to run with `npm run`, so correspond npm script name specified in
square brackets

### Build (webpack) [build:dev]
1. Clear `build` folder in project root
2. Compile `.ts` files into single `.js` file with name of the project and put it in `build`
directory (e.g. "cinnamon-applet-template")
3. Create new or copy existent `applet.js` file in `build` directory
4. Create new or copy existent `metadata.json` file in `build` directory

### Production build (webpack) [build]
Same as "Build (webpack)" but set `debug` variable to `false`

### Register applet [register]
Create soft link to project build directory in `~/.local/share/cinnamon/applets/`.

### Unregister applet [unregister]
Remove created soft link in `~/.local/share/cinnamon/applets/`.

### Reload applet code [reload]
It do unknown magick to reload applet code. Doesn't work for me. I'm just restart cinnamon and it
works fine.

### Build and reload
No production build and attempt to reload applet code
