
interface Metadata {
  uuid: string;
  version?: string;
  multiversion?: boolean;
  'cinnamon-version'?: string[];
  'last-edited'?: string;
  'max-instances'?: string | number;
  name?: string;
  description?: string;
  author?: string;
}

export default class AppletTemplate extends imports.ui.applet.IconApplet {

  private readonly debug: boolean;

  /**
   *
   * @param debug Is applet running in debug or production mode
   * @param metadata
   * @param orientation
   * @param panelHeight
   * @param instanceId
   */
  constructor(debug: boolean, metadata: Metadata, orientation: imports.gi.St.Side, panelHeight: number, instanceId: number) {
    super(orientation, panelHeight, instanceId);

    this.debug = debug;

    this.set_applet_icon_symbolic_name('default');
    this.set_applet_tooltip('Applet template');

    this.log('Hi there!');
  }

  private log(...args: unknown[]): void {
    global.log(this.constructor.name, ...args);
  }

  private logError(error: Error): void {
    global.logError(this.constructor.name, {
      message: error.message,
      stack: error.stack || 'No stack'
    });
  }

  private logDebug(...args: unknown[]): void {
    if (this.debug) {
      this.log(...args);
    }
  }

  public on_applet_clicked(event: unknown): boolean {
    this.log('Did you click my icon just now?');
    return false;
  }
}
